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
 */
export type Checkpoint = { invoice: string; dashboard: string };

export const CHECKPOINTS: Record<MarkLine, Checkpoint | null> = {
  "001": null,
  "002": { invoice: "₹18,67,839.32", dashboard: "₹18,67,839.32" },
  "003": { invoice: "₹18,67,839.32", dashboard: "₹18,67,839.32" },
  "004": { invoice: "₹18,67,839.32", dashboard: "₹18,67,839.32" },
  "005": { invoice: "₹18,67,839.32", dashboard: "₹18,67,839.32" },
  "006": { invoice: "₹18,67,839.32", dashboard: "₹18,67,839.32" },
  "007": { invoice: "₹18,67,839.32", dashboard: "₹18,67,839.32" },
  "008": { invoice: "₹18,67,839.32", dashboard: "₹17,92,900.00" },
  "009": { invoice: "₹18,67,839.32", dashboard: "₹18,67,839.32" },
};

export function isDiverged(c: Checkpoint | null): boolean {
  return c !== null && c.invoice !== c.dashboard;
}
