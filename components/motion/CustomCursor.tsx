'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { isTouchDevice } from '@/lib/motion/reducedMotion';
import { CURSOR_LERP, DUR } from '@/lib/motion/tokens';

type CursorVariant = 'default' | 'interactive' | 'drag' | 'native';

const SIZE: Record<CursorVariant, number> = { default: 16, interactive: 48, drag: 64, native: 0 };

/**
 * §8.1 — showcase-register only, never mounted on the fight screen.
 * Small accent ring trailing the pointer (spring-smoothed, not a raw
 * 1:1 follow). Scales/fills over `[data-cursor-interactive]` or any
 * link/button, shows a text label over `[data-cursor-drag="label"]`,
 * and fully reverts to the native cursor over `.cm-editor` — checked
 * even though this primitive shouldn't be mounted on Zone B at all,
 * as a second line of defense against "never interfere with text
 * selection."
 */
export default function CustomCursor() {
  const reducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState<CursorVariant>('default');
  const [label, setLabel] = useState<string | null>(null);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // A spring approximates the "~0.12 lerp" trailing feel without a
  // hand-rolled rAF loop — same idea, Framer's own primitive for it.
  const springX = useSpring(x, { damping: 26, stiffness: 260, mass: 1 - CURSOR_LERP });
  const springY = useSpring(y, { damping: 26, stiffness: 260, mass: 1 - CURSOR_LERP });

  useEffect(() => {
    if (reducedMotion || isTouchDevice()) {
      setEnabled(false);
      return;
    }
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const dragTarget = el?.closest<HTMLElement>('[data-cursor-drag]');
      const interactiveTarget = el?.closest('[data-cursor-interactive], a, button');
      const nativeTarget = el?.closest('.cm-editor');

      if (nativeTarget) {
        setVariant('native');
        setLabel(null);
      } else if (dragTarget) {
        setVariant('drag');
        setLabel(dragTarget.getAttribute('data-cursor-drag') || 'swipe');
      } else if (interactiveTarget) {
        setVariant('interactive');
        setLabel(null);
      } else {
        setVariant('default');
        setLabel(null);
      }
    };

    window.addEventListener('mousemove', move);
    document.body.setAttribute('data-custom-cursor', '');
    return () => {
      window.removeEventListener('mousemove', move);
      document.body.removeAttribute('data-custom-cursor');
    };
  }, [reducedMotion, x, y]);

  if (!enabled) return null;

  const size = SIZE[variant];

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[999] flex items-center justify-center rounded-full border-2 border-accent"
      style={{
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
        width: size,
        height: size,
        backgroundColor: variant === 'interactive' ? 'var(--accent-dim)' : 'transparent',
        opacity: variant === 'native' ? 0 : 1,
      }}
      transition={{ duration: DUR.fast }}
    >
      {label && <span className="whitespace-nowrap font-hud text-[10px] uppercase text-accent">{label}</span>}
    </motion.div>
  );
}
