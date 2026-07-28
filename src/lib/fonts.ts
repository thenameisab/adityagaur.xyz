import { Geist, Geist_Mono, Inter_Tight } from "next/font/google";
import localFont from "next/font/local";

// Display serif. Renders in the hero, so it preloads. EB Garamond is a
// variable font (wght 400–800), but the type roles all pin --fw-regular —
// a display serif should never be bolded. It's here for its discretionary
// ligatures (Th, ct, st, ck…), enabled globally in globals.css; only this
// face has a dlig table, so the rule can't leak into the sans or mono.
//
// Self-hosted from a hand-subsetted file, NOT next/font/google: Google's
// CDN strips the dlig lookups from its latin subset, so the ligatures the
// face was chosen for never arrive. ./fonts/EBGaramond-latin.woff2 is the
// upstream variable TTF (google/fonts@main, OFL — licence alongside) run
// through fonttools with the same latin unicode range plus
// --layout-features+=dlig. Re-subset from upstream to update; verify with
// a GSUB dump that dlig survived before shipping.
export const display = localFont({
  src: "./fonts/EBGaramond-latin.woff2",
  weight: "400 800",
  display: "swap",
  preload: true,
  adjustFontFallback: "Times New Roman",
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
