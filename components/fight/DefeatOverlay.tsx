'use client';

import { Panel, Button, Label, Telemetry } from '@/components/hud';
import { useWorld } from '@/lib/world/WorldProvider';
import { FICTION } from '@/lib/world/fiction';
import type { HintCard } from '@/lib/encounters/types';

interface DefeatOverlayProps {
  monsterName: string;
  card: HintCard | null;
  rematchVariant?: string;
  onRematch: () => void;
}

/**
 * PROJECT.md's non-negotiable: "On defeat, the boss teaches. Show the
 * concept that killed you, then rematch with different parameters so
 * memorizing the answer doesn't work." `card` and `rematchVariant`
 * come from the failureMap rule matched at the moment of defeat.
 */
export default function DefeatOverlay({ monsterName, card, rematchVariant, onRematch }: DefeatOverlayProps) {
  const { world } = useWorld();
  return (
    <div className="overlay-scrim fixed inset-0 z-50 flex items-center justify-center px-6">
      <Panel active className="flex w-full max-w-md flex-col gap-4">
        <Label>
          {FICTION.defeatedLabel[world]} {monsterName}
        </Label>
        {card ? (
          <>
            <h2 className="text-zone-title text-text-hi">{card.title}</h2>
            <p className="text-body text-text-mid">{card.body}</p>
          </>
        ) : (
          <p className="text-body text-text-mid">No lesson card is wired up for this failure yet.</p>
        )}
        {rematchVariant && <Telemetry>Rematch: {rematchVariant}</Telemetry>}
        <Button onClick={onRematch} className="self-start">
          Rematch
        </Button>
      </Panel>
    </div>
  );
}
