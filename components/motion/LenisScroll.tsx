'use client';

import { useEffect } from 'react';
import { prefersReducedMotion } from '@/lib/motion/reducedMotion';

/**
 * §13: "Lenis — smooth scroll on landing and coaster only. Never used
 * for the fight screen." Mount this once at the top of those two
 * routes and nowhere else. Dynamically imports `lenis` inside an
 * effect so its runtime never ships to a route that doesn't render
 * this component — the fight screen's bundle must never pull it in.
 */
export default function LenisScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    let lenis: { raf: (time: number) => void; destroy: () => void } | undefined;
    let rafId = 0;
    let cancelled = false;

    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;
      // 1.1s is Lenis's own smoothing-duration tuning parameter, not
      // one of DESIGN.md's UI durations (§7) — a different axis
      // (scroll momentum feel) with its own reasonable default.
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    });

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);

  return null;
}
