/**
 * Proctored mode — Part 7. Client-side only; this file is the
 * contract a real backend integration would consume. No scoring is
 * computed anywhere in this module or its consumers: a `penalty`
 * is recorded as metadata on each violation (a fixed weight per
 * type, decided here since the client is the only thing that knows
 * *which* violation just happened) but nothing in the app sums it
 * into a running score or displays one — that's explicitly a
 * backend decision, per the Part 7 instruction "do not implement
 * scoring." The banner only ever shows a violation *count*.
 */

export type ViolationType = 'fullscreen-exit' | 'tab-hidden' | 'paste-blocked';

export interface ProctorViolation {
  type: ViolationType;
  /** epoch ms — Date.now() at the moment the violation was detected. */
  timestamp: number;
  /** Fixed weight for this violation type; not summed client-side. */
  penalty: number;
}

/**
 * One inter-keystroke interval, not the actual character — "log
 * keystroke timing for integrity replay" is about *rhythm* (a paste
 * lands as one zero-interval burst; a human typing has a natural,
 * irregular cadence), not content. Recording real keys would also
 * mean capturing everything the player types, including anything
 * outside the editor a paste-block false-positive might let through
 * — timing-only sidesteps that entirely.
 */
export interface KeystrokeInterval {
  /** epoch ms of this keystroke. */
  timestamp: number;
  /** ms since the previous keystroke; null for the first one. */
  intervalMs: number | null;
  /** Whether focus was inside the editor when this key landed. */
  inEditor: boolean;
}

export interface ProctorSessionSummary {
  startedAt: number;
  endedAt: number;
  violations: ProctorViolation[];
  keystrokeLog: KeystrokeInterval[];
}

/** Fixed per-type penalty weights — metadata only, see the file header. */
export const VIOLATION_PENALTY: Record<ViolationType, number> = {
  'fullscreen-exit': 10,
  'tab-hidden': 10,
  'paste-blocked': 5,
};

export const VIOLATION_MESSAGE: Record<ViolationType, string> = {
  'fullscreen-exit': 'Fullscreen was exited. Return to fullscreen to continue.',
  'tab-hidden': 'This tab lost focus. Switching away is logged during a proctored session.',
  'paste-blocked': 'Paste from outside the editor is blocked during a proctored session.',
};

/** Bound the in-memory keystroke log so a long session doesn't grow forever. */
export const KEYSTROKE_LOG_CAP = 2000;
