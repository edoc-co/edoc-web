/**
 * Encounter content model + runtime contract — SPEC-encounter.md §1–2.
 * This is the single source of truth every consumer (fight screen,
 * scoring, mastery heatmap, spaced repetition, Campus reporting) reads
 * from. Keep it in sync with the spec; don't let a consumer invent its
 * own shape.
 */

// ---------------------------------------------------------------------
// 1. Content model
// ---------------------------------------------------------------------

export type EncounterId = string; // "py.core.loops.04"
export type ConceptTag = string; // "for-loop", "range", "off-by-one"

export type Difficulty = 'intro' | 'standard' | 'hard' | 'boss';

export interface Encounter {
  id: EncounterId;
  language: string; // "python"
  module: string; // "py.core" | "py.web"
  difficulty: Difficulty;
  conceptTags: ConceptTag[]; // drives mastery + spaced repetition

  brief: string; // markdown, shown above the editor
  starterCode: string;
  solutionCode: string; // never sent to the client
  tests: Test[];
  hintCards: HintCard[];
  monster: Monster;
  failureMap: FailureRule[]; // makes "boss teaches you" possible

  artifact?: Artifact; // boss encounters only
  estimatedMinutes: number;
}

export interface Test {
  id: string;
  label: string; // "Handles an empty list" — shown to the user
  hidden: boolean; // hidden tests only reveal pass/fail, not input
  damage: number; // HP removed from the monster when this passes
  conceptTags: ConceptTag[]; // which concept this test actually probes
}

export interface HintCard {
  id: string;
  title: string;
  body: string; // markdown, max ~240 chars — it's a card, not a page
  skeleton?: string; // inserted on swipe-up. MUST contain blanks.
  conceptTags: ConceptTag[];
  cost: number; // shard cost in Ranked; 0 in Practice
}

export interface Monster {
  id: string;
  name: string; // "The Loop King"
  hp: number;
  sprite: string;
  attacks: Attack[];
}

export interface Attack {
  id: string;
  damage: number; // HP removed from the player
  message: string; // in-character, but must name the real problem
  trigger: 'test-fail' | 'timeout' | 'runtime-error';
}

export interface FailureRule {
  match: {
    testId?: string;
    errorType?: string; // "IndexError", "SyntaxError"
    pattern?: string; // regex against stderr
  };
  concept: ConceptTag;
  lessonCardId: string; // HintCard surfaced on defeat
  rematchVariant?: string; // alternate params so memorizing fails
}

export interface Artifact {
  name: string; // "wordfreq CLI"
  description: string;
  files: { path: string; content: string }[];
  repoTemplate?: string;
}

// ---------------------------------------------------------------------
// 2. Runtime contract
// ---------------------------------------------------------------------

export interface RunRequest {
  encounterId: EncounterId;
  code: string;
  mode: 'practice' | 'ranked' | 'proctored';
}

export interface RunResult {
  status: 'pass' | 'fail' | 'error' | 'timeout';
  results: TestResult[];
  stdout: string;
  stderr: string;
  durationMs: number;
}

export interface TestResult {
  testId: string;
  passed: boolean;
  errorLine?: number; // drives the in-editor damage highlight
  message?: string;
}

export declare function runTests(req: RunRequest): Promise<RunResult>;
