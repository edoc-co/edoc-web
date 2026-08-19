'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { TEXT_REVEAL_STAGGER_MS } from '@/lib/motion/tokens';
import { useMotionTokens } from '@/lib/motion/useMotionTokens';

interface TextRevealProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'span' | 'p';
}

/**
 * §8.5 — display headings only, showcase register. Per-word mask
 * reveal, 30ms stagger, 400ms each. Never on body copy, never on
 * anything the user needs to read quickly, never in the fight screen.
 *
 * Same hydration-mismatch class Entrance.tsx and AmbientDrift.tsx both
 * hit: `useReducedMotion()` reads matchMedia synchronously, so it can
 * already read `true` on this component's very first CLIENT render —
 * before hydration compares anything against the server, which always
 * assumes `false`. Here it's worse than either of those: the two
 * branches used to render genuinely different DOM (a bare `<Tag>text
 * </Tag>` vs. a nested span-per-word structure), not just a different
 * attribute or a null-vs-content swap — so a server/client disagreement
 * on which branch to take was a *hard* "Hydration failed" React can't
 * patch up at all (confirmed via a fresh-tab console check: this was
 * firing on both /styleguide's demo and the real landing page's hero,
 * since both render a <TextReveal>).
 *
 * Fixed the same way: `mounted` starts `false` unconditionally, so the
 * word-span structure renders on *every* first paint regardless of
 * reducedMotion — with `initial={false}` while `!mounted`, so it shows
 * fully revealed (no visible animation, indistinguishable from plain
 * text) rather than mid-transition. Only after mount does a genuinely
 * reduced-motion client swap to the simpler plain-text markup, as a
 * normal post-hydration update — never something hydration itself has
 * to reconcile.
 */
export default function TextReveal({ text, className = '', as = 'span' }: TextRevealProps) {
  const reducedMotion = useReducedMotion();
  const { dur, easeOut } = useMotionTokens();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const Tag = as;

  if (mounted && reducedMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  const words = text.split(' ');

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-top">
          <motion.span
            className="inline-block"
            initial={mounted ? { y: '100%', opacity: 0 } : false}
            animate={{ y: '0%', opacity: 1 }}
            transition={{
              duration: dur.slow,
              delay: (i * TEXT_REVEAL_STAGGER_MS) / 1000,
              ease: easeOut,
            }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
