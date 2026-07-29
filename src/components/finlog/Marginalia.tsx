import styles from "./finlog.module.css";

/**
 * The second voice (FINLOG-PAGE-PLAN §5.4 item 3) — the PM track: scope calls,
 * rejected designs, the tradeoff that didn't make the main line. Set in the
 * display italic rather than a third colour, because the page already has an
 * emphasis device that means "a different voice is speaking" (globals.css's
 * `em` rule) and a third register-independent hue would be a new decision with
 * no home in §5.2's palette.
 *
 * No client JS: this is a static aside, not a device with its own state, so it
 * costs nothing to render on every chapter that carries one.
 */
export default function Marginalia({
  label = "Scope note",
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <aside className={styles.marginalia}>
      <p className={`${styles.marginaliaLabel} type-eyebrow-3 text-faint`}>{label}</p>
      <div className={`${styles.marginaliaBody} type-body-3 text-secondary`}>{children}</div>
    </aside>
  );
}
