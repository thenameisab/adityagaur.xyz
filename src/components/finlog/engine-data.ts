/**
 * THE ENGINE ARTIFACTS' DATA — chapters 003, 004 and 007, on the seeded build's
 * own rows.
 *
 * Same contract as `settlement.ts`, for the same reasons, and worth restating
 * because this file adds a new obligation to it. Every figure below came out of
 * the fictional seeded build by query, or out of that build's own pricing math by
 * calling it. Nothing is estimated, illustrative, or rounded to read better. An
 * essay arguing that approximately right is indistinguishable from wrong cannot
 * carry approximate numbers, and an *interactive* artifact makes that worse
 * rather than better: a reader who can drag a control will find the seam.
 *
 * SCRUBBED ON THE WAY OUT, and the map is deliberate rather than incidental. The
 * seeded build names its catalog after real market products. Those names are
 * replaced here — at extraction, not at the render site, so no component can leak
 * one by forgetting — with the plain-English descriptions the essay already uses:
 * the settlement worksheet has been calling the same interfaces "Tax statement
 * pull" and "Identity number verification" since the prose landed, and these are
 * the same ten plus the ones the leak classes surface. Client names are the
 * seed's own invented ones. There is no real customer and no real product name
 * anywhere in this file.
 *
 * WHAT IS *NOT* BAKED, which is the difference between this file and
 * `settlement.ts`. The volume-priced arithmetic is not precomputed here: chapter
 * 004's artifact runs `volume-pricing.ts` in the browser over whatever volume the
 * reader chooses, so the curve is computed rather than plotted from stored
 * points. What is baked is the *input* — the real bracket schedule — because that
 * is a row in a table, not a result.
 */

import type { Bracket } from "./volume-pricing";

/* ─────────────────────────────────────────────────────────────────────────────
   A2 · THE PRECEDENCE CHAIN — chapter 003
   ───────────────────────────────────────────────────────────────────────────── */

/**
 * The four rungs, in the order the resolution actually checks them. Ported from
 * the shape of the view's effective-dated lookup ladder: each rung is a lookup
 * against the date being billed, the FIRST one that resolves wins, and every
 * rung below it is never consulted.
 *
 * `never` marks a rung that this data never lands on, and it is the honest half
 * of the census. Rung four exists in the design the prose describes — fall
 * through everything and you land on the catalog's base price for the client's
 * plan — but the seeded build carries no catalog base prices at all: pricing is
 * per-account, so a pair either has a negotiated rate or it resolves to nothing.
 * Showing that rung with a count of zero is more useful than quietly dropping
 * it, because "the rung nothing landed on" and "the rung that isn't there" are
 * different facts about a system.
 */
export type Rung = {
  id: "sandbox" | "bundle" | "negotiated" | "catalog";
  /** The rung's own short name, for the census — the `id` is a key and reads
   *  like one, and a reader has no reason to meet it. */
  name: string;
  /** What the rung asks, phrased as the question the lookup answers. */
  question: string;
  /** What happens when it resolves. */
  outcome: string;
};

export const RUNGS: Rung[] = [
  {
    id: "sandbox",
    name: "a trial is open",
    question: "Is this account trialling this one interface, as of this date?",
    outcome: "Free. The trial is per-interface and dated, so everything else on the account keeps billing.",
  },
  {
    id: "bundle",
    name: "covered by a bundle",
    question: "Is this interface part of a bundle the account already pays for?",
    outcome: "Covered. The bundle's anchor carries the whole stitch; the member line bills nothing.",
  },
  {
    id: "negotiated",
    name: "a negotiated rate",
    question: "Does this account have a rate for this interface, effective on this date?",
    outcome: "That rate applies, in whichever form the row carries: flat, graduated or whole-volume.",
  },
  {
    id: "catalog",
    name: "the catalog's base price",
    question: "Does the catalog carry a base price for this account's plan?",
    outcome: "The base price applies.",
  },
];

