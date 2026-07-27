import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/Hero";
import Icon from "@/components/Icon";
import styles from "../empty.module.css";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Essays by Aditya Gaur on AI, strategy, and how operating systems inside a company actually get built.",
  alternates: { canonical: "/writing/" },
};

/**
 * TODO(Aditya) — BUILD-BRIEF §5.2 item 5: two essays minimum at launch,
 * 800–2000 words each. The MDX pipeline lands with the first one (Phase 5).
 */
export default function WritingIndex() {
  return (
    <>
      <Hero
        variant="page"
        eyebrow="Writing"
        headline="Essays."
        lede="On AI, strategy, and how operating systems inside a company actually get built."
      />
      <div className="container inner-section">
        <div className={`${styles.root} stack stack--s`}>
          <p className="type-body-1 text-secondary">
            No essays here yet — the first one is in progress.
          </p>
          <p className="type-body-2 text-muted">
            Shorter pieces go up on the blog, and the wiki holds the notes most of
            them start as.
          </p>
          <p className="cluster">
            <a
              href="https://blog.adityagaur.xyz"
              rel="noopener noreferrer"
              target="_blank"
              className={styles.link}
            >
              Blog <Icon name="arrow-up-right" size="sm" />
            </a>
            <Link href="/wiki/" className={styles.link}>
              Wiki <Icon name="arrow-right" size="sm" />
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
