import Artifact from "./Artifact";
import Stamp from "./Stamp";
import { CLIENT, PERIOD, PERIOD_ENDS, TOTALS, inr } from "./settlement";
import styles from "./finlog.module.css";

/**
 * DERIVE AND FINALIZE — chapter 002's artifact, and the page's founding split as
 * one image.
 *
 * Two sheets of the same invoice for the same closed month. The top one is what
 * was sent. The one showing through beneath it is what a live recomputation
 * produces today, from the same usage, against the inputs as they now stand.
 *
 * THE GHOST FIGURE IS REAL, AND IT IS LOWER. Between that month closing and now,
 * a trial window opened on one interface this account was being billed for. A
 * recomputation that reads the current trial state finds that interface free and
 * drops its line — so replaying a settled month against today's facts produces a
 * number smaller than the one the customer already paid. Not a rounding
 * difference: one whole line, worth {@link TOTALS.rederivedDelta}.
 *
 * That is the entire argument for freezing. The engine is not frozen because
 * recomputation is expensive or unreliable — it recomputes drafts continuously
 * and correctly. It is frozen because the inputs are allowed to change, and an
 * invoice that has been sent is a statement about a moment, not a query that
 * should keep returning today's answer.
 *
 * THE CARBON COPY IS THE ARGUMENT, NOT DECORATION. globals.css §15's
 * `[data-carbon]` paints an offset sheet behind its host — a carbon set is never
 * quite square — and it is Ledger-scoped on purpose: a console has no second
 * sheet. In Console the device is simply absent and the two panels read as two
 * panels, which is honest rather than degraded.
 *
 * The draft comes FIRST in source order, which is also the reading order and the
 * physical one: the live sheet is underneath, the finalized one lands on top of
 * it. Nothing here is positioned out of flow, so a narrow viewport gets the same
 * two sheets stacked, in the same order, with nothing overlapping and nothing
 * clipped.
 */
export default function DeriveFinalize() {
  return (
    <Artifact
      name="Derive and finalize"
      caption={
        <>
          Same account, same closed month, same usage. The lower sheet is a live
          recomputation against today&rsquo;s inputs; the upper one is what was
          actually sent. They differ by one line — an interface that has since been
          moved to a trial and now looks free, so a replay quietly refunds a month
          nobody asked to refund. The upper figure is frozen precisely so that
          cannot happen, and the correction for a genuine error is a new dated row
          beside it, never an edit to this one.
        </>
      }
    >
      <div className={styles.carbonSet}>
        {/* The sheet underneath: what recomputing would say now. */}
        <div className={`${styles.sheet} ${styles.carbonUnder}`} data-money>
          <div className={styles.sheetHead}>
            <p className="type-eyebrow-3 text-faint">Recomputed now</p>
            <Stamp label="DRAFT" sig="estimated" />
          </div>
          {/* One template string, not text nodes around interpolations. JSX
              trims the leading whitespace of any text node that contains a
              newline, so `{PERIOD} &middot; read against\n trial state` shipped as
              "May 2026· read" — a missing space in front of the separator, in the
              only line of this artifact that names the account and the period. */}
          <p className="type-figure-3 text-muted">
            {`${CLIENT} · ${PERIOD} · read against today’s rates and trial state`}
          </p>
          <div className={styles.sheetFigure}>
            <p className="type-figure-1" data-sig="estimated">
              {inr(Number(TOTALS.rederivedToday))}
            </p>
            {/* No double rule. This figure does not bill, and the page has been
                training the reader on that mark since 001. */}
            <p className="type-figure-3 text-faint">
              {`one line suppressed · ${inr(Number(TOTALS.rederivedDelta))}`}
            </p>
          </div>
        </div>

        {/* The top sheet: what was sent, and what will be sent forever.
            [data-carbon] gives it the offset second sheet behind. */}
        <div className={`${styles.sheet} ${styles.carbonTop}`} data-carbon data-money>
          <div className={styles.sheetHead}>
            <p className="type-eyebrow-3 text-faint">As issued, {PERIOD_ENDS}</p>
            {/* `impact` is one of exactly two animations the Ledger register
                permits (globals.css §15's [data-ink] allowlist), on the grounds
                that stamping is a physical act rather than a screen effect. */}
            <Stamp label="FINALIZED" sig="settled" impact />
          </div>
          <p className="type-figure-3 text-muted">
            {`${CLIENT} · ${PERIOD} · snapshotted at finalize, never recomputed`}
          </p>
          <div className={styles.sheetFigure}>
            <p className="type-figure-1" data-sig="settled" data-rule="double">
              {inr(Number(TOTALS.invoice))}
            </p>
            <p className="type-figure-3 text-faint">{`${TOTALS.lines} lines, frozen`}</p>
          </div>
        </div>
      </div>
    </Artifact>
  );
}
