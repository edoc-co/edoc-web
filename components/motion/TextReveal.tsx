'use client';

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
 */
export default function TextReveal({ text, className = '', as = 'span' }: TextRevealProps) {
  const reducedMotion = useReducedMotion();
  const { dur, easeOut } = useMotionTokens();
  const Tag = as;

  if (reducedMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  const words = text.split(' ');

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-top">
          <motion.span
            className="inline-block"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{
              duration: dur.slow,
              delay: (i * TEXT_REVEAL_STAGGER_MS) / 1000,
              ease: easeOut,
            }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
