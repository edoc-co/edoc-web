'use client';

import { useCallback, useState } from 'react';
import { HudFrame, Button, Panel, Telemetry } from '@/components/hud';
import Editor from './Editor';
import MonsterFrame from './MonsterFrame';
import PlayerHud from './PlayerHud';
import TestOutputPanel from './TestOutputPanel';
import DefeatOverlay from './DefeatOverlay';
import VictoryOverlay from './VictoryOverlay';
import DevOutcomeControls from './DevOutcomeControls';
import { runTests } from '@/lib/runtime/runTests';
import { computeOutcome } from '@/lib/fight/engine';
import { matchFailureRule } from '@/lib/fight/failureMap';
import { useFightStore } from '@/lib/store/fightStore';
import type { Encounter, RunResult, HintCard, FailureRule } from '@/lib/encounters/types';

interface FightScreenProps {
  encounter: Encounter;
}

interface Lesson {
  rule: FailureRule;
  card: HintCard | null;
}

// How far apart each test's row-reveal / HP-consequence lands, in ms.
// Matches TestOutputPanel's own per-row `transitionDelay` so the bar
// visibly drains in step with each row resolving, not all at once.
const STEP_MS = 100;

export default function FightScreen({ encounter }: FightScreenProps) {
  // Zustand owns HP; everything else here is per-run UI state that
  // doesn't need to be global (DESIGN.md's "game state in the store,
  // text buffer local" split — this just extends that split to the
  // rest of the run-result plumbing too).
  const playerHp = useFightStore((s) => s.playerHp);
  const playerMaxHp = useFightStore((s) => s.playerMaxHp);
  const monsterHp = useFightStore((s) => s.monsterHp);
  const monsterMaxHp = useFightStore((s) => s.monsterMaxHp);
  const defeated = useFightStore((s) => s.defeated);
  const cleared = useFightStore((s) => s.cleared);
  const startFight = useFightStore((s) => s.start);
  const applyDamage = useFightStore((s) => s.applyDamage);
  const resetFight = useFightStore((s) => s.reset);

  const [code, setCode] = useState(encounter.starterCode);
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<RunResult | null>(null);
  const [runKey, setRunKey] = useState(0);
  const [flashKey, setFlashKey] = useState(0);
  const [vignetteKey, setVignetteKey] = useState(0);
  const [failingLine, setFailingLine] = useState<number | null>(null);
  const [attackMessage, setAttackMessage] = useState<string | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);

  // Resets all per-encounter state whenever the encounter identity
  // actually changes — React's own recommended pattern for "reset
  // state when a prop changes" (react.dev), done during render so
  // there's no stale-then-corrected flash. Seeded with `null` (never a
  // real id) so this also fires on the very first render, which is
  // what populates the store initially. The bug this replaces: a
  // one-shot `useRef` guard only ever initialized once per component
  // *instance*, so switching encounters without a full page reload
  // left the previous encounter's HP, results, and cleared/defeated
  // flags on screen — stale HP, tests reading "passed" for a fight
  // that never ran, a permanently disabled "Cleared" button.
  const [initializedFor, setInitializedFor] = useState<string | null>(null);
  if (initializedFor !== encounter.id) {
    setInitializedFor(encounter.id);
    startFight(encounter);
    setCode(encounter.starterCode);
    setLastResult(null);
    setRunKey(0);
    setFlashKey(0);
    setVignetteKey(0);
    setFailingLine(null);
    setAttackMessage(null);
    setLesson(null);
  }

  const handleRun = useCallback(async () => {
    setRunning(true);
    setAttackMessage(null);

    const result = await runTests({ encounterId: encounter.id, code, mode: 'practice' });
    const outcome = computeOutcome(encounter, result);

    setLastResult(result);
    setRunKey((k) => k + 1);
    setFailingLine(outcome.failingLine);

    // Progressive reveal: each test's HP consequence lands at the same
    // stagger TestOutputPanel uses to reveal its row, so the bar
    // visibly drains per passing test rather than jumping straight to
    // the run's total. Only the first failing test triggers the
    // monster's counter-attack (one hit per run, same as before).
    let firstFailureHandled = false;
    encounter.tests.forEach((test, i) => {
      const testResult = result.results.find((r) => r.testId === test.id);
      const passed = testResult?.passed ?? false;

      setTimeout(() => {
        if (passed) {
          applyDamage(test.damage, 0);
        } else if (!firstFailureHandled) {
          firstFailureHandled = true;
          const playerDamage = outcome.attack?.damage ?? 0;
          const { nextPlayerHp } = applyDamage(0, playerDamage);
          setVignetteKey((k) => k + 1);
          setAttackMessage(outcome.attack?.message ?? null);

          if (nextPlayerHp <= 0) {
            const rule = matchFailureRule(encounter, {
              failingTestId: outcome.failingTestId,
              stderr: result.stderr,
            });
            const card = encounter.hintCards.find((h) => h.id === rule.lessonCardId) ?? null;
            setLesson({ rule, card });
          }
        }
      }, i * STEP_MS);
    });

    const totalMs = encounter.tests.length * STEP_MS;
    if (outcome.monsterDamage > 0) {
      setTimeout(() => setFlashKey((k) => k + 1), totalMs);
    }
    setTimeout(() => setRunning(false), totalMs + 50);
  }, [encounter, code, applyDamage]);

  const handleRematch = useCallback(() => {
    resetFight(encounter);
    setLastResult(null);
    setFailingLine(null);
    setAttackMessage(null);
    setLesson(null);
    setCode(encounter.starterCode);
  }, [encounter, resetFight]);

  return (
    <div data-lang={encounter.language} className="min-h-screen bg-void">
      <HudFrame
        brand={
          <span className="font-display text-lg font-extrabold uppercase tracking-tight text-text-hi">edoc</span>
        }
        rail={
          <Telemetry>
            SYS://{encounter.module.toUpperCase()}/{encounter.id}
          </Telemetry>
        }
      >
        <main className="relative mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4">
          {vignetteKey > 0 && (
            <span
              key={vignetteKey}
              aria-hidden
              className="vignette-pulse pointer-events-none fixed inset-0 z-40"
            />
          )}

          <MonsterFrame
            name={encounter.monster.name}
            hp={monsterHp}
            maxHp={monsterMaxHp}
            hitFlashKey={flashKey}
            attackMessage={attackMessage}
          />

          <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-[1fr_320px]">
            <Panel padding="none" className="h-full">
              <Editor value={code} onChange={setCode} damageLine={failingLine} />
            </Panel>
            <div className="flex flex-col gap-4">
              <PlayerHud hp={playerHp} maxHp={playerMaxHp} />
              {/* Run is always visible and enabled unless a run is in
                  flight (DESIGN.md v2 §9) — clearing or losing doesn't
                  lock it; the overlays are what gate progress, not this. */}
              <Button onClick={handleRun} disabled={running}>
                {running ? 'Running…' : 'Run code'}
              </Button>
              <TestOutputPanel tests={encounter.tests} results={lastResult?.results ?? null} revealKey={runKey} />
            </div>
          </div>
        </main>
      </HudFrame>

      <div className="fixed bottom-4 left-4 z-30">
        <DevOutcomeControls />
      </div>

      {defeated && lesson && (
        <DefeatOverlay
          monsterName={encounter.monster.name}
          card={lesson.card}
          rematchVariant={lesson.rule.rematchVariant}
          onRematch={handleRematch}
        />
      )}

      {cleared && !defeated && (
        <VictoryOverlay monsterName={encounter.monster.name} encounterId={encounter.id} onRematch={handleRematch} />
      )}
    </div>
  );
}
