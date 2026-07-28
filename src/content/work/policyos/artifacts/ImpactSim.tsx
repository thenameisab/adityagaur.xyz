"use client";

import { useMemo, useState } from "react";
import styles from "./ImpactSim.module.css";

/**
 * The impact simulator, ported.
 *
 * The prototype's `sim.js` re-runs a credit policy's thresholds over a fixed
 * 220-applicant test cohort and reports what a proposed change does to the
 * book: approval rate, projected NPA, and exactly who flips in each direction.
 * The engine here is the same eight lines of AND-ed guards.
 *
 * The cohort is regenerated synthetically from an integer hash — same
 * distribution shape (CIBIL, age, FOIR, default labels), none of the original
 * rows — and is identical on every render, because a page that shows different
 * numbers to different readers isn't evidence of anything.
 */

type Applicant = {
  id: string;
  cibil: number;
  age: number;
  foir: number;
  defaulted: boolean;
};

function hash(n: number): number {
  let h = (n + 0x6d2b79f5) >>> 0;
  h = Math.imul(h ^ (h >>> 15), h | 1) >>> 0;
  h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
  return (h ^ (h >>> 14)) >>> 0;
}

/** 220 applicants. Default probability rises as CIBIL falls — the ground-truth
    labels are what let the simulator project NPA rather than just volume. */
const COHORT: Applicant[] = Array.from({ length: 220 }, (_, i) => {
  const h = hash(i);
  const cibil = 600 + (h % 261); // 600–860
  const age = 21 + ((h >> 9) % 42); // 21–62
  const foir = 0.25 + (((h >> 17) % 46) / 100); // 0.25–0.70
  const defaultRisk = (860 - cibil) / 260; // higher when score is lower
  const defaulted = ((h >> 5) % 100) / 100 < defaultRisk * 0.28;
  return { id: `A-${String(i + 1).padStart(3, "0")}`, cibil, age, foir, defaulted };
});

type Params = { minCibil: number; minAge: number; maxAge: number; maxFoir: number };

/** The prototype's personal-loan baseline. */
const BASELINE: Params = { minCibil: 700, minAge: 23, maxAge: 58, maxFoir: 55 };

function pass(a: Applicant, p: Params): boolean {
  if (a.cibil < p.minCibil) return false;
  if (a.age < p.minAge || a.age > p.maxAge) return false;
  if (a.foir > p.maxFoir / 100) return false;
  return true;
}

function metrics(p: Params) {
  const approved = COHORT.filter((a) => pass(a, p));
  const npa = approved.length
    ? (approved.filter((a) => a.defaulted).length / approved.length) * 100
    : 0;
  return { approved, rate: (approved.length / COHORT.length) * 100, npa };
}

const BANDS = [
  { label: "600–679", min: 600, max: 679 },
  { label: "680–719", min: 680, max: 719 },
  { label: "720–759", min: 720, max: 759 },
  { label: "760–860", min: 760, max: 860 },
];

const KNOBS = [
  { key: "minCibil", label: "Minimum CIBIL", min: 600, max: 820, step: 10 },
  { key: "minAge", label: "Minimum age", min: 18, max: 35, step: 1 },
  { key: "maxAge", label: "Maximum age", min: 45, max: 70, step: 1 },
  { key: "maxFoir", label: "Max FOIR %", min: 30, max: 70, step: 5 },
] as const;

