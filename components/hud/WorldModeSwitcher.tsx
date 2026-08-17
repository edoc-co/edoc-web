'use client';

import { useMode, MODES } from '@/lib/mode/ModeProvider';
import { useWorld, WORLDS } from '@/lib/world/WorldProvider';
import { Pressable } from '@/components/motion';

const WORLD_LABELS: Record<string, string> = { forge: 'Forge', grove: 'Grove' };
const MODE_LABELS: Record<string, string> = { dark: 'Dark', light: 'Light' };

/**
 * Compact world × mode switcher — WORLDS.md §2 "Header gets a compact
 * world × mode switcher." Two independent radiogroups, not a single
 * 4-way picker: switching mode never implies switching world, and
 * vice versa. Lives in the HUD header and again on /styleguide.
 */
export default function WorldModeSwitcher() {
  const { world, setWorld } = useWorld();
  const { mode, setMode } = useMode();

  return (
    <div className="flex items-center gap-2">
      <div role="radiogroup" aria-label="World" className="flex items-center gap-1">
        {WORLDS.map((w) => {
          const active = world === w;
          return (
            <Pressable
              key={w}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setWorld(w)}
              className={`clip-btn border px-2 py-1 font-hud text-telemetry uppercase transition-colors duration-fast ease-out outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-void ${
                active ? 'border-accent text-accent' : 'border-line text-text-lo hover:border-line-hi hover:text-text-mid'
              }`}
            >
              {WORLD_LABELS[w]}
            </Pressable>
          );
        })}
      </div>
      <div aria-hidden className="h-4 w-px bg-line" />
      <div role="radiogroup" aria-label="Mode" className="flex items-center gap-1">
        {MODES.map((m) => {
          const active = mode === m;
          return (
            <Pressable
              key={m}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setMode(m)}
              className={`clip-btn border px-2 py-1 font-hud text-telemetry uppercase transition-colors duration-fast ease-out outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-void ${
                active ? 'border-accent text-accent' : 'border-line text-text-lo hover:border-line-hi hover:text-text-mid'
              }`}
            >
              {MODE_LABELS[m]}
            </Pressable>
          );
        })}
      </div>
    </div>
  );
}
