"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// Tasteful entrance: short, ease-out, small rise. Disabled entirely under prefers-reduced-motion.
// Custom cubic-bezier (not a built-in easing) per the craft bar.
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export default function FadeIn({
  children,
  delay = 0,
  y = 10,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}
