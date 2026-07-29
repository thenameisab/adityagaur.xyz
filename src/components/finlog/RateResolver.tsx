"use client";

import { useEffect, useRef, useState } from "react";
import Artifact from "./Artifact";
import Stamp from "./Stamp";
import {
  CENSUS_TOTAL_PAIRS,
  CHAIN_CASES,
  CHAIN_CENSUS,
  RUNGS,
  type ChainCase,
} from "./engine-data";
import { count } from "./settlement";
import styles from "./finlog.module.css";

/**
 * PRICING A SINGLE CALL — chapter 003's artifact, and the centrepiece the plan
 * calls it.
 *
 * A call comes in. Four rungs are checked in a fixed order, the first that
 * applies wins, and every rung below it is never consulted. The reader picks a
 * case; the chain walks; the rung that answers lights, the rungs above it that
 * were checked and missed go dim, and the rungs below it stay untouched — because
 * "checked and did not apply" and "never ran" are different facts, and a chain
 * that renders them identically has lost the only thing a precedence order means.
 *
 * THE FOURTH CASE IS THE ARTIFACT'S REASON TO EXIST. Three cases resolve. The
 * fourth walks the entire ladder and lights NOTHING — billable, priced at zero,
 * invoiced by nobody. Every other state on this page is a number; this one is the
 * absence of a number, and the only honest way to draw it is to leave the place
 * where the answer goes empty. It is the same fact as catalog drift in 007, which
 * is why 003 and 007 are one argument told twice.
 *
 * WHY THE WALK IS ANIMATED HERE AND NOWHERE ELSE ON THE PAGE. §7.1 permits motion
 * only where the product is genuinely computing, and this is the one artifact
 * whose subject IS a sequence in time: the rungs are checked in order, and a
 * chain that arrives fully resolved has shown a result rather than a resolution.
 * So the stages advance at 120ms under `.theme-console` only — the Ledger guard
 * (globals.css §15) kills it structurally rather than by convention if the reader
 * flips register, and `prefers-reduced-motion` lands on the final state, which is
 * the correct answer rather than a degraded one.
 *
 * The walk is state, not CSS animation, because the intermediate stages have to be
 * legible to a screen reader as they happen — an `aria-live` region announcing
 * which rung answered is the whole content for a non-visual reader, and you cannot
 * read that off a keyframe.
 */

/** 120ms per stage, per §7.2 item 3. Four rungs, so a full miss takes 480ms. */
const STAGE_MS = 120;

function rungState(
  rung: (typeof RUNGS)[number],
  index: number,
  active: ChainCase,
  stage: number
): "pending" | "checking" | "missed" | "resolved" {
  const resolvedIndex = active.resolvedBy
    ? RUNGS.findIndex((r) => r.id === active.resolvedBy)
    : RUNGS.length; // fall-through: every rung is checked and every rung misses

  if (index > stage) return "pending";
  if (index === resolvedIndex) return "resolved";
  if (index < resolvedIndex) return index === stage ? "checking" : "missed";
  return "pending";
}

