import Artifact from "./Artifact";
import {
  CLIENT,
  PERIOD,
  SETTLEMENT_LINES,
  SHEETS,
  TOTALS,
  count,
  inr,
} from "./settlement";
import styles from "./finlog.module.css";

/**
 * THE MONTH-END PIPELINE — chapter 001's artifact.
 *
 * Ten sheets in, one settlement out, on the real seeded numbers. The chapter
 * argues that a spreadsheet fails by quietly agreeing with whatever you typed
 * into it; the counter-argument a worksheet like this makes is not "look how
 * many rows" — it is the last row.
 *
 * WHY THE LAST ROW IS THE ARTIFACT. Nine of these ten lines are volume × rate,
 * which is exactly what a person with a spreadsheet does correctly on a good
 * afternoon. The tenth is volume-priced: its rate is not knowable until the
 * month's total volume is known, so there is no cell anyone can type it into
 * while the month is still running, and no per-day figure that sums to it.
 * A hand-multiply cannot produce that line — not because the arithmetic is hard,
 * but because the arithmetic depends on a number that does not exist yet. That
 * is the difference between work a spreadsheet does slowly and work it cannot do.
 *
 * It is also the same line that diverges in 008, which is deliberate: the reader
 * meets the page's eventual payoff here, in the first artifact, as an ordinary
 * row of a worksheet, and has no reason yet to notice it.
 *
 * A `table`, not a grid of divs: this is tabular data with a header row and a
 * total, and the semantics are free. `scope` on every header, `<tfoot>` for the
 * settlement — a screen reader gets the same structure the eye does.
 *
 * NOT A CLIENT COMPONENT. Nothing here has state, so nothing here needs to
 * hydrate. The whole artifact renders at build and costs the reader no JS.
 */
export default function Worksheet() {
  return (
    <Artifact
      name="The month-end pipeline"
      caption={
        <>
          {/* Interpolations are composed into single strings rather than sat
              beside bare text: `{expr} word` lost its separating space in the
              compiled output, so the caption read "45,190calls". Caught in the
              render, invisible in the source. */}
          {`One account’s month: ${SHEETS} sheets, ${count(TOTALS.hits)} calls, one settlement.`}{" "}
          Nine of these lines are volume times rate, which is what a
          spreadsheet is for. The last one is not — a whole-volume rate resolves on
          the period&rsquo;s <em>total</em>, so it has no value at all until the
          month closes, and no day of the month holds a share of it. That is the
          line a hand-multiply cannot reach, and the same line that comes apart in
          the audit.
        </>
      }
    >
      {/* [data-money] is the clean-ground band: a figure that BILLS gets the
          register's own --bg painted behind it, punched through whichever ground
          the chapter is carrying. Required rather than decorative in Console,
          where a figure landing on a grid line measures 4.10:1. */}
      <div className={styles.sheet} data-money>
        <div className={styles.sheetHead}>
          <p className="type-eyebrow-3 text-faint">Settlement worksheet</p>
          <p className="type-figure-3 text-secondary">
            {CLIENT} &middot; {PERIOD}
          </p>
        </div>

        <div className={styles.tableScroll} data-scrollx>
          <table className={styles.worksheet}>
            <thead>
              <tr>
                <th scope="col" className="type-eyebrow-3 text-faint">
                  Interface
                </th>
                <th scope="col" className="type-eyebrow-3 text-faint">
                  Priced
                </th>
                <th scope="col" className="type-eyebrow-3 text-faint">
                  Calls
                </th>
                <th scope="col" className="type-eyebrow-3 text-faint">
                  ₹ / call
                </th>
                <th scope="col" className="type-eyebrow-3 text-faint">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {SETTLEMENT_LINES.map((line) => {
                // The volume-priced line. `estimated` rather than `loss`: nothing
                // is wrong with it — it is correct and it is simply not a number
                // a per-day view can hold. The signal vocabulary already means
                // exactly that.
                const volume = line.model === "tier" || line.model === "slab";
                return (
                  <tr key={line.name} data-volume={volume ? "" : undefined}>
                    <th scope="row" className="type-body-4 text-secondary">
                      {line.name}
                      {/* THE NARROW FORM. Below 48em the model and rate columns are
                          dropped and their content moves here, under the name.
                          Scrolling was the alternative and it is the wrong one for
                          this table: five money columns do not fit a phone, the
                          Amount column is the last of them, and a worksheet whose
                          settlement is off-screen until you swipe has buried the
                          one figure it exists to state. Only one of these two forms
                          is ever rendered, so neither the reader nor a screen
                          reader meets the rate twice. */}
                      <span className={`${styles.worksheetNarrow} type-figure-3 text-faint`}>
                        {volume
                          ? `${count(line.hits)} calls · whole volume at ${line.rate} blended`
                          : `${count(line.hits)} calls · ${line.model} at ${line.rate}`}
                      </span>
                    </th>
                    <td className="type-figure-3 text-faint">
                      {volume ? "whole volume" : line.model}
                    </td>
                    <td className="type-figure-3 text-muted">{count(line.hits)}</td>
                    <td
                      className="type-figure-3 text-muted"
                      {...(volume ? { "data-sig": "estimated" } : {})}
                    >
                      {volume ? `${line.rate} blended` : line.rate}
                    </td>
                    <td className="type-figure-2" data-sig="settled">
                      {inr(Number(line.billed))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* The double rule is the page's mark for a TOTAL, and it appears
                only under a figure that bills. This is one. */}
            <tfoot>
              <tr data-rule="double">
                <th scope="row" className="type-eyebrow-3 text-muted">
                  Settlement
                  <span className={`${styles.worksheetNarrow} type-figure-3 text-faint`}>
                    {`${count(TOTALS.hits)} calls`}
                  </span>
                </th>
                <td />
                <td className="type-figure-3 text-muted">{count(TOTALS.hits)}</td>
                <td />
                <td className="type-figure-1" data-sig="settled">
                  {inr(Number(TOTALS.invoice))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Artifact>
  );
}
