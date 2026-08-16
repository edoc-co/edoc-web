'use client';

import { Panel, Label } from '@/components/hud';
import HpBar from './HpBar';

interface PlayerHudProps {
  hp: number;
  maxHp: number;
}

/**
 * The player's own HP, kept visually distinct from the monster's:
 * neutral --text-hi fill rather than --accent, so the accent budget
 * (DESIGN.md §3) stays spent on the monster's bar, the one the whole
 * screen is meant to read first.
 */
export default function PlayerHud({ hp, maxHp }: PlayerHudProps) {
  const low = hp > 0 && hp / maxHp < 0.2;

  return (
    <Panel padding="card" className="flex flex-col gap-2">
      <Label>You</Label>
      <HpBar value={hp} max={maxHp} fillVar="--text-hi" />
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
