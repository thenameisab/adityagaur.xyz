/**
 * THE AUDIT, AT ROW LEVEL.
 *
 * Nineteen revenue surfaces, each reconciled against the billing engine treated
 * as the one oracle every other number owes an explanation to. This is the
 * material chapter 008 is about, published as findings rather than as a claim
 * that findings exist — which is the whole difference between saying a system
 * was audited and showing the audit.
 *
 * WHAT IS DELIBERATELY NOT HERE. The source register identifies each finding by
 * the function that produced it, the file and line it lives on, the tables it
 * queries, and the named accounts it was reproduced against. None of that
 * survives into this file. A surface is named the way a reader looking at the
 * product would name it — "the per-day revenue chart", not the function behind
 * it — and every figure quoted is re-derived from the fictional seeded build,
 * never carried over from the reconciliation that ran against real data. Two
 * consequences worth stating plainly rather than hiding: most rows therefore
 * carry a described divergence instead of a pair of numbers, and the two rows
 * the seeded build reproduces exactly are the two that carry figures.
 *
 * THE COUNT. The source register lists twenty findings; two of them are the same
 * finding on the same surface (an account total disagreeing with its own members,
 * and the same total including a period that was never invoiced), so they are one
 * row here. Nineteen is therefore the honest number and it is the number the
 * essay states.
 *
 * WHY THE CLEARED ROWS SHIP TOO. A findings table without what was checked and
 * held is a list of complaints, not an audit. The cleared set is what an
 * adversarial pass tried to break and could not.
 */

/** P0 = a billed number is wrong. P1 = a displayed number is wrong and the
 *  invoice is right. P2 = cosmetic, latent, or confined to a narrow window.
 *  The headline of this whole table is that the P0 column is empty. */
export type Severity = "P1" | "P2";

export type ThemeId = "pooled" | "zeroed" | "unguarded" | "mistyped" | "accepted";

export type Theme = {
  id: ThemeId;
  name: string;
  /** What actually goes wrong, in one sentence, with no identifier in it. */
  mechanism: string;
};

/**
 * Four root causes, and one finding that belongs to none of them.
 *
 * The fifth entry is not a fifth bug. It is a finding the audit accepted rather
 * than fixed, and it is in the table for the same reason the cleared rows are:
 * an audit that reports only what folded neatly into its own conclusions is
 * reporting a story, not a result.
 */
export const THEMES: Theme[] = [
  {
    id: "pooled",
    name: "Whole-volume pricing pooled across a window",
    mechanism:
      "Whole-volume rates resolve on a period's total, and they fall as volume rises. Pool several periods into one window and the combined total lands in a cheaper band than any single period would have — so a multi-month figure comes out lower than the sum of the invoices inside it.",
  },
  {
    id: "zeroed",
    name: "A volume-priced line reads as zero",
    mechanism:
      "Volume pricing has no correct single-day value: the rate is only known once the period's total is known. Surfaces that sum days therefore read those lines as nothing at all, and never add the period figure back.",
  },
  {
    id: "unguarded",
    name: "No billing-period guard",
    mechanism:
      "Surfaces that aggregate on raw calendar dates rather than on billing periods will happily report a month that has no period open yet — revenue, loss and leaks that no invoice stands behind.",
  },
  {
    id: "mistyped",
    name: "An identifier arrives as text",
    mechanism:
      "A period identifier is a wide integer, which the database driver hands back as a string. Assembly code keyed its lookups on a number and retrieved them with the raw value, so every lookup silently missed and every row fell through to a zero.",
  },
  {
    id: "accepted",
    name: "Accepted as an estimate",
    mechanism:
      "One finding was checked, understood, and deliberately not fixed: the figure it feeds is presented as an estimate, and making it exact would cost a join that the estimate does not earn.",
  },
];

export type Finding = {
  /** The surface, as a reader of the product would name it. */
  surface: string;
  /** The specific element on it that diverged. */
  element: string;
  /** What it should have shown, and what it showed. */
  divergence: string;
  severity: Severity;
  theme: ThemeId;
  /** Figures, only where the fictional seeded build reproduces this finding
   *  exactly. Absent everywhere else, on purpose. */
  figures?: { expected: string; actual: string; gap: string };
};

