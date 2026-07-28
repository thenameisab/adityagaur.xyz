"use client";

import { useState } from "react";
import styles from "./TokenExplorer.module.css";

/**
 * The v2 token system, with its real values.
 *
 * Every hex below is carried over from the shipped `tokens.css` and the
 * DESIGN-V2-UPGRADE spec unchanged: a four-step surface ramp, a three-step ink
 * ramp, two line weights, and the accent set with its usage rules. The panel on
 * the right renders a small slice of operator UI *from these values*, so
 * flipping the mode is the actual mechanism — one attribute swap, every color
 * re-resolves, nothing re-renders.
 */

const RAMP = [
  { token: "canvas", light: "#FAFAFB", dark: "#0B0C10", role: "the page" },
  { token: "surface", light: "#FFFFFF", dark: "#131419", role: "cards, panels" },
  { token: "surface-2", light: "#F4F4F7", dark: "#1A1B22", role: "wells, table heads" },
  { token: "surface-3", light: "#EDEDF2", dark: "#23252E", role: "pressed, code" },
  { token: "ink", light: "#0E0F13", dark: "#F2F2F5", role: "primary text" },
  { token: "ink-2", light: "#45474F", dark: "#B7B9C4", role: "secondary text" },
  { token: "ink-3", light: "#6E7079", dark: "#797B86", role: "labels, hints" },
  { token: "line", light: "#E5E5EB", dark: "#262830", role: "hairlines" },
  { token: "line-strong", light: "#D3D3DB", dark: "#353844", role: "inputs, emphasis" },
] as const;

const ACCENTS = [
  { token: "primary", light: "#5B45D9", dark: "#A48BFF", rule: "brand actions, focus rings, active nav" },
  { token: "accent", light: "#22B07A", dark: "#4ADE9C", rule: "live and healthy pulses only — never a fill" },
  { token: "success", light: "#10B981", dark: "#34D399", rule: "run succeeded" },
  { token: "warning", light: "#B45309", dark: "#FBBF24", rule: "slow, degraded" },
  { token: "danger", light: "#DC2626", dark: "#F87171", rule: "failed, auth expired" },
] as const;

type Mode = "light" | "dark";

export default function TokenExplorer() {
  const [mode, setMode] = useState<Mode>("dark");
  const [picked, setPicked] = useState<string>("primary");

  const v = (token: string) => {
    const row = [...RAMP, ...ACCENTS].find((r) => r.token === token);
    return row ? row[mode] : "transparent";
  };

  const pickedRow = [...RAMP, ...ACCENTS].find((r) => r.token === picked);

  return (
    <div className={styles.root}>
      <div className={styles.left}>
        <div className={styles.modes} role="group" aria-label="Theme mode">
          {(["dark", "light"] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={`${styles.mode} type-body-4`}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {m === "dark" ? "Dark — the default" : "Light — auth pages"}
            </button>
          ))}
        </div>

        <table className={styles.table}>
          <caption className={`${styles.caption} type-eyebrow-3`}>
            Surface and ink ramps
          </caption>
          <tbody>
            {RAMP.map((r) => (
              <tr key={r.token}>
                <td>
                  <button
                    type="button"
                    className={`${styles.tokenBtn} type-body-4`}
                    aria-pressed={picked === r.token}
                    onClick={() => setPicked(r.token)}
                  >
                    <span
                      className={styles.swatch}
                      style={{ background: r[mode] }}
                      aria-hidden="true"
                    />
                    {r.token}
                  </button>
                </td>
                <td className={`${styles.hex} type-body-4`}>{r[mode]}</td>
                <td className={`${styles.role} type-body-4`}>{r.role}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className={styles.table}>
          <caption className={`${styles.caption} type-eyebrow-3`}>
            Accents, each with a usage rule
          </caption>
          <tbody>
            {ACCENTS.map((r) => (
              <tr key={r.token}>
                <td>
                  <button
                    type="button"
                    className={`${styles.tokenBtn} type-body-4`}
                    aria-pressed={picked === r.token}
                    onClick={() => setPicked(r.token)}
                  >
                    <span
                      className={styles.swatch}
                      style={{ background: r[mode] }}
                      aria-hidden="true"
                    />
                    {r.token}
                  </button>
                </td>
                <td className={`${styles.hex} type-body-4`}>{r[mode]}</td>
                <td className={`${styles.role} type-body-4`}>{r.rule}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {pickedRow ? (
          <div className={styles.chain}>
            <p className={`${styles.chainHead} type-eyebrow-3`}>
              How {pickedRow.token} reaches a component
            </p>
            <pre className={`${styles.chainCode} type-body-4`}>
              <code>{`tokens.css     --${pickedRow.token}: ${hexToTriplet(pickedRow[mode])};  /* ${pickedRow[mode]} */
tailwind.js    '${pickedRow.token}': 'rgb(var(--${pickedRow.token}) / <alpha-value>)'
component      className="bg-${pickedRow.token}/10 text-${pickedRow.token}"`}</code>
            </pre>
            <p className={`${styles.chainNote} type-body-4`}>
              The triplet form is the trick: Tailwind can compose opacity onto a
              CSS variable, so one declaration serves the fill, the 10% wash and
              the focus ring. Editing this line repaints every use in 45 screens.
            </p>
          </div>
        ) : null}
      </div>

      <div
        className={styles.preview}
        style={{
          background: v("canvas"),
          color: v("ink"),
          borderColor: v("line"),
        }}
      >
        <p className={styles.previewLabel} style={{ color: v("ink-3") }}>
          RENDERED FROM THE TOKENS
        </p>

        <div
          className={styles.card}
          style={{ background: v("surface"), borderColor: v("line") }}
        >
          <div className={styles.cardHead}>
            <span style={{ color: v("ink") }}>Payroll connector</span>
            <span className={styles.pulse}>
              <span
                className={styles.pulseDot}
                style={{ background: v("accent") }}
              />
              <span style={{ color: v("ink-2") }}>live</span>
            </span>
          </div>
          <div
            className={styles.rows}
            style={{ background: v("surface-2"), borderColor: v("line") }}
          >
            {[
              { id: "a1f93c7e2b", state: "success", label: "synced 1,204 records" },
              { id: "d6e0b339c4", state: "warning", label: "slow — 41s" },
              { id: "9c22e01a7f", state: "danger", label: "auth expired" },
            ].map((row) => (
              <div key={row.id} className={styles.row} style={{ borderColor: v("line") }}>
                <span className={styles.rowId} style={{ color: v("ink-3") }}>
                  {row.id}
                </span>
                <span style={{ color: v(row.state) }}>●</span>
                <span style={{ color: v("ink-2") }}>{row.label}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className={styles.cta}
            style={{ background: v("primary"), color: mode === "dark" ? "#0B0C10" : "#FFFFFF" }}
            tabIndex={-1}
          >
            Re-authenticate
          </button>
        </div>

        <p className={styles.previewNote} style={{ color: v("ink-3") }}>
          32px rows, tabular numerals, no hover scale. The mint dot is the only
          place the accent is allowed.
        </p>
      </div>
    </div>
  );
}

function hexToTriplet(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}
