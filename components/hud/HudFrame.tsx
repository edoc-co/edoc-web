import { ReactNode } from 'react';
import ThemeSwitcher from './ThemeSwitcher';

interface HudFrameProps {
  children: ReactNode;
  /** Rendered in the top bar, left side — usually the wordmark. */
  brand?: ReactNode;
  /** Rendered in the top bar, right side — usually telemetry/nav. */
  rail?: ReactNode;
  /** Static grain overlay, max 3% opacity, never animated. Cut if it costs clarity. */
  grain?: boolean;
}

/**
 * The outer console shell: a slim top bar over a skewed hairline
 * divider, with the content slot below. This is the "loud chrome"
 * DESIGN.md §1 talks about — the frame carries energy so the
 * workspace inside it (editor, etc.) can stay still.
 *
 * The header bar is a two-stop chrome-surface gradient (flat fill in
 * light theme) — DESIGN.md v2's "gradients are allowed on chrome,
 * never the editor" rule, applied here.
 */
export default function HudFrame({ children, brand, rail, grain = false }: HudFrameProps) {
  return (
    <div className="relative flex min-h-full flex-col bg-void">
      <header className="chrome-surface flex h-12 items-center justify-between px-6">
        <div>{brand}</div>
        <div className="flex items-center gap-4">
          {rail}
          <ThemeSwitcher />
        </div>
      </header>
      <div aria-hidden className="h-px w-full bg-line" />
      <div className="relative flex-1">
        {grain && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: 'var(--grain-opacity)',
              backgroundImage:
                'repeating-linear-gradient(0deg, var(--text-hi) 0px, transparent 1px, transparent 2px)',
            }}
          />
        )}
        {children}
      </div>
    </div>
  );
}
