/**
 * The two FinLog registers, mirrored for build-time contrast checking in
 * /styleguide#finlog.
 *
 * Separate from tokens.ts rather than folded into it, for the reason plates.ts is
 * separate: these are not a fourth and fifth site theme, they are one page's own
 * design language, and they carry tokens the three site themes have no use for
 * (two rule weights, a four-state signal vocabulary, a second red). Widening
 * `ThemeName` would put them in the site's theme picker, which is exactly the
 * claim this page is not making.
 *
 * Everything derived is derived HERE with `mixSrgb` the same way globals.css §3
 * derives it with `color-mix(in srgb, …)`, rather than being transcribed as a
 * literal. The point is the same one plates.ts makes: a swatch on the styleguide
 * that does not match the stylesheet is a drift, and it shows up as a visibly
 * wrong colour rather than as a stale number in a comment.
 */

import { contrastRatio, mixSrgb } from "./contrast";
import type { ThemeColors } from "./tokens";

// ── The primitives, from globals.css §2 ────────────────────────────────────

/** Accounting paper. Warmer and yellower than --sand-050, which the plan's own
 *  #f7f4ed was not — see the comment on --paper in globals.css. */
export const PAPER = "#f9f2df";
export const PAPER_KEY = "#1a1714";

/** The second ink. Negatives and corrections only; never the Ledger's accent. */
export const LEDGER_RED = "#b0342c";

/** Two rules, two jobs. The feint one is horizontal and prose sits on it, so its
 *  density is derived from the quietest ink that must survive it. The column one
 *  is vertical and divides money columns, so no type ever lands on it. */
export const RULE_FEINT = "#d5dce4";
export const RULE_COLUMN = "#c9d3dc";

export const CONSOLE_BG = "#0e1113";
export const CONSOLE_PANEL = "#161b1e";
export const CONSOLE_CARD = "#1c2226";
export const CONSOLE_HOVER = "#232a2e";

export const PHOSPHOR = "#4ade9b";
export const AMBER = "#f0b03c";

/** The ledger red lifted to the console. Same hue, same saturation, raised until
 *  it clears the site's 4.91 floor on the panel. Console-only by construction:
 *  it is 3.13:1 on paper. */
export const CONSOLE_RED = "#d76760";

/** The site's own empirical floor, set by theme-dark's --text-faint. Higher than
 *  the 4.5 in `contrastTargets`, and it is the number that actually binds. */
export const FLOOR = 4.91;

/** WCAG AA for normal text — the obligation on every surface a role can sit on,
 *  as distinct from the house target, which applies on a register's own --bg. */
export const AA = 4.5;

export type RegisterName = "ledger" | "console";

export const REGISTER_ORDER: RegisterName[] = ["ledger", "console"];

/** The nine measured keys, plus the surfaces and the four signals. */
export type RegisterColors = ThemeColors & {
  "bg-raised": string;
  "bg-card": string;
  "bg-hover": string;
  "sig-settled": string;
  "sig-estimated": string;
  "sig-loss": string;
};

/** Ledger's ramp is a dilution of ink into paper, so it is a mix — the same
 *  physical reading .theme-plate's ramp has. Console's is four literals on a cool
 *  axis, because emitted light at lower intensity is not a dilution and the hue
 *  lean has to grow as the value drops or the dim end goes flat grey. */
export const registers: Record<RegisterName, RegisterColors> = {
  ledger: {
    bg: PAPER,
    "bg-raised": mixSrgb(PAPER_KEY, PAPER, 0.03),
    "bg-card": mixSrgb(PAPER_KEY, PAPER, 0.05),
    "bg-hover": mixSrgb(PAPER_KEY, PAPER, 0.08),

    "text-primary": PAPER_KEY,
    "text-secondary": mixSrgb(PAPER_KEY, PAPER, 0.88),
    "text-muted": mixSrgb(PAPER_KEY, PAPER, 0.76),
    "text-faint": mixSrgb(PAPER_KEY, PAPER, 0.66),

    "border-subtle": RULE_COLUMN,
    "border-default": mixSrgb(PAPER_KEY, PAPER, 0.32),
    "border-strong": PAPER_KEY,

    // Key ink, not the red. The reasoning is on .theme-ledger in globals.css §3.
    accent: PAPER_KEY,

    "sig-settled": PAPER_KEY,
    "sig-estimated": mixSrgb("#3f4c59", PAPER, 0.92),
    "sig-loss": LEDGER_RED,
  },
  console: {
    bg: CONSOLE_BG,
    "bg-raised": CONSOLE_PANEL,
    "bg-card": CONSOLE_CARD,
    "bg-hover": CONSOLE_HOVER,

    "text-primary": "#eceeee",
    "text-secondary": "#bdc5c8",
    "text-muted": "#94a4ab",
    "text-faint": "#728890",

    "border-subtle": "#242b2f",
    "border-default": "#333c41",
    "border-strong": "#56676d",

    accent: PHOSPHOR,

    "sig-settled": PHOSPHOR,
    "sig-estimated": AMBER,
    "sig-loss": CONSOLE_RED,
  },
};

