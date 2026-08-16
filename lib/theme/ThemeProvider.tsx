'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { isTheme, THEME_STORAGE_KEY, type Theme } from './constants';

export type { Theme } from './constants';
export { THEMES } from './constants';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Sets data-theme on <html>, persists the choice, defaults to
 * 'default'. The actual no-flash *visual* work happens in
 * app/layout.tsx's inline script (lib/theme/constants.ts's
 * noFlashThemeScript), which runs before paint and sets the real
 * attribute directly — this component's own state always starts at
 * 'default' (matching what the server rendered) and only syncs to the
 * real persisted value in an effect, *after* mount.
 *
 * This isn't just tidiness: initializing state from
 * document.documentElement here (reading whatever the inline script
 * set) would make the client's first render disagree with the
 * server's. React's hydration recovery for that kind of mismatch commits
 * the server's values and never revisits that DOM again on its own —
 * so anything reading `theme` (the ThemeSwitcher) would render "light"
 * internally forever while the DOM stayed stuck showing "default" as
 * active, with no further state change to ever trigger a real repaint.
 * Matching SSR exactly, then correcting via a genuine post-mount state
 * update, sidesteps that class of bug entirely.
 */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('default');
  const [synced, setSynced] = useState(false);

  // Pick up whatever the inline script actually set, once, after mount.
  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    if (isTheme(current)) setThemeState(current);
    setSynced(true);
  }, []);

  // Skipped until the sync above has run, so this never overwrites the
  // inline script's correct value with the initial 'default' placeholder.
  useEffect(() => {
    if (!synced) return;
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable (private mode, disabled) — theme
      // still applies for this session via the attribute.
    }
  }, [theme, synced]);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
