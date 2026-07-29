"use client";

import { useState } from "react";
import Artifact from "./Artifact";
import Stamp from "./Stamp";
import { LEAK_CLASSES, LEAK_CONTEXT, type LeakClass } from "./engine-data";
import { count } from "./settlement";
import styles from "./finlog.module.css";

/**
 * THE THREE LEAKS — chapter 007's artifact.
 *
 * Three classes of usage that generated cost and generated no invoice line, run
 * against the seeded build's own rows. They are modelled as three states rather
 * than one severity flag because they differ in what you can DO about them, not
 * in how bad they are — and the third differs so completely that it is drawn
 * without a level.
 *
 * THE VESSELS, AND WHY ONE HAS NO BOTTOM. The chapter's closing image is three
 * vessels, two holding a level you can read and act on and a third with no floor.
 * That is not decoration, it is the taxonomy: a rate gap and an open trial are
 * IDENTIFIED — known account, known interface, known volume — so a rate can be
 * written and applied, even late. Catalog drift is not identified at all. What
 * survived is a string and a count, so there is nothing to price, and the honest
 * drawing of "we cannot yet size this" is a shape with nothing underneath it
 * rather than a large number.
 *
 * A LARGE NUMBER WOULD HAVE BEEN THE EASIER AND WORSE CHOICE. The floorless class
 * is by far the SMALLEST here — 91 calls against 76,304 — and rendering all three
 * as bars would have said the opposite of what the chapter says: that the one you
 * can't size is the dangerous one precisely because nothing about it pages
 * anybody. Two of these are wrong numbers. The third is a missing number.
 *
 * SVG FOR THE VESSELS, HTML FOR EVERY WORD — §6's rule. The vessels are genuine
 * geometry (walls, a base that is present or absent, a level); the figures,
 * headings and every row of the table are DOM, because they are text and need
 * selection order and a screen reader.
 *
 * THE REVEAL IS CONSOLE-ONLY, and structurally so. The rows stagger in at 160ms
 * with a 40ms step per §7.2 item 5, capped so a long class does not turn into a
 * queue. Authored under `.theme-console`, which means globals.css §15's guard
 * (`.theme-ledger *:not([data-ink])`) stops it if the reader flips register —
 * a rule about where motion is allowed rather than a second set of animations.
 * Under reduced motion the rows are simply there.
 */

/** §7.2 item 5: 40ms step, capped at 8 rows so the last row of a long class does
 *  not arrive most of a second after the first. */
const STAGGER_CAP = 8;

/** The shared scale the two sizable classes are measured on — the largest of
 *  them. A shared denominator is the only way two levels can be compared; the
 *  floorless class is deliberately absent from it, because including it would
 *  mean asserting a size it does not have. */
const LEVEL_MAX = Math.max(...LEAK_CLASSES.filter((c) => c.floor).map((c) => c.calls));

/** Vessel geometry, in its own square viewBox. Stretched to the column
 *  (`preserveAspectRatio="none"`) so it tracks text zoom with everything else. */
const V = 100;

/**
 * One vessel.
 *
 * THE FIRST BUILD OF THIS DREW ALL THREE THE SAME AND ONLY A SCREENSHOT SHOWED IT.
 * It rendered the contents as the page's own hairline ruling — rules from the
 * level down — on the reasoning that this design uses rules rather than paints.
 * The result was three boxes of evenly spaced lines: a full vessel is then a
 * fully ruled box, an almost-empty one is a box with a line near the bottom, and
 * the floorless one is a box whose lowest rule reads as its base. The single
 * distinction the artifact exists to draw was the one thing invisible in it.
 *
 * So the contents are a fill, which is a deliberate exception to the rules-not-
 * paints grammar and earns it: a level is an AREA, and the one graphic on this
 * page whose subject is quantity-held is the one place a filled region says
 * something a line cannot.
 *
 * AND THE FLOORLESS ONE IS NOT DRAWN AS A FULL VESSEL. It gets two walls, a line
 * at the top where calls arrived, and NOTHING underneath — no base and no fill.
 * Filling it would assert a level, and the whole point of the third class is that
 * 91 calls arrived and not one of them can be priced. The absence is the datum.
 */
