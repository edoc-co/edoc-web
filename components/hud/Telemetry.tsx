import { HTMLAttributes } from 'react';

/**
 * The machine's voice — DESIGN.md §4: hud face, 11–12px, UPPER,
 * 0.08em, --text-lo. Fake-looking system readouts that must never
 * lie about state (`HP 340/500`, `SYS://PY_CORE/E04`).
 */
export default function Telemetry({
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`font-hud text-telemetry uppercase text-text-lo ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
