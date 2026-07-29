import styles from "./finlog.module.css";

/**
 * The frame every artifact sits in — a `figure` with a label above and a caption
 * below, and nothing else. It exists so the four artifacts share one set of
 * margins, one label treatment and one caption voice instead of each inventing
 * them, which is the same reason ArtifactSlot existed.
 *
 * NO ARTIFACT CODE IS RENDERED. The placeholder printed "A1" beside the name
 * because a placeholder is addressing the person who still has to build it. A
 * shipped artifact is addressing a reader, and "A1" means nothing to a reader —
 * it is an inventory label from a plan they have never seen. The name carries it
 * alone, in plain English, for the same reason every other identifier on this
 * page was scrubbed.
 *
 * The label is NOT a heading. §4 forbids `h2`s in the chapter body so the
 * table-of-contents rail stays empty, and a figure label is not a section of the
 * essay anyway — it is the caption's other half.
 */
export default function Artifact({
  name,
  caption,
  children,
}: {
  name: string;
  /** What the reader should take from it. Never a restatement of the label. */
  caption: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <figure className={styles.artifact}>
      {/* MUTED, NOT FAINT, and this is a contrast requirement rather than a
          typographic preference. The label sits OUTSIDE the artifact's money band
          and therefore directly on the chapter's ground — which in Console is the
          gridded one, where faint measures 3.86:1 against a grid line and fails
          AA. globals.css §15 records faint's exemption as covering marks and the
          threshold, both of which sit outside the gridded band; a figure label
          inside it is not covered. Muted is 5.58:1 in the same worst case. */}
      <p className={`${styles.artifactLabel} type-eyebrow-3 text-muted`}>{name}</p>
      {children}
      <figcaption className={`${styles.artifactCaption} type-body-4 text-muted`}>
        {caption}
      </figcaption>
    </figure>
  );
}
