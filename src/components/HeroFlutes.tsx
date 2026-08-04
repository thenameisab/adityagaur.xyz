"use client";

import { useEffect, useRef } from "react";
import styles from "./Hero.module.css";

/**
 * The home hero's atmosphere: a fan of five diagonal blades — the RazorSense
 * "flute" glyph — plus one drifting glow. Purely decorative, so the whole
 * layer is aria-hidden and pointer-events: none.
 *
 * The only JavaScript here is pointer parallax, and it writes exactly two
 * custom properties (--px / --py, both in −1…1). Everything that moves —
 * breathing, the sheen sweep, the entrance — is CSS, so the layer renders
 * complete and static without JS, under reduced motion, and on touch devices
 * (both of which skip the listener entirely).
 *
 * Parallax rides the `translate` property while the breath animation owns
 * `transform`; the two compose instead of clobbering each other, and the
 * static blade angle sits in `rotate` between them.
 */
export default function HeroFlutes() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        el.style.setProperty("--px", ((e.clientX / window.innerWidth - 0.5) * 2).toFixed(3));
        el.style.setProperty("--py", ((e.clientY / window.innerHeight - 0.5) * 2).toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={styles.flutes} aria-hidden="true">
      <span className={styles.orb} />
      <span className={`${styles.blade} ${styles.b1}`} />
      <span className={`${styles.blade} ${styles.b2}`} />
      <span className={`${styles.blade} ${styles.b3} ${styles.live}`} />
      <span className={`${styles.blade} ${styles.b4}`} />
      <span className={`${styles.blade} ${styles.b5}`} />
    </div>
  );
}
