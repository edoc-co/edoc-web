'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HudFrame, Telemetry } from '@/components/hud';
import { LenisScroll } from '@/components/motion';
import { runAccentFlood } from '@/lib/motion/accentFlood';
import { LANGUAGES, TRACKS, type CoasterLanguage, type Track } from '@/lib/coaster/languages';
import CoasterCard from '@/components/coaster/CoasterCard';

/**
 * Zone A — DESIGN.md v2 §9: "the most kinetic surface in the product."
 * CSS 3D transforms + perspective only, no Three.js (deferred until
 * proven insufficient). Native scroll-snap gives the inertia/friction/
 * snap-to-nearest for free; Lenis (landing + coaster only) layers a
 * smoother wheel/trackpad feel on top. Monochrome until a card is
 * actually selected, at which point the accent flood (§3, GSAP) fires
 * before navigating into the fight.
 */
export default function CoasterPage() {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const [goalTrack, setGoalTrack] = useState<Track | null>(null);
  const [scrollTick, setScrollTick] = useState(0);
  const [selecting, setSelecting] = useState(false);

  const handleScroll = useCallback(() => {
    setScrollTick((t) => t + 1);
  }, []);

  const handleSelect = useCallback(
    (lang: CoasterLanguage, cardEl: HTMLDivElement) => {
      if (selecting) return;
      setSelecting(true);
      runAccentFlood(cardEl, () => {
        router.push(`/fight/${lang.firstEncounterId}`);
      });
    },
    [selecting, router],
  );

  return (
    <div className="min-h-screen bg-void">
      <LenisScroll />
      <HudFrame
        brand={
          <span className="font-display text-lg font-extrabold uppercase tracking-tight text-text-hi">edoc</span>
        }
        rail={<Telemetry>Zone A — language coaster</Telemetry>}
      >
        <main className="flex flex-col gap-8 px-8 py-10">
          <div className="flex flex-col gap-3">
            <h1 className="text-zone-title text-text-hi">Pick your language</h1>
            <p className="max-w-xl text-body text-text-mid">
              Set a track goal and the languages that matter for it pull forward — everything else recedes, but
              stays one scroll away.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Telemetry className="mr-2">Track goal</Telemetry>
            {TRACKS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setGoalTrack((g) => (g === t ? null : t))}
                className={`clip-btn border px-3 py-1 font-hud text-telemetry uppercase transition-colors duration-fast ease-out ${
                  goalTrack === t ? 'border-accent text-accent' : 'border-line text-text-lo hover:text-text-mid'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="flex snap-x snap-mandatory items-center gap-16 overflow-x-auto py-24"
            style={{ scrollbarWidth: 'thin' }}
          >
            <div aria-hidden className="w-[calc(50vw-88px)] shrink-0" />
            {LANGUAGES.map((lang) => (
              <CoasterCard
                key={lang.id}
                lang={lang}
                trackRef={trackRef}
                scrollTick={scrollTick}
                goalTrack={goalTrack}
                onSelect={handleSelect}
              />
            ))}
            <div aria-hidden className="w-[calc(50vw-88px)] shrink-0" />
          </div>
        </main>
      </HudFrame>
    </div>
  );
}
