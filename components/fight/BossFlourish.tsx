/**
 * Four gold corner flourishes for the boss frame — DESIGN.md v2 §5:
 * "decorative corner flourishes... fantasy, not military." Distinct
 * from components/hud/CornerBrackets (the plain "this panel is
 * active" L-shapes used everywhere else).
 */
export default function BossFlourish() {
  return (
    <>
      <span aria-hidden className="boss-flourish boss-flourish--tl" />
      <span aria-hidden className="boss-flourish boss-flourish--tr" />
      <span aria-hidden className="boss-flourish boss-flourish--bl" />
      <span aria-hidden className="boss-flourish boss-flourish--br" />
    </>
  );
}
