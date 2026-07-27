import type { ReactNode } from "react";
import styles from "./Note.module.css";

type Props = {
  /** The thing being defined, or the kind of aside this is. */
  term: string;
  children: ReactNode;
};

/**
 * An inline concept brief. Use it to define a term the page needs but the
 * argument shouldn't stop for — the reader who already knows can skip it, and
 * the reader who doesn't isn't left behind.
 */
export default function Note({ term, children }: Props) {
  return (
    <aside className={styles.root}>
      <strong className={`${styles.term} type-eyebrow-3`}>{term}</strong>
      <div className={`${styles.body} type-body-3`}>{children}</div>
    </aside>
  );
}
