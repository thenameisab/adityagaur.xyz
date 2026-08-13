/**
 * Product screenshot harness.
 *
 * Usage: node capture.mjs <job.json>
 *
 * A job is { baseURL, outDir, defaults, shots[] }. Each shot names a route, an
 * optional list of page actions to run before the frame is taken, and an
 * optional selector to clip to. Everything is captured at deviceScaleFactor 2
 * with animations frozen, so a run is reproducible and the same route always
 * yields the same pixels.
 */
import { chromium } from "playwright";
import { readFile, mkdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const run = promisify(execFile);

const job = JSON.parse(await readFile(process.argv[2], "utf8"));
const defaults = job.defaults ?? {};
await mkdir(job.outDir, { recursive: true });

const browser = await chromium.launch();

/** Freeze motion so a capture never lands mid-transition. */
const FREEZE = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    caret-color: transparent !important;
  }
  ::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
  /* Dev-server chrome is not part of the product. */
  nextjs-portal, #__next-build-watcher, vite-error-overlay,
  [data-nextjs-toast], .vite-plugin-checker-error-overlay { display: none !important; }
`;

for (const shot of job.shots) {
  const width = shot.width ?? defaults.width ?? 1440;
  const height = shot.height ?? defaults.height ?? 900;
  const scheme = shot.colorScheme ?? defaults.colorScheme ?? "light";

  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    colorScheme: scheme,
    reducedMotion: "reduce",
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
  });
  if (job.initScript) await context.addInitScript({ content: job.initScript });

  const page = await context.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") console.log(`  ! console: ${m.text().slice(0, 160)}`);
  });

  const url = new URL(shot.path ?? "/", job.baseURL).href;
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  await page.addStyleTag({ content: FREEZE });

  for (const action of shot.actions ?? []) {
    try {
      if (action.click) await page.click(action.click, { timeout: 8000 });
      if (action.press) await page.keyboard.press(action.press);
      if (action.type) await page.keyboard.type(action.type, { delay: 12 });
      if (action.fill) await page.fill(action.fill.selector, action.fill.value);
      if (action.select)
        await page.selectOption(action.select.selector, action.select.value);
      if (action.hover) await page.hover(action.hover, { timeout: 8000 });
      if (action.scroll)
        await page.evaluate(
          ([sel, top]) => {
            const el = sel ? document.querySelector(sel) : null;
            (el ?? window).scrollTo({ top, behavior: "instant" });
          },
          [action.scroll.selector ?? null, action.scroll.top ?? 0],
        );
      if (action.eval) await page.evaluate(action.eval);
      if (action.wait) await page.waitForTimeout(action.wait);
    } catch (err) {
      console.log(`  ! action failed on ${shot.name}: ${err.message.split("\n")[0]}`);
    }
  }

  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(shot.settle ?? 700);

  const png = path.join(job.outDir, `${shot.name}.png`);
  const target = shot.clip ? page.locator(shot.clip).first() : page;
  await target.screenshot({
    path: png,
    fullPage: shot.clip ? undefined : (shot.fullPage ?? false),
    animations: "disabled",
  });

  // The site serves JPEG for raster; at 2x the artifacts are invisible at 1x
  // and the byte cost is a third of PNG.
  if (job.jpeg !== false) {
    const jpg = png.replace(/\.png$/, ".jpg");
    // A plate frame is at most 1344 CSS px wide (44rem prose + 20rem bleed a
    // side), so anything past ~2700 device px is bytes the reader never sees.
    const cap = shot.maxWidth ?? job.maxWidth ?? 2560;
    await run("sips", [
      "-s", "format", "jpeg",
      "-s", "formatOptions", String(job.quality ?? 82),
      "--resampleWidth", String(Math.min(cap, width * 2)),
      png, "--out", jpg,
    ]);
    await run("rm", [png]);
    const { stdout } = await run("sips", ["-g", "pixelWidth", "-g", "pixelHeight", jpg]);
    const dims = stdout.match(/pixel(Width|Height): (\d+)/g)?.map((s) => s.split(": ")[1]);
    const { stdout: size } = await run("du", ["-h", jpg]);
    console.log(`  ✓ ${shot.name}.jpg  ${dims?.join("×")}  ${size.split("\t")[0]}`);
  } else {
    console.log(`  ✓ ${shot.name}.png`);
  }

  await context.close();
}

await browser.close();
console.log("done");
