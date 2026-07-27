import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/Hero";
import Icon from "@/components/Icon";
import styles from "../empty.module.css";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Systems Aditya Gaur has built and run — go-to-market, revenue operations, and internal AI tooling.",
  alternates: { canonical: "/work/" },
};

/**
 * TODO(Aditya) — BUILD-BRIEF §5.2 item 4: three to five work entries, 250–500
 * words each. Each needs a title, one-line summary, role, timeframe, 2–4
 * sentences of context, what was actually built, and a concrete outcome.
 *
 * The MDX pipeline (§2, Phase 5) lands with the first entry — wiring it against
 * an empty directory would be plumbing with nothing to carry. Until then this
 * is a written empty state, not a "coming soon".
 */
export default function WorkIndex() {
  return (
    <>
      <Hero
        variant="page"
        eyebrow="Work"
        headline="Systems I've built and run."
        lede="Go-to-market motions, revenue operations, and the internal tooling that keeps them running."
      />
      <div className="container inner-section">
        <div className={`${styles.root} stack stack--s`}>
          <p className="type-body-1 text-secondary">
            Nothing is written up here yet. The work exists — the write-ups
            don&rsquo;t.
          </p>
          <p className="type-body-2 text-muted">
            The career timeline on the about page covers the roles in the meantime,
            and the wiki has the thinking behind most of it.
          </p>
          <p className="cluster">
            <Link href="/about/" className={styles.link}>
              Career timeline <Icon name="arrow-right" size="sm" />
            </Link>
            <Link href="/wiki/" className={styles.link}>
              Wiki <Icon name="arrow-right" size="sm" />
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
