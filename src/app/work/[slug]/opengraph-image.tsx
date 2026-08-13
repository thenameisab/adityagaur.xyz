import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { workEntries } from "@/content/work/registry";
import { findEntry, routable } from "@/lib/content";
import { person } from "@/lib/site";

/**
 * THE WORK ENTRY OG CARD — the site's first share image, and it fixes a
 * standing bug rather than only adding a feature: `twitter.card` has been
 * `summary_large_image` in the root layout since the beginning while no route
 * ever produced an `og:image`, so every share of every page has been rendering
 * an empty large-image card.
 *
 * IT LIVES UNDER `[slug]`, WHICH IS THE WHOLE REASON IT CAN EXIST. The earlier
 * read was that a card for one entry needed a route of its own, and that a
 * static `/work/billing-platform/` segment beside `[slug]` would shadow the MDX
 * page it was meant to illustrate — which is true. A file convention inside the
 * dynamic segment sidesteps it completely: `generateStaticParams` fans this one
 * component out to a PNG per published entry at build time, so nothing is
 * shadowed and every entry gains a card instead of just one.
 *
 * THE PAPER IS THE LEDGER'S. `--paper` and `--paper-key` are lifted as literal
 * hex because Satori resolves no custom properties and no `color-mix()`, so the
 * three mixed roles this card uses are pre-computed below. That makes the card
 * read as the billing-platform entry's own register while still being the right
 * card for every other entry — the site's cream and key ink are the same family.
 *
 * SATORI IS NOT A BROWSER, and two of its limits shape the markup: there is no
 * `display: grid`, so every box here is flex, and a `div` with more than one
 * child must say `display: flex` explicitly or it silently renders only the
 * first. Both constraints are load-bearing, not stylistic.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// A static export has to know every path at build time, and an image route in a
// dynamic segment needs its own copy of the params — it does not inherit the
// page's. `routable`, matching the page route: hidden entries keep their
// card (the URL still gets shared), drafts never get one.
export function generateStaticParams() {
  return routable(workEntries).map((e) => ({ slug: e.slug }));
}

// Ledger tokens, resolved. globals.css states these as `color-mix()` against
// --paper-key and --paper; Satori evaluates neither, so each one is the computed
// sRGB result. Recompute these if --paper or --paper-key ever move.
const PAPER = "#f9f2df"; // --paper
const KEY = "#1a1714"; // --paper-key, i.e. --text-primary
const MUTED = "#504c45"; // --text-muted   (key 76% on paper)
const FAINT = "#666259"; // --text-faint   (key 66% on paper)
const RULE = "#b2ac9e"; // --border-default (key 32% on paper)

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = findEntry(workEntries, slug);

  const [serif, sans] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/og/InstrumentSerif-Regular.ttf")),
    readFile(join(process.cwd(), "src/assets/og/Geist-Regular.ttf")),
  ]);

  const title = entry?.title ?? "Work";
  const kicker = entry?.kicker ?? "Work";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: PAPER,
          // The paper margin, one level up from the page's own --paper-margin.
          // A card is a sheet and a sheet has margins on all four sides.
          padding: "72px 80px",
          fontFamily: "Geist",
        }}
      >
        {/* The head rule and the kicker. A hairline above the eyebrow is the
            page's most literal device, doing here what it does there: it says
            this is a document, and the document has started. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", height: 1, backgroundColor: RULE }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              paddingTop: 28,
            }}
          >
            <span
              style={{
                fontSize: 24,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: FAINT,
              }}
            >
              {kicker}
            </span>
            <span style={{ fontSize: 24, color: FAINT }}>Work</span>
          </div>
        </div>

        {/* The title, and it is the only thing on the card set in the display
            face. Instrument Serif ships one roman weight, so scale is the entire
            hierarchy here — which is the register's rule anyway. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontFamily: "Instrument Serif",
              fontSize: title.length > 28 ? 96 : 116,
              lineHeight: 1.04,
              color: KEY,
              // Satori has no `text-wrap: balance`; the measure does the work.
              maxWidth: 940,
            }}
          >
            {title}
          </span>
        </div>

        {/* The foot: the byline over a rule, the way a statement signs off. No
            summary line — a share card is read at a glance and at thumbnail
            size, and the title plus the kicker is what survives that. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              paddingBottom: 24,
            }}
          >
            <span style={{ fontSize: 30, color: KEY }}>{person.name}</span>
            <span style={{ fontSize: 26, color: MUTED }}>adityagaur.xyz</span>
          </div>
          {/* The double rule — globals.css §15's mark for a total, and the one
              place this card quotes the essay's own vocabulary. Three explicit
              boxes rather than a bordered one: the gap has to be a real element
              because Satori collapses a padded 3px box against a 1px child and
              the two lines render as one thick smear. Heavy over light, which is
              the direction a printed total is ruled. */}
          <div style={{ display: "flex", height: 2, backgroundColor: KEY }} />
          <div style={{ display: "flex", height: 3 }} />
          <div style={{ display: "flex", height: 1, backgroundColor: KEY }} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Instrument Serif", data: serif, style: "normal", weight: 400 },
        { name: "Geist", data: sans, style: "normal", weight: 400 },
      ],
    },
  );
}
