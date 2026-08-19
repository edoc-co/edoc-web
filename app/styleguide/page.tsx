'use client';

import { useEffect, useRef, useState } from 'react';
import { HudFrame, Panel, Button, Pill, Label, Telemetry, CornerBrackets } from '@/components/hud';
import MonsterFrame from '@/components/fight/MonsterFrame';
import HpBar from '@/components/fight/HpBar';
import {
  Magnetic,
  TextReveal,
  NumberTransition,
  LoadingReveal,
  Entrance,
  CustomCursor,
  Monster,
  AmbientDrift,
  type MonsterState,
} from '@/components/motion';
import { WORLDS, type World } from '@/lib/world/constants';
import { MODES, type Mode } from '@/lib/mode/constants';
import { FICTION, meterDisplayValue } from '@/lib/world/fiction';

const COMBOS: { world: World; mode: Mode }[] = WORLDS.flatMap((world) => MODES.map((mode) => ({ world, mode })));

/** "rgb(r, g, b)" / "rgba(r, g, b, a)" -> "#RRGGBB" (+ alpha byte if < 1). */
function colorToHex(resolved: string): string {
  const nums = resolved.match(/[\d.]+/g)?.map(Number) ?? [];
  const [r, g, b, a] = nums;
  if (r === undefined) return resolved;
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  let hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  if (a !== undefined && a < 1) hex += toHex(a * 255);
  return hex.toUpperCase();
}

const SWATCHES: { token: string; name: string }[] = [
  { token: '--void', name: 'void' },
  { token: '--panel', name: 'panel' },
  { token: '--raised', name: 'raised' },
  { token: '--line', name: 'line' },
  { token: '--line-hi', name: 'line-hi' },
  { token: '--text-hi', name: 'text-hi' },
  { token: '--text-mid', name: 'text-mid' },
  { token: '--text-lo', name: 'text-lo' },
  { token: '--pass', name: 'pass' },
  { token: '--fail', name: 'fail' },
  { token: '--gold', name: 'gold' },
  { token: '--cyan', name: 'cyan' },
  { token: '--accent', name: 'accent' },
  { token: '--accent-dim', name: 'accent-dim' },
  { token: '--accent-text', name: 'accent-text' },
];

const SPACING = [4, 8, 12, 16, 24, 32, 48, 64];

const TYPE_ROLES: { cls: string; face: string; label: string; sample: string }[] = [
  { cls: 'text-boss', face: 'font-display', label: 'Boss name', sample: 'THE LOOP KING' },
  { cls: 'text-zone-title', face: 'font-display', label: 'Zone title', sample: 'FIGHT' },
  { cls: 'text-stat', face: 'font-display', label: 'Stat number', sample: 'HP 340/500' },
  { cls: 'text-label', face: 'font-hud uppercase', label: 'Section label', sample: 'Test output' },
  { cls: 'text-body', face: 'font-ui', label: 'Body / UI', sample: 'Return the sum of every even number from 1 to n.' },
  { cls: 'text-button', face: 'font-ui uppercase', label: 'Button', sample: 'Run code' },
  { cls: 'text-telemetry', face: 'font-hud uppercase', label: 'Telemetry', sample: 'SYS://PY_CORE/E04' },
  { cls: 'text-editor', face: 'font-code', label: 'Editor', sample: 'def sum_evens(n):' },
];

