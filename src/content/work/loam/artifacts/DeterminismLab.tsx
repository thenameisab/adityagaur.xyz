"use client";

import { useMemo, useState } from "react";
import styles from "./DeterminismLab.module.css";

/**
 * The determinism contract, made operable.
 *
 * Loam's press promises that the same document bytes, `PressVersion`, and theme
 * version produce byte-identical HTML on any machine. This artifact models that
 * promise and lets the reader break it: switch on a forbidden read and watch the
 * digest diverge, then watch which of the three gates catches it.
 *
 * The digest here is FNV-1a, not SHA-256 — it stands in for "the bytes changed"
 * and is labelled as illustrative in the caption. What is faithful is the
 * *structure*: which inputs are allowed to influence output, and which gate
 * catches which class of failure.
 */

/** The shipped version, and the next one — bumping it is what a deliberate
    output change looks like. */
const PRESS_VERSIONS = ["0.9.0", "0.10.0"] as const;

/** Real themes, at their real versions. Each theme's CSS is versioned
    separately, because a CSS change alters output bytes too. */
const THEMES = [
  { name: "article", version: "0.8.0" },
  { name: "docs", version: "0.6.0" },
  { name: "minimal", version: "0.5.0" },
] as const;

type PressVersion = (typeof PRESS_VERSIONS)[number];
type Theme = (typeof THEMES)[number]["name"];

/**
 * The six things `LoamEngine` may not read.
 *
 * `scope` is the honest distinction between them, and it is what decides which
 * gate catches the failure. The clock and the RNG move between two renders on
 * the *same* machine, so a double-render catches them. Locale, environment,
 * filesystem state, and the network are stable within a machine but differ
 * across machines, so only the cross-generation gate catches those.
 */
const FORBIDDEN_READS = [
  {
    id: "clock",
    name: "the clock",
    scope: "run",
    detail: "timestamps, “generated at”",
  },
  {
    id: "randomness",
    name: "randomness",
    scope: "run",
    detail: "UUIDs, session ids, salted hashes",
  },
  {
    id: "locale",
    name: "the locale",
    scope: "machine",
    detail: "collation, number and date formatting",
  },
  {
    id: "environment",
    name: "the environment",
    scope: "machine",
    detail: "env vars, hostname, username, paths",
  },
  {
    id: "filesystem",
    name: "filesystem state",
    scope: "machine",
    detail: "anything outside the input document",
  },
  {
    id: "network",
    name: "the network",
    scope: "machine",
    detail: "no network dependency at all",
  },
] as const;

type ReadId = (typeof FORBIDDEN_READS)[number]["id"];

/** Two CI runners with genuinely different values for every forbidden read. */
const MACHINES = {
  a: {
    label: "macos-15 · Swift 6.0 · JSC 19",
    clock: "2026-07-27T09:14:02Z",
    randomness: "a3f19c",
    locale: "en_US",
    environment: "/Users/runner/work",
    filesystem: "mtime=1753602842",
    network: "cdn-resolved-v1",
  },
  b: {
    label: "macos-26 · Swift 6.2 · JSC 22",
    clock: "2026-07-27T09:16:47Z",
    randomness: "7b02de",
    locale: "en_GB",
    environment: "/Users/runner2/work",
    filesystem: "mtime=1753603007",
    network: "cdn-resolved-v2",
  },
} as const;

const DEFAULT_DOC = `---
title: Determinism
---

# Determinism

Same bytes in, same bytes out.

| gate | catches |
|---|---|
| verify | drift |
`;

/** FNV-1a, 32-bit, run twice over different offsets for a 16-char digest. */
function digest(input: string): string {
  const pass = (offset: number) => {
    let h = offset;
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, "0");
  };
  return `${pass(0x811c9dc5)}${pass(0x9dc5811c)}`;
}

type Inputs = {
  doc: string;
  pressVersion: PressVersion;
  theme: Theme;
};

/**
 * The render, modelled. Permitted inputs always contribute. A forbidden read
 * contributes that machine's value for it — which is exactly the bug the
 * contract exists to prevent.
 */
