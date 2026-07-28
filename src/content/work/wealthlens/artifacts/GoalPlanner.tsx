"use client";

import { useMemo, useState } from "react";
import styles from "./GoalPlanner.module.css";

/**
 * The goal planner, ported — plus the one feature the app promised and
 * never wired up.
 *
 * `sip`, the inflation grossing, the three strategy rates and the two cost
 * framings are carried over from `calculations.ts` and the goal-planner page
 * unchanged. The uncertainty band is new: WealthLens ships a "volatility bands"
 * toggle that nothing consumes, so this artifact implements what the toggle
 * said it would do — the same projection at rate − 4% and rate + 4% — and lets
 * the reader see the honest chart next to the confident one.
 */

/** PMT = FV / ([((1+r)^n − 1) / r] × (1+r)) — annuity-due, monthly compounding. */
function sip(target: number, annualRate: number, years: number, inflation: number) {
  const adjustedTarget = target * Math.pow(1 + inflation / 100, years);
  const r = annualRate / 100 / 12;
  const n = years * 12;
  const factor = (Math.pow(1 + r, n) - 1) / r;
  return { adjustedTarget, monthly: adjustedTarget / (factor * (1 + r)) };
}

/** Corpus over time for a fixed monthly contribution — the app's own loop. */
function trajectory(monthly: number, annualRate: number, years: number): number[] {
  const r = annualRate / 100 / 12;
  let corpus = 0;
  const points = [0];
  for (let year = 1; year <= years; year += 1) {
    for (let m = 0; m < 12; m += 1) corpus = (corpus + monthly) * (1 + r);
    points.push(corpus);
  }
  return points;
}

const STRATEGIES = [
  { label: "Conservative", rate: 8.5 },
  { label: "Balanced", rate: 11.0 },
  { label: "Aggressive", rate: 14.5 },
] as const;

const BAND = 4; // the spec's ± band, in percentage points

