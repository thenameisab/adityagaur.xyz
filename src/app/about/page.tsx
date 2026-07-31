import type { Metadata } from "next";
import RoutePlate from "@/components/RoutePlate";
import CopyEmail from "@/components/CopyEmail";
import Hero from "@/components/Hero";
import Icon from "@/components/Icon";
import TextLockup from "@/components/TextLockup";
import Timeline from "@/components/Timeline";
import { person } from "@/lib/site";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About",
  description: person.summary,
  alternates: { canonical: "/about/" },
};

/**
 * TODO(Aditya) — BUILD-BRIEF §5.2:
 *   item 6: a 200–350 word bio. The lede below is the approved summary from
 *           site.ts standing in; it is real copy, but it is not a bio.
 *   item 10: a portrait. Optional. There is no image slot here yet, and no
 *           decorative substitute — an empty, well-set page beats a borrowed
 *           photo (§5.3).
 *   The contact block renders LinkedIn only until person.email is set.
 */
export default function About() {
  return (
    <RoutePlate drums="green-teal">
      <Hero
        variant="page"
        eyebrow="About"
        headline="Aditya Gaur"
        lede={person.summary}
      />

      <section className="container inner-section">
        <TextLockup
          eyebrow="Career"
          title="Where I've worked"
          size="display-3"
          className={styles.lockup}
        />
        <div className={styles.timelineWrap}>
          <Timeline />
        </div>
      </section>

      <section id="contact" className="theme-sand">
        <div className="container inner-section stack stack--l">
          <TextLockup
            eyebrow="Contact"
            title="Get in touch"
            lede="The fastest way to reach me is LinkedIn. I read everything, and I reply to most of it."
            size="display-3"
          />
          <div className="cluster">
            <a
              className={styles.contactLink}
              href="https://www.linkedin.com/in/ad1tyagaur"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icon name="linkedin" size="sm" /> LinkedIn
              <Icon name="arrow-up-right" size="sm" />
            </a>
            {person.email ? (
              <>
                <a className={styles.contactLink} href={`mailto:${person.email}`}>
                  <Icon name="mail" size="sm" /> {person.email}
                </a>
                <CopyEmail email={person.email} />
              </>
            ) : null}
          </div>
        </div>
      </section>
    </RoutePlate>
  );
}
