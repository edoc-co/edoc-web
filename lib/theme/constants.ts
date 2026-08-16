// Deliberately NOT 'use client' — app/layout.tsx (a Server Component)
// calls noFlashThemeScript() directly at render time. Anything
// exported from a 'use client' file is treated as client-only by the
// RSC boundary, even a pure function, so this has to live separately
// from ThemeProvider.tsx.

export type Theme = 'default' | 'dark' | 'light';

export const THEMES: Theme[] = ['default', 'dark', 'light'];
export const THEME_STORAGE_KEY = 'edoc-theme';

export function isTheme(value: string | null): value is Theme {
  return value === 'default' || value === 'dark' || value === 'light';
}

/**
 * Inlined verbatim into app/layout.tsx's <head> as a blocking script —
 * reads the persisted choice and sets data-theme before first paint,
 * so there's no flash of the wrong theme.
 */
export function noFlashThemeScript(): string {
  return `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');document.documentElement.setAttribute('data-theme',(t==='dark'||t==='light'||t==='default')?t:'default');}catch(e){}})();`;
}
