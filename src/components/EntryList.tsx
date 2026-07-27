import Link from "next/link";
import Icon from "./Icon";
import styles from "./EntryList.module.css";

export type Entry = {
  href: string;
  title: string;
  summary: string;
  /** Right-hand meta — a year, a date, a role. Rendered in mono. */
  meta?: string;
};

/**
 * A vertical list of linked rows with hairline dividers. Used for work,
 * writing, and the homepage's selected-work and recent-writing blocks — a grid
 * of three looks sparse, a list of three reads deliberate.
 */
export default function EntryList({ entries }: { entries: Entry[] }) {
  return (
    <ul className={styles.root} data-reveal-stagger>
      {entries.map((entry, i) => (
        <li
          key={entry.href}
          className={styles.item}
          // The one sanctioned inline style: the stagger index.
          style={{ ["--i" as string]: Math.min(i, 5) }}
        >
          <Link href={entry.href} className={styles.link}>
            <span className={styles.body}>
              <span className={`${styles.title} type-headline-3 text-primary`}>
                {entry.title}
                <Icon name="arrow-right" size="sm" className={styles.arrow} />
              </span>
              <span className="type-body-3 text-muted">{entry.summary}</span>
            </span>
            {entry.meta ? (
              <span className={`${styles.meta} type-caption-1 text-faint`}>{entry.meta}</span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
