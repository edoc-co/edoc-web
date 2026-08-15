import { HTMLAttributes } from 'react';

/**
 * Section label — DESIGN.md §4: hud face, 12px, 500, UPPER, 0.12em.
 * Used for zone headers, HUD row headers, form labels — the
 * machine's captions, not body copy.
 */
export default function Label({
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`font-hud text-label uppercase text-text-mid ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