/** One resolution the reader can walk. Every field is a real row. */
export type ChainCase = {
  id: string;
  /** The label on the control. */
  label: string;
  client: string;
  interfaceName: string;
  /** The date the question is asked *about* — the whole point of the ladder. */
  asOf: string;
  calls: number;
  /** Which rung resolves, or `null` for the fall-through that lights nothing. */
  resolvedBy: Rung["id"] | null;
  /** The dated fact that decided it. */
  decidedBy: string;
  /** The rate that applied, already formatted. `null` when none did. */
  rate: string | null;
  /** What to say in the rate slot when no rate applied. Per-case, because the
   *  REASON differs and a shared phrase gets one of them wrong: a trial
   *  suppresses billing while a rate remains in effect, whereas a bundle member
   *  is covered by a price charged somewhere else. The first version of this
   *  printed "covered, not priced" against the trial, which is the bundle's
   *  explanation attached to the wrong mechanism. */
  rateNote?: string;
  /** What the line billed. */
  billed: string;
  /** Why this case is worth walking — one sentence, the reader's takeaway. */
  note: string;
};

export const CHAIN_CASES: ChainCase[] = [
  {
    id: "negotiated",
    label: "A negotiated rate",
    client: "Northwind Finance Limited",
    interfaceName: "Identity number verification",
    asOf: "31 May 2026",
    calls: 5578,
    resolvedBy: "negotiated",
    decidedBy: "graduated schedule dated 1 January, first band 0–50,000",
    rate: "₹1.5644",
    billed: "₹7,782.26",
    note: "The essay's own volume-priced line. Two rungs are checked and miss before the third answers.",
  },
  {
    id: "sandbox",
    label: "A trial in progress",
    client: "Northwind Finance Limited",
    interfaceName: "Payslip extraction",
    asOf: "31 July 2026",
    calls: 7343,
    resolvedBy: "sandbox",
    decidedBy: "trial opened 1 June, never closed",
    rate: null,
    rateNote: "none applied; the trial suppresses billing",
    billed: "₹0.00",
    note: "The first rung answers, so the rate dated 1 July is never even looked up. It exists and has never applied.",
  },
  {
    id: "bundle",
    label: "Inside a bundle",
    client: "Orbit Neobank",
    interfaceName: "Device fingerprint",
    asOf: "31 May 2026",
    calls: 6640,
    resolvedBy: "bundle",
    decidedBy: "member of a three-interface stitch priced from 1 May",
    rate: null,
    rateNote: "none here; the anchor line carries the stitch",
    billed: "₹0.00",
    note: "Zero here is not a gap. The stitch's anchor line carries all three interfaces' calls at the agreed price.",
  },
  {
    id: "unresolved",
    label: "Nothing at all",
    client: "Northwind Finance Limited",
    interfaceName: "Risk score (legacy v1)",
    asOf: "31 July 2026",
    calls: 46,
    resolvedBy: null,
    decidedBy: "no trial, no bundle, no rate, and a catalog row retired while calls kept arriving",
    rate: null,
    billed: "₹0.00",
    note: "Billable, priced at nothing, invoiced by nobody. Four rungs check and four rungs miss, and the absence is the finding.",
  },
];

/**
 * Where all 115 (account, interface) pairs in the seeded build actually land — a
 * true partition, one rung each, evaluated in the ladder's own order.
 *
 * The two counts worth reading together: 14 pairs have no negotiated rate, and
 * only 13 of them fall through, because one of the fourteen is a bundle member
 * and the bundle answers first. A pair with no rate is not automatically a leak,
 * and this is the single row that proves the distinction is real rather than
 * pedantic.
 */
export const CHAIN_CENSUS: { rung: Rung["id"] | "unresolved"; pairs: number; calls: number }[] = [
  { rung: "sandbox", pairs: 1, calls: 11086 },
  { rung: "bundle", pairs: 3, calls: 40790 },
  { rung: "negotiated", pairs: 98, calls: 759850 },
  { rung: "catalog", pairs: 0, calls: 0 },
  { rung: "unresolved", pairs: 13, calls: 69513 },
];

export const CENSUS_TOTAL_PAIRS = 115;

/* ─────────────────────────────────────────────────────────────────────────────
   A3 · THE FOUR MODELS — chapter 004
   ───────────────────────────────────────────────────────────────────────────── */

