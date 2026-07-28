"use client";

import { useState } from "react";
import styles from "./TourEmbed.module.css";

/**
 * The real product tour, embedded.
 *
 * `/hypersync-tour/index.html` is the shipped artifact — a 938-line single
 * file with one style block, one script block, and 35 inline SVGs. The only
 * edits made for this embed are neutralising two outbound marketing links.
 *
 * It loads on click rather than on page load: 70 KB of someone else's
 * keyboard handlers has no business running before the reader asks for it.
 * The iframe is sandboxed to scripts only — the tour needs nothing else.
 */
export default function TourEmbed() {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.root}>
      {open ? (
        <iframe
          className={styles.frame}
          src="/hypersync-tour/index.html"
          title="HyperSync product tour — interactive walkthrough of six mocked screens"
          sandbox="allow-scripts"
          loading="lazy"
        />
      ) : (
        <button
          type="button"
          className={styles.launch}
          onClick={() => setOpen(true)}
        >
          <span className={`${styles.launchTitle} type-headline-4`}>
            Run the tour
          </span>
          <span className={`${styles.launchNote} type-body-3`}>
            16 steps across 6 mocked screens. Arrow keys advance. All data is
            fictional. Loads a 70&nbsp;KB self-contained file on click.
          </span>
        </button>
      )}
    </div>
  );
}
