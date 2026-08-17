'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { isWorld, WORLD_STORAGE_KEY, WORLD_PICKED_STORAGE_KEY, type World } from './constants';

export type { World } from './constants';
export { WORLDS } from './constants';

interface WorldContextValue {
  world: World;
  /** Whether the user has ever explicitly chosen a world (vs. just getting the default). */
  hasPickedWorld: boolean;
  /** WORLDS.md §7: mid-session switches animate as a 600ms crossfade, never a hard swap. */
  setWorld: (world: World) => void;
}

const WorldContext = createContext<WorldContextValue | null>(null);

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

/**
 * Sets data-world on <html>, persists the choice, defaults to 'forge'
 * (WORLDS.md §7). Same SSR-safe sync pattern as ModeProvider (see that
 * file for why state starts at the default and only syncs post-mount,
 * not read from the DOM directly during render).
 */
export default function WorldProvider({ children }: { children: ReactNode }) {
  const [world, setWorldState] = useState<World>('forge');
  const [hasPickedWorld, setHasPickedWorld] = useState(true); // matches SSR assumption; corrected post-mount
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-world');
    if (isWorld(current)) setWorldState(current);
    let picked = false;
    try {
      picked = localStorage.getItem(WORLD_PICKED_STORAGE_KEY) === '1';
    } catch {
      // Storage unavailable — treat as not-yet-picked for this session.
    }
    setHasPickedWorld(picked);
    setSynced(true);
  }, []);

  useEffect(() => {
    if (!synced) return;
    document.documentElement.setAttribute('data-world', world);
    try {
      localStorage.setItem(WORLD_STORAGE_KEY, world);
    } catch {
      // Storage can be unavailable (private mode, disabled) — world
      // still applies for this session via the attribute.
    }
  }, [world, synced]);

  // A 600ms crossfade, never a hard swap (WORLDS.md §7). The View
  // Transitions API is the correct primitive for exactly this: it
  // snapshots the old frame, applies the DOM change, then cross-fades
  // to the new frame — no manual screenshot/overlay plumbing needed.
  // styles/tokens.css's ::view-transition-old(root)/new(root) rules
  // carry the actual 600ms/ease-scene curve. Falls back to an instant
  // swap where unsupported (older Firefox/Safari) rather than failing.
  const setWorld = useCallback((next: World) => {
    setHasPickedWorld(true);
    try {
      localStorage.setItem(WORLD_PICKED_STORAGE_KEY, '1');
    } catch {
      // Non-fatal — hasPickedWorld still reflects the choice for this session.
    }

    const doc = document as DocumentWithViewTransition;
    if (typeof doc.startViewTransition === 'function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      doc.startViewTransition(() => setWorldState(next));
    } else {
      setWorldState(next);
    }
  }, []);

  return (
    <WorldContext.Provider value={{ world, hasPickedWorld, setWorld }}>{children}</WorldContext.Provider>
  );
}

export function useWorld(): WorldContextValue {
  const ctx = useContext(WorldContext);
  if (!ctx) throw new Error('useWorld must be used within a WorldProvider');
  return ctx;
}
