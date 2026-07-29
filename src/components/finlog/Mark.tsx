import { MARKS, type MarkLine } from "./Defs";
import styles from "./Mark.module.css";

/**
 * A chapter mark. Instantiates one of the nine symbols in FinlogDefs, which must
 * be rendered somewhere on the page.
 *
 * `<use>` rather than inlining the geometry, because every mark is used more than
 * once — the chapter threshold, the sticky rail, the Work index card — and a
 * symbol is the difference between paying for the path data once and paying for it
 * four times. It is also what keeps the whole set inside the §6 budget.
 *
 * Decorative by default and therefore aria-hidden: the mark restates the chapter
 * title sitting next to it, and a screen reader announcing "eight ruled boxes,
 * four arrows folding back" would be noise. Pass `title` only where a mark is the
 * ONLY thing carrying its meaning.
 */
export default function Mark({
  line,
  size = "full",
  title,
  className,
}: {
  line: MarkLine;
  /** rail = 20px in the sticky chapter rail · full = 64px at a threshold. */
  size?: "rail" | "full";
  title?: string;
  className?: string;
}) {
  const decorative = !title;
  return (
    <svg
      className={[styles.root, styles[size], className].filter(Boolean).join(" ")}
      aria-hidden={decorative || undefined}
      role={decorative ? undefined : "img"}
      focusable="false"
      // The two sanctioned exceptions to "Ledger is still" (globals.css §15) are a
      // mark being SET and a stamp landing. Both are physical acts rather than
      // screen effects, and this attribute is what exempts them from the guard.
      // It sits on the element that actually animates — the guard suppresses
      // per-element, so putting it on a wrapper would do nothing.
      data-ink=""
    >
      {title ? <title>{title}</title> : null}
      <use href={`#finlog-mark-${line}`} />
    </svg>
  );
}

/**
 * The page's arrow. Monoline at the mono's own stem weight — see the measurement
 * in Defs.tsx for why this is a new arrow rather than the site's restyled.
 *
 * Sized in em like Icon, because unlike a mark this one sits inside a line of type
 * and has to move with it.
 */
export function FinlogArrow({
  dir = "right",
  title,
  className,
}: {
  dir?: "right" | "up-right";
  title?: string;
  className?: string;
}) {
  const decorative = !title;
  return (
    <svg
      className={[styles.arrow, className].filter(Boolean).join(" ")}
      aria-hidden={decorative || undefined}
      role={decorative ? undefined : "img"}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <use href={`#finlog-arrow-${dir}`} />
    </svg>
  );
}

/** Re-exported so a caller can map the set without importing two modules. */
export { MARKS };
