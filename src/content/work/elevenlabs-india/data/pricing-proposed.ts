/**
 * The capstone's proposed metered ladder for India.
 *
 * The mechanism: once a plan's included characters are spent, further usage
 * is metered in bands — the more you have consumed this month, the cheaper
 * the next thousand characters get. Micro-top-ups from ₹100 replace the
 * ₹2,500 paywall as the first paid action.
 *
 * The source table gives four cumulative-volume bands per plan with a
 * per-1,000-character rate for each. It does not spell out whether a band's
 * rate reprices ALL overage or only the characters inside the band; this
 * module (and the engine) reads it as MARGINAL bands — each band's
 * characters price at that band's rate, like income-tax slabs — which is
 * the only reading under which a user's bill never jumps discontinuously
 * as they cross a threshold. The page states this choice next to the
 * simulator rather than hiding it.
 *
 * Rates are integer milli-dollars per 1,000 characters, matching
 * pricing-today.ts. Band bounds are in units of 1,000 characters of
 * OVERAGE (beyond the plan allowance), cumulative within the month.
 */

import type { PlanId } from "./pricing-today";

export type MeteredBand = {
  /** Band's upper bound, in thousands of overage characters, cumulative. */
  upToK: number | null; // null = unbounded (rate continues)
  /** Rate for characters inside this band, milli-$ per 1,000 characters. */
  rateM: number;
};

export type MeteredLadder = {
  plan: PlanId;
  bands: MeteredBand[];
};

/**
 * Band bounds come from the source's cumulative character-count tiers.
 * For Free the tiers are 25k / 50k / 100k / 150k total characters; the plan
 * includes 20k, so overage bands end at 5, 30, 80, 130 (thousands).
 * Creator includes 200k with tiers at 200k/400k/750k/1M → overage bands at
 * 200, 550, 800 (thousands). Scale includes 4M with tiers 4M/9M/15M/22M →
 * 5,000 / 11,000 / 18,000. The last documented rate continues unbounded —
 * the source's Enterprise row ("$0.04 or custom") is the floor it reaches.
 */
export const METERED: MeteredLadder[] = [
  {
    plan: "free",
    bands: [
      { upToK: 5, rateM: 200 },
      { upToK: 30, rateM: 190 },
      { upToK: 80, rateM: 180 },
      { upToK: null, rateM: 170 },
    ],
  },
  {
    plan: "creator",
    bands: [
      { upToK: 200, rateM: 150 },
      { upToK: 550, rateM: 140 },
      { upToK: 800, rateM: 130 },
      { upToK: null, rateM: 120 },
    ],
  },
  {
    plan: "scale",
    bands: [
      { upToK: 5_000, rateM: 90 },
      { upToK: 11_000, rateM: 80 },
      { upToK: 18_000, rateM: 70 },
      { upToK: null, rateM: 60 },
    ],
  },
];

/** The Indian top-up denominations the proposal leads with. */
export const TOP_UPS_INR = [100, 200, 400, 500];

/** ₹100 buys 5,000 characters on the Free plan — the proposal's headline. */
export const RS100_FREE_CHARS = 5_000;
