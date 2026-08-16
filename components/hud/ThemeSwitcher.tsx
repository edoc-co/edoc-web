'use client';

import { useTheme } from '@/lib/theme/ThemeProvider';
import { THEMES } from '@/lib/theme/constants';

const LABELS: Record<string, string> = {
  default: 'Default',
  dark: 'Dark',
  light: 'Light',
};

/**
 * Compact three-way theme switcher — DESIGN.md v2 §"Themes". Lives in
 * the HUD header (HudFrame) and again on /styleguide.
 */
export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div role="radiogroup" aria-label="Theme" className="flex items-center gap-1">
      {THEMES.map((t) => {
        const active = theme === t;
        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(t)}
            className={`clip-btn border px-2 py-1 font-hud text-telemetry uppercase transition-colors duration-fast ease-out outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-void ${
              active ? 'border-accent text-accent' : 'border-line text-text-lo hover:border-line-hi hover:text-text-mid'
            }`}
          >
            {LABELS[t]}
          </button>
        );
      })}
    </div>
  );
}
