import { Geist, Geist_Mono, Instrument_Serif, Inter_Tight } from "next/font/google";

// Display serif. Renders in the hero, so it preloads. Instrument Serif ships
// only a 400 roman + a 400 italic — a constraint, not a problem: a display
// serif should never be bolded.
export const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
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
