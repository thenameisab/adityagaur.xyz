"use client";

import { useMemo, useState } from "react";
import { CALLS, type Call } from "../data/calls";
import styles from "./ResearchField.module.css";

/**
 * The research sprint as a field of marks — 69 contacts, one square each.
 *
 * Colour is the contact's ICP; a hollow square is a contact that never became
 * a completed call. The reader slices the field by any dimension and the
 * marks that fall outside the slice recede rather than vanish, so the
 * denominator stays visible — 69 is the claim, and it should stay countable.
 *
 * Every mark is anonymous by construction: the underlying dataset dropped
 * names, companies and roles before it entered the repo.
 */

type FilterKey = "all" | "icp" | "segment" | "userType" | "status";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Everyone" },
  { key: "icp", label: "By ICP" },
  { key: "segment", label: "B2B / B2C" },
  { key: "userType", label: "By seniority" },
  { key: "status", label: "Call happened?" },
];

const VALUE_LABELS: Record<string, string> = {
  enterprise: "Enterprise",
  sme: "SME & startup",
  agency: "Agency",
  creator: "Creator",
  b2b: "B2B",
  b2c: "B2C",
  "decision-maker": "Decision maker",
  influencer: "Influencer",
  user: "User",
  done: "Completed call",
  scheduled: "Scheduled",
  lead: "Lead only",
  null: "Not recorded",
};

/** Order within each dimension, so the legend is stable. */
const VALUE_ORDER: Record<Exclude<FilterKey, "all">, string[]> = {
  icp: ["enterprise", "sme", "agency", "creator", "null"],
  segment: ["b2b", "b2c", "null"],
  userType: ["decision-maker", "influencer", "user", "null"],
  status: ["done", "scheduled", "lead"],
};

export default function ResearchField() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [value, setValue] = useState<string | null>(null);

  const values = useMemo(() => {
    if (filter === "all") return [];
    const present = new Set(CALLS.map((c) => String(c[filter])));
    return VALUE_ORDER[filter].filter((v) => present.has(v));
  }, [filter]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    if (filter === "all") return m;
    for (const c of CALLS) {
      const k = String(c[filter]);
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  }, [filter]);

  const active = (c: Call) =>
    filter === "all" || value === null || String(c[filter]) === value;

  const activeCount = CALLS.filter(active).length;

  // The sprint timeline: calls per recorded day.
  const timeline = useMemo(() => {
    const days = new Map<string, number>();
    for (const c of CALLS) {
      if (c.date && c.status === "done") days.set(c.date, (days.get(c.date) ?? 0) + 1);
    }
    return [...days.entries()].sort(([a], [b]) => (a < b ? -1 : 1));
  }, []);
  const maxDay = Math.max(...timeline.map(([, n]) => n));

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        <div className={styles.filterRow} role="tablist" aria-label="Slice the field">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              className={`${styles.filterBtn} type-body-4`}
              data-active={filter === f.key || undefined}
              onClick={() => {
                setFilter(f.key);
                setValue(null);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filter !== "all" ? (
          <div className={styles.valueRow}>
            {values.map((v) => (
              <button
                key={v}
                type="button"
                className={`${styles.valueBtn} type-body-4`}
                data-active={value === v || undefined}
                aria-pressed={value === v}
                onClick={() => setValue(value === v ? null : v)}
              >
                {VALUE_LABELS[v] ?? v}
                <span className={styles.count}>{counts.get(v)}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <p className={`${styles.tally} type-body-4`} aria-live="polite">
        {value === null
          ? `${CALLS.length} contacts · ${CALLS.filter((c) => c.status === "done").length} completed calls`
          : `${activeCount} of ${CALLS.length} in this slice`}
      </p>

      <div className={styles.field} role="img" aria-label={`${CALLS.length} research contacts drawn as squares, coloured by ICP`}>
        {CALLS.map((c, i) => (
          <span
            key={i}
            className={styles.mark}
            data-icp={c.icp ?? "none"}
            data-lead={c.status !== "done" || undefined}
            data-dim={!active(c) || undefined}
          />
        ))}
      </div>

      <div className={styles.legend}>
        {(["enterprise", "sme", "agency", "creator"] as const).map((k) => (
          <span key={k} className={`${styles.key} type-body-4`}>
            <span className={styles.mark} data-icp={k} /> {VALUE_LABELS[k]}
          </span>
        ))}
        <span className={`${styles.key} type-body-4`}>
          <span className={styles.mark} data-icp="none" data-lead /> lead only / unrecorded
        </span>
      </div>

      <div className={styles.timeline}>
        <p className={`${styles.timelineLabel} type-body-4`}>
          Completed calls per day, April 2025
        </p>
        <div className={styles.days}>
          {timeline.map(([day, n]) => (
            <div key={day} className={styles.day}>
              <span
                className={styles.dayBar}
                style={{ blockSize: `${(n / maxDay) * 3.5}rem` }}
              />
              <span className={`${styles.dayCount} type-body-4`}>{n}</span>
              <span className={`${styles.dayLabel} type-body-4`}>
                {Number(day.slice(8))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
