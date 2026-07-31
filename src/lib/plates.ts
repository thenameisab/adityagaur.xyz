/**
 * The plate system, as data.
 *
 * globals.css owns the *rendering* of these values — the ink library on `:root`,
 * the seventeen `.drums-*` classes (ten artifact plates and seven route plates),
 * `.theme-plate`, and `.theme-vibrant`. This file owns the *facts about them*
 * that TypeScript needs: which drums a page loads, what to call them in an ink
 * credit, and what the overprint and slip work out to.
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

export type StockName = "cream" | "kraft" | "grey";

/**
 * Three stocks: cream for Work, kraft for Writing, newsprint grey for
 * /styleguide. Grey ships with Vibrant Mode — see the stock comment in
 * globals.css §2 for why it was held back until there was something to print on
 * it, and why it ends up carrying one page rather than the two that were planned.
 */
export const STOCKS: Record<StockName, { hex: string; label: string }> = {
  cream: { hex: "#f4efe4", label: "cream" },
  kraft: { hex: "#eadfc8", label: "kraft" },
  grey: { hex: "#e6e4dd", label: "newsprint" },
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
    page: "policy-prototype",
    stock: "cream",
    rationale: "Approve and decline — the page's whole argument, in two drums.",
  },
  "pink-blue": {
    a: "fluoro-pink",
    b: "blue",
    overprint: "#002284",
    separation: 0.244,
    slip: [0.2, 2.4],
    page: "sync-console-rework",
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

/* ── The route plates ──────────────────────────────────────────────────────
   Vibrant Mode's second run. Same mechanism, different thing being plated: the
   ten above wrap a figure, these seven wrap a whole route.

   They are a separate record rather than seven more entries in PAIRINGS because
   the two are not interchangeable at the type level and should not be.
   `<Plate drums={...}>` takes a DrumsKey, and a route plate is not a legal
   argument to it — a route's colour belongs to the page, and an artifact that
   borrowed it would print a figure that vanishes into its own ground.

   Seven, because only seven routes are pages that need one. An ENTRY reuses its
   own subject's pairing from PAIRINGS above, so /work/loam is printed in Loam's
   inks and the page agrees with its own figures. A REDIRECT (/projects,
   /essays, /journey, /contact) keeps the chrome plate, because it renders one
   line and leaves. The wiki's twelve entries share the wiki index's plate: a
   reference work is bound as one book.

   Four text-safe pairings are therefore still on the shelf, and /styleguide
   says so. Inventing a route to spend one, or a pairing to fill one, would both
   be worse than an unspent drum. */

export type RouteDrumsKey =
  | "blue-orange"
  | "teal-red"
  | "green-orange"
  | "blue-teal"
  | "green-teal"
  | "yellow-purple"
  | "purple-red";

export type RoutePairing = Omit<Pairing, "page"> & {
  /** The route this plate prints, as it appears in the URL. */
  route: string;
  /** The slug the slip hashes. Home has no path segment, so it hashes "home". */
  slug: string;
  /** The pairing's loud pass — the drum that may be laid at full strength with
      key ink on top of it. */
  loud: InkName;
  /** True when NEITHER drum clears AA with key ink, so the loud pass is
      display-size only (24px+, where 3:1 is the bar). One route plate is in this
      condition, which .drums-purple-teal already ships and documents. Carried as
      data rather than a comment so /styleguide#vibrant prints the constraint and
      scripts/verify-vibrant.ts can assert it. */
  largeOnly?: true;
};

export const ROUTE_PAIRINGS: Record<RouteDrumsKey, RoutePairing> = {
  "blue-orange": {
    a: "blue",
    b: "orange",
    overprint: "#003323",
    separation: 0.305,
    slip: [2.8, 0.4],
    route: "/",
    slug: "home",
    stock: "cream",
    loud: "orange",
    rationale:
      "The house plate, and the highest separation left in the library. Also the site chrome, so the header and footer are printed in the front cover's inks.",
  },
  "teal-red": {
    a: "teal",
    b: "bright-red",
    overprint: "#002934",
    separation: 0.3,
    slip: [0.0, 0.4],
    route: "/work",
    slug: "work",
    stock: "cream",
    loud: "bright-red",
    rationale:
      "The deepest overprint available at 13.40:1 — the index that carries the most type gets the strongest type colour.",
  },
  "green-orange": {
    a: "green",
    b: "orange",
    overprint: "#004811",
    separation: 0.301,
    slip: [3.0, 0.2],
    route: "/writing",
    slug: "writing",
    stock: "kraft",
    loud: "orange",
    rationale: "Kraft, because the stock follows the section and this is Writing.",
  },
  "blue-teal": {
    a: "blue",
    b: "teal",
    overprint: "#003e67",
    separation: 0.208,
    slip: [0.2, 0.2],
    route: "/wiki",
    slug: "wiki",
    stock: "cream",
    loud: "teal",
    largeOnly: true,
    rationale: "One hue at two temperatures — a reference work, not an argument.",
  },
  "green-teal": {
    a: "green",
    b: "teal",
    overprint: "#005732",
    separation: 0.169,
    slip: [2.8, 0.4],
    route: "/about",
    slug: "about",
    stock: "cream",
    loud: "green",
    rationale: "The quietest pairing on the site, for the page that is just a person talking.",
  },
  "yellow-purple": {
    a: "yellow",
    b: "purple",
    overprint: "#765300",
    separation: 0.213,
    slip: [2.2, 0.8],
    route: "/colophon",
    slug: "colophon",
    stock: "cream",
    loud: "yellow",
    rationale:
      "The loudest ink in the library (14.56:1 with key) on the page about how the site is made. Cream is forced rather than chosen: a yellow overprint is the lightest there is, and #765300 clears the floor on cream alone.",
  },
  "purple-red": {
    a: "purple",
    b: "bright-red",
    overprint: "#701d3f",
    separation: 0.197,
    slip: [2.8, 1.4],
    route: "/styleguide",
    slug: "styleguide",
    stock: "grey",
    loud: "bright-red",
    rationale:
      "Newsprint, on the page that documents the stocks — and the library's only warm-dark overprint, so the page that publishes every ratio is not printed in the same cool navy as half the site.",
  },
};

/**
 * The class list that puts a route's plate on its wrapper.
 *
 * Emitted unconditionally, in both themes. The `.drums-*` class sets five
 * custom properties that only `.theme-plate` reads, so under `.theme-dark` this
 * is inert — which is what lets the plate ship in the static HTML and be correct
 * in the first painted frame rather than after a client-side theme read. See
 * globals.css §3.1.
 */
export function routePlate(drums: RouteDrumsKey | DrumsKey): string {
  const p =
    drums in ROUTE_PAIRINGS
      ? ROUTE_PAIRINGS[drums as RouteDrumsKey]
      : PAIRINGS[drums as DrumsKey];
  return `drums-${drums}${p.stock === "cream" ? "" : ` stock-${p.stock}`}`;
}

/**
 * The pairing an ENTRY page prints in — its own subject's, from PAIRINGS.
 *
 * Returns null for a slug with no pairing, and exactly one slug is in that
 * position: `billing-platform`. That is not an oversight to be filled in later.
 * The FinLog page is written in the two registers (globals.css §15), which are
 * pinned in both themes because they are the page's argument about paper and
 * screen rather than a lighting preference. Giving it a route plate would put a
 * third colour system on the one page that already has two and means it.
 */
export function pairingForPage(slug: string): DrumsKey | null {
  const hit = (Object.keys(PAIRINGS) as DrumsKey[]).find(
    (k) => PAIRINGS[k].page === slug,
  );
  return hit ?? null;
}

/** "Fluorescent Pink + Teal on cream" — authentic to the medium, and it doubles
    as the plate's legend. Takes the pairing rather than a key so that artifact
    and route plates, whose keys are deliberately different types, share one
    implementation. */
export function creditFor(p: Pick<Pairing, "a" | "b" | "stock">): string {
  return `${INKS[p.a].label} + ${INKS[p.b].label} on ${STOCKS[p.stock].label}`;
}

export function inkCredit(drums: DrumsKey): string {
  return creditFor(PAIRINGS[drums]);
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
