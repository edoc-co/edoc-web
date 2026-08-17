'use client';

import { useMemo } from 'react';
import { useWorld } from '@/lib/world/WorldProvider';
import { useMode } from '@/lib/mode/ModeProvider';
import { DUR_MS as FORGE_DUR_MS_FALLBACK, EASE_OUT, EASE_SNAP, EASE_SCENE } from './tokens';

type CubicBezier = [number, number, number, number];

function readCssVar(name: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function parseMs(value: string, fallback: number): number {
  if (!value) return fallback;
  if (value.endsWith('ms')) return parseFloat(value) || fallback;
  if (value.endsWith('s')) return (parseFloat(value) || 0) * 1000 || fallback;
  return parseFloat(value) || fallback;
}

function parseCubicBezier(value: string, fallback: CubicBezier): CubicBezier {
  const match = value.match(/cubic-bezier\(([^)]+)\)/);
  if (!match) return fallback;
  const parts = match[1].split(',').map((n) => parseFloat(n.trim()));
  return parts.length === 4 ? (parts as CubicBezier) : fallback;
}

export interface MotionTokens {
  /** Milliseconds — for setTimeout, CSS-in-JS, etc. */
  durMs: { instant: number; fast: number; base: number; slow: number; scene: number; ghost: number; pulse: number };
  /** Seconds — for Framer Motion / GSAP `duration`. */
  dur: { instant: number; fast: number; base: number; slow: number; scene: number; ghost: number; pulse: number };
  easeOut: CubicBezier;
  easeSnap: CubicBezier;
  easeScene: CubicBezier;
}

/**
 * The world/mode-aware counterpart to lib/motion/tokens.ts's static
 * constants. Framer Motion and GSAP both want plain numbers, not
 * `var(--dur-slow)` strings, so this reads the *computed* CSS custom
 * properties directly off `document.documentElement` — the exact
 * values styles/tokens.css already sets per `[data-world]` — instead
 * of hardcoding Forge's numbers in JS a second time.
 *
 * Because it reads `useWorld()`/`useMode()` from context, any
 * component calling this hook automatically re-renders (and re-reads
 * fresh values) the moment the world switches — with zero `if (world
 * === 'grove')` in the calling component. This is the token-not-branch
 * pattern WORLDS.md §8 asks for, extended to the one place CSS custom
 * properties alone can't reach: JS animation configs.
 *
 * SSR/first-paint safe: `readCssVar` returns '' on the server and
 * before the no-flash script has run, so every value falls back to
 * Forge/dark's own literal constants (the correct default — matches
 * what the no-flash script assumes) until a real client read
 * succeeds.
 */
export function useMotionTokens(): MotionTokens {
  const { world } = useWorld();
  const { mode } = useMode();

  return useMemo(() => {
    const durMs = {
      instant: parseMs(readCssVar('--dur-instant'), FORGE_DUR_MS_FALLBACK.instant),
      fast: parseMs(readCssVar('--dur-fast'), FORGE_DUR_MS_FALLBACK.fast),
      base: parseMs(readCssVar('--dur-base'), FORGE_DUR_MS_FALLBACK.base),
      slow: parseMs(readCssVar('--dur-slow'), FORGE_DUR_MS_FALLBACK.slow),
      scene: parseMs(readCssVar('--dur-scene'), FORGE_DUR_MS_FALLBACK.scene),
      ghost: parseMs(readCssVar('--dur-ghost'), 500),
      pulse: parseMs(readCssVar('--dur-pulse'), 1000),
    };
    return {
      durMs,
      dur: {
        instant: durMs.instant / 1000,
        fast: durMs.fast / 1000,
        base: durMs.base / 1000,
        slow: durMs.slow / 1000,
        scene: durMs.scene / 1000,
        ghost: durMs.ghost / 1000,
        pulse: durMs.pulse / 1000,
      },
      easeOut: parseCubicBezier(readCssVar('--ease-out'), EASE_OUT),
      easeSnap: parseCubicBezier(readCssVar('--ease-snap'), EASE_SNAP),
      easeScene: parseCubicBezier(readCssVar('--ease-scene'), EASE_SCENE),
      // world/mode aren't read above, but including them in the deps
      // array is what makes this recompute on a switch — the values
      // themselves come from the DOM, not from these variables.
    };
  }, [world, mode]);
}
