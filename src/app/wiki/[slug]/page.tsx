import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import { wikiEntries, getEntry } from "@/lib/wiki";
import { SITE_URL, person } from "@/lib/site";
import styles from "../wiki.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return wikiEntries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) return {};
  return {
    title: entry.title,
    description: entry.summary,
    alternates: { canonical: `/wiki/${entry.slug}/` },
    openGraph: {
      type: "article",
      title: `${entry.title} — ${person.name}`,
      description: entry.summary,
      url: `${SITE_URL}/wiki/${entry.slug}/`,
    },
  };
}

export default async function WikiEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();

  const related = (entry.related ?? [])
    .map((s) => getEntry(s))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.summary,
    author: { "@type": "Person", name: person.name, url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/wiki/${entry.slug}/`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Wiki", item: `${SITE_URL}/wiki/` },
      {
        "@type": "ListItem",
        position: 3,
        name: entry.title,
        item: `${SITE_URL}/wiki/${entry.slug}/`,
      },
    ],
  };

  return (
    <article className="container container--prose inner-section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleJsonLd, breadcrumbJsonLd]),
        }}
      />

      <div className="stack stack--s">
        <Link className={styles.back} href="/wiki/">
          <Icon name="arrow-right" size="sm" className={styles.backArrow} /> Wiki
        </Link>
        <p className="type-eyebrow-3 text-muted">{entry.kicker}</p>
        <h1 className="type-display-2 text-primary">{entry.title}</h1>
        <p className={`${styles.lede} type-body-1 text-secondary`}>{entry.summary}</p>
      </div>

      <div className={`${styles.body} prose`}>
        {entry.sections.map((section, i) => (
          <section key={i}>
            {section.heading ? <h2>{section.heading}</h2> : null}
            {section.body?.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
            {section.list ? (
              <ul>
                {section.list.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      {related.length > 0 ? (
        <div className={styles.related}>
          <p className="type-eyebrow-3 text-muted">Related</p>
          <ul className={`${styles.pills} cluster`}>
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/wiki/${r.slug}/`} className={`${styles.pill} type-body-3`}>
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
