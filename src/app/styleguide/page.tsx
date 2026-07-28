import type { Metadata } from "next";
import Brand, { BrandMark } from "@/components/Brand";
import Icon, { type IconName } from "@/components/Icon";
import Fingerprint, { hexCells } from "@/components/artifacts/Fingerprint";
import InkCredit from "@/components/artifacts/InkCredit";
import Status from "@/components/artifacts/Status";
import { allBrands } from "@/lib/brands";
import { contrastRatio, passes, ratio } from "@/lib/contrast";
import {
  INKS,
  KEY,
  PAIRINGS,
  STOCKS,
  multiply,
  slipFor,
  type DrumsKey,
  type StockName,
} from "@/lib/plates";
import { contrastTargets, ramps, themes, type ThemeName } from "@/lib/tokens";
import styles from "./styleguide.module.css";

// Internal reference surface. Excluded from the sitemap and llms.txt by being
// absent from `routes`; excluded from indexing here.
export const metadata: Metadata = {
  title: "Styleguide",
  description: "Internal token and component reference.",
  robots: { index: false, follow: false },
};

const THEME_ORDER: ThemeName[] = ["dark", "sand", "ember"];

const STOCK_ORDER: StockName[] = ["cream", "kraft"];

/** Work index order, which is the order the pages convert in. */
const PAIRING_ORDER: DrumsKey[] = [
  "teal-pink",
  "orange-teal",
  "blue-red",
  "pink-blue",
  "green-purple",
  "orange-purple",
  "green-red",
  "blue-yellow",
  "purple-teal",
  "pink-green",
];

/** Law 1, as a word. 4.5 is body text, 3 is marks and 24px+ type. */
function verdict(worstRatio: number): string {
  if (worstRatio >= 4.5) return "TEXT";
  if (worstRatio >= 3) return "MARKS ONLY";
  return "FILL ONLY";
}

const TYPE_ROLES = [
  ["type-display-1", "Display 1 — hero moments"],
  ["type-display-2", "Display 2"],
  ["type-display-3", "Display 3"],
  ["type-headline-1", "Headline 1"],
  ["type-headline-2", "Headline 2"],
  ["type-headline-3", "Headline 3"],
  ["type-headline-4", "Headline 4"],
  ["type-eyebrow-1", "Eyebrow 1"],
  ["type-eyebrow-2", "Eyebrow 2"],
  ["type-eyebrow-3", "Eyebrow 3"],
  ["type-body-1", "Body 1 — lede"],
  ["type-body-2", "Body 2 — default"],
  ["type-body-3", "Body 3 — dense"],
  ["type-body-4", "Body 4 — fine print"],
  ["type-ui-1", "UI 1"],
  ["type-ui-2", "UI 2 — default UI size"],
  ["type-caption-1", "Caption 1 — mono"],
] as const;

const SPACE_STEPS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40];
const FLUID_STEPS = ["sm", "md", "lg", "xl"];
const RADII = ["none", "xs", "sm", "md", "lg", "full"];
const DURATIONS = ["instant", "fast", "base", "slow", "slower"];
const EASINGS = ["out", "out-soft", "in-out", "linear"];
const ICONS: IconName[] = [
  "arrow-right",
  "arrow-up-right",
  "x",
  "menu",
  "link",
  "copy",
  "check",
  "mail",
  "linkedin",
];

