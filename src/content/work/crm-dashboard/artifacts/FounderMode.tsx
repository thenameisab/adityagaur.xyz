"use client";

import { useMemo, useState } from "react";
import styles from "./FounderMode.module.css";

/**
 * Founder Mode's detectors, over a synthetic pipeline.
 *
 * The real payload builder walks every deal's Zoho timeline and derives seven
 * integrity signals. The four modelled here use its actual logic: a rupee
 * epsilon on amount changes so float noise isn't an audit finding; slippage
 * only counts from the second forward push; regressions are index-checked so
 * an unknown stage can't fake one; a zombie must be past the early stages with
 * no amount at all.
 *
 * Every deal is synthetic. Amounts are indexed, not rupees.
 */

type Deal = {
  name: string;
  stage: string;
  amount: number;
  /** [old, new] amount pairs, in timeline order. */
  amountHistory: [number, number][];
  /** Forward close-date pushes, as day counts. */
  closePushes: number[];
  stagePath: string[];
  ageDays: number;
};

const STAGES = [
  "Prospect",
  "Qualified",
  "Demo Done",
  "POC",
  "Proposal Sent",
  "Commercial Discussion",
  "Negotiation",
  "Infosec/Legal",
];

const LATE = new Set(["POC", "Proposal Sent", "Commercial Discussion", "Negotiation", "Infosec/Legal"]);
const EARLY = new Set(["Prospect", "Qualified", "Demo Done"]);

const DEALS: Deal[] = [
  { name: "Client A — platform", stage: "Negotiation", amount: 140, amountHistory: [[200, 140]], closePushes: [], stagePath: ["Qualified", "Demo Done", "POC", "Negotiation"], ageDays: 88 },
  { name: "Client B — verify", stage: "Infosec/Legal", amount: 95, amountHistory: [], closePushes: [], stagePath: ["Prospect", "Demo Done", "POC", "Infosec/Legal"], ageDays: 120 },
  { name: "Client C — payroll data", stage: "Commercial Discussion", amount: 60, amountHistory: [[60, 60]], closePushes: [21, 14, 30], stagePath: ["Qualified", "Demo Done", "Commercial Discussion"], ageDays: 150 },
  { name: "Client D — embedded", stage: "Demo Done", amount: 75, amountHistory: [], closePushes: [], stagePath: ["Qualified", "Demo Done", "Proposal Sent", "Demo Done"], ageDays: 96 },
  { name: "Client E — connectors", stage: "POC", amount: 0, amountHistory: [], closePushes: [], stagePath: ["Prospect", "Qualified", "POC"], ageDays: 74 },
  { name: "Client F — platform", stage: "Proposal Sent", amount: 180, amountHistory: [[150, 180]], closePushes: [7], stagePath: ["Qualified", "Demo Done", "Proposal Sent"], ageDays: 41 },
  { name: "Client G — verify", stage: "Negotiation", amount: 220, amountHistory: [], closePushes: [], stagePath: ["Prospect", "Demo Done", "POC", "Negotiation"], ageDays: 67 },
  { name: "Client H — sync", stage: "Commercial Discussion", amount: 45, amountHistory: [], closePushes: [10, 25], stagePath: ["Qualified", "Commercial Discussion", "Demo Done", "Commercial Discussion"], ageDays: 133 },
];

type DetectorId = "revisions" | "unvalidated" | "slippage" | "regression" | "zombie";

const DETECTORS: { id: DetectorId; label: string; blurb: string }[] = [
  { id: "revisions", label: "Amount revised", blurb: "The number moved — by more than the ₹1 epsilon — and someone should know when, and in which stage." },
  { id: "unvalidated", label: "Never validated", blurb: "Late-stage, carrying value, and the amount has never been touched. A number nobody has revised by legal is suspect, not stable." },
  { id: "slippage", label: "Repeated slippage", blurb: "Close date pushed forward at least twice. One reschedule is life; two is a pattern." },
  { id: "regression", label: "Stage regression", blurb: "The deal moved backward. All time, not a window — a regression six weeks ago still explains today's number." },
  { id: "zombie", label: "Zombie", blurb: "Past the early stages with no amount at all. Something is progressing that nobody has priced." },
];

