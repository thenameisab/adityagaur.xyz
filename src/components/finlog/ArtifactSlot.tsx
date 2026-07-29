import styles from "./finlog.module.css";

/**
 * A placeholder for one of the eight interactive artifacts (§8), until
 * `feat/finlog-artifacts-static` and `feat/finlog-artifacts-engine` build them.
 *
 * `data-void` rather than a new dashed-box style: §15 already owns "this is
 * billable and nobody has invoiced it yet" as a shape, and an artifact that
 * hasn't shipped is the same honest gap — a labelled absence rather than a
 * broken image or a silent skip.
 */
export default function ArtifactSlot({
  code,
  name,
  description,
}: {
  code: string;
  name: string;
  description: string;
}) {
  return (
    <div className={styles.artifactSlot} data-void>
      <p className={`${styles.artifactCode} type-figure-3`}>{code}</p>
      <p className={`${styles.artifactName} type-ui-2`}>{name}</p>
      <p className={`${styles.artifactDesc} type-body-4 text-faint`}>{description}</p>
    </div>
  );
}
