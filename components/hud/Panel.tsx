import { HTMLAttributes, ReactNode } from 'react';
import CornerBrackets from './CornerBrackets';

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Marks this as the active panel — shows accent corner brackets. */
  active?: boolean;
  /** Panel padding. Cards should use 16px, panels 24px (DESIGN.md §5). */
  padding?: 'card' | 'panel';
}

/**
 * The clipped chrome surface: top-left / bottom-right corners cut,
 * 1px hairline border, flat --panel fill. No rounded corners, no
 * glow, no gradient — see DESIGN.md §5, §8.
 */
export default function Panel({
  children,
  active = false,
  padding = 'panel',
  className = '',
  ...rest
}: PanelProps) {
  return (
    <div
      className={`clip-panel relative border border-line bg-panel ${
        padding === 'card' ? 'p-4' : 'p-6'
      } ${className}`}
      {...rest}
    >
      <CornerBrackets active={active} />
      {children}
    </div>
  );
}
