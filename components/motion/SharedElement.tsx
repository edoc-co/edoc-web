'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { DUR, EASE_SCENE } from '@/lib/motion/tokens';

interface SharedElementProps extends HTMLMotionProps<'div'> {
  layoutId: string;
}

/**
 * §8.3 — the single highest-leverage pattern for the showcase feel.
 * Thin wrapper over Framer Motion's `layoutId` with the §7 scene
 * timing baked in, so every shared-element transition in the app uses
 * the same 600ms/--ease-scene rather than each call site guessing.
 * A language card becomes the fight screen's boss frame; a boss frame
 * becomes the artifact card — give both ends of a transition the same
 * `layoutId` and Framer Motion animates the morph automatically.
 */
export default function SharedElement({ layoutId, transition, ...rest }: SharedElementProps) {
  return <motion.div layoutId={layoutId} transition={{ duration: DUR.scene, ease: EASE_SCENE, ...transition }} {...rest} />;
}
