import Link from "next/link";
import CopyEmail from "./CopyEmail";
import Icon from "./Icon";
import { person, routes } from "@/lib/site";
import styles from "./PageFooter.module.css";

const YEAR = 2026;

// Everything except the colophon and the home route, which the wordmark covers.
const siteLinks = routes.filter((r) => r.path !== "/");

export default function PageFooter() {
  return (
    <footer className={styles.root}>
      <div className="container">
        <div className={`${styles.columns} inner-section inner-section--sm`}>
          <div className="stack stack--s">
            <Link href="/" className={styles.wordmark}>
              {person.name}
            </Link>
            <p className="type-body-3 text-muted">{person.tagline}</p>
          </div>

          <nav className="stack stack--xs" aria-label="Footer">
            <h2 className={`${styles.colHeading} type-eyebrow-3 text-faint`}>Site</h2>
            {siteLinks.map((r) => (
              <Link key={r.path} href={r.path} className={`${styles.link} type-body-3`}>
                {r.title}
              </Link>
            ))}
          </nav>

          <div className="stack stack--xs">
            <h2 className={`${styles.colHeading} type-eyebrow-3 text-faint`}>Elsewhere</h2>
            <a
              className={`${styles.link} type-body-3`}
              href="https://www.linkedin.com/in/ad1tyagaur"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icon name="linkedin" size="sm" /> LinkedIn
              <Icon name="arrow-up-right" size="sm" />
            </a>
            <a
              className={`${styles.link} type-body-3`}
              href="https://blog.adityagaur.xyz"
              rel="noopener noreferrer"
              target="_blank"
            >
              Blog
              <Icon name="arrow-up-right" size="sm" />
            </a>
            {person.email ? (
              <span className={styles.emailRow}>
                <a className={`${styles.link} type-body-3`} href={`mailto:${person.email}`}>
                  <Icon name="mail" size="sm" /> {person.email}
                </a>
                <CopyEmail email={person.email} />
              </span>
            ) : null}
          </div>
        </div>

        <p className={`${styles.legal} type-body-4 text-faint`}>
          © {YEAR} {person.name}
        </p>
      </div>
    </footer>
  );
}
