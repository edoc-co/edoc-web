'use client';

import { Panel } from '@/components/hud';
import BossFlourish from './BossFlourish';
import HpBar from './HpBar';

interface MonsterFrameProps {
  name: string;
  hp: number;
  maxHp: number;
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
 * Compact by design: the sprite (~140px) is the dominant element, not
 * a small icon beside a huge name — name/HP sit beside it, not below,
 * so the whole frame stays short. This is a *showcase*-register
 * surface even though it lives on the fight screen (§2 boundary case).
 *
 * The flourishes/nameplate sit in an unclipped wrapper, not inside the
 * Panel itself — Panel's clip-path only paints the 0–100% polygon, so
 * anything positioned outside that box (these are, by design) would
 * otherwise be silently clipped away.
 */
export default function MonsterFrame({ name, hp, maxHp, hitFlashKey, attackMessage }: MonsterFrameProps) {
  const low = hp > 0 && hp / maxHp < 0.25;

  return (
    <div className="relative">
      <BossFlourish />
      {/* No clip-path — see the comment on .boss-nameplate in tokens.css. */}
      <span className="boss-nameplate px-2 py-0.5 font-hud text-telemetry uppercase">Boss</span>

      <Panel className="boss-frame relative flex items-center gap-4 overflow-hidden">
        {hitFlashKey > 0 && (
          <span key={hitFlashKey} aria-hidden className="monster-hit-flash pointer-events-none absolute inset-0" />
        )}

        <div
          className="monster-breathe clip-btn flex h-[140px] w-[140px] shrink-0 items-center justify-center border border-line bg-raised"
          aria-hidden
        >
          <span className="font-display text-5xl font-extrabold text-text-mid">{name.charAt(0)}</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h1 className="text-boss min-w-0 truncate text-text-hi">{name}</h1>
          <div className="flex items-center gap-4">
            <HpBar value={hp} max={maxHp} glowVar="--glow-accent" className="flex-1" />
            <span className={`text-stat shrink-0 ${low ? 'text-fail' : 'text-text-hi'}`}>
              {hp}/{maxHp}
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
  );
}
