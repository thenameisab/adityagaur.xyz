"use client";

import { useState } from "react";
import styles from "./M17Toggle.module.css";

/**
 * One payload, two viewers — and one field absent from both.
 *
 * The dashboard's privacy boundary is a whitelist projection applied at the
 * worker: leadership gets every engineer's aggregates; an engineer gets their
 * own row plus a cosmetic view of teammates. Per-engineer cycle and lead time
 * exist for nobody, because the producer never computes them — that's M-17
 * enforced in the data layer rather than the UI.
 *
 * Names and numbers here are synthetic. The field structure is the real one.
 */

type Viewer = "leadership" | "engineer";

const ENGINEERS = [
  { name: "R. Iyer", done: 14, blocked: 0, bugs: 1, tput: 4.1 },
  { name: "S. Bhat", done: 11, blocked: 2, bugs: 3, tput: 3.2 },
  { name: "You", done: 9, blocked: 1, bugs: 0, tput: 2.8 },
  { name: "M. Rao", done: 7, blocked: 0, bugs: 2, tput: 2.4 },
  { name: "T. Sen", done: 5, blocked: 3, bugs: 4, tput: 1.6 },
];

const TEAM = { cycleP50: "3.1d", cycleP90: "9.4d", leadP50: "5.7d", n: 46 };

export default function M17Toggle() {
  const [viewer, setViewer] = useState<Viewer>("leadership");
  const isLead = viewer === "leadership";

  return (
    <div className={styles.root}>
      <div className={styles.controls} role="group" aria-label="Viewer">
        <button
          type="button"
          className={`${styles.control} type-body-3`}
          aria-pressed={isLead}
          onClick={() => setViewer("leadership")}
        >
          Leadership sees
        </button>
        <button
          type="button"
          className={`${styles.control} type-body-3`}
          aria-pressed={!isLead}
          onClick={() => setViewer("engineer")}
        >
          An engineer sees
        </button>
      </div>

      <div className={styles.panes}>
        <div className={styles.pane}>
          <p className={`${styles.paneHead} type-eyebrow-3`}>
            Team aggregates — cycle and lead time
          </p>
          <dl className={styles.aggRow}>
            <div className={styles.agg}>
              <dd className={`${styles.aggValue} type-headline-4`}>{TEAM.cycleP50}</dd>
              <dt className={`${styles.aggKey} type-body-4`}>cycle p50</dt>
            </div>
            <div className={styles.agg}>
              <dd className={`${styles.aggValue} type-headline-4`}>{TEAM.cycleP90}</dd>
              <dt className={`${styles.aggKey} type-body-4`}>cycle p90</dt>
            </div>
            <div className={styles.agg}>
              <dd className={`${styles.aggValue} type-headline-4`}>{TEAM.leadP50}</dd>
              <dt className={`${styles.aggKey} type-body-4`}>lead p50</dt>
            </div>
            <div className={styles.agg}>
              <dd className={`${styles.aggValue} type-headline-4`}>{TEAM.n}</dd>
              <dt className={`${styles.aggKey} type-body-4`}>engineers, n</dt>
            </div>
          </dl>
          <p className={`${styles.paneNote} type-body-4`}>
            Both viewers get these. Aggregates answer the efficiency question
            without naming anyone.
          </p>
        </div>

        <div className={styles.pane}>
          <p className={`${styles.paneHead} type-eyebrow-3`}>
            Per-engineer rows{isLead ? "" : " — scoped to you"}
          </p>
          <table className={styles.table}>
            <thead>
              <tr className="type-body-4">
                <th>Engineer</th>
                <th>Done 30d</th>
                <th>Blocked</th>
                <th>Bugs</th>
                <th>Tput/wk</th>
                <th className={styles.banned}>Cycle time</th>
              </tr>
            </thead>
            <tbody>
              {ENGINEERS.map((e) => {
                const visible = isLead || e.name === "You";
                return (
                  <tr key={e.name} className="type-body-4" data-hidden={!visible || undefined}>
                    <td>{e.name}</td>
                    <td>{visible ? e.done : "—"}</td>
                    <td>{visible ? e.blocked : "—"}</td>
                    <td>{visible ? e.bugs : "—"}</td>
                    <td>{visible ? e.tput.toFixed(1) : "—"}</td>
                    <td className={styles.banned}>∅</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className={`${styles.paneNote} type-body-4`} aria-live="polite">
            {isLead ? (
              <>
                Leadership sees everyone&apos;s counts and load — the capacity
                question is policy-allowed. The last column is empty for them
                too: per-engineer cycle time is never computed, so there is
                nothing to show and nothing to demand.
              </>
            ) : (
              <>
                An engineer&apos;s payload is built by whitelist: their own row,
                plus a cosmetic card view of teammates with no work metrics on
                it. A field not on the whitelist never leaves the worker — a new
                leadership field can&apos;t silently leak.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
