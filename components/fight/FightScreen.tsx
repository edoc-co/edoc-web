'use client';

import { useCallback, useRef, useState } from 'react';
import { HudFrame, Button, Panel, Telemetry } from '@/components/hud';
import Editor from './Editor';
import MonsterFrame from './MonsterFrame';
import PlayerHud from './PlayerHud';
import TestOutputPanel from './TestOutputPanel';
import DefeatOverlay from './DefeatOverlay';
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

  const initialized = useRef(false);
  if (!initialized.current) {
    startFight(encounter);
    initialized.current = true;
  }

  const [code, setCode] = useState(encounter.starterCode);
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<RunResult | null>(null);
  const [runKey, setRunKey] = useState(0);
  const [flashKey, setFlashKey] = useState(0);
  const [vignetteKey, setVignetteKey] = useState(0);
  const [failingLine, setFailingLine] = useState<number | null>(null);
  const [attackMessage, setAttackMessage] = useState<string | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setAttackMessage(null);

    const result = await runTests({ encounterId: encounter.id, code, mode: 'practice' });
    const outcome = computeOutcome(encounter, result);

    setLastResult(result);
    setRunKey((k) => k + 1);
    setFailingLine(outcome.failingLine);

    const { nextPlayerHp } = applyDamage(outcome.monsterDamage, outcome.playerDamage);

    if (outcome.monsterDamage > 0) {
      setFlashKey((k) => k + 1);
    }

    if (outcome.playerDamage > 0) {
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

    setRunning(false);
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
        <main className="relative mx-auto flex max-w-4xl flex-col gap-6 px-6 py-8">
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
            <Panel padding="none">
              <Editor value={code} onChange={setCode} damageLine={failingLine} />
            </Panel>
            <div className="flex flex-col gap-4">
              <PlayerHud hp={playerHp} maxHp={playerMaxHp} />
              <Button onClick={handleRun} disabled={running || defeated || cleared}>
                {running ? 'Running…' : cleared ? 'Cleared' : 'Run code'}
              </Button>
            </div>
          </div>

          <TestOutputPanel tests={encounter.tests} results={lastResult?.results ?? null} revealKey={runKey} />

          <DevOutcomeControls />
        </main>
      </HudFrame>

      {defeated && lesson && (
        <DefeatOverlay
          monsterName={encounter.monster.name}
          card={lesson.card}
          rematchVariant={lesson.rule.rematchVariant}
          onRematch={handleRematch}
        />
      )}
    </div>
  );
}
