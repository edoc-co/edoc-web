'use client';

import { motion, type HTMLMotionProps, useReducedMotion } from 'framer-motion';
import { DUR, EASE_SNAP } from '@/lib/motion/tokens';

type PressableProps = HTMLMotionProps<'button'>;

/**
 * §8.9 — press physics, applied everywhere a button exists (both
 * registers; this is cheap enough and consistent enough that it isn't
 * register-gated like the others). Scales to 0.97 on press at
 * --dur-instant, releases on --ease-snap. Consistent everywhere is
 * most of what "feels good" means here — components/hud/Button and
 * Pill both render through this instead of a plain <button>.
 */
export default function Pressable({ children, ...rest }: PressableProps) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.button
      whileTap={reducedMotion ? undefined : { scale: 0.97 }}
      transition={{ duration: DUR.instant, ease: EASE_SNAP }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
