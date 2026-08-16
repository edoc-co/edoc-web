/**
 * Non-React helper for prefers-reduced-motion — for GSAP timelines and
 * other code that isn't a React component (and so can't use Framer
 * Motion's own `useReducedMotion` hook). Every primitive in
 * components/motion/ checks one of these two before animating.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** True on touch-primary devices — cursor/magnetic effects skip these. */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}
