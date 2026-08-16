'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/hud';
import type { Test, TestResult } from '@/lib/encounters/types';

interface TestOutputPanelProps {
  tests: Test[];
  results: TestResult[] | null;
  /** Bump on every run so rows re-stagger their reveal. */
  revealKey: number;
  className?: string;
}

/**
 * DESIGN.md §7 Zone B: "Test output panel below the editor in
 * --font-hud. Pass rows get a --pass left tick; fail rows --fail" and
 * "test rows tick --pass in sequence" on a pass. Reveal is staggered
 * with a plain CSS transition-delay per row rather than a JS timer
 * loop — one repaint, and prefers-reduced-motion zeroes both the
 * duration and the delay globally (styles/tokens.css).
 */
export default function TestOutputPanel({ tests, results, revealKey, className = '' }: TestOutputPanelProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
    if (!results) return;
    // A macrotask gap (not rAF) so the pending state actually paints
    // before flipping to revealed — and, unlike rAF, this still fires
    // even if the tab isn't in the foreground compositing frames.
    const id = setTimeout(() => setRevealed(true), 16);
    return () => clearTimeout(id);
  }, [revealKey, results]);

  return (
    <div className={`flex min-h-0 flex-col gap-3 ${className}`}>
      <Label className="shrink-0">Test output</Label>
      <div className="clip-panel flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto border border-line bg-panel p-4">
        {tests.map((test, i) => {
          const result = results?.find((r) => r.testId === test.id);
          const settled = revealed && result !== undefined;
          const tone = !settled ? 'pending' : result?.passed ? 'pass' : 'fail';

          return (
            <div
              key={test.id}
              className={`flex flex-wrap items-baseline gap-x-2 border-l-2 pl-3 font-hud text-telemetry uppercase transition-colors duration-fast ease-out ${
                tone === 'pass' ? 'border-pass text-pass' : tone === 'fail' ? 'border-fail text-fail' : 'border-line text-text-lo'
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <span>{test.label}</span>
              {settled && tone === 'fail' && result?.message && (
                <span className="normal-case tracking-normal text-text-lo">— {result.message}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
