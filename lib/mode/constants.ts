// Deliberately NOT 'use client' — app/layout.tsx (a Server Component)
// calls noFlashModeScript() directly at render time. Anything exported
// from a 'use client' file is treated as client-only by the RSC
// boundary, even a pure function, so this has to live separately from
// ModeProvider.tsx.
//
// WORLDS.md §1: "Mode — luminance only. Light or dark within the
// chosen world." Two values, not three — the old three-way
// default/dark/light theme system is retired; forge/dark now covers
// what "default" used to mean (see styles/tokens.css).

export type Mode = 'dark' | 'light';

export const MODES: Mode[] = ['dark', 'light'];
export const MODE_STORAGE_KEY = 'edoc-mode';

export function isMode(value: string | null): value is Mode {
  return value === 'dark' || value === 'light';
}

/**
 * Inlined verbatim into app/layout.tsx's <head> as a blocking script —
 * reads the persisted choice and sets data-mode before first paint, so
 * there's no flash of the wrong mode. WORLDS.md §7: "default mode is
 * dark."
 */
export function noFlashModeScript(): string {
  return `(function(){try{var m=localStorage.getItem('${MODE_STORAGE_KEY}');document.documentElement.setAttribute('data-mode',(m==='light')?'light':'dark');}catch(e){}})();`;
}