function Vessel({ leak }: { leak: LeakClass }) {
  const fill = leak.floor ? Math.max(0.05, leak.calls / LEVEL_MAX) : 1;
  const levelY = V - fill * V;

  return (
    <svg
      className={styles.vessel}
      viewBox={`0 0 ${V} ${V}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* The contents. Only where there is a level to state. */}
      {leak.floor && (
        <rect
          className={styles.vesselFill}
          x={2}
          y={levelY}
          width={V - 4}
          height={V - levelY}
        />
      )}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="butt"
        vectorEffect="non-scaling-stroke"
      >
        {/* Two walls, always. A vessel is a vessel either way. */}
        <line x1={2} y1={0} x2={2} y2={V} vectorEffect="non-scaling-stroke" />
        <line x1={V - 2} y1={0} x2={V - 2} y2={V} vectorEffect="non-scaling-stroke" />

        {/* The base — present only when the class can be sized. */}
        {leak.floor && (
          <line x1={2} y1={V} x2={V - 2} y2={V} vectorEffect="non-scaling-stroke" />
        )}

        {/* The level. On the floorless vessel this is the only mark inside the
            walls: something arrived, and nothing below it is knowable. */}
        <line
          className={styles.vesselLevel}
          x1={2}
          y1={levelY}
          x2={V - 2}
          y2={levelY}
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}

export default function LeakDetector() {
  /** Which class's rows are open. `null` is the arrival state: three vessels and
   *  no rows, so the shapes are compared before any of them is itemised. */
  const [open, setOpen] = useState<LeakClass["id"] | null>(null);
  const active = LEAK_CLASSES.find((c) => c.id === open);

  const sizable = LEAK_CLASSES.filter((c) => c.floor).reduce((s, c) => s + c.calls, 0);
  const floorless = LEAK_CLASSES.find((c) => !c.floor);

  return (
    <Artifact
      name="The three leaks"
      caption={
        <>
          {`Three shapes the same failure takes, against ${count(
            LEAK_CONTEXT.totalCalls
          )} recorded calls. `}
          Two can be sized and closed by writing a dated row. The third is the
          smallest of the three and the only one with no floor, because a call that
          resolves to no interface cannot be priced — and a missing number, unlike
          a wrong one, never pages anybody.
        </>
      }
    >
      <div className={styles.sheet} data-money>
        <div className={styles.sheetHead}>
          <p className="type-eyebrow-3 text-faint">Detectors</p>
          <p className="type-figure-3 text-secondary">
            {`${count(sizable)} calls sizable · ${count(floorless?.calls ?? 0)} not`}
          </p>
        </div>

        {/* The three vessels, each its own button — the toggle IS the vessel, so
            there is no separate control strip competing with the shapes. */}
        <div className={styles.vessels}>
          {LEAK_CLASSES.map((leak) => (
            <button
              key={leak.id}
              type="button"
              className={styles.vesselCell}
              onClick={() => setOpen(open === leak.id ? null : leak.id)}
              aria-pressed={open === leak.id}
              aria-controls="finlog-a5-rows"
              {...(open === leak.id ? { "data-active": "" } : {})}
              {...(leak.floor ? {} : { "data-void": "" })}
            >
              <Vessel leak={leak} />
              <span className={`${styles.vesselName} type-body-4`}>{leak.name}</span>
              <span
                className={`${styles.vesselFigure} type-figure-3`}
                data-sig={leak.floor ? "loss" : "absent"}
              >
                {`${count(leak.calls)} calls`}
              </span>
              <span className={`${styles.vesselFloor} type-eyebrow-3 text-faint`}>
                {leak.floor
                  ? `${count(leak.pairs)} ${leak.pairs === 1 ? "pair" : "pairs"}`
                  : "no floor"}
              </span>
            </button>
          ))}
        </div>

        {/* The mechanism of whichever class is open, above its rows. Without this
            the toggles are a way of hiding a table. */}
        <div id="finlog-a5-rows" className={styles.leakBody}>
          <p
            className={`${styles.causeMechanism} type-body-3 text-secondary`}
            aria-live="polite"
          >
            {active
              ? active.mechanism
              : "Three detectors, none open. The shapes are the argument: two hold a level you can read, and the third has nothing underneath it."}
          </p>

          {active && (
            <>
              <ul
                className={styles.leakRows}
                // Remounts on every class change, so the stagger runs once per
                // opening rather than never again after the first — the same
                // key-change trigger the stamp's impact uses.
                key={active.id}
              >
                {active.rows.map((row, i) => (
                  <li
                    key={`${row.subject}-${row.detail}`}
                    className={styles.leakRow}
                    // The one legitimate inline style in the codebase, per
                    // globals.css §11 — the stagger index, capped.
                    style={{ "--i": Math.min(i, STAGGER_CAP) } as React.CSSProperties}
                  >
                    <p className={`${styles.leakSubject} type-body-4 text-primary`}>
                      {row.subject}
                    </p>
                    <p className={`${styles.leakDetail} type-body-4 text-secondary`}>
                      {row.detail}
                    </p>
                    <p
                      className={`${styles.leakCalls} type-figure-3`}
                      data-sig={active.floor ? "loss" : "absent"}
                    >
                      {`${count(row.calls)} calls`}
                    </p>
                  </li>
                ))}
              </ul>

              {active.rows.length < active.pairs && (
                <p className={`${styles.leakMore} type-body-4 text-faint`}>
                  {`${count(active.rows.length)} of ${count(
                    active.pairs
                  )} shown, largest first; the rest are the same shape at smaller volumes.`}
                </p>
              )}

              <div className={styles.leakRemedy} data-rule>
                <p className="type-eyebrow-3 text-faint">
                  {active.floor ? "How it closes" : "Why it cannot close yet"}
                </p>
                <p className="type-body-4 text-secondary">{active.remedy}</p>
                {!active.floor && (
                  <p className={styles.leakStamp}>
                    <Stamp label="NOT BILLED" sig="absent" />
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* The catalog's own scale, because catalog drift is only legible against
            how many interfaces exist and how many are still live. */}
        <p className={`${styles.censusNote} type-body-4 text-muted`}>
          {`${count(LEAK_CONTEXT.catalogRows)} interfaces in the catalog, ${count(
            LEAK_CONTEXT.catalogActive
          )} of them active, and ${count(
            LEAK_CONTEXT.unidentifiedCalls
          )} calls that resolved to none of them. Those last ones are countable and unplaceable at the same time, which is the whole of the third class.`}
        </p>
      </div>
    </Artifact>
  );
}
