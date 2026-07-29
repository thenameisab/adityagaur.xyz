/**
 * THE PORT CHECK — FINLOG-PAGE-PLAN §13 step 5's own review requirement.
 *
 * The plan's words: "a ported pure function that has drifted from its original
 * is worse than a mock, so this branch needs a check that computeSlab matches
 * the source in behaviour." This is that check, and it is the reason
 * `src/components/finlog/volume-pricing.ts` is allowed to claim it computes what
 * the product computes.
 *
 * HOW THE EXPECTED VALUES WERE MADE. Not by hand and not from the model's
 * description: `scripts/volume-pricing-golden.json` was produced by booting the
 * seeded build and CALLING ITS OWN `computeVolumeRevenue` — decimal.js-light at
 * 28 significant digits, ROUND_HALF_EVEN — over 309 volumes and one
 * mixed-outcome period. The fixture carries pricing math only; every interface
 * name, client name and product code was left behind at extraction, which is why
 * it can live in this repo at all.
 *
 * WHAT IT COMPARES, AND WHY EACH PART EARNS ITS PLACE.
 *   · revenue at 4dp, on both models, at every sampled volume.
 *   · the per-bracket bands — a port can total correctly while attributing the
 *     volume to the wrong brackets, and chapter 004's artifact draws the bands.
 *   · the blended effective rate, because that is what a statement line prints
 *     as ₹/call and what makes `hits × rate` reconcile.
 *   · a MIXED-OUTCOME period. The tiered model blends per outcome, so a port
 *     that only ever sees all-successful volume can be wrong in a way every
 *     single-outcome sample agrees with. This is the case that catches it.
 *   · the exact figure the essay already publishes (₹7,782.26), recomputed here
 *     from the same brackets and hits — so a drift would fail this check rather
 *     than silently contradict prose that is already merged.
 *
 * The sweep samples ±2 either side of both thresholds on purpose. The boundary is
 * where the two models part company and where `minHits` exclusive /`maxHits`
 * inclusive is the only thing keeping them right; a check that sampled only round
 * numbers would pass with the bounds swapped.
 *
 * Run: node --experimental-strip-types scripts/verify-volume-pricing.ts
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  computeVolumeRevenue,
  toFixed4,
  type Bracket,
  type OutcomeHits,
} from "../src/components/finlog/volume-pricing.ts";

type Band = { minHits: number; maxHits: number | null; hits: number; revenue: string };
type Golden = {
  brackets: Bracket[];
  sweep: {
    total: number;
    tierRevenue: string;
    tierEffective: string;
    tierBands: Band[];
    slabRevenue: string;
    slabEffective: string;
    slabBands: Band[];
  }[];
  mixed: {
    hits: OutcomeHits;
    tierRevenue: string;
    tierEffective: Record<keyof OutcomeHits, string>;
    tierBands: Band[];
    slabRevenue: string;
    slabBands: Band[];
  };
  publishedTierLine: {
    brackets: Bracket[];
    hits: OutcomeHits;
    revenue: string;
    bands: Band[];
  };
};

const here = path.dirname(fileURLToPath(import.meta.url));
const golden: Golden = JSON.parse(
  readFileSync(path.join(here, "volume-pricing-golden.json"), "utf8")
);

let checks = 0;
const failures: string[] = [];
const provenTies: string[] = [];

function eq(label: string, actual: string, expected: string) {
  checks++;
  if (actual !== expected) failures.push(`${label}: got ${actual}, expected ${expected}`);
}

/**
 * The blended-rate comparison, with the one legitimate difference handled by
 * PROOF instead of by exemption.
 *
 * The original assembles a blended rate out of 28-digit shares, which cannot
 * represent a third or a sixth; this port divides once, exactly. When the exact
 * blend lands on a precise tie at the fourth decimal place, the two disagree by
 * one ten-thousandth — the original's value sits a hair off the tie and rounds
 * away from it, while an exact tie rounds half-to-even.
 *
 * So a mismatch is accepted only when this function can demonstrate, from the
 * exact fraction the module exposes, that the value IS such a tie and that the
 * gap is exactly one ten-thousandth. Anything else is drift and fails. An
 * unconditional skip here would make the whole check decorative.
 */
function eqEffective(label: string, numerator: bigint, denominator: bigint, actual: string, expected: string) {
  checks++;
  if (actual === expected) return;

  const remainder = ((numerator % denominator) + denominator) % denominator;
  const isExactTie = remainder * 2n === denominator;
  const offByOneTenThousandth =
    Math.abs(Math.round(Number(actual) * 10_000) - Math.round(Number(expected) * 10_000)) === 1;

  if (isExactTie && offByOneTenThousandth) {
    provenTies.push(`${label}: exact blend is ${expected}5 — a tie; port rounds half-even to ${actual}`);
    return;
  }
  failures.push(`${label}: got ${actual}, expected ${expected}`);
}

function eqBands(label: string, actual: { minHits: number; maxHits: number | null; hits: number; revenue: bigint }[], expected: Band[]) {
  checks++;
  if (actual.length !== expected.length) {
    failures.push(`${label}: ${actual.length} bands, expected ${expected.length}`);
    return;
  }
  for (let i = 0; i < actual.length; i++) {
    const a = actual[i];
    const e = expected[i];
    if (a.minHits !== e.minHits || a.maxHits !== e.maxHits || a.hits !== e.hits) {
      failures.push(
        `${label} band ${i}: got [${a.minHits},${a.maxHits}] ${a.hits} hits, expected [${e.minHits},${e.maxHits}] ${e.hits}`
      );
    }
    eq(`${label} band ${i} revenue`, toFixed4(a.revenue), e.revenue);
  }
}

