'use client';

import { useRef, type ReactNode, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { isTouchDevice } from '@/lib/motion/reducedMotion';
import { MAGNETIC_RADIUS_PX, MAGNETIC_MAX_TRANSLATE_PX } from '@/lib/motion/tokens';

interface MagneticProps {
  children: ReactNode;
  className?: string;
}

/**
 * §8.2 — showcase-register only. Translates the wrapped element up to
 * 6px toward the cursor within a 40px radius, springing back on exit.
 * Disabled on touch and reduced motion (renders a plain wrapper then).
 */
export default function Magnetic({ children, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const disabled = reducedMotion || isTouchDevice();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const radius = MAGNETIC_RADIUS_PX + Math.max(rect.width, rect.height) / 2;
    if (dist > radius) {
      x.set(0);
      y.set(0);
      return;
    }
    // At dist === MAGNETIC_RADIUS_PX this yields exactly the max
    // translate; it tapers as the cursor gets further from centre.
    const scale = MAGNETIC_MAX_TRANSLATE_PX / MAGNETIC_RADIUS_PX;
    x.set(dx * scale);
    y.set(dy * scale);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}
