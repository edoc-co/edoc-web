'use client';

import { Button } from '@/components/hud';
import { useWorld, type World } from '@/lib/world/WorldProvider';

interface PreviewCopy {
  world: World;
  tagline: string;
}

const PREVIEWS: PreviewCopy[] = [
  { world: 'forge', tagline: 'Sharp geometry, decisive motion — every win feels earned.' },
  { world: 'grove', tagline: 'Rounded, warm, alive — the same fights, a gentler feel.' },
];

/**
 * Part 9 — "side-by-side world preview (first-run world picker) —
 * one of the strongest things about the product." Never buried in
 * settings (WORLDS.md §7): this is the very first thing a new visitor
 * sees on the landing page, full-takeover, not a modal over content.
 *
 * Each half sets its own `data-world` (and a fixed `data-mode='dark'`
 * — the signature look, shown identically to every new visitor
 * regardless of whatever mode ends up chosen later) on a *local*
 * wrapper, not `<html>`. tokens.css's `[data-world='...']` selectors
 * match any element with the attribute, not just the root, so this
 * renders a genuine live preview of both identities side by side
 * without touching global state until the visitor actually picks —
 * no simulated screenshots, no hardcoded duplicate styles.
 */
export default function WorldPicker() {
  const { setWorld } = useWorld();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-void px-6 py-12">
      <div className="flex w-full max-w-3xl flex-col gap-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="font-display text-lg font-extrabold uppercase tracking-tight text-text-hi">edoc</span>
          <h1 className="text-zone-title text-text-hi">Choose your world</h1>
          <p className="max-w-md text-body text-text-mid">
            Same fights, same code, same content — a different feel. Switch anytime later from the header.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {PREVIEWS.map(({ world, tagline }) => {
            // Not Tailwind's `capitalize` utility — Grove's own
            // --text-zone-title-case token is 'none', which wins the
            // text-transform tie against a same-specificity utility
            // class, so "Grove" would silently render "grove". Casing
            // the string itself sidesteps the conflict entirely.
            const label = world.charAt(0).toUpperCase() + world.slice(1);
            return (
              <div key={world} data-world={world} data-mode="dark" className="flex flex-col gap-4">
                <div
                  className="clip-panel flex flex-1 flex-col gap-4 border border-accent bg-panel p-6"
                  style={{ boxShadow: 'var(--glow-accent)' }}
                >
                  <div className="clip-btn flex h-16 w-16 items-center justify-center border border-accent bg-raised">
                    <span className="font-display text-2xl font-extrabold text-accent">{label.charAt(0)}</span>
                  </div>
                  <h2 className="text-zone-title text-text-hi">{label}</h2>
                  <p className="text-body text-text-mid">{tagline}</p>
                </div>
                <Button onClick={() => setWorld(world)} className="w-full">
                  Choose {label}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
