'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KEYSTROKE_LOG_CAP,
  VIOLATION_MESSAGE,
  VIOLATION_PENALTY,
  type KeystrokeInterval,
  type ProctorSessionSummary,
  type ProctorViolation,
  type ViolationType,
} from './types';

interface UseProctoredSessionOptions {
  /** Only Proctored mode uses any of this — Practice/Ranked pass `false` and the hook is a total no-op. */
  enabled: boolean;
  /**
   * The clean interface a real backend integration hangs off of: every
   * violation, as it happens, in addition to the client-side log this
   * hook keeps for the banner. Never called with a running score —
   * see types.ts's file header on why this module doesn't compute one.
   */
  onViolation?: (violation: ProctorViolation) => void;
  /** CSS selector for "inside the editor" — paste is allowed here, blocked everywhere else. */
  editorSelector?: string;
}

interface UseProctoredSessionResult {
  /** True once fullscreen was granted and the session actually started. */
  active: boolean;
  /** True once the player has asked to start but fullscreen hasn't resolved yet. */
  requesting: boolean;
  elapsedMs: number;
  violations: ProctorViolation[];
  /** The most recent violation's message, for a toast-style banner line — clears after a few seconds. */
  latestWarning: string | null;
  /** Requests fullscreen; only flips `active` true if the browser actually grants it. Resolves whether it started. */
  requestStart: () => Promise<boolean>;
  /** Read-only snapshot for a backend hand-off — includes the full keystroke-timing log, not just violations. */
  getSummary: () => ProctorSessionSummary;
}

const WARNING_VISIBLE_MS = 4000;

/**
 * Part 7 — proctored mode's client-side engine. Session-scoped via
 * `enabled` (the caller decides per-fight, from a query param today —
 * see app/fight/[encounterId]/page.tsx — never a global setting):
 * when `enabled` is false every effect below no-ops and every listener
 * is skipped entirely, so Practice/Ranked genuinely never pay for or
 * notice this module's existence.
 *
 * Does NOT implement scoring — see types.ts. Does NOT block or end the
 * session on a violation; it only warns, logs, and counts, per the
 * Part 7 instruction ("show warning, log... apply point penalty" —
 * nothing about ending the attempt).
 */
export function useProctoredSession({
  enabled,
  onViolation,
  editorSelector = '.cm-editor',
}: UseProctoredSessionOptions): UseProctoredSessionResult {
  const [active, setActive] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [violations, setViolations] = useState<ProctorViolation[]>([]);
  const [latestWarning, setLatestWarning] = useState<string | null>(null);

  const startedAtRef = useRef<number | null>(null);
  const keystrokeLogRef = useRef<KeystrokeInterval[]>([]);
  const lastKeystrokeAtRef = useRef<number | null>(null);
  const violationsRef = useRef<ProctorViolation[]>([]);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recordViolation = useCallback(
    (type: ViolationType) => {
      const violation: ProctorViolation = {
        type,
        timestamp: Date.now(),
        penalty: VIOLATION_PENALTY[type],
      };
      violationsRef.current = [...violationsRef.current, violation];
      setViolations(violationsRef.current);
      setLatestWarning(VIOLATION_MESSAGE[type]);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = setTimeout(() => setLatestWarning(null), WARNING_VISIBLE_MS);
      onViolation?.(violation);
    },
    [onViolation],
  );

  const requestStart = useCallback(async (): Promise<boolean> => {
    if (!enabled || active) return active;
    setRequesting(true);
    try {
      // Fullscreen requires a user gesture — this must be called
      // directly from a click handler, never from an effect.
      await document.documentElement.requestFullscreen();
      startedAtRef.current = Date.now();
      setActive(true);
      return true;
    } catch {
      // Denied or unsupported — the caller's own UI stays on the
      // "start blocked" gate; nothing here forces a retry loop.
      return false;
    } finally {
      setRequesting(false);
    }
  }, [enabled, active]);

  // Elapsed-time tick for the banner, only while genuinely active.
  useEffect(() => {
    if (!enabled || !active) return;
    const id = setInterval(() => {
      if (startedAtRef.current != null) setElapsedMs(Date.now() - startedAtRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, [enabled, active]);

  // Fullscreen-exit detection.
  useEffect(() => {
    if (!enabled || !active) return;
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) recordViolation('fullscreen-exit');
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [enabled, active, recordViolation]);

  // Tab-switch / minimize detection via the Page Visibility API.
  useEffect(() => {
    if (!enabled || !active) return;
    const onVisibilityChange = () => {
      if (document.hidden) recordViolation('tab-hidden');
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [enabled, active, recordViolation]);

  // Paste blocking — allowed inside the editor, blocked everywhere else.
  useEffect(() => {
    if (!enabled || !active) return;
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inEditor = !!target?.closest(editorSelector);
      if (inEditor) return;
      e.preventDefault();
      recordViolation('paste-blocked');
    };
    document.addEventListener('paste', onPaste, true);
    return () => document.removeEventListener('paste', onPaste, true);
  }, [enabled, active, editorSelector, recordViolation]);

  // Keystroke-timing log — intervals only, never the actual key (see
  // types.ts's KeystrokeInterval doc for why).
  useEffect(() => {
    if (!enabled || !active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      const inEditor = !!(e.target as HTMLElement | null)?.closest(editorSelector);
      const intervalMs = lastKeystrokeAtRef.current == null ? null : now - lastKeystrokeAtRef.current;
      lastKeystrokeAtRef.current = now;
      const next = [...keystrokeLogRef.current, { timestamp: now, intervalMs, inEditor }];
      keystrokeLogRef.current = next.length > KEYSTROKE_LOG_CAP ? next.slice(next.length - KEYSTROKE_LOG_CAP) : next;
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, active, editorSelector]);

  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, []);

  const getSummary = useCallback((): ProctorSessionSummary => {
    return {
      startedAt: startedAtRef.current ?? Date.now(),
      endedAt: Date.now(),
      violations: violationsRef.current,
      keystrokeLog: keystrokeLogRef.current,
    };
  }, []);

  return { active, requesting, elapsedMs, violations, latestWarning, requestStart, getSummary };
}
