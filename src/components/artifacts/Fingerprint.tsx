import styles from "./Fingerprint.module.css";

type Props = {
  /**
   * One value per cell, each already normalised to 0–1. Sixteen is the design
   * width; fewer or more will lay out, but the strip stops reading as a
   * fingerprint much below about twelve.
   */
  cells: number[];
  /** What the strip is a fingerprint OF. Announced; not drawn. */
  alt: string;
  /** Optional caption under the strip, e.g. the digest it was derived from. */
  legend?: string;
};

/**
 * Sixteen cells, one value each, as a single glance.
 *
 * Not a Loam device. Anything built on real numbers fits it — digests in
 * DeterminismLab, relevance scores in SearchDemo, CIBIL bands in ImpactSim,
 * reliability in Compounding, the seven dimensions in ArchipelagoIndex,
 * confidence grades in Landscape. Same component, a different mapping per plate,
 * which is most of why the plates will feel like different instruments rather
 * than one instrument recoloured.
 *
 * It earns its place only where the underlying value is real. An artifact where
 * it would be ornamental does not get one.
 *
 * ── Two implementation notes that are design decisions, not conveniences ──
 *
 * The value is QUANTISED to sixteen levels and carried on `data-level`, not as
 * an inline custom property. Partly because BUILD-BRIEF allows exactly one
 * inline style in the codebase — the stagger `--i` — and spending it here would
 * mean spending it twice. Mostly because it is true to the medium: a Risograph
 * cannot print continuous tone, it screens. Sixteen discrete levels is what the
 * process would actually give you, and it happens to map one-to-one onto a hex
 * digit.
 *
 * Height carries the value, not colour. So the strip survives greyscale and
 * survives being printed in whichever two drums the page loaded.
 */
export default function Fingerprint({ cells, alt, legend }: Props) {
  return (
    <div className={styles.root}>
      {/* Deliberately not `data-reveal-stagger`: that hook applies reveal-up from
          globals.css §9, and these cells scale rather than rise. Same `--i`
          convention, its own keyframe. */}
      <div className={styles.strip} role="img" aria-label={alt}>
        {cells.map((value, i) => (
          <span
            key={i}
            className={styles.cell}
            data-level={level(value)}
            // The one permitted inline style, and the one it was permitted for.
            style={{ "--i": i } as React.CSSProperties}
          >
            <span className={styles.fill} />
          </span>
        ))}
      </div>
      {legend ? <p className={styles.legend}>{legend}</p> : null}
    </div>
  );
}

/** 0–1 to one of sixteen printable levels. */
function level(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(15, Math.round(value * 15)));
}

/**
 * A hex digest to sixteen cells, one per digit. The obvious mapping, and the one
 * that makes two digests that differ in a single byte look obviously different —
 * which is the whole reason a digest gets a fingerprint instead of being read
 * character by character.
 */
export function hexCells(digest: string): number[] {
  return digest
    .slice(0, 16)
    .split("")
    .map((c) => {
      const v = parseInt(c, 16);
      return Number.isNaN(v) ? 0 : v / 15;
    });
}
