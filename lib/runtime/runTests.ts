import { getEncounterById } from '@/lib/encounters/content';
import type { RunRequest, RunResult, TestResult } from '@/lib/encounters/types';

/**
 * Mock execution backend — SPEC-encounter.md §2. Build the entire
 * fight screen against this; the real hosted-execution API can land
 * later without the frontend changing at all.
 *
 * `runTests` itself keeps the exact signature the spec declares
 * (`(req: RunRequest) => Promise<RunResult>`). Everything below is
 * test-only control surface for forcing outcomes while building the
 * fight screen — none of it is part of the real runtime contract.
 */

export type ForcedOutcome = 'pass' | 'fail' | 'error' | 'timeout';

export interface MockRuntimeConfig {
  /** Outcome every call resolves with until changed. Default: 'pass'. */
  outcome: ForcedOutcome;
  /** ~300ms per spec; override to speed up/slow down tests. */
  delayMs: number;
  /**
   * For 'fail': which test ids fail. Defaults to every test id when
   * unset, so "fail" reads as "nothing passed yet" out of the box.
   */
  failingTestIds?: string[];
  /** Editor line to flash for the first failing/erroring test. */
  errorLine?: number;
  /** stderr text for 'error' and 'fail' outcomes. */
  errorMessage: string;
  /** stderr text for 'timeout'. */
  timeoutMessage: string;
}

const DEFAULT_CONFIG: MockRuntimeConfig = {
  outcome: 'pass',
  delayMs: 300,
  errorMessage: "NameError: name 'total' is not defined",
  timeoutMessage: 'Execution exceeded the time limit.',
};

let config: MockRuntimeConfig = { ...DEFAULT_CONFIG };

/** Merge overrides into the mock's config — e.g. setMockRuntime({ outcome: 'timeout' }). */
export function setMockRuntime(overrides: Partial<MockRuntimeConfig>): void {
  config = { ...config, ...overrides };
}

/** Back to the default (outcome: 'pass', ~300ms, no forced failures). */
export function resetMockRuntime(): void {
  config = { ...DEFAULT_CONFIG };
}

export function getMockRuntimeConfig(): MockRuntimeConfig {
  return config;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runTests(req: RunRequest): Promise<RunResult> {
  const { outcome, delayMs, failingTestIds, errorLine, errorMessage, timeoutMessage } = config;
  const encounter = getEncounterById(req.encounterId);
  const tests = encounter?.tests ?? [];

  await delay(delayMs);

  if (outcome === 'timeout') {
    const results: TestResult[] = tests.map((t) => ({ testId: t.id, passed: false }));
    return {
      status: 'timeout',
      results,
      stdout: '',
      stderr: timeoutMessage,
      durationMs: delayMs,
    };
  }

  if (outcome === 'error') {
    const results: TestResult[] = tests.map((t, i) => ({
      testId: t.id,
      passed: false,
      errorLine: i === 0 ? errorLine : undefined,
      message: i === 0 ? errorMessage : undefined,
    }));
    return {
      status: 'error',
      results,
      stdout: '',
      stderr: errorMessage,
      durationMs: delayMs,
    };
  }

  if (outcome === 'fail') {
    const failing = new Set(failingTestIds ?? tests.map((t) => t.id));
    const results: TestResult[] = tests.map((t) => ({
      testId: t.id,
      passed: !failing.has(t.id),
      errorLine: failing.has(t.id) ? errorLine : undefined,
      message: failing.has(t.id) ? `Assertion failed: ${t.label}` : undefined,
    }));
    return {
      status: 'fail',
      results,
      stdout: '',
      stderr: '',
      durationMs: delayMs,
    };
  }

  // 'pass' — everything passes.
  const results: TestResult[] = tests.map((t) => ({ testId: t.id, passed: true }));
  return {
    status: 'pass',
    results,
    stdout: '',
    stderr: '',
    durationMs: delayMs,
  };
}
