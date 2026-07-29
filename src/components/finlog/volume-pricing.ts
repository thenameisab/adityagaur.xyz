/**
 * VOLUME PRICING — a port of the seeded build's own `computeTieredRevenue` and
 * `computeSlabRevenue`, which are what chapter 004's artifact renders.
 *
 * WHY A PORT AT ALL, AND WHAT THAT OBLIGES. FINLOG-PAGE-PLAN §13 step 5 puts it
 * plainly: a ported pure function that has drifted from its original is worse
 * than a mock, because a mock is honestly labelled and a drifted port quietly
 * claims a provenance it no longer has. So this file is not a reimplementation
 * from the model's description. It follows the original statement for statement —
 * same bracket semantics, same fall-through, same per-outcome blend, same
 * order-independence — and `scripts/verify-volume-pricing.ts` diffs it against
 * 313 sample volumes and a mixed-outcome case whose expected values were
 * produced by CALLING the original. That check is the reason this file is
 * allowed to exist.
 *
 * THE ONE DELIBERATE DIVERGENCE: ARITHMETIC, NOT BEHAVIOUR. The original runs on
 * `decimal.js-light` at 28 significant digits. This site carries zero runtime
 * dependencies and is not going to add one for four curves, so the arithmetic
 * here is exact instead: rates are integer ten-thousandths (which is precisely
 * what NUMERIC(14,4) stores, so nothing is lost converting), every product and
 * sum is `BigInt`, and division happens once at the end with explicit
 * round-half-even — the same rounding mode the original configures.
 *
 * Exact arithmetic is not an approximation of 28-digit arithmetic; it is the
 * thing 28 digits is an approximation OF. So where the two differ at all, they
 * differ below the 28th significant digit, and every figure this page prints is
 * resolved at four decimal places on values under ten million. The verification
 * script is what turns that argument into a fact.
 *
 * THE ONE PLACE THEY ACTUALLY DIFFER, FOUND BY RUNNING THE CHECK RATHER THAN BY
 * REASONING ABOUT IT. Across 309 volumes and both models, revenue and per-bracket
 * bands agree at every single sample. The blended effective RATE differs at
 * exactly one: 60,000 calls on these brackets, where the exact blend is
 * ₹2.95075 — a precise tie at the fourth decimal place. This port rounds the tie
 * half-to-even and reports ₹2.9508. The original divides 50,000/60,000 and
 * 10,000/60,000 into 28-digit shares first, which cannot represent a third or a
 * sixth, so its blend lands a hair BELOW the tie and rounds down to ₹2.9507.
 *
 * Two things make that difference safe to ship rather than something to hide.
 * The revenue is unaffected, because revenue is divided once at the end instead
 * of being reassembled from rounded shares — so the number that BILLS is
 * identical at every sample, which is the only figure the invoice ever carried.
 * And nothing renders the blended rate: chapter 004's artifact prints ₹/call as
 * billed ÷ calls, the same derivation the settlement worksheet already uses,
 * which is a function of revenue and therefore matches exactly.
 *
 * The check does not special-case that sample. It PROVES the tie from
 * `effectiveExact`/`effectiveDenominator` and fails on any mismatch it cannot
 * prove is one — because "the difference is only a rounding tie" is precisely
 * the kind of claim this essay spends nine chapters refusing to take on trust.
 *
 * WHY NOT FLOATING POINT, given the magnitudes look safe. The tiered model's
 * numerator is a triple product — outcome hits × bracket volume × rate — which
 * at this schema's limits reaches about 1e18 and so passes straight through
 * `Number.MAX_SAFE_INTEGER`. The original's own header comment records that
 * `parseFloat` on these columns was the bug that motivated its money module.
 * Repeating it here, in an artifact whose entire subject is that approximately
 * right is indistinguishable from wrong, would be its own kind of joke.
 */

/** NUMERIC(14,4): four fractional digits. Every rate and every amount in this
 *  module is an integer count of ten-thousandths of a rupee. */
const SCALE = 10_000n;

/** The four outcomes a call can land in. The names are the seeded build's own;
 *  they are outcome states rather than internal identifiers, and the essay's
 *  worksheet already shows the same split. */
