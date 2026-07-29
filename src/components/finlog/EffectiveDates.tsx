import Artifact from "./Artifact";
import { DATED_FACTS, DATED_SUBJECTS, REPLAY, REPLAY_PAIR, count, inr } from "./settlement";
import styles from "./finlog.module.css";

/**
 * THE EFFECTIVE-DATED PATTERN — chapter 005's artifact.
 *
 * One interface, one account, three periods, three different correct answers, and
 * not one of them retroactive. Billable in the first at a rate dated January.
 * Free in the second, because a trial window opened. Still free in the third,
 * while carrying a revised rate dated July that has never once been applied.
 *
 * WHY THIS RATHER THAN A TABLE MAP. The slot this replaces promised the full
 * schedule of tables. A map of tables is a drawing of the storage layout, and the
 * storage layout is not the idea — the idea is that asking "what did this cost in
 * May" is a question about history, and it returns January's answer today,
 * tomorrow, and after any number of later changes. That is a claim about TIME, so
 * the artifact is a time axis. It also happens to be the version that survives
 * the constraint against naming anything internal, which is a good sign rather
 * than a coincidence: a diagram that stops working once you remove the table
 * names was a diagram of the table names.
 *
 * THE HYBRID, AND THE ZOOM PROBLEM IT SOLVES.
 *
 * FINLOG-PAGE-PLAN §13 flags label alignment under text zoom as this branch's
 * one real risk, and it is a real risk: the obvious build puts dated labels at
 * absolute x-offsets inside the SVG, which are frozen at authoring time, while
 * the surrounding type grows with the reader's zoom. At 200% the labels are still
 * where 100% put them.
 *
 * So there are no labels in the SVG. The geometry — spans and dated boundaries —
 * is drawn in SVG because it is genuine geometry; every word is HTML in a grid
 * cell; and both read the SAME three-column grid, with the drawing spanning the
 * three period columns. Alignment is therefore not maintained, it is structural:
 * the drawing is as wide as the columns because it is IN them, so zoom moves the
 * type and the geometry by the same amount, always.
 *
 * `preserveAspectRatio="none"` is what lets the drawing stretch to whatever width
 * the columns resolve to, and `vector-effect: non-scaling-stroke` is what keeps
 * the stroke a true hairline while it stretches — the same System C rule the
 * chapter marks are drawn under, doing more work here than it does there. A
 * horizontal rule drawn in a stretched viewBox with a scaling stroke would render
 * a different weight at every viewport.
 */

/** viewBox width, three periods at 100 units each — so x = 100 and x = 200 are
 *  exactly the two period boundaries the grid columns divide on. */
const W = 300;
const H = 46;
const MID = W / 3;

