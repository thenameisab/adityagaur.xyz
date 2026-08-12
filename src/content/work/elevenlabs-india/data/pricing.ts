/**
 * THE PRICING ENGINE — pure functions over the two ladders.
 *
 * Same contract as src/components/finlog/volume-pricing.ts, which set the
 * house rule: an artifact that prints money must compute it exactly, and a
 * script must be able to diff it against a golden file. All rates are
 * integer milli-dollars, all products are BigInt, and division happens once
 * at the end with round-half-even — so every figure the simulator prints is
 * resolved exactly at milli-dollar precision before display rounding.
 *
 * `scripts/verify-elevenlabs-pricing.ts` diffs both functions against
 * `scripts/elevenlabs-pricing-golden.json`, whose expected values were
 * produced by an independent implementation. `npm run verify` runs it on
 * every deploy.
 */

import { MODULES, PLANS, type PlanId } from "./pricing-today";
import { METERED } from "./pricing-proposed";

/** Round-half-even division of a non-negative BigInt by a positive one. */
function divRHE(num: bigint, den: bigint): bigint {
  const q = num / den;
  const r = (num % den) * 2n;
  if (r > den) return q + 1n;
  if (r < den) return q;
  // exactly half — round to even
  return q % 2n === 0n ? q : q + 1n;
}

const planIndex = (plan: PlanId) => PLANS.findIndex((p) => p.id === plan);

/**
 * Monthly TTS cost under TODAY's ladder, in milli-dollars.
 *
 * Plan price plus flat per-1,000-character overage. Returns null when the
 * volume exceeds the allowance on a plan that sells no overage (Free,
 * Starter) — null IS the finding: on those plans the product stops.
 */
export function costTodayM(plan: PlanId, chars: number): number | null {
  const i = planIndex(plan);
  const tts = MODULES[0];
  const includedChars = tts.included[i] * 1_000;
  const base = BigInt(PLANS[i].priceM);
  if (chars <= includedChars) return Number(base);
  const rate = tts.overageM[i];
  if (rate === null) return null;
  const overChars = BigInt(chars - includedChars);
  // overChars × rate per 1,000 chars → divide once, round-half-even.
  const overage = divRHE(overChars * BigInt(rate), 1_000n);
  return Number(base + overage);
}

/**
 * Monthly TTS cost under the PROPOSED metered ladder, in milli-dollars.
 *
 * Plan price plus marginal bands: characters inside each band price at that
 * band's rate, and the final band's rate continues unbounded. Each band's
 * cost is divided (round-half-even) independently, which matches how a
 * real meter bills band by band.
 */
export function costProposedM(plan: PlanId, chars: number): number | null {
  const ladder = METERED.find((l) => l.plan === plan);
  if (!ladder) return null;
  const i = planIndex(plan);
  const includedChars = MODULES[0].included[i] * 1_000;
  let total = BigInt(PLANS[i].priceM);
  let over = Math.max(0, chars - includedChars);
  let floorK = 0;
  for (const band of ladder.bands) {
    if (over <= 0) break;
    const capChars = band.upToK === null ? Infinity : (band.upToK - floorK) * 1_000;
    const inBand = Math.min(over, capChars);
    total += divRHE(BigInt(inBand) * BigInt(band.rateM), 1_000n);
    over -= inBand;
    if (band.upToK !== null) floorK = band.upToK;
  }
  return Number(total);
}

/** Format milli-dollars as dollars, at most two decimals, no trailing zeros. */
export function fmtUsd(m: number): string {
  const cents = Math.round(m / 10);
  const s = (cents / 100).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
  return `$${s}`;
}

/** Format milli-dollars as whole rupees at the source's own ₹86/$ rate. */
export function fmtInr(m: number, inrPerUsd: number): string {
  const rupees = Math.round((m * inrPerUsd) / 1_000);
  return `₹${rupees.toLocaleString("en-IN")}`;
}
