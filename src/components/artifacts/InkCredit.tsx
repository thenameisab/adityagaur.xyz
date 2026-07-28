import { INKS, PAIRINGS, inkCredit, type DrumsKey } from "@/lib/plates";
import styles from "./InkCredit.module.css";

type Props = {
  drums: DrumsKey;
  /** Drop the swatches and keep only the words. For running text. */
  bare?: boolean;
};

/**
 * "Fluorescent Pink + Teal on cream".
 *
 * Authentic to the medium — a riso print is defined by which drums you loaded,
 * so a printer states them — and it doubles as the plate's legend: the two
 * swatches are the two inks the reader is about to see carrying meaning, in the
 * order the semantic layer assigns them (A = held, B = the reader's action).
 *
 * The swatches are decorative in the accessibility sense: the ink names beside
 * them already say everything they say, so they are hidden from the tree rather
 * than announced twice.
 */
export default function InkCredit({ drums, bare = false }: Props) {
  const pairing = PAIRINGS[drums];

  return (
    <span className={styles.root}>
      {bare ? null : (
        <span className={styles.swatches} aria-hidden="true">
          <span className={styles.swatch} data-drum="a" />
          <span className={styles.swatch} data-drum="b" />
        </span>
      )}
      <span className={styles.text}>{inkCredit(drums)}</span>
      {/* The overprint is the third colour and nobody loaded it — it only exists
          where the two passes overlap. Worth naming for exactly that reason. */}
      <span className={styles.overprint}>
        overprinting {INKS[pairing.a].label.toLowerCase()} and{" "}
        {INKS[pairing.b].label.toLowerCase()} gives {pairing.overprint}
      </span>
    </span>
  );
}
