/**
 * JS-side motion tokens for the primitives in components/motion/ —
 * GSAP timelines and Framer Motion configs both want plain numbers/
 * cubic-bezier arrays, not CSS var() strings. These mirror
 * DESIGN.md v2 §7 exactly.
 *
 * styles/tokens.css's own duration and easing custom properties still
 * carry the v1 values until the Part 8 retrofit brings the whole
 * token file to v2 in one pass — these are additive (new JS-driven
 * motion), not a replacement for that CSS retrofit.
 */

export const DUR = {
  instant: 0.08, // seconds — GSAP/Framer both take seconds
  fast: 0.14,
  base: 0.22,
  slow: 0.36,
  scene: 0.6,
} as const;

export const DUR_MS = {
  instant: 80,
  fast: 140,
  base: 220,
  slow: 360,
  scene: 600,
} as const;

// cubic-bezier control points — usable as Framer Motion `ease` values
// (which want an exact 4-tuple, not a generic number[]) or GSAP
// `ease: "cubic-bezier(...)"` strings.
type CubicBezier = [number, number, number, number];
export const EASE_OUT: CubicBezier = [0.16, 1, 0.3, 1]; // default — decisive
export const EASE_SNAP: CubicBezier = [0.34, 1.3, 0.64, 1]; // card release, loot pop
export const EASE_SCENE: CubicBezier = [0.65, 0, 0.35, 1]; // route transitions

export const EASE_OUT_CSS = 'cubic-bezier(0.16, 1, 0.3, 1)';
export const EASE_SNAP_CSS = 'cubic-bezier(0.34, 1.3, 0.64, 1)';
export const EASE_SCENE_CSS = 'cubic-bezier(0.65, 0, 0.35, 1)';

/** Entrance choreography (§8.4): 40ms stagger, cap at 6 staggered items. */
export const ENTRANCE_STAGGER_MS = 40;
export const ENTRANCE_STAGGER_CAP = 6;

/** Text reveal (§8.5): 30ms per-word stagger, 400ms each. */
export const TEXT_REVEAL_STAGGER_MS = 30;
export const TEXT_REVEAL_DURATION_MS = 400;

/** Loading as experience (§8.8): under this, show nothing at all. */
export const LOADING_THRESHOLD_MS = 200;

/** Magnetic hover (§8.2). */
export const MAGNETIC_RADIUS_PX = 40;
export const MAGNETIC_MAX_TRANSLATE_PX = 6;

/** Custom cursor (§8.1). */
export const CURSOR_LERP = 0.12;
