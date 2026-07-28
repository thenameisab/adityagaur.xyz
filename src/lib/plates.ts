/**
 * The plate system, as data.
 *
 * globals.css owns the *rendering* of these values — the ink library on `:root`,
 * the ten `.drums-*` classes, and `.theme-plate`. This file owns the *facts about
 * them* that TypeScript needs: which drums a page loads, what to call them in an
 * ink credit, and what the overprint and slip work out to.
 *
 * The duplication of hex values between here and globals.css is the same
 * necessary duplication `src/lib/contrast.ts` already documents: CSS custom
 * properties aren't readable at build time. /styleguide#plates renders each
 * swatch from the real CSS token while stating the hex from this file, so a
 * drift between the two shows up as a swatch that doesn't match its own label.
 *
 * Every number here was computed by `scripts/riso-library.mjs`, not estimated.
 */

export type InkName =
  | "fluoro-pink"
  | "blue"
  | "yellow"
  | "green"
  | "orange"
  | "purple"
  | "teal"
  | "bright-red";

/** The eight drums, with the names a print shop would put on the job ticket. */
export const INKS: Record<InkName, { hex: string; label: string }> = {
  "fluoro-pink": { hex: "#ff48b0", label: "Fluorescent Pink" },
  blue: { hex: "#0078bf", label: "Blue" },
  yellow: { hex: "#ffe800", label: "Yellow" },
  green: { hex: "#00a95c", label: "Green" },
  orange: { hex: "#ff6c2f", label: "Orange" },
  purple: { hex: "#765ba7", label: "Purple" },
  teal: { hex: "#00838a", label: "Teal" },
  "bright-red": { hex: "#f15060", label: "Bright Red" },
};

/** Key ink, for type. Not pure black — the site has no pure black anywhere. */
export const KEY = "#171514";

export type StockName = "cream" | "kraft";

/** Two stocks: cream for Work, kraft for Writing. */
export const STOCKS: Record<StockName, { hex: string; label: string }> = {
  cream: { hex: "#f4efe4", label: "cream" },
  kraft: { hex: "#eadfc8", label: "kraft" },
};

/** The key of a loaded pairing, which is also its CSS class minus the prefix. */
export type DrumsKey =
  | "teal-pink"
  | "orange-teal"
  | "blue-red"
  | "pink-blue"
  | "green-purple"
  | "orange-purple"
  | "green-red"
  | "blue-yellow"
  | "purple-teal"
  | "pink-green";

export type Pairing = {
  /** Drum A — the first pass. Carries "held, stable, verified". */
  a: InkName;
  /** Drum B — the second pass. Carries "the reader's own action". */
  b: InkName;
  /** A × B, multiplied. The plate's type colour. */
  overprint: string;
  /** OKLab distance from the nearer parent ink. Below 0.12 the second pass is
      wasted, which is what rejected 6 of the 28 possible pairs. */
  separation: number;
  /** Deterministic misregistration, FNV-1a over the page slug. */
  slip: [x: number, y: number];
  /** The page that loads these drums. */
  page: string;
  stock: StockName;
  /** Why this pairing, for this subject. Rendered in the styleguide. */
  rationale: string;
};

/**
 * Ten pairings, no repeats, every overprint text-safe on its own stock. The
 * pairing is chosen for the subject rather than at random — which is the point
 * of the whole system: sixteen artifacts read as a series of prints instead of
 * one design repeated sixteen times. Colour varies; meaning does not.
 */
