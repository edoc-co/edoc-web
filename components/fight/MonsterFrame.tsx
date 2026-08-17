'use client';

import { Panel } from '@/components/hud';
import { Monster, type MonsterState } from '@/components/motion';
import { useWorld } from '@/lib/world/WorldProvider';
import { meterDisplayValue, FICTION } from '@/lib/world/fiction';
import BossFlourish from './BossFlourish';
import HpBar from './HpBar';

interface MonsterFrameProps {
  name: string;
  hp: number;
  maxHp: number;
  state: MonsterState;
  /** Bump to trigger a fresh single accent flash (e.g. Date.now() or a counter). */
  hitFlashKey: number;
  attackMessage: string | null;
}

/**
 * DESIGN.md v2 §6/§9: boss frames get ornamental treatment — a
 * heavier border (the `.boss-frame` class; the one exception to the
 * 1px hairline rule), corner flourishes, and a nameplate, always in
 * --accent (never gold — see tokens.css). The frame's glow is off in
 * light theme automatically (--glow-accent resolves to `none` there).
 *
 * ~180px tall total: the <Monster> sprite (~140px) is the dominant
 * element, name/HP sit beside it filling the remaining width, not
 * below it. This is a *showcase*-register surface even though it
 * lives on the fight screen (§2 boundary case) — it's allowed to be
 * ornamental and (in dark themes) glowing; the editor directly below
 * it must not be.
 *
 * `data-boss-frame` is a plain query hook for lib/motion/killCeremony
 * (Part 4) — no ref plumbing needed through this component.
 *
 * The "BOSS" badge gets its own row above the frame, in normal flow —
 * not absolutely positioned overlapping the border. The overlap
 * approach clipped the text at small sizes; plain padding doesn't.
 */
export default function MonsterFrame({ name, hp, maxHp, state, hitFlashKey, attackMessage }: MonsterFrameProps) {
  const { world } = useWorld();
  // "low" is about the *combat* state (nearly defeated), not the
  // display reading — stays computed from the raw HP in both worlds,
  // never from the meter's inverted display value.
  const low = hp > 0 && hp / maxHp < 0.25;
  const displayValue = meterDisplayValue(world, hp, maxHp);

  return (
    <div className="flex shrink-0 flex-col gap-2">
      <span className="inline-flex w-fit items-center bg-accent px-3 py-1 font-hud text-telemetry uppercase text-void">
        {FICTION.bossBadgeLabel[world]}
      </span>

      <div className="relative">
        <BossFlourish />
        <Panel data-boss-frame padding="card" className="boss-frame relative flex items-center gap-4 overflow-hidden">
          {hitFlashKey > 0 && (
            <span key={hitFlashKey} aria-hidden className="monster-hit-flash pointer-events-none absolute inset-0" />
          )}

          <Monster state={state} spriteLabel={name.charAt(0)} world={world} className="h-[140px] w-[140px] shrink-0" />

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h1 className="text-boss min-w-0 truncate text-text-hi">{name}</h1>
            <div className="flex items-center gap-4">
              <HpBar value={displayValue} max={maxHp} glowVar="--glow-accent" className="flex-1" />
              <span className={`shrink-0 font-hud text-telemetry uppercase ${low ? 'text-fail' : 'text-text-lo'}`}>
                {FICTION.opponentMeterLabel[world]}
              </span>
              <span className={`text-stat shrink-0 ${low ? 'text-fail' : 'text-text-hi'}`}>
                {displayValue}/{maxHp}
              </span>
            </div>
            {attackMessage && (
              <p className="text-body truncate text-fail" role="status">
                {attackMessage}
              </p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
