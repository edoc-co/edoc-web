'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import type { CoasterLanguage, Track } from '@/lib/coaster/languages';

interface CoasterCardProps {
  lang: CoasterLanguage;
  trackRef: RefObject<HTMLDivElement | null>;
  /** Bumped on every scroll/resize so cards recompute their offset. */
  scrollTick: number;
  goalTrack: Track | null;
  onSelect: (lang: CoasterLanguage, cardEl: HTMLDivElement) => void;
}

const CURVE_RANGE_PX = 420; // distance from centre at which tilt/blur/falloff maxes out
const MAX_ROTATE_DEG = 32;
const MAX_TRANSLATE_Z = -160;
const MAX_BLUR_PX = 5;

/**
 * DESIGN.md v2 §9 Zone A: cards tilt along a curve entering/exiting,
 * with depth blur and opacity falloff on distant items — computed
 * from this card's actual scroll-driven distance from the track's
 * centre, not from time. Monochrome; the language accent shows only
 * as a thin edge (never fills the card) until it's actually selected.
 *
 * Relevance depth: when a track goal is set, cards outside that track
 * recede (lower opacity/scale) but stay reachable — they're never
 * removed from the scroll order or made unclickable.
 */
export default function CoasterCard({ lang, trackRef, scrollTick, goalTrack, onSelect }: CoasterCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    const card = cardRef.current;
    if (!track || !card) return;
    const trackRect = track.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;
    const cardCenter = cardRect.left + cardRect.width / 2;
    setOffset(cardCenter - trackCenter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollTick]);

  const norm = Math.max(-1, Math.min(1, offset / CURVE_RANGE_PX));
  const rotateY = norm * MAX_ROTATE_DEG;
  const translateZ = Math.abs(norm) * MAX_TRANSLATE_Z;
  const curveOpacity = 1 - Math.abs(norm) * 0.65;
  const blur = Math.abs(norm) * MAX_BLUR_PX;

  const relevant = !goalTrack || lang.tracks.includes(goalTrack);
  const relevanceOpacity = relevant ? 1 : 0.3;
  const relevanceScale = relevant ? 1 : 0.88;

  return (
    <div
      ref={cardRef}
      data-lang={lang.id}
      role="button"
      tabIndex={0}
      aria-label={`Select ${lang.name}`}
      onClick={() => cardRef.current && onSelect(lang, cardRef.current)}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && cardRef.current) {
          e.preventDefault();
          onSelect(lang, cardRef.current);
        }
      }}
      className="clip-panel relative flex h-64 w-44 shrink-0 snap-center scroll-mx-8 flex-col items-center justify-center gap-2 border border-line bg-panel outline-none transition-[filter] duration-base ease-out focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-void"
      style={{
        transform: `perspective(1200px) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${relevanceScale})`,
        opacity: curveOpacity * relevanceOpacity,
        filter: `blur(${blur}px)`,
        borderRight: '3px solid var(--accent)',
        cursor: 'pointer',
      }}
    >
      <span className="font-display text-2xl font-extrabold text-text-hi">{lang.name}</span>
      <span className="font-hud text-[10px] uppercase tracking-widest text-text-lo">{lang.tracks.join(' / ')}</span>
    </div>
  );
}
