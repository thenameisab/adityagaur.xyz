"use client";

import { useId, useRef, useState } from "react";
import styles from "./Stepper.module.css";

export type Step = {
  /** Rail label. Keep it to a few words. */
  name: string;
  /** Panel heading. */
  title: string;
  /** One or two sentences. What happens at this stage, and why. */
  body: string;
  /** Optional code or data shown as input → output for the stage. */
  input?: { label: string; code: string };
  output?: { label: string; code: string };
};

type Props = {
  steps: Step[];
  /** Accessible name for the rail. */
  label: string;
};

/**
 * A walkthrough of a pipeline, one stage at a time.
 *
 * Implemented as a real tablist: arrow keys move between stages, Home and End
 * jump to the ends, and focus follows selection.
 *
 * Every panel is server-rendered, including the inactive ones, so the whole
 * pipeline is in the static HTML that crawlers read. Inactive panels are hidden
 * with the `hidden` attribute; the `scripting: none` query in the stylesheet
 * reveals them again when JS genuinely isn't available, which keeps the fallback
 * out of the hydration path and avoids a flash of every panel on load.
 */
export default function Stepper({ steps, label }: Props) {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const baseId = useId();

  function focusStep(index: number) {
    setActive(index);
    const buttons = railRef.current?.querySelectorAll<HTMLButtonElement>(
      "[role='tab']",
    );
    buttons?.[index]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const last = steps.length - 1;
    const keys: Record<string, number> = {
      ArrowDown: active === last ? 0 : active + 1,
      ArrowRight: active === last ? 0 : active + 1,
      ArrowUp: active === 0 ? last : active - 1,
      ArrowLeft: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    focusStep(next);
  }

  return (
    <div className={styles.root}>
      <div
        ref={railRef}
        className={styles.rail}
        role="tablist"
        aria-label={label}
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
      >
        {steps.map((step, i) => (
          <button
            key={step.name}
            type="button"
            role="tab"
            id={`${baseId}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${baseId}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            className={`${styles.step} type-body-3`}
            onClick={() => setActive(i)}
          >
            <span className={`${styles.ordinal} type-caption-1`}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className={styles.stepName}>{step.name}</span>
          </button>
        ))}
      </div>

      <div className={styles.panels}>
        {steps.map((step, i) => (
          <div
            key={step.name}
            role="tabpanel"
            id={`${baseId}-panel-${i}`}
            aria-labelledby={`${baseId}-tab-${i}`}
            hidden={i !== active}
            tabIndex={0}
            className={styles.panel}
          >
            <h4 className={`${styles.panelTitle} type-headline-4`}>{step.title}</h4>
            <p className={`${styles.panelBody} type-body-3`}>{step.body}</p>
            {step.input || step.output ? (
              <div className={styles.io}>
                {[step.input, step.output]
                  .filter((b): b is NonNullable<typeof b> => Boolean(b))
                  .map((block) => (
                    <div key={block.label} className={styles.ioBlock}>
                      <span className={`${styles.ioLabel} type-eyebrow-3`}>
                        {block.label}
                      </span>
                      <pre className={`${styles.code} type-body-4`}>
                        <code>{block.code}</code>
                      </pre>
                    </div>
                  ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
