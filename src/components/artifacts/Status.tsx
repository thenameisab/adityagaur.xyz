import styles from "./Status.module.css";

/**
 * The four states, fixed across all ten pairings. A reader who learns one plate
 * can read every plate, because only the inks change — never what they mean.
 *
 *   held    drum A      stable, verified, in register
 *   mine    drum B      the reader's own action
 *   broken  overprint   drifted, violated, failed
 *   void    key at 30%  absent, projected, unknown
 */
export type Tone = "held" | "mine" | "broken" | "void";

type Props = {
  tone: Tone;
  /** The word. Required, and it is not optional in the design sense either —
      see the note below on why colour never travels alone. */
  children: string;
};

/**
 * Label plus shape plus ink. Never colour alone.
 *
 * This is the component that makes the plate system survive the two tests it
 * would otherwise fail. Greyscale printing flattens all four inks toward the
 * same value, and the most common colour-vision deficiency makes drum A and
 * drum B indistinguishable on several of the ten pairings. So each state carries
 * three independent signals:
 *
 *   - the word itself (HELD, DRIFT), which needs no vision of colour at all
 *   - a shape: hollow ring for held, filled ring for the reader's action, filled
 *     square for broken, dashed square for void
 *   - the ink
 *
 * Remove any two and the state is still legible. That is the test.
 */
export default function Status({ tone, children }: Props) {
  return (
    <span className={styles.root} data-tone={tone}>
      <span className={styles.mark} aria-hidden="true" />
      <span className={styles.label}>{children}</span>
    </span>
  );
}
