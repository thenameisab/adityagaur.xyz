"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type RefObject,
} from "react";

/**
 * THE SESSION — one `useReducer` at the essay root, and the state chapter 009's
 * artifact closes out.
 *
 * THIS REPLACES THE PLAN'S CLIENT CONFIGURATOR, DELIBERATELY, AND THE PROSE IS
 * WHY. FINLOG-PAGE-PLAN §5.5 has the reader configure a client in chapter 003 —
 * volume, model, a trial interface, a vendor cost — which then flows through 004,
 * 007, 008 and 009 so the ending is computed from their own inputs. That is a good
 * mechanic and it is not the one that shipped, because the prose that landed in
 * PR #19 took the opposite turn and took it for a better reason: chapter 009 now
 * states that the rail has been running ONE REAL ACCOUNT'S month for nine
 * chapters ("that's not a demo account"), and prints ₹1,23,847.49 as the invoice.
 * A reader-configured client would put a second, invented total beside that one —
 * on the page whose whole argument is that the number which bills is the only one
 * entitled to be treated as true. The essay would have been arguing against
 * itself in its own last chapter.
 *
 * So the session tracks what a reading session actually has to offer that is real:
 * WHICH CHAPTERS THE READER REACHED THE END OF, and how many words of prose each
 * one held. The artifact's slot has said exactly this since the prose merged —
 * "built live from this session's own reading — every chapter you actually
 * visited" — and it keeps the half of §5.5 that mattered: the payoff is gated the
 * way Tines gates theirs, and the ending is genuinely computed rather than
 * revealed. It just declines to compute it in rupees it made up.
 *
 * NOTHING IS PERSISTED, and that is the honest choice rather than a limitation. A
 * statement for THIS session is a true statement; one restored from a fortnight
 * ago would be a claim about reading that never happened. The register override
 * next door persists because it is a preference; this is a measurement.
 */

export type ReadingLine = {
  line: string;
  title: string;
  /** Words of prose in the chapter, MEASURED from the rendered DOM rather than
   *  baked — see `measureWords`. */
  words: number;
  /** True once the reader has reached the chapter's end. */
  read: boolean;
};

type State = {
  /** Keyed by line number, insertion-ordered by registration, which is document
   *  order — so the statement itemises in the order the essay reads. */
  lines: Record<string, ReadingLine>;
  order: string[];
};

type Action =
  | { type: "register"; line: string; title: string; words: number }
  | { type: "read"; line: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "register": {
      const existing = state.lines[action.line];
      // Idempotent: a remount (the register swap remounts chapter bodies) must
      // not duplicate a line or discard a `read` already earned.
      if (existing && existing.words === action.words) return state;
      return {
        lines: {
          ...state.lines,
          [action.line]: {
            line: action.line,
            title: action.title,
            words: action.words,
            read: existing?.read ?? false,
          },
        },
        order: state.order.includes(action.line) ? state.order : [...state.order, action.line],
      };
    }
    case "read": {
      const existing = state.lines[action.line];
      if (!existing || existing.read) return state;
      return {
        ...state,
        lines: { ...state.lines, [action.line]: { ...existing, read: true } },
      };
    }
  }
}

type Ctx = {
  lines: ReadingLine[];
  register: (line: string, title: string, words: number) => void;
  markRead: (line: string) => void;
};

const ReadingCtx = createContext<Ctx | null>(null);

export function ReadingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: {}, order: [] });

  const register = useCallback((line: string, title: string, words: number) => {
    dispatch({ type: "register", line, title, words });
  }, []);
  const markRead = useCallback((line: string) => {
    dispatch({ type: "read", line });
  }, []);

  const lines = useMemo(
    () => state.order.map((l) => state.lines[l]).filter(Boolean),
    [state]
  );

  return (
    <ReadingCtx.Provider value={{ lines, register, markRead }}>{children}</ReadingCtx.Provider>
  );
}

/** Null outside a provider rather than throwing, because A7 has to be able to
 *  render its ungated state — and a chapter should not take the page down if it
 *  is ever rendered outside the essay (the styleguide does exactly that). */
export function useReading(): Ctx | null {
  return useContext(ReadingCtx);
}

/**
 * Words of prose in a chapter body.
 *
 * PROSE MEANS THE RUNNING TEXT AND THE MARGINALIA, AND NOTHING ELSE — a
 * definition rather than a shortcut, and one that had to be measured to get
 * right. Counting the body's whole subtree folds every artifact into the total:
 * across the nine chapters the figures hold 2,091 words of table headings, row
 * labels and captions, which would have inflated the statement by about two
 * thirds and made it a count of markup rather than of reading.
 *
 * So: direct paragraph children — the same set `.chapterBody > p` paints the
 * ruled ground on, so this agrees with what the design already calls prose — plus
 * the paragraphs inside a direct `aside`, because a marginal note is text the
 * reader reads. That is 2,857 plus 371 words. Instruments (`figure`) and the
 * layout devices (`div`, `dl`, the display figure `span`) are excluded, and those
 * last three hold four words between them.
 */
function measureWords(root: HTMLElement): number {
  const wordsIn = (el: Element): number => {
    const text = (el.textContent ?? "").trim();
    return text ? text.split(/\s+/).length : 0;
  };

  let words = 0;
  for (const child of Array.from(root.children)) {
    if (child.tagName === "P") words += wordsIn(child);
    // Marginalia. Its paragraphs rather than the aside itself, so a label the
    // component renders as chrome is not counted as something read.
    else if (child.tagName === "ASIDE") {
      for (const p of Array.from(child.querySelectorAll("p"))) words += wordsIn(p);
    }
  }
  return words;
}

/**
 * A chapter's half of the contract: measure itself, register, and report when the
 * reader reaches its end.
 *
 * THE SENTINEL IS AT THE CHAPTER'S END, not on the chapter itself, and that is
 * the only definition of "read" that works here. These chapters run several
 * viewports tall, so an IntersectionObserver threshold on the section never fires
 * at 50% and fires immediately at 0 — the first would mark nothing read and the
 * second would mark a chapter read for scrolling past its title. Watching a
 * zero-height element at the end asks the question that actually matters: did the
 * reader get to the bottom of this one.
 */
export function useChapterReading(
  line: string,
  title: string,
  bodyRef: RefObject<HTMLDivElement | null>,
  endRef: RefObject<HTMLDivElement | null>
) {
  const reading = useReading();

  useEffect(() => {
    if (!reading || !bodyRef.current) return;
    reading.register(line, title, measureWords(bodyRef.current));
  }, [reading, line, title, bodyRef]);

  useEffect(() => {
    if (!reading || !endRef.current) return;
    const el = endRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reading.markRead(line);
            // One-way: a chapter cannot become unread, so stop watching rather
            // than keep a live observer per chapter for the rest of the page.
            observer.disconnect();
          }
        }
      },
      // A little early, so reaching the last paragraph counts as reading it
      // rather than requiring the reader to scroll past the chapter's margin.
      { rootMargin: "0px 0px -15% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reading, line, endRef]);
}
