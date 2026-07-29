import { Geist, Geist_Mono, Instrument_Serif, Inter_Tight } from "next/font/google";

// Display serif. Renders in the hero, so it preloads. Instrument Serif ships
// only a 400 roman and a 400 italic — a constraint, not a problem: a display
// serif should never be bolded.
//
// BOTH styles load, and the italic is not decoration. It is the one emphasis
// device the display roles have: a single word set in italic inside an
// otherwise roman heading, used where that word carries the argument. See
// the `em` rule in globals.css §6, which is the whole implementation.
//
// This replaced a short-lived EB Garamond experiment (PRs #13, #14) that
// existed only for that face's discretionary ligatures. They never showed in
// the app, so the reason for the swap evaporated and the face came back.
// Don't reintroduce `font-variant-ligatures: discretionary-ligatures` — this
// family has no dlig table, so it would be a no-op that reads as intent.
export const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
  variable: "--font-display",
});

// Workhorse sans. Variable font — a single face covers the whole weight axis.
export const sans = Geist({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-sans",
});

// Dates, years, IDs, inline code. Below the fold everywhere, so no preload.
export const mono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-mono",
});

// TEMPORARY — the §15 Q2 comparison candidate, rendered side-by-side against
// Geist in /styleguide/. Delete this export and its <html> class once the sans
// is chosen; it costs a font payload on every page until then.
export const sansAlt = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-sans-alt",
});
