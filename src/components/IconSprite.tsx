/**
 * Hand-maintained icon sprite. Rendered once in layout.tsx; static export inlines
 * it into every page at zero JS cost. Referenced via <Icon name="..." />.
 *
 * Two construction systems, deliberately separate (BUILD-BRIEF §6.9):
 *
 *   System A — UI icons. 24×24, fill="none", stroke="currentColor", stroke-width 2,
 *   round caps and joins. Geometry follows the Lucide conventions; Lucide is NOT
 *   a dependency.
 *
 *   System B — the typographic arrow. 22×19, FILLED (fill="currentColor", no
 *   stroke), drawn to sit on the text baseline and to match the display
 *   serif's stem weight at 1em. It is a glyph, not a UI control. Originally
 *   drawn against Instrument Serif; EB Garamond's stems are close but not
 *   identical — re-check before redrawing anything.
 *
 * Nine icons. A tenth requires justification.
 */

// System B — the signature arrow.
//
// Axis at y=12.3 so the shaft aligns with a lowercase x-height midline at 1em.
// Stem is 0.9 units thick and tapers to 0.72 at the entry, echoing the way an
// Instrument Serif stem thins where it meets a serif. Barbs are 0.95 thick with
// a slight inward bow on the outer edge — a straight barb reads mechanical; the
// bow is what makes it read as drawn.
const ARROW_RIGHT_PATH =
  "M0.6 11.94 L20.6 11.85 L20.6 12.75 L0.6 12.66 Z " +
  "M15.305 8.072 L15.895 7.328 Q19.05 9.34 21.695 11.928 L21.105 12.672 Z " +
  "M15.895 17.272 L15.305 16.528 Q18.2 13.86 21.105 11.928 L21.695 12.672 Z";

export default function IconSprite() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {/* ── System B ────────────────────────────────────────────── */}
        <symbol id="icon-arrow-right" viewBox="0 0 22 19">
          <path fill="currentColor" d={ARROW_RIGHT_PATH} />
        </symbol>

        {/* Same glyph, rotated 45° about its own axis — identical construction,
            so the two arrows read as one family. */}
        <symbol id="icon-arrow-up-right" viewBox="0 0 22 19">
          <path
            fill="currentColor"
            d={ARROW_RIGHT_PATH}
            transform="rotate(-45 11 12.3)"
          />
        </symbol>

        {/* ── System A — 24×24, stroked ───────────────────────────── */}
        <symbol
          id="icon-x"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </symbol>

        <symbol
          id="icon-menu"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 7h16" />
          <path d="M4 17h16" />
        </symbol>

        <symbol
          id="icon-link"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </symbol>

        <symbol
          id="icon-copy"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </symbol>

        <symbol
          id="icon-check"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </symbol>

        <symbol
          id="icon-mail"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </symbol>

        {/* Brand mark — official geometry, filled. */}
        <symbol id="icon-linkedin" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"
          />
        </symbol>
      </defs>
    </svg>
  );
}
