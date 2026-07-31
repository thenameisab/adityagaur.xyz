import type { Metadata } from "next";
import RoutePlate from "@/components/RoutePlate";
import Link from "next/link";
import Hero from "@/components/Hero";
import Icon from "@/components/Icon";
import { workEntries } from "@/content/work/registry";
import { published } from "@/lib/content";
import styles from "./work.module.css";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Systems Aditya Gaur has built and run — deterministic tooling, revenue operations, and the internal software that keeps them running.",
  alternates: { canonical: "/work/" },
};

export default function WorkIndex() {
  const entries = published(workEntries);

  return (
    <RoutePlate drums="teal-red">
      <Hero
        variant="page"
        eyebrow="Work"
        headline="Systems I've built and run."
        lede="Written up as deep dives: what was broken, what I built, and the decision that was actually hard."
      />
      <div className="container inner-section">
        <div className={styles.list} data-reveal-stagger>
          {entries.map((entry, i) => (
            <Link
              key={entry.slug}
              href={`/work/${entry.slug}/`}
              className={styles.row}
              style={{ ["--i" as string]: i }}
            >
              <div>
                <h2 className={`${styles.rowTitle} type-headline-2`}>
                  {entry.title}
                </h2>
                <p className={`${styles.rowSummary} type-body-2`}>{entry.summary}</p>
                <p className={`${styles.rowMeta} type-body-4`}>
                  {entry.timeframe} · {entry.stack.join(" · ")}
                </p>
              </div>
              <span className={`${styles.rowAside} type-body-4`}>
                {entry.status}
                <Icon name="arrow-right" size="sm" className={styles.rowArrow} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </RoutePlate>
  );
}
