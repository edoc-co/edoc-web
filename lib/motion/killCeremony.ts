import { prefersReducedMotion } from './reducedMotion';

/**
 * DESIGN.md v2 §3 "The kill" — earned, disproportionate to a passing
 * test: time dilates briefly, the frame shatters outward, screen
 * shake fires (the one place it's allowed anywhere in the product),
 * then the artifact reveal begins. Scripted GSAP timeline (§13 —
 * "boss kill" is explicitly GSAP's job, not component state), so this
 * is a plain async function a caller awaits before revealing the
 * victory/artifact UI, not a component.
 *
 * `frameEl` is the boss frame's DOM node (query it via
 * `[data-boss-frame]` rather than threading a ref through
 * MonsterFrame — this is a one-shot effect, not layout).
 */
export async function runKillCeremony(frameEl: HTMLElement, onComplete?: () => void): Promise<void> {
  if (prefersReducedMotion()) {
    // Reduced motion: skip straight to the reveal, no shake/shatter —
    // per §7 rule 4, "shake → border flash" is the mandated substitute.
    frameEl.classList.add('kill-flash-static');
    onComplete?.();
    return;
  }

  const { gsap } = await import('gsap');
  const rect = frameEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const shardCount = 12;
  const shards: HTMLElement[] = [];
  for (let i = 0; i < shardCount; i++) {
    const shard = document.createElement('div');
    shard.setAttribute('aria-hidden', 'true');
    shard.style.position = 'fixed';
    shard.style.left = `${cx}px`;
    shard.style.top = `${cy}px`;
    shard.style.width = '16px';
    shard.style.height = '16px';
    shard.style.background = 'var(--accent)';
    shard.style.clipPath = 'polygon(50% 0%, 100% 100%, 0% 100%)';
    shard.style.zIndex = '9999';
    shard.style.pointerEvents = 'none';
    shard.style.opacity = '0';
    document.body.appendChild(shard);
    shards.push(shard);
  }

  const tl = gsap.timeline({
    onComplete: () => {
      shards.forEach((s) => s.remove());
      onComplete?.();
    },
  });

  // Time dilation: the frame swells and desaturates — a held beat
  // before the payoff, not the payoff itself.
  tl.to(frameEl, { scale: 1.05, filter: 'saturate(0.5) brightness(1.4)', duration: 0.5, ease: 'power2.out' });

  // Frame shatter: angular shards burst outward from centre as the
  // frame itself fades under them.
  tl.set(shards, { opacity: 1 });
  tl.to(
    frameEl,
    { opacity: 0, duration: 0.3, ease: 'power1.in' },
    '-=0.1',
  );
  tl.to(
    shards,
    {
      duration: 0.6,
      x: () => gsap.utils.random(-320, 320),
      y: () => gsap.utils.random(-320, 320),
      rotation: () => gsap.utils.random(-180, 180),
      opacity: 0,
      ease: 'power2.out',
    },
    '<',
  );

  // Screen shake — the one place DESIGN.md v2 allows it.
  tl.to('body', { x: -8, duration: 0.05, repeat: 7, yoyo: true, ease: 'none' }, '<+0.1');
  tl.set('body', { x: 0 });

  // Reset the frame so a rematch (Practice never truly "locks" — the
  // Run button stays enabled) doesn't start from an invisible husk.
  tl.set(frameEl, { opacity: 1, scale: 1, filter: 'none' });
}
