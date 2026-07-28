"use client";

import { useState } from "react";
import styles from "./ConfidentAnswer.module.css";

/**
 * The confident wrong answer.
 *
 * The assistant card from section I: authoritative at a glance, with a faint
 * footnote admitting it saw three of five systems. The card is deliberately
 * trustworthy-looking — the reader should have to go looking for the problem,
 * because that is the failure mode the section is describing.
 *
 * The reveal raises the footnote's contrast rather than adding a warning icon.
 * A warning would mean the reader never has the experience of missing it.
 */

const SEGMENTS = [
  { name: "SMB", value: "742", share: "58%" },
  { name: "Mid-Market", value: "398", share: "31%" },
  { name: "Enterprise", value: "144", share: "11%" },
] as const;

export default function ConfidentAnswer() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className={styles.root} data-revealed={revealed}>
      <div className={styles.card} data-ramp>
        <p className={`${styles.ask} type-body-3`}>
          How many active paying customers do we have, by segment, with full unit
          economics?
        </p>

        <p className={`${styles.headline} type-headline-1`}>
          1,284
          <span className={`${styles.delta} type-body-4`}>+12% QoQ</span>
        </p>

        <div className={styles.segments}>
          {SEGMENTS.map((s) => (
            <p key={s.name} className={`${styles.segment} type-body-3`}>
              <span>{s.name}</span>
              <span className={styles.segValue}>{s.value}</span>
              <span className={styles.segShare}>{s.share}</span>
            </p>
          ))}
        </div>

        {/* `key` is the trigger for the swipe: revealing remounts the node, the
            marker line draws itself left to right once, and nothing needs a timer
            or a transition class. Same mechanism as the slipped pass in
            globals.css §13. */}
        <p className={`${styles.footnote} type-body-4`}>
          {/* The swipe goes on an inline span, not on the paragraph: a marker
              covers the line of text it runs along, and `box-decoration-break:
              clone` only has fragments to work with if the box is inline. On a
              narrow plate this footnote wraps, and it wraps as two swipes. */}
          <span
            key={revealed ? "marked" : "quiet"}
            data-mark={revealed ? "" : undefined}
            data-mark-in={revealed ? "" : undefined}
          >
            Synthesized from CRM, Billing, Warehouse · 2 of 5 systems not
            connected
          </span>
        </p>
      </div>

      <div className={styles.controls}>
        {revealed ? null : (
          <button
            type="button"
            className={`${styles.button} type-body-4`}
            onClick={() => setRevealed(true)}
            data-slip-hover
          >
            What&rsquo;s wrong with this answer?
          </button>
        )}
        <p className={`${styles.verdict} type-body-3`} aria-live="polite">
          {revealed
            ? "It read Closed Won in the CRM as active, so it never saw the churn that only Billing knows about. Finance and Support were not connected at all. The footnote was always there."
            : "1,284 is not any of the five numbers. It is a plausible blend of three of them."}
        </p>
      </div>
    </div>
  );
}
