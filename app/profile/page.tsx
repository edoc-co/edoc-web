'use client';

import type { ReactNode } from 'react';
import { HudFrame, Label, Telemetry } from '@/components/hud';
import { NumberTransition, Entrance } from '@/components/motion';
import { PLAYER_PROFILE } from '@/lib/player/mockProfile';

/**
 * Showcase register (DESIGN.md v2 §2/§9) — a spec sheet, not a
 * dashboard: dense HUD rows, condensed stat numbers, hairline
 * dividers, numbers that count up on load rather than appearing
 * static. The mastered-language weapon graphic is the one
 * illustrative moment; everything around it stays flat. The project
 * slot is conspicuously empty when there's nothing there — that's the
 * point (PROJECT.md §5), not a bug to hide.
 */
export default function ProfilePage() {
  const player = PLAYER_PROFILE;

  return (
    <div data-lang={player.primaryLanguage} className="min-h-screen bg-void">
      <HudFrame
        brand={
          <span className="font-display text-lg font-extrabold uppercase tracking-tight text-text-hi">edoc</span>
        }
        rail={<Telemetry className="hidden sm:inline">Player card</Telemetry>}
      >
        <main className="mx-auto flex max-w-4xl flex-col gap-10 px-8 py-12">
          <Entrance className="contents">
            <div className="flex items-center gap-6">
              <div className="clip-btn flex h-20 w-20 shrink-0 items-center justify-center border border-line bg-raised">
                <span className="font-display text-3xl font-extrabold text-text-mid">
                  {player.handle.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="text-zone-title text-text-hi">{player.handle}</h1>
                <Telemetry>Spec sheet, not a résumé</Telemetry>
              </div>
            </div>

            <section className="flex flex-col">
              <StatRow label="Win streak">
                <NumberTransition value={player.winStreak} className="text-stat text-text-hi" />
              </StatRow>
              <StatRow label="Encounters cleared">
                <NumberTransition value={player.encountersCleared} className="text-stat text-text-hi" />
              </StatRow>
              <StatRow label="First-attempt rate">
                <NumberTransition
                  value={player.firstAttemptRate}
                  className="text-stat text-text-hi"
                  format={(n) => `${Math.round(n)}%`}
                />
              </StatRow>
            </section>

            <section className="flex flex-col gap-3">
              <Label>Per-language mastery</Label>
              <div className="flex flex-col">
                {player.masteries.map((m) => (
                  <div
                    key={m.language}
                    data-lang={m.accentLang}
                    className="flex items-center gap-4 border-b border-line py-3 last:border-0"
                  >
                    <span className="w-32 shrink-0 font-hud text-telemetry uppercase text-text-lo">{m.language}</span>
                    <div className="h-1.5 flex-1 bg-raised">
                      <div className="h-full bg-accent" style={{ width: `${m.percent}%` }} />
                    </div>
                    <NumberTransition
                      value={m.percent}
                      className="w-14 shrink-0 text-right text-stat text-text-hi"
                      format={(n) => `${Math.round(n)}%`}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* The one illustrative moment — space around it stays flat. */}
            <section className="flex flex-col gap-3">
              <Label>Mastered weapon</Label>
              <div
                className="clip-panel flex h-48 items-center justify-center border border-accent bg-panel"
                style={{ boxShadow: 'var(--glow-accent)' }}
              >
                <span className="text-boss text-accent">{player.primaryLanguage.slice(0, 2).toUpperCase()}</span>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <Label>Project</Label>
              {player.hasProject ? (
                <div className="clip-panel flex h-32 items-center justify-center border border-line bg-panel">
                  <Telemetry>Project attached</Telemetry>
                </div>
              ) : (
                <div className="clip-panel flex h-32 items-center justify-center border border-dashed border-line bg-panel">
                  <Telemetry>No project yet — visible, not hidden</Telemetry>
                </div>
              )}
            </section>
          </Entrance>
        </main>
      </HudFrame>
    </div>
  );
}

function StatRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-3 last:border-0">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