export const FINDINGS: Finding[] = [
  {
    surface: "Invoice list",
    element: "The revenue column, on every draft row",
    divergence:
      "Each row should restate its own invoice's total. Every draft row on every account read zero instead — the entire column, blank, next to invoices that were correct.",
    severity: "P1",
    theme: "mistyped",
  },
  {
    surface: "Dashboard headline",
    element: "Revenue and margin over a multi-month window",
    divergence:
      "Should be the sum of each period's own settlement. Understated whenever the window spanned more than one period; a single month was exact to the paisa.",
    severity: "P1",
    theme: "pooled",
  },
  {
    surface: "Money at risk",
    element: "Booked loss where delivery cost exceeds the price charged",
    divergence:
      "Should count only dates an invoice covers. Included a month with no billing period open, and labelled the result actual rather than projected — the worst combination available: a soft number presented as a hard one.",
    severity: "P1",
    theme: "unguarded",
  },
  {
    surface: "Money at risk",
    element: "Unpriced usage — the rate-gap leak",
    divergence:
      "Same unguarded window. Over-reported both the hit count and the rupee figure by including usage from an un-invoiced month.",
    severity: "P1",
    theme: "unguarded",
  },
  {
    surface: "Money at risk",
    element: "Usage that resolves to nothing — the silent loss",
    divergence:
      "Same unguarded window, and the largest of the three classes by volume, so the same mistake cost the most here.",
    severity: "P1",
    theme: "unguarded",
  },
  {
    surface: "Per-day revenue chart",
    element: "One client's month, summed across its days",
    divergence:
      "Should reconcile to that client's invoice. Fell short by exactly the volume-priced line, which the chart reported as zero on every single day of the month.",
    severity: "P1",
    theme: "zeroed",
    figures: { expected: "₹1,23,847.49", actual: "₹1,16,065.23", gap: "₹7,782.26" },
  },
  {
    surface: "Per-day revenue chart",
    element: "The whole book, against the headline tile above it",
    divergence:
      "Chart and headline sat on one screen computing revenue two different ways — the headline added volume pricing back, the chart did not. They could not agree.",
    severity: "P1",
    theme: "zeroed",
    figures: { expected: "₹13,01,490.63", actual: "₹12,40,815.87", gap: "₹60,674.76" },
  },
  {
    surface: "Client list and top movers",
    element: "Revenue per client over a custom window",
    divergence:
      "Understated for volume-priced clients over multi-period windows. The default comparison happened to be two single months, so the ranking a reader saw first was correct and only a custom range exposed it.",
    severity: "P1",
    theme: "pooled",
  },
  {
    surface: "Client detail",
    element: "The headline total, against the breakdown printed under it",
    divergence:
      "The breakdown was right and the headline above it was wrong, on the same screen, for the same client, over the same window. Everything derived from the headline — average price per hit, share of book, the leak figure — inherited it.",
    severity: "P1",
    theme: "pooled",
  },
  {
    surface: "Interface list",
    element: "Revenue and average unit price",
    divergence:
      "Volume-priced interfaces contributed nothing, so their revenue was understated and the average unit price computed off it was meaningless.",
    severity: "P1",
    theme: "zeroed",
  },
  {
    surface: "Interface detail",
    element: "Top consumer and share of interface revenue",
    divergence:
      "Ranked by a revenue figure that reads zero for volume-priced usage, so the largest consumer of one interface by volume appeared near the bottom of its own list, and the share denominator omitted its revenue entirely.",
    severity: "P1",
    theme: "zeroed",
  },
  {
    surface: "Interface list",
    element: "Multi-month totals",
    divergence:
      "Wrong in both directions at once: flat interfaces over-reported by including an un-invoiced month, while volume-priced ones under-reported by contributing zero.",
    severity: "P1",
    theme: "unguarded",
  },
  {
    surface: "Account totals",
    element: "The list, the detail page, and the invoices underneath",
    divergence:
      "Three surfaces, three different definitions of one account's revenue — one included trial members, one excluded them, and the invoice had its own rule. Only the detail page reconciled. The same total also reported an un-invoiced month as revenue.",
    severity: "P1",
    theme: "unguarded",
  },
  {
    surface: "Projected month-end",
    element: "The projection's base figure",
    divergence:
      "No error of its own — it extrapolated the headline's under-count faithfully and was still labelled a month-end projection. Corrected the moment the headline was.",
    severity: "P2",
    theme: "pooled",
  },
  {
    surface: "Money at risk",
    element: "Volume repricing folded into the margin watch",
    divergence:
      "Consumes a pooled window figure, so it carries the pooling error — but inert on today's data, because no volume-priced pair yet carries a delivery cost high enough for the comparison to fire. A latent finding, recorded as latent.",
    severity: "P2",
    theme: "pooled",
  },
  {
    surface: "Money at risk",
    element: "Consistent exclusion of trial usage across all three classes",
    divergence:
      "Two of the three risk classes exclude trial usage; the third cannot, because it reads usage that resolves to no client at all, and unattributed rows have no trial state to check. Accepted: the figure is presented as an estimate.",
    severity: "P2",
    theme: "accepted",
  },
  {
    surface: "Interface detail",
    element: "Price variance across clients",
    divergence:
      "Reads the flat rate only, and volume-priced clients store no flat rate — so they were structurally invisible to the variance, not merely missing from it.",
    severity: "P2",
    theme: "zeroed",
  },
  {
    surface: "Interface detail",
    element: "The per-day activity series",
    divergence:
      "Rendered a revenue line at zero for every day of a volume-priced interface, implying no revenue where substantial revenue bills. Hits rendered correctly beside it, which made the zero more convincing, not less.",
    severity: "P2",
    theme: "zeroed",
  },
  {
    surface: "Invoice list",
    element: "The draft line count",
    divergence:
      "Counts interfaces rather than invoice lines, so a bundled account would show more lines than its invoice prints. Latent — masked entirely by the blank revenue column above it.",
    severity: "P2",
    theme: "mistyped",
  },
];

/**
 * What was checked and held. The adversarial pass tried to break each of these
 * and failed.
 */
export const CLEARED = [
  "A single month's dashboard headline — exact to the paisa against the invoice.",
  "The active-client count, including clients whose only usage is volume-priced or bundled.",
  "The trial-usage guard on the headline figure, consistent across both halves of the computation.",
  "The default movers comparison — two single months, so the pooling error cannot arise.",
  "The per-client interface breakdown and its volume-pricing tag: the correct reference the headline should have matched.",
  "Bundle collapse, and the money arithmetic end to end — exact to the paisa on every account tested.",
  "Dismissed-leak exclusion, and the unpriced-pair indicator on the client list.",
];

export const AUDIT_TOTALS = {
  surfaces: FINDINGS.length,
  causes: 4,
  p0s: 0,
  p1s: FINDINGS.filter((f) => f.severity === "P1").length,
  p2s: FINDINGS.filter((f) => f.severity === "P2").length,
  misbills: 0,
};
