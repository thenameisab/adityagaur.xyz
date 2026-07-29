import type { MarkLine } from "./Defs";

/**
 * One client's month, carried the length of the essay.
 *
 * `invoice` and `dashboard` are identical from 002 through 007 — the reader stops
 * noticing the rail agrees with itself — and diverge at 008 by exactly the amount
 * that chapter accounts for, then close again once 009 finalizes the correction.
 * 001 has no figure: the manual month-end predates either number existing.
 *
 * Shared rather than owned by the rail, because the rail is not the only surface
 * that states them. Below the rail's own breakpoint it does not render at all, and
 * chapter 008's prose still says "Watch it now" — so the divergence needs a second
 * home that is part of the prose. See Reconciliation.
 *
 * RE-BASED ON THE SEEDED BUILD. These figures were previously carried over from
 * a reconciliation that ran against real data, which meant the page's own payoff
 * was the one number on it that a reader could not have reproduced — and the
 * divergence in particular described a mechanic (a multi-period window pooling
 * its volume bands) that the fictional build cannot exhibit at all: every
 * volume-priced pair in it runs a few thousand calls a month against a fifty
 * thousand first band, so pooled and per-period graduation agree exactly.
 *
 * What the seeded build DOES exhibit, precisely and reproducibly, is the other
 * cause the audit found: a volume-priced line has no correct single-day value, so
 * a surface that sums days reports it as zero and never adds the period figure
 * back. The gap below is that line, to the paisa. Both figures, and the artifacts
 * in 001, 002, 005 and 008 that state them, come from one account's month
 * computed by the engine's own pricing math — see settlement.ts for the
 * provenance.
 */
export type Checkpoint = { invoice: string; dashboard: string };

export const CHECKPOINTS: Record<MarkLine, Checkpoint | null> = {
  "001": null,
  "002": { invoice: "₹1,23,847.49", dashboard: "₹1,23,847.49" },
  "003": { invoice: "₹1,23,847.49", dashboard: "₹1,23,847.49" },
  "004": { invoice: "₹1,23,847.49", dashboard: "₹1,23,847.49" },
  "005": { invoice: "₹1,23,847.49", dashboard: "₹1,23,847.49" },
  "006": { invoice: "₹1,23,847.49", dashboard: "₹1,23,847.49" },
  "007": { invoice: "₹1,23,847.49", dashboard: "₹1,23,847.49" },
  "008": { invoice: "₹1,23,847.49", dashboard: "₹1,16,065.23" },
  "009": { invoice: "₹1,23,847.49", dashboard: "₹1,23,847.49" },
};

export function isDiverged(c: Checkpoint | null): boolean {
  return c !== null && c.invoice !== c.dashboard;
}
