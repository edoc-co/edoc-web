'use client';

import { useEffect, useRef, useState } from 'react';

interface HpBarProps {
  value: number;
  max: number;
  /** CSS variable name (with --) used for the fill color. Default: --accent. */
  fillVar?: string;
  /**
   * CSS variable name for a box-shadow glow token (e.g. '--glow-accent'),
   * shown only above 50% HP. Resolves to `none` in light theme
   * automatically, since the glow tokens themselves do — no per-theme
   * branching needed here. Omit for bars that should never glow.
   */
  glowVar?: string;
  className?: string;
}

/**
 * DESIGN.md v2 §9 Zone B: "ghost-trail drain, pulses at 1s with the
 * number in --fail below 25%." Both segments animate `transform:
 * scaleX()`, never `width`, per the transform/opacity-only motion
 * rule. A soft glow above 50% HP; below 25% the bar pulses instead of
 * changing color (no --warn).
 *
 * The ghost is self-contained here: when `value` drops, it snaps to
 * the old (higher) value instantly, then animates down to the new
 * value over --dur-ghost (500ms) — 200ms longer than the primary fill's
 * --dur-slow (300ms), which is what makes it visibly trail behind.
 */
export default function HpBar({ value, max, fillVar = '--accent', glowVar, className = '' }: HpBarProps) {
  const [ghost, setGhost] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value < prevValue.current) {
      setGhost(prevValue.current);
      // A macrotask gap, not rAF — rAF never fires while the tab isn't
      // actively compositing, which would leave the ghost stuck at the
      // old value indefinitely instead of just animating late.
      const id = setTimeout(() => setGhost(value), 16);
      prevValue.current = value;
      return () => clearTimeout(id);
    }
    prevValue.current = value;
    setGhost(value);
  }, [value]);

  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const ghostRatio = max > 0 ? Math.max(0, Math.min(1, ghost / max)) : 0;
  const low = ratio > 0 && ratio < 0.25;
  const glowing = glowVar && ratio > 0.5;

  return (
    <div className={`relative h-1.5 w-full overflow-hidden bg-raised ${className}`}>
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-full origin-left opacity-40 transition-transform duration-ghost ease-out"
        style={{ transform: `scaleX(${ghostRatio})`, backgroundColor: `var(${fillVar})` }}
      />
      <div
        className={`absolute inset-y-0 left-0 w-full origin-left transition-[transform,box-shadow] duration-slow ease-out ${low ? 'pulse' : ''}`}
        style={{
          transform: `scaleX(${ratio})`,
          backgroundColor: `var(${fillVar})`,
          boxShadow: glowing ? `var(${glowVar})` : 'none',
        }}
      />
    </div>
  );
}
