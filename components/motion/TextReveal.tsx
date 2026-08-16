'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { TEXT_REVEAL_STAGGER_MS, TEXT_REVEAL_DURATION_MS, EASE_OUT } from '@/lib/motion/tokens';

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
              duration: TEXT_REVEAL_DURATION_MS / 1000,
              delay: (i * TEXT_REVEAL_STAGGER_MS) / 1000,
              ease: EASE_OUT,
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
