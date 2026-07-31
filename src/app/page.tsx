import Link from "next/link";
import RoutePlate from "@/components/RoutePlate";
import Hero from "@/components/Hero";
import Icon from "@/components/Icon";
import Card from "@/components/Card";
import TextLockup from "@/components/TextLockup";
import { person } from "@/lib/site";
import { entriesByCategory } from "@/lib/wiki";
import styles from "./home.module.css";

/**
 * CONTENT STATUS — BUILD-BRIEF §5.2 items 1, 2, 3, 4, 5 are outstanding.
 *
 * Rather than fabricate them, this page ships only what exists: the approved
 * identity copy from src/lib/site.ts, and the wiki, which is 12 real entries.
 * The "Currently", "Selected work", and "Recent writing" blocks specified in
 * §7.1 are ABSENT, not stubbed — per prime directive #3, a section without
 * content is not a section. Each returns as soon as its copy is written.
 *
 * TODO(Aditya): a 2–5 word headline. The tagline stands in for now because it
 * is your own approved copy, not invention — but it is a tagline, not a
 * headline, and it should be replaced.
 */

// The four entries that best answer "what does he think about" for a first-time
// reader. All real, all already written.
const FEATURED_WIKI = ["chief-of-staff", "building-with-ai", "tartan", "investing"];

export default function Home() {
  const featured = [...entriesByCategory("work"), ...entriesByCategory("life")]
    .filter((e) => FEATURED_WIKI.includes(e.slug))
    .sort((a, b) => FEATURED_WIKI.indexOf(a.slug) - FEATURED_WIKI.indexOf(b.slug));

  return (
    <RoutePlate drums="blue-orange">
      <Hero
        headline={person.tagline}
        lede={person.summary}
        action={
          <Link href="/wiki/" className={styles.heroLink}>
            Read the wiki <Icon name="arrow-right" size="sm" />
          </Link>
        }
      />

      <section className="theme-sand">
        <div className="container inner-section stack stack--l">
          <TextLockup
            eyebrow="Start here"
            title="A living map of what I do and care about."
            lede="Part work, part everything else — written plainly and updated as things change."
            size="display-3"
          />
          <div className={`${styles.cardGrid} grid`} data-reveal-stagger>
            {featured.map((entry, i) => (
              <div key={entry.slug} style={{ ["--i" as string]: i }}>
                <Card
                  href={`/wiki/${entry.slug}/`}
                  title={entry.title}
                  summary={entry.summary}
                  variant="compact"
                />
              </div>
            ))}
          </div>
          <p>
            <Link href="/wiki/" className={styles.moreLink}>
              All wiki entries <Icon name="arrow-right" size="sm" />
            </Link>
          </p>
        </div>
      </section>
    </RoutePlate>
  );
}