function fire(deal: Deal, id: DetectorId): string | null {
  switch (id) {
    case "revisions": {
      const real = deal.amountHistory.filter(([o, n]) => Math.abs(o - n) > 1);
      if (!real.length) return null;
      const [o, n] = real[real.length - 1];
      const dir = n < o ? "down" : "up";
      return `amount ${dir} ${o} → ${n} (${Math.round(((n - o) / o) * 100)}%)`;
    }
    case "unvalidated": {
      const touched = deal.amountHistory.some(([o, n]) => Math.abs(o - n) > 1);
      if (LATE.has(deal.stage) && deal.amount > 0 && !touched)
        return `${deal.amount} indexed, never revised, already in ${deal.stage}`;
      return null;
    }
    case "slippage": {
      if (deal.closePushes.length < 2) return null;
      const total = deal.closePushes.reduce((a, b) => a + b, 0);
      return `close date pushed ${deal.closePushes.length}×, ${total} days total`;
    }
    case "regression": {
      for (let i = 1; i < deal.stagePath.length; i += 1) {
        const from = STAGES.indexOf(deal.stagePath[i - 1]);
        const to = STAGES.indexOf(deal.stagePath[i]);
        if (from >= 0 && to >= 0 && from > to)
          return `${deal.stagePath[i - 1]} → ${deal.stagePath[i]}, ${from - to} steps back`;
      }
      return null;
    }
    case "zombie": {
      if (!EARLY.has(deal.stage) && deal.amount === 0)
        return `no amount, ${deal.ageDays} days old, in ${deal.stage}`;
      return null;
    }
  }
}

export default function FounderMode() {
  const [active, setActive] = useState<Set<DetectorId>>(new Set(["revisions"]));

  function toggle(id: DetectorId) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const findings = useMemo(
    () =>
      DEALS.map((deal) => ({
        deal,
        hits: DETECTORS.filter((d) => active.has(d.id))
          .map((d) => ({ id: d.id, label: d.label, detail: fire(deal, d.id) }))
          .filter((h) => h.detail !== null),
      })),
    [active],
  );

  const flagged = findings.filter((f) => f.hits.length > 0);
  const totalPipeline = DEALS.reduce((a, d) => a + d.amount, 0);
  const unvalidatedTcv = DEALS.filter((d) => fire(d, "unvalidated")).reduce((a, d) => a + d.amount, 0);
  const revisedDown = DEALS.flatMap((d) => d.amountHistory)
    .filter(([o, n]) => n < o - 1)
    .reduce((a, [o, n]) => a + (o - n), 0);

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        <p className={`${styles.controlsHead} type-eyebrow-3`}>Detectors</p>
        <div className={styles.pills}>
          {DETECTORS.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`${styles.pill} type-body-4`}
              aria-pressed={active.has(d.id)}
              onClick={() => toggle(d.id)}
              title={d.blurb}
            >
              {d.label}
            </button>
          ))}
        </div>
        <p className={`${styles.blurb} type-body-4`}>
          {active.size
            ? DETECTORS.filter((d) => active.has(d.id))
                .map((d) => d.blurb)
                .join(" ")
            : "Everything off. The pipeline below is what the ordinary dashboard shows — and it looks fine."}
        </p>

        <dl className={styles.always}>
          <div className={styles.alwaysRow}>
            <dt className={`${styles.alwaysKey} type-body-4`}>Pipeline inflation</dt>
            <dd className={`${styles.alwaysValue} type-body-4`}>
              {Math.round((unvalidatedTcv / totalPipeline) * 100)}% of value is late-stage and never validated
            </dd>
          </div>
          <div className={styles.alwaysRow}>
            <dt className={`${styles.alwaysKey} type-body-4`}>Revised down, total</dt>
            <dd className={`${styles.alwaysValue} type-body-4`}>
              {revisedDown} indexed — the at-risk number
            </dd>
          </div>
        </dl>
      </div>

      <ol className={styles.deals} aria-live="polite">
        {findings.map(({ deal, hits }) => (
          <li key={deal.name} className={styles.deal} data-flagged={hits.length > 0 || undefined}>
            <div className={styles.dealHead}>
              <span className={`${styles.dealName} type-body-3`}>{deal.name}</span>
              <span className={`${styles.dealMeta} type-body-4`}>
                {deal.stage} · {deal.amount || "—"}
              </span>
            </div>
            {hits.length ? (
              <ul className={styles.hits}>
                {hits.map((h) => (
                  <li key={h.id} className={`${styles.hit} type-body-4`}>
                    <span className={styles.hitLabel}>{h.label}</span> — {h.detail}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ol>

      <p className={`${styles.tally} type-body-4`}>
        {flagged.length} of {DEALS.length} deals flagged by the active detectors.
      </p>
    </div>
  );
}
