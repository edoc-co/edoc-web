import { create } from 'zustand';
import type { Encounter } from '@/lib/encounters/types';

const PLAYER_MAX_HP = 100;

interface FightState {
  playerHp: number;
  playerMaxHp: number;
  monsterHp: number;
  monsterMaxHp: number;
  defeated: boolean;
  cleared: boolean;
  /** Set up HP for a freshly-loaded encounter. */
  start: (encounter: Encounter) => void;
  /** Apply this run's damage to both sides; returns the resulting HP. */
  applyDamage: (monsterDamage: number, playerDamage: number) => { nextMonsterHp: number; nextPlayerHp: number };
  /** Rematch: full HP reset, same encounter. */
  reset: (encounter: Encounter) => void;
}

/**
 * DESIGN.md's implementation notes: "Game state (HP, combo, shards) in
 * the store; text buffer local." This holds HP only — the editor's
 * text buffer stays in component state (lib/fight/engine.ts and the
 * FightScreen orchestrator own the rest of the per-run logic).
 */
export const useFightStore = create<FightState>((set, get) => ({
  playerHp: PLAYER_MAX_HP,
  playerMaxHp: PLAYER_MAX_HP,
  monsterHp: 0,
  monsterMaxHp: 0,
  defeated: false,
  cleared: false,

  start: (encounter) =>
    set({
      playerHp: PLAYER_MAX_HP,
      playerMaxHp: PLAYER_MAX_HP,
      monsterHp: encounter.monster.hp,
      monsterMaxHp: encounter.monster.hp,
      defeated: false,
      cleared: false,
    }),

  applyDamage: (monsterDamage, playerDamage) => {
    const { monsterHp, playerHp } = get();
    const nextMonsterHp = Math.max(0, monsterHp - monsterDamage);
    const nextPlayerHp = Math.max(0, playerHp - playerDamage);
    set({
      monsterHp: nextMonsterHp,
      playerHp: nextPlayerHp,
      defeated: nextPlayerHp <= 0,
      cleared: nextMonsterHp <= 0,
    });
    return { nextMonsterHp, nextPlayerHp };
  },

  reset: (encounter) =>
    set({
      playerHp: PLAYER_MAX_HP,
      monsterHp: encounter.monster.hp,
      defeated: false,
      cleared: false,
    }),
}));
