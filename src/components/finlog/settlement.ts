/**
 * ONE CLIENT'S MONTH, AS THE ENGINE ACTUALLY COMPUTED IT.
 *
 * Every figure below was extracted from the fictional seeded build by calling
 * that build's OWN pricing math — `computeVolumeRevenue` from its
 * `pricing/slabs` module — over its own seeded usage, with the invoice
 * derivation's grouping reproduced query-for-query. Nothing here is estimated,
 * rounded for effect, or reverse-engineered from a total. The reason that
 * matters on this page in particular: an essay whose thesis is that
 * approximately right is indistinguishable from wrong cannot itself carry
 * approximate numbers.
 *
 * WHY THE FIGURES ARE BAKED RATHER THAN COMPUTED AT RUNTIME. The engine reads
 * from Postgres — an effective-dated rate lookup per usage row, a period-level
 * volume recompute on top. The site is a static export with zero runtime
 * dependencies, so the arithmetic runs at extraction time and its results land
 * here as literals. What is preserved is the thing that matters: these are the
 * engine's outputs, not a mock's. What is lost is a guarantee they stay in sync
 * if the seed is regenerated, which is why the provenance is written down.
 *
 * SCRUBBED ON THE WAY OUT, and the scrub is part of the contract. The seeded
 * build's own internal identifiers — product codes, table and column names,
 * client ids — are stripped here rather than at the render site, so no artifact
 * can leak one by forgetting to. What survives is what a reader of an invoice
 * would see: a line's name, its volume, its rate, its amount. The client and
 * catalog names are the seed's own invented ones; there is no real customer
 * anywhere in this file.
 *
 * WHY THIS CLIENT. It is the one seeded account that exercises all four devices
 * the static artifacts need: a volume-priced line (which is what diverges in
 * 008), a rate that changes on a later date, and a trial window that opens on a
 * pair that was billing before it (which is what 002 and 005 are about). One
 * client's month therefore carries the whole essay, which is what the
 * reconciliation rail has been claiming since 002.
 */

/** A line on the settlement. `billed` is what the invoice charged; `displayed`
 *  is what a per-day surface summing the same period reports — equal on every
 *  line except the volume-priced one, which is the entire argument of 008. */
export type SettlementLine = {
  name: string;
  /** flat · tier · slab · bundle — the model that priced this line. */
  model: "flat" | "tier" | "slab" | "bundle";
  hits: number;
  /** Effective rupees per hit: `billed / hits`, so `hits × rate` reconciles. */
  rate: string;
  billed: string;
  displayed: string;
};

/** Indian digit grouping, which is what the product does and what an invoice
 *  from this market prints. `Intl` with the `en-IN` locale is the whole
 *  implementation — no dependency, and it lakh-groups correctly above 99,999. */
