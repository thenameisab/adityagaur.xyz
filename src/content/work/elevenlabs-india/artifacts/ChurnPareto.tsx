import { CHURN_FACTORS } from "../data/levers";
import styles from "./ChurnPareto.module.css";

/**
 * Why users left: six churn factors coded from the call notes, by volume of
 * supporting insights. Server component — there is nothing to interact with,
 * the ranking is the content.
 *
 * A source honesty note travels with this figure (in its caption): the
 * capstone's summary table and the six per-factor pages disagree about two
 * of these counts — locales vs reliability appear transposed — and the page
 * says so rather than silently picking one.
 */

export default function ChurnPareto() {
  const max = Math.max(...CHURN_FACTORS.map((f) => f.insights));
  return (
    <div className={styles.root}>
      <ol className={styles.list}>
        {CHURN_FACTORS.map((f, i) => (
          <li key={f.label} className={styles.row}>
            <span className={`${styles.rank} type-body-4`}>{i + 1}</span>
            <div className={styles.body}>
              <div className={styles.head}>
                <span className={`${styles.label} type-body-3`}>{f.label}</span>
                <span className={`${styles.nums} type-body-4`}>
                  {f.insights} insights · {f.pct}%
                </span>
              </div>
              <span className={styles.track}>
                <span
                  className={styles.bar}
                  style={{ inlineSize: `${(f.insights / max) * 100}%` }}
                />
              </span>
              <span className={`${styles.icps} type-body-4`}>{f.icps}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