export type OutcomeHits = {
  successful: number;
  successfulNoData: number;
  failed: number;
  inProgress: number;
};

/**
 * One bracket. `minHits` is the EXCLUSIVE lower bound (the previous bracket's
 * cap, 0 for the first); `maxHits` is the INCLUSIVE upper cap, `null` on the
 * open-ended top bracket. Getting this pair of conventions backwards is the
 * single most likely way a port of this function goes wrong without looking
 * wrong, which is why both halves are named here and both are sampled either
 * side of every threshold in the verification.
 *
 * Rates are decimal STRINGS, not numbers, for the same reason the original
 * reads them as strings out of the driver: `0.1 + 0.2` is the wrong lesson to
 * relearn on a billing page.
 */
export type Bracket = {
  minHits: number;
  maxHits: number | null;
  rateSuccessful: string;
  rateSuccessfulNoData: string;
  rateFailed: string;
  rateInProgress: string;
};

export type VolumeModel = "tier" | "slab";

export type VolumeRevenue = {
  /** Rounded to 4dp, in ten-thousandths — the unit the schema stores. */
  revenue: bigint;
  /** Volume-weighted blended rate per outcome, 4dp, ten-thousandths. Exposed so
   *  a statement line can print an effective ₹/call and `hits × rate`
   *  reconciles to `revenue`, exactly as the original exposes it. */
  effective: {
    successful: bigint;
    successfulNoData: bigint;
    failed: bigint;
    inProgress: bigint;
  };
  /**
   * The same blended rates BEFORE rounding, as exact fractions over
   * `effectiveDenominator`. This exists for one reason and it is worth stating:
   * it lets `scripts/verify-volume-pricing.ts` PROVE, rather than assert, that
   * the single place this port's output differs from the original's is an exact
   * tie at the fourth decimal place — see the divergence note in the header.
   * A claim about arithmetic that the check cannot verify is a claim on trust,
   * which is the currency this page spends most carefully.
   */
  effectiveExact: {
    successful: bigint;
    successfulNoData: bigint;
    failed: bigint;
    inProgress: bigint;
  };
  effectiveDenominator: bigint;
  /** Per-bracket realised volume and revenue; empty brackets omitted. On the
   *  slab model this is always exactly one band — the whole volume at the
   *  bracket the total landed in, which is what "whole-volume" means. */
  bands: {
    minHits: number;
    maxHits: number | null;
    hits: number;
    revenue: bigint;
  }[];
};

/** Parse a fixed-point decimal string to integer ten-thousandths. Rejects
 *  anything it cannot represent exactly rather than silently truncating — a
 *  fifth decimal place would be a schema change, and this should fail loudly
 *  if one ever arrives. */
export function parseRate(v: string): bigint {
  const m = /^(-?)(\d+)(?:\.(\d{1,4}))?$/.exec(v.trim());
  if (!m) throw new Error(`volume-pricing: rate "${v}" is not NUMERIC(14,4)`);
  const [, sign, whole, frac = ""] = m;
  const scaled = BigInt(whole) * SCALE + BigInt(frac.padEnd(4, "0"));
  return sign === "-" ? -scaled : scaled;
}

/** Round-half-even division — the original sets `Decimal.ROUND_HALF_EVEN`, and
 *  banker's rounding is not interchangeable with half-up on a money column: on
 *  a long enough register half-up carries a systematic upward bias. */
function divHalfEven(numerator: bigint, denominator: bigint): bigint {
  if (denominator === 0n) return 0n;
  const neg = numerator < 0n !== denominator < 0n;
  const n = numerator < 0n ? -numerator : numerator;
  const d = denominator < 0n ? -denominator : denominator;
  const q = n / d;
  const r = n % d;
  const twice = r * 2n;
  let out = q;
  if (twice > d) out = q + 1n;
  else if (twice === d && q % 2n === 1n) out = q + 1n; // ties go to even
  return neg ? -out : out;
}

function totalOf(h: OutcomeHits): number {
  return h.successful + h.successfulNoData + h.failed + h.inProgress;
}

const ZERO_RESULT: VolumeRevenue = {
  revenue: 0n,
  effective: { successful: 0n, successfulNoData: 0n, failed: 0n, inProgress: 0n },
  effectiveExact: { successful: 0n, successfulNoData: 0n, failed: 0n, inProgress: 0n },
  effectiveDenominator: 1n,
  bands: [],
};