export function inr(amount: number, fractionDigits = 2): string {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

export function count(n: number): string {
  return n.toLocaleString("en-IN");
}

export const CLIENT = "Northwind Finance Limited";
export const PERIOD = "May 2026";
export const PERIOD_ENDS = "31 May 2026";

/** Ten sheets in, one settlement out. One sheet per (client, interface) pair is
 *  exactly what the manual month-end 001 describes produced. */
export const SHEETS = 10;

export const SETTLEMENT_LINES: SettlementLine[] = [
  { name: "Tax statement pull",        model: "flat", hits: 7214, rate: "5.5372", billed: "39945.36", displayed: "39945.36" },
  { name: "Payslip extraction",        model: "flat", hits: 3743, rate: "4.1490", billed: "15529.58", displayed: "15529.58" },
  { name: "Voter ID verification",     model: "flat", hits: 7807, rate: "1.8867", billed: "14729.81", displayed: "14729.81" },
  { name: "Trade licence check",       model: "flat", hits: 4599, rate: "3.0617", billed: "14080.76", displayed: "14080.76" },
  { name: "Face match",                model: "flat", hits: 3941, rate: "2.7005", billed: "10642.57", displayed: "10642.57" },
  { name: "Company registry lookup",   model: "flat", hits: 2227, rate: "2.7091", billed: "6033.07",  displayed: "6033.07" },
  { name: "Negative list check",       model: "flat", hits: 2865, rate: "1.9959", billed: "5718.35",  displayed: "5718.35" },
  { name: "Email risk score",          model: "flat", hits: 2374, rate: "1.9801", billed: "4700.66",  displayed: "4700.66" },
  { name: "Payment ID verification",   model: "flat", hits: 4842, rate: "0.9676", billed: "4685.06",  displayed: "4685.06" },
  // The one line that does not agree with itself. Volume pricing resolves on the
  // period's TOTAL, so it has no correct single-day value — and a surface that
  // sums days therefore reports it as nothing at all. It bills in full.
  { name: "Identity number verification", model: "tier", hits: 5578, rate: "1.3952", billed: "7782.26", displayed: "0.00" },
];

export const TOTALS = {
  hits: 45190,
  lines: 10,
  /** What the invoice charged, and still charges. */
  invoice: "123847.49",
  /** What a per-day revenue surface reports for the same period. */
  displayed: "116065.23",
  /** The divergence 008 is about. Equal to the volume-priced line, exactly. */
  gap: "7782.26",
  /** What re-deriving this closed period against TODAY's inputs would produce —
   *  the number the finalize snapshot exists to prevent anyone from ever
   *  sending. Lower because a trial window opened later on a pair that was
   *  billing during this period, and a naive replay applies it backwards. */
  rederivedToday: "108317.91",
  /** The line a naive replay would suppress. */
  rederivedDelta: "15529.58",
};

/** Org-wide, the same period — the scale the audit in 008 actually ran at. */
export const ORG = {
  clients: 14,
  sheets: 107,
  hits: 386629,
  invoice: "1301490.63",
  displayed: "1240815.87",
  gap: "60674.76",
};

/**
 * THE REPLAY — one pair, three periods, three different correct answers, none
 * of them retroactive. This is the effective-dated pattern with nothing
 * abstracted away: the same interface for the same client, priced from a rate
 * dated January, suppressed by a trial window dated June, and carrying a rate
 * dated July that it has still never been charged at.
 *
 * The point A4 renders from this: asking "what did this cost in May" is a
 * question about history, and it returns the January rate today, tomorrow, and
 * after any number of later changes. Nothing was updated in place, so nothing
 * about the past changed shape.
 */
export type ReplayRow = {
  period: string;
  hits: number;
  /** The rate in effect for this period, or null when the trial suppresses it. */
  rate: string | null;
  billed: string;
  /** Which dated fact decided this period's answer. */
  decidedBy: string;
};

export const REPLAY_PAIR = "Payslip extraction";

export const REPLAY: ReplayRow[] = [
  { period: "May 2026",  hits: 3743, rate: "4.6411", billed: "15529.58", decidedBy: "rate dated 1 January" },
  { period: "June 2026", hits: 7195, rate: null,     billed: "0.00",     decidedBy: "trial opens 1 June" },
  { period: "July 2026", hits: 148,  rate: null,     billed: "0.00",     decidedBy: "trial still open — the rate dated 1 July has never applied" },
];

/** The dated facts behind the replay, in the order they were written. */
export const DATED_FACTS = [
  { on: "1 January 2026", fact: "rate set", detail: "₹4.6411 per hit" },
  { on: "1 June 2026",    fact: "trial opens", detail: "billing suspended for this interface only" },
  { on: "1 July 2026",    fact: "rate revised", detail: "₹5.1052 per hit" },
];

/** How many dated rows the seeded build carries, by subject — the evidence that
 *  effective-dating is one pattern applied repeatedly rather than a special case
 *  built for rates. */
export const DATED_SUBJECTS = [
  { subject: "Negotiated rates", rows: 103, pairs: 101 },
  { subject: "Vendor costs", rows: 32, pairs: 32 },
  { subject: "Trial windows", rows: 1, pairs: 1 },
  { subject: "Bundle prices", rows: 1, pairs: 1 },
];
