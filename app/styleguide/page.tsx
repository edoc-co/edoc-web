'use client';

import { useEffect, useRef, useState } from 'react';
import { HudFrame, Panel, Button, Pill, Label, Telemetry, CornerBrackets } from '@/components/hud';

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

  // Reads each swatch's actual computed color rather than assuming a
  // static hex, so themed tokens (accent, accent-dim, accent-text)
  // stay correct when `lang` changes.
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const s of SWATCHES) {
      const el = swatchRefs.current[s.token];
      if (el) next[s.token] = colorToHex(getComputedStyle(el).backgroundColor);
    }
    setHexes(next);
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
                  <span className="font-hud text-[11px] text-text-lo">
                    {hexes[s.token] ?? '—'}
                  </span>
                </div>
              ))}
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
                  No accent, no brackets.
                </p>
              </Panel>
              <Panel active>
                <Label>Active panel</Label>
                <p className="mt-2 text-body text-text-mid">
                  Same panel, corner brackets in --accent mark it as the focused surface.
                </p>
              </Panel>
            </div>
            <Panel padding="card" className="relative w-fit">
              <CornerBrackets />
              <Telemetry>Corner brackets standalone, inset 6px</Telemetry>
            </Panel>
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
                <Telemetry>clip-panel · 14px</Telemetry>
              </div>
              <div className="clip-btn flex h-12 w-40 items-center justify-center border border-line bg-raised">
                <Telemetry>clip-btn · 8px</Telemetry>
              </div>
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
          <section className="flex flex-col gap-4 pb-12">
            <Label>Motion</Label>
            <div className="flex flex-wrap gap-4">
              {(['fast', 'base', 'slow'] as const).map((d) => (
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
        </main>
      </HudFrame>
    </div>
  );
}
