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
} satisfies Record<string, Record<World, string>>;
