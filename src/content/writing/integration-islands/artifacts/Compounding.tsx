"use client";

import { useMemo, useState } from "react";
import styles from "./Compounding.module.css";

/**
 * Compounding error across an agent's chain of steps.
 *
 * The article's arithmetic, made adjustable: 0.95²⁰ ≈ 0.36. The reader sets
 * per-step reliability and chain length and watches end-to-end success collapse.
 * Nothing is modelled or estimated here — it is p^n, which is why the artifact
 * can be trusted at any setting the reader picks.
 *
 * The chart is hand-authored SVG on a fixed 640×260 viewBox, scaled by CSS.
 */

const W = 640;
const H = 260;
const PAD = { top: 16, right: 20, bottom: 40, left: 44 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const MAX_STEPS = 20;

const x = (step: number) => PAD.left + ((step - 1) / (MAX_STEPS - 1)) * PLOT_W;
const y = (rate: number) => PAD.top + (1 - rate) * PLOT_H;

export default function Compounding() {
  const [perStep, setPerStep] = useState(95);
  const [steps, setSteps] = useState(20);

  const p = perStep / 100;
  const endToEnd = useMemo(() => Math.pow(p, steps), [p, steps]);

  const path = useMemo(() => {
    const pts: string[] = [];
    for (let n = 1; n <= MAX_STEPS; n++) {
      pts.push(`${n === 1 ? "M" : "L"} ${x(n).toFixed(1)} ${y(Math.pow(p, n)).toFixed(1)}`);
    }
    return pts.join(" ");
  }, [p]);

  /* The same curve, closed along the baseline, so the area under it can be
     screened. Reused rather than recomputed: the area IS the curve plus two
     corners, and deriving it any other way would let the two disagree. */
  const area = useMemo(
    () => `${path} L ${x(MAX_STEPS).toFixed(1)} ${y(0).toFixed(1)} L ${x(1).toFixed(1)} ${y(0).toFixed(1)} Z`,
    [path],
  );

  const pct = (v: number) => `${Math.round(v * 100)}%`;
  const failures = Math.round((1 - endToEnd) * 100);

  return (
    <div className={styles.root}>
      <div className={styles.controls} data-ramp>
        <div className={styles.field}>
          <label className={`${styles.label} type-body-3`} htmlFor="cmp-reliability">
            <span>Reliability per step</span>
            <span className={styles.value}>{perStep}%</span>
          </label>
          <input
            id="cmp-reliability"
            className={styles.range}
            type="range"
            min={50}
            max={100}
            step={1}
            value={perStep}
            onChange={(e) => setPerStep(Number(e.target.value))}
          />
        </div>
        <div className={styles.field}>
          <label className={`${styles.label} type-body-3`} htmlFor="cmp-steps">
            <span>Steps in the workflow</span>
            <span className={styles.value}>{steps}</span>
          </label>
          <input
            id="cmp-steps"
            className={styles.range}
            type="range"
            min={1}
            max={MAX_STEPS}
            step={1}
            value={steps}
            onChange={(e) => setSteps(Number(e.target.value))}
          />
        </div>
      </div>

      <div className={styles.chartWrap}>
        <svg
          className={styles.chart}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`At ${perStep} percent reliability per step, a ${steps}-step workflow succeeds end to end ${pct(endToEnd)} of the time.`}
        >
          {/* ── The screened area ──
              A riso has no gradient, so the fade under this curve is a real
              halftone: a 6px dot pitch in drum A, masked so coverage falls away
              toward the baseline. It is the same mechanism as [data-ramp] in
              globals.css §14, expressed in SVG because the shape it has to follow
              is the curve rather than a box.

              It is also the honest reading of the number. Everything under the
              curve is the fraction of runs that still work, and ink density is
              exactly how a print says "less of this". */}
          <defs>
            <pattern
              id="cmp-screen"
              width={6}
              height={6}
              patternUnits="userSpaceOnUse"
            >
              <circle className={styles.dot} cx={3} cy={3} r={1.15} />
            </pattern>
            <linearGradient id="cmp-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0.15" />
            </linearGradient>
            <mask id="cmp-mask">
              <rect
                x={PAD.left}
                y={PAD.top}
                width={PLOT_W}
                height={PLOT_H}
                fill="url(#cmp-fade)"
              />
            </mask>
          </defs>

          <path
            className={styles.area}
            d={area}
            fill="url(#cmp-screen)"
            mask="url(#cmp-mask)"
          />

          {[0, 0.25, 0.5, 0.75, 1].map((g) => (
            <g key={g}>
              <line
                className={styles.grid}
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(g)}
                y2={y(g)}
              />
              <text className={styles.tick} x={PAD.left - 8} y={y(g) + 3} textAnchor="end">
                {Math.round(g * 100)}
              </text>
            </g>
          ))}

          <line
            className={styles.axis}
            x1={PAD.left}
            x2={PAD.left}
            y1={PAD.top}
            y2={H - PAD.bottom}
          />

          {[1, 5, 10, 15, 20].map((n) => (
            <text key={n} className={styles.tick} x={x(n)} y={H - PAD.bottom + 16} textAnchor="middle">
              {n}
            </text>
          ))}

          <text
            className={styles.axisLabel}
            x={PAD.left + PLOT_W / 2}
            y={H - 6}
            textAnchor="middle"
          >
            Steps in the workflow
          </text>

          <path className={styles.curve} d={path} />

          <line
            className={styles.markerLine}
            x1={x(steps)}
            x2={x(steps)}
            y1={y(endToEnd)}
            y2={H - PAD.bottom}
          />
          {/* A square register mark rather than a dot — the reader's position is
              drum B landing on the curve, and everything printed on this plate is
              cut rather than rounded. */}
          <rect
            className={styles.marker}
            x={x(steps) - 4}
            y={y(endToEnd) - 4}
            width={8}
            height={8}
          />
        </svg>
      </div>

      <div className={styles.readout} aria-live="polite">
        <p>
          {/* The one figure the article is actually about gets the marker swipe.
              Deliberately NOT re-drawn per value: this number changes on every
              tick of a slider drag, and a swipe that restarts its wipe on each
              tick flickers. It draws once as the plate enters and then holds while
              the figure inside it moves. Key type on orange, 6.45:1. */}
          <span className={`${styles.statValue} type-headline-2`}>
            <span data-mark>{pct(endToEnd)}</span>
          </span>
          <span className={`${styles.statLabel} type-body-4`}>
            succeed end to end
          </span>
        </p>
        <p>
          <span className={`${styles.statValue} type-headline-2`}>
            {failures}
          </span>
          <span className={`${styles.statLabel} type-body-4`}>
            failures per 100 runs
          </span>
        </p>
        <p>
          <span className={`${styles.statValue} type-headline-2`}>
            {perStep / 100}
            <span className="type-body-3">
              <sup>{steps}</sup>
            </span>
          </span>
          <span className={`${styles.statLabel} type-body-4`}>
            the whole calculation
          </span>
        </p>
      </div>

      <p className={`${styles.note} type-body-3`}>
        {perStep === 95 && steps === 20
          ? "The article's figures. Excellent per-step reliability, and a coin flip you would lose across a real workflow."
          : perStep >= 99
            ? "Even at 99% per step, a twenty-step chain loses a fifth of its runs. Per-step reliability has to be extraordinary before chain length stops mattering."
            : "Per-step reliability is what vendors quote. End-to-end is what your operations team lives with."}
      </p>
    </div>
  );
}
