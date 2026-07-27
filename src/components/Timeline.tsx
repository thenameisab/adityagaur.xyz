import { career } from "@/lib/career";
import styles from "./Timeline.module.css";

/**
 * A static two-column list. The old 500vh sticky-scroll mechanic is gone: it
 * hijacked scroll, broke on mobile, and needed an animation library for what is
 * fundamentally a list.
 */
export default function Timeline() {
  return (
    <ol className={styles.root} data-reveal-stagger>
      {career.map((role, i) => (
        <li
          key={`${role.company}-${role.startYear}`}
          className={styles.item}
          style={{ ["--i" as string]: Math.min(i, 5) }}
        >
          <p className={`${styles.period} type-caption-1 text-faint`}>{role.period}</p>
          <div className="stack stack--xs">
            <h3 className="type-headline-4 text-primary">{role.role}</h3>
            <p className="type-body-3 text-secondary">{role.company}</p>
            <p className={`${styles.desc} type-body-3 text-muted`}>{role.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
