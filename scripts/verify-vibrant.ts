/**
 * THE VIBRANT MODE CONTRAST CHECK.
 *
 * Vibrant Mode makes every route a two-ink colour plate (globals.css §3.1). The
 * risk that creates is specific and worth naming: the site's other themes have
 * ONE ground each, so a token pair either passes or fails once. A plate's ramp
 * is generated per pairing, from that pairing's own inks, against whichever of
 * three stocks the route loads. Seven route plates × a ramp × three stocks is
 * more combinations than anyone will check by eye, and every one of them sets
 * real type.
 *
 * So this script recomputes all of them from the same values the stylesheet
 * uses, and fails the build if any lands under the floor. The point is not that
 * the numbers are good today; it is that they cannot quietly stop being good.
 *
 * THE FLOOR IS 4.91, NOT 4.5. That is the site's own empirical minimum, set by
 * .theme-dark's --text-faint (src/lib/registers.ts documents it as the house
 * condition). WCAG AA is 4.5; holding the plates to the dark theme's real worst
 * case instead means Vibrant Mode is not permitted to be the mode where the
 * typography quietly got worse.
 *
 * WHAT IT CANNOT CATCH. The mixes here are recomputed by src/lib/contrast.ts's
 * mixSrgb, not read out of CSS — custom properties are not readable at build
 * time, the same constraint contrast.ts and plates.ts already document. So this
 * proves the SPECIFIED colours are safe. It does not prove globals.css spells
 * them the same way, which is what /styleguide#vibrant is for: it renders every
 * swatch from the live token beside the hex asserted here, so a drift shows up
 * as a swatch that disagrees with its own label.
 *
 * Run: npx tsx scripts/verify-vibrant.ts
 */

import { contrastRatio, mixSrgb } from "../src/lib/contrast";
import {
  INKS,
  KEY,
  ROUTE_PAIRINGS,
  STOCKS,
  type RouteDrumsKey,
  type StockName,
} from "../src/lib/plates";

/** The house floor, from .theme-dark's --text-faint. */
const FLOOR = 4.91;
/** WCAG AA for large text (24px+), which is what a display-only loud pass owes. */
const LARGE = 3;

const failures: string[] = [];
let checks = 0;

function check(label: string, fg: string, bg: string, min: number) {
  checks++;
  const r = contrastRatio(fg, bg);
  // Round to 2dp first, so a 4.9096 is not failed for displaying as "4.91".
  if (Number(r.toFixed(2)) < min) {
    failures.push(`${label} — ${r.toFixed(2)}:1, needs ${min}`);
  }
}

/* ── The ramp, per plate, on its own stock ────────────────────────────────
   The four text roles as .theme-plate generates them: primary is key ink,
   secondary is the overprint, and muted and faint are key mixed into the
   resolved stock at 76% and 68%. Those two percentages are the stylesheet's,
   and if they are edited there without being edited here the styleguide's
   swatches are what will disagree. */
