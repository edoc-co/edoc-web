'use client';

import { Panel, Button, Label } from '@/components/hud';
import { useWorld } from '@/lib/world/WorldProvider';
import { FICTION } from '@/lib/world/fiction';

interface VictoryOverlayProps {
  monsterName: string;
  encounterId: string;
  onRematch: () => void;
}

/**
 * The real victory state — previously the only feedback for clearing
 * an encounter was a disabled button reading "Cleared," with no
 * confirmation the fight actually ended. Gold, not accent: this is a
 * won moment (DESIGN.md v2 §4 role separation), the one place gold is
 * allowed inside the fight screen. The full kill ceremony (time
 * dilation, frame shatter, screen shake — DESIGN.md v2 §3) lands with
 * the motion stack; this is the functional version.
 */
export default function VictoryOverlay({ monsterName, encounterId, onRematch }: VictoryOverlayProps) {
  const { world } = useWorld();
  return (
    <div className="overlay-scrim fixed inset-0 z-50 flex items-center justify-center px-6">
      {/* Not `active` — Panel's active glow is --glow-accent via inline
          style, which would win over .loot-glow's --glow-gold at equal
          specificity. This is a won moment: gold only, no accent. */}
      <Panel className="loot-glow flex w-full max-w-md flex-col gap-4 border-gold">
        <Label>Encounter cleared</Label>
        <h2 className="text-zone-title text-gold">
          {monsterName} {FICTION.clearedLabel[world]}
        </h2>
        <p className="text-body text-text-mid">
          Every test passed. <span className="font-hud text-telemetry uppercase text-text-lo">{encounterId}</span>
        </p>
        <Button onClick={onRematch} className="self-start">
          Rematch
        </Button>
      </Panel>
    </div>
  );
}
