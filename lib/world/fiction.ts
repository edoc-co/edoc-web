import type { World } from './constants';

/**
 * WORLDS.md §4 "One engine, two fictions" — the single derived value
 * that inverts the opponent meter in Grove. This is the ONE permitted
 * fork on `world` outside a label lookup: everything about combat
 * state (the actual HP numbers, damage, order of events, which test
 * failed) stays identical in both worlds. Only what gets *displayed*
 * changes, and only here.
 *
 *   const displayValue = world === 'grove' ? maxHp - currentHp : currentHp;
 *
 * Forge: HP drains 100 -> 0. Grove: Bloom fills 0 -> 100. Same combat,
 * two readings.
 */
export function meterDisplayValue(world: World, current: number, max: number): number {
  return world === 'grove' ? max - current : current;
}

/**
 * WORLDS.md §4 label table. Every other "difference" in the fiction
 * layer is exactly this — a string swap, never a logic fork. Keeping
 * them in one lookup means no component re-invents the mapping.
 */
export const FICTION = {
  opponentMeterLabel: { forge: 'HP', grove: 'Bloom' } as const,
  playerMeterLabel: { forge: 'HP', grove: 'Spirit' } as const,
  defeatedLabel: { forge: 'Defeated by', grove: 'Wilted before' } as const,
  clearedLabel: { forge: 'defeated', grove: 'wilted' } as const,
  bossBadgeLabel: { forge: 'Boss', grove: 'Guardian' } as const,
  /**
   * Part 8 — the player card's one illustrative moment: "gets space,
   * flat surroundings — in Grove reads as companion/crest not
   * weapon." Same graphic, same layout, same clip-panel/glow treatment
   * (already token-driven from Part 2) — only the label changes.
   */
  masteredIllustrationLabel: { forge: 'Mastered weapon', grove: 'Companion' } as const,
  /**
   * Part 10 — "Forge reads as a track; Grove reads as a path through
   * a landscape — same mechanics, tokens carry the difference." The
   * mechanics (scroll-driven 3D tilt/blur/depth, relevance falloff,
   * accent-flood selection) are genuinely identical in both worlds
   * and stay that way; only this copy names the metaphor.
   */
  coasterTitle: { forge: 'Pick your language', grove: 'Choose your path' } as const,
  coasterSubtitle: {
    forge: 'Set a track goal and the languages that matter for it pull forward — everything else recedes, but stays one scroll away.',
    grove: 'Set a goal and the languages that matter for it step into the light — everything else drifts back, but stays one scroll away.',
  } as const,
  trackGoalLabel: { forge: 'Track goal', grove: 'Path goal' } as const,
} satisfies Record<string, Record<World, string>>;
