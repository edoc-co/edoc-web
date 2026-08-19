# edoc — Design & Interaction System

Visual and interaction source of truth. Read `PROJECT.md` first. Where this document is silent, choose the quieter option.

---

## 1. What edoc feels like

You are sitting in the cockpit of a working ship. Struts frame your view, instruments surround you, space moves outside the glass. The interface is not laid over the world — it *is* the ship.

References inform proportion and mood, never copied: worn-in retro-futurism, scrappy crews, practical instrumentation, real depth of field. Every asset original.

It must never read as a developer terminal, a course platform, or a SaaS dashboard.

---

## 2. The governing rule: loud hull, calm console

Every surface belongs to one of two registers. **This is the most important rule in this document.**

### Hull register — maximum craft
Universe map, approach sequences, landing, planet surfaces, crew lobby, pilot profile, loot reveal, all transitions.

Full motion vocabulary: parallax, custom cursor, magnetic hover, shared-element transitions, entrance choreography, typed-text reveals, glow, sound.

### Console register — maximum calm
The code editor and diagnostics panel.

Almost nothing moves. No parallax, no ambient animation, no glow within 24px, no cursor effects, **no sound at all**. The only motion is deliberate feedback: hull drain, damage flash, diagnostics resolving.

**The contrast is the point.** Someone who just flew through an asteroid field lands in a still, legible console — and when the hostile finally takes damage, it lands hard because nothing else was competing.

---

## 3. Signature moments

Three moments carry the identity. Build them with disproportionate care.

**Planet commit.** The map is monochrome until a destination is chosen. On selection the planet's accent floods outward across the whole interface over 600ms, and the ship turns toward it.

**The kill.** Hostile integrity hits zero: time dilates, the hull shudders (the one place screen shake is allowed), the console flares, salvage reveals.

**Loot reveal.** Gold, glow, weight, a beat of anticipation. Never instant, never a toast.

---

## 4. Colour

Two modes. **Moon** (dark) is the default and the signature. **Sun** (light) is a comfort option — it will read calmer, which is correct; never fake depth with heavy shadows.

### moon
```css
--void:#070A12   --hull:#12161F   --hull-hi:#1B212D
--strut:#252C3A  --line:#2E3746   --line-hi:#3D4757
--console:#0C1119
--text-hi:#E6EDF5  --text-mid:#94A3B4  --text-lo:#5C6878
--pass:#4ADE80  --fail:#FF5C6A  --gold:#F0B429  --cyan:#3DD6E8
```

### sun
```css
--void:#DDE4EC   --hull:#EFF3F8   --hull-hi:#F8FAFC
--strut:#C9D3DF  --line:#B8C4D2   --line-hi:#9FAEC0
--console:#F7F9FC
--text-hi:#0F1620  --text-mid:#4A5666  --text-lo:#7A8797
--pass:#15803D  --fail:#C62828  --gold:#B07D0A  --cyan:#0E7490
```

### Role separation — enforce strictly

| Token | Means | Never for |
|---|---|---|
| `--accent` | The active planet/language. Structure, focus, integrity bars, ornament. | Loot |
| `--gold` | Salvage, keys, shards, rewards. | Structure |
| `--cyan` | Ship systems, comms, crew, multiplayer, live signals. | Single-player state |
| `--pass` | A test passed. Nothing else, ever. | Decoration |
| `--fail` | A test failed or hull damage. Nothing else. | Decoration |

### Planet accents

| Language | moon | sun |
|---|---|---|
| *(none — map idle)* | `#E6EDF5` | `#0F1620` |
| Python | `#E89B2C` | `#8A5A0B` |
| JavaScript | `#E5D63C` | `#7A6B0A` |
| TypeScript | `#3B82F6` | `#1D4ED8` |
| Go | `#22D3EE` | `#0E7490` |
| Rust | `#F26430` | `#9A3412` |
| Java | `#D9544F` | `#991B1B` |
| C++ | `#EC4899` | `#9D174D` |
| SQL | `#8B5CF6` | `#5B21B6` |

No planet may take a green hue — green belongs to `--pass`. Every accent must hit 4.5:1 on its mode's `--void`.

`--glow-accent`, `--glow-gold`, `--glow-cyan` are box-shadow tokens, all `none` in sun mode, never applied within 24px of the console.

**Accent budget:** under ~5% of pixels on the fight screen. No cap on hull-register surfaces.

---

## 5. Type

```css
--font-display: 'Archivo';        /* variable — wdth + wght axes both used */
--font-ui:      'Inter';
--font-code:    'JetBrains Mono'; /* the pilot's code */
--font-hud:     'IBM Plex Mono';  /* the ship's voice */
```