export const PAIRINGS: Record<DrumsKey, Pairing> = {
  "teal-pink": {
    a: "teal",
    b: "fluoro-pink",
    overprint: "#00255f",
    separation: 0.29,
    slip: [2.8, 0.8],
    page: "loam",
    stock: "cream",
    rationale: "Cold precision, one hot signal for divergence.",
  },
  "orange-teal": {
    a: "orange",
    b: "teal",
    overprint: "#003719",
    separation: 0.27,
    slip: [2.0, 1.6],
    page: "integration-islands",
    stock: "kraft",
    rationale: "Water, and the connective layer laid across it.",
  },
  "blue-red": {
    a: "blue",
    b: "bright-red",
    overprint: "#002648",
    separation: 0.297,
    slip: [1.8, 2.8],
    page: "policyos",
    stock: "cream",
    rationale: "Approve and decline — the page's whole argument, in two drums.",
  },
  "pink-blue": {
    a: "fluoro-pink",
    b: "blue",
    overprint: "#002284",
    separation: 0.244,
    slip: [0.2, 2.4],
    page: "hypersync-rework",
    stock: "cream",
    rationale: "The canonical riso duo, for the design-system page.",
  },
  "green-purple": {
    a: "green",
    b: "purple",
    overprint: "#003c3c",
    separation: 0.253,
    slip: [2.4, 1.0],
    page: "wealthlens",
    stock: "cream",
    rationale: "Growth against uncertainty.",
  },
  "orange-purple": {
    a: "orange",
    b: "purple",
    overprint: "#76271f",
    separation: 0.216,
    slip: [2.8, 0.2],
    page: "crm-dashboard",
    stock: "cream",
    rationale: "Alert warmth, pipeline integrity.",
  },
  "green-red": {
    a: "green",
    b: "bright-red",
    overprint: "#003523",
    separation: 0.368,
    slip: [3.0, 0.4],
    page: "mgmt-dash",
    stock: "cream",
    rationale: "Permitted and withheld.",
  },
  "blue-yellow": {
    a: "blue",
    b: "yellow",
    overprint: "#006d00",
    separation: 0.251,
    slip: [2.2, 3.0],
    page: "internal-wiki",
    stock: "cream",
    rationale:
      "The overprint is green, which is the surprise riso is loved for. Also the weakest overprint at 5.75:1 — still AA, but the one pairing where the type colour is lighter than --text-muted.",
  },
  "purple-teal": {
    a: "purple",
    b: "teal",
    overprint: "#002f5a",
    separation: 0.245,
    slip: [1.8, 2.2],
    page: "company-brain",
    /* Kraft, not cream: this piece is filed under Writing, and the stock follows
       the section rather than the subject. It is the second Writing page and the
       second kraft plate. */
    stock: "kraft",
    rationale: "Confidence grades: cool, and graded.",
  },
  "pink-green": {
    a: "fluoro-pink",
    b: "green",
    overprint: "#00303f",
    separation: 0.389,
    slip: [0.4, 0.8],
    page: "outreach-sequencer",
    stock: "cream",
    rationale: "The loudest pairing available, and the highest separation.",
  },
};

/** "Fluorescent Pink + Teal on cream" — authentic to the medium, and it doubles
    as the plate's legend. */
export function inkCredit(drums: DrumsKey): string {
  const p = PAIRINGS[drums];
  return `${INKS[p.a].label} + ${INKS[p.b].label} on ${STOCKS[p.stock].label}`;
}

/**
 * FNV-1a over a slug, two nibbles per axis mapped to 0–3px. Exported so the
 * styleguide can prove the slip values in `PAIRINGS` are the ones this function
 * produces, rather than numbers somebody typed in.
 */
export function slipFor(slug: string): [number, number] {
  let h = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return [((h >>> 0) & 0xf) / 5, ((h >>> 8) & 0xf) / 5];
}

/**
 * Multiply two hex colours — what two translucent inks on one sheet actually do.
 * Exported so the styleguide can verify each `overprint` literal above instead
 * of taking it on trust. Note this is NOT what color-mix() computes, which is
 * why the overprints are authored as literals in globals.css.
 */
export function multiply(a: string, b: string): string {
  const ch = (hex: string, i: number) =>
    parseInt(hex.replace("#", "").slice(i * 2, i * 2 + 2), 16);
  return (
    "#" +
    [0, 1, 2]
      .map((i) =>
        Math.round((ch(a, i) * ch(b, i)) / 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