export default function RateResolver() {
  const [caseId, setCaseId] = useState(CHAIN_CASES[0].id);
  const active = CHAIN_CASES.find((c) => c.id === caseId) ?? CHAIN_CASES[0];

  /** How far down the ladder the walk has got. Starts RESOLVED, so a reader who
   *  never touches the control — and a reader with scripting off, who gets the
   *  server-rendered markup and nothing else — sees a complete answer rather than
   *  an animation waiting to be triggered. */
  const [stage, setStage] = useState(RUNGS.length);
  const timers = useRef<number[]>([]);

  /**
   * THE WALK IS STARTED BY THE CLICK, NOT BY AN EFFECT ON `caseId`.
   *
   * The effect version worked and was wrong twice over. It had to carry a
   * first-render ref to avoid walking on mount — a flag whose only job is to
   * undo the effect's own eagerness — and it called `setStage` synchronously in
   * the effect body, which is a cascading render that `react-hooks` flags. The
   * honest description of this behaviour is "a reader picked a case, so run the
   * resolution", and that is an event, not a synchronisation with anything
   * outside React. Putting it in the handler says so and needs no flag.
   */
  function selectCase(id: string) {
    setCaseId(id);
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    // Reduced motion lands on the final state, which is the correct answer
    // rather than a degraded one.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage(RUNGS.length);
      return;
    }
    setStage(0);
    timers.current = RUNGS.map((_, i) =>
      window.setTimeout(() => setStage(i + 1), (i + 1) * STAGE_MS)
    );
  }

  // Unmount only: a pending walk must not fire into a gone component.
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const resolvedRung = active.resolvedBy
    ? RUNGS.find((r) => r.id === active.resolvedBy)
    : undefined;
  const settled = stage >= RUNGS.length;

  return (
    <Artifact
      name="Pricing a single call"
      caption={
        <>
          {`Four rungs, checked in this order, first match wins, over ${count(
            CENSUS_TOTAL_PAIRS
          )} real account-and-interface pairs. `}
          Three of these cases resolve and one does not, and the one that does not
          is the state worth remembering: it lights nothing, because there is
          nothing to light.
        </>
      }
    >
      <div className={styles.sheet} data-money>
        <div className={styles.sheetHead}>
          <p className="type-eyebrow-3 text-faint">Resolution</p>
          {settled &&
            (active.resolvedBy ? (
              <p className="type-figure-3 text-secondary">{`resolved on rung ${
                RUNGS.findIndex((r) => r.id === active.resolvedBy) + 1
              } of 4`}</p>
            ) : (
              <Stamp label="NOT BILLED" sig="absent" />
            ))}
        </div>

        {/* The case picker. Buttons rather than a select, for the same reason the
            gap register's filter is: the four options ARE the content — one per
            outcome the chain can produce — and a closed select hides the fact
            that there are exactly four. */}
        <div className={styles.causeFilter}>
          {CHAIN_CASES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`${styles.cause} type-body-4`}
              onClick={() => selectCase(c.id)}
              aria-pressed={c.id === caseId}
              {...(c.id === caseId ? { "data-active": "" } : {})}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* What is being priced. The date is not decoration: every rung is a
            lookup against the date being billed, so a chain without one is a
            chain that could not have been evaluated. */}
        <dl className={styles.resolverInput}>
          <div>
            <dt className="type-eyebrow-3 text-faint">Account</dt>
            <dd className="type-body-4 text-secondary">{active.client}</dd>
          </div>
          <div>
            <dt className="type-eyebrow-3 text-faint">Interface</dt>
            <dd className="type-body-4 text-secondary">{active.interfaceName}</dd>
          </div>
          <div>
            <dt className="type-eyebrow-3 text-faint">As of</dt>
            <dd className="type-figure-3 text-secondary">{active.asOf}</dd>
          </div>
          <div>
            <dt className="type-eyebrow-3 text-faint">Calls</dt>
            <dd className="type-figure-3 text-secondary">{count(active.calls)}</dd>
          </div>
        </dl>

        {/* The ladder. An ordered list because the order is the whole content —
            and `<ol>` is what tells a screen reader "rung 3 of 4" without a
            single word of extra markup. */}
        <ol className={styles.chain}>
          {RUNGS.map((rung, i) => {
            const state = rungState(rung, i, active, stage);
            return (
              <li
                key={rung.id}
                className={styles.chainRung}
                data-state={state}
                // The rung that answered is the one fact a non-visual reader
                // needs from the geometry, so it is in the tree as text.
                {...(state === "resolved" ? { "data-sig": "settled" } : {})}
              >
                <p className={`${styles.chainRungNo} type-figure-3`}>{i + 1}</p>
                <div className={styles.chainRungBody}>
                  <p className={`${styles.chainQuestion} type-body-4`}>{rung.question}</p>
                  {state === "resolved" && (
                    <p className={`${styles.chainOutcome} type-body-4`}>{rung.outcome}</p>
                  )}
                </div>
                <p className={`${styles.chainVerdict} type-eyebrow-3`}>
                  {state === "resolved"
                    ? "applies"
                    : state === "missed" || state === "checking"
                      ? "no"
                      : ""}
                </p>
              </li>
            );
          })}
        </ol>

        {/* The answer. For three cases this is a rate and an amount. For the
            fourth it is deliberately a void rather than a zero in the same
            typeface as a price — §15's [data-void] carries "billable and nobody
            invoiced it" as a SHAPE, so the difference survives greyscale and a
            reader who cannot see the red. */}
        <div className={styles.resolverAnswer} data-rule>
          {settled && active.resolvedBy ? (
            <>
              <div className={styles.sheetFigure}>
                <p className="type-eyebrow-3 text-faint">Rate applied</p>
                <p className="type-figure-2" data-sig={active.rate ? "settled" : "absent"}>
                  {active.rate ? `${active.rate} / call` : active.rateNote}
                </p>
              </div>
              <div className={styles.sheetFigure}>
                <p className="type-eyebrow-3 text-faint">This line bills</p>
                <p
                  className="type-figure-1"
                  data-sig={Number(active.billed.replace(/[₹,]/g, "")) > 0 ? "settled" : "absent"}
                >
                  {active.billed}
                </p>
              </div>
            </>
          ) : settled ? (
            <div className={styles.resolverVoid} data-void>
              <p className="type-figure-2 text-faint">no rate resolved</p>
              <p className={`${styles.resolverVoidNote} type-body-4 text-muted`}>
                {`${count(active.calls)} calls, billable, priced at ₹0.00 — and nothing on any invoice to explain them.`}
              </p>
            </div>
          ) : (
            // Mid-walk. Not a spinner and not a skeleton (§7.3 forbids both,
            // because nothing here fetches): the rungs above are already showing
            // their verdicts, so the answer slot simply has not been reached yet.
            <p className="type-figure-2 text-faint">checking…</p>
          )}
        </div>

        {/* Announced rather than only drawn. Without this the entire artifact is
            a set of buttons that appear to do nothing to a screen-reader user. */}
        <p className={styles.visuallyHidden} aria-live="polite">
          {settled
            ? active.resolvedBy
              ? `${active.label}: resolved on rung ${
                  RUNGS.findIndex((r) => r.id === active.resolvedBy) + 1
                } of 4, ${resolvedRung?.name}. This line bills ${active.billed}.`
              : `${active.label}: all four rungs checked, none applied. ${count(
                  active.calls
                )} billable calls priced at zero.`
            : "resolving"}
        </p>

        <p className={`${styles.chainNote} type-body-4 text-muted`}>{active.note}</p>

        {/* The census. One case is an anecdote; the partition is the claim. Every
            pair in the data lands on exactly one rung, which is also the only
            honest way to show that rung four is never taken here. */}
        <div className={styles.census} data-rule>
          <p className="type-eyebrow-3 text-faint">
            {`Where all ${count(CENSUS_TOTAL_PAIRS)} pairs land`}
          </p>
          <dl className={styles.censusList}>
            {CHAIN_CENSUS.map((c) => (
              <div key={c.rung} className={styles.censusRow}>
                <dt className="type-body-4 text-secondary">
                  {c.rung === "unresolved"
                    ? "fell through"
                    : `rung ${RUNGS.findIndex((r) => r.id === c.rung) + 1} \u00b7 ${
                        RUNGS.find((r) => r.id === c.rung)?.name
                      }`}
                </dt>
                <dd
                  className="type-figure-3"
                  data-sig={c.rung === "unresolved" ? "loss" : c.pairs === 0 ? "absent" : "settled"}
                >
                  {c.pairs === 0
                    ? "never taken"
                    : `${count(c.pairs)} ${c.pairs === 1 ? "pair" : "pairs"}`}
                </dd>
              </div>
            ))}
          </dl>
          <p className={`${styles.censusNote} type-body-4 text-muted`}>
            Fourteen pairs carry no rate, and thirteen of them fall through. The
            fourteenth is a bundle member, so a rung above answers first. A pair
            with no rate is not automatically a leak, and that one row is the
            difference between an audit and a list of complaints.
          </p>
        </div>
      </div>
    </Artifact>
  );
}
