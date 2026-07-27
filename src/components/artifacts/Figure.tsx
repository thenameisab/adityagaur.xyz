import type { ReactNode } from "react";
import styles from "./Figure.module.css";

type Props = {
  /** Numbered label, e.g. "Figure 2". Omit for unnumbered artifacts. */
  label?: string;
  /** What the reader is looking at. Plain sentence, no "this figure shows". */
  caption?: string;
  /** Where the data came from, including when it is synthetic. */
  source?: string;
  /** Let the frame scroll horizontally instead of shrinking its contents. */
  scroll?: boolean;
  children: ReactNode;
};

/**
 * The frame every artifact sits in: one border treatment, one caption position,
 * one bleed width. Keeping it here is what stops twelve pages of artifacts from
 * each inventing their own chrome.
 */
export default function Figure({
  label,
  caption,
  source,
  scroll = false,
  children,
}: Props) {
  return (
    <figure className={styles.root}>
      <div className={`${styles.frame} ${scroll ? styles.scroll : ""}`}>
        {children}
      </div>
      {label || caption || source ? (
        <figcaption className={styles.caption}>
          {label || caption ? (
            <p className={`${styles.label} type-body-3`}>
              {label ? <strong className="text-secondary">{label}. </strong> : null}
              {caption}
            </p>
          ) : null}
          {source ? (
            <p className={`${styles.source} type-body-4`}>{source}</p>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
