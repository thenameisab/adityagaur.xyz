import type { MarkLine } from "./Defs";
import { CHECKPOINTS, isDiverged } from "./checkpoints";
import styles from "./finlog.module.css";

/**
 * The two figures, stated in the prose rather than in the rail.
 *
 * WHY THIS EXISTS. The rail is hidden below 80em, and its own comment justified
 * that by claiming "every figure the rail states is also stated in running prose at
 * the chapter that earns it." That was not true of the one chapter it needed to be
 * true of. Chapter 008 names no figure at all — it says "this page's own
 * reconciliation rail has shown you exactly that", then "Watch it now." So every
 * reader below the breakpoint was pointed at a divergence that was not rendered
 * anywhere on their screen, and chapter 009's "it was correct in 002 and it is
 * correct here" closed an argument they had never been shown.
 *
 * Rendered only where the rail is not. At 80em+ the rail is the instrument and a
 * second copy of the same two numbers a few lines below it would be noise.
 *
 * The invoice figure carries `data-money` and the dashboard figure does not, which
 * is the page's own grammar doing the work: clean ground is the mark of a figure
 * that BILLS. The one that merely displays does not earn it, and at this chapter
 * that distinction is the entire point.
 */
export default function Reconciliation({ line }: { line: MarkLine }) {
  const checkpoint = CHECKPOINTS[line];
  if (!checkpoint) return null;
  const diverged = isDiverged(checkpoint);

  return (
    <dl className={styles.reconciliation} data-rule>
      <div className={styles.reconciliationRow}>
        <dt className={`${styles.reconciliationLabel} type-eyebrow-3 text-faint`}>Invoice</dt>
        <dd className={`${styles.reconciliationValue} type-figure-2`} data-sig="settled" data-money>
          {checkpoint.invoice}
        </dd>
      </div>
      <div className={styles.reconciliationRow}>
        <dt className={`${styles.reconciliationLabel} type-eyebrow-3 text-faint`}>Dashboard</dt>
        <dd
          className={`${styles.reconciliationValue} type-figure-2`}
          data-sig={diverged ? "loss" : "settled"}
        >
          {checkpoint.dashboard}
        </dd>
      </div>
    </dl>
  );
}
