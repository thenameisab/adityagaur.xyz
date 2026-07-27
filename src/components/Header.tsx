import Link from "next/link";
import { person } from "@/lib/site";
import HeaderNav from "./HeaderNav";
import styles from "./Header.module.css";

/**
 * Sticky, 64px, fully transparent — content scrolls beneath it. No
 * backdrop-filter: blur behind a fixed bar costs a compositor layer on every
 * scroll frame, and buys nothing over a warm near-black ground.
 *
 * The scroll behaviour (links fade out scrolling down, a solid bordered bar
 * returns scrolling up) is pure CSS via scroll-state container queries. See
 * Header.module.css. Without support the header is a permanently transparent
 * sticky bar with every link visible — a complete experience, not a degraded one.
 */
export default function Header() {
  return (
    <header className={styles.root}>
      <span className={styles.scrim} aria-hidden="true" />
      <div className={`${styles.inner} container container--wide repel`}>
        <Link href="/" className={styles.wordmark}>
          {person.name}
        </Link>
        <HeaderNav />
      </div>
    </header>
  );
}
