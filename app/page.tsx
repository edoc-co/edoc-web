'use client';

import Link from 'next/link';
import { HudFrame, Button, Telemetry } from '@/components/hud';
import { ScrollReveal, TextReveal, LenisScroll } from '@/components/motion';
import HeroLoop from '@/components/landing/HeroLoop';

const PILLARS = [
  {
    title: 'Multiplayer',
    body: 'Duels, clan raids on a shared multi-file repo, ghost replays. Every competitor out there is single-player. edoc isn’t.',
  },
  {
    title: 'Artifacts over badges',
    body: 'The certificate links to working code — a CLI, a parser, a small API you actually shipped, not a completion checkbox.',
  },
  {
    title: 'Failure is the content',
    body: 'Debugging is the combat system. Bugs are the lesson, not the punishment — reading a stack trace is the skill being taught.',
  },
];

/**
 * Showcase register, monochrome (DESIGN.md v2 §9 Landing): no
 * per-language accent exists until a language is actually chosen, so
 * this page never sets data-lang. Lenis mounts here (and on the
 * coaster, nowhere else). One CTA, no feature-card grid, no gradient
 * hero, no testimonials.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-void">
      <LenisScroll />
      <HudFrame
        brand={
          <span className="font-display text-lg font-extrabold uppercase tracking-tight text-text-hi">edoc</span>
        }
        rail={<Telemetry className="hidden sm:inline">Guided learning · arcade combat</Telemetry>}
      >
        <main className="mx-auto flex max-w-5xl flex-col gap-32 px-8 py-20">
          <section className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <TextReveal as="h1" className="text-boss text-text-hi" text="FIGHT YOUR WAY THROUGH THE LANGUAGE" />
              <p className="max-w-xl text-body text-text-mid">
                You pick a language, fight your way through it, and come out with proof you can actually code. Guided
                learning with an arcade combat loop, real multiplayer, and an evidence-backed certificate.
              </p>
            </div>

            <HeroLoop />

            <div>
              <Link href="/fight/py.core.loops.04">
                <Button variant="primary">Start fighting</Button>
              </Link>
            </div>
          </section>

          <section className="flex flex-col gap-16">
            {PILLARS.map((pillar) => (
              <ScrollReveal key={pillar.title} className="flex max-w-2xl flex-col gap-3">
                <h2 className="text-zone-title text-text-hi">{pillar.title}</h2>
                <p className="text-body text-text-mid">{pillar.body}</p>
              </ScrollReveal>
            ))}
          </section>
        </main>
      </HudFrame>
    </div>
  );
}