export default function StyleguidePage() {
  const [lang, setLang] = useState<'none' | 'python'>('none');
  const swatchRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [hexes, setHexes] = useState<Record<string, string>>({});
  const [cursorOn, setCursorOn] = useState(false);
  const [demoMonsterState, setDemoMonsterState] = useState<MonsterState>('idle');
  const [statValue, setStatValue] = useState(148);
  const [entranceKey, setEntranceKey] = useState(0);

  // Reads each swatch's actual computed color rather than assuming a
  // static hex, so themed tokens (accent, accent-dim, accent-text, and
  // every neutral) stay correct across both language and theme changes.
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const s of SWATCHES) {
      const el = swatchRefs.current[s.token];
      if (el) next[s.token] = colorToHex(getComputedStyle(el).backgroundColor);
    }
    setHexes(next);

    // Re-read on world OR mode change too — MutationObserver on
    // <html data-world>/<html data-mode>, since either axis can change
    // a swatch's resolved color.
    const observer = new MutationObserver(() => {
      const updated: Record<string, string> = {};
      for (const s of SWATCHES) {
        const el = swatchRefs.current[s.token];
        if (el) updated[s.token] = colorToHex(getComputedStyle(el).backgroundColor);
      }
      setHexes(updated);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-world', 'data-mode'] });
    return () => observer.disconnect();
  }, [lang]);

  return (
    <div data-lang={lang === 'python' ? 'python' : undefined}>
      <HudFrame
        brand={
          <span className="font-display text-lg font-extrabold uppercase tracking-tight text-text-hi">
            edoc
          </span>
        }
        rail={
          <div className="flex items-center gap-3">
            <Telemetry className="hidden sm:inline">
              Mode: {lang === 'python' ? 'python accent' : 'monochrome'}
            </Telemetry>
            <div className="flex items-center gap-2">
              <Pill active={lang === 'none'} onClick={() => setLang('none')}>
                Monochrome
              </Pill>
              <Pill active={lang === 'python'} onClick={() => setLang('python')}>
                Python
              </Pill>
            </div>
          </div>
        }
      >
        <main className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-12">
          <p className="text-body text-text-mid">
            Use the World × Mode switcher at the top right to check every section below across all four
            combinations. <strong className="text-text-hi">World</strong> (Forge / Grove) is art direction —
            geometry, type, motion, fiction; <strong className="text-text-hi">Mode</strong> (Dark / Light) is
            luminance only. Light modes should read calm — near-zero glow, no gradients, flat fills — that's
            intended in both worlds, not a bug. The "World × Mode matrix" section below shows all four side by
            side without touching the switcher, using the same locally-scoped <code>data-world</code>/
            <code>data-mode</code> trick the first-run world picker uses.
          </p>

          {/* World x Mode matrix — all four combinations at once, via
              locally-scoped data-world/data-mode wrappers (same trick
              WorldPicker uses), so this section never depends on the
              header switcher's current state. */}
          <section className="flex flex-col gap-4">
            <Label>World × Mode matrix (all four, at once)</Label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {COMBOS.map(({ world, mode }) => (
                <div
                  key={`${world}-${mode}`}
                  data-world={world}
                  data-mode={mode}
                  className="clip-panel flex flex-col gap-3 border border-line bg-panel p-4"
                >
                  <Telemetry>
                    {world} · {mode}
                  </Telemetry>
                  <span className="text-boss text-2xl text-text-hi">{FICTION.bossBadgeLabel[world]}</span>
                  <div
                    className="clip-btn flex h-10 items-center justify-center border border-accent"
                    style={{ boxShadow: 'var(--glow-accent)' }}
                  >
                    <span className="font-hud text-telemetry uppercase text-accent">glow-accent</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Fiction layer — the one permitted combat-state fork
              (meter inversion) plus the label swaps, side by side.
              Never a logic fork elsewhere: same 60/100 raw HP feeds
              both readings below. */}
          <section className="flex flex-col gap-4">
            <Label>Fiction layer (WORLDS.md §4 — one derived value, never forked logic)</Label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {WORLDS.map((world) => (
                <div key={world} data-world={world} data-mode="dark" className="clip-panel flex flex-col gap-3 border border-line bg-panel p-4">
                  <Telemetry>{world}</Telemetry>
                  <div className="flex items-center gap-3">
                    <span className="font-hud text-telemetry uppercase text-text-lo">
                      {FICTION.opponentMeterLabel[world]}
                    </span>
                    <span className="text-stat text-text-hi">
                      {meterDisplayValue(world, 60, 100)}/100
                    </span>
                    <span className="font-hud text-[11px] text-text-lo">
                      (raw HP: 60/100 — same combat state, different reading)
                    </span>
                  </div>
                  <span className="font-hud text-telemetry uppercase text-text-lo">
                    {FICTION.defeatedLabel[world]} · {FICTION.masteredIllustrationLabel[world]}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Ambient drift — Grove only, mounted here unconditionally
              inside a scoped Grove wrapper so it's visible regardless
              of the page's actual world. */}
          <section className="flex flex-col gap-4">
            <Label>Ambient drift (Grove only — drifting petals, slow light shift)</Label>
            <div data-world="grove" data-mode="dark" className="clip-panel relative h-32 overflow-hidden border border-line bg-panel">
              <AmbientDrift count={5} />
              <div className="relative flex h-full items-center justify-center">
                <Telemetry>Reduced motion renders nothing here — that's the correct no-op, not a bug</Telemetry>
              </div>
            </div>
          </section>

          {/* Colors */}
          <section className="flex flex-col gap-4">
            <Label>Color tokens</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {SWATCHES.map((s) => (
                <div key={s.token} className="flex flex-col gap-2">
                  <div
                    ref={(el) => {
                      swatchRefs.current[s.token] = el;
                    }}
                    className="clip-panel h-16 border border-line"
                    style={{ background: `var(${s.token})` }}
                  />
                  <Telemetry>{s.name}</Telemetry>
                  <span className="font-hud text-[11px] text-text-lo">{hexes[s.token] ?? '—'}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Glow */}
          <section className="flex flex-col gap-4">
            <Label>Glow (never on/near the editor)</Label>
            <div className="flex flex-wrap gap-6">
              <div
                className="clip-panel flex h-20 w-40 items-center justify-center border border-accent bg-panel"
                style={{ boxShadow: 'var(--glow-accent)' }}
              >
                <Telemetry>glow-accent</Telemetry>
              </div>
              <div
                className="clip-panel flex h-20 w-40 items-center justify-center border border-gold bg-panel"
                style={{ boxShadow: 'var(--glow-gold)' }}
              >
                <Telemetry>glow-gold</Telemetry>
              </div>
              <div
                className="clip-panel flex h-20 w-40 items-center justify-center border border-cyan bg-panel"
                style={{ boxShadow: 'var(--glow-cyan)' }}
              >
                <Telemetry>glow-cyan</Telemetry>
              </div>
              <div className="loot-glow loot-pulse clip-panel flex h-20 w-40 items-center justify-center border border-gold bg-panel">
                <Telemetry>loot drop (pulsing)</Telemetry>
              </div>
            </div>
          </section>

          {/* Gradient chrome */}
          <section className="flex flex-col gap-4">
            <Label>Gradient chrome (flat fill in light theme)</Label>
            <div className="chrome-surface clip-panel flex h-16 items-center border border-line px-4">
              <Telemetry>.chrome-surface — two-stop, never the editor</Telemetry>
            </div>
          </section>

          {/* Typography */}
          <section className="flex flex-col gap-4">
            <Label>Type scale</Label>
            <Panel className="flex flex-col gap-6">
              {TYPE_ROLES.map((t) => (
                <div key={t.cls} className="flex flex-col gap-1 border-b border-line pb-4 last:border-0 last:pb-0">
                  <Telemetry>
                    {t.label} · .{t.cls} · {t.face}
                  </Telemetry>
                  <div className={`${t.cls} ${t.face} text-text-hi`}>{t.sample}</div>
                </div>
              ))}
            </Panel>
          </section>

          {/* Panels + corner brackets */}
          <section className="flex flex-col gap-4">
            <Label>Panels &amp; corner brackets</Label>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Panel>
                <Label>Inactive panel</Label>
                <p className="mt-2 text-body text-text-mid">
                  Flat --panel fill, 1px --line border, clipped top-left / bottom-right corners.
                  No accent, no brackets, no glow.
                </p>
              </Panel>
              <Panel active>
                <Label>Active panel</Label>
                <p className="mt-2 text-body text-text-mid">
                  Corner brackets in --accent, plus a soft --glow-accent — near-zero in light theme.
                </p>
              </Panel>
            </div>
            <Panel padding="card" className="relative w-fit">
              <CornerBrackets />
              <Telemetry>Corner brackets standalone, inset 6px</Telemetry>
            </Panel>
          </section>

          {/* Boss frame */}
          <section className="flex flex-col gap-4">
            <Label>Boss frame (ornamental — fantasy, not military)</Label>
            <MonsterFrame
              name="The Loop King"
              hp={340}
              maxHp={500}
              state="idle"
              hitFlashKey={0}
              attackMessage={null}
            />
          </section>

          {/* HP bars */}
          <section className="flex flex-col gap-4">
            <Label>HP bars</Label>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Telemetry className="w-32 shrink-0">Above 50%, glow</Telemetry>
                <HpBar value={80} max={100} glowVar="--glow-accent" className="flex-1" />
              </div>
              <div className="flex items-center gap-3">
                <Telemetry className="w-32 shrink-0">Below 50%, no glow</Telemetry>
                <HpBar value={40} max={100} glowVar="--glow-accent" className="flex-1" />
              </div>
              <div className="flex items-center gap-3">
                <Telemetry className="w-32 shrink-0">Below 20%, pulses</Telemetry>
                <HpBar value={12} max={100} glowVar="--glow-accent" className="flex-1" />
              </div>
            </div>
          </section>

          {/* Buttons */}
          <section className="flex flex-col gap-4">
            <Label>Buttons</Label>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary">Run code</Button>
              <Button variant="ghost">Discard</Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>
          </section>

          {/* Pills */}
          <section className="flex flex-col gap-4">
            <Label>Pills (tabs / mode toggle)</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Pill active={false}>Inactive</Pill>
              <Pill active>Active</Pill>
            </div>
          </section>

          {/* Clip shapes */}
          <section className="flex flex-col gap-4">
            <Label>Clip geometry</Label>
            <div className="flex flex-wrap items-end gap-6">
              <div className="clip-panel flex h-24 w-40 items-center justify-center border border-line bg-raised">
                <Telemetry>clip-panel · current world</Telemetry>
              </div>
              <div className="clip-btn flex h-12 w-40 items-center justify-center border border-line bg-raised">
                <Telemetry>clip-btn · current world</Telemetry>
              </div>
              <div className="clip-card flex h-16 w-32 items-center justify-center border border-line bg-raised">
                <Telemetry>clip-card · both worlds</Telemetry>
              </div>
            </div>
            {/* Same three classes, forced Forge vs Grove side by side —
                confirms the geometry is genuinely token-driven, not
                assumed. clip-card is the named exception: rounded in
                both worlds (6px Forge / 20px Grove), never clipped. */}
            <div className="flex flex-wrap gap-6">
              {WORLDS.map((world) => (
                <div key={world} data-world={world} className="flex items-end gap-4">
                  <Telemetry className="self-center">{world}</Telemetry>
                  <div className="clip-panel flex h-16 w-24 items-center justify-center border border-line bg-raised" />
                  <div className="clip-btn flex h-10 w-24 items-center justify-center border border-line bg-raised" />
                  <div className="clip-card flex h-12 w-20 items-center justify-center border border-line bg-raised" />
                </div>
              ))}
            </div>
          </section>

          {/* Spacing */}
          <section className="flex flex-col gap-4">
            <Label>Spacing scale</Label>
            <div className="flex flex-wrap items-end gap-4">
              {SPACING.map((px) => (
                <div key={px} className="flex flex-col items-center gap-2">
                  <div className="bg-accent-dim" style={{ width: px, height: px }} />
                  <Telemetry>{px}px</Telemetry>
                </div>
              ))}
            </div>
          </section>

          {/* Motion */}
          <section className="flex flex-col gap-4">
            <Label>Motion (DESIGN.md v2 §7 durations)</Label>
            <div className="flex flex-wrap gap-4">
              {(['instant', 'fast', 'base', 'slow', 'scene'] as const).map((d) => (
                <div
                  key={d}
                  tabIndex={0}
                  className={`clip-btn flex h-12 w-28 items-center justify-center border border-line bg-raised transition-colors duration-${d} ease-out hover:border-accent hover:text-accent`}
                >
                  <Telemetry>{d}</Telemetry>
                </div>
              ))}
            </div>
          </section>

          {/* Interaction primitives — showcase register only; none of
              these run on the fight screen. */}
          <section className="flex flex-col gap-6 pb-12">
            <Label>Interaction primitives (§8, showcase register only)</Label>

            <div className="flex flex-col gap-2">
              <Telemetry>Custom cursor (§8.1) — hover this panel, hides over the editor pane</Telemetry>
              <div className="flex items-center gap-3">
                <Button variant={cursorOn ? 'primary' : 'ghost'} onClick={() => setCursorOn((v) => !v)}>
                  {cursorOn ? 'Cursor: on' : 'Cursor: off'}
                </Button>
                {cursorOn && <CustomCursor />}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Telemetry>Magnetic hover (§8.2) — up to 6px pull within a 40px radius</Telemetry>
              <Magnetic className="w-fit">
                <Button variant="ghost" data-cursor-interactive>
                  Hover near me
                </Button>
              </Magnetic>
            </div>

            <div className="flex flex-col gap-2">
              <Telemetry>Text reveal (§8.5) — per-word mask, 30ms stagger</Telemetry>
              <TextReveal key={entranceKey} as="h2" className="text-zone-title text-text-hi" text="BOSS DEFEATED" />
            </div>

            <div className="flex flex-col gap-2">
              <Telemetry>Number transition (§8.7) — animates old→new over 360ms</Telemetry>
              <div className="flex items-center gap-4">
                <NumberTransition value={statValue} className="text-stat text-text-hi" />
                <Button variant="ghost" onClick={() => setStatValue((v) => v + 37)}>
                  +37
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Telemetry>Entrance choreography (§8.4) — 40ms stagger, capped at 6 items</Telemetry>
              <Button variant="ghost" className="w-fit" onClick={() => setEntranceKey((k) => k + 1)}>
                Replay entrance
              </Button>
              <Entrance key={entranceKey} className="flex flex-wrap gap-3">
                {['t1', 't2', 't3', 't4', 't5'].map((id) => (
                  <div key={id} className="clip-btn border border-line bg-raised px-4 py-2">
                    <Telemetry>{id}</Telemetry>
                  </div>
                ))}
              </Entrance>
            </div>

            <div className="flex flex-col gap-2">
              <Telemetry>Loading as experience (§8.8) — no spinners, suppressed under 200ms</Telemetry>
              <div className="h-40">
                <LoadingReveal label="Assembling encounter" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Telemetry>
                &lt;Monster&gt; / &lt;Opponent&gt; state machine (§13) — same component, static fallback, no .riv
                asset yet. The Forge counter-attack vs. Grove droop-and-dim on 'attack' is pure CSS off
                data-monster-state — try it after switching World above.
              </Telemetry>
              <div className="flex items-center gap-4">
                <Monster state={demoMonsterState} spriteLabel="M" className="h-20 w-20" />
                <div className="flex flex-wrap gap-2">
                  {(['idle', 'hit', 'attack', 'defeated'] as const).map((s) => (
                    <Pill key={s} active={demoMonsterState === s} onClick={() => setDemoMonsterState(s)}>
                      {s}
                    </Pill>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </HudFrame>
    </div>
  );
}
