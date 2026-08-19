import type { ButtonHTMLAttributes } from 'react';
import { Pressable } from '@/components/motion';

// Framer Motion's motion.button redefines a few event handlers (drag,
// animation lifecycle) with its own signatures that conflict with
// React's native DOM event types — omit them here since Button never
// needs the native versions.
type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragStart' | 'onDragEnd'
>;

interface ButtonProps extends NativeButtonProps {
  variant?: 'primary' | 'ghost';
}

/**
 * Clipped chrome button — DESIGN.md §4, §5. UPPER case, 14px/500,
 * 0.06em tracking, cut top-left/bottom-right corners, 1px border.
 * Accent is spent on `primary` only — that's the accent budget at work.
 * Renders through <Pressable> (§8.9 press physics) instead of a plain
 * <button> — every button in the product gets the same 0.97 press
 * scale, not a one-off per component.
 */
export default function Button({
  variant = 'primary',
  className = '',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  // Disabled never carries accent, regardless of variant.
  const variantClass = disabled
    ? 'bg-raised text-text-lo border-line cursor-not-allowed'
    : variant === 'primary'
      ? 'bg-accent text-void border-accent'
      : 'bg-transparent text-text-hi border-line hover:border-accent hover:text-accent';

  return (
    <Pressable
      className={`clip-btn inline-flex items-center justify-center gap-2 border px-4 py-2 font-ui text-button uppercase transition-colors duration-fast ease-out outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-void ${variantClass} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