const single = (total: number): OutcomeHits => ({
  successful: total,
  successfulNoData: 0,
  failed: 0,
  inProgress: 0,
});

// ---- The sweep -------------------------------------------------------------
for (const row of golden.sweep) {
  const hits = single(row.total);

  const tier = computeVolumeRevenue("tier", hits, golden.brackets);
  eq(`tier revenue @${row.total}`, toFixed4(tier.revenue), row.tierRevenue);
  eqEffective(
    `tier effective @${row.total}`,
    tier.effectiveExact.successful,
    tier.effectiveDenominator,
    toFixed4(tier.effective.successful),
    row.tierEffective
  );
  eqBands(`tier @${row.total}`, tier.bands, row.tierBands);

  const slab = computeVolumeRevenue("slab", hits, golden.brackets);
  eq(`slab revenue @${row.total}`, toFixed4(slab.revenue), row.slabRevenue);
  eqEffective(
    `slab effective @${row.total}`,
    slab.effectiveExact.successful,
    slab.effectiveDenominator,
    toFixed4(slab.effective.successful),
    row.slabEffective
  );
  eqBands(`slab @${row.total}`, slab.bands, row.slabBands);
}

// ---- The mixed-outcome period ---------------------------------------------
{
  const m = golden.mixed;
  const tier = computeVolumeRevenue("tier", m.hits, golden.brackets);
  eq("mixed tier revenue", toFixed4(tier.revenue), m.tierRevenue);
  eqEffective("mixed tier effective successful", tier.effectiveExact.successful, tier.effectiveDenominator, toFixed4(tier.effective.successful), m.tierEffective.successful);
  eqEffective("mixed tier effective successfulNoData", tier.effectiveExact.successfulNoData, tier.effectiveDenominator, toFixed4(tier.effective.successfulNoData), m.tierEffective.successfulNoData);
  eqEffective("mixed tier effective failed", tier.effectiveExact.failed, tier.effectiveDenominator, toFixed4(tier.effective.failed), m.tierEffective.failed);
  eqEffective("mixed tier effective inProgress", tier.effectiveExact.inProgress, tier.effectiveDenominator, toFixed4(tier.effective.inProgress), m.tierEffective.inProgress);
  eqBands("mixed tier", tier.bands, m.tierBands);

  const slab = computeVolumeRevenue("slab", m.hits, golden.brackets);
  eq("mixed slab revenue", toFixed4(slab.revenue), m.slabRevenue);
  eqBands("mixed slab", slab.bands, m.slabBands);
}

// ---- The figure the essay already publishes -------------------------------
{
  const p = golden.publishedTierLine;
  const tier = computeVolumeRevenue("tier", p.hits, p.brackets);
  eq("published tier line revenue", toFixed4(tier.revenue), p.revenue);
  eqBands("published tier line", tier.bands, p.bands);

  // The worksheet prints an effective ₹/call as billed ÷ hits and states that
  // `hits × rate` reconciles. Assert the identity rather than trusting it: this
  // is the arithmetic the reader is invited to check by hand.
  const total = p.hits.successful + p.hits.successfulNoData + p.hits.failed + p.hits.inProgress;
  const rupees = Number(toFixed4(tier.revenue));
  const perCall = (rupees / total).toFixed(4);
  eq("published tier line ₹/call", perCall, "1.3952");
  checks++;
  if (rupees.toFixed(2) !== "7782.26") {
    failures.push(`published tier line rounds to ${rupees.toFixed(2)}, expected 7782.26`);
  }
}

// ---- Behaviour the fixture cannot cover: the degenerate inputs ------------
// The original returns a zero result (not NaN, not a throw) for an empty period
// and for a priced pair with no brackets. Both reachable, both asserted.
{
  checks++;
  const zeroVolume = computeVolumeRevenue("tier", single(0), golden.brackets);
  if (toFixed4(zeroVolume.revenue) !== "0.0000" || zeroVolume.bands.length !== 0) {
    failures.push("zero volume did not return the zero result");
  }
  checks++;
  const noBrackets = computeVolumeRevenue("slab", single(5_000), []);
  if (toFixed4(noBrackets.revenue) !== "0.0000" || noBrackets.bands.length !== 0) {
    failures.push("empty bracket set did not return the zero result");
  }
}

if (failures.length > 0) {
  console.error(`✗ volume-pricing port DIVERGES from the source build\n`);
  for (const f of failures.slice(0, 40)) console.error(`  ${f}`);
  if (failures.length > 40) console.error(`  … and ${failures.length - 40} more`);
  console.error(`\n${failures.length} of ${checks} checks failed.`);
  process.exit(1);
}

console.log(
  `✓ volume-pricing port matches the source build — ${checks} checks over ${golden.sweep.length} volumes, ` +
    `both models, bands, blended rates, a mixed-outcome period, and the published ₹7,782.26 line.`
);
if (provenTies.length > 0) {
  // Reported, never silent. These are the exact-versus-28-digit ties described in
  // volume-pricing.ts's header; each one was proven to be a tie from the module's
  // own exact fraction, and none of them touches a revenue figure.
  console.log(`\n  ${provenTies.length} blended-rate tie(s), each proven exact and off by one ten-thousandth:`);
  for (const t of provenTies) console.log(`    ${t}`);
}
