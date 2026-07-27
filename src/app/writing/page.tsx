import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/Hero";
import Icon from "@/components/Icon";
import { writingEntries } from "@/content/writing/registry";
import { published } from "@/lib/content";
import styles from "./writing.module.css";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Essays by Aditya Gaur on AI, strategy, and how operating systems inside a company actually get built.",
  alternates: { canonical: "/writing/" },
};

const DATE = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default function WritingIndex() {
  const entries = published(writingEntries);

  return (
    <>
      <Hero
        variant="page"
        eyebrow="Writing"
        headline="Essays."
        lede="On AI, strategy, and how operating systems inside a company actually get built."
      />
      <div className="container inner-section">
        <div className={styles.list} data-reveal-stagger>
          {entries.map((entry, i) => (
            <Link
              key={entry.slug}
              href={`/writing/${entry.slug}/`}
              className={styles.row}
              style={{ ["--i" as string]: i }}
            >
              <div>
                <h2 className={`${styles.rowTitle} type-headline-2`}>
                  {entry.title}
                </h2>
                <p className={`${styles.rowDek} type-body-2`}>{entry.dek}</p>
              </div>
              <span className={`${styles.rowAside} type-body-4`}>
                {DATE.format(new Date(entry.published))} ·{" "}
                {entry.readingMinutes} min
                <Icon name="arrow-right" size="sm" className={styles.rowArrow} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
