import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import { wikiCategories, entriesByCategory } from "@/lib/wiki";
import { person } from "@/lib/site";

export const metadata: Metadata = {
  title: "Wiki",
  description: `A personal wiki by ${person.name} — the work, the training behind it, and the things I care about outside of it.`,
  alternates: { canonical: "/wiki/" },
};

export default function WikiIndex() {
  return (
    <div className="wiki-shell wiki-article">
      <FadeIn>
        <p className="wiki-kicker">Personal wiki</p>
        <h1 className="h1-serif" style={{ fontSize: "clamp(3rem, 7vw, 5rem)" }}>
          A living map of what I do and care about.
        </h1>
        <p className="wiki-lede">
          Part work, part everything else. I keep this as a small, honest reference — written plainly,
          updated as things change.
        </p>
      </FadeIn>

      {wikiCategories.map((cat, ci) => {
        const catEntries = entriesByCategory(cat.id);
        return (
          <section key={cat.id}>
            <p className="wiki-cat-label">{cat.label}</p>
            <div className="wiki-grid">
              {catEntries.map((entry, i) => (
                <FadeIn key={entry.slug} delay={0.05 * i + ci * 0.04}>
                  <Link className="wiki-card" href={`/wiki/${entry.slug}/`}>
                    <h3>
                      {entry.title} <span className="wiki-card-arrow">→</span>
                    </h3>
                    <p>{entry.summary}</p>
                  </Link>
                </FadeIn>
              ))}
              {catEntries.length % 2 === 1 && <div className="wiki-grid-spacer" aria-hidden="true" />}
            </div>
          </section>
        );
      })}
    </div>
  );
}
