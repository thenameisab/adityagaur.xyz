"use client";

import { useState } from "react";
import { LEVERS, GROWTH_MODEL, type Lever } from "../data/levers";
import styles from "./LeverMap.module.css";

/**
 * The capstone's whole portfolio: the growth model's lever → revenue bars,
 * then every initiative the squad tracked, grouped by lever family.
 *
 * `mine` renders as a corner tick and the word "owned" — the page's one
 * attribution device. Cancelled initiatives keep their cards: three fully
 * specced plans were abandoned with no recorded reason, and hiding them
 * would delete the page's best process finding.
 */

const FAMILIES: { id: Lever["focus"]; label: string }[] = [
  { id: "acquisition", label: "Acquisition" },
  { id: "retention", label: "Engagement & retention" },
  { id: "monetization", label: "Monetization" },
  { id: "research", label: "Research foundation" },
];

const ICP_SHORT: Record<string, string> = {
  enterprise: "ENT",
  sme: "SME",
  creator: "CRE",
};

export default function LeverMap() {
  const [mineOnly, setMineOnly] = useState(false);
  const maxCr = Math.max(...GROWTH_MODEL.contributions.map((c) => c.cr));

  return (
    <div className={styles.root}>
      {/* ── The model's arithmetic ── */}
      <div className={styles.model}>
        <p className={`${styles.modelTitle} type-body-3`}>
          The growth model&rsquo;s target: ₹{GROWTH_MODEL.goal.fromCr} Cr →
          ₹{GROWTH_MODEL.goal.toCr} Cr ARR, and where the modelled ₹
          {GROWTH_MODEL.contributions
            .reduce((s, c) => s + c.cr, 0)
            .toFixed(2)
            .replace(/\.?0+$/, "")}{" "}
          Cr of growth was assigned
        </p>
        <div className={styles.bars}>
          {GROWTH_MODEL.contributions.map((c) => (
            <div key={c.label} className={styles.barRow}>
              <span className={`${styles.barLabel} type-body-4`}>{c.label}</span>
              <span className={styles.barTrack}>
                <span
                  className={styles.bar}
                  data-family={c.family}
                  style={{ inlineSize: `${(c.cr / maxCr) * 100}%` }}
                />
              </span>
              <span className={`${styles.barValue} type-body-4`}>₹{c.cr} Cr</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── The portfolio ── */}
      <div className={styles.portfolioHead}>
        <p className={`${styles.portfolioTitle} type-body-3`}>
          {LEVERS.length} tracked initiatives and workstreams
        </p>
        <button
          type="button"
          className={`${styles.mineToggle} type-body-4`}
          aria-pressed={mineOnly}
          data-active={mineOnly || undefined}
          onClick={() => setMineOnly(!mineOnly)}
        >
          {mineOnly ? "Showing mine" : "Show only mine"}
          <span className={styles.mineCount}>
            {LEVERS.filter((l) => l.mine).length}
          </span>
        </button>
      </div>

      {FAMILIES.map((fam) => {
        const items = LEVERS.filter((l) => l.focus === fam.id);
        return (
          <div key={fam.id} className={styles.family}>
            <h4 className={`${styles.familyLabel} type-eyebrow-3`}>{fam.label}</h4>
            <ul className={styles.grid}>
              {items.map((l) => (
                <li
                  key={l.name}
                  className={styles.card}
                  data-family={l.focus}
                  data-cancelled={l.status === "cancelled" || undefined}
                  data-dim={(mineOnly && !l.mine) || undefined}
                >
                  <div className={styles.cardTop}>
                    <span className={`${styles.cardName} type-body-3`}>{l.name}</span>
                    {l.mine ? (
                      <span className={`${styles.mine} type-body-4`}>owned</span>
                    ) : null}
                  </div>
                  <div className={styles.cardMeta}>
                    {l.status !== "defined" ? (
                      <span className={`${styles.status} type-body-4`} data-status={l.status}>
                        {l.status === "cancelled" ? "cancelled — no reason recorded" : "WIP"}
                      </span>
                    ) : null}
                    {l.icps.length > 0 ? (
                      <span className={`${styles.icps} type-body-4`}>
                        {l.icps.map((i) => ICP_SHORT[i]).join(" · ")}
                      </span>
                    ) : null}
                    {l.revenueCr !== null ? (
                      <span className={`${styles.rev} type-body-4`}>₹{l.revenueCr} Cr</span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
