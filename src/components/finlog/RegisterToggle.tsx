"use client";

import { REGISTER_ORDER, useRegisterOverride } from "./Register";
import styles from "./finlog.module.css";

const LABEL: Record<"ledger" | "console" | "default", string> = {
  ledger: "Ledger",
  console: "Console",
  default: "Default",
};

/**
 * The mechanic from FINLOG-PAGE-PLAN §5.2, introduced in chapter 002 and pinned
 * in the sticky rail after it: "this page has two modes because the product
 * does. One of them bills." A three-way segmented control rather than a plain
 * on/off switch, because the base reading experience is neither register —
 * it's each chapter in the one §4 assigns it — and a binary switch has no
 * position for that. DEFAULT clears the override and returns to that mix.
 *
 * `role="radiogroup"` over a tablist: this picks a mode, it doesn't switch
 * panels, and radio semantics are what a screen reader already knows how to
 * announce for "one of three, currently console."
 */
export default function RegisterToggle({ className }: { className?: string }) {
  const { override, setOverride } = useRegisterOverride();

  return (
    <div
      role="radiogroup"
      aria-label="Reading register"
      className={[styles.toggle, className].filter(Boolean).join(" ")}
    >
      {(["ledger", "default", "console"] as const).map((value) => {
        const checked = value === "default" ? override === null : override === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={checked}
            data-active={checked || undefined}
            className={`${styles.toggleOption} type-ui-2`}
            onClick={() => setOverride(value === "default" ? null : value)}
          >
            {LABEL[value]}
          </button>
        );
      })}
    </div>
  );
}

export { REGISTER_ORDER };
