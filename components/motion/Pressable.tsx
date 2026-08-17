'use client';

import { motion, type HTMLMotionProps, useReducedMotion } from 'framer-motion';
import { useMotionTokens } from '@/lib/motion/useMotionTokens';

type PressableProps = HTMLMotionProps<'button'>;

/**
 * §8.9 — press physics, applied everywhere a button exists (both
 * registers; this is cheap enough and consistent enough that it isn't
 * register-gated like the others). Scales to 0.97 on press at
 * --dur-instant, releases on --ease-snap. Consistent everywhere is
 * most of what "feels good" means here — components/hud/Button and
 * Pill both render through this instead of a plain <button>.
 *
 * Reads the *live* --dur-instant/--ease-snap via useMotionTokens
 * rather than a hardcoded Forge duration, so the same press feels
 * ~1.4x slower and gentler in Grove with no `if (world === ...)`
 * here — this is the one primitive rendered on nearly every screen,
 * so it's the highest-value place to prove the pattern works.
 */
export default function Pressable({ children, ...rest }: PressableProps) {
  const reducedMotion = useReducedMotion();
  const { dur, easeSnap } = useMotionTokens();
  return (
    <motion.button
      whileTap={reducedMotion ? undefined : { scale: 0.97 }}
      transition={{ duration: dur.instant, ease: easeSnap }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
