'use client';

import { useEffect, useState } from 'react';
import { Panel } from '@/components/hud';
import MonsterFrame from '@/components/fight/MonsterFrame';
import TestOutputPanel from '@/components/fight/TestOutputPanel';
import type { MonsterState } from '@/components/motion';
import type { Test, TestResult } from '@/lib/encounters/types';
import { prefersReducedMotion } from '@/lib/motion/reducedMotion';

const FAKE_TESTS: Test[] = [
  { id: 't1', label: 'sum_evens(10) is 30', hidden: false, damage: 30, conceptTags: [] },
  { id: 't2', label: 'Includes n when n is even', hidden: false, damage: 40, conceptTags: [] },
  { id: 't3', label: 'Returns 0 for n = 0', hidden: true, damage: 30, conceptTags: [] },
];
const SNIPPET = `def sum_evens(n):
    total = 0
    for i in range(1, n + 1):
        if i % 2 == 0:
            total += i
    return total`;

const STEP_MS = 700;
const HOLD_CLEARED_MS = 1800;
const HOLD_START_MS = 1000;

function sleep(ms: number, signal: { cancelled: boolean }) {
  return new Promise<void>((resolve) => {
    const t = setTimeout(resolve, ms);
    if (signal.cancelled) clearTimeout(t);
  });
}

/**
 * "The hero shows the actual fight interface running in a loop, not a
 * description of it" (DESIGN.md v2 §9 Landing). Not a screenshot or a
 * video — the real MonsterFrame/TestOutputPanel components, driven by
 * a local scripted loop instead of the real Zustand store, so it can
 * run standalone here without touching actual game state. Purely
 * decorative: pointer-events-none, aria-hidden.
 */
export default function HeroLoop() {
  const [hp, setHp] = useState(100);
  const [monsterState, setMonsterState] = useState<MonsterState>('idle');
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    const signal = { cancelled: false };
    const reduced = prefersReducedMotion();

    async function loop() {
      while (!signal.cancelled) {
        setHp(100);
        setResults(null);
        setMonsterState('idle');
        setRunKey((k) => k + 1);
        await sleep(HOLD_START_MS, signal);
        if (signal.cancelled) return;

        const passed: TestResult[] = [];
        for (const test of FAKE_TESTS) {
          await sleep(reduced ? 0 : STEP_MS, signal);
          if (signal.cancelled) return;
          passed.push({ testId: test.id, passed: true });
          setResults([...passed]);
          setHp((h) => Math.max(0, h - test.damage));
          setMonsterState('hit');
        }
        setMonsterState('defeated');
        await sleep(reduced ? HOLD_CLEARED_MS / 4 : HOLD_CLEARED_MS, signal);
      }
    }

    loop();
    return () => {
      signal.cancelled = true;
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none select-none">
      <MonsterFrame name="The Loop King" hp={hp} maxHp={100} state={monsterState} hitFlashKey={0} attackMessage={null} />
      <Panel padding="none" className="mt-4 h-40 overflow-hidden">
        <pre className="h-full overflow-hidden p-6 font-code text-editor text-text-hi">{SNIPPET}</pre>
      </Panel>
      <TestOutputPanel tests={FAKE_TESTS} results={results} revealKey={runKey} className="mt-4 h-32" />
    </div>
  );
}
