'use client';

import { useEffect, useState } from 'react';

export type MonsterState = 'idle' | 'hit' | 'attack' | 'defeated';

interface MonsterProps {
  state: MonsterState;
  /** Fallback glyph — first letter of the monster's name — shown when no .riv asset exists. */
  spriteLabel: string;
  /** Path to a .riv asset, when one exists. Omit to always use the static fallback. */
  src?: string;
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
export default function Monster({ state, spriteLabel, src, className = '' }: MonsterProps) {
  const [riveModule, setRiveModule] = useState<typeof import('@rive-app/react-canvas') | null>(null);
  const [riveFailed, setRiveFailed] = useState(false);

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    import('@rive-app/react-canvas')
      .then((mod) => {
        if (!cancelled) setRiveModule(mod);
      })
      .catch(() => setRiveFailed(true));
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (src && riveModule && !riveFailed) {
    return <RiveStateMachine mod={riveModule} src={src} state={state} className={className} />;
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
