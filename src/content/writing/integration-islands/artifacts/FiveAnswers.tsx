"use client";

import { useState } from "react";
import styles from "./FiveAnswers.module.css";

/**
 * One question, five answers.
 *
 * The investor's question from section I, fanned out across the five systems that
 * each hold a piece of it. The counts and their bases are the ones the article
 * specifies. Selecting an island shows the definition of "customer" that produces
 * its number — which is the actual argument: none of them is wrong locally.
 */

const ISLANDS = [
  {
    name: "CRM",
    count: "1,310",
    basis: "Closed Won",
    definition:
      "An account whose most recent opportunity reached Closed Won. It has no idea whether that account is still paying — some of these churned months ago, and nothing in the sales pipeline records that.",
  },
  {
    name: "Billing",
    count: "1,042",
    basis: "currently paying",
    definition:
      "A subscription in an active, non-delinquent state this cycle. Precise about money and blind to everything else: it doesn't model segments or sales stages, so it can't answer the second half of the question.",
  },
  {
    name: "Data warehouse",
    count: "1,587",
    basis: "active usage",
    definition:
      "Any organisation with product events in the trailing window. Generous by construction — it counts trials, sandboxes, and free seats, because usage is what it was built to measure.",
  },
  {
    name: "Finance",
    count: "968",
    basis: "by legal entity",
    definition:
      "A billed counterparty grouped by legal entity and account code. The most defensible number in an audit and the least useful in a board meeting, because one customer can be several entities and several customers can be one.",
  },
  {
    name: "Support",
    count: "1,455",
    basis: "orgs with tickets",
    definition:
      "An organisation that has raised a ticket. It knows about people who behave like customers, including ones who never paid and ones who left but still email.",
  },
] as const;

/**
 * How much ink a card gets: the three tint steps, assigned from the counts
 * themselves rather than authored per island. Lowest count prints palest.
 *
 * Computed from the same array the numbers are read from, so the colour cannot
 * drift away from the data — if a count is ever corrected, its card re-tints.
 */
const COUNTS = ISLANDS.map((i) => Number(i.count.replace(/,/g, "")));
const LOW = Math.min(...COUNTS);
const SPAN = Math.max(...COUNTS) - LOW;

function weight(i: number): 1 | 2 | 3 {
  const t = (COUNTS[i] - LOW) / SPAN;
  return t < 1 / 3 ? 1 : t < 2 / 3 ? 2 : 3;
}

export default function FiveAnswers() {
  const [active, setActive] = useState<number | null>(null);
  const selected = active === null ? null : ISLANDS[active];

  return (
    <div className={styles.root}>
      <p className={styles.question}>
        <span className={`${styles.asker} type-stamp`}>Your investor asks</span>
        “How many active paying customers do we have, by segment, with full unit
        economics?”
      </p>

      <div className={styles.fan}>
        {ISLANDS.map((island, i) => (
          <button
            key={island.name}
            type="button"
            className={styles.island}
            aria-pressed={active === i}
            onClick={() => setActive(active === i ? null : i)}
            data-weight={weight(i)}
            data-slip-hover
          >
            <span className={`${styles.islandName} type-body-4`}>
              {island.name}
            </span>
            <span className={`${styles.count} type-headline-3`}>
              {island.count}
            </span>
            <span className={`${styles.basis} type-body-4`}>{island.basis}</span>
          </button>
        ))}
      </div>

      <div className={styles.detail} aria-live="polite">
        <span className={`${styles.detailKey} type-eyebrow-3`}>
          {selected ? `What ${selected.name} means by “customer”` : "Pick a system"}
        </span>
        <p className={`${styles.detailBody} type-body-3`}>
          {selected
            ? selected.definition
            : "Each of the five is internally consistent and locally correct. Select one to see the definition that produces its number."}
        </p>
      </div>

      <p className={`${styles.spread} type-body-3`}>
        <span>
          Spread <span className={styles.spreadValue}>619</span>
        </span>
        <span>
          Lowest to highest <span className={styles.spreadValue}>64%</span>
        </span>
        <span>
          {/* The punchline gets the marker. One swipe on the plate, on the one
              value that is the argument rather than a measurement — "none" is
              what the reader is supposed to leave with. */}
          Systems that agree{" "}
          <span className={styles.spreadValue} data-mark>
            none
          </span>
        </span>
      </p>
    </div>
  );
}
