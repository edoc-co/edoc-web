/**
 * Four 14px L-shape corner brackets in --accent, 1px, inset 6px.
 * Marks the active panel — DESIGN.md §5. Only one panel should wear
 * these at a time; that's a layout decision made by the caller, not
 * enforced here.
 */
export default function CornerBrackets({ active = true }: { active?: boolean }) {
  if (!active) return null;

  return (
    <>
      <span aria-hidden className="corner-bracket corner-bracket--tl" />
      <span aria-hidden className="corner-bracket corner-bracket--tr" />
      <span aria-hidden className="corner-bracket corner-bracket--bl" />
      <span aria-hidden className="corner-bracket corner-bracket--br" />
    </>
  );
}
