"use client";

import type { RegisterName } from "@/lib/registers";
import type { MarkLine } from "./Defs";
import Mark from "./Mark";
import { useChapterRegister } from "./Register";
import styles from "./finlog.module.css";

type Props = {
  line: MarkLine;
  eyebrow: string;
  title: string;
  /** The chapter's own register per FINLOG-PAGE-PLAN §4 — overridden globally
   *  when the reader has set one via the rail toggle. */
  defaultRegister: RegisterName;
  children: React.ReactNode;
};

/**
 * One chapter: the threshold (line number, eyebrow, hand-set title, mark) and
 * its body, wrapped in the register that actually governs it.
 *
 * The theme class lands HERE rather than once around the whole essay, because
 * §4's table gives several chapters different defaults — 003/004/007 are
 * Console, 001/005/006/009 are Ledger, and 002/008 run "both" (the mode toggle
 * or the rail divergence is the argument, so those two render their threshold
 * and lede in whichever register is active and let the artifact carry the
 * split). Each chapter is thus its OWN register root, which is also what makes
 * `data-edge` (globals.css §15) draw a real seam between a Console chapter and
 * the Ledger one before or after it.
 *
 * `data-finlog-chapter` is the hook ChapterRail's IntersectionObserver reads to
 * track which chapter is current — a plain attribute rather than a second
 * context, because the rail is the only consumer and querying the DOM for it
 * costs nothing a scroll handler wouldn't already cost.
 */
export default function Chapter({ line, eyebrow, title, defaultRegister, children }: Props) {
  const { register, swapping } = useChapterRegister(defaultRegister);

  return (
    <section
      id={`finlog-chapter-${line}`}
      className={`theme-${register} ${styles.chapter}`}
      data-finlog-chapter={line}
      data-edge
      {...(swapping ? { "data-swapping": "" } : {})}
    >
      <header className={styles.threshold} data-rule>
        {/* Mark and line number above the text, all three on the prose's own left
            edge. Previously a flex row, which indented the whole text column 84px
            past the body copy — see .threshold in the module. */}
        <div className={styles.thresholdSign}>
          <Mark line={line} size="full" className={styles.thresholdMark} />
          <p className={`${styles.thresholdLine} type-figure-2`}>{line}</p>
        </div>
        <div className={styles.thresholdText}>
          <p className={`${styles.thresholdEyebrow} type-eyebrow-2 text-muted`}>{eyebrow}</p>
          {/* `role="heading"` rather than a literal `<h2>`: globals.css's
              `.prose h2` rule (display-3 size, space-12 top margin) is a
              descendant selector and would double up with the threshold's own
              spacing and .type-display-3 role class. The heading semantics for
              a screen reader are the same either way. */}
          <p
            role="heading"
            aria-level={2}
            className={`${styles.thresholdTitle} type-display-3 text-primary`}
          >
            {title}
          </p>
        </div>
      </header>
      {/* `[data-ruled]` / `[data-gridded]` (globals.css §15) need a THEME-LEDGER or
          THEME-CONSOLE ANCESTOR, not the same element — putting them here rather
          than on the section itself is what makes the selectors match, and it also
          keeps the ground to the body copy, leaving the threshold clean.

          Both registers now carry a ground, which is what makes the register a
          material rather than a colour cast: Ledger gets baseline ruling under its
          prose, Console gets the panel's grid under the whole band. */}
      <div
        className={styles.chapterBody}
        {...(register === "ledger" ? { "data-ruled": "" } : { "data-gridded": "" })}
      >
        {children}
      </div>
    </section>
  );
}
