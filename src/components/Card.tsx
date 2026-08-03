import Link from "next/link";
import Icon from "./Icon";
import { BrandMark } from "./Brand";
import styles from "./Card.module.css";

type Props = {
  href: string;
  title: string;
  summary: string;
  /** `compact` tightens padding for dense grids. */
  variant?: "default" | "compact";
  /** Name in the brand registry — renders a logo tile before the title. */
  brand?: string;
};

/**
 * The whole card is one click target, via a stretched pseudo-element on the
 * title link — so the accessible name is the title alone, not the title plus
 * the summary. :focus-within renders the same visual state as :hover.
 */
export default function Card({ href, title, summary, variant = "default", brand }: Props) {
  return (
    <article className={`${styles.root} ${variant === "compact" ? styles.compact : ""}`}>
      <h3 className={`${styles.title} type-headline-2 text-primary`}>
        {brand ? <BrandMark name={brand} size={20} className={styles.mark} /> : null}
        <Link href={href} className={styles.link}>
          {title}
        </Link>
        <Icon name="arrow-right" size="sm" className={styles.arrow} />
      </h3>
      <p className="type-body-3 text-muted">{summary}</p>
    </article>
  );
}
