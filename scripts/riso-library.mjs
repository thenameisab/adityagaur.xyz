// The ink library, the overprint table, and the contrast matrix — computed once
// so the plan carries measured values instead of intentions.
//
// Overprint is a MULTIPLY, not a mix: two translucent inks on the same sheet
// absorb independently, so the result is (a * b) / 255 per channel. color-mix()
// would give an average, which is a different (and wrong) colour.

const hexToRgb = (h) => {
  const s = h.replace("#", "");
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
};
const toHex = (rgb) => "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

const rl = (hex) =>
  hexToRgb(hex)
    .map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    })
    .reduce((a, c, i) => a + [0.2126, 0.7152, 0.0722][i] * c, 0);

const ratio = (a, b) => {
  const [hi, lo] = rl(a) > rl(b) ? [rl(a), rl(b)] : [rl(b), rl(a)];
  return (hi + 0.05) / (lo + 0.05);
};

const multiply = (a, b) => {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return toHex([(ar * br) / 255, (ag * bg) / 255, (ab * bb) / 255]);
};

/** Perceptual distance in OKLab — used to reject overprints that look like one
 *  of their own parents, which would waste a pass. */
const oklab = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};
const dist = (a, b) => {
  const [l1, a1, b1] = oklab(a);
  const [l2, a2, b2] = oklab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
};

// ── The drums ──────────────────────────────────────────────────────────────
// Real Risograph ink names and their approximate coated values. Eight, which is
// enough for every artifact to get a distinct pairing without the site turning
// into a colour chart.
const INKS = {
  "fluoro-pink": "#ff48b0",
  blue: "#0078bf",
  yellow: "#ffe800",
  green: "#00a95c",
  orange: "#ff6c2f",
  purple: "#765ba7",
  teal: "#00838a",
  "bright-red": "#f15060",
};

// Key ink, for type. Not pure black — the site has no pure black anywhere.
const KEY = "#171514";

// ── The stocks ─────────────────────────────────────────────────────────────
const PAPERS = {
  cream: "#f4efe4", // house stock, sits closest to sand-050
  grey: "#e6e4dd", // newsprint, cooler
  kraft: "#eadfc8", // warmest, closest to sand-200
};

const AA = 4.5; // body text
const LARGE = 3; // marks, rules, 24px+ type

console.log("═══ INK ON STOCK ═══════════════════════════════════════════════");
console.log("ink".padEnd(14) + "hex".padEnd(10) + Object.keys(PAPERS).map((p) => p.padEnd(16)).join(""));
for (const [name, hex] of Object.entries({ key: KEY, ...INKS })) {
  const cells = Object.values(PAPERS).map((paper) => {
    const r = ratio(hex, paper);
    const tag = r >= AA ? "TEXT" : r >= LARGE ? "mark" : "fill";
    return `${r.toFixed(2)} ${tag}`.padEnd(16);
  });
  console.log(name.padEnd(14) + hex.padEnd(10) + cells.join(""));
}

console.log("\n═══ KNOCKOUT (stock as type, on a solid ink block) ═════════════");
for (const [name, hex] of Object.entries(INKS)) {
  const r = ratio(PAPERS.cream, hex);
  console.log(`  cream on ${name.padEnd(14)} ${r.toFixed(2)}  ${r >= AA ? "TEXT ok" : r >= LARGE ? "large only" : "NO"}`);
}

console.log("\n═══ OVERPRINTS (multiply) ══════════════════════════════════════");
console.log("Kept only where the result is perceptually clear of BOTH parents.");
const names = Object.keys(INKS);
const kept = [];
for (let i = 0; i < names.length; i++) {
  for (let j = i + 1; j < names.length; j++) {
    const [a, b] = [names[i], names[j]];
    const over = multiply(INKS[a], INKS[b]);
    const dA = dist(over, INKS[a]);
    const dB = dist(over, INKS[b]);
    const distinct = Math.min(dA, dB) > 0.12;
    const onCream = ratio(over, PAPERS.cream);
    if (distinct) kept.push({ a, b, over, onCream, sep: Math.min(dA, dB) });
  }
}
kept.sort((x, y) => y.sep - x.sep);
console.log("pair".padEnd(30) + "overprint".padEnd(12) + "on cream".padEnd(14) + "separation");
for (const k of kept) {
  const tag = k.onCream >= AA ? "TEXT" : k.onCream >= LARGE ? "mark" : "fill";
  console.log(
    `${k.a} + ${k.b}`.padEnd(30) +
      k.over.padEnd(12) +
      `${k.onCream.toFixed(2)} ${tag}`.padEnd(14) +
      k.sep.toFixed(3),
  );
}
console.log(`\n${kept.length} of 28 pairs produce a genuinely new third colour.`);

// ── Deterministic misregistration ──────────────────────────────────────────
// Every plate slips differently, and slips the same way on every render. FNV-1a
// over the slug, two nibbles per axis, mapped to a 0–3px offset.
console.log("\n═══ PER-PLATE SLIP (deterministic, from the slug) ══════════════");
const fnv = (str) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
};
const slip = (slug) => {
  const h = fnv(slug);
  return [((h >>> 0) & 0xf) / 5, ((h >>> 8) & 0xf) / 5];
};
for (const slug of [
  "loam", "integration-islands", "policy-prototype", "sync-console-rework",
  "wealthlens", "crm-dashboard", "mgmt-dash", "internal-wiki",
  "company-brain", "outreach-sequencer",
]) {
  const [x, y] = slip(slug);
  console.log(`  ${slug.padEnd(22)} translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`);
}
