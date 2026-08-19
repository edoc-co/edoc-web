'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * §8.6 — landing and coaster only, never the fight screen. Position
 * is driven by scroll progress (`useScroll` + `useTransform`), not
 * time — the user's scroll always maps predictably to movement, never
 * scroll-jacked.
 *
 * Same hydration-mismatch class as TextReveal.tsx/Entrance.tsx/
 * AmbientDrift.tsx: `useReducedMotion()` reads matchMedia synchronously,
 * so returning an entirely different element (plain `<div>` vs.
 * `<motion.div style={{opacity,y}}>`) based on it directly disagreed
 * with the server (which always assumes `false`) on this component's
 * very first client render — a real, confirmed console warning here
 * (soft, not a hard failure, since both are still a `<div>` — but the
 * same underlying bug). `mounted` starts `false` unconditionally, so
 * the first paint always renders `motion.div` with the scroll-linked
 * style, matching the server; only after mount does a genuinely
 * reduced-motion client swap the style to a static, fully-visible one
 * — a normal post-hydration update, not something hydration compares.
 */
export default function ScrollReveal({ children, className }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'start 40%'] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);

  const style = mounted && reducedMotion ? { opacity: 1, y: 0 } : { opacity, y };

  return (
    <motion.div ref={ref} className={className} style={style}>
      {children}
    </motion.div>
  );
}
