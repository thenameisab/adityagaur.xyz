/**
 * WCAG 2.1 relative-luminance and contrast-ratio math, so the styleguide can
 * report measured ratios rather than asserting them. The brief requires each
 * pair to be verified per theme; this makes that verification permanent and
 * visible instead of a one-off spreadsheet.
 *
 * Values are duplicated from globals.css by necessity — CSS custom properties
 * aren't readable at build time. The styleguide renders each swatch using the
 * real token, so a drift between the two shows up as a swatch that doesn't
 * match its stated hex.
 */

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export function ratio(a: string, b: string): string {
  return `${contrastRatio(a, b).toFixed(2)}:1`;
}

export function passes(a: string, b: string, target: number): boolean {
  // Round to 2dp first so a 4.4996 doesn't display as "4.50" and read as a fail.
  return Number(contrastRatio(a, b).toFixed(2)) >= target;
}
