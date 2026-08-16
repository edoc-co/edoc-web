/**
 * Fixture data for /profile — there's no auth/backend yet, so this
 * stands in for a real player record. Shape mirrors what PROJECT.md
 * §4's certificate line ("Cleared 148 encounters · 96% first-attempt")
 * and §5 (project slot) actually need to render.
 */

export interface LanguageMastery {
  language: string;
  /** data-lang value — drives that row's own accent hue. */
  accentLang: string;
  percent: number;
}

export interface PlayerProfile {
  handle: string;
  /** data-lang for the page's overall accent — the language this player is most identified with. */
  primaryLanguage: string;
  winStreak: number;
  encountersCleared: number;
  firstAttemptRate: number;
  masteries: LanguageMastery[];
  hasProject: boolean;
}

export const PLAYER_PROFILE: PlayerProfile = {
  handle: 'edoc_dev',
  primaryLanguage: 'python',
  winStreak: 12,
  encountersCleared: 148,
  firstAttemptRate: 96,
  masteries: [
    { language: 'Python', accentLang: 'python', percent: 82 },
    { language: 'JavaScript', accentLang: 'javascript', percent: 34 },
    { language: 'TypeScript', accentLang: 'typescript', percent: 10 },
  ],
  hasProject: false,
};
