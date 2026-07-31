/**
 * The two site themes, and the one string written to storage.
 *
 * Kept in a module of its own because three things have to agree on these
 * values and two of them are not React: the inline script in the document head
 * (ThemeScript), the toggle (ThemeToggle), and the server-rendered class on
 * <body>. A disagreement between them is a flash of the wrong theme, which is
 * the specific failure this file exists to make impossible.
 */

export type ThemeName = "dark" | "vibrant";

/** Warm dark is the default, and it is the default for everyone. The site does
 *  NOT read prefers-color-scheme on a first visit: Vibrant Mode is a colour
 *  plate per route, not a lighting condition, so inferring it from an OS
 *  setting would hand a strong editorial choice to a system preference that was
 *  never asked about it. It is a choice the reader makes, and then it persists. */
export const DEFAULT_THEME: ThemeName = "dark";

export const STORAGE_KEY = "ag-theme";

export const THEME_CLASS: Record<ThemeName, string> = {
  dark: "theme-dark",
  vibrant: "theme-vibrant",
};

export const THEME_LABEL: Record<ThemeName, string> = {
  dark: "Dark",
  vibrant: "Vibrant",
};