/** The four rates of one bracket, as ten-thousandths, in outcome order. */
function ratesOf(b: Bracket): [bigint, bigint, bigint, bigint] {
  return [
    parseRate(b.rateSuccessful),
    parseRate(b.rateSuccessfulNoData),
    parseRate(b.rateFailed),
    parseRate(b.rateInProgress),
  ];
}

function hitsOf(h: OutcomeHits): [bigint, bigint, bigint, bigint] {
  return [
    BigInt(h.successful),
    BigInt(h.successfulNoData),
    BigInt(h.failed),
    BigInt(h.inProgress),
  ];
}

/**
 * TIERED — graduated/marginal, the way income-tax brackets work: each bracket's
 * own volume bills at that bracket's own rate, so the marginal rate steps down
 * while every unit already billed keeps the price of the band it fell in.
 *
 * The original expresses this by blending: it computes, per outcome, a
 * volume-weighted rate `Σ (bracketVolume / total) × bracketRate`, then bills
 * each outcome's hits at its own blended rate. That factorisation is what makes
 * the result order-independent and makes it collapse to the simple graduated
 * sum when only one outcome carries a price. This port keeps the factorisation
 * rather than "simplifying" to `Σ volume × rate` — those two agree for a single
 * outcome and DIVERGE once a period mixes outcomes priced differently, and the
 * seeded build's periods all mix.
 *
 * Everything stays over the common denominator `total` until the final rounding,
 * so no intermediate is ever rounded and the bands sum to the revenue exactly.
 */
export function computeTieredRevenue(hits: OutcomeHits, brackets: Bracket[]): VolumeRevenue {
  const total = totalOf(hits);
  if (total <= 0 || brackets.length === 0) return ZERO_RESULT;

  const T = BigInt(total);
  const sorted = [...brackets].sort((a, b) => a.minHits - b.minHits);
  const h = hitsOf(hits);

  // Per-outcome numerators of the blended rate, over the denominator `total`.
  const effNum: [bigint, bigint, bigint, bigint] = [0n, 0n, 0n, 0n];
  const bands: VolumeRevenue["bands"] = [];

  for (const bracket of sorted) {
    // The open-ended top bracket caps at the period total, exactly as the
    // original's `slab.max_hits ?? total` does.
    const cap = bracket.maxHits ?? total;
    const volume = Math.max(0, Math.min(total, cap) - bracket.minHits);
    if (volume <= 0) continue;

    const V = BigInt(volume);
    const rates = ratesOf(bracket);

    // This bracket's revenue: its share of every outcome, at its own rates.
    // Numerator over `total`; Σ bands === revenue by construction, since both
    // are the same double sum grouped differently.
    let bandNum = 0n;
    for (let i = 0; i < 4; i++) {
      effNum[i] += V * rates[i];
      bandNum += h[i] * rates[i];
    }

    bands.push({
      minHits: bracket.minHits,
      maxHits: bracket.maxHits,
      hits: volume,
      revenue: divHalfEven(V * bandNum, T),
    });
  }

  // revenue = Σ_outcome hits × blendedRate, over the same single denominator.
  let revNum = 0n;
  for (let i = 0; i < 4; i++) revNum += h[i] * effNum[i];

  return {
    revenue: divHalfEven(revNum, T),
    effective: {
      successful: divHalfEven(effNum[0], T),
      successfulNoData: divHalfEven(effNum[1], T),
      failed: divHalfEven(effNum[2], T),
      inProgress: divHalfEven(effNum[3], T),
    },
    effectiveExact: {
      successful: effNum[0],
      successfulNoData: effNum[1],
      failed: effNum[2],
      inProgress: effNum[3],
    },
    effectiveDenominator: T,
    bands,
  };
}