/**
 * The real bracket schedule the two volume models are compared over — one
 * account's whole-volume schedule, three brackets, thresholds at 50,000 and
 * 200,000.
 *
 * BOTH MODELS READ THE SAME BRACKETS, which is what makes the comparison mean
 * anything. In the product they are two settings on one storage shape, dispatched
 * by a single column; pricing the same schedule both ways is not a contrivance
 * for the artifact, it is what `computeVolumeRevenue` does with its first
 * argument. Comparing two different accounts' schedules would have shown a
 * difference in *rates* while claiming to show a difference in *models*.
 */
export const A3_BRACKETS: Bracket[] = [
  {
    minHits: 0,
    maxHits: 50000,
    rateSuccessful: "3.0525",
    rateSuccessfulNoData: "0.9158",
    rateFailed: "0.0000",
    rateInProgress: "0.0000",
  },
  {
    minHits: 50000,
    maxHits: 200000,
    rateSuccessful: "2.4420",
    rateSuccessfulNoData: "0.7326",
    rateFailed: "0.0000",
    rateInProgress: "0.0000",
  },
  {
    minHits: 200000,
    maxHits: null,
    rateSuccessful: "1.8315",
    rateSuccessfulNoData: "0.5495",
    rateFailed: "0.0000",
    rateInProgress: "0.0000",
  },
];

/** A real flat rate on the same interface, from another account's row — so the
 *  flat curve is a rate somebody actually agreed to rather than a round number
 *  chosen to sit neatly beside the others. */
export const A3_FLAT = {
  successful: "3.4199",
  successfulNoData: "1.0260",
  failed: "0.0000",
  inProgress: "0.0000",
};

/** The interface all three volume curves price, under the essay's own naming. */
export const A3_INTERFACE = "One-time passcode check";

/** The volume the slider opens on — inside the first band, where the two volume
 *  models agree to the paisa. Starting them apart would give away the answer. */
export const A3_DEFAULT_VOLUME = 32000;
export const A3_MAX_VOLUME = 300000;

/**
 * THE BUNDLE, and why it is not a fourth curve on the same axis.
 *
 * A bundle is a *collapse*, not a rate: several interfaces billed to one account
 * as a single product at one agreed price, with the anchor line carrying the
 * stitched volume and every member line billing nothing. So its answer does not
 * vary along a per-interface volume axis the way the other three do — plotting it
 * there would mean either drawing a straight line at eight times the others'
 * scale, which flattens the comparison the chapter is actually about, or quietly
 * inventing an allotment this build does not model.
 *
 * It gets its own panel instead, showing the thing that IS the model: three real
 * interfaces, one real price, two lines at zero that are not leaks.
 */
export const BUNDLE = {
  name: "Onboarding suite",
  client: "Orbit Neobank",
  period: "May 2026",
  ratePerSuccessful: "26.4000",
  rateNoData: "7.9200",
  /** The anchor's own outcome split — what the single line actually bills on. */
  anchorSuccessful: 7561,
  anchorNoData: 348,
  billed: "202366.56",
  members: [
    { name: "Credit bureau pull", calls: 8575, anchor: true },
    { name: "Device fingerprint", calls: 6640, anchor: false },
    { name: "Address geocoding", calls: 2967, anchor: false },
  ],
  /** All three interfaces' calls, which is what the one price covers. */
  stitchedCalls: 18182,
};

/* ─────────────────────────────────────────────────────────────────────────────
   A5 · THE THREE LEAK CLASSES — chapter 007
   ───────────────────────────────────────────────────────────────────────────── */

/**
 * The three shapes, and the reason they are three states rather than one severity
 * flag: they differ in what you can *do*, not in how bad they are.
 *
 * `floor` is the load-bearing field. The first two classes are identified — a
 * known account, a known interface, a known volume — so a rate can be set and
 * applied, even late. The third is not identified at all: what survived is a
 * string and a count. That is what chapter 007 means by no floor, and it is why
 * the third class renders without a level rather than with a large one. A big
 * number is a problem you can size. This is a problem you cannot.
 */
