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

/**
 * Grove's kill ceremony (WORLDS.md §4/§8, Part 6: "Grove blooms and
 * warms"). Same trigger, same call shape as runKillCeremony, but a
 * genuinely different choreography — this is a scripted GSAP timeline
 * (§13), not a token-driven component, so WORLDS.md's "don't branch
 * on world" guidance doesn't apply here the way it does to a Panel or
 * a Button: the fork lives at the *call site* (FightScreen picks
 * which function to call), not inside either function.
 *
 * No shatter, no shake — small warm motes bloom outward and drift up
 * (petals catching light, not debris), and a soft gold wash breathes
 * over the frame rather than a desaturate/brighten punch.
 */
export async function runBloomCeremony(frameEl: HTMLElement, onComplete?: () => void): Promise<void> {
  if (prefersReducedMotion()) {
    frameEl.classList.add('kill-flash-static');
    onComplete?.();
    return;
  }

  const { gsap } = await import('gsap');
  const rect = frameEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const moteCount = 14;
  const motes: HTMLElement[] = [];
  for (let i = 0; i < moteCount; i++) {
    const mote = document.createElement('div');
    mote.setAttribute('aria-hidden', 'true');
    mote.style.position = 'fixed';
    mote.style.left = `${cx}px`;
    mote.style.top = `${cy}px`;
    mote.style.width = '10px';
    mote.style.height = '10px';
    mote.style.borderRadius = '50%';
    mote.style.background = 'var(--gold)';
    mote.style.boxShadow = 'var(--glow-gold)';
    mote.style.zIndex = '9999';
    mote.style.pointerEvents = 'none';
    mote.style.opacity = '0';
    document.body.appendChild(mote);
    motes.push(mote);
  }

  const warmWash = document.createElement('div');
  warmWash.setAttribute('aria-hidden', 'true');
  warmWash.style.position = 'fixed';
  warmWash.style.inset = '0';
  warmWash.style.zIndex = '9998';
  warmWash.style.pointerEvents = 'none';
  warmWash.style.background = 'radial-gradient(ellipse at center, var(--gold), transparent 65%)';
  warmWash.style.opacity = '0';
  document.body.appendChild(warmWash);

  const tl = gsap.timeline({
    onComplete: () => {
      motes.forEach((m) => m.remove());
      warmWash.remove();
      onComplete?.();
    },
  });

  // A gentle swell and warmth — the held beat, without the
  // desaturate/brighten punch Forge's dilation uses.
  tl.to(frameEl, { scale: 1.03, filter: 'saturate(1.15) brightness(1.1)', duration: 0.7, ease: 'sine.inOut' });
  tl.to(warmWash, { opacity: 0.22, duration: 0.6, ease: 'sine.inOut' }, '-=0.4');

  // Motes bloom outward and drift up, staggered — unlike Forge's
  // shards, the frame itself never fades or breaks.
  tl.set(motes, { opacity: 1 });
  tl.to(
    motes,
    {
      duration: 1.3,
      x: () => gsap.utils.random(-220, 220),
      y: () => gsap.utils.random(-260, -40),
      rotation: () => gsap.utils.random(-90, 90),
      opacity: 0,
      ease: 'sine.out',
      stagger: 0.03,
    },
    '<',
  );

  tl.to(warmWash, { opacity: 0, duration: 0.6, ease: 'sine.inOut' }, '-=0.5');
  tl.set(frameEl, { scale: 1, filter: 'none' });
}
