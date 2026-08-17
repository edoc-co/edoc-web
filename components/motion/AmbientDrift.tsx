'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface AmbientDriftProps {
  /** Number of drifting petals. Kept low — this is ambience, not a hero animation. */
  count?: number;
  /**
   * CSS selector for an element ambient motion must never overlap,
   * plus a margin (WORLDS.md §3: "never within 100px of the editor
   * pane... the workspace register holds in both worlds"). When
   * omitted, petals drift across the full container — the right call
   * on showcase surfaces (landing, coaster, profile) that have no
   * editor to avoid.
   */
  avoidSelector?: string;
  avoidMargin?: number;
  className?: string;
}

interface Petal {
  id: number;
  top: string;
  left: string;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
}

/**
 * Grove-only ambient layer — "drifting petals, slow light shifts"
 * (WORLDS.md §3). Purely decorative, `aria-hidden`, `pointer-events:
 * none`. This component doesn't check `data-world` itself: whether
 * ambient motion exists at all is a per-page *composition* choice
 * (mount it only where the fiction calls for it), not a per-component
 * branch — the same reasoning that lets <Monster> not know or care
 * which world it's in.
 *
 * The exclusion zone is computed once from `avoidSelector`'s
 * bounding rect (+ margin) and re-measured on resize, then applied as
 * a clip-path punch-out — petals are laid out freely and simply
 * never spawn inside that rect to begin with, so there's no risk of
 * one drifting into the excluded region mid-flight either.
 */
export default function AmbientDrift({
  count = 6,
  avoidSelector,
  avoidMargin = 100,
  className = '',
}: AmbientDriftProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [avoidRect, setAvoidRect] = useState<{ top: number; left: number; right: number; bottom: number } | null>(
    null
  );

  useEffect(() => {
    if (!avoidSelector) return;
    const measure = () => {
      const container = containerRef.current;
      const target = document.querySelector<HTMLElement>(avoidSelector);
      if (!container || !target) {
        setAvoidRect(null);
        return;
      }
      const c = container.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      setAvoidRect({
        top: t.top - c.top - avoidMargin,
        left: t.left - c.left - avoidMargin,
        right: t.right - c.left + avoidMargin,
        bottom: t.bottom - c.top + avoidMargin,
      });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [avoidSelector, avoidMargin]);

  // Deterministic-looking but varied placement without Math.random()
  // in render (keeps this stable across re-renders without extra
  // state) — a simple hash walk seeded by index.
  const petals: Petal[] = useMemo(() => {
    const container = containerRef.current;
    const width = container?.clientWidth ?? 1200;
    const height = container?.clientHeight ?? 600;
    const list: Petal[] = [];
    let placed = 0;
    let attempt = 0;
    while (placed < count && attempt < count * 8) {
      const seed = attempt * 0.6180339887;
      const x = ((seed * 97) % 1) * width;
      const y = (((seed + 0.31) * 131) % 1) * height;
      attempt += 1;
      if (avoidRect && x > avoidRect.left && x < avoidRect.right && y > avoidRect.top && y < avoidRect.bottom) {
        continue;
      }
      list.push({
        id: placed,
        top: `${(y / height) * 100}%`,
        left: `${(x / width) * 100}%`,
        size: 4 + ((attempt * 3) % 6),
        duration: 14 + ((attempt * 5) % 10),
        delay: (attempt % 5) * 0.8,
        driftX: ((attempt % 2 === 0 ? 1 : -1) * (20 + (attempt % 3) * 10)),
      });
      placed += 1;
    }
    return list;
    // avoidRect intentionally drives re-placement on measure/resize.
  }, [count, avoidRect]);

  if (reducedMotion) return null;

  return (
    <div ref={containerRef} aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {petals.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-accent-dim"
          style={{ top: p.top, left: p.left, width: p.size, height: p.size }}
          animate={{
            y: [0, -24, 0],
            x: [0, p.driftX, 0],
            opacity: [0.15, 0.4, 0.15],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* Slow light shift — a very low-amplitude glow sweep, not a hard cut. */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.03, 0.08, 0.03] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: 'radial-gradient(ellipse at 30% 20%, var(--accent), transparent 60%)' }}
      />
    </div>
  );
}
