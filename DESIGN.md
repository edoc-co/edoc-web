# edoc — Design & Interaction System (v2)

Supersedes v1. This is the visual and interaction source of truth. Follow it exactly. Where it is silent, choose the quieter option.

---

## 1. What edoc feels like

A fantasy arcade cabinet you operate. Warm, saturated, kinetic, with real weight behind every interaction — and a workspace at the centre calm enough to spend three hours in.

References inform proportion and energy, never copied: **Hot Wheels** (kinetic momentum, saturated colour, toy-like chunk), **cyberpunk** (glow, HUD density, telemetry), **fantasy games** (ornament, boss presence, loot ceremony), **award-tier interactive sites** (transitions, choreography, spatial continuity).

It should never read as a developer terminal, a course platform, or a SaaS dashboard.

---

## 2. The governing structure: two registers

Every surface in edoc belongs to exactly one register. This is the most important rule in this document — it is what lets edoc be hyper-interactive without being exhausting.

### Showcase surfaces — maximum craft
Landing, language coaster, player card, loot reveal, clan pages, leaderboards, transitions between any of these.

Full motion vocabulary. Custom cursor, magnetic hover, scroll-linked animation, staggered entrances, shared-element transitions, glow, parallax, sound. This is where edoc earns its reputation.

### Workspace surfaces — maximum calm
The fight screen's editor pane and test output.

Almost nothing moves. No parallax, no ambient animation, no glow, no cursor effects, no scroll-linked motion. The only motion is deliberate feedback: HP drain, damage flash, test rows resolving.

**The contrast is the point.** A user who has just flown through a coaster and watched a loot box open lands in a still, focused editor — and when the monster finally takes damage, it lands hard because nothing else was competing.

Boundary case: the monster frame sits in the fight screen but belongs to the *showcase* register — it may be ornamental and glowing. The editor directly below it must not be.

---

## 3. Signature moments

Three moments carry the identity. Build these with disproportionate care.

**Language commit.** The UI is monochrome until a language is chosen. On selection, the accent floods outward from the selected card across the whole interface over 600ms. This is the single most memorable interaction in the product.

**The kill.** Boss HP hits zero: time dilates briefly, the frame shatters outward, screen shake fires (this is the one place it is allowed), and the artifact reveal begins. Earn this — it should feel disproportionate to a passing test.

**Loot reveal.** Gold, glow, weight, a beat of anticipation before the drop resolves. Never instant. Never a toast notification.

Everything else can be restrained. These three cannot.

---

## 4. Colour

Three themes. Neutrals, semantics, and energy colours are all theme-scoped. Language accents are a separate layer that works across all three.

### `default` — warm dark (the signature look)
```css
--void:#12101C  --panel:#1A1728  --raised:#241F35
--line:#332B4A  --line-hi:#4A3F6B
--text-hi:#F0EAE2  --text-mid:#A79FB8  --text-lo:#6E6684
--pass:#4ADE80  --fail:#FF5C6A
--gold:#F0B429  --cyan:#22D3EE
```

### `dark` — neutral, low-stimulus, for long sessions
```css
--void:#0B0C0E  --panel:#141619  --raised:#1D2024
--line:#2A2E34  --line-hi:#3A404A
--text-hi:#E8E6E1  --text-mid:#A0A6AF  --text-lo:#6B717A
--pass:#4ADE80  --fail:#E5484D
--gold:#D9A21B  --cyan:#22D3EE
```

### `light` — warm paper, never pure white
```css
--void:#F5F1E8  --panel:#FDFBF6  --raised:#EBE4D6
--line:#D8CFBE  --line-hi:#BFB39C
--text-hi:#1C1828  --text-mid:#55506A  --text-lo:#857E99
--pass:#15803D  --fail:#C62828
--gold:#B07D0A  --cyan:#0E7490
```

Light theme drops glow to zero and gradients to none, relying on hairlines and flat fills. It will read calmer than the other two. That is correct — it is a comfort option, not the showcase. Never fake the arcade look with heavy shadows.

### Role separation — enforce strictly

| Token | Means | Never used for |
|---|---|---|
| `--accent` | The active language. Structure, focus, HP, ornament. | Loot, rewards |
| `--gold` | Loot, keys, shards, rewards, rare items. | Frames, borders, structure |
| `--cyan` | Multiplayer, coaster, ticker, live/social signals. | Anything single-player |
| `--pass` | A test passed. Nothing else, ever. | Decoration |
| `--fail` | A test failed or damage taken. Nothing else. | Decoration |

