import { HTMLAttributes, ReactNode } from 'react';
import CornerBrackets from './CornerBrackets';

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Marks this as the active panel. */
  active?: boolean;
  /** Panel padding. Cards should use 16px, panels 24px (DESIGN.md §5).
   *  'none' is for content that manages its own inset (e.g. CodeMirror). */
  padding?: 'card' | 'panel' | 'none';
}

/**
 * The clipped-or-rounded chrome surface (world-token-driven — see
 * .clip-panel in styles/tokens.css) with a flat --panel fill and 1px
 * hairline border.
 *
 * `active` always renders BOTH of the two "this is the focused
 * surface" mechanisms — corner brackets and a soft accent ring/glow —
 * and lets tokens decide which one is visible: Forge's
 * --corner-bracket-opacity is 1 and --active-border-width is 0 (so you
 * see brackets, not a ring); Grove's are the reverse (WORLDS.md §3:
 * "no corner brackets — the active panel is marked by a soft accent
 * glow or a 2px accent border instead"). This is the one component
 * that would be tempted to branch on world and doesn't need to.
 *
 * Never used with `active` on the editor's own Panel — glow never
 * touches the editor in either world.
 */
export default function Panel({
  children,
  active = false,
  padding = 'panel',
  className = '',
  style,
  ...rest
}: PanelProps) {
  return (
    <div
      className={`clip-panel relative border border-line bg-panel ${
        padding === 'card' ? 'p-4' : padding === 'none' ? 'p-0' : 'p-6'
      } ${className}`}
      style={
        active
          ? { boxShadow: 'var(--glow-accent), inset 0 0 0 var(--active-border-width) var(--accent)', ...style }
          : style
      }
      {...rest}
    >
      <CornerBrackets active={active} />
      {children}
    </div>
  );
}
