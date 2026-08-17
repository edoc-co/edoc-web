'use client';

import { useState } from 'react';
import { Panel, Button, Label } from '@/components/hud';

interface ProctorGateProps {
  requesting: boolean;
  onStart: () => Promise<boolean>;
}

/**
 * Part 7 — "require fullscreen via the Fullscreen API before
 * starting; block start until granted." This overlay stands in for
 * the entire fight screen until that happens — nothing about the
 * encounter (editor, boss frame, tests) mounts underneath it, so
 * there's no "start early via a paste/inspector trick" gap to close.
 */
export default function ProctorGate({ requesting, onStart }: ProctorGateProps) {
  const [denied, setDenied] = useState(false);

  async function handleStart() {
    const started = await onStart();
    setDenied(!started);
  }

  return (
    <div className="overlay-scrim fixed inset-0 z-50 flex items-center justify-center px-6">
      <Panel active className="flex w-full max-w-md flex-col gap-4">
        <Label>Proctored session</Label>
        <h2 className="text-zone-title text-text-hi">Fullscreen required</h2>
        <p className="text-body text-text-mid">
          This encounter is running in Proctored mode. Fullscreen must be granted before the fight starts — exiting
          fullscreen, switching tabs, and pasting from outside the editor are all logged for the rest of the session.
        </p>
        {denied && (
          <p className="text-body text-fail" role="alert">
            Fullscreen wasn&rsquo;t granted. Try again — most browsers need a direct click to allow it.
          </p>
        )}
        <Button onClick={handleStart} disabled={requesting} className="self-start">
          {requesting ? 'Requesting…' : 'Enter fullscreen & start'}
        </Button>
      </Panel>
    </div>
  );
}
