'use client';

import { Panel, Label } from '@/components/hud';
import HpBar from './HpBar';

interface PlayerHudProps {
  hp: number;
  maxHp: number;
}

/**
 * The player's own HP. Uses --accent with a glow, same as the boss's
 * bar — DESIGN.md v2 doesn't carve out a neutral treatment for this
 * one, and a plain --text-hi fill read as "white," which the v2 pass
 * flagged directly.
 */
export default function PlayerHud({ hp, maxHp }: PlayerHudProps) {
  const low = hp > 0 && hp / maxHp < 0.25;

  return (
    <Panel padding="card" className="flex flex-col gap-2">
      <Label>You</Label>
      <HpBar value={hp} max={maxHp} glowVar="--glow-accent" />
      {/* Not <Telemetry> here — it hardcodes text-text-lo, which would
          fight with the low-HP text-fail override at equal Tailwind
          utility specificity. Same visual role (font-hud, 12px, UPPER,
          0.08em), single conditional color instead. */}
      <span className={`font-hud text-telemetry uppercase ${low ? 'text-fail' : 'text-text-lo'}`}>
        {hp}/{maxHp} HP
      </span>
    </Panel>
  );
}
