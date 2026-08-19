import type { Encounter, FailureRule } from '@/lib/encounters/types';

export interface FailureContext {
  failingTestId: string | null;
  stderr: string;
}

/**
 * SPEC-encounter.md §1: "Rules are evaluated in order; first match
 * wins. Every encounter needs a catch-all rule at the end." An empty
 * `match: {}` is the catch-all. `errorType`/`pattern` match against
 * stderr text since the runtime contract carries no separate
 * errorType field — SPEC's own examples ("IndexError", "SyntaxError")
 * are exception names that show up in stderr.
 */
export function matchFailureRule(encounter: Encounter, ctx: FailureContext): FailureRule {
  for (const rule of encounter.failureMap) {
    const { testId, errorType, pattern } = rule.match;

    if (testId !== undefined) {
      if (ctx.failingTestId === testId) return rule;
      continue;
    }
    if (errorType !== undefined) {
      if (ctx.stderr.includes(errorType)) return rule;
      continue;
    }
    if (pattern !== undefined) {
      try {
        if (new RegExp(pattern).test(ctx.stderr)) return rule;
      } catch {
        // Malformed pattern in content — validate:content should have
        // caught this; fall through rather than crash the fight screen.
      }
      continue;
    }

    return rule; // empty match — the catch-all
  }

  // Only reached if content skipped validate:content's catch-all check.
  return encounter.failureMap[encounter.failureMap.length - 1];
}