function render(
  inputs: Inputs,
  active: ReadId[],
  machine: keyof typeof MACHINES,
  runIndex: number,
): string {
  const m = MACHINES[machine];
  const contamination = active
    .map((id) => {
      const read = FORBIDDEN_READS.find((r) => r.id === id)!;
      // A run-scoped read differs between two renders on the same machine too.
      return read.scope === "run" ? `${id}=${m[id]}#${runIndex}` : `${id}=${m[id]}`;
    })
    .join("|");

  const themeVersion = THEMES.find((t) => t.name === inputs.theme)!.version;

  return digest(
    [inputs.doc, inputs.pressVersion, `${inputs.theme}@${themeVersion}`, contamination].join(
      "",
    ),
  );
}

export default function DeterminismLab() {
  const [doc, setDoc] = useState(DEFAULT_DOC);
  const [pressVersion, setPressVersion] = useState<PressVersion>("0.9.0");
  const [theme, setTheme] = useState<Theme>("article");
  const [active, setActive] = useState<ReadId[]>([]);
  const [golden, setGolden] = useState(() =>
    render({ doc: DEFAULT_DOC, pressVersion: "0.9.0", theme: "article" }, [], "a", 0),
  );

  const inputs = useMemo(() => ({ doc, pressVersion, theme }), [doc, pressVersion, theme]);

  const runs = useMemo(
    () => ({
      a1: render(inputs, active, "a", 0),
      a2: render(inputs, active, "a", 1),
      b1: render(inputs, active, "b", 0),
    }),
    [inputs, active],
  );

  const stableWithinMachine = runs.a1 === runs.a2;
  const matchesGolden = runs.a1 === golden;
  const stableAcrossMachines = runs.a1 === runs.b1;
  const goldenStale = !matchesGolden;

  function toggleRead(id: ReadId) {
    setActive((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  }

  function recordGoldens() {
    setGolden(runs.a1);
  }

  function reset() {
    setDoc(DEFAULT_DOC);
    setPressVersion("0.9.0");
    setTheme("article");
    setActive([]);
    setGolden(
      render({ doc: DEFAULT_DOC, pressVersion: "0.9.0", theme: "article" }, [], "a", 0),
    );
  }

  const gates = [
    {
      name: "make verify — double render",
      cmd: "same machine, rendered twice, bytes compared",
      pass: stableWithinMachine,
      verdict: stableWithinMachine
        ? "Both renders on macos-15 produced the same bytes."
        : "The same machine produced two different outputs. Nondeterminism inside a single run.",
    },
    {
      name: "make verify — golden compare",
      cmd: "output vs the checked-in golden file",
      pass: matchesGolden,
      verdict: matchesGolden
        ? "Output matches the recorded bytes."
        : "Output drifted from the golden file. Either an accidental change, or a deliberate one that hasn't been recorded yet.",
    },
    {
      name: "Determinism workflow — cross-generation",
      cmd: "every fixture × every theme, two runner generations, SHA-256 manifests compared",
      pass: stableAcrossMachines,
      verdict: stableAcrossMachines
        ? "macos-15 and macos-26 produced identical manifests."
        : "The two runners disagree. Different OS, different compiler, different JS engine — different bytes.",
    },
  ];

  return (
    <div className={styles.root}>
      <div className={styles.inputs}>
        <div className={styles.group}>
          <strong className={`${styles.groupHead} type-eyebrow-3`}>
            The three permitted inputs
          </strong>
          <p className={`${styles.groupNote} type-body-4`}>
            Output is a pure function of exactly these. Change one and the bytes
            are supposed to change.
          </p>

          <div className={styles.field}>
            <label
              className={`${styles.fieldLabel} type-body-4`}
              htmlFor="lab-doc"
            >
              The document
            </label>
            <textarea
              id="lab-doc"
              className={styles.doc}
              value={doc}
              spellCheck={false}
              onChange={(e) => setDoc(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <span className={`${styles.fieldLabel} type-body-4`} id="lab-press">
              PressVersion
            </span>
            <div className={styles.pills} role="group" aria-labelledby="lab-press">
              {PRESS_VERSIONS.map((v) => (
                <button
                  key={v}
                  type="button"
                  className={styles.pill}
                  aria-pressed={pressVersion === v}
                  onClick={() => setPressVersion(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <span className={`${styles.fieldLabel} type-body-4`} id="lab-theme">
              Theme version
            </span>
            <div className={styles.pills} role="group" aria-labelledby="lab-theme">
              {THEMES.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  className={styles.pill}
                  aria-pressed={theme === t.name}
                  onClick={() => setTheme(t.name)}
                >
                  {t.name}@{t.version}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.group}>
          <strong className={`${styles.groupHead} type-eyebrow-3`}>
            The six forbidden reads
          </strong>
          <p className={`${styles.groupNote} type-body-4`}>
            The engine has no code path to any of these. Switch one on to see what
            it would cost.
          </p>

          <div className={styles.forbidden}>
            {FORBIDDEN_READS.map((read) => (
              <button
                key={read.id}
                type="button"
                className={`${styles.readRow} type-body-3`}
                aria-pressed={active.includes(read.id)}
                onClick={() => toggleRead(read.id)}
              >
                <span className={styles.box} aria-hidden="true" />
                <span>
                  <span className={styles.readName}>{read.name}</span>
                  <span className="text-faint"> — {read.detail}</span>
                </span>
                <span className={`${styles.readScope} type-body-4`}>
                  per {read.scope}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.output}>
        <strong className={`${styles.groupHead} type-eyebrow-3`}>
          What the runners produced
        </strong>

        <div className={styles.runs}>
          <div className={styles.run} data-diverged={!stableWithinMachine}>
            <span className={`${styles.runName} type-body-3`}>
              Render 1
              <span className={`${styles.runMachine} type-body-4`}>
                {MACHINES.a.label}
              </span>
            </span>
            <span className={styles.hash}>{runs.a1}</span>
          </div>
          <div className={styles.run} data-diverged={!stableWithinMachine}>
            <span className={`${styles.runName} type-body-3`}>
              Render 2
              <span className={`${styles.runMachine} type-body-4`}>
                same machine, immediately after
              </span>
            </span>
            <span className={styles.hash}>{runs.a2}</span>
          </div>
          <div className={styles.run} data-diverged={!stableAcrossMachines}>
            <span className={`${styles.runName} type-body-3`}>
              Render 3
              <span className={`${styles.runMachine} type-body-4`}>
                {MACHINES.b.label}
              </span>
            </span>
            <span className={styles.hash}>{runs.b1}</span>
          </div>
        </div>

        <div className={styles.gates}>
          {gates.map((gate) => (
            <div key={gate.name} className={styles.gate} data-pass={gate.pass}>
              <span className={styles.mark} aria-hidden="true" />
              <span className="type-body-3">
                <span className={styles.gateName}>{gate.name}</span>{" "}
                <span className={`${styles.gateCmd} type-body-4`}>
                  ({gate.cmd})
                </span>
                <span className={`${styles.gateVerdict} type-body-3`}>
                  {gate.pass ? "Pass. " : "Fail. "}
                  {gate.verdict}
                </span>
              </span>
            </div>
          ))}
        </div>

        <div className={styles.golden}>
          <div className={styles.goldenRow}>
            <span className="type-body-3 text-muted">
              Golden file{" "}
              <span className={styles.goldenHash}>{golden}</span>
            </span>
            <button
              type="button"
              className={`${styles.button} type-body-4`}
              onClick={recordGoldens}
              disabled={!goldenStale}
            >
              make goldens
            </button>
          </div>
          <p className={`${styles.goldenNote} type-body-4`}>
            {goldenStale
              ? stableWithinMachine && stableAcrossMachines
                ? "Output changed and it is stable. That is a deliberate change: bump PressVersion, re-record the goldens in the same commit, and the golden diff becomes the record of what changed."
                : "Don't record this. Recording unstable output would bless the nondeterminism and the gate would stop protecting anything."
              : "Recorded bytes and current output agree. Nothing to do."}
          </p>
        </div>

        <button type="button" className={`${styles.reset} type-body-4`} onClick={reset}>
          Reset the lab
        </button>
      </div>
    </div>
  );
}
