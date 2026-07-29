"use client";

import { useEffect, useState } from "react";
import { MARKS } from "./Defs";
import Mark from "./Mark";
import RegisterToggle from "./RegisterToggle";
import styles from "./finlog.module.css";

/**
 * The reconciliation rail (FINLOG-PAGE-PLAN §5.4 item 4), doubling as the
 * chapter nav §5.2 puts the register toggle in. One sticky instrument rather
 * than two, because the plan only ever describes a single sticky element and
 * "the reader's own running total" and "which chapter is current" are both
 * things a dashboard tracks at once.
 *
 * Always `.theme-console` regardless of the chapter in view — the same reason
 * the site's own header and footer stay `.theme-dark` beside a Ledger or
 * Console page (globals.css, "the register edge"): this rail is instrument
 * chrome, not prose, and a live readout that is "always one query behind the
 * truth" is Console's own definition.
 *
 * `invoice` and `dashboard` are identical from 002 through 007 — the reader
 * stops noticing the rail agrees with itself — and diverge at 008 by exactly
 * the ₹74,939.32 chapter 008 accounts for, then close again once 009 finalizes
 * the correction. 001 has no figure: the manual month-end predates either
 * number existing.
 */
const CHECKPOINTS: Record<string, { invoice: string; dashboard: string } | null> = {
  "001": null,
  "002": { invoice: "₹18,67,839.32", dashboard: "₹18,67,839.32" },
  "003": { invoice: "₹18,67,839.32", dashboard: "₹18,67,839.32" },
  "004": { invoice: "₹18,67,839.32", dashboard: "₹18,67,839.32" },
  "005": { invoice: "₹18,67,839.32", dashboard: "₹18,67,839.32" },
  "006": { invoice: "₹18,67,839.32", dashboard: "₹18,67,839.32" },
  "007": { invoice: "₹18,67,839.32", dashboard: "₹18,67,839.32" },
  "008": { invoice: "₹18,67,839.32", dashboard: "₹17,92,900.00" },
  "009": { invoice: "₹18,67,839.32", dashboard: "₹18,67,839.32" },
};

export default function ChapterRail() {
  const [active, setActive] = useState("001");

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-finlog-chapter]"));
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const line = visible[0]?.target.getAttribute("data-finlog-chapter");
        if (line) setActive(line);
      },
      // A chapter counts as "current" once it has cleared the top tenth of the
      // viewport and while it still owns the top third — the same zone a
      // scroll-spy Toc uses, just expressed as observer margins instead of a
      // scroll handler.
      { rootMargin: "-10% 0px -70% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const checkpoint = CHECKPOINTS[active] ?? null;
  const diverged = checkpoint !== null && checkpoint.invoice !== checkpoint.dashboard;

  return (
    <div className={`theme-console ${styles.rail}`}>
      <RegisterToggle className={styles.railToggle} />

      <ol className={styles.railMarks} aria-label="Chapters">
        {MARKS.map((m) => (
          <li key={m.line}>
            <a
              href={`#finlog-chapter-${m.line}`}
              className={styles.railMarkLink}
              aria-current={m.line === active ? "true" : undefined}
              data-active={m.line === active || undefined}
            >
              <Mark line={m.line} size="rail" title={`${m.line} — ${m.label}`} />
            </a>
          </li>
        ))}
      </ol>

      <dl className={styles.railFigures}>
        <dt className={`${styles.railFigureLabel} type-eyebrow-3 text-faint`}>Invoice</dt>
        <dd
          className={`${styles.railFigureValue} type-figure-3`}
          data-sig={checkpoint ? "settled" : "absent"}
        >
          {checkpoint ? checkpoint.invoice : "—"}
        </dd>
        <dt className={`${styles.railFigureLabel} type-eyebrow-3 text-faint`}>Dashboard</dt>
        <dd
          className={`${styles.railFigureValue} type-figure-3`}
          data-sig={!checkpoint ? "absent" : diverged ? "loss" : "settled"}
        >
          {checkpoint ? checkpoint.dashboard : "—"}
        </dd>
      </dl>
    </div>
  );
}
