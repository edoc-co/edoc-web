import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
}

/**
 * Clipped chrome button — DESIGN.md §4, §5. UPPER case, 14px/500,
 * 0.06em tracking, cut top-left/bottom-right corners, 1px border.
 * Accent is spent on `primary` only — that's the accent budget at work.
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
    <button
      className={`clip-btn inline-flex items-center justify-center gap-2 border px-4 py-2 font-ui text-button uppercase transition-colors duration-fast ease-out outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-void ${variantClass} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
