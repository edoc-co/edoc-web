'use client';

import { useEffect, useState } from 'react';

import type { World } from '@/lib/world/constants';

export type MonsterState = 'idle' | 'hit' | 'attack' | 'defeated';

interface MonsterProps {
  state: MonsterState;
  /** Fallback glyph — first letter of the monster's name — shown when no .riv asset exists. */
  spriteLabel: string;
  /**
   * Path to a .riv asset, when one exists. Omit to always use the
   * static fallback. Optionally a `{ forge, grove }` pair once
   * per-world art exists (WORLDS.md §8: assets are the long pole,
   * needing an artist) — a plain string still works today since no
   * `.riv` files exist yet in either world.
   */
  src?: string | { forge: string; grove: string };
  /**
   * WORLDS.md's own naming for this wrapper is "<Opponent>... state
   * prop + world" — accepted here so a future `{forge,grove}` src
   * pair or a per-world Rive state machine name can be selected, but
   * this is never used for *visual* branching (that's tokens/CSS, see
   * styles/tokens.css's `[data-world='grove'] [data-monster-state=
   * 'attack']` rule) — only for picking which asset file to load.
   */
  world?: World;
  className?: string;
}

/**
 * §13: "Monster state machine (idle, hit, attack, defeated) and
 * loot-box reveal" are Rive's job. No `.riv` file exists in this repo
 * yet — `.riv` files are authored in Rive's editor, an art-asset
 * dependency, not an engineering one — so this always takes the
 * static-fallback path today. That's the intended behavior: "falls
 * back to a static sprite when no .riv file is present, so the fight
 * screen works before art exists."
 *
 * `@rive-app/react-canvas` is dynamically imported inside an effect,
 * only when `src` is actually provided, so its runtime never ships to
 * a page that renders a Monster without art.
 */
export default function Monster({ state, spriteLabel, src, world, className = '' }: MonsterProps) {
  const [riveModule, setRiveModule] = useState<typeof import('@rive-app/react-canvas') | null>(null);
  const [riveFailed, setRiveFailed] = useState(false);
  const resolvedSrc = typeof src === 'string' ? src : world ? src?.[world] : undefined;

  useEffect(() => {
    if (!resolvedSrc) return;
    let cancelled = false;
    import('@rive-app/react-canvas')
      .then((mod) => {
        if (!cancelled) setRiveModule(mod);
      })
      .catch(() => setRiveFailed(true));
    return () => {
      cancelled = true;
    };
  }, [resolvedSrc]);

  if (resolvedSrc && riveModule && !riveFailed) {
    return <RiveStateMachine mod={riveModule} src={resolvedSrc} state={state} className={className} />;
  }

  return (
    <div
      className={`monster-breathe clip-btn flex items-center justify-center border border-line bg-raised ${className}`}
      data-monster-state={state}
      aria-hidden
    >
      <span className="font-display text-5xl font-extrabold text-text-mid">{spriteLabel}</span>
    </div>
  );
}

interface RiveStateMachineProps {
  mod: typeof import('@rive-app/react-canvas');
  src: string;
  state: MonsterState;
  className: string;
}

const STATE_INDEX: Record<MonsterState, number> = { idle: 0, hit: 1, attack: 2, defeated: 3 };

function RiveStateMachine({ mod, src, state, className }: RiveStateMachineProps) {
  const { useRive, useStateMachineInput } = mod;
  const { rive, RiveComponent } = useRive({
    src,
    stateMachines: 'Monster',
    autoplay: true,
  });
  const input = useStateMachineInput(rive, 'Monster', 'state');

  useEffect(() => {
    if (!input) return;
    input.value = STATE_INDEX[state];
  }, [input, state]);

  return <RiveComponent className={className} />;
}
