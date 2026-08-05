"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  DEFAULT_THEME,
  STORAGE_KEY,
  THEME_CLASS,
  THEME_LABEL,
  type ThemeName,
} from "@/lib/theme";
import Icon from "./Icon";
import styles from "./ThemeToggle.module.css";

/**
 * The press switch.
 *
 * A two-state control, rendered as a switch rather than a button-that-changes-
 * label, because the thing being controlled is a state the reader can see is on
 * or off — not an action. `role="switch"` with `aria-checked` says exactly that
 * to a screen reader, and it is the one ARIA pattern that carries "this is
 * currently on" without a live region.
 *
 * WHERE THE STATE LIVES, and why it is not useState. The active theme is a
 * class on <body> that ThemeScript already set from localStorage before first
 * paint. That makes the DOM the source of truth and this component a reader of
 * it — which is the exact shape useSyncExternalStore exists for.
 *
 * The alternative, and the first version of this file, was useState +
 * useEffect: mount with the default, correct it after hydration. That works,
 * but it reintroduces on the client a question the document had already
 * answered, and it trips react-hooks/set-state-in-effect for the reason the
 * rule exists — it is a cascading render synchronising React with something
 * that was never out of sync. getServerSnapshot returns the default because the
 * server rendered the default; getSnapshot reads the class that is actually on
 * the element. No effect, no hydration mismatch, no second render.
 *
 * WHAT CARRIES THE STATE, now that the text label is gone. Colour is never the
 * only carrier on this site (globals.css §3), so removing "DARK" / "VIBRANT"
 * had to leave more than a coloured dot behind. Three non-colour signals
 * remain, and the first is new: the FACE CHANGES SHAPE — a crescent for dark,
 * a rayed disc for vibrant — which is a silhouette difference, not a hue one,
 * so it survives greyscale and colour-vision deficiency exactly as the words
 * did. The dot's side and the track's fill are the other two.
 *
 * The accessible name is unaffected: it was always the aria-label, never the
 * visible text, so a screen reader still hears "Vibrant, switch, on". The icon
 * is decorative by construction (no `title`), because aria-checked is already
 * saying what the shape is saying.
 */

/** Theme changes originate here and nowhere else, so the store is one event on
 *  window rather than a MutationObserver over <body>'s class list. */
const CHANGE_EVENT = "ag:themechange";

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  /* A second tab is a second reader of the same stored preference. `storage`
     fires only in the tabs that did NOT write it, which is precisely the set
     that needs telling. */
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): ThemeName {
  return document.body.classList.contains(THEME_CLASS.vibrant)
    ? "vibrant"
    : "dark";
}

function getServerSnapshot(): ThemeName {
  return DEFAULT_THEME;
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const flip = useCallback(() => {
    const current = getSnapshot();
    const next: ThemeName = current === "dark" ? "vibrant" : "dark";
    document.body.classList.remove(THEME_CLASS[current]);
    document.body.classList.add(THEME_CLASS[next]);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* Storage unavailable — the theme still applies for this session, it just
         won't be remembered. The page is not worth failing over a preference. */
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const on = theme === "vibrant";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={flip}
      className={styles.root}
      /* The accessible name is the mode, not "toggle theme" — with aria-checked
         carrying the state, a screen reader says "Vibrant, switch, on", which is
         the whole control in three words. */
      aria-label={THEME_LABEL.vibrant}
      title={on ? "Switch to Dark" : "Switch to Vibrant"}
    >
      <Icon name={on ? "sun" : "moon"} size="sm" className={styles.face} />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.dot} />
      </span>
    </button>
  );
}