Gold and the Python accent are close in hue. If both appear on one surface, the read collapses — this already happened once in v1. Structure is always `--accent`; gold appears only when something is *won*.

### Language accents

| Language | Dark themes | Light theme |
|---|---|---|
| *(none)* | `#F0EAE2` bone | `#1C1828` ink |
| Python | `#E89B2C` | `#8A5A0B` |
| JavaScript | `#E5D63C` | `#7A6B0A` |
| TypeScript | `#3B82F6` | `#1D4ED8` |
| Go | `#22D3EE` | `#0E7490` |
| Rust | `#F26430` | `#9A3412` |
| Java | `#D9544F` | `#991B1B` |
| C++ | `#EC4899` | `#9D174D` |
| SQL | `#8B5CF6` | `#5B21B6` |

No language may be assigned a green hue — green belongs to `--pass`. Every accent must hit 4.5:1 against its theme's `--void`.

### Glow tokens
`--glow-accent`, `--glow-gold`, `--glow-cyan` as box-shadow values. All resolve to `none` in light theme. Never applied to the editor or any surface within 24px of it.

### Accent budget
Fight screen: accent stays under ~5% of pixels. Showcase surfaces: no cap — colour can be free there.

---

## 5. Type

```css
--font-display: 'Archivo';        /* variable, wdth + wght axes both used */
--font-ui:      'Inter';
--font-code:    'JetBrains Mono'; /* the user's code */
--font-hud:     'IBM Plex Mono';  /* the machine's voice */
```

Two monospaces is deliberate. JetBrains Mono is what the human writes in; IBM Plex Mono is what the system says back. Never swap them.

| Role | Face | Size | Weight / width | Case | Tracking | Word-spacing |
|---|---|---|---|---|---|---|
| Boss name | display | 40–56px | 800 / expanded | UPPER | -0.02em | 0.12em |
| Zone title | display | 32px | 700 / expanded | UPPER | -0.01em | 0.12em |
| Stat number | display | 24–40px | 700 / condensed | — | -0.01em | normal |
| Section label | hud | 12px | 500 | UPPER | 0.12em | normal |
| Body / UI | ui | 15px | 400 | Sentence | 0 | normal |
| Button | ui | 14px | 500 | UPPER | 0.06em | normal |
| Telemetry | hud | 11–12px | 400 | UPPER | 0.08em | normal |
| Editor | code | 14px | 400 | — | 0 | normal |

The width axis must actually apply — boss and zone type visibly expanded, stat numbers visibly condensed. Editor line-height 1.7; everything else 1.5; display 1.05.

**Telemetry must be true.** `HP 340/500` reflects real HP. `SYS://PY_CORE/E04` reflects the real encounter ID. Decorative-looking text that is accurate is what makes the machine feel real.

Copy: sentence case, active voice, plain verbs. `Run code`, not `Execute Submission`. Errors state what broke and what to do. No emoji anywhere.

---

## 6. Geometry

No rounded corners on chrome.

```css
--clip-panel: polygon(0 14px, 14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%);
--clip-btn:   polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);
```

Top-left and bottom-right cut, same diagonal direction everywhere. Mixed diagonals read as noise.

**Exception:** hint cards use 6px radius and no clip. They are physical objects being handled, not machine chrome. That difference should be felt.

Other rules:
- All borders 1px `--line`. Never 2px except focus rings.
- Corner brackets mark the active panel: four 14px L-shapes, `--accent`, inset 6px. One panel at a time.
- Boss frames get ornamental treatment — decorative corner flourishes, heavier frame, a nameplate. Fantasy, not military. Always `--accent`, never gold.
- Grain overlay optional, max 3% opacity, static, never animated.

Spacing: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`. Nothing between.

---

## 7. Motion system

```css
--dur-instant: 80ms;
--dur-fast:    140ms;   /* hover, focus, toggle */
--dur-base:    220ms;   /* panel state change */
--dur-slow:    360ms;   /* damage, reveals */
--dur-scene:   600ms;   /* route transitions, language commit */

