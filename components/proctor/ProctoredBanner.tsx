'use client';

interface ProctoredBannerProps {
  elapsedMs: number;
  violationCount: number;
  latestWarning: string | null;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Part 7 — "persistent 'Proctored session' banner with elapsed time
 * and violation count." Lives above everything else on the screen but
 * doesn't gate or dim anything — it's a fact of the session's state,
 * not a modal. `--fail` only shows up when there's something to warn
 * about (a violation just happened); otherwise this reads as neutral
 * chrome, same telemetry role as everything else in the header.
 */
export default function ProctoredBanner({ elapsedMs, violationCount, latestWarning }: ProctoredBannerProps) {
  return (
    <div className="chrome-surface sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-line px-6 py-2">
      <div className="flex items-center gap-4">
        <span className="font-hud text-telemetry uppercase text-accent">Proctored session</span>
        <span className="font-hud text-telemetry uppercase text-text-lo">{formatElapsed(elapsedMs)}</span>
        <span className={`font-hud text-telemetry uppercase ${violationCount > 0 ? 'text-fail' : 'text-text-lo'}`}>
          {violationCount} violation{violationCount === 1 ? '' : 's'}
        </span>
      </div>
      {latestWarning && (
        <span role="status" className="truncate font-hud text-telemetry uppercase text-fail">
          {latestWarning}
        </span>
      )}
    </div>
  );
}
