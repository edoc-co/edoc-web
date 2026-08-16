'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { HudFrame, Button, Panel, Telemetry } from '@/components/hud';
import Editor, { type EditorHandle } from './Editor';
import MonsterFrame from './MonsterFrame';
import PlayerHud from './PlayerHud';
import TestOutputPanel from './TestOutputPanel';
import HintCardDeck from './HintCardDeck';
import DefeatOverlay from './DefeatOverlay';
import VictoryOverlay from './VictoryOverlay';
import DevOutcomeControls from './DevOutcomeControls';
import type { MonsterState } from '@/components/motion';
import { runKillCeremony } from '@/lib/motion/killCeremony';
import { runTests } from '@/lib/runtime/runTests';
import { computeOutcome } from '@/lib/fight/engine';
import { matchFailureRule } from '@/lib/fight/failureMap';
import { useFightStore } from '@/lib/store/fightStore';
import type { Encounter, RunResult, HintCard, FailureRule } from '@/lib/encounters/types';

// How long the Monster holds a reactive 'hit'/'attack' pose before
// settling back to 'idle' — a beat, not a lingering state.
const MONSTER_REACTION_MS = 500;

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
  const [monsterState, setMonsterState] = useState<MonsterState>('idle');
  // Gates the victory overlay until the kill ceremony (§3: time
  // dilation, frame shatter, screen shake, then the reveal) finishes —
  // the artifact reveal is the ceremony's last beat, not a replacement
  // for it.
  const [ceremonyDone, setCeremonyDone] = useState(false);
  const editorRef = useRef<EditorHandle>(null);
  // Saved hints ("backpack") — persists across encounters in this
  // session; the player card (Part 5) is the natural place this
  // eventually surfaces.
  const [backpack, setBackpack] = useState<HintCard[]>([]);
  void backpack;

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
    setMonsterState('idle');
    setCeremonyDone(false);
  }

  // On kill: §3's ceremony (time dilation, frame shatter, screen
  // shake — the one place it's allowed) runs once, then the artifact
  // reveal (VictoryOverlay) is gated open. Genuinely a side effect
  // (DOM query + an imperative GSAP timeline), so an effect reacting
  // to the store's `cleared` flag is the right tool here — this isn't
  // the "derive state from a prop" case the render-time reset above
  // is for.
  useEffect(() => {
    if (!cleared) {
      setCeremonyDone(false);
      setMonsterState((s) => (s === 'defeated' ? 'idle' : s));
      return;
    }
    setMonsterState('defeated');
    const frameEl = document.querySelector<HTMLElement>('[data-boss-frame]');
    if (!frameEl) {
      setCeremonyDone(true);
      return;
    }
    let cancelled = false;
    runKillCeremony(frameEl, () => {
      if (!cancelled) setCeremonyDone(true);
    });
    return () => {
      cancelled = true;
    };
  }, [cleared]);

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
          setMonsterState('hit');
          setTimeout(() => setMonsterState((s) => (s === 'hit' ? 'idle' : s)), MONSTER_REACTION_MS);
        } else if (!firstFailureHandled) {
          firstFailureHandled = true;
          const playerDamage = outcome.attack?.damage ?? 0;
          const { nextPlayerHp } = applyDamage(0, playerDamage);
          setVignetteKey((k) => k + 1);
          setAttackMessage(outcome.attack?.message ?? null);
          setMonsterState('attack');
          setTimeout(() => setMonsterState((s) => (s === 'attack' ? 'idle' : s)), MONSTER_REACTION_MS);

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

  // Zone C — left discards, right saves to the backpack, up inserts
  // the card's skeleton at the editor's cursor. Never a working
  // solution: skeletons are authored with blanks (validate:content
  // enforces this), so this only ever hands the player scaffolding.
  const handleDiscardHint = useCallback((_card: HintCard) => {
    // No further bookkeeping yet — a discarded hint just goes away.
  }, []);
  const handleSaveHint = useCallback((card: HintCard) => {
    setBackpack((prev) => [...prev, card]);
  }, []);
  const handleInsertHint = useCallback((card: HintCard) => {
    if (card.skeleton) editorRef.current?.insertAtCursor(card.skeleton);
  }, []);

  const handleRematch = useCallback(() => {
    resetFight(encounter);
    setLastResult(null);
    setFailingLine(null);
    setAttackMessage(null);
    setLesson(null);
    setCode(encounter.starterCode);
  }, [encounter, resetFight]);

  return (
    // md:h-screen + md:overflow-y-auto: fits exactly at the 1920x1080
    // target (no scrollbar appears, since content fits) but degrades
    // to a real scrollbar rather than silently clipping content on
    // shorter viewports where the editor's 420px floor plus the fixed
    // boss/test-output heights genuinely don't all fit.
    <div data-lang={encounter.language} className="flex flex-col bg-void md:h-screen md:overflow-y-auto">
      <HudFrame
        brand={
          <span className="font-display text-lg font-extrabold uppercase tracking-tight text-text-hi">edoc</span>
        }
        rail={
          // Hidden below sm — at 390px this plus the theme switcher
          // doesn't fit in one header row (found via an actual
          // scrollWidth check, not assumed); the switcher matters more
          // at that width, the encounter id doesn't.
          <Telemetry className="hidden sm:inline">
            SYS://{encounter.module.toUpperCase()}/{encounter.id}
          </Telemetry>
        }
      >
        {/*
          Layout target (DESIGN.md v2 §9, Part 1): max 1400px content,
          centred, 32px page padding. Boss frame full width (~180px).
          Below: editor ~72% / right rail ~28%, editor is the tallest
          element on screen and fills all remaining vertical space
          (min 420px). Test output is full width *below* that row,
          fixed ~180px with its own scroll — not squeezed into the rail.
          Fits one viewport at md+ with no page scroll; stacks and
          scrolls normally below md (390px still has to work).
        */}
        <main className="relative mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-8 py-4 md:h-full">
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
            state={monsterState}
            hitFlashKey={flashKey}
            attackMessage={attackMessage}
          />

          <div className="grid min-h-0 grid-cols-1 gap-4 md:flex-1 md:grid-cols-[72fr_28fr]">
            <Panel padding="none" className="min-h-[420px] md:h-full">
              <Editor ref={editorRef} value={code} onChange={setCode} damageLine={failingLine} />
            </Panel>
            <div className="flex min-h-0 flex-col gap-4">
              <PlayerHud hp={playerHp} maxHp={playerMaxHp} />
              {/* Run is always visible and enabled unless a run is in
                  flight (DESIGN.md v2 §9) — clearing or losing doesn't
                  lock it; the overlays are what gate progress, not this. */}
              <Button onClick={handleRun} disabled={running}>
                {running ? 'Running…' : 'Run code'}
              </Button>
              {/* Zone C — keyed on encounter.id: hint card ids repeat
                  across encounters (h1/h2), so without a key the deck's
                  internal "already swiped" state would wrongly carry
                  over to the next fight instead of resetting. */}
              <HintCardDeck
                key={encounter.id}
                cards={encounter.hintCards}
                onDiscard={handleDiscardHint}
                onSave={handleSaveHint}
                onInsert={handleInsertHint}
              />
            </div>
          </div>

          <TestOutputPanel
            tests={encounter.tests}
            results={lastResult?.results ?? null}
            revealKey={runKey}
            className="h-[180px] shrink-0"
          />
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

      {cleared && !defeated && ceremonyDone && (
        <VictoryOverlay monsterName={encounter.monster.name} encounterId={encounter.id} onRematch={handleRematch} />
      )}
    </div>
  );
}