for (const key of Object.keys(ROUTE_PAIRINGS) as RouteDrumsKey[]) {
  const p = ROUTE_PAIRINGS[key];
  const stock = STOCKS[p.stock].hex;
  const at = `${key} on ${p.stock}`;

  check(`${at}: --text-primary`, KEY, stock, FLOOR);
  check(`${at}: --text-secondary (overprint)`, p.overprint, stock, FLOOR);
  check(`${at}: --text-muted`, mixSrgb(KEY, stock, 0.76), stock, FLOOR);
  check(`${at}: --text-faint`, mixSrgb(KEY, stock, 0.68), stock, FLOOR);

  /* --border-strong is the only border role any theme on this site expects to
     clear 3:1, because it is the one that conveys state; subtle and default are
     hairlines by design. Under Vibrant it is the overprint rather than key ink
     (§3.1), so it is checked as the overprint — against bare stock and against
     both step-1 tints, since a strong rule bounds a card as often as it sits on
     the page ground. */
  check(`${at}: --border-strong on stock`, p.overprint, stock, LARGE);
  check(
    `${at}: --border-strong on --bg-raised`,
    p.overprint,
    mixSrgb(INKS[p.a].hex, stock, 0.12),
    LARGE,
  );
  check(
    `${at}: --border-strong on --bg-card`,
    p.overprint,
    mixSrgb(INKS[p.b].hex, stock, 0.12),
    LARGE,
  );

  /* The loud pass. Type on a loud fill is ALWAYS key ink — that is the only
     thing the measurement licenses. A pairing flagged largeOnly owes 3:1
     because its fill is display-size only; every other pairing owes the floor. */
  check(
    `${at}: key on --bg-loud (${p.loud})${p.largeOnly ? " [large only]" : ""}`,
    KEY,
    INKS[p.loud].hex,
    p.largeOnly ? LARGE : FLOOR,
  );

  /* The inked surfaces (§3.1). Vibrant re-points every surface role at the
     ladder or the stock, so these — not bare stock — are the grounds most of
     the site's type actually sits on. --bg is drum A step 1 and carries body
     copy, so it owes all four text roles; --bg-raised is drum B step 1 and owes
     the same; --bg-card is the stock itself and is covered by the bare-stock
     checks above; --bg-hover is step 2 and owes key only, because §3.1's hover
     rule collapses every role below primary to key to honour the ladder. */
  const ground = mixSrgb(INKS[p.a].hex, stock, 0.12);
  const raised = mixSrgb(INKS[p.b].hex, stock, 0.12);
  const hover = mixSrgb(INKS[p.b].hex, stock, 0.22);

  for (const [name, surface] of [
    ["--bg (ground)", ground],
    ["--bg-raised", raised],
  ] as const) {
    check(`${at}: primary on ${name}`, KEY, surface, FLOOR);
    check(`${at}: secondary on ${name}`, p.overprint, surface, FLOOR);
    check(`${at}: muted on ${name}`, mixSrgb(KEY, stock, 0.76), surface, FLOOR);
    check(`${at}: faint on ${name}`, mixSrgb(KEY, stock, 0.68), surface, FLOOR);
  }
  check(`${at}: key on --bg-hover`, KEY, hover, FLOOR);

  /* The tint ladder's own law, restated as a test rather than a comment:
     step 1 takes key, secondary or muted type; steps 2 and 3 take KEY ONLY. */
  for (const [drum, ink] of [
    ["a", INKS[p.a].hex],
    ["b", INKS[p.b].hex],
  ] as const) {
    const t1 = mixSrgb(ink, stock, 0.12);
    check(`${at}: key on tint-${drum}-1`, KEY, t1, FLOOR);
    check(`${at}: overprint on tint-${drum}-1`, p.overprint, t1, FLOOR);
    check(`${at}: muted on tint-${drum}-1`, mixSrgb(KEY, stock, 0.76), t1, FLOOR);

    for (const [step, pct] of [
      [2, 0.22],
      [3, 0.34],
    ] as const) {
      check(
        `${at}: key on tint-${drum}-${step}`,
        KEY,
        mixSrgb(ink, stock, pct),
        FLOOR,
      );
    }
  }
}

/* ── The re-resolved band ─────────────────────────────────────────────────
   .theme-vibrant .theme-sand grounds itself on tint-b-1 and collapses faint
   into muted's value. Checked as its own case because it is the one place the
   ramp is not sitting on bare stock. */
for (const key of Object.keys(ROUTE_PAIRINGS) as RouteDrumsKey[]) {
  const p = ROUTE_PAIRINGS[key];
  const stock = STOCKS[p.stock].hex;
  const band = mixSrgb(INKS[p.b].hex, stock, 0.12);
  const at = `${key} band`;

  check(`${at}: --text-primary`, KEY, band, FLOOR);
  check(`${at}: --text-secondary`, p.overprint, band, FLOOR);
  check(`${at}: --text-muted / --text-faint`, mixSrgb(KEY, stock, 0.76), band, FLOOR);
  /* --bg-card on the band is bare stock, so the ramp on a card is the plate's
     own ramp — already checked above. What is checked here is that the card is
     actually distinguishable from the band it sits on. */
  checks++;
  if (Number(contrastRatio(stock, band).toFixed(2)) < 1.03) {
    failures.push(`${at}: --bg-card is invisible against the band`);
  }
}

/* ── Every stock takes key ink ────────────────────────────────────────────
   Including newsprint, which Vibrant Mode is the first thing to load. */
for (const s of Object.keys(STOCKS) as StockName[]) {
  check(`key ink on ${STOCKS[s].label}`, KEY, STOCKS[s].hex, FLOOR);
}

if (failures.length > 0) {
  console.error(`✗ Vibrant Mode has ${failures.length} contrast failure(s)\n`);
  for (const f of failures) console.error(`  ${f}`);
  console.error(`\n${failures.length} of ${checks} checks failed.`);
  process.exit(1);
}

console.log(
  `✓ Vibrant Mode clears the site's own ${FLOOR}:1 floor — ${checks} checks over ` +
    `${Object.keys(ROUTE_PAIRINGS).length} route plates: four text roles, the strong border, ` +
    `the loud pass, both tint ladders, the re-resolved band, and all three stocks.`,
);
