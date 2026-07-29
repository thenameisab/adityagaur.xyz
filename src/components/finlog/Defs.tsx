/**
 * The FinLog page's shared SVG definitions — nine chapter marks, two arrows, and
 * one distress filter. Rendered once per page, exactly as IconSprite is rendered
 * once in the root layout: static export inlines it, and it costs no JS.
 *
 * ── System C ────────────────────────────────────────────────────────────────
 * A third construction system, alongside IconSprite's two (BUILD-BRIEF §6.9).
 * Its rule is one line and it comes from the page rather than from icon
 * convention: THE MARK IS DRAWN IN THE PAGE'S OWN HAIRLINE.
 *
 *   64×64 · fill none · stroke currentColor · stroke-width 1 with
 *   vector-effect: non-scaling-stroke · butt caps · miter joins
 *
 * `non-scaling-stroke` is the load-bearing part and it is not a convenience. A
 * rule does not get thicker when the drawing gets bigger — not on paper and not
 * here — so every mark is exactly one hairline at every size it is used, from a
 * 20px rail entry to a 64px chapter threshold. It also removes the failure the
 * naive version has: a 1-unit stroke in a 64 viewBox rendered at 20px is 0.3px
 * and disappears.
 *
 * Butt caps and miter joins, where System A uses round. Round caps read as UI.
 * A ledger rule ends square, and --bdrs-xs already carries the same reasoning
 * ("near-square reads institutional").
 *
 * There is deliberately no `pathLength` here, and no stroke-dash anything. The
 * draw-on is a clip wipe instead — Mark.module.css records why at length, but the
 * short version is that a dash-based draw cannot coexist with
 * `non-scaling-stroke`, and the rule is worth more than the effect.
 *
 * ── The marks ───────────────────────────────────────────────────────────────
 * Each is a miniature figure derived from its own chapter's argument (§6.1) —
 * geometry, not illustration. This is the device worth taking from Tines' era
 * emblems and the illustration budget worth refusing: nine small drawings, and
 * they pay for themselves four times over across the thresholds, the chapter
 * rail, the Work index card, and the OG image.
 */

/** Chapter marks, in invoice-line order. The label is what the mark argues. */
export const MARKS = [
  { line: "001", label: "Seventy-seven sheets", figure: "77 ticks in an 11×7 grid — a spreadsheet, counted" },
  { line: "002", label: "One number bills", figure: "two offset sheets, the top one opaque" },
  { line: "003", label: "Resolving a single call", figure: "a four-rung ladder, bottom rung broken" },
  { line: "004", label: "Four models, one view", figure: "four rate curves, tier and slab crossing" },
  { line: "005", label: "The schema", figure: "eight ruled boxes, four arrows folding back" },
  { line: "006", label: "Naming as infrastructure", figure: "a word struck through, its replacement below" },
  { line: "007", label: "What leaks", figure: "three vessels, one with no floor" },
  { line: "008", label: "Auditing the dashboard", figure: "two lines parallel, then diverging" },
  { line: "009", label: "Your invoice", figure: "a total above a double rule" },
] as const;

export type MarkLine = (typeof MARKS)[number]["line"];

/**
 * 001 — the manual month-end. Seventy-seven sheets, and the count is literal:
 * eleven ticks across, seven rows down, which is also the shape of the thing it
 * describes. A spreadsheet.
 *
 * This is the one mark whose geometry is arithmetic rather than drawn, because
 * hand-typing seventy-seven subpaths would be error-prone and would add no design
 * decision. It is still static, still server-rendered, and still inlined — the
 * §6 rule bars runtime generation in the browser, not a loop at module scope.
 *
 * Why not a single stack of 77 hairlines, which is what the plan describes:
 * 77 lines across 48 units is a 0.62 pitch, so at the 64px size the mark is
 * actually used it resolves to a grey block rather than to anything countable.
 * A mark that reads as a smudge at its own size has failed. The grid keeps the
 * count honest AND stays legible, and it says "spreadsheet" rather than
 * "stack of paper", which is the truer subject of chapter 001.
 */
const GRID_ROWS = 7;
const GRID_COLS = 11;
const SHEET_TICKS = Array.from({ length: GRID_ROWS }, (_, r) => {
  const y = (11 + r * 6.6).toFixed(1);
  return Array.from({ length: GRID_COLS }, (_, c) => `M${(8 + c * 4.4).toFixed(1)} ${y}h3`).join("");
});

