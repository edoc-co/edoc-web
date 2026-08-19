// Deliberately NOT 'use client' — see lib/mode/constants.ts for why.
//
// WORLDS.md §1: "World — the art direction... the user picks one and
// it changes how edoc *feels*." Independent of Mode (luminance).

export type World = 'forge' | 'grove';

export const WORLDS: World[] = ['forge', 'grove'];
export const WORLD_STORAGE_KEY = 'edoc-world';
/** WORLDS.md §7: "Ask the user to choose a world once, on first run." */
export const WORLD_PICKED_STORAGE_KEY = 'edoc-world-picked';

export function isWorld(value: string | null): value is World {
  return value === 'forge' || value === 'grove';
}

/**
 * Inlined verbatim into app/layout.tsx's <head> as a blocking script —
 * reads the persisted choice and sets data-world before first paint,
 * so there's no flash of the wrong world. WORLDS.md §7: "Default world
 * is Forge."
 */
export function noFlashWorldScript(): string {
  return `(function(){try{var w=localStorage.getItem('${WORLD_STORAGE_KEY}');document.documentElement.setAttribute('data-world',(w==='grove')?'grove':'forge');}catch(e){}})();`;
}