export type LeakClass = {
  id: "rate-gap" | "sandbox" | "catalog";
  name: string;
  /** The one-sentence mechanism. */
  mechanism: string;
  /** Whether the class can be sized and acted on, or not. */
  floor: boolean;
  pairs: number;
  calls: number;
  /** What closing it looks like. For the floorless class, what it doesn't. */
  remedy: string;
  rows: { subject: string; detail: string; calls: number }[];
};

export const LEAK_CLASSES: LeakClass[] = [
  {
    id: "rate-gap",
    name: "Rate gap",
    mechanism:
      "Calls arriving on a pair with no rate in effect for the date. The volume is recorded and the pair is known, so the accrual is visible and can be priced, even retroactively and even if the fix is late.",
    floor: true,
    pairs: 14,
    calls: 76304,
    remedy: "Write the dated rate. The effective-dated lookup then prices the whole accrued window on the next derivation, with nothing applied retroactively that shouldn't be.",
    rows: [
      { subject: "Northwind Home Loans", detail: "Credit bureau pull", calls: 10185 },
      { subject: "Vertex Pay", detail: "Director identification", calls: 9878 },
      { subject: "Orbit Cards", detail: "Bank account verification", calls: 9050 },
      { subject: "Orbit Neobank", detail: "Address geocoding (covered by a bundle, so not a leak)", calls: 6791 },
      { subject: "Helios Capital", detail: "Payslip extraction", calls: 6003 },
      { subject: "Vertex Merchant Services", detail: "Tax statement pull", calls: 5633 },
      { subject: "Northwind Insurance Brokers", detail: "Credit bureau pull", calls: 5508 },
      { subject: "Orbit SME", detail: "Bank account verification", calls: 5469 },
    ],
  },
  {
    id: "sandbox",
    name: "Sandbox drift",
    mechanism:
      "A trial is two dated rows per pair: one opening it, one closing it at go-live. Billing begins exactly on the closing date and nothing in the trial window is ever charged back. The drift is when the second row is never written: the trial stays open, correctly billing nothing, indefinitely.",
    floor: true,
    pairs: 1,
    calls: 7343,
    remedy: "Write the closing row. Everything from that date bills; the window before it stays free, which is what was agreed.",
    rows: [
      {
        subject: "Northwind Finance Limited",
        detail: "Payslip extraction: trial opened 1 June, no closing row, and a rate dated 1 July that has never applied",
        calls: 7343,
      },
    ],
  },
  {
    id: "catalog",
    name: "Catalog drift",
    mechanism:
      "Calls tagged with a code the catalog cannot resolve: retired, renamed upstream without notice, or never coded at all. A rate gap at least tells you what it is missing a price for. This does not resolve to an interface, so there is nothing to price and nothing to bill.",
    floor: false,
    pairs: 3,
    calls: 91,
    remedy: "Reconcile the catalog first: merge duplicates onto a survivor, deactivate retired codes that still carry live data rather than deleting them, and record the aliases so the next call resolves on the first attempt. Only then is there something to price.",
    rows: [
      { subject: "Unresolved code", detail: "Sanctions screening (beta): arrived tagged with a name the catalog has never carried", calls: 29 },
      { subject: "Unresolved code", detail: "Partner webhook (uncoded): no code sent at all, so nothing to resolve against", calls: 16 },
      { subject: "Retired code", detail: "Risk score (legacy v1): deactivated, still receiving calls", calls: 46 },
    ],
  },
];

/**
 * The scale the three classes sit against, so a reader can see they are small
 * proportions and still unacceptable — 007's argument is about shape, not size.
 *
 * The two call totals are different on purpose and the difference is the third
 * class. 881,239 calls landed on one of the 115 identified pairs. Another 45
 * landed on nothing identifiable, which is why they can be counted and cannot be
 * placed. A single "total calls" figure would have absorbed exactly the rows the
 * chapter is about.
 */
export const LEAK_CONTEXT = {
  identifiedCalls: 881239,
  unidentifiedCalls: 45,
  totalCalls: 881284,
  totalPairs: CENSUS_TOTAL_PAIRS,
  /** Interfaces in the catalog, and how many are still active. */
  catalogRows: 33,
  catalogActive: 30,
};