/**
 * The two arrows. System C as well, and the reason is measured rather than
 * asserted — I scanned both shipped faces:
 *
 *   Instrument Serif   stem 68 · horizontal 25.4   (contrast ratio 2.7 : 1)
 *   Geist Mono         stem 84 · horizontal 84     (1 : 1, by definition)
 *
 * IconSprite's System B arrow is a FILLED glyph with a tapering shaft, because
 * the face it accompanies has contrast and a serif's stroke thins where it
 * turns. FinLog's figures are monospaced, and a monospace has no contrast at
 * all — so its arrow is an untapered monoline stroke at the face's single
 * weight. The construction difference IS the face difference, which is why this
 * is a new arrow rather than a restyled one.
 *
 * Weight: 84/1000 em. The viewBox is 22 units to the em (Icon.module.css sizes
 * the box at 1em and `meet` fits the longer axis), so the stroke is 0.084 × 22 =
 * 1.85 units. Not a judgement call — it is the face's own stem.
 *
 * The plan's §6 caveat for this item has been overtaken in one respect worth
 * noting: it assumed the page would use neither Instrument Serif nor EB
 * Garamond, so the existing arrows would read as foreign everywhere. §5.3 then
 * resolved the display face back to Instrument Serif. So the site's arrow is NOT
 * foreign beside FinLog's display type — it is foreign only beside its MONO,
 * which is where these two go.
 */
const ARROW_STROKE = 1.85;
const ARROW_PATH = "M2 12.3H20M14.6 6.9 20 12.3 14.6 17.7";

export default function FinlogDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {/* ── The distress mask ──
            One filter, shared by every stamp, declared once and rendered once.
            Never animated: an animated feTurbulence re-runs the noise every
            frame and is the most expensive thing this page could do.

            Applied to HTML text rather than to SVG text, per the §6 governing
            rule — a stamp is a word, so it stays in the DOM where it can be
            selected and read out, and the filter reaches it through CSS. */}
        <filter
          id="finlog-distress"
          x="-12%"
          y="-12%"
          width="124%"
          height="124%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.82"
            numOctaves="2"
            seed="7"
            result="ink"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="ink"
            scale="0.9"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* ── The nine chapter marks ──
            Attributes sit on the symbol so they inherit to every path, which is
            also what lets the draw-on animate one inherited property from the
            <use> site rather than reaching into a shadow tree. */}
        {MARKS.map(({ line }, i) => (
          <symbol
            key={line}
            id={`finlog-mark-${line}`}
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="butt"
            strokeLinejoin="miter"
            vectorEffect="non-scaling-stroke"
          >
            {MARK_PATHS[i].map((d, j) => (
              <path key={j} d={d} vectorEffect="non-scaling-stroke" />
            ))}
          </symbol>
        ))}

        {/* ── The two arrows ── */}
        <symbol
          id="finlog-arrow-right"
          viewBox="0 0 22 19"
          fill="none"
          stroke="currentColor"
          strokeWidth={ARROW_STROKE}
          strokeLinecap="butt"
          strokeLinejoin="miter"
        >
          <path d={ARROW_PATH} />
        </symbol>

        {/* The same glyph rotated about its own axis, so the pair reads as one
            construction — identical to how System B derives its second arrow. */}
        <symbol
          id="finlog-arrow-up-right"
          viewBox="0 0 22 19"
          fill="none"
          stroke="currentColor"
          strokeWidth={ARROW_STROKE}
          strokeLinecap="butt"
          strokeLinejoin="miter"
        >
          <path d={ARROW_PATH} transform="rotate(-45 11 12.3)" />
        </symbol>
      </defs>
    </svg>
  );
}

/**
 * Path data, one array per mark, in the order MARKS declares them.
 *
 * Live area is 8 → 56 in a 64 box, so every mark carries the same 8-unit margin
 * and they optically align when set in a column down the chapter rail.
 */