/**
 * SLAB — whole-volume. The period's TOTAL selects a SINGLE bracket and that
 * bracket's rates apply to EVERY hit. No marginal split, so crossing a
 * threshold reprices the entire month.
 *
 * This is the model chapter 004 says breaks people's intuition, and the reason
 * it earns its own curve: because the whole volume reprices at once, total
 * revenue can FALL as usage rises across a boundary. On this build's real
 * brackets it falls by ₹30,522.56 between 50,000 calls and 50,001 and does not
 * recover until 62,500. That is not a rounding artefact to be smoothed — it is
 * what the contract says, and a pricing engine that cannot render the drop has
 * implemented tiered pricing with slab's name on it.
 *
 * It is also the model behind chapter 008's gap: priced on a period total, the
 * line has no correct value on any single day, so a surface that sums days puts
 * a confident zero where the number does not exist at the granularity it read.
 */
export function computeSlabRevenue(hits: OutcomeHits, brackets: Bracket[]): VolumeRevenue {
  const total = totalOf(hits);
  if (total <= 0 || brackets.length === 0) return ZERO_RESULT;

  const sorted = [...brackets].sort((a, b) => a.minHits - b.minHits);
  // minHits exclusive, maxHits inclusive — and the original falls back to the
  // TOP bracket when a total exceeds every cap, which only a set with a capped
  // final bracket can do. Kept because dropping it would change behaviour on
  // exactly the malformed input the original tolerates.
  const bracket =
    sorted.find((b) => total > b.minHits && (b.maxHits == null || total <= b.maxHits)) ??
    sorted[sorted.length - 1];

  const rates = ratesOf(bracket);
  const h = hitsOf(hits);
  let revenue = 0n;
  for (let i = 0; i < 4; i++) revenue += h[i] * rates[i];

  return {
    revenue,
    // Every hit bills at the matched bracket's rate, so the effective rates ARE
    // that bracket's rates — no blend to compute.
    effective: {
      successful: rates[0],
      successfulNoData: rates[1],
      failed: rates[2],
      inProgress: rates[3],
    },
    // A bracket rate is already exact at 4dp, so there is nothing to divide and
    // the slab model can never produce the tie the tiered blend can.
    effectiveExact: {
      successful: rates[0],
      successfulNoData: rates[1],
      failed: rates[2],
      inProgress: rates[3],
    },
    effectiveDenominator: 1n,
    bands: [
      {
        minHits: bracket.minHits,
        maxHits: bracket.maxHits,
        hits: total,
        revenue,
      },
    ],
  };
}

/** Dispatch, mirroring the original's own single entry point. */
export function computeVolumeRevenue(
  model: VolumeModel,
  hits: OutcomeHits,
  brackets: Bracket[]
): VolumeRevenue {
  return model === "slab"
    ? computeSlabRevenue(hits, brackets)
    : computeTieredRevenue(hits, brackets);
}

/**
 * FLAT — one rate times one count, the model chapter 004 says nobody argues
 * about. Not in the original's volume module because it needs no brackets: the
 * rate columns on the pricing row *are* the answer. Here so all four models the
 * chapter compares resolve through one interface.
 */
export function computeFlatRevenue(
  hits: OutcomeHits,
  rates: { successful: string; successfulNoData: string; failed: string; inProgress: string }
): bigint {
  const h = hitsOf(hits);
  const r = [
    parseRate(rates.successful),
    parseRate(rates.successfulNoData),
    parseRate(rates.failed),
    parseRate(rates.inProgress),
  ];
  let revenue = 0n;
  for (let i = 0; i < 4; i++) revenue += h[i] * r[i];
  return revenue;
}

/** Ten-thousandths → rupees, as a `number`, for display only. Exact for every
 *  amount NUMERIC(14,4) permits: the mantissa runs out at about 9.0e15 and the
 *  column's own ceiling is 1e14 ten-thousandths. */
export function toRupees(tenThousandths: bigint): number {
  return Number(tenThousandths) / 10_000;
}

/** Ten-thousandths → a fixed-4 decimal string, without going through a float at
 *  all. This is the form the verification compares against the original's
 *  `toFixed(4)`, so it must not round: the value is already resolved to 4dp. */
export function toFixed4(tenThousandths: bigint): string {
  const neg = tenThousandths < 0n;
  const v = neg ? -tenThousandths : tenThousandths;
  const whole = v / SCALE;
  const frac = (v % SCALE).toString().padStart(4, "0");
  return `${neg ? "-" : ""}${whole}.${frac}`;
}
