// Mirror of the color values in globals.css, for build-time contrast checking
// in /styleguide/. See src/lib/contrast.ts for why this duplication exists.

export const ramps = {
  ink: {
    "ink-950": "#12100e",
    "ink-900": "#191714",
    "ink-850": "#1f1c19",
    "ink-800": "#272320",
    "ink-700": "#3a342f",
    "ink-600": "#4f4841",
    "ink-500": "#6b6259",
    "ink-400": "#8a8076",
    "ink-300": "#aba093",
    "ink-200": "#ccc3b6",
    "ink-100": "#e6dfd2",
    "ink-050": "#fbf4e5",
  },
  sand: {
    "sand-050": "#fbf4e5",
    "sand-100": "#f4ecda",
    "sand-200": "#ece2cd",
    "sand-300": "#e2d7bf",
    "sand-400": "#c4b9a2",
    "sand-500": "#a79c85",
    "sand-600": "#8b806a",
  },
  ember: {
    "ember-400": "#e89a72",
    "ember-500": "#d97b4f",
    "ember-600": "#b85f36",
    "ember-700": "#a04e28",
    "ember-900": "#3a1e12",
    "ember-950": "#2e170d",
  },
} as const;

export type ThemeName = "dark" | "sand" | "ember";

type ThemeColors = {
  bg: string;
  "text-primary": string;
  "text-secondary": string;
  "text-muted": string;
  "text-faint": string;
  "border-subtle": string;
  "border-default": string;
  "border-strong": string;
  accent: string;
};

export const themes: Record<ThemeName, ThemeColors> = {
  dark: {
    bg: "#12100e",
    "text-primary": "#fbf4e5",
    "text-secondary": "#ccc3b6",
    "text-muted": "#aba093",
    "text-faint": "#8a8076",
    "border-subtle": "#3a342f",
    "border-default": "#4f4841",
    "border-strong": "#6b6259",
    accent: "#d97b4f",
  },
  sand: {
    bg: "#fbf4e5",
    "text-primary": "#12100e",
    "text-secondary": "#272320",
    "text-muted": "#3a342f",
    "text-faint": "#4f4841",
    "border-subtle": "#c4b9a2",
    "border-default": "#a79c85",
    "border-strong": "#8b806a",
    accent: "#a04e28",
  },
  ember: {
    bg: "#2e170d",
    "text-primary": "#fbf4e5",
    "text-secondary": "#e6dfd2",
    "text-muted": "#ccc3b6",
    "text-faint": "#aba093",
    "border-subtle": "#4a2718",
    "border-default": "#5e3423",
    "border-strong": "#96603c",
    accent: "#e89a72",
  },
};

// Targets from BUILD-BRIEF §3.1. `border-strong` carries the 3:1 requirement
// because it is the only border token used to convey state.
export const contrastTargets: { token: keyof ThemeColors; target: number }[] = [
  { token: "text-primary", target: 15 },
  { token: "text-secondary", target: 10 },
  { token: "text-muted", target: 7 },
  { token: "text-faint", target: 4.5 },
  { token: "accent", target: 4.5 },
  { token: "border-strong", target: 3 },
];
