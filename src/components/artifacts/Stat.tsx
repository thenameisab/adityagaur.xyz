import styles from "./Stat.module.css";

type Item = { value: string; label: string };

/**
 * A row of counted facts. Every value must be something real and checkable —
 * lines of code, a pinned version, a runner count. Not a claim.
 */
export default function Stat({ items }: { items: Item[] }) {
  return (
    <dl className={styles.root}>
      {items.map((item) => (
        <div key={item.label} className={styles.item}>
          <dd className={`${styles.value} type-headline-2`}>{item.value}</dd>
          <dt className={`${styles.label} type-body-4`}>{item.label}</dt>
        </div>
      ))}
    </dl>
  );
}
