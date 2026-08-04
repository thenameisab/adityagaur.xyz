"use client";

import { useEffect, useRef } from "react";

type Props = React.HTMLAttributes<HTMLDivElement>;

/**
 * A wrapper whose descendant <article>s get cursor-relative coordinates as
 * --mx / --my custom properties, in their own pixel space. What those become —
 * a spotlight, a glow — is the consumer's CSS; whether they show at all is a
 * :hover rule, so this component holds no state and renders nothing extra.
 *
 * Same contract as HeroFlutes: JS only writes custom properties, listeners
 * skip touch and reduced-motion, and without JS the cards render complete.
 */
export default function Spotlight({ children, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;

    let raf = 0;
    let last: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      if (!last) return;
      for (const card of el.querySelectorAll<HTMLElement>("article")) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${(last.clientX - r.left).toFixed(1)}px`);
        card.style.setProperty("--my", `${(last.clientY - r.top).toFixed(1)}px`);
      }
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      el.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  );
}
