"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { REGISTER_ORDER, type RegisterName } from "@/lib/registers";

/**
 * The register override — one piece of state for the whole essay.
 *
 * `null` is the base reading experience: each chapter renders in the register
 * FINLOG-PAGE-PLAN §4 assigns it, so the page argues its thesis by DEFAULT, not
 * only when asked to. Setting an override forces every chapter to the same
 * register regardless of its own default, which is the "reader can override
 * globally at any time" half of §5.2's mechanic.
 *
 * Persisted so a reader who picks Console does not lose it navigating away and
 * back — but never read from `prefers-color-scheme` on its own, because Ledger
 * is the load default per §5.2 ("the invoice is the truth, so the truth is the
 * default"); a system dark-mode preference is not a request for Console.
 */
const STORAGE_KEY = "finlog-register-override";

type Ctx = {
  override: RegisterName | null;
  setOverride: (next: RegisterName | null) => void;
  /** Increments on every change, including a null → null no-op guard skips it.
   *  Chapters watch this to fire their own transient [data-swapping] window
   *  (globals.css §15, "the register swap") without a second source of truth
   *  for "which register is active right now" living in this context. */
  swapTick: number;
};

const RegisterCtx = createContext<Ctx | null>(null);

export function RegisterProvider({ children }: { children: React.ReactNode }) {
  const [override, setOverrideState] = useState<RegisterName | null>(null);
  const [swapTick, setSwapTick] = useState(0);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "ledger" || stored === "console") {
      setOverrideState(stored);
    }
  }, []);

  const setOverride = useCallback((next: RegisterName | null) => {
    setOverrideState((prev) => {
      if (prev === next) return prev;
      setSwapTick((t) => t + 1);
      if (next) window.localStorage.setItem(STORAGE_KEY, next);
      else window.localStorage.removeItem(STORAGE_KEY);
      return next;
    });
  }, []);

  return (
    <RegisterCtx.Provider value={{ override, setOverride, swapTick }}>
      {children}
    </RegisterCtx.Provider>
  );
}

function useRegisterCtx(): Ctx {
  const ctx = useContext(RegisterCtx);
  if (!ctx) throw new Error("FinLog register components must render inside <RegisterProvider>");
  return ctx;
}

/** A chapter's effective register: the override if the reader set one, else its
 *  own default. Also returns whether THIS chapter should run its transient
 *  cross-dissolve right now, per globals.css's "gated on a transient attribute"
 *  contract. */
export function useChapterRegister(defaultRegister: RegisterName): {
  register: RegisterName;
  swapping: boolean;
} {
  const { override, swapTick } = useRegisterCtx();
  const register = override ?? defaultRegister;
  const [swapping, setSwapping] = useState(false);
  const seenTick = useRef(swapTick);

  useEffect(() => {
    if (swapTick === seenTick.current) return;
    seenTick.current = swapTick;
    setSwapping(true);
    const t = setTimeout(() => setSwapping(false), 180); // --dur-fast
    return () => clearTimeout(t);
  }, [swapTick]);

  return { register, swapping };
}

export function useRegisterOverride() {
  const { override, setOverride } = useRegisterCtx();
  return { override, setOverride };
}

export { REGISTER_ORDER };
