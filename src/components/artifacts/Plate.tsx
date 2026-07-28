import type { ReactNode } from "react";
import { PAIRINGS, type DrumsKey } from "@/lib/plates";
import styles from "./Plate.module.css";

type Props = {
  /** Which two drums this page loaded. One pairing per page, and the pairing
      decides the stock too — see PAIRINGS in src/lib/plates.ts. */
  drums: DrumsKey;
  /** Plate number within the page. Printed as "Plate 03". */
  n: number;
  /** The plate's own subject line, printed beside the number in the bar. */
  subject?: string;
  /** What the reader is looking at. Plain sentence, no "this figure shows". */
  caption?: string;
  /** Where the data came from, including when it is synthetic. */
  source?: string;
  /** Let the plate scroll horizontally instead of shrinking its contents. */
  scroll?: boolean;
  children: ReactNode;
};

/**
 * A colour plate tipped into the page.
 *
 * This is the difference between the plate system and a themed section: an
 * artifact is not a region of the page wearing the page's colours, it is
 * different stock with different inks bound in as a deliberate interruption. So
 * the frame is square-cornered, it states its own inks the way a print does, and
 * the caption sits OUTSIDE it — on the dark page, in the page's own type
 * colours, because the caption is prose about the plate rather than part of it.
 *
 * Supersedes `Figure`. Figure still works and is still exported so no MDX breaks
 * in the same commit as this one; it goes away once the last page converts.
 */
export default function Plate({
  drums,
  n,
  subject,
  caption,
  source,
  scroll = false,
  children,
}: Props) {
  const { stock } = PAIRINGS[drums];

  const plateClass = [
    styles.plate,
    "theme-plate",
    `drums-${drums}`,
    stock === "kraft" ? "stock-kraft" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <figure className={styles.root}>
      <div className={plateClass}>
        {/* The bar carries the plate's number and its subject, and nothing else.
            It used to also print the ink credit — "Teal + Fluorescent Pink on
            cream · overprinting … gives #00255f" — which was a mistake. Which
            drums are loaded and what they multiply to is authoring metadata: it
            documents the system rather than telling the reader anything about
            what they are looking at, and a hex value on a published page is
            simply a leak. That belongs on /styleguide#plates, where InkCredit
            still renders as the legend it was written to be.

            What stays is the equivalent of a figure number, which the caption
            below refers back to. */}
        <div className={styles.bar}>
          <span className={styles.number}>
            Plate {String(n).padStart(2, "0")}
            {subject ? <span className={styles.subject}>{subject}</span> : null}
          </span>
        </div>

        <div
          className={`${styles.frame} ${scroll ? styles.scroll : ""}`}
          data-scrollx={scroll || undefined}
        >
          {children}
        </div>
      </div>

      {caption || source ? (
        <figcaption className={styles.caption}>
          {caption ? (
            <p className={`${styles.captionText} type-body-3`}>
              <strong className="text-secondary">
                Plate {String(n).padStart(2, "0")}.{" "}
              </strong>
              {caption}
            </p>
          ) : null}
          {source ? (
            <p className={`${styles.source} type-body-4`}>{source}</p>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
