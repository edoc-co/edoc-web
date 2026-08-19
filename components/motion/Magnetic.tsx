'use client';

import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { isTouchDevice } from '@/lib/motion/reducedMotion';
import { MAGNETIC_RADIUS_PX, MAGNETIC_MAX_TRANSLATE_PX } from '@/lib/motion/tokens';
import { useMotionTokens } from '@/lib/motion/useMotionTokens';

interface MagneticProps {
  children: ReactNode;
  className?: string;
}

/**
 * §8.2 — showcase-register only. Translates the wrapped element up to
 * 6px toward the cursor within a 40px radius, springing back on exit.
 * Disabled on touch and reduced motion (renders a plain wrapper then).
 *
 * Same hydration-mismatch class as TextReveal/ScrollReveal/Entrance/
 * AmbientDrift: `useReducedMotion()`/`isTouchDevice()` both read
 * matchMedia synchronously, so `disabled` could already be `true` on
 * this component's very first client render while the server (no
 * matchMedia) always assumes `false` — a plain `<div>` vs. a
 * `<motion.div>` is a real element-type mismatch. `mounted` starts
 * `false` unconditionally, so `disabled` is always `false` on the
 * first paint everywhere (matching the server); only after mount does
 * a genuinely disabled client swap to the plain wrapper, as a normal
 * post-hydration update.
 *
 * Spring stiffness/damping/mass come from lib/motion/useMotionTokens
 * (--spring-* in styles/tokens.css) rather than hardcoded constants —
 * Grove's pull settles slower and softer with zero `if (world ===
 * ...)` here, the same token-not-branch pattern the duration/ease
 * values already use.
 */
export default function Magnetic({ children, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { spring } = useMotionTokens();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const disabled = mounted && (reducedMotion || isTouchDevice());

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, spring);
  const springY = useSpring(y, spring);

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