const MARK_PATHS: string[][] = [
  // 001 — the spreadsheet. 77 ticks, 11 across and 7 down.
  SHEET_TICKS,

  // 002 — derive beneath, finalize above. Two sheets, offset, and the top one is
  // opaque. Opacity in a monoline drawing is not a fill: it is the LINES YOU DO
  // NOT DRAW. The back sheet's right edge and bottom edge stop where the front
  // sheet begins, which is exactly what occlusion looks like and needs no fill
  // colour — so the mark stays monoline and works on any ground.
  // The front sheet carries a double rule, because it is the one that bills.
  [
    "M8 8H42V20",
    "M8 8V42H20",
    "M20 20H54V54H20Z",
    "M25 29H49M25 35H49",
    "M33 45H49M33 48H49",
  ],

  // 003 — the precedence chain and the fall-through. Four rungs, and the bottom
  // one is broken: sandbox, then bundle, then client price, then nothing. The
  // gap is the fall-through — billable, priced at zero, invoiced by nobody.
  ["M20 8V56M44 8V56", "M20 17H44", "M20 28H44", "M20 39H44", "M20 50H27M37 50H44"],

  // 004 — four models, one view. Took three attempts and both failures are worth
  // recording, because they were the same failure twice.
  //
  // First: four curves through one 48-unit box, and it came out an illegible
  // tangle — the crossing that is the entire point of the mark was the least
  // readable thing in it. Second: staggered origins and spread endpoints, which
  // barely helped, because four monotonic lines across the same span occupy the
  // same space no matter where they start.
  //
  // What fixed it was not the curves, it was the AXIS. Without a frame the eye has
  // no reason to read rising strokes as plotted data, so it reads them as
  // scribble; with an L of two hairlines it reads them as a chart immediately, and
  // the same four curves become legible. The lesson is that the mark was missing
  // context, not clarity.
  //
  // Slab is the curve carrying the argument, and it is the only one with a DROP.
  // Whole-volume pricing reprices the entire month at the lower rate once a
  // threshold is crossed, so total revenue genuinely FALLS at the boundary before
  // climbing again. That step is why tier and slab cross, why a product needs
  // both, and why nobody guesses this shape correctly.
  [
    "M12 12V52H56",
    "M12 52 56 44",
    "M12 52H24L28 46 56 36",
    "M12 52C28 42 38 34 56 28",
    "M12 52 32 46 32 50 56 14",
  ],

  // 005 — effective-dating as a temporal join. Eight rows in two states, and
  // four arrows running from the later row back to the row in force on the date
  // being replayed. The arrows point BACKWARD in time, which is the only reason
  // the engine can recompute any past month without a rate change ever being
  // retroactive.
  [
    "M8 12h9v7H8zM20 12h9v7h-9zM32 12h9v7h-9zM44 12h9v7h-9z",
    "M8 40h9v7H8zM20 40h9v7h-9zM32 40h9v7h-9zM44 40h9v7h-9z",
    "M12.5 40V21M10.9 22.6 12.5 21l1.6 1.6",
    "M24.5 40V21M22.9 22.6 24.5 21l1.6 1.6",
    "M36.5 40V21M34.9 22.6 36.5 21l1.6 1.6",
    "M48.5 40V21M46.9 22.6 48.5 21l1.6 1.6",
  ],

  // 006 — the relabel migration. A word struck through and its replacement set
  // below: slab → tier, revenue-neutral, arithmetic untouched. Vacating the
  // wrong word before the right model could have its correct name.
  //
  // Equal-height stems read as a comb rather than as a word, which is how the
  // first version failed. Three things turn it back into language: the heights
  // alternate between ascender and x-height, one stem drops below the baseline as
  // a descender, and the baseline overhangs the stems at both ends the way a line
  // of set text does.
  // The word is also set taller than the obvious 8 units, so the strike has room
  // to sit clear of the baseline. At the first spacing the two horizontals were
  // 3.5 units apart and read as a pair of rules rather than as a line of text with
  // a line through it.
  [
    "M13 28H47M17 18V28M22 21V28M27 18V28M32 21V31M37 18V28M42 21V28",
    "M11 22.5H49",
    "M13 48H47M17 38V48M22 41V48M27 38V48M32 41V51M37 38V48M42 41V48",
  ],

  // 007 — the three risk classes, and the third one is why it is the worst. Two
  // vessels hold a level you can read. The third has no floor, so it never held
  // anything and never showed a level — a missing number rather than a wrong one,
  // and missing numbers do not page anybody.
  //
  // The first version read as "HH| |" rather than as vessels, and the cause was
  // geometric: the vessels were wide and short and the level line sat at exactly
  // mid-height, which is the recipe for an H. Narrower and taller, with the level
  // down where a liquid would actually sit, and the walls now clearly read as an
  // open-topped container. The third vessel's contents fall out below it.
  [
    "M9 22v24h10V22M9 39h10",
    "M27 22v24h10V22M27 39h10",
    "M45 22v24M55 22v24",
    "M47 50v5M52 52v5",
  ],

  // 008 — the reconciliation rail, in miniature. Two figures that agreed for four
  // thousand words, and the moment they stop agreeing.
  ["M8 30H38L56 16", "M8 34H38L56 48"],

  // 009 — a total above a double rule. The figure is right-aligned because a
  // money column is, and the stems vary in height so the row reads as a number
  // rather than as a picket fence.
  ["M28 24V34M34 27V34M40 24V34M46 26V34M52 24V34", "M8 40H56M8 44H56"],
];
