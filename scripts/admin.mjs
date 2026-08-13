/**
 * THE CONTENT ADMIN — `npm run admin`, then open http://localhost:4600
 *
 * A local control panel for the Work and Writing registries. This site is a
 * static export with no server, so there is no production backend to log in
 * to; the "backend" is the repo itself. This tool is a UI over exactly the
 * edits you would make by hand:
 *
 *   set visibility → rewrites `visibility:` in the entry's index.mdx meta
 *   delete         → removes the content folder, its registry lines, and
 *                    its public asset folder
 *
 * Everything it does lands in the git working tree, uncommitted. Review with
 * `git diff`, commit, push — the deploy pipeline does the rest. Nothing here
 * touches the network or runs in production; it binds to 127.0.0.1 only.
 *
 * Zero dependencies, by the same policy as the site itself.
 */

import { createServer } from "node:http";
import { readFileSync, writeFileSync, rmSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const PORT = 4600;
const SECTIONS = ["work", "writing"];
const VISIBILITIES = ["live", "hidden", "draft"];

// ── Reading ─────────────────────────────────────────────────────────────────

function metaBlock(section, slug) {
  const path = join(ROOT, "src/content", section, slug, "index.mdx");
  const src = readFileSync(path, "utf8");
  const block = src.match(/export const meta = \{[\s\S]*?\n\};/);
  if (!block) throw new Error(`no meta block in ${section}/${slug}`);
  return { path, src, block: block[0] };
}

function metaStr(block, key) {
  const m = block.match(new RegExp(`\\b${key}:\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  return m ? m[1] : null;
}

function entry(section, slug) {
  const { block } = metaBlock(section, slug);
  // camelCase registry keys resolve to kebab-case folders via the meta slug.
  const realSlug = metaStr(block, "slug") ?? slug;
  const orderM = block.match(/\border:\s*([\d.]+)/);
  return {
    section,
    slug: realSlug,
    title: metaStr(block, "title") ?? realSlug,
    kicker: metaStr(block, "kicker") ?? "",
    status: metaStr(block, "status"),
    visibility:
      metaStr(block, "visibility") ??
      (/\bdraft:\s*true/.test(block) ? "draft" : "live"),
    order: orderM ? Number(orderM[1]) : 0,
  };
}

function listEntries() {
  const out = [];
  for (const section of SECTIONS) {
    const dir = join(ROOT, "src/content", section);
    const registry = readFileSync(join(dir, "registry.ts"), "utf8");
    for (const slug of readdirSync(dir)) {
      if (!existsSync(join(dir, slug, "index.mdx"))) continue;
      const e = entry(section, slug);
      // A folder whose registry line is gone is orphaned — surface it rather
      // than hide it, so a half-finished delete stays visible.
      e.registered = registry.includes(`./${slug}/index.mdx`);
      out.push(e);
    }
  }
  return out.sort((a, b) => a.section.localeCompare(b.section) || a.order - b.order);
}

// ── Writing ─────────────────────────────────────────────────────────────────

function setVisibility(section, slug, visibility) {
  if (!VISIBILITIES.includes(visibility)) throw new Error(`bad visibility "${visibility}"`);
  const { path, src, block } = metaBlock(section, slug);
  let next;
  if (/\bvisibility:\s*"[a-z]+",?/.test(block)) {
    next =
      visibility === "live"
        ? block.replace(/\n\s*visibility:\s*"[a-z]+",?(?=\n)/, "") // live is the default; don't state it
        : block.replace(/\bvisibility:\s*"[a-z]+"/, `visibility: "${visibility}"`);
  } else if (visibility === "live") {
    next = block.replace(/\n\s*draft:\s*true,?(?=\n)/, ""); // clearing a legacy draft flag
  } else {
    next = block
      .replace(/\n\s*draft:\s*true,?(?=\n)/, "")
      .replace(/\n\};$/, `\n  visibility: "${visibility}",\n};`);
  }
  writeFileSync(path, src.replace(block, next));
}

function deleteEntry(section, slug) {
  const regPath = join(ROOT, "src/content", section, "registry.ts");
  let reg = readFileSync(regPath, "utf8");
  // Drop the import line and the module-map line that reference this folder.
  const importLine = new RegExp(
    `\\n?import \\* as ([A-Za-z0-9]+) from "\\./${slug}/index\\.mdx";`,
  );
  const im = reg.match(importLine);
  reg = reg.replace(importLine, "");
  if (im) {
    reg = reg.replace(
      new RegExp(`\\n?\\s*(?:"${slug}"|${im[1]}): ${im[1]} as EntryModule,`),
      "",
    );
  }
  writeFileSync(regPath, reg);
  rmSync(join(ROOT, "src/content", section, slug), { recursive: true, force: true });
  rmSync(join(ROOT, "public", section, slug), { recursive: true, force: true });
  // One special case, documented rather than clever: the sync-console entry's
  // tour artifact lives at public/product-tour and is used by nothing else.
  if (slug === "sync-console-rework") {
    rmSync(join(ROOT, "public/product-tour"), { recursive: true, force: true });
  }
}

// ── The page ────────────────────────────────────────────────────────────────

const PAGE = /* html */ `<!doctype html>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Content admin — adityagaur.xyz</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; padding: 3rem clamp(1rem, 6vw, 5rem); background: #16181d; color: #e8e6e1;
         font: 15px/1.5 ui-sans-serif, system-ui, sans-serif; }
  h1 { font-size: 1.15rem; font-weight: 600; margin: 0 0 .3rem; }
  .note { color: #9a978f; max-width: 62ch; margin: 0 0 2.2rem; }
  .note code { color: #c9c6be; }
  h2 { font-size: .8rem; text-transform: uppercase; letter-spacing: .09em; color: #9a978f; margin: 2.4rem 0 .6rem; }
  table { border-collapse: collapse; width: 100%; max-width: 68rem; }
  td, th { text-align: left; padding: .55rem .9rem .55rem 0; border-bottom: 1px solid #2a2d34; vertical-align: baseline; }
  th { font-size: .72rem; text-transform: uppercase; letter-spacing: .08em; color: #6f6d66; font-weight: 500; }
  .slug { color: #9a978f; font: .85em ui-monospace, monospace; }
  .orphan { color: #e0a458; font-size: .8em; }
  select { background: #1f232a; color: inherit; border: 1px solid #3a3e47; border-radius: 4px; padding: .25rem .4rem; font: inherit; }
  select[data-v="live"]   { border-color: #3f6f4f; }
  select[data-v="hidden"] { border-color: #8a6d3b; }
  select[data-v="draft"]  { border-color: #555; color: #9a978f; }
  button.del { background: none; border: 1px solid #6b3434; color: #d98383; border-radius: 4px; padding: .25rem .7rem; font: inherit; cursor: pointer; }
  button.del:hover { background: #6b3434; color: #fff; }
  #log { position: fixed; inset: auto 1rem 1rem auto; background: #1f232a; border: 1px solid #3a3e47;
         border-radius: 6px; padding: .6rem 1rem; max-width: 30rem; display: none; }
</style>
<h1>Content admin</h1>
<p class="note">Local only. Every action edits the git working tree — nothing deploys
until you review with <code>git diff</code>, commit, and push.
<b>live</b> is listed everywhere · <b>hidden</b> keeps the URL but leaves the index,
sitemap, and search engines · <b>draft</b> builds nothing.</p>
<div id="app">loading…</div>
<div id="log"></div>
<script>
const log = (msg, err) => {
  const el = document.getElementById("log");
  el.textContent = msg; el.style.display = "block";
  el.style.borderColor = err ? "#6b3434" : "#3f6f4f";
  clearTimeout(el._t); el._t = setTimeout(() => el.style.display = "none", 4000);
};
async function api(path, body) {
  const res = await fetch(path, body ? { method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify(body) } : undefined);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}
async function render() {
  const entries = await api("/api/entries");
  const bySection = {};
  for (const e of entries) (bySection[e.section] ??= []).push(e);
  document.getElementById("app").innerHTML = Object.entries(bySection).map(([section, list]) => \`
    <h2>\${section}</h2>
    <table><tr><th>Entry</th><th>Status</th><th>Visibility</th><th></th></tr>
    \${list.map(e => \`<tr>
      <td>\${e.title}<br><span class="slug">/\${e.section}/\${e.slug}/</span>
        \${e.registered ? "" : '<br><span class="orphan">⚠ folder exists but not in registry</span>'}</td>
      <td>\${e.status ?? "—"}</td>
      <td><select data-v="\${e.visibility}" onchange="setVis('\${e.section}','\${e.slug}',this)">
        \${["live","hidden","draft"].map(v => \`<option \${v===e.visibility?"selected":""}>\${v}</option>\`).join("")}
      </select></td>
      <td><button class="del" onclick="del('\${e.section}','\${e.slug}','\${e.title.replace(/'/g,"\\\\'")}')">delete…</button></td>
    </tr>\`).join("")}
    </table>\`).join("");
}
async function setVis(section, slug, sel) {
  try {
    await api("/api/visibility", { section, slug, visibility: sel.value });
    log(\`\${slug} → \${sel.value}. Uncommitted — review with git diff.\`);
    render();
  } catch (e) { log(e.message, true); render(); }
}
async function del(section, slug, title) {
  const typed = prompt(\`Permanently delete "\${title}"?\\n\\nThis removes the content folder, its registry lines, and its public assets from the working tree. Recoverable only via git until committed.\\n\\nType the slug to confirm:\`);
  if (typed === null) return;
  if (typed !== slug) return log("Slug did not match — nothing deleted.", true);
  try {
    await api("/api/delete", { section, slug, confirm: typed });
    log(\`Deleted \${slug} from the working tree. git diff to review, git checkout -- . to undo.\`);
    render();
  } catch (e) { log(e.message, true); render(); }
}
render();
</script>`;

// ── The server ──────────────────────────────────────────────────────────────

const server = createServer(async (req, res) => {
  const send = (code, body, type = "application/json") => {
    res.writeHead(code, { "content-type": type });
    res.end(type === "application/json" ? JSON.stringify(body) : body);
  };
  try {
    if (req.method === "GET" && req.url === "/") return send(200, PAGE, "text/html; charset=utf-8");
    if (req.method === "GET" && req.url === "/api/entries") return send(200, listEntries());
    if (req.method === "POST") {
      const body = JSON.parse(await new Promise((ok) => {
        let d = ""; req.on("data", (c) => (d += c)); req.on("end", () => ok(d || "{}"));
      }));
      if (!SECTIONS.includes(body.section)) return send(400, { error: "bad section" });
      if (!/^[a-z0-9-]+$/.test(body.slug ?? "")) return send(400, { error: "bad slug" });
      if (req.url === "/api/visibility") {
        setVisibility(body.section, body.slug, body.visibility);
        return send(200, { ok: true });
      }
      if (req.url === "/api/delete") {
        if (body.confirm !== body.slug) return send(400, { error: "confirmation mismatch" });
        deleteEntry(body.section, body.slug);
        return send(200, { ok: true });
      }
    }
    send(404, { error: "not found" });
  } catch (e) {
    send(500, { error: e.message });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Content admin → http://localhost:${PORT}`);
  console.log("Edits land in the git working tree; commit and push to deploy.");
});
