import { HTMLAttributes, ReactNode } from 'react';
import CornerBrackets from './CornerBrackets';

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Marks this as the active panel — accent corner brackets + a soft glow. */
  active?: boolean;
  /** Panel padding. Cards should use 16px, panels 24px (DESIGN.md §5).
   *  'none' is for content that manages its own inset (e.g. CodeMirror). */
  padding?: 'card' | 'panel' | 'none';
}

/**
 * The clipped chrome surface: top-left / bottom-right corners cut,
 * 1px hairline border, flat --panel fill. No rounded corners — see
 * DESIGN.md v2 §5. `active` adds a controlled outer glow (v2 allows
 * glow on active panels); it resolves to `none` in light theme and is
 * never used on the editor's own Panel (that one never passes `active`).
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
      style={active ? { boxShadow: 'var(--glow-accent)', ...style } : style}
      {...rest}
    >
      <CornerBrackets active={active} />
      {children}
    </div>
  );
}
