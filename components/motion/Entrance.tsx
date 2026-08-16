'use client';

import { Children, isValidElement, useEffect, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ENTRANCE_STAGGER_MS, ENTRANCE_STAGGER_CAP, DUR, EASE_OUT } from '@/lib/motion/tokens';

interface EntranceProps {
  children: ReactNode;
  className?: string;
  /** Class applied to each staggered item wrapper. */
  itemClassName?: string;
}

/**
 * §8.4 — showcase-register only. On first paint, children arrive in a
 * deliberate sequence: 40ms stagger, 8px upward translate, opacity
 * 0→1. Capped at ~6 staggered items — anything beyond that arrives
 * together with the 6th, so a long list doesn't take visibly longer
 * to finish appearing than a short one.
 *
 * `animate` (not `initial`) is gated behind a post-mount `mounted`
 * flag: Framer Motion renders using `initial`'s values for SSR, and
 * this component's first client render runs *before* the mount effect
 * flips `mounted` — so on that first render, `animate` still equals
 * `initial` and nothing has moved yet, matching the server's output
 * exactly. Only after mount does `animate` change, which is what
 * actually plays the transition — as a genuine post-hydration update,
 * not something React's hydration check ever has to compare against
 * the server. Gating `initial` instead (the more obvious-looking fix)
 * doesn't work: the server would still render the *other* value.
 */
export default function Entrance({ children, className, itemClassName }: EntranceProps) {
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const items = Children.toArray(children);
  const restState = { opacity: 0, y: 8 };
  const enteredState = { opacity: 1, y: 0 };

  return (
    <div className={className}>
      {items.map((child, i) => {
        const key = isValidElement(child) && child.key != null ? child.key : i;
        const delaySteps = Math.min(i, ENTRANCE_STAGGER_CAP - 1);
        const delay = reducedMotion ? 0 : (delaySteps * ENTRANCE_STAGGER_MS) / 1000;
        return (
          <motion.div
            key={key}
            className={itemClassName}
            initial={reducedMotion ? false : restState}
            animate={reducedMotion || mounted ? enteredState : restState}
            transition={{ duration: DUR.slow, ease: EASE_OUT, delay }}
          >
            {child}
          </motion.div>
        );
      })}
    </div>
  );
}
