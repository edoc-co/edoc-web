import type { Attack, Encounter, RunResult } from '@/lib/encounters/types';

export interface FightOutcome {
  /** Total HP removed from the monster this run (sum of passing tests' damage). */
  monsterDamage: number;
  /** HP removed from the player this run, from whichever attack fired. */
  playerDamage: number;
  /** The attack that fired, if any — its `message` is what the monster "says". */
  attack: Attack | null;
  /** The first test (in encounter.tests order) that didn't pass, if any. */
  failingTestId: string | null;
  /** Editor line to flash, from that test's TestResult.errorLine. */
  failingLine: number | null;
}

function pickAttack(encounter: Encounter, trigger: Attack['trigger']): Attack | null {
  return encounter.monster.attacks.find((a) => a.trigger === trigger) ?? null;
}

/**
 * Turns a mocked RunResult into fight consequences. Partial credit is
 * the point: every passing test damages the monster regardless of
 * overall status, so the HP bar reflects genuine progress even on a
 * 'fail' result (SPEC-encounter.md §5) — the monster only counter-attacks
 * once per run, from whichever trigger the result actually produced.
 */
export function computeOutcome(encounter: Encounter, result: RunResult): FightOutcome {
  let monsterDamage = 0;
  let failingTestId: string | null = null;
  let failingLine: number | null = null;

  for (const test of encounter.tests) {
    const testResult = result.results.find((r) => r.testId === test.id);
    if (testResult?.passed) {
      monsterDamage += test.damage;
    } else if (failingTestId === null) {
      failingTestId = test.id;
      failingLine = testResult?.errorLine ?? null;
    }
  }

  let attack: Attack | null = null;
  if (result.status === 'timeout') {
    attack = pickAttack(encounter, 'timeout');
  } else if (result.status === 'error') {
    attack = pickAttack(encounter, 'runtime-error');
  } else if (failingTestId !== null) {
    attack = pickAttack(encounter, 'test-fail');
  }

  return {
    monsterDamage,
    playerDamage: attack?.damage ?? 0,
    attack,
    failingTestId,
    failingLine,
  };
}