--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);      /* default — decisive */
--ease-snap:   cubic-bezier(0.34, 1.3, 0.64, 1);   /* card release, loot pop */
--ease-scene:  cubic-bezier(0.65, 0, 0.35, 1);     /* route transitions */
```

Rules:
1. Motion is reactive. Ambient motion exists only in: the monster idle loop (4s, ±2px), the ticker, and slow coaster drift.
2. Animate `transform`, `opacity`, `filter`, and `clip-path` only. Never layout properties.
3. Nothing animates while the editor has focus.
4. Every effect ships a `prefers-reduced-motion: reduce` variant in the same commit. Not later.

---

## 8. Interaction pattern library

These are what make the product feel crafted rather than assembled. Build each once as a reusable primitive, then apply consistently. **All are showcase-register only unless noted.**

### 8.1 Custom cursor
Small accent ring following the pointer with ~0.12 lerp. Scales up and fills on interactive elements, becomes a label on drag targets ("swipe"), collapses to a dot over the editor. Hidden entirely on touch devices and when reduced-motion is set. **Reverts to the native cursor inside the editor pane** — never interfere with text selection.

### 8.2 Magnetic hover
Buttons and language cards translate toward the cursor up to 6px within a 40px radius, springing back on exit. Subtle enough to be felt rather than seen. Disabled on touch.

### 8.3 Shared-element transitions
Route changes are never hard cuts. The element you clicked persists and morphs into its position in the next view — a language card becomes the fight screen's boss frame; a boss frame becomes the artifact card. 600ms, `--ease-scene`. Everything else cross-fades with a 60ms stagger.

This is the single highest-leverage pattern for the "award-winning" feel. Use Framer Motion's `layoutId`.

### 8.4 Entrance choreography
On first paint of a showcase view, elements arrive in a deliberate sequence — never all at once, never one-by-one-forever. 40ms stagger, 8px upward translate, opacity 0→1, capped at ~6 staggered items before the rest arrive together.

### 8.5 Text reveal
Display headings only. Per-word mask reveal, 30ms stagger, 400ms each. Never on body copy, never on anything the user needs to read quickly, never in the fight screen.

### 8.6 Scroll-linked motion
Coaster and landing only. Position is driven by scroll progress rather than time, with inertia and snap. Use `useScroll` + `useTransform`. Never scroll-jack — the user's scroll must always map predictably to movement.

### 8.7 Number transitions
Any changing stat (HP, points, shards, level) animates from old to new over 360ms with easing, never snapping. HP additionally drains with a lighter ghost segment trailing 500ms behind — this is the single strongest feedback signal in the fight loop.

### 8.8 Loading as experience
No spinners. Route loads show the destination's frame assembling — brackets drawing in, panel clipping open. Encounter loads show the boss frame constructing. Under 200ms, show nothing at all.

### 8.9 Press physics
Every button scales to 0.97 on press with `--dur-instant`, releasing on `--ease-snap`. Consistent everywhere. Cheap, and it is most of what "feels good" means.

### 8.10 Sound (post-MVP, design for it now)
Default muted; unmuting is prompted once and rewarded. UI ticks on hover and press, a distinct hit on test pass, a heavier one on damage, a full cue on boss kill and loot. Route all audio through one manager with a global mute so it can be added without touching components.

---

## 9. Zone specs

### Landing
Showcase register, monochrome. Hero shows the actual fight interface running in a loop — not a description of it. Scroll-linked reveal of the three pillars. One CTA. No feature-card grid, no gradient hero, no testimonials.

### Zone A — Language coaster
The most kinetic surface in the product.

Scroll-driven track with real inertia, friction, and snap-to-nearest. Cards tilt along a curve entering and exiting, with depth blur and opacity falloff on distant items. Everything monochrome; each card shows its language accent only as a thin edge.

**Relevance depth:** if a track goal is set, matching languages pull forward and stay lit while others recede into haze but remain reachable. Depth encodes relevance, not just distance.

Selecting a language triggers the accent flood (§3) and a shared-element transition into the fight.

Start with CSS 3D transforms and perspective. Only reach for React Three Fiber if that genuinely isn't enough — it usually is. **Tear the view down completely when entering a fight**; `display:none` still burns frames.

### Zone B — Fight
Workspace register. Must fit one viewport at 1920×1080 with no scrolling, and stack cleanly at 390px.

Layout: boss frame across the top (compact — sprite ~140px as the dominant element, name and HP beside it, not floating in empty space). Editor below. Test output beneath that. Player HP and the Run button in a right rail. No dead columns.

- Editor: flat `--panel`, 1px `--line`, no glow, no gradient, 24px padding, 1.7 line-height
- Boss HP: `--accent` fill with `--glow-accent` in dark themes, ghost-trail drain, pulses at 1s with the number in `--fail` below 25%
- **Run is the primary action and is always visible and enabled** unless a run is in flight
- On pass: test rows resolve to `--pass` in sequence, HP drains per test `damage`, single accent flash on the boss frame
- On fail: the failing line highlights `--fail` at 12% inside the editor via CodeMirror decoration, screen-edge vignette pulse, player HP drops, attack message appears. **No screen shake**
- On defeat: surface the `failureMap` lesson card, then offer a rematch
- On kill: the full ceremony from §3
- Ticker hidden entirely during a fight

### Zone C — Hint cards
Physical objects. 6px radius, `--raised`, ±2° rest rotation, real drag physics with velocity-based release. Left discards, right saves, up inserts the skeleton at the cursor. All three bound to arrow keys — a product teaching keyboard-driven work must not require a mouse. Virtualize to 3 rendered cards.

### Player card
Showcase register. A spec sheet, not a dashboard: dense HUD rows, condensed stat numbers, hairline dividers, animated number transitions on load. The mastered-language weapon graphic is the one illustrative moment — give it space, keep everything around it flat. Empty project slot reads as conspicuously unfilled.

### Ticker
`--cyan`, 11px HUD mono. One `transform` on a single strip, never per-item DOM insertion. Lobby and profile only.

---

## 10. Performance budget

Non-negotiable — this product puts an editor, an animated boss, a card deck, and a ticker on one screen.

- One `requestAnimationFrame` loop for all game animation, not one per component
- Editor text buffer stays in local state, never in the global store
- Tear down 3D/canvas views on route change, don't hide them
- Virtualize every list and deck
- Lazy-load the coaster, loot animations, and sound
- Target 60fps during a fight on a mid-range laptop; if a showcase effect costs fight-screen frames, the effect loses
- Lighthouse performance ≥ 85 on the landing page

---

## 11. Accessibility floor

Launch requirement, not polish. Universities will ask during procurement.

- Visible focus ring on every interactive element in all three themes — 2px `--accent`, 2px offset
- Full keyboard path through fight, cards, and coaster
- `prefers-reduced-motion` honored everywhere: shake → border flash, parallax → static, physics → instant snap, text reveal → immediate
- All text hits 4.5:1 in every theme
- Never encode state in colour alone — pass and fail rows carry an icon or glyph as well
- Screen-reader announcements for HP changes and test results via a live region
- Works at 390px and at 200% browser zoom

---

## 12. Do not

- Neon glow on everything — restraint is what makes the glow that exists land
- Gold used for structure, or accent used for loot
- More than one language accent visible at once
- Purple-to-pink gradients, or any gradient on the editor
- Ambient particle fields or floating orbs
- Glitch effects as decoration — failure states only, sparingly
- Rounded cards with soft shadows anywhere except hint cards
- Scroll-jacking
- Spinners
- Emoji in the UI
- Pure `#FFF` or pure `#000`
- Any animation while the editor has focus

