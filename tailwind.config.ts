import type { Config } from 'tailwindcss';

/**
 * Every value here is a var(...) reference into styles/tokens.css.
 * No literal color, size, or duration is duplicated in this file —
 * change the token, not this config.
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: 'var(--void)',
        panel: 'var(--panel)',
        raised: 'var(--raised)',
        line: 'var(--line)',
        'line-hi': 'var(--line-hi)',
        'text-hi': 'var(--text-hi)',
        'text-mid': 'var(--text-mid)',
        'text-lo': 'var(--text-lo)',
        pass: 'var(--pass)',
        fail: 'var(--fail)',
        // Fixed energy colors, present in every theme, outside the
        // per-language accent layer — DESIGN.md v2 §3.
        gold: 'var(--gold)',
        cyan: 'var(--cyan)',
        accent: 'var(--accent)',
        'accent-dim': 'var(--accent-dim)',
        'accent-text': 'var(--accent-text)',
      },
      boxShadow: {
        'glow-accent': 'var(--glow-accent)',
        'glow-gold': 'var(--glow-gold)',
        'glow-cyan': 'var(--glow-cyan)',
      },
      backgroundImage: {
        chrome: 'var(--chrome-surface)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        ui: ['var(--font-ui)'],
        code: ['var(--font-code)'],
        hud: ['var(--font-hud)'],
      },
      // Font size roles from DESIGN.md §4 — [size, { lineHeight, letterSpacing, fontWeight }]
      fontSize: {
        boss: [
          'var(--text-boss-size)',
          {
            lineHeight: 'var(--text-boss-leading)',
            letterSpacing: 'var(--text-boss-tracking)',
            fontWeight: 'var(--text-boss-weight)',
          },
        ],
        'zone-title': [
          'var(--text-zone-title-size)',
          {
            lineHeight: 'var(--text-zone-title-leading)',
            letterSpacing: 'var(--text-zone-title-tracking)',
            fontWeight: 'var(--text-zone-title-weight)',
          },
        ],
        stat: [
          'var(--text-stat-size)',
          {
            lineHeight: 'var(--text-stat-leading)',
            letterSpacing: 'var(--text-stat-tracking)',
            fontWeight: 'var(--text-stat-weight)',
          },
        ],
        label: [
          'var(--text-label-size)',
          {
            lineHeight: 'var(--text-label-leading)',
            letterSpacing: 'var(--text-label-tracking)',
            fontWeight: 'var(--text-label-weight)',
          },
        ],
        body: [
          'var(--text-body-size)',
          {
            lineHeight: 'var(--text-body-leading)',
            letterSpacing: 'var(--text-body-tracking)',
            fontWeight: 'var(--text-body-weight)',
          },
        ],
        button: [
          'var(--text-button-size)',
          {
            lineHeight: 'var(--text-button-leading)',
            letterSpacing: 'var(--text-button-tracking)',
            fontWeight: 'var(--text-button-weight)',
          },
        ],
        telemetry: [
          'var(--text-telemetry-size)',
          {
            lineHeight: 'var(--text-telemetry-leading)',
            letterSpacing: 'var(--text-telemetry-tracking)',
            fontWeight: 'var(--text-telemetry-weight)',
          },
        ],
        editor: [
          'var(--text-editor-size)',
          {
            lineHeight: 'var(--text-editor-leading)',
            letterSpacing: 'var(--text-editor-tracking)',
            fontWeight: 'var(--text-editor-weight)',
          },
        ],
      },
      // Spacing scale (4/8/12/16/24/32/48/64) is already Tailwind's
      // default 4px-based numeric scale — p-1..p-16 — so it is not
      // re-declared here. See the comment in styles/tokens.css.
      transitionDuration: {
        instant: 'var(--dur-instant)',
        fast: 'var(--dur-fast)',
        base: 'var(--dur-base)',
        slow: 'var(--dur-slow)',
        scene: 'var(--dur-scene)',
        ghost: 'var(--dur-ghost)', // HP bar ghost segment trailing behind the drain
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
        snap: 'var(--ease-snap)',
        scene: 'var(--ease-scene)',
      },
      borderColor: {
        DEFAULT: 'var(--line)',
      },
    },
  },
  plugins: [],
};

export default config;
