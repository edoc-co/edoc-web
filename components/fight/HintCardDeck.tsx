'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSprings, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Label, Telemetry } from '@/components/hud';
import { useMotionTokens } from '@/lib/motion/useMotionTokens';
import type { HintCard } from '@/lib/encounters/types';

interface HintCardDeckProps {
  cards: HintCard[];
  onSave: (card: HintCard) => void;
  onDiscard: (card: HintCard) => void;
  onInsert: (card: HintCard) => void;
}

type FlyDirection = 'left' | 'right' | 'up';

const VISIBLE = 3;
// ±2° rest rotation (DESIGN.md v2 §6/§9) — stable per stack position,
// not random per render, so the deck doesn't jitter on re-render.
const REST_ROTATION = [-2, 1.5, -1.8];
const FLY_DISTANCE = 1000;
const SWIPE_THRESHOLD_PX = 100;
const SWIPE_THRESHOLD_VELOCITY = 0.5;

/**
 * Zone C — physical objects, not UI. 6px radius (the one rounded
 * exception), --raised fill, real drag physics via @use-gesture/react
 * + @react-spring/web: flicking fast launches the card out of view,
 * releasing slowly springs it back. Left discards, right saves, up
 * inserts the skeleton at the editor cursor. All three are also bound
 * to arrow keys (guarded so they don't fight the editor's own arrow-key
 * navigation while it's focused). Virtualized to 3 rendered cards.
 */
export default function HintCardDeck({ cards, onSave, onDiscard, onInsert }: HintCardDeckProps) {
  const [goneIds, setGoneIds] = useState<Set<string>>(new Set());
  // react-spring's {tension, friction} isn't the same formula as
  // Framer's {stiffness, damping, mass}, but both describe the same
  // two knobs (how hard it pulls back, how much it resists) — reusing
  // --spring-stiffness/--spring-damping here is close enough to give
  // Grove's flick the same ~gentler character as everywhere else,
  // without inventing a second spring token vocabulary just for this
  // one component. Read once at mount (useSprings' initializer isn't
  // reactive to this value the way a CSS-var-backed style would be) —
  // correct for the world active when the fight screen loads; doesn't
  // hot-swap mid-session if the world changes while cards are already
  // out. Acceptable: nothing in WORLDS.md asks for physics to
  // retune mid-flight, only for it to be token-driven at all.
  const { spring } = useMotionTokens();

  const remaining = cards.filter((c) => !goneIds.has(c.id));
  const visible = remaining.slice(0, VISIBLE);

  const [springs, api] = useSprings(cards.length, (i) => ({
    x: 0,
    y: 0,
    rot: REST_ROTATION[i % REST_ROTATION.length],
    scale: 1,
    config: { tension: spring.stiffness, friction: spring.damping },
  }));

  const resolve = useCallback(
    (card: HintCard, dir: FlyDirection) => {
      setGoneIds((prev) => new Set(prev).add(card.id));
      if (dir === 'left') onDiscard(card);
      else if (dir === 'right') onSave(card);
      else onInsert(card);
    },
    [onDiscard, onSave, onInsert],
  );

  const flyOff = useCallback(
    (cardIndex: number, dir: FlyDirection) => {
      const card = cards[cardIndex];
      resolve(card, dir);
      api.start((i) => {
        if (i !== cardIndex) return {};
        const x = dir === 'left' ? -FLY_DISTANCE : dir === 'right' ? FLY_DISTANCE : 0;
        const y = dir === 'up' ? -FLY_DISTANCE : 0;
        const rot = dir === 'left' ? -20 : dir === 'right' ? 20 : 0;
        return { x, y, rot, scale: 1 };
      });
    },
    [api, cards, resolve],
  );

  const bind = useDrag(({ args: [cardIndex], down, movement: [mx, my], velocity: [vx, vy] }) => {
    const speed = Math.max(vx, vy);
    const triggered = !down && (Math.abs(mx) > SWIPE_THRESHOLD_PX || Math.abs(my) > SWIPE_THRESHOLD_PX || speed > SWIPE_THRESHOLD_VELOCITY);

    if (triggered) {
      const dir: FlyDirection = Math.abs(my) > Math.abs(mx) && my < 0 ? 'up' : mx < 0 ? 'left' : 'right';
      flyOff(cardIndex, dir);
      return;
    }

    api.start((i) => {
      if (i !== cardIndex) return {};
      return down
        ? { x: mx, y: my, rot: mx / 15, scale: 1.03, immediate: true }
        : { x: 0, y: 0, rot: REST_ROTATION[cardIndex % REST_ROTATION.length], scale: 1 };
    });
  });

  // Arrow keys act on the topmost card — "a product teaching
  // keyboard-driven work must not require a mouse" (PROJECT.md §10).
  // Skipped while the editor (or any text input) has focus, so this
  // never fights CodeMirror's own arrow-key cursor movement.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const active = document.activeElement;
      const typing = active?.closest('.cm-editor') || active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA';
      if (typing) return;

      const topCard = remaining[0];
      if (!topCard) return;
      const topIndex = cards.indexOf(topCard);

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        flyOff(topIndex, 'left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        flyOff(topIndex, 'right');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        flyOff(topIndex, 'up');
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [remaining, cards, flyOff]);

  if (visible.length === 0) {
    return (
      <div className="clip-panel flex flex-1 items-center justify-center border border-line bg-panel p-4">
        <Telemetry>No hints drawn yet</Telemetry>
      </div>
    );
  }

  return (
    <div className="relative flex-1">
      {visible.map((card, stackPos) => {
        const cardIndex = cards.indexOf(card);
        const style = springs[cardIndex];
        return (
          <animated.div
            {...bind(cardIndex)}
            key={card.id}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: VISIBLE - stackPos,
              x: style.x,
              y: style.y,
              rotate: style.rot,
              scale: style.scale,
              touchAction: 'none',
            }}
            className="clip-card flex cursor-grab flex-col gap-2 border border-line bg-raised p-4 active:cursor-grabbing"
          >
            <Label>{card.title}</Label>
            <p className="text-body text-text-mid">{card.body}</p>
            {card.cost > 0 && <Telemetry className="mt-auto">Cost: {card.cost} shards</Telemetry>}
          </animated.div>
        );
      })}
    </div>
  );
}
