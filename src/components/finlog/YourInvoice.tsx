"use client";

import Artifact from "./Artifact";
import Stamp from "./Stamp";
import { useReading } from "./Reading";
import { count } from "./settlement";
import styles from "./finlog.module.css";

/**
 * YOUR INVOICE — chapter 009's artifact, and the page's last mark.
 *
 * The reading session, closed out in the grammar of the document the whole essay
 * has been about: numbered lines, a quantity per line, figures on their own
 * column, a double rule under the total, and a stamp that means something.
 *
 * WHAT IT DELIBERATELY DOES NOT DO IS INVENT MONEY. An invoice's line is
 * quantity × rate = amount, and the obvious build would put a rupee figure beside
 * each chapter. There is no rate for reading a chapter, so that column could only
 * be a made-up number — printed in the same mono, on the same money band, under
 * the same double rule as ₹1,23,847.49 four hundred words above it. On the page
 * whose thesis is that the number which bills is the only one entitled to be
 * treated as true, that would not be a flourish; it would be the exact error the
 * essay spends nine chapters describing, committed in its final artifact.
 *
 * So the quantity is real and the unit is words. The invoice-ness comes from the
 * form — the itemisation, the line numbers, the rule, the stamp — and not from a
 * currency symbol borrowed to make a souvenir feel expensive. §5.6 already banned
 * counting a figure up from zero for the same reason: the form must not claim more
 * than the number can support.
 *
 * THE WORD COUNTS ARE MEASURED, NOT BAKED, which is what makes this the one
 * artifact on the page that cannot go stale. Each chapter counts the words in its
 * own rendered paragraphs and registers them (see `Reading.tsx`), so editing the
 * prose changes this statement on the next build with nothing to keep in sync. It
 * is also why the totals here are worth reading: they are a measurement of the
 * essay taken by the essay.
 *
 * THE GATE, per §5.5. Until a chapter has actually been read the statement carries
 * NOT BILLED and says what would close it. When every line is read it carries
 * FINALIZED, with the 90ms impact — triggered by a `key` change rather than a
 * timer, and exempt from the Ledger motion guard via `[data-ink]`, because
 * stamping is a physical act and the one animation a printed register is allowed.
 */
export default function YourInvoice() {
  const reading = useReading();
  const lines = reading?.lines ?? [];

  const read = lines.filter((l) => l.read);
  const totalWords = lines.reduce((s, l) => s + l.words, 0);
  const readWords = read.reduce((s, l) => s + l.words, 0);
  const complete = lines.length > 0 && read.length === lines.length;

  return (
    <Artifact
      name="Your invoice"
      caption={
        <>
          Every line you reached the end of, itemised the way the month was. The
          quantities are words of prose, counted from this page as it rendered
          rather than stored. There is no amount column, because there is no
          rate for reading a chapter and this is not the page to invent one on.
        </>
      }
    >
      <div className={styles.sheet} data-money>
        <div className={styles.sheetHead}>
          <p className="type-eyebrow-3 text-faint">Statement of this session</p>
          {/* The key change is the trigger: when the last line is read the node
              remounts and the impact runs once. */}
          {complete ? (
            <Stamp key="finalized" label="FINALIZED" sig="settled" impact />
          ) : (
            <Stamp key="not-billed" label="NOT BILLED" sig="absent" />
          )}
        </div>

        {lines.length === 0 ? (
          /* No session — either scripting is off, or nothing has registered yet.
             A complete essay with static tables is the documented degraded state
             (§5.7), so this says what it is instead of pretending to compute. */
          <p className="type-body-3 text-muted">
            Nothing recorded. This one statement is the only thing on the page that
            needs scripting; every chapter above it, and every figure in them, is
            already here without it.
          </p>
        ) : (
          <>
            <div className={styles.tableScroll} data-scrollx>
              <table className={styles.statement}>
                <caption className="type-eyebrow-3 text-faint">
                  {`${count(read.length)} of ${count(lines.length)} lines closed`}
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="type-eyebrow-3 text-faint">
                      Line
                    </th>
                    <th scope="col" className="type-eyebrow-3 text-faint">
                      Description
                    </th>
                    <th scope="col" className="type-eyebrow-3 text-faint">
                      Words
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.line} {...(l.read ? {} : { "data-unread": "" })}>
                      {/* The type role sits on the CELL, not a span inside it: a
                          cell's line boxes are never shorter than its own strut,
                          so a role on an inner span leaves the row spaced to the
                          prose leading it inherited. */}
                      <th scope="row" className="type-figure-3 text-muted">
                        {l.line}
                      </th>
                      <td className="type-body-4 text-secondary">
                        {l.title}
                        {!l.read && (
                          <span className={`${styles.statementPending} text-faint`}>
                            not reached
                          </span>
                        )}
                      </td>
                      <td className="type-figure-3" data-sig={l.read ? "settled" : "absent"}>
                        {/* The column header goes away when the rows stack on a
                            phone, and a bare figure says nothing there — a real
                            element rather than generated text, so it is in the
                            accessibility tree at the width where it is the only
                            label there is. */}
                        <span className={styles.sevLabel}>words </span>
                        {l.read ? count(l.words) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row" colSpan={2} className="type-body-4 text-primary">
                      {complete ? "Read in full" : "Read so far"}
                    </th>
                    {/* The double rule — the invoice's own way of saying a figure
                        is the total and not another line.
                     *
                     * NO `data-money` HERE, and the first build's extra one drew a
                     * box. The device is a clean band PLUS vertical column rules
                     * (`border-inline`), which is right on a figure sitting in
                     * running prose and wrong on a table cell: the verticals met
                     * the double bottom border and framed the total on all three
                     * sides, so the page's most emphatic figure arrived looking
                     * like a form field. The band is already claimed once, on the
                     * sheet — which is where every other artifact claims it. */}
                    <td className="type-figure-2" data-rule="double" data-sig="settled">
                      <span className={styles.sevLabel}>words </span>
                      {count(readWords)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p
              className={`${styles.statementNote} type-body-3 text-secondary`}
              aria-live="polite"
            >
              {complete
                ? `All ${count(lines.length)} lines, ${count(
                    totalWords
                  )} words, closed out. The figure above is the only one on this page you produced yourself, which is why it is the one that gets the double rule and the stamp.`
                : `${count(readWords)} of ${count(totalWords)} words. ${count(
                    lines.length - read.length
                  )} ${
                    lines.length - read.length === 1 ? "line is" : "lines are"
                  } still open; reach the end of each one and this statement closes itself.`}
            </p>
          </>
        )}
      </div>
    </Artifact>
  );
}