export default function EffectiveDates() {
  return (
    <Artifact
      name="The effective-dated pattern"
      caption={
        <>
          One interface on one account, across three closed periods. Every row
          resolves against the date being billed rather than the date the question
          is asked, which is why the first period still answers ₹4.6411 — a rate
          set in January, superseded in July, and permanently correct for May.
          Nothing was updated in place, so nothing about the past changed shape.
        </>
      }
    >
      <div className={styles.sheet} data-money>
        <div className={styles.sheetHead}>
          <p className="type-eyebrow-3 text-faint">Replay</p>
          <p className="type-figure-3 text-secondary">{REPLAY_PAIR}</p>
        </div>

        <div className={styles.timeline}>
          {/* Row 1 — the three periods. These cells define the columns the
              drawing below is measured against. */}
          {REPLAY.map((r) => (
            <p
              key={r.period}
              className={`${styles.timelinePeriod} type-eyebrow-3 text-muted`}
            >
              {r.period}
            </p>
          ))}

          {/* Row 2 — the geometry, spanning all three period columns. */}
          <svg
            className={styles.timelineSvg}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              strokeLinecap="butt"
              vectorEffect="non-scaling-stroke"
            >
              {/* The two period boundaries — the dates an answer changes on. Full
                  height, so they cross every lane: one date can change more than
                  one fact, and here one of them changes two. */}
              <line x1={MID} y1={0} x2={MID} y2={H} vectorEffect="non-scaling-stroke" />
              <line x1={MID * 2} y1={0} x2={MID * 2} y2={H} vectorEffect="non-scaling-stroke" />

              {/* ONE LANE PER DATED FACT, STAGGERED — not one lane with the facts
                  laid end to end. The first version drew both rates on a single
                  y, and two collinear segments meeting at a boundary render as one
                  unbroken line: the moment a rate is superseded, which is the
                  entire subject, was invisible. A new dated row is a new row.

                  Lane 1 — the rate dated January. Runs in from before this window
                  and STOPS at the July boundary, because that is where the next
                  row supersedes it. */}
              <line x1={0} y1={9} x2={MID * 2} y2={9} vectorEffect="non-scaling-stroke" />

              {/* Lane 2 — the rate dated July. Begins at its own boundary and runs
                  off the right edge, because it is still in effect. */}
              <line x1={MID * 2} y1={23} x2={W} y2={23} vectorEffect="non-scaling-stroke" />

              {/* Lane 3 — the trial window. Opens at the June boundary, still open.
                  It sits BELOW both rate lanes on purpose: it does not replace a
                  rate, it suppresses billing while one remains in effect, which is
                  why July shows a rate and bills nothing. */}
              <line x1={MID} y1={37} x2={W} y2={37} vectorEffect="non-scaling-stroke" />
            </g>
          </svg>

          {/* Row 3 — what each lane IS. The three dated facts land in the column
              each one begins in, which is the only labelling the geometry needs:
              unlabelled lanes are a diagram of nothing, and a label inside the SVG
              is the alignment bug this whole build avoids. */}
          {DATED_FACTS.map((f) => (
            <p
              key={f.on}
              className={`${styles.timelineCell} ${styles.timelineFact} type-body-4 text-secondary`}
            >
              <span className={styles.timelineFactOn}>{f.on}</span>
              {`${f.fact} — ${f.detail}`}
            </p>
          ))}

          {/* Rows 4–7 — every word is HTML, in the same columns. */}
          {REPLAY.map((r) => (
            <p
              key={`${r.period}-rate`}
              className={`${styles.timelineCell} type-figure-3`}
              {...(r.rate ? { "data-sig": "settled" } : { "data-sig": "absent" })}
            >
              {r.rate ? `₹${r.rate} / call` : "trial — not billed"}
            </p>
          ))}
          {REPLAY.map((r) => (
            <p
              key={`${r.period}-hits`}
              className={`${styles.timelineCell} type-figure-3 text-faint`}
            >
              {`${count(r.hits)} calls`}
            </p>
          ))}
          {REPLAY.map((r) => (
            <p
              key={`${r.period}-billed`}
              className={`${styles.timelineCell} ${styles.timelineBilled} type-figure-2`}
              data-sig={Number(r.billed) > 0 ? "settled" : "absent"}
            >
              {inr(Number(r.billed))}
            </p>
          ))}
          {REPLAY.map((r) => (
            <p
              key={`${r.period}-by`}
              className={`${styles.timelineCell} ${styles.timelineWhy} type-body-4 text-faint`}
            >
              {r.decidedBy}
            </p>
          ))}
        </div>

        {/* The pattern is not one feature. It is the same shape wherever a fact
            can change and the past has to keep its answer. */}
        <dl className={styles.datedSubjects} data-rule>
          {DATED_SUBJECTS.map((s) => (
            <div key={s.subject} className={styles.datedSubject}>
              <dt className="type-body-4 text-secondary">{s.subject}</dt>
              <dd className="type-figure-3 text-muted">
                {`${count(s.rows)} dated ${s.rows === 1 ? "row" : "rows"}`}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Artifact>
  );
}
