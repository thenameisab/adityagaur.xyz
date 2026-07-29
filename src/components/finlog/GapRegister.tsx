"use client";

import { useState } from "react";
import Artifact from "./Artifact";
import Stamp from "./Stamp";
import {
  AUDIT_TOTALS,
  CLEARED,
  FINDINGS,
  THEMES,
  type ThemeId,
} from "./register-data";
import styles from "./finlog.module.css";

/**
 * THE GAP REGISTER — chapter 008's artifact, and the one the whole page has been
 * setting up.
 *
 * Nineteen surfaces, filterable by root cause. The filter is the argument: the
 * findings arrive looking like nineteen unrelated discrepancies scattered across
 * a product, and selecting one cause lights up the four, five or six surfaces it
 * accounts for. Nineteen problems were four bugs. A reader can only be shown that
 * by doing it to the table themselves — a sentence claiming it reads as a boast.
 *
 * WHY IT IS INTERACTIVE ON A LEDGER CHAPTER. Motion is what the register forbids,
 * not interaction. globals.css §15's guard kills `animation-name` and deliberately
 * leaves transitions alone, because a control that does not answer the pointer is
 * broken rather than still — so the filter's hover and focus feedback is exactly
 * as permitted here as it is in Console, and nothing in this artifact moves,
 * fades, slides, or counts up. The rows do not animate in or out. They are there
 * or they are not.
 *
 * THE SEVERITY COLUMN'S POINT IS THE COLUMN THAT ISN'T THERE. Every finding is
 * P1 or P2 — a displayed number that was wrong beside an invoice that was right.
 * There is no P0 column because there were no P0s, and an audit's most useful
 * output is often the category it had to leave empty.
 *
 * FIGURES ONLY WHERE THEY ARE REPRODUCIBLE. Two rows carry an expected-versus-
 * actual pair, and they are the two the fictional seeded build reproduces exactly.
 * The rest carry the divergence in words. That asymmetry is visible on purpose:
 * quoting a figure for the other seventeen would mean carrying over numbers from
 * the reconciliation that ran against real data, and this page does not publish
 * those. A described divergence the reader can check against the mechanism is
 * worth more than a precise number they have to take on trust.
 */
export default function GapRegister() {
  /** `null` is every finding, which is the state the reader arrives in — the
   *  scattered view, before any cause has been named. */
  const [active, setActive] = useState<ThemeId | null>(null);
  const shown = active ? FINDINGS.filter((f) => f.theme === active) : FINDINGS;
  const activeTheme = THEMES.find((t) => t.id === active);

  return (
    <Artifact
      name="The gap register"
      caption={
        <>
          Every revenue surface in the product, reconciled against the billing
          engine treated as the one number the others owe an explanation to. Filter
          by cause and watch the scatter collapse:{" "}
          {`${AUDIT_TOTALS.surfaces} findings, ${AUDIT_TOTALS.causes} root causes, ${AUDIT_TOTALS.p0s} of them a billing error.`} The two rows carrying figures are the two this data reproduces
          exactly; the rest state the divergence in words rather than borrow a
          number from elsewhere.
        </>
      }
    >
      <div className={styles.sheet} data-money>
        <div className={styles.sheetHead}>
          <p className="type-eyebrow-3 text-faint">Reconciliation register</p>
          <Stamp label="ZERO P0s" sig="settled" />
        </div>

        {/* The filter. Buttons rather than a select: five options, all worth
            showing at once, and the point is comparing how many surfaces each
            cause owns — which a closed select hides. */}
        <div className={styles.causeFilter}>
          <button
            type="button"
            className={`${styles.cause} type-body-4`}
            onClick={() => setActive(null)}
            aria-pressed={active === null}
            {...(active === null ? { "data-active": "" } : {})}
          >
            {`All ${AUDIT_TOTALS.surfaces}`}
          </button>
          {THEMES.map((t) => {
            const n = FINDINGS.filter((f) => f.theme === t.id).length;
            return (
              <button
                key={t.id}
                type="button"
                className={`${styles.cause} type-body-4`}
                onClick={() => setActive(active === t.id ? null : t.id)}
                aria-pressed={active === t.id}
                {...(active === t.id ? { "data-active": "" } : {})}
              >
                {t.name} <span className="text-faint">{n}</span>
              </button>
            );
          })}
        </div>

        {/* The selected cause's mechanism, in one sentence, above the surfaces it
            explains. Without this the filter is a way of shortening a table. */}
        <p
          className={`${styles.causeMechanism} type-body-3 text-secondary`}
          // aria-live so a keyboard user pressing a filter hears what changed
          // rather than only seeing fewer rows.
          aria-live="polite"
        >
          {activeTheme
            ? activeTheme.mechanism
            : `All ${AUDIT_TOTALS.surfaces} findings, as they arrived — ${AUDIT_TOTALS.p1s} displaying a wrong number, ${AUDIT_TOTALS.p2s} cosmetic or latent, and none of them a customer billed the wrong amount.`}
        </p>

        <div className={styles.tableScroll} data-scrollx>
          <table className={styles.register}>
            <caption className="type-eyebrow-3 text-faint">
              {activeTheme
                ? `${shown.length} of ${AUDIT_TOTALS.surfaces} surfaces — ${activeTheme.name.toLowerCase()}`
                : `${AUDIT_TOTALS.surfaces} surfaces reconciled`}
            </caption>
            <thead>
              <tr>
                <th scope="col" className="type-eyebrow-3 text-faint">
                  Surface
                </th>
                <th scope="col" className="type-eyebrow-3 text-faint">
                  What diverged
                </th>
                <th scope="col" className="type-eyebrow-3 text-faint">
                  Sev
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((f) => (
                <tr key={`${f.surface}-${f.element}`}>
                  {/* THE TYPE ROLE GOES ON THE CELL, not on a span inside it. A
                      cell's line boxes are never shorter than its own strut, and a
                      cell inheriting the prose lede's 18px held every line of a
                      14px span 26px apart — nineteen rows of double-spaced
                      findings. Setting the role on the cell sets the strut too. */}
                  <th scope="row" className="type-body-4 text-primary">
                    {f.surface}
                    <span className={`${styles.registerElement} text-faint`}>
                      {f.element}
                    </span>
                  </th>
                  <td className="type-body-4 text-secondary">
                    {f.divergence}
                    {f.figures && (
                      <span className={styles.registerFigures}>
                        <span className="type-figure-3 text-faint">invoice</span>
                        <span className="type-figure-3" data-sig="settled">
                          {f.figures.expected}
                        </span>
                        <span className="type-figure-3 text-faint">shown</span>
                        <span className="type-figure-3" data-sig="loss">
                          {f.figures.actual}
                        </span>
                        <span className="type-figure-3 text-faint">short by</span>
                        <span className="type-figure-3" data-sig="loss">
                          {f.figures.gap}
                        </span>
                      </span>
                    )}
                  </td>
                  <td className="type-figure-3 text-muted">
                    {/* The column header disappears when the rows stack on a
                        phone, and "P1" alone says nothing. A real element rather
                        than CSS-generated text, so it is in the accessibility tree
                        at the width where it is the only label there is. */}
                    <span className={styles.sevLabel}>severity </span>
                    {f.severity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cleared. A findings table without what was checked and held is a list
            of complaints. */}
        <div className={styles.cleared} data-rule>
          <p className="type-eyebrow-3 text-faint">
            Checked and held — {CLEARED.length} reconciliations an adversarial pass
            tried to break and could not
          </p>
          <ul className={styles.clearedList}>
            {CLEARED.map((c) => (
              <li key={c} className="type-body-4 text-muted">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Artifact>
  );
}