Two monospaces is deliberate. JetBrains Mono is what the human writes; IBM Plex Mono is what the ship says back. Never swap them.

| Role | Face | Size | Weight / width | Case | Tracking |
|---|---|---|---|---|---|
| Hostile / planet name | display | 40–56px | 800 / expanded | UPPER | -0.02em, word-spacing 0.12em |
| Zone title | display | 32px | 700 / expanded | UPPER | -0.01em |
| Instrument number | display | 19–40px | 600 / condensed | — | -0.01em |
| Instrument label | hud | 9–10px | 500 | UPPER | 0.16em |
| Telemetry | hud | 9–11px | 400 | UPPER | 0.09em |
| Body / UI | ui | 15px | 400 | Sentence | 0 |
| Button | ui | 12–14px | 500 | UPPER | 0.16em |
| Console | code | 13.5px | 400 | — | 0 |

Console line-height 1.75. Everything else 1.5. Display 1.05.

**Telemetry must be true.** `HULL 78/100` reflects real state. `SECTOR 04 · PYTHON PRIME` reflects the real location. Accurate text that looks decorative is what makes the ship feel real.

**Typed-text reveal** on major headings only — characters appear sequentially with keyboard sound. Never on body copy, never in the console, never on anything needing fast reading.

Copy: sentence case, active voice, plain verbs. `Run code`, not `Execute Submission`. No emoji.

---

## 6. Geometry

No rounded corners on hull chrome.

```css
--clip-panel: polygon(0 13px, 13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%);
--clip-btn:   polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);
```

Top-left and bottom-right cut, one diagonal direction everywhere.

- Borders 1px `--line`. Never 2px except focus rings.
- **Cockpit struts** frame the viewport: top strut with an angled underside, left and right struts with a canopy notch, bottom console bank rising from the base. All `clip-path` on gradient fills — no images required for v1.
- The console is **recessed**: inset shadow ring plus a darker fill than the hull around it. It should read as a screen set into a panel.
- Instrument bays are small stacked panels with a label, a bar, and a value.
- Optional grain/scanline, max 3%, static, never animated.

Spacing: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64`.

---

## 7. Motion

```css
--dur-instant: 80ms;  --dur-fast: 140ms;  --dur-base: 220ms;
--dur-slow:   360ms;  --dur-scene: 600ms;

