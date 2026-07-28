/**
 * The site's token layer, mirrored for video.
 *
 * `src/app/globals.css` is the source of truth. Remotion renders outside the
 * browser that loads that stylesheet, so the values it needs are duplicated
 * here — deliberately, and as a flat literal map rather than anything computed,
 * so a diff against globals.css is a plain text comparison.
 *
 * Any value added here must exist there first.
 */

export const ink = {
  950: "#12100e",
  900: "#191714",
  850: "#1f1c19",
  800: "#272320",
  700: "#3a342f",
  600: "#4f4841",
  500: "#6b6259",
  400: "#8a8076",
  300: "#aba093",
  200: "#ccc3b6",
  100: "#e6dfd2",
  50: "#fbf4e5",
} as const;

export const sand = {
  50: "#fbf4e5",
  100: "#f4ecda",
  200: "#ece2cd",
  300: "#e2d7bf",
  400: "#c4b9a2",
  500: "#a79c85",
  600: "#8b806a",
} as const;

export const ember = {
  400: "#e89a72",
  500: "#d97b4f",
  600: "#b85f36",
  700: "#a04e28",
  900: "#3a1e12",
  950: "#2e170d",
} as const;

/** Tracking, in em — matches --lts-*. */
export const lts = {
  tighter: "-0.035em",
  tight: "-0.02em",
  normal: "0",
  wide: "0.04em",
  wider: "0.12em",
} as const;

/**
 * --ease-out, as bezier control points. Remotion's Easing.bezier takes the same
 * four numbers as the CSS cubic-bezier() in globals.css.
 */
export const easeOut = [0.16, 1, 0.3, 1] as const;
export const easeOutSoft = [0, 0, 0.2, 1] as const;

/**
 * Video is authored at 30fps, so a duration in the CSS token scale converts to
 * frames by multiplying by 30/1000. Kept as a helper rather than a table because
 * the reveals in video run longer than the interface ones.
 */
export const frames = (ms: number, fps = 30) => Math.round((ms / 1000) * fps);
