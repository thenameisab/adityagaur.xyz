import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import Toc from "@/components/Toc";
import { writingEntries } from "@/content/writing/registry";
import { findEntry, published } from "@/lib/content";
import { tocFor } from "@/lib/toc";
import { SITE_URL, person } from "@/lib/site";
import styles from "../writing.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return published(writingEntries).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = findEntry(writingEntries, slug);
  if (!entry) return {};
  return {
    title: entry.title,
    description: entry.summary,
    alternates: { canonical: `/writing/${entry.slug}/` },
    openGraph: {
      type: "article",
      title: `${entry.title} — ${person.name}`,
      description: entry.summary,
      url: `${SITE_URL}/writing/${entry.slug}/`,
      publishedTime: entry.published,
    },
  };
}

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default async function WritingEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = findEntry(writingEntries, slug);
  if (!entry || entry.draft) notFound();

  const { Content } = entry;
  const sections = tocFor("writing", entry.slug);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.summary,
    datePublished: entry.published,
    author: { "@type": "Person", name: person.name, url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/writing/${entry.slug}/`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Writing",
        item: `${SITE_URL}/writing/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: entry.title,
        item: `${SITE_URL}/writing/${entry.slug}/`,
      },
    ],
  };

  return (
    <>
      <div className={styles.progress} aria-hidden="true" />
      <article className="entry inner-section">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([articleJsonLd, breadcrumbJsonLd]),
          }}
        />

        <div className="entry-head">
          <div className="stack stack--s">
            <Link className={styles.back} href="/writing/">
              <Icon name="arrow-right" size="sm" className={styles.backArrow} />{" "}
              Writing
            </Link>
            <p className="type-eyebrow-3 text-muted">{entry.kicker}</p>
            <h1 className="type-display-2 text-primary">{entry.title}</h1>
            <p className={`${styles.dek} type-headline-3 text-secondary`}>
              {entry.dek}
            </p>
          </div>

          <p className={`${styles.dateline} type-body-4`}>
            <span>{DATE.format(new Date(entry.published))}</span>
            <span>{entry.readingMinutes} minute read</span>
            <span>{person.name}</span>
          </p>
        </div>

        {sections.length > 1 ? (
          <div className="entry-rail">
            <Toc sections={sections} />
          </div>
        ) : null}

        <div className="entry-body">
          <div className={`${styles.body} prose`}>
            <Content />
          </div>

          <div className={styles.footer}>
            <Link className={styles.back} href="/writing/">
              <Icon name="arrow-right" size="sm" className={styles.backArrow} />{" "}
              All writing
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
