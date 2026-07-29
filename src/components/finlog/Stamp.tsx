import styles from "./Stamp.module.css";

/**
 * The stamp. Four of them, and they are the one place riso's misregistration
 * idea survives into this page — repurposed honestly, because a print plate is
 * not supposed to land crooked and a rubber stamp is.
 *
 * Composed out of three things that already exist rather than redeclaring any of
 * them: `.type-stamp` (§6) sets the mono, uppercase and wide tracking;
 * `[data-stamp]` (§15) sets the box and the rotation; `[data-sig]` (§15) sets the
 * ink. This file adds only the distress and the impact.
 *
 * It stays HTML TEXT rather than becoming SVG text, per the §6 governing rule:
 * SVG is for genuine geometry, and anything that is a word keeps its selection
 * order and its screen-reader semantics. The distress reaches it through CSS
 * instead, which is why FinlogDefs has to be on the page — see Stamp.module.css.
 */
export const STAMPS = [
  { label: "DRAFT", sig: "estimated", means: "recomputed from live usage every time it is opened" },
  { label: "FINALIZED", sig: "settled", means: "frozen into statement_lines, never recomputed" },
  { label: "ZERO P0s", sig: "settled", means: "nineteen gaps, four causes, no surface mis-bills" },
  { label: "NOT BILLED", sig: "absent", means: "billable, priced at zero, invoiced by nobody" },
] as const;

export type StampSig = (typeof STAMPS)[number]["sig"];

export default function Stamp({
  label,
  sig,
  impact,
  className,
}: {
  label: string;
  sig: StampSig;
  /**
   * The FINALIZED impact. Trigger is a React `key` change on this element, the
   * same mechanism §13 and §14 use for the slipped pass and the swipe: the node
   * remounts and the animation runs once. No state, no timer, no cleanup.
   */
  impact?: boolean;
  className?: string;
}) {
  return (
    <span
      className={[styles.stamp, "type-stamp", className].filter(Boolean).join(" ")}
      data-stamp=""
      data-sig={sig}
      // Absent is never carried by colour alone. §15's [data-void] is the shape
      // carrier — a dashed edge over no fill — and it is what keeps "there is no
      // figure" distinct from "the figure is small" in greyscale.
      {...(sig === "absent" ? { "data-void": "" } : {})}
      // Exempts the impact from the Ledger motion guard. Stamping is a physical
      // act, which is the entire licence for it.
      {...(impact ? { "data-impact": "", "data-ink": "" } : {})}
    >
      {label}
    </span>
  );
}