---

## 13. Motion tech stack

Four libraries, scoped strictly by job. Using the right one for each is what keeps the bundle survivable.

| Tool | Job | Never used for |
|---|---|---|
| **Framer Motion** | Default. React component state, layout animation, all `layoutId` shared-element transitions (§8.3). | Long scripted sequences |
| **GSAP** | Scripted cinematic timelines only: boss kill, loot reveal, the language accent flood (§3). | Component state |
| **Lenis** | Smooth scroll on landing and coaster only. | The fight screen, ever |
| **Rive** | Monster state machine (idle, hit, attack, defeated) and loot-box reveal. | Static illustration |

**Three.js is deferred.** The coaster ships with CSS 3D transforms and perspective first. Revisit only if that proves genuinely insufficient — ~600KB is a lot for a menu visited once a month.

### Loading rules
Everything except CodeMirror and Framer Motion is dynamically imported and torn down on route change. **The fight screen must never load Lenis or Three.js.** A hijacked scroll inside a code editor is unacceptable. Verify the fight screen bundle does not regress when new libraries land.

### The `<Monster>` component
Accepts a state prop and drives the Rive state machine. Falls back to a static sprite when no `.riv` file is present, so the fight screen works before art exists.

`.riv` files are authored in Rive's editor, not in code — this is an art-asset dependency, not an engineering one.

### Zone C flick physics
Hint cards use velocity-based release: flicking fast launches the card out of view, releasing slowly springs it back. `@use-gesture` + `react-spring` already model this — keep them.

---

## 14. Definition of done, per screen

- No hardcoded hex, size, or duration outside the token file
- Verified in all three themes
- Role separation intact: accent for structure, gold for loot, cyan for social
- All clipped corners share one diagonal direction
- Nothing animates while the editor has focus
- Reduced-motion variant exists and was tested
- Keyboard-only pass completes the primary task
- Holds at 390px and at 200% zoom
- 60fps during interaction
