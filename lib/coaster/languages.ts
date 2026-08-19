/**
 * Static language catalog for the coaster. PROJECT.md's build order is
 * "one language deep — Python" first, so Python is the only one with
 * real content; every other card is fully interactive (accent flood,
 * relevance depth, selection) but currently routes to the same three
 * Python encounters we have, since there's nothing else to send it to
 * yet. Swap `firstEncounterId` per language once that content exists.
 */
export interface CoasterLanguage {
  /** data-lang value — must match a themed accent block in styles/tokens.css. */
  id: string;
  name: string;
  tracks: ('frontend' | 'backend' | 'data' | 'mobile')[];
  firstEncounterId: string;
}

const PLACEHOLDER_ENCOUNTER = 'py.core.loops.04';

export const LANGUAGES: CoasterLanguage[] = [
  { id: 'python', name: 'Python', tracks: ['backend', 'data'], firstEncounterId: PLACEHOLDER_ENCOUNTER },
  { id: 'javascript', name: 'JavaScript', tracks: ['frontend', 'backend'], firstEncounterId: PLACEHOLDER_ENCOUNTER },
  { id: 'typescript', name: 'TypeScript', tracks: ['frontend', 'backend'], firstEncounterId: PLACEHOLDER_ENCOUNTER },
  { id: 'go', name: 'Go', tracks: ['backend'], firstEncounterId: PLACEHOLDER_ENCOUNTER },
  { id: 'rust', name: 'Rust', tracks: ['backend'], firstEncounterId: PLACEHOLDER_ENCOUNTER },
  { id: 'java', name: 'Java', tracks: ['backend', 'mobile'], firstEncounterId: PLACEHOLDER_ENCOUNTER },
  { id: 'cpp', name: 'C++', tracks: ['backend', 'mobile'], firstEncounterId: PLACEHOLDER_ENCOUNTER },
  { id: 'sql', name: 'SQL', tracks: ['data'], firstEncounterId: PLACEHOLDER_ENCOUNTER },
];

export const TRACKS = ['frontend', 'backend', 'data', 'mobile'] as const;
export type Track = (typeof TRACKS)[number];