function Section({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`${styles.section} inner-section inner-section--sm`}>
      <div className="stack stack--s">
        <h2 className="type-headline-2 text-primary">{title}</h2>
        {note ? <p className="type-body-3 text-muted">{note}</p> : null}
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

export default function Styleguide() {
  return (
    <div className="container">
      <div className="inner-section stack stack--s">
        <p className="type-eyebrow-3 text-muted">Internal reference</p>
        <h1 className="type-display-2 text-primary">Styleguide</h1>
        <p className={`${styles.intro} type-body-1 text-secondary`}>
          Every token, type role, and component state in the system. Not linked from
          the site and not indexed.
        </p>
      </div>

      {/* ── Contrast ─────────────────────────────────────────────── */}
      <Section
        id="contrast"
        title="Contrast, measured"
        note="Ratios are computed at build time from the real token values, per theme. A failing row is a bug, not a note."
      >
        {THEME_ORDER.map((name) => {
          const t = themes[name];
          return (
            <div key={name} className={styles.tableWrap} data-scrollx>
              <h3 className="type-headline-4 text-primary">
                .theme-{name} <span className="type-caption-1 text-faint">on {t.bg}</span>
              </h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Token</th>
                    <th scope="col">Value</th>
                    <th scope="col">Target</th>
                    <th scope="col">Measured</th>
                    <th scope="col">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {contrastTargets.map(({ token, target }) => {
                    const fg = t[token];
                    const ok = passes(fg, t.bg, target);
                    return (
                      <tr key={token}>
                        <th scope="row" className={styles.tokenCell}>
                          <span
                            className={styles.dot}
                            style={{ background: fg, borderColor: t["border-strong"] }}
                          />
                          --{token}
                        </th>
                        <td className="type-caption-1">{fg}</td>
                        <td className="type-caption-1">≥ {target}:1</td>
                        <td className="type-caption-1">{ratio(fg, t.bg)}</td>
                        <td>
                          <span data-result={ok ? "pass" : "fail"} className={styles.result}>
                            {ok ? "PASS" : "FAIL"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </Section>

      {/* ── Ramps ────────────────────────────────────────────────── */}
      <Section
        id="ramps"
        title="Ramps"
        note="Raw values. Only theme classes may read these — no component references a ramp token."
      >
        {Object.entries(ramps).map(([rampName, entries]) => (
          <div key={rampName} className="stack stack--s">
            <h3 className="type-eyebrow-3 text-muted">{rampName}</h3>
            <div className={styles.swatches}>
              {Object.entries(entries).map(([token, hex]) => (
                <div key={token} className={styles.swatch}>
                  <span className={styles.swatchChip} style={{ background: hex }} />
                  <span className="type-caption-1 text-secondary">--{token}</span>
                  <span className="type-caption-1 text-faint">{hex}</span>
                  <span className="type-caption-1 text-faint">
                    {contrastRatio(hex, "#12100e").toFixed(1)} / {contrastRatio(hex, "#fbf4e5").toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Section>

      {/* ── Themes side by side ──────────────────────────────────── */}
      <Section
        id="themes"
        title="Themes"
        note="Identical token contract. The same markup, three grounds — note that the button inverts with no variant class."
      >
        <div className={styles.themeRow}>
          {THEME_ORDER.map((name) => (
            <div key={name} className={`theme-${name} ${styles.themeCard}`}>
              <div className="stack stack--s">
                <p className="type-eyebrow-3 text-muted">.theme-{name}</p>
                <h3 className="type-headline-2 text-primary">Warm, not neutral</h3>
                <p className="type-body-3 text-secondary">
                  Secondary text carries the paragraph weight.
                </p>
                <p className="type-body-3 text-muted">Muted text for supporting detail.</p>
                <p className="type-body-3 text-faint">Faint — never body copy.</p>
                <hr />
                <div className="cluster" style={{ ["--cluster-space" as string]: "var(--space-3)" }}>
                  <span className={`${styles.btnPrimary} type-ui-2`}>Primary</span>
                  <span className={`${styles.btnGhost} type-ui-2`}>Ghost</span>
                  <a className={styles.accentLink} href="#themes">
                    Accent link <Icon name="arrow-right" size="sm" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Plates ───────────────────────────────────────────────── */}
      <Section
        id="plates"
        title="Plates"
        note="The fourth theme. Sixteen artifacts read as a series of prints rather than one design repeated sixteen times, because each page loads its own two drums. Everything below is computed from src/lib/plates.ts with the site's own WCAG math — a swatch that does not match its stated hex is a drift between the tokens and this page."
      >
        <div className="stack stack--l">
          {/* ── Law 1 ── */}
          <div className="stack stack--s">
            <h3 className="type-headline-4 text-primary">
              Law 1 — a pure ink cannot carry text
            </h3>
            <p className="type-body-3 text-muted">
              Measured against both assigned stocks. Purple is the only drum that
              clears AA anywhere, and yellow bottoms out at 1.09:1. So inks fill,
              block, rule, and mark. They never set body copy. This is not a
              compromise — it is how riso posters actually work, and it is why
              they look the way they do.
            </p>
            <div className={styles.tableWrap} data-scrollx>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Drum</th>
                    <th scope="col">Hex</th>
                    {STOCK_ORDER.map((s) => (
                      <th key={s} scope="col">
                        on {STOCKS[s].label}
                      </th>
                    ))}
                    <th scope="col">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {([["key", { hex: KEY, label: "Key" }]] as const)
                    .concat(Object.entries(INKS) as never)
                    .map(([name, ink]) => {
                      const worst = Math.min(
                        ...STOCK_ORDER.map((s) =>
                          contrastRatio(ink.hex, STOCKS[s].hex),
                        ),
                      );
                      return (
                        <tr key={name}>
                          <th scope="row" className={styles.tokenCell}>
                            <span
                              className={styles.dot}
                              style={{ background: ink.hex, borderColor: KEY }}
                            />
                            {ink.label}
                          </th>
                          <td className="type-caption-1">{ink.hex}</td>
                          {STOCK_ORDER.map((s) => (
                            <td key={s} className="type-caption-1">
                              {ratio(ink.hex, STOCKS[s].hex)}
                            </td>
                          ))}
                          <td>
                            <span
                              className={styles.result}
                              data-result={worst >= 4.5 ? "pass" : "fail"}
                            >
                              {verdict(worst)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Law 2 ── */}
          <div className="stack stack--s">
            <h3 className="type-headline-4 text-primary">
              Law 2 — the overprint is the type colour
            </h3>
            <p className="type-body-3 text-muted">
              Two inks on one sheet multiply, so a pairing&rsquo;s own overprint is
              reliably the darkest thing on it. Every plate therefore has exactly
              three colours from two passes: drum A, drum B, and A×B for type. The
              readable colour is generated, not chosen. The
              &ldquo;matches multiply&rdquo; column recomputes each literal in
              globals.css from its two parents — a mismatch means the CSS and this
              table have drifted apart.
            </p>
            <div className={styles.tableWrap} data-scrollx>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Page</th>
                    <th scope="col">Drums</th>
                    <th scope="col">Overprint</th>
                    <th scope="col">On stock</th>
                    <th scope="col">Separation</th>
                    <th scope="col">Slip</th>
                    <th scope="col">Checks</th>
                  </tr>
                </thead>
                <tbody>
                  {PAIRING_ORDER.map((key) => {
                    const p = PAIRINGS[key];
                    const stock = STOCKS[p.stock].hex;
                    const computed = multiply(INKS[p.a].hex, INKS[p.b].hex);
                    const derived = slipFor(p.page);
                    // Three independent things that could rot: the overprint
                    // literal, the slip numbers, and AA on the actual stock.
                    const ok =
                      computed === p.overprint &&
                      derived[0] === p.slip[0] &&
                      derived[1] === p.slip[1] &&
                      passes(p.overprint, stock, 4.5);
                    return (
                      <tr key={key}>
                        <th scope="row" className={styles.tokenCell}>
                          <span
                            className={styles.dot}
                            style={{ background: p.overprint, borderColor: KEY }}
                          />
                          {p.page}
                        </th>
                        <td className="type-caption-1">
                          .drums-{key}
                          <br />
                          <span className="text-faint">
                            {INKS[p.a].label} + {INKS[p.b].label} on{" "}
                            {STOCKS[p.stock].label}
                          </span>
                        </td>
                        <td className="type-caption-1">{p.overprint}</td>
                        <td className="type-caption-1">
                          {ratio(p.overprint, stock)}
                        </td>
                        <td className="type-caption-1">
                          {p.separation.toFixed(3)}
                        </td>
                        <td className="type-caption-1">
                          {p.slip[0]}px, {p.slip[1]}px
                        </td>
                        <td>
                          <span
                            className={styles.result}
                            data-result={ok ? "pass" : "fail"}
                          >
                            {ok ? "PASS" : "FAIL"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Knockout ── */}
          <div className="stack stack--s">
            <h3 className="type-headline-4 text-primary">
              Knockout is nearly unusable
            </h3>
            <p className="type-body-3 text-muted">
              Stock-coloured type on a solid ink block. This is the easiest law to
              break by accident, which is the only reason it gets its own table:
              knockout is restricted to display sizes on the three darkest drums,
              and never used for running text. A status block that needs knockout
              uses key ink on a pale tint instead.
            </p>
            <div className={styles.tableWrap} data-scrollx>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Cream type on</th>
                    <th scope="col">Measured</th>
                    <th scope="col">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(INKS).map(([name, ink]) => {
                    const r = contrastRatio(STOCKS.cream.hex, ink.hex);
                    return (
                      <tr key={name}>
                        <th scope="row" className={styles.tokenCell}>
                          <span
                            className={styles.dot}
                            style={{ background: ink.hex, borderColor: KEY }}
                          />
                          {ink.label}
                        </th>
                        <td className="type-caption-1">
                          {ratio(STOCKS.cream.hex, ink.hex)}
                        </td>
                        <td>
                          <span
                            className={styles.result}
                            data-result={r >= 4.5 ? "pass" : "fail"}
                          >
                            {r >= 4.5
                              ? "TEXT"
                              : r >= 3
                                ? "DISPLAY ONLY"
                                : "NEVER"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── The ten plates, live ── */}
          <div className="stack stack--s">
            <h3 className="type-headline-4 text-primary">
              Ten pairings, four states each
            </h3>
            <p className="type-body-3 text-muted">
              Rendered from the real CSS classes, so this is the regression test
              for the semantic mapping rather than a picture of it. The state
              vocabulary is fixed across all ten: a reader who learns one plate
              can read every plate. Colour is never the only carrier — each state
              has a word and a shape as well as an ink, which is what makes the
              system survive greyscale and colour-vision deficiency. Check that
              claim by desaturating this section.
            </p>
            <div className={styles.plateGrid}>
              {PAIRING_ORDER.map((key) => {
                const p = PAIRINGS[key];
                return (
                  <div
                    key={key}
                    className={`theme-plate drums-${key} ${
                      p.stock === "kraft" ? "stock-kraft" : ""
                    } ${styles.plateCard}`}
                  >
                    <div className="stack stack--s">
                      <p className="type-eyebrow-3 text-muted">{p.page}</p>
                      <InkCredit drums={key} />
                      <p className="type-body-3 text-secondary">
                        Secondary text is the overprint — the plate&rsquo;s own
                        generated colour.
                      </p>
                      <p className="type-body-3 text-muted">
                        Muted for supporting detail.
                      </p>
                      <p className="type-body-3 text-faint">
                        Faint — never body copy.
                      </p>
                      <hr />
                      <div className={styles.stateRow}>
                        <Status tone="held">held</Status>
                        <Status tone="mine">mine</Status>
                        <Status tone="broken">drift</Status>
                        <Status tone="void">void</Status>
                      </div>
                      {/* Real data, not filler: the plate's own three colours,
                          drum A then drum B then the overprint, as hex digits.
                          Present here to prove --sig-held and --sig-broken
                          resolve inside every pairing — a fingerprint whose
                          cells or top edge vanish is a broken mapping. */}
                      <Fingerprint
                        cells={hexCells(
                          (
                            INKS[p.a].hex +
                            INKS[p.b].hex +
                            p.overprint
                          ).replaceAll("#", ""),
                        )}
                        alt={`The ${p.page} plate's three colours as hex digits`}
                      />
                      <p className="type-body-4 text-faint">{p.rationale}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Type ─────────────────────────────────────────────────── */}
      <Section
        id="type"
        title="Type roles"
        note="Components apply one of these classes and never set font-size, line-height, letter-spacing, or family individually."
      >
        <div className="stack stack--m">
          {TYPE_ROLES.map(([cls, label]) => (
            <div key={cls} className={styles.typeRow}>
              <p className="type-caption-1 text-faint">.{cls}</p>
              <p className={`${cls} text-primary`}>{label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Sans comparison (Q2) ─────────────────────────────────── */}
      <Section
        id="sans"
        title="Sans candidates"
        note="§15 Q2 — Geist vs Inter Tight, both against Instrument Serif. Pick one; the loser and its font payload get deleted."
      >
        <div className={styles.themeRow}>
          {[
            ["Geist", "var(--font-sans)"],
            ["Inter Tight", "var(--font-sans-alt)"],
          ].map(([label, family]) => (
            <div key={label} className={styles.themeCard} style={{ ["--ff-sans" as string]: family }}>
              <div className="stack stack--s">
                <p className="type-eyebrow-3 text-muted">{label}</p>
                <h3 className="type-display-3 text-primary">Aditya Gaur</h3>
                <p className="type-body-1 text-secondary">
                  Chief of Staff at Tartan, building GTM and operating systems for a
                  fast-growing fintech — and increasingly, the AI agents that run them.
                </p>
                <p className="type-ui-2 text-muted">Work · Writing · Wiki · About</p>
                <p className="type-caption-1 text-faint">2018 — 2026 · 0123456789</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Accent comparison (Q1) ───────────────────────────────── */}
      <Section
        id="accent"
        title="Accent candidates"
        note="§15 Q1 — terracotta against a cool alternative. Both measured on --ink-950."
      >
        <div className={styles.swatches}>
          {[
            ["Terracotta (proposed) --ember-500", "#d97b4f"],
            ["Terracotta hover --ember-400", "#e89a72"],
            ["Cool alt — slate blue", "#7c9bd1"],
            ["Cool alt — muted teal", "#6fae9f"],
          ].map(([label, hex]) => (
            <div key={hex} className={styles.swatch}>
              <span className={styles.swatchChip} style={{ background: hex }} />
              <span className="type-caption-1 text-secondary">{label}</span>
              <span className="type-caption-1 text-faint">{hex}</span>
              <span className="type-caption-1 text-faint">
                {ratio(hex, "#12100e")} on dark
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Space ────────────────────────────────────────────────── */}
      <Section id="space" title="Space">
        <div className="stack stack--xs">
          {SPACE_STEPS.map((n) => (
            <div key={n} className={styles.spaceRow}>
              <span className="type-caption-1 text-faint">--space-{n}</span>
              <span
                className={styles.spaceBar}
                style={{ inlineSize: `var(--space-${n})` }}
              />
            </div>
          ))}
          {FLUID_STEPS.map((n) => (
            <div key={n} className={styles.spaceRow}>
              <span className="type-caption-1 text-faint">--space-fluid-{n}</span>
              <span
                className={styles.spaceBar}
                style={{ inlineSize: `var(--space-fluid-${n})` }}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* ── Radius ───────────────────────────────────────────────── */}
      <Section id="radius" title="Radius" note="Default is --bdrs-xs. Nothing exceeds --bdrs-lg except pills.">
        <div className="cluster">
          {RADII.map((r) => (
            <div key={r} className="stack stack--xs">
              <span
                className={styles.radiusChip}
                style={{ borderRadius: `var(--bdrs-${r})` }}
              />
              <span className="type-caption-1 text-faint">--bdrs-{r}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Motion ───────────────────────────────────────────────── */}
      <Section
        id="motion"
        title="Motion"
        note="Hover a swatch. Hover and focus run at --dur-instant; only entrances get the slower curve."
      >
        <div className="cluster">
          {DURATIONS.map((d) => (
            <span
              key={d}
              className={`${styles.motionChip} type-caption-1`}
              style={{ transitionDuration: `var(--dur-${d})` }}
            >
              --dur-{d}
            </span>
          ))}
        </div>
        <div className="cluster">
          {EASINGS.map((e) => (
            <span
              key={e}
              className={`${styles.motionChip} type-caption-1`}
              style={{ transitionTimingFunction: `var(--ease-${e})` }}
            >
              --ease-{e}
            </span>
          ))}
        </div>
      </Section>

      {/* ── Icons ────────────────────────────────────────────────── */}
      <Section
        id="icons"
        title="Icons"
        note="Nine, hand-maintained. The two arrows are filled glyphs drawn to Instrument Serif; the rest are 24×24 stroked. All currentColor, all em-sized."
      >
        <div className={styles.iconGrid}>
          {ICONS.map((name) => (
            <div key={name} className="stack stack--xs">
              <span className={styles.iconCell}>
                <Icon name={name} />
              </span>
              <span className="type-caption-1 text-faint">{name}</span>
            </div>
          ))}
        </div>
        <p className="type-body-2 text-secondary">
          The signature arrow set inline at body size, where it actually lives:{" "}
          <a className={styles.accentLink} href="#icons">
            All work <Icon name="arrow-right" size="sm" />
          </a>
        </p>
        <p className="type-display-3 text-primary">
          And at display size <Icon name="arrow-right" />
        </p>
      </Section>

      {/* ── Brands ───────────────────────────────────────────────── */}
      <Section
        id="brands"
        title="Product logos"
        note="Every name the site can set with a logo, from src/lib/brands.ts, served by logo.dev as plain images. A name missing from the registry fails the build; an entry with no domain renders as text on purpose, and the reason is in the note beside it."
      >
        <p className="type-body-2 text-secondary">
          Inline in prose, where the mark scales with the type: the memory camp is{" "}
          <Brand name="Mem0" />, <Brand name="Letta" />, and{" "}
          <Brand name="Supermemory" />, while <Brand name="GBrain" /> has no logo
          to show.
        </p>

        {/* Notion's cube and GitHub's octocat are black on transparent; Sana's
            is white on black. All three have to survive all three grounds. */}
        <div className={styles.brandGrounds}>
          {THEME_ORDER.map((name) => (
            <div key={name} className={`theme-${name} ${styles.brandGround}`}>
              <span className="type-caption-1 text-faint">.theme-{name}</span>
              {["Notion", "GitHub", "Sana", "Linear", "Stripe"].map((b) => (
                <BrandMark key={b} name={b} size={24} standalone />
              ))}
            </div>
          ))}
        </div>

        <div className={styles.tableWrap} data-scrollx>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Mark</th>
                <th scope="col">Name</th>
                <th scope="col">Domain</th>
                <th scope="col">Note</th>
              </tr>
            </thead>
            <tbody>
              {allBrands().map((brand) => (
                <tr key={brand.name}>
                  <td>
                    <BrandMark name={brand.name} size={20} standalone />
                  </td>
                  <td>{brand.name}</td>
                  <td className="type-caption-1 text-faint">
                    {brand.domain ?? "— no logo"}
                  </td>
                  <td className="type-body-4 text-muted">{brand.note ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── States ───────────────────────────────────────────────── */}
      <Section
        id="states"
        title="Interactive states"
        note="Tab through these. Every state is visible; nothing lifts, scales, or shadows on hover."
      >
        <div className="cluster">
          <button type="button" className={`${styles.btnPrimary} type-ui-2`}>
            Primary
          </button>
          <button type="button" className={`${styles.btnGhost} type-ui-2`}>
            Ghost
          </button>
          <button type="button" className={`${styles.btnPrimary} type-ui-2`} disabled>
            Disabled
          </button>
        </div>

        <div className={styles.cardGrid}>
          {["Default card", "Hover me", "Focus me"].map((label, i) => (
            <a key={label} href="#states" className={styles.card}>
              <h3 className="type-headline-3 text-primary">
                {label} <Icon name="arrow-right" size="sm" className={styles.cardArrow} />
              </h3>
              <p className="type-body-3 text-muted">
                Background and border shift on hover and focus-within. No lift, no
                scale, no shadow, no layout shift. Card {i + 1}.
              </p>
            </a>
          ))}
        </div>
      </Section>

      {/* ── Prose ────────────────────────────────────────────────── */}
      <Section id="prose" title="Prose">
        <div className="prose">
          <p>
            Long-form container for wiki entries and essays. Capped at{" "}
            <code>--measure-prose</code>, set in <code>--fz-body-1</code> at{" "}
            <code>--lh-loose</code>. Body text never runs the full container width.
          </p>
          <h2>A display-serif h2</h2>
          <p>
            Paragraph spacing comes from the container, not from margins on the
            paragraph. No first-line indent, no justification. An{" "}
            <a href="#prose">inline link</a> is underlined in the dim accent and
            brightens to full accent on hover.
          </p>
          <h3>A sans h3</h3>
          <ul>
            <li>List markers are 5px dots in the faint token, absolutely positioned.</li>
            <li>They never scale with the text they sit beside.</li>
          </ul>
          <blockquote>
            No quotation marks. A two-pixel rule in the dim accent, and the display
            serif at headline size.
          </blockquote>
          <pre tabIndex={0}>
            <code>{`.stack > * + * {\n  margin-block-start: var(--stack-space, var(--space-6));\n}`}</code>
          </pre>
        </div>
      </Section>
    </div>
  );
}
