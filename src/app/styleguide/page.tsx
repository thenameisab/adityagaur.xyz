import type { Metadata } from "next";
import Icon, { type IconName } from "@/components/Icon";
import { contrastRatio, passes, ratio } from "@/lib/contrast";
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
            <div key={name} className={styles.tableWrap}>
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