--ease-out:   cubic-bezier(0.16, 1, 0.3, 1);
--ease-snap:  cubic-bezier(0.34, 1.3, 0.64, 1);
--ease-scene: cubic-bezier(0.65, 0, 0.35, 1);
```

1. Motion is reactive. Ambient motion exists only in: starfield drift, companion idle hover, and ship hum indicators.
2. Animate `transform`, `opacity`, `filter`, `clip-path` only. Never layout properties.
3. **Nothing animates while the console has focus.**
4. Every effect ships a `prefers-reduced-motion: reduce` variant in the same commit.

---

## 8. Interaction primitives

Build each once in `components/motion/`, then apply consistently. **Hull register only unless noted.**

**8.1 Parallax depth** — 4–5 layers (far stars, near stars, planet, ring, foreground dust) translating on mouse at increasing depth factors. `transform` only. This is the entire "3D" effect; no WebGL.

**8.2 Custom cursor** — small cyan reticle with 0.12 lerp, scaling on interactive elements. **Reverts to the native cursor inside the console.**

**8.3 Magnetic hover** — buttons and planet nodes translate up to 6px toward the cursor within 40px. Disabled on touch.

**8.4 Shared-element transitions** — never hard cuts. A planet node morphs into the approach view; the hostile frame morphs into the salvage card. 600ms, `--ease-scene`, Framer Motion `layoutId`. **Highest-leverage pattern in the product.**

**8.5 Entrance choreography** — 40ms stagger, 8px translate, opacity 0→1, capped at ~6 items before the rest arrive together.

**8.6 Typed-text reveal** — per-character with keyboard sound, headings only.

**8.7 Number transitions** — every changing stat animates over 360ms, never snaps. Integrity bars drain with a lighter ghost segment trailing 500ms — the strongest feedback signal in the fight loop.

**8.8 Loading as experience** — no spinners. Route loads show the destination assembling: struts drawing in, instruments powering up. Under 200ms, show nothing.

**8.9 Press physics** — every button scales to 0.97 on press, releasing on `--ease-snap`.

**8.10 Sound** — global toggle, default off with one prompt. Ship hum, console clicks, hull impacts, engine burn, docking, loot chime, keyboard on typed text. Route all audio through one manager. **Muted entirely while the console has focus.**

---

## 9. Screen specs

### Landing
Hull register. Opens inside the cockpit; the viewport shows the universe. Typed-text hero. Nav reads as ship systems — Navigation, Systems, Crew, Hangar, Comms — not Learn/Practice/Build. One CTA. No feature-card grid, no gradient hero, no testimonials.

### Universe map
The language selector. Planets on orbital paths, monochrome until one is chosen. Scroll or drag to move through the system with inertia; hovering a planet surfaces its dossier. Selecting triggers the accent flood (§3) and a shared-element transition into the approach.

Parallax and pre-rendered orbital motion — no real-time 3D.

### Approach / fight
Console register at the centre, hull register at the edges. **Must fill one viewport with no page scroll**, and stack cleanly at 390px.

- Cockpit struts frame the edges; parallax starfield and planet behind
- Left bay: hull integrity (player), ship telemetry, crew status
- Centre: the console — recessed, flat, still, 1.75 line-height, no glow
- Diagnostics panel directly beneath the console, full console width, ~104px, internal scroll
- Right bay: hostile integrity, threat log, salvage
- Companion robot bottom-left with the hint; Run Code bottom-right
- On pass: diagnostics rows resolve to `--pass` in sequence, hostile integrity drains per test damage, accent flash
- On fail: failing line highlights `--fail` at 12% via CodeMirror decoration, screen-edge pulse, hull drops, threat message. **No screen shake**
- On defeat: companion surfaces the `failureMap` lesson, then rematch
- On kill: the §3 ceremony

### Planet surface
Hull register. Illustrated scene with hotspots; each hotspot is a module and reflects that world's real features — never generic. Skippable in one click for players who want to go straight to work.

### Crew lobby
Hull register. Ship interior, crew at stations, live chat, ready states. Boarding is a skippable cutscene.

### Pilot profile
Hull register. A ship's manifest, not a dashboard: dense instrument rows, condensed numbers, hairline dividers, animated numbers on load. The mastered-language emblem is the one illustrative moment — give it space, keep everything around it flat. Conspicuously empty project slot.

---

## 10. Performance budget

- One `requestAnimationFrame` loop for all animation, not one per component
- Console text buffer in local state, never the global store
- Tear down heavy views on route change — hiding them still burns frames
- Virtualize every list
- Lazy-load cutscenes, planet scenes, sound
- 60fps during a fight on a mid-range laptop; if a hull effect costs console frames, the effect loses
- Lighthouse ≥ 85 on landing

---

## 11. Accessibility floor

Launch requirement, not polish.

- Visible focus ring on every interactive element in both modes — 2px `--accent`, 2px offset
- Full keyboard path through map, fight, and companion
- `prefers-reduced-motion` honoured everywhere: shake → border flash, parallax → static, typed text → immediate
- All text 4.5:1 in both modes
- Never encode state in colour alone — pass and fail rows carry a glyph
- Live region announcements for integrity changes and test results
- Works at 390px and 200% zoom
- Sound never required to understand state

---

## 12. Do not

- Real-time 3D where parallax will do
- Neon glow on everything
- Gold for structure, or accent for loot
- More than one planet accent visible at once
- Gradients on the console
- Ambient particles near the console
- Any sound while the console has focus
- Scroll-jacking
- Spinners
- Licensed IP in any asset
- Pure `#FFF` or `#000`
- Any animation while the console has focus

---

## 13. Motion tech stack

| Tool | Job | Never for |
|---|---|---|
| **Framer Motion** | Default. Component state, layout, all `layoutId` transitions. | Long scripted sequences |
| **GSAP** | Scripted cinematics: kill sequence, loot reveal, accent flood. | Component state |
| **Lenis** | Smooth scroll on landing and universe map only. | The fight screen, ever |
| **Rive** | Companion robot and hostile state machines; loot reveal. | Static illustration |
| **Howler** | Audio manager with global mute. | — |

**Three.js is not used.** Parallax and pre-rendered video cover the requirement.

Everything except CodeMirror and Framer Motion is dynamically imported and torn down on route change. The fight screen must never load Lenis.

`.riv` files are authored in Rive's editor — an art dependency, not an engineering one. Every Rive component needs a static fallback so screens work before art exists.

---

## 14. Definition of done, per screen

- No hardcoded hex, size, or duration outside the token file
- Verified in both modes
- Role separation intact
- One diagonal direction on all clips
- Nothing animates or sounds while the console has focus
- Reduced-motion variant exists and was tested
- Keyboard-only pass completes the primary task
- Holds at 390px and 200% zoom
- 60fps during interaction
