"use client";

import { useMemo, useState } from "react";
import { PLANS, INR_PER_USD, type PlanId } from "../data/pricing-today";
import { costTodayM, costProposedM, fmtUsd, fmtInr } from "../data/pricing";
import styles from "./PricingSimulator.module.css";

/**
 * Today's ladder against the proposed meter, priced live.
 *
 * The reader picks a plan and a monthly TTS volume; both ladders price it
 * through the same verified engine (data/pricing.ts — 504 golden cases in
 * `npm run verify`). Nothing here is modelled: today's curve is plan price
 * plus flat overage, the proposal's is plan price plus marginal bands, and
 * where today's ladder simply refuses to sell (Free and Starter have no
 * overage) the curve stops and says so, because that refusal is the finding.
 *
 * Hand-authored SVG on a fixed 640×280 viewBox, scaled by CSS.
 */

const W = 640;
const H = 280;
const PAD = { top: 18, right: 16, bottom: 34, left: 56 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const SAMPLES = 160;

/** Per-plan sweep ceilings — far enough past the allowance to show the shape. */
const MAX_CHARS: Record<string, number> = {
  free: 160_000,
  creator: 1_200_000,
  scale: 26_000_000,
};

const SIMULATABLE: PlanId[] = ["free", "creator", "scale"];

function fmtChars(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

export default function PricingSimulator() {
  const [plan, setPlan] = useState<PlanId>("free");
  const [charsPct, setCharsPct] = useState(20); // % of the plan's sweep

  const maxChars = MAX_CHARS[plan];
  const chars = Math.round((charsPct / 100) * maxChars);

  const { todayPath, todayStopX, proposedPath, yMax } = useMemo(() => {
    // The y scale tops out at the dearest cost either ladder reaches.
    let top = 0;
    const today: (number | null)[] = [];
    const proposed: number[] = [];
    for (let s = 0; s <= SAMPLES; s++) {
      const v = Math.round((s / SAMPLES) * maxChars);
      const t = costTodayM(plan, v);
      const p = costProposedM(plan, v) ?? 0;
      today.push(t);
      proposed.push(p);
      top = Math.max(top, t ?? 0, p);
    }
    top = Math.max(top, 1_000); // never a zero-height scale
    const x = (s: number) => PAD.left + (s / SAMPLES) * PLOT_W;
    const y = (m: number) => PAD.top + (1 - m / top) * PLOT_H;

    let tPath = "";
    let stopX: number | null = null;
    for (let s = 0; s <= SAMPLES; s++) {
      const t = today[s];
      if (t === null) {
        if (stopX === null) stopX = x(s);
        break;
      }
      tPath += `${tPath ? "L" : "M"} ${x(s).toFixed(1)} ${y(t).toFixed(1)} `;
    }
    let pPath = "";
    for (let s = 0; s <= SAMPLES; s++) {
      pPath += `${pPath ? "L" : "M"} ${x(s).toFixed(1)} ${y(proposed[s]).toFixed(1)} `;
    }
    return { todayPath: tPath, todayStopX: stopX, proposedPath: pPath, yMax: top };
  }, [plan, maxChars]);

  const x = PAD.left + (chars / maxChars) * PLOT_W;
  const yFor = (m: number | null) =>
    m === null ? null : PAD.top + (1 - m / yMax) * PLOT_H;

  const today = costTodayM(plan, chars);
  const proposed = costProposedM(plan, chars);
  const savingM = today !== null && proposed !== null ? today - proposed : null;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: PAD.top + (1 - f) * PLOT_H,
    label: fmtUsd(yMax * f),
  }));
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    x: PAD.left + f * PLOT_W,
    label: fmtChars(Math.round(maxChars * f)),
  }));

  return (
    <div className={styles.root}>
      <div className={styles.controls} data-ramp>
        <fieldset className={styles.planSet}>
          <legend className={`${styles.legend} type-body-4`}>Plan</legend>
          <div className={styles.planRow} role="radiogroup" aria-label="Plan">
            {SIMULATABLE.map((id) => {
              const p = PLANS.find((pl) => pl.id === id)!;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={plan === id}
                  className={`${styles.planBtn} type-body-3`}
                  data-active={plan === id || undefined}
                  onClick={() => {
                    setPlan(id);
                    setCharsPct(20);
                  }}
                >
                  {p.label}
                  <span className={styles.planPrice}>
                    {p.priceM === 0 ? "$0" : fmtUsd(p.priceM)}/mo
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className={styles.field}>
          <label className={`${styles.label} type-body-3`} htmlFor="sim-chars">
            <span>Characters this month</span>
            <span className={styles.value}>{chars.toLocaleString("en-IN")}</span>
          </label>
          <input
            id="sim-chars"
            className={styles.range}
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={charsPct}
            onChange={(e) => setCharsPct(Number(e.target.value))}
          />
        </div>
      </div>

      <div className={styles.chartWrap}>
        <svg
          className={styles.chart}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Monthly cost on the ${plan} plan at ${chars.toLocaleString()} characters: ${
            today === null ? "today the plan simply stops" : fmtUsd(today) + " today"
          }, ${proposed === null ? "" : fmtUsd(proposed) + " under the proposed meter"}`}
        >
          {yTicks.map((t) => (
            <g key={t.y}>
              <line className={styles.grid} x1={PAD.left} x2={W - PAD.right} y1={t.y} y2={t.y} />
              <text className={styles.tick} x={PAD.left - 6} y={t.y + 3} textAnchor="end">
                {t.label}
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text key={t.x} className={styles.tick} x={t.x} y={H - PAD.bottom + 16} textAnchor="middle">
              {t.label}
            </text>
          ))}
          <line className={styles.axis} x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom} />

          {/* Today's ladder, drum A. */}
          <path className={styles.curveToday} d={todayPath} />
          {/* Where today's ladder stops selling: the cliff, named on the chart. */}
          {todayStopX !== null ? (
            <g>
              <line
                className={styles.stopLine}
                x1={todayStopX}
                x2={todayStopX}
                y1={PAD.top}
                y2={H - PAD.bottom}
              />
              <text
                className={styles.stopLabel}
                x={todayStopX + 5}
                y={PAD.top + 12}
              >
                today: no way to buy more
              </text>
            </g>
          ) : null}

          {/* The proposal, loud. */}
          <path className={styles.curveProposed} d={proposedPath} />

          {/* The reader's position. */}
          <line className={styles.markerLine} x1={x} x2={x} y1={PAD.top} y2={H - PAD.bottom} />
          {yFor(proposed) !== null ? (
            <rect className={styles.markerProposed} x={x - 4} y={yFor(proposed)! - 4} width={8} height={8} />
          ) : null}
          {yFor(today) !== null ? (
            <rect className={styles.markerToday} x={x - 4} y={yFor(today)! - 4} width={8} height={8} />
          ) : null}
        </svg>

        <div className={styles.legendRow}>
          <span className={`${styles.key} type-body-4`}>
            <span className={styles.swatchToday} aria-hidden="true" /> Today&rsquo;s ladder
          </span>
          <span className={`${styles.key} type-body-4`}>
            <span className={styles.swatchProposed} aria-hidden="true" /> Proposed meter
          </span>
        </div>
      </div>

      <dl className={styles.readout} aria-live="polite">
        <div>
          <dd className={`${styles.statValue} type-headline-3`}>
            {today === null ? "—" : fmtUsd(today)}
          </dd>
          <dt className={`${styles.statLabel} type-body-4`}>
            {today === null
              ? "today: allowance spent, nothing to buy"
              : `today · ${fmtInr(today, INR_PER_USD)}`}
          </dt>
        </div>
        <div>
          <dd className={`${styles.statValue} type-headline-3`}>
            {proposed === null ? "—" : fmtUsd(proposed)}
          </dd>
          <dt className={`${styles.statLabel} type-body-4`}>
            {proposed === null ? "no meter on this plan" : `proposed · ${fmtInr(proposed, INR_PER_USD)}`}
          </dt>
        </div>
        <div>
          <dd className={`${styles.statValue} type-headline-3`}>
            {savingM === null
              ? "n/a"
              : savingM === 0
                ? "even"
                : `${savingM > 0 ? "−" : "+"}${fmtUsd(Math.abs(savingM))}`}
          </dd>
          <dt className={`${styles.statLabel} type-body-4`}>
            {savingM === null
              ? "today's ladder has no price here at all"
              : "proposed vs today"}
          </dt>
        </div>
      </dl>
    </div>
  );
}
