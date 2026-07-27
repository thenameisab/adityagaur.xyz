"use client";

import { useId, useRef, useState } from "react";
import styles from "./Switcher.module.css";

export type SwitcherPanel = {
  /** Control label. Two or three words. */
  label: string;
  title: string;
  body: string;
  /** Optional detail rows. `marker` is a short prefix — a count, a state, a glyph. */
  items?: { marker?: string; label: string; detail?: string }[];
};

type Props = {
  panels: SwitcherPanel[];
  label: string;
};

/**
 * A named-state switcher for comparing framings of the same thing.
 *
 * Same accessibility and fallback contract as `Stepper`: a real tablist with
 * arrow-key navigation, every panel in the server-rendered HTML, and a
 * `scripting: none` rule that reveals them all when JS is unavailable.
 */
export default function Switcher({ panels, label }: Props) {
  const [active, setActive] = useState(0);
  const controlsRef = useRef<HTMLDivElement>(null);
  const baseId = useId();

  function onKeyDown(event: React.KeyboardEvent) {
    const last = panels.length - 1;
    const keys: Record<string, number> = {
      ArrowRight: active === last ? 0 : active + 1,
      ArrowDown: active === last ? 0 : active + 1,
      ArrowLeft: active === 0 ? last : active - 1,
      ArrowUp: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setActive(next);
    controlsRef.current
      ?.querySelectorAll<HTMLButtonElement>("[role='tab']")
      ?.[next]?.focus();
  }

  return (
    <div className={styles.root}>
      <div
        ref={controlsRef}
        className={styles.controls}
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
      >
        {panels.map((panel, i) => (
          <button
            key={panel.label}
            type="button"
            role="tab"
            id={`${baseId}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${baseId}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            className={`${styles.control} type-body-3`}
            onClick={() => setActive(i)}
          >
            {panel.label}
          </button>
        ))}
      </div>

      <div className={styles.panels}>
        {panels.map((panel, i) => (
          <div
            key={panel.label}
            role="tabpanel"
            id={`${baseId}-panel-${i}`}
            aria-labelledby={`${baseId}-tab-${i}`}
            hidden={i !== active}
            tabIndex={0}
            className={styles.panel}
          >
            <h4 className={`${styles.title} type-headline-4`}>{panel.title}</h4>
            <p className={`${styles.body} type-body-3`}>{panel.body}</p>
            {panel.items ? (
              <ul className={styles.items}>
                {panel.items.map((item) => (
                  <li key={item.label} className={`${styles.item} type-body-3`}>
                    <span className={`${styles.marker} type-caption-1`}>
                      {item.marker ?? "—"}
                    </span>
                    <span>
                      <span className={styles.itemLabel}>{item.label}</span>
                      {item.detail ? ` — ${item.detail}` : null}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
