import type { Metadata } from "next";
import RoutePlate from "@/components/RoutePlate";
import { pairingForPage } from "@/lib/plates";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandMark } from "@/components/Brand";
import Icon from "@/components/Icon";
import Toc from "@/components/Toc";
import { workEntries } from "@/content/work/registry";
import { findEntry, published } from "@/lib/content";
import { tocFor } from "@/lib/toc";
import { SITE_URL, person } from "@/lib/site";
import styles from "../work.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return published(workEntries).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = findEntry(workEntries, slug);
  if (!entry) return {};
  return {
    title: entry.title,
    description: entry.summary,
    alternates: { canonical: `/work/${entry.slug}/` },
    openGraph: {
      type: "article",
      title: `${entry.title} — ${person.name}`,
      description: entry.summary,
      url: `${SITE_URL}/work/${entry.slug}/`,
    },
  };
}

export default async function WorkEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = findEntry(workEntries, slug);
  if (!entry || entry.draft) notFound();

  const { Content } = entry;
  const sections = tocFor("work", entry.slug);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.summary,
    author: { "@type": "Person", name: person.name, url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/work/${entry.slug}/`,
    about: entry.stack,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Work",
        item: `${SITE_URL}/work/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: entry.title,
        item: `${SITE_URL}/work/${entry.slug}/`,
      },
    ],
  };

  const meta: { key: string; value: React.ReactNode; wide?: boolean }[] = [
    { key: "Role", value: entry.role },
    { key: "Timeframe", value: entry.timeframe },
    { key: "Status", value: entry.status },
    {
      key: "Stack",
      // Still the same interpuncted line, still the same strings — each item
      // just picks up its logo where the registry has one. Version suffixes are
      // handled by the lookup, so "Next.js 16" resolves and keeps its "16".
      value: entry.stack.map((item, i) => (
        <span key={item} className={styles.stackItem}>
          {i > 0 ? <span className={styles.stackSep}>·</span> : null}
          <BrandMark name={item} size={16} />
          {item}
        </span>
      )),
      wide: true,
    },
  ];

  return (
    <RoutePlate drums={pairingForPage(slug)}>
      {/* `data-wide` lifts the bleed ceiling Plate.module.css reads. Set from
          validated meta, so the layout decision travels with the entry. */}
      <article className="entry inner-section" data-wide={entry.wide || undefined}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([articleJsonLd, breadcrumbJsonLd]),
          }}
        />

        <div className="entry-head">
          <div className="stack stack--s">
            <Link className={styles.back} href="/work/">
              <Icon name="arrow-right" size="sm" className={styles.backArrow} />{" "}
              Work
            </Link>
            <p className="type-eyebrow-3 text-muted">{entry.kicker}</p>
            <h1 className="type-display-2 text-primary">{entry.title}</h1>
            <p className={`${styles.lede} type-body-1 text-secondary`}>
              {entry.summary}
            </p>
          </div>

          <dl className={styles.meta}>
            {meta.map((m) => (
              <div key={m.key} className={m.wide ? styles.metaWide : undefined}>
                <dt className={`${styles.metaKey} type-eyebrow-3`}>{m.key}</dt>
                <dd className={`${styles.metaValue} type-body-3`}>{m.value}</dd>
              </div>
            ))}
          </dl>

          {/* Rendered only when there is a measured result. An entry with nothing
            measured shows no outcome line rather than an adjective. */}
          {entry.outcome ? (
            <div className={styles.outcome}>
              <span className={`${styles.outcomeKey} type-eyebrow-3`}>
                Outcome
              </span>
              <p className="type-body-1 text-primary">{entry.outcome}</p>
            </div>
          ) : null}
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
            <Link className={styles.back} href="/work/">
              <Icon name="arrow-right" size="sm" className={styles.backArrow} />{" "}
              All work
            </Link>
          </div>
        </div>
      </article>
    </RoutePlate>
  );
}
