'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { isMode, MODE_STORAGE_KEY, type Mode } from './constants';

export type { Mode } from './constants';
export { MODES } from './constants';

interface ModeContextValue {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const ModeContext = createContext<ModeContextValue | null>(null);

/**
 * Sets data-mode on <html>, persists the choice, defaults to 'dark'
 * (WORLDS.md §7). The actual no-flash *visual* work happens in
 * app/layout.tsx's inline script (lib/mode/constants.ts's
 * noFlashModeScript), which runs before paint — this component's own
 * state always starts at 'dark' (matching what the server rendered)
 * and only syncs to the real persisted value in an effect, *after*
 * mount.
 *
 * This isn't just tidiness: initializing state from
 * document.documentElement here would make the client's first render
 * disagree with the server's. React's hydration recovery for that kind
 * of mismatch commits the server's values and never revisits that DOM
 * again on its own — so anything reading `mode` (the switcher) would
 * render "light" internally forever while the DOM stayed stuck showing
 * "dark" as active, with no further state change to ever trigger a
 * real repaint. Matching SSR exactly, then correcting via a genuine
 * post-mount state update, sidesteps that class of bug entirely.
 */
export default function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>('dark');
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-mode');
    if (isMode(current)) setModeState(current);
    setSynced(true);
  }, []);

  useEffect(() => {
    if (!synced) return;
    document.documentElement.setAttribute('data-mode', mode);
    try {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch {
      // Storage can be unavailable (private mode, disabled) — mode
      // still applies for this session via the attribute.
    }
  }, [mode, synced]);

  const setMode = useCallback((next: Mode) => setModeState(next), []);

  return <ModeContext.Provider value={{ mode, setMode }}>{children}</ModeContext.Provider>;
}

export function useMode(): ModeContextValue {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used within a ModeProvider');
  return ctx;
}
