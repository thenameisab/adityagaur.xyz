import styles from "./TextLockup.module.css";

type Props = {
  eyebrow?: string;
  /** The heading text. */
  title: string;
  lede?: string;
  /** Semantic level, chosen independently of visual size. */
  as?: "h1" | "h2" | "h3";
  /** Visual size — a type role, not a heading level. */
  size?: "display-1" | "display-2" | "display-3" | "headline-1";
  align?: "left" | "center";
  className?: string;
};

/** Eyebrow + heading + lede. Used inside most other modules. */
export default function TextLockup({
  eyebrow,
  title,
  lede,
  as: Heading = "h2",
  size = "display-3",
  align = "left",
  className,
}: Props) {
  return (
    <div
      className={[styles.root, styles[align], "stack", "stack--s", className]
        .filter(Boolean)
        .join(" ")}
    >
      {eyebrow ? <p className="type-eyebrow-3 text-muted">{eyebrow}</p> : null}
      <Heading className={`type-${size} text-primary`}>{title}</Heading>
      {lede ? <p className={`${styles.lede} type-body-1 text-secondary`}>{lede}</p> : null}
    </div>
  );
}