export default function ImpactSim() {
  const [params, setParams] = useState<Params>({ ...BASELINE });

  const base = useMemo(() => metrics(BASELINE), []);
  const next = useMemo(() => metrics(params), [params]);

  const { flipped, gained } = useMemo(() => {
    const before = new Set(base.approved.map((a) => a.id));
    const after = new Set(next.approved.map((a) => a.id));
    return {
      flipped: base.approved.filter((a) => !after.has(a.id)), // approved → rejected
      gained: next.approved.filter((a) => !before.has(a.id)), // rejected → approved
    };
  }, [base, next]);

  const dRate = next.rate - base.rate;
  const dNpa = next.npa - base.npa;
  const moved = flipped.length + gained.length;

  const bandCounts = (approved: Applicant[]) =>
    BANDS.map((b) => approved.filter((a) => a.cibil >= b.min && a.cibil <= b.max).length);
  const baseBands = bandCounts(base.approved);
  const nextBands = bandCounts(next.approved);
  const maxBand = Math.max(1, ...baseBands, ...nextBands);

  function delta(d: number, downIsGood: boolean) {
    if (Math.abs(d) < 0.05) return { text: "flat", tone: "flat" as const };
    const good = downIsGood ? d < 0 : d > 0;
    return {
      text: `${d > 0 ? "+" : ""}${d.toFixed(1)} pts`,
      tone: good ? ("good" as const) : ("bad" as const),
    };
  }

  const rateD = delta(dRate, false);
  const npaD = delta(dNpa, true);

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        {KNOBS.map((k) => (
          <div key={k.key} className={styles.field}>
            <label className={`${styles.label} type-body-4`} htmlFor={`sim-${k.key}`}>
              {k.label}
              <span className={styles.readout}>
                {params[k.key]}
                {params[k.key] !== BASELINE[k.key] ? (
                  <em className={styles.was}> was {BASELINE[k.key]}</em>
                ) : null}
              </span>
            </label>
            <input
              id={`sim-${k.key}`}
              className={styles.range}
              type="range"
              min={k.min}
              max={k.max}
              step={k.step}
              value={params[k.key]}
              onChange={(e) =>
                setParams((p) => ({ ...p, [k.key]: Number(e.target.value) }))
              }
            />
          </div>
        ))}
        <button
          type="button"
          className={`${styles.reset} type-body-4`}
          onClick={() => setParams({ ...BASELINE })}
        >
          Reset to the live policy
        </button>
      </div>

      <div className={styles.output}>
        <dl className={styles.metrics}>
          <div className={styles.metric}>
            <dt className={`${styles.metricKey} type-body-4`}>Approval rate</dt>
            <dd className={`${styles.metricValue} type-headline-4`}>
              {base.rate.toFixed(1)}% → {next.rate.toFixed(1)}%
              <span className={styles.pill} data-tone={rateD.tone}>
                {rateD.text}
              </span>
            </dd>
          </div>
          <div className={styles.metric}>
            <dt className={`${styles.metricKey} type-body-4`}>Projected NPA</dt>
            <dd className={`${styles.metricValue} type-headline-4`}>
              {base.npa.toFixed(1)}% → {next.npa.toFixed(1)}%
              <span className={styles.pill} data-tone={npaD.tone}>
                {npaD.text}
              </span>
            </dd>
          </div>
          <div className={styles.metric}>
            <dt className={`${styles.metricKey} type-body-4`}>Reclassified</dt>
            <dd className={`${styles.metricValue} type-headline-4`}>
              {moved}
              <span className={`${styles.flipDetail} type-body-4`}>
                {flipped.length} lose approval · {gained.length} gain it
              </span>
            </dd>
          </div>
        </dl>

        <div className={styles.bands}>
          <p className={`${styles.bandsHead} type-eyebrow-3`}>
            Approved, by CIBIL band
          </p>
          {BANDS.map((b, i) => (
            <div key={b.label} className={styles.band}>
              <span className={`${styles.bandLabel} type-body-4`}>{b.label}</span>
              <span className={styles.bandTrack}>
                <span
                  className={styles.bandBar}
                  style={{ inlineSize: `${(nextBands[i] / maxBand) * 100}%` }}
                />
              </span>
              <span className={`${styles.bandCount} type-body-4`}>
                {nextBands[i]}
                {nextBands[i] !== baseBands[i] ? (
                  <em className={styles.was}> was {baseBands[i]}</em>
                ) : null}
              </span>
            </div>
          ))}
        </div>

        <p className={`${styles.note} type-body-4`} aria-live="polite">
          {moved > 0 ? (
            <>
              In the prototype this is where <strong>Propose</strong> appears: the
              deltas above get written into a change request&apos;s rationale and the
              request lands in the approval queue at Pending&nbsp;L1. The button only
              exists when a change actually moves someone.
            </>
          ) : (
            <>
              No one flips at these settings, so the prototype shows no Propose
              button — a change request with no impact attached is noise in an
              approver&apos;s queue.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
