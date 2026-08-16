'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
import { DUR, EASE_OUT } from '@/lib/motion/tokens';

interface NumberTransitionProps {
  value: number;
  className?: string;
  format?: (n: number) => string;
}

/**
 * §8.7 — any changing stat (HP, points, shards, level) animates from
 * old to new over 360ms, never snapping. The fight screen's HP number
 * has its own dedicated treatment (ties to the ghost-trail ban); this
 * is for showcase-register stats — the player card, loot counts, etc.
 */
export default function NumberTransition({ value, className, format = (n) => Math.round(n).toString() }: NumberTransitionProps) {
  const [display, setDisplay] = useState(value);
  const reducedMotion = useReducedMotion();
  const prev = useRef(value);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value);
      prev.current = value;
      return;
    }
    const controls = animate(prev.current, value, {
      duration: DUR.slow,
      ease: EASE_OUT,
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, reducedMotion]);

  return <span className={className}>{format(display)}</span>;
}
