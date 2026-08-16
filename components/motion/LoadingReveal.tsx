'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { LOADING_THRESHOLD_MS, DUR, EASE_OUT } from '@/lib/motion/tokens';

interface LoadingRevealProps {
  label?: string;
}

/**
 * §8.8 — no spinners, anywhere. Route loads show the destination's
 * frame assembling: corner brackets draw in, the panel clips open
 * from its centre. Under 200ms, nothing renders at all — most loads
 * should never show this, and a flash-then-gone loader is worse than
 * no loader.
 */
export default function LoadingReveal({ label = 'Loading' }: LoadingRevealProps) {
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), LOADING_THRESHOLD_MS);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <motion.div
        className="clip-panel relative flex h-32 w-56 items-center justify-center border border-line bg-panel"
        initial={reducedMotion ? false : { clipPath: 'inset(50% 50% 50% 50%)' }}
        animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        transition={{ duration: DUR.slow, ease: EASE_OUT }}
      >
        <span aria-hidden className="corner-bracket corner-bracket--tl" />
        <span aria-hidden className="corner-bracket corner-bracket--tr" />
        <span aria-hidden className="corner-bracket corner-bracket--bl" />
        <span aria-hidden className="corner-bracket corner-bracket--br" />
        <span className="font-hud text-telemetry uppercase text-text-lo">{label}</span>
      </motion.div>
    </div>
  );
}
