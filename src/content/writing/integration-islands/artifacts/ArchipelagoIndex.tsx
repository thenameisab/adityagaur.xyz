"use client";

import { useState } from "react";
import Fingerprint from "@/components/artifacts/Fingerprint";
import Status from "@/components/artifacts/Status";
import styles from "./ArchipelagoIndex.module.css";

/**
 * The ARCHIPELAGO Index — the article's self-assessment framework, made operable.
 *
 * Ported from the standalone `archipelago-index.html` companion so the tool lives
 * inside the piece it belongs to. The seven dimensions, the 1–5 anchors, and the
 * four bands are the article's own; nothing here is invented.
 *
 * Every dimension is a radiogroup, so the whole thing is keyboard-operable and a
 * screen reader announces the current score per dimension rather than a bare
 * number. Scores start unset: a default of 1 would flatter, and a default of 3
 * would put a number in the reader's mouth.
 */

const DIMENSIONS = [
  {
    name: "Surface area",
    desc: "How many core systems you run, and how much they overlap.",
    good: "A handful, little overlap",
    fire: "Dozens, many holding the same entities",
  },
  {
    name: "Integration approach",
    desc: "How your systems are actually wired together.",
    good: "One observable layer you control",
    fire: "Brittle point-to-point scripts nobody owns",
  },
  {
    name: "Systems of record",
    desc: "How clearly each domain's source of truth is defined.",
    good: "One explicit, agreed record per domain",
    fire: "No one can say what's authoritative",
  },
  {
    name: "Workflow entanglement",
    desc: "Where your critical business logic actually lives.",
    good: "In a neutral layer you own",
    fire: "Trapped in vendor-specific automations",
  },
  {
    name: "Exit friction",
    desc: "How hard it would be to leave a core tool.",
    good: "A project, not a re-org",
    fire: "Leaving any core tool feels impossible",
  },
  {
    name: "AI context coherence",
    desc: "How coherent a view your AI and agents can get.",
    good: "Agents read a shared, defined model",
    fire: "Each assistant sees one island, guesses the rest",
  },
  {
    name: "Governance & semantics",
    desc: "How centralized your access, lineage, and definitions are.",
    good: "Centralized and clear",
    fire: "Scattered and informal",
  },
] as const;

const BANDS = [
  {
    max: 14,
    name: "Mostly Connected Mainland",
    desc: "Your systems behave like one place. The job is to keep it that way as you grow.",
  },
  {
    max: 21,
    name: "Managed Archipelago",
    desc: "Islands exist, but you're holding them together deliberately. Watch the seams.",
  },
  {
    max: 28,
    name: "Growing Archipelago",
    desc: "Fragmentation is outpacing your bridges. AI projects will start hitting this wall.",
  },
  {
    max: 35,
    name: "Islands Everywhere",
    desc: "Your understanding of the company is scattered. Agents can only guess at the rest.",
  },
] as const;

const MIN = DIMENSIONS.length; // 7
const MAX = DIMENSIONS.length * 5; // 35

export default function ArchipelagoIndex() {
  const [scores, setScores] = useState<(number | null)[]>(
    Array(DIMENSIONS.length).fill(null),
  );

  const answered = scores.filter((s): s is number => s !== null);
  const complete = answered.length === DIMENSIONS.length;
  const total = answered.reduce((a, b) => a + b, 0);

  // Only band a complete set. A partial total would read as a verdict on a
  // half-answered questionnaire.
  const band = complete
    ? (BANDS.find((b) => total <= b.max) ?? BANDS[BANDS.length - 1])
    : null;

  const fill = complete ? ((total - MIN) / (MAX - MIN)) * 100 : 0;

  function set(dim: number, value: number) {
    setScores((prev) => prev.map((s, i) => (i === dim ? value : s)));
  }

  return (
    <div className={styles.root}>
      <div className={styles.dims}>
        {DIMENSIONS.map((dim, i) => {
          const value = scores[i];
          return (
            <div key={dim.name} className={styles.dim}>
              <div>
                <p className="type-body-3">
                  <span className={`${styles.dimNum} type-caption-1`}>
                    {i + 1}.{" "}
                  </span>
                  <span className={styles.dimName}>{dim.name}</span>
                </p>
                <p className={`${styles.dimDesc} type-body-4`}>{dim.desc}</p>
                <div className={styles.anchors}>
                  <span
                    className={`${styles.anchor} type-body-4`}
                    data-active={value !== null && value <= 2}
                  >
                    1 · {dim.good}
                  </span>
                  <span
                    className={`${styles.anchor} type-body-4`}
                    data-active={value !== null && value >= 4}
                  >
                    5 · {dim.fire}
                  </span>
                </div>
              </div>

              <div
                className={styles.scale}
                role="radiogroup"
                aria-label={`${dim.name} — 1 is in good shape, 5 is on fire`}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={value === n}
                    className={`${styles.notch} type-body-3`}
                    onClick={() => set(i, n)}
                    data-step={n}
                    data-slip-hover
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.result} aria-live="polite">
        <div className={styles.totalRow}>
          <p className="type-headline-2">
            <span className={styles.total}>{complete ? total : "—"}</span>
            <span className={`${styles.totalOf} type-body-3`}>
              {" "}
              / {MAX}
            </span>
          </p>
          {/* Unscored is genuinely "absent, unknown" — the one state the plate
              vocabulary has a dashed mark for. A band would be a verdict on a
              half-answered questionnaire, so until all seven are in, this says
              so in the same language every other plate uses. */}
          {band ? (
            <p className={`${styles.band} type-eyebrow-2`}>
              {/* The verdict, marked. `key` on the band name means a reader who
                  changes a score and lands in a different band sees the new one
                  drawn rather than swapped — the band changes rarely enough that
                  re-drawing it is a moment rather than a flicker. */}
              <span key={band.name} data-mark data-mark-in>
                {band.name}
              </span>
            </p>
          ) : (
            <Status tone="void">
              {`${answered.length} of ${DIMENSIONS.length} scored`}
            </Status>
          )}
        </div>

        {/* The seven dimensions, one cell each — the profile the total hides.
            This is the artifact's own argument made visible: "the total matters
            less than the dimensions where you and your colleagues disagree" is
            a claim about SHAPE, and a single number cannot carry a shape. Seven
            cells rather than sixteen because there are seven dimensions; the
            1–5 anchors quantise onto the printable levels without loss.

            Only once every dimension is scored. A partial strip would imply the
            unscored dimensions had scored zero. */}
        {complete ? (
          <Fingerprint
            cells={scores.map((s) => ((s ?? 1) - 1) / 4)}
            alt={DIMENSIONS.map(
              (d, i) => `${d.name}: ${scores[i]} of 5`,
            ).join(". ")}
            legend="One cell per dimension, in the order above"
          />
        ) : null}

        <div className={styles.sea}>
          <div className={styles.water} style={{ inlineSize: `${fill}%` }} />
        </div>
        <div className={`${styles.ticks} type-body-4`}>
          <span>7 · mainland</span>
          <span>35 · islands everywhere</span>
        </div>

        <p className={`${styles.bandDesc} type-body-3`}>
          {band
            ? band.desc
            : "Score all seven to get a band. The number matters less than where you and your colleagues disagree."}
        </p>

        {complete ? (
          <button
            type="button"
            className={`${styles.reset} type-body-4`}
            onClick={() => setScores(Array(DIMENSIONS.length).fill(null))}
          >
            Score it again
          </button>
        ) : null}

        <p className={`${styles.caveat} type-body-4`}>
          An original framework for this piece, not a benchmarked external metric.
        </p>
      </div>
    </div>
  );
}