function inr(n: number): string {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

const W = 640;
const H = 220;
const PAD = { top: 14, right: 12, bottom: 22, left: 12 };

function path(points: number[], max: number): string {
  const ix = (i: number) =>
    PAD.left + (i / (points.length - 1)) * (W - PAD.left - PAD.right);
  const iy = (v: number) =>
    H - PAD.bottom - (v / max) * (H - PAD.top - PAD.bottom);
  return points.map((v, i) => `${i === 0 ? "M" : "L"}${ix(i).toFixed(1)} ${iy(v).toFixed(1)}`).join(" ");
}

function area(low: number[], high: number[], max: number): string {
  const ix = (i: number) =>
    PAD.left + (i / (low.length - 1)) * (W - PAD.left - PAD.right);
  const iy = (v: number) =>
    H - PAD.bottom - (v / max) * (H - PAD.top - PAD.bottom);
  const up = high.map((v, i) => `${i === 0 ? "M" : "L"}${ix(i).toFixed(1)} ${iy(v).toFixed(1)}`).join(" ");
  const down = [...low]
    .reverse()
    .map((v, i) => `L${ix(low.length - 1 - i).toFixed(1)} ${iy(v).toFixed(1)}`)
    .join(" ");
  return `${up} ${down} Z`;
}

export default function GoalPlanner() {
  const [target, setTarget] = useState(10_000_000); // ₹1 Cr
  const [years, setYears] = useState(15);
  const [inflation, setInflation] = useState(6);
  const [strategy, setStrategy] = useState(1);
  const [banded, setBanded] = useState(true);

  const { rate, label } = STRATEGIES[strategy];

  const result = useMemo(() => {
    const { adjustedTarget, monthly } = sip(target, rate, years, inflation);
    const noInflation = sip(target, rate, years, 0).monthly;
    const later = sip(target, rate, Math.max(years - 2, 1), inflation).monthly;
    const mid = trajectory(monthly, rate, years);
    const low = trajectory(monthly, rate - BAND, years);
    const high = trajectory(monthly, rate + BAND, years);
    return {
      adjustedTarget,
      monthly,
      inflationCost: monthly - noInflation,
      delayCost: later - monthly,
      mid,
      low,
      high,
      lowEnd: low[low.length - 1],
      highEnd: high[high.length - 1],
    };
  }, [target, rate, years, inflation]);

  const max = Math.max(result.highEnd, result.adjustedTarget) * 1.05;

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        <div className={styles.field}>
          <label className={`${styles.label} type-body-4`} htmlFor="gp-target">
            Target, in today&apos;s money
            <span className={styles.readout}>{inr(target)}</span>
          </label>
          <input
            id="gp-target"
            className={styles.range}
            type="range"
            min={1_000_000}
            max={50_000_000}
            step={1_000_000}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
          />
        </div>

        <div className={styles.field}>
          <label className={`${styles.label} type-body-4`} htmlFor="gp-years">
            Horizon
            <span className={styles.readout}>{years}y</span>
          </label>
          <input
            id="gp-years"
            className={styles.range}
            type="range"
            min={3}
            max={40}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
          />
        </div>

        <div className={styles.field}>
          <label className={`${styles.label} type-body-4`} htmlFor="gp-inflation">
            Lifestyle inflation
            <span className={styles.readout}>{inflation}%</span>
          </label>
          <input
            id="gp-inflation"
            className={styles.range}
            type="range"
            min={0}
            max={12}
            step={0.5}
            value={inflation}
            onChange={(e) => setInflation(Number(e.target.value))}
          />
        </div>

        <div className={styles.strategies} role="group" aria-label="Strategy">
          {STRATEGIES.map((s, i) => (
            <button
              key={s.label}
              type="button"
              className={`${styles.strategy} type-body-4`}
              aria-pressed={i === strategy}
              onClick={() => setStrategy(i)}
            >
              {s.label} <span className={styles.strategyRate}>{s.rate}%</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`${styles.bandToggle} type-body-4`}
          aria-pressed={banded}
          onClick={() => setBanded((v) => !v)}
        >
          Volatility band — the toggle, wired up
        </button>
      </div>

      <div className={styles.output}>
        <div className={styles.answers}>
          <div className={styles.answer}>
            <span className={`${styles.answerValue} type-headline-3`}>
              {inr(result.monthly)}
            </span>
            <span className={`${styles.answerLabel} type-body-4`}>
              a month, every month, for {years} years
            </span>
          </div>
          <dl className={styles.costs}>
            <div className={styles.cost}>
              <dt className={`${styles.costKey} type-body-4`}>
                {inr(target)} then is {inr(result.adjustedTarget)} in {years} years
              </dt>
              <dd className={`${styles.costValue} type-body-4`}>
                inflation adds {inr(result.inflationCost)}/mo
              </dd>
            </div>
            <div className={styles.cost}>
              <dt className={`${styles.costKey} type-body-4`}>
                Starting two years later
              </dt>
              <dd className={`${styles.costValue} type-body-4`}>
                costs {inr(result.delayCost)}/mo more
              </dd>
            </div>
          </dl>
        </div>

        <svg
          className={styles.chart}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={
            banded
              ? `Projected corpus over ${years} years at ${label} assumptions. The ${rate}% path reaches the target; at ${rate - BAND}% the same contributions reach ${inr(result.lowEnd)}, at ${rate + BAND}% they reach ${inr(result.highEnd)}.`
              : `A single projected line reaching the target at exactly ${rate}%.`
          }
        >
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={H - PAD.bottom - (result.adjustedTarget / max) * (H - PAD.top - PAD.bottom)}
            y2={H - PAD.bottom - (result.adjustedTarget / max) * (H - PAD.top - PAD.bottom)}
            className={styles.targetLine}
          />
          {banded ? (
            <path d={area(result.low, result.high, max)} className={styles.band} />
          ) : null}
          <path d={path(result.mid, max)} className={styles.mid} />
          {banded ? (
            <>
              <path d={path(result.low, max)} className={styles.edge} />
              <path d={path(result.high, max)} className={styles.edge} />
            </>
          ) : null}
          <text
            x={W - PAD.right}
            y={H - PAD.bottom - (result.adjustedTarget / max) * (H - PAD.top - PAD.bottom) - 5}
            textAnchor="end"
            className={styles.targetLabel}
          >
            target {inr(result.adjustedTarget)}
          </text>
        </svg>

        <p className={`${styles.reading} type-body-4`} aria-live="polite">
          {banded ? (
            <>
              The same {inr(result.monthly)} a month lands anywhere between{" "}
              <strong>{inr(result.lowEnd)}</strong> and{" "}
              <strong>{inr(result.highEnd)}</strong> if returns run {BAND} points
              either side of the {rate}% assumption. The plan only works at the
              exact rate you assumed — which is the sentence the single line
              never says.
            </>
          ) : (
            <>
              One line, hitting the target to the rupee. This is what WealthLens
              actually renders: the certainty is an artifact of assuming {rate}%
              holds for {years} straight years.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
