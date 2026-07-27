import type { Metadata } from "next";
import Card from "@/components/Card";
import Hero from "@/components/Hero";
import { wikiCategories, entriesByCategory } from "@/lib/wiki";
import { person } from "@/lib/site";
import styles from "./wiki.module.css";

export const metadata: Metadata = {
  title: "Wiki",
  description: `A personal wiki by ${person.name} — the work, the training behind it, and the things I care about outside of it.`,
  alternates: { canonical: "/wiki/" },
};

export default function WikiIndex() {
  return (
    <>
      <Hero
        variant="page"
        eyebrow="Personal wiki"
        headline="A living map of what I do and care about."
        lede="Part work, part everything else. I keep this as a small, honest reference — written plainly, updated as things change."
      />

      <div className="container inner-section stack stack--xl">
        {wikiCategories.map((cat) => {
          const entries = entriesByCategory(cat.id);
          return (
            <section key={cat.id}>
              <h2 className={`${styles.catLabel} type-eyebrow-3 text-muted`}>{cat.label}</h2>
              <div className={styles.grid} data-reveal-stagger>
                {entries.map((entry, i) => (
                  <div key={entry.slug} style={{ ["--i" as string]: Math.min(i, 5) }}>
                    <Card href={`/wiki/${entry.slug}/`} title={entry.title} summary={entry.summary} />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
