'use client';

import { Children, isValidElement, type ReactNode } from 'react';
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
 */
export default function Entrance({ children, className, itemClassName }: EntranceProps) {
  const reducedMotion = useReducedMotion();
  const items = Children.toArray(children);

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
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.slow, ease: EASE_OUT, delay }}
          >
            {child}
          </motion.div>
        );
      })}
    </div>
  );
}
