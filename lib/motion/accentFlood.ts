import { prefersReducedMotion } from './reducedMotion';

/**
 * §3 "Language commit" + §13 (GSAP scripted timeline, not component
 * state — this is a one-shot DOM effect, not something that fits
 * Framer Motion's declarative model well). Floods the interface with
 * the newly-selected language's accent, expanding outward from the
 * origin element (the clicked language card) over 600ms/--ease-scene.
 *
 * Callers set `data-lang` on the app root themselves (same as every
 * other screen) — this only owns the transitional visual, not the
 * actual theme-accent switch, which should happen in the same tick the
 * flood starts so the overlay is covering the moment the swap lands.
 *
 * GSAP is dynamically imported so it never ships to a page that never
 * triggers a language commit (i.e. the fight screen).
 */
export async function runAccentFlood(originEl: HTMLElement, onComplete?: () => void): Promise<void> {
  if (prefersReducedMotion()) {
    onComplete?.();
    return;
  }

  const { gsap } = await import('gsap');

  const rect = originEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const maxRadius = Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy));

  const overlay = document.createElement('div');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.zIndex = '9999';
  overlay.style.pointerEvents = 'none';
  overlay.style.background = 'var(--accent)';
  overlay.style.clipPath = `circle(0px at ${cx}px ${cy}px)`;
  document.body.appendChild(overlay);

  gsap.to(overlay, {
    duration: 0.6,
    ease: 'cubic-bezier(0.65, 0, 0.35, 1)',
    clipPath: `circle(${maxRadius}px at ${cx}px ${cy}px)`,
    onComplete: () => {
      overlay.remove();
      onComplete?.();
    },
  });
}
