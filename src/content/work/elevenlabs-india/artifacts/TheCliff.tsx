"use client";

import { QUOTES } from "../data/quotes";
import styles from "./TheCliff.module.css";

/**
 * The ₹2,500 cliff, drawn.
 *
 * One step chart: what a free user pays as their volume grows, under today's
 * ladder and under the proposal. Today the line runs along zero to 20,000
 * characters and then goes vertical — the only way to produce character
 * 20,001 is the ₹1,892 Creator plan. The proposal replaces the wall with a
 * slope that starts at ₹100. Static SVG; there is nothing to adjust because
 * the point is the shape.
 */

const W = 640;
const H = 300;
const PAD = { top: 24, right: 20, bottom: 36, left: 56 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

const MAX_CHARS = 120_000;
const MAX_INR = 2_100;
const FREE_LIMIT = 20_000;
const CREATOR_INR = 1_892;

const x = (chars: number) => PAD.left + (chars / MAX_CHARS) * PLOT_W;
const y = (inr: number) => PAD.top + (1 - inr / MAX_INR) * PLOT_H;

/** Proposed: ₹17.2 per 1,000 overage characters, band one of the meter. */
const proposedInr = (chars: number) =>
  chars <= FREE_LIMIT ? 0 : ((chars - FREE_LIMIT) / 1_000) * 17.2;

export default function TheCliff() {
  const cliffQuotes = QUOTES.filter(
    (q) => q.theme === "pricing" || q.theme === "churn",
  ).slice(0, 3);

  // Proposed curve is linear here, so two points suffice.
  const proposedPath = `M ${x(0)} ${y(0)} L ${x(FREE_LIMIT)} ${y(0)} L ${x(MAX_CHARS)} ${y(proposedInr(MAX_CHARS))}`;

  return (
    <div className={styles.root}>
      <svg
        className={styles.chart}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Monthly cost in rupees against characters produced. Today's ladder is free to twenty thousand characters, then a vertical wall at ₹1,892 — the Creator plan. The proposed meter replaces the wall with a slope: about ₹17 per further thousand characters."
      >
        {[0, 500, 1_000, 1_500, 2_000].map((v) => (
          <g key={v}>
            <line className={styles.grid} x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} />
            <text className={styles.tick} x={PAD.left - 6} y={y(v) + 3} textAnchor="end">
              ₹{v.toLocaleString("en-IN")}
            </text>
          </g>
        ))}
        {[0, 40_000, 80_000, 120_000].map((v) => (
          <text key={v} className={styles.tick} x={x(v)} y={H - PAD.bottom + 16} textAnchor="middle">
            {v === 0 ? "0" : `${v / 1_000}k`}
          </text>
        ))}
        <line className={styles.axis} x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom} />

        {/* Today: zero, then the wall. */}
        <path
          className={styles.today}
          d={`M ${x(0)} ${y(0)} L ${x(FREE_LIMIT)} ${y(0)}`}
        />
        <line
          className={styles.wall}
          x1={x(FREE_LIMIT)}
          x2={x(FREE_LIMIT)}
          y1={y(0)}
          y2={y(CREATOR_INR)}
        />
        <path
          className={styles.today}
          d={`M ${x(FREE_LIMIT)} ${y(CREATOR_INR)} L ${x(MAX_CHARS)} ${y(CREATOR_INR)}`}
        />
        <text className={styles.wallLabel} x={x(FREE_LIMIT) + 6} y={y(CREATOR_INR / 2)}>
          the wall: ₹1,892 or stop
        </text>

        {/* Proposed: the slope. */}
        <path className={styles.proposed} d={proposedPath} />
        <text
          className={styles.slopeLabel}
          x={x(88_000)}
          y={y(proposedInr(96_000)) - 8}
        >
          the meter: ₹100 buys 5,000 more
        </text>
      </svg>

      <div className={styles.quotes}>
        {cliffQuotes.map((q) => (
          <blockquote key={q.text} className={styles.quote}>
            <p className="type-body-3">&ldquo;{q.text}&rdquo;</p>
            <footer className={`${styles.who} type-body-4`}>— {q.who}</footer>
          </blockquote>
        ))}
      </div>
    </div>
  );
}
