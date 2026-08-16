'use client';

import { Label } from '@/components/hud';
import { setMockRuntime, type ForcedOutcome } from '@/lib/runtime/runTests';

const OUTCOMES: ForcedOutcome[] = ['pass', 'fail', 'error', 'timeout'];

/**
 * Dev-only affordance for exercising lib/runtime/runTests.ts's
 * controllable mock while building/QAing this screen — "make the
 * outcome controllable so I can force pass, fail, error, and timeout
 * while testing the fight screen." Never rendered in production.
 */
export default function DevOutcomeControls() {
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border border-line p-2">
      <Label>Dev: force outcome</Label>
      {OUTCOMES.map((outcome) => (
        <button
          key={outcome}
          type="button"
          onClick={() => setMockRuntime({ outcome })}
          className="clip-btn border border-line px-2 py-1 font-hud text-telemetry uppercase text-text-lo transition-colors duration-fast ease-out hover:border-accent hover:text-accent"
        >
          {outcome}
        </button>
      ))}
    </div>
  );
}
