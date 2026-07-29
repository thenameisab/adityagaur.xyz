"use client";

import { useEffect, useState } from "react";
import { MARKS, type MarkLine } from "./Defs";
import { CHECKPOINTS, isDiverged } from "./checkpoints";
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
 * The two running figures live in checkpoints.ts rather than here, because this
 * is no longer their only surface: the rail does not render below 80em, so the
 * divergence at 008 is also stated inline by <Reconciliation> at that chapter.
 * One table, two presentations.
 */

export default function ChapterRail() {
  const [active, setActive] = useState<MarkLine>("001");

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-finlog-chapter]"));
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const line = visible[0]?.target.getAttribute("data-finlog-chapter");
        if (line) setActive(line as MarkLine);
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
  const diverged = isDiverged(checkpoint);

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
              /* The chapter title lives here rather than in the mark's <title>.
                 With the line number now visible, a titled mark would make the
                 accessible name "001 001 — Seventy-seven sheets"; the mark goes
                 back to being decorative, which is what it is once text is
                 carrying the meaning. */
              aria-label={`${m.line} — ${m.label}`}
            >
              <span className={`${styles.railMarkLine} type-figure-3`}>{m.line}</span>
              <Mark line={m.line} size="rail" className={styles.railMarkIcon} />
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