/**
 * Every surface a text role can land on, in order of increasing hazard.
 *
 * The last two Ledger entries are the reason this table exists at all. A hover
 * surface is opt-in — a component chooses it — but the ruling is under all Ledger
 * prose by default, which is the position the plate's halftone screen was in, and
 * globals.css §3 already records that lesson: every ratio is really measured
 * against stock-plus-dots, not against bare stock.
 */
export const surfaces: Record<RegisterName, { label: string; hex: string; note?: string }[]> = {
  ledger: [
    { label: "--bg", hex: PAPER, note: "the paper" },
    { label: "--bg-raised", hex: registers.ledger["bg-raised"] },
    { label: "--bg-card", hex: registers.ledger["bg-card"] },
    { label: "--bg-hover", hex: registers.ledger["bg-hover"] },
    { label: "feint rule", hex: RULE_FEINT, note: "under all prose — not opt-in" },
    { label: "column rule", hex: RULE_COLUMN, note: "vertical; no type sits here" },
  ],
  console: [
    { label: "--bg", hex: CONSOLE_BG, note: "the ground" },
    { label: "--bg-raised", hex: CONSOLE_PANEL, note: "the panel — dense rows" },
    { label: "--bg-card", hex: CONSOLE_CARD },
    { label: "--bg-hover", hex: CONSOLE_HOVER },
  ],
};

/** The rows of the matrix. Borders are excluded: only --border-strong carries a
 *  ratio duty and it is covered by the house-target table. */
export const MATRIX_ROLES: readonly (keyof RegisterColors)[] = [
  "text-primary",
  "text-secondary",
  "text-muted",
  "text-faint",
  "accent",
  "sig-settled",
  "sig-estimated",
  "sig-loss",
];

/** The four states, with the label each one must also carry. Colour is never the
 *  only carrier — desaturate the styleguide section and every state still reads. */
export const SIGNALS: {
  token: keyof RegisterColors | "sig-absent";
  label: string;
  meaning: string;
}[] = [
  { token: "sig-settled", label: "SETTLED", meaning: "this figure bills" },
  { token: "sig-estimated", label: "ESTIMATED", meaning: "this figure displays" },
  { token: "sig-loss", label: "LOSS", meaning: "a negative, or a correction" },
  // Deliberately unmeasurable. --sig-absent is a mix with `transparent`, because
  // absent has to look like nothing — so it is a dashed edge over no fill, and it
  // has no ratio to publish. That is the argument, not a gap in the table.
  { token: "sig-absent", label: "ABSENT", meaning: "no figure at all — a dashed void" },
];

/** Narrows a SIGNALS token to one that resolves to a measurable colour. */
export function isMeasurable(
  token: keyof RegisterColors | "sig-absent",
): token is keyof RegisterColors {
  return token !== "sig-absent";
}

/**
 * The one constraint the ruled ground imposes, computed rather than asserted.
 *
 * A 1px rule at the 31.5px pitch of --fz-body-1 × --lh-loose is 3.17% coverage, so
 * averaged into the sheet the ruling is almost free. The average is not the worst
 * case: a stroke landing directly on a rule is, and that is what this returns.
 */
export const RULE_COVERAGE = 1 / 31.5;

export function averagedGround(): string {
  return mixSrgb(RULE_FEINT, PAPER, RULE_COVERAGE);
}

/** True where a role clears WCAG AA on a given surface. */
export function clearsAA(fg: string, bg: string): boolean {
  return Number(contrastRatio(fg, bg).toFixed(2)) >= AA;
}

/**
 * The cross-register red, as a pair. Kept as data so the styleguide can show why
 * one literal could not do the job, rather than the file asserting that it could.
 * Precedent for one hue at two values: .theme-ember ships --ember-700 for light
 * grounds and --ember-400 for dark.
 */
export const CROSS_REGISTER_RED = [
  { hex: LEDGER_RED, on: PAPER, surface: "Ledger paper", verdict: "carries a figure" },
  { hex: LEDGER_RED, on: CONSOLE_BG, surface: "Console ground", verdict: "cannot — under AA" },
  { hex: LEDGER_RED, on: CONSOLE_PANEL, surface: "Console panel", verdict: "cannot — under AA" },
  { hex: CONSOLE_RED, on: CONSOLE_BG, surface: "Console ground", verdict: "carries a figure" },
  { hex: CONSOLE_RED, on: CONSOLE_PANEL, surface: "Console panel", verdict: "carries a figure" },
  { hex: CONSOLE_RED, on: PAPER, surface: "Ledger paper", verdict: "cannot — Console value only" },
] as const;

/**
 * The seam. The header and footer sit outside <main> and stay .theme-dark, so a
 * Console page abuts --ink-950. These two near-blacks are the same value and
 * differ only in hue direction, which reads as a colour cast rather than as two
 * materials — and no darker ground fixes it, because near-blacks have nowhere
 * left to go. It is drawn instead, with [data-edge] in §15.
 */
export const SEAM = {
  chrome: "#12100e",
  console: CONSOLE_BG,
  ledger: PAPER,
  /** The darkest alternative considered, to show the fix is not available. */
  darkerAlternative: "#0a0d0f",
} as const;
