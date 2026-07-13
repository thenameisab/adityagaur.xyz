import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FadeIn from "@/components/FadeIn";
import { wikiEntries, getEntry } from "@/lib/wiki";
import { SITE_URL, person } from "@/lib/site";

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
      { "@type": "ListItem", position: 3, name: entry.title, item: `${SITE_URL}/wiki/${entry.slug}/` },
    ],
  };

  return (
    <div className="wiki-shell wiki-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([articleJsonLd, breadcrumbJsonLd]) }}
      />

      <FadeIn>
        <Link className="wiki-back" href="/wiki/">
          ← Wiki
        </Link>
        <p className="wiki-kicker" style={{ marginTop: "1.75rem" }}>
          {entry.kicker}
        </p>
        <h1 className="h1-serif" style={{ fontSize: "clamp(2.75rem, 6vw, 4.5rem)" }}>
          {entry.title}
        </h1>
        <p className="wiki-lede">{entry.summary}</p>
      </FadeIn>

      <FadeIn delay={0.08}>
        <div style={{ marginTop: "2.5rem" }}>
          {entry.sections.map((section, i) => (
            <div key={i}>
              {section.heading && <h2>{section.heading}</h2>}
              {section.body?.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
              {section.list && (
                <ul>
                  {section.list.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </FadeIn>

      {related.length > 0 && (
        <FadeIn delay={0.12}>
          <div className="wiki-related">
            <p className="wiki-kicker">Related</p>
            <div className="wiki-related-links">
              {related.map((r) => (
                <Link key={r.slug} href={`/wiki/${r.slug}/`}>
                  {r.title}
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
