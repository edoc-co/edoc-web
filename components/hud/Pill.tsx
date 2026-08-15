import { ButtonHTMLAttributes } from 'react';

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

/**
 * Small clipped tab/toggle pill — e.g. the header mode switcher.
 * Never filled. Inactive: 1px --line outline, --text-lo text.
 * Active: 1px --accent outline, --accent text, 2px accent underline.
 */
export default function Pill({ active = false, className = '', children, ...rest }: PillProps) {
  return (
    <button
      className={`clip-btn relative inline-flex h-7 items-center justify-center border px-3 font-hud text-telemetry uppercase transition-colors duration-fast ease-out outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-void ${
        active ? 'border-accent text-accent' : 'border-line text-text-lo'
      } ${className}`}
      {...rest}
    >
      {children}
      {active && <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-accent" />}
    </button>
  );
}
