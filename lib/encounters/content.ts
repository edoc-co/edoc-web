import type { Encounter } from './types';

import loops04 from '@/content/py.core.loops.04.json';
import loops05 from '@/content/py.core.loops.05.json';
import loops06 from '@/content/py.core.loops.06.json';

/**
 * Every authored encounter, statically imported so this works
 * identically on server and client bundles (no fs access needed).
 * Add new content files here as they're authored.
 */
export const ENCOUNTERS: Encounter[] = [loops04, loops05, loops06] as Encounter[];

export function getEncounterById(id: string): Encounter | undefined {
  return ENCOUNTERS.find((e) => e.id === id);
}
