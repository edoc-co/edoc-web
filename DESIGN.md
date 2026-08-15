# edoc — Design System & Frontend Spec

This document is the visual source of truth. Follow it exactly. Where it is silent, choose the quieter option.

---

## 1. The idea in one paragraph

edoc is a machine you operate, not a website you browse. The interface is a dark, angular terminal-arcade console: near-black surfaces, hairline structure, condensed heavy display type, and mono telemetry that makes the whole thing read as instrumentation. References are Valorant (discipline, clipped geometry, single accent), Cyberpunk (HUD density), and Hot Wheels (kinetic energy — used in exactly one place). None of those references are copied; they inform proportion, restraint, and motion feel only.

**Governing rule: loud chrome, calm workspace.** The frame, HUD, monster, ticker, and cards carry all the energy. The code editor is the stillest surface in the product. That contrast is the identity — if everything moves, nothing lands.

---

## 2. Signature element

**The interface is lit by the language you are learning.**

Before a language is selected — landing page, language coaster — the UI is entirely monochrome. No accent color exists. The moment the user commits to a language, the entire interface floods with that language's accent: HP bars, active states, focus rings, corner brackets, cursor, damage flashes.

This does three jobs: it makes selection feel consequential, it gives each language a distinct felt identity, and it is the mechanical hook for the loot economy (theme keys swap one variable).

Do not add a second signature. Everything else stays disciplined.

---

## 3. Color tokens

Define these as CSS custom properties on `:root`. Never hardcode a hex outside this file.

### Neutrals (fixed, never themed)

```css
--void:        #0B0C0E;  /* page background */
--panel:       #141619;  /* panels, editor surface */
--raised:      #1D2024;  /* cards, hover states, inputs */
--line:        #2A2E34;  /* all hairlines, 1px only */
--line-hi:     #3A404A;  /* hairline on hover/focus */
--text-hi:     #E8E6E1;  /* primary text — bone, never pure white */
--text-mid:    #A0A6AF;  /* secondary */
--text-lo:     #6B717A;  /* telemetry, timestamps, disabled */
```

### Semantic (fixed, never themed)

```css
--pass:        #4ADE80;  /* tests passing. ONLY this. */
--fail:        #E5484D;  /* tests failing, damage taken */
```

There is no `--warn`. Low HP and expiring timers are states, not colors: low HP (<20%) pulses the HP bar at 1s and turns the HP number `--fail`; an expiring timer pulses rather than changing color. Motion carries the urgency, not a third semantic hue.

`--pass` is sacred. It appears nowhere decorative. If green shows up, a test passed. Same for `--fail`.

### Accent (themed per language)

```css
--accent:      /* set at runtime */
--accent-dim:  /* same hue, 40% opacity — for fills and glows */
--accent-text: /* same hue lightened to hit 4.5:1 on --void */
```

Language assignments:

| Language | `--accent` |
|---|---|
| *(none selected)* | `#E8E6E1` (bone — monochrome mode) |
| Python | `#E89B2C` |
| JavaScript | `#E5D63C` |
| TypeScript | `#3B82F6` |
| Go | `#22D3EE` |
| Rust | `#F26430` |
| Java | `#D9544F` |
| C++ | `#EC4899` |
| SQL | `#8B5CF6` |

**Rule: no language may be assigned a green hue.** Green belongs to `--pass` and nothing else. If a green language accent is ever needed, shift it to teal-violet instead.

### Accent budget

The accent may occupy no more than roughly 5% of visible pixels on any screen. HP bar fill, one active state, focus ring, cursor, damage flash, one primary CTA. If a screen looks colorful, remove accent until it doesn't.

---

## 4. Typography

Three roles, three faces. Load only the weights listed.

```css
--font-display: 'Archivo', sans-serif;        /* variable, use width + weight axes */
--font-ui:      'Inter', sans-serif;          /* 400, 500 */
--font-code:    'JetBrains Mono', monospace;  /* 400, 700 — the user's code */
--font-hud:     'IBM Plex Mono', monospace;   /* 400, 500 — the machine's voice */
```

Two monospace faces is deliberate: JetBrains Mono is what the human writes in, IBM Plex Mono is what the system says back. Never swap them.

### Scale

| Role | Face | Size | Weight / width | Case | Tracking |
|---|---|---|---|---|---|
| Boss name | display | 48–72px | 800, expanded | UPPER | -0.02em |
| Zone title | display | 32px | 700, expanded | UPPER | -0.01em |
| Stat number | display | 24–40px | 700, condensed | — | -0.01em |
| Section label | hud | 12px | 500 | UPPER | 0.12em |
| Body / UI | ui | 15px | 400 | Sentence | 0 |
| Button | ui | 14px | 500 | UPPER | 0.06em |
| Telemetry | hud | 11–12px | 400 | UPPER | 0.08em |
| Editor | code | 14px | 400 | — | 0 |

Editor line-height is **1.7**. Everything else 1.5. Display type 1.05.

### Telemetry copy

Fake system readouts are chrome, but they must never lie about state. `HP 340/500` reflects real HP. `SYS://PY_CORE/E04` reflects the real encounter ID. Decorative-looking text that is actually accurate is what makes the machine feel real.

Write all UI copy in sentence case, active voice, plain verbs. `Run code`, not `Execute Submission`. Errors state what broke and what to do; they never apologize.

---

## 5. Geometry

**No rounded corners on chrome.** This is the most identity-defining rule.

```css
/* Panels, HUD frames, modals */
--clip-panel: polygon(
  0 14px, 14px 0, 100% 0,
  100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%
);

/* Buttons, pills, badges */
--clip-btn: polygon(
  0 8px, 8px 0, 100% 0,
  100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%
);
```

Cut the top-left and bottom-right corners. Keep the diagonal direction consistent everywhere — mixed diagonals read as noise.

**Exception:** hint cards in Zone C get `border-radius: 6px` and no clip. They are physical objects being handled, not machine chrome. The difference should be felt.

### Other structural rules

- All borders are `1px solid var(--line)`. Never 2px. Never a colored border except on focus.
- **Corner brackets** mark the active panel: four 14px L-shapes in `--accent`, 1px, inset 6px. Only one panel wears them at a time.
- **Dividers between major zones** are skewed ~4°, not 45°. Subtle, not decorative.
- Grain/scanline overlay: static PNG or CSS, **max 3% opacity, never animated**. Optional — cut it if it costs clarity.

### Spacing

`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`. Nothing between. Panel padding is 24px, card padding 16px, dense HUD rows 8px.

---

## 6. Motion

```css
--dur-fast:  120ms;  /* hover, focus, toggle */
--dur-base:  180ms;  /* panel state change */
--dur-slow:  300ms;  /* damage, transitions */
--ease-out:  cubic-bezier(0.2, 0, 0, 1);
--ease-snap: cubic-bezier(0.34, 1.2, 0.64, 1);  /* card release only */
```

Rules:

1. **Motion is reactive, never ambient.** Things move because the user did something. The only exception is the monster's idle breathing loop (4s, ±2px translate) and the ticker strip.
2. **Animate `transform` and `opacity` only.** Anything touching layout will stutter the editor mid-keystroke.
3. **No full-screen shake on a failed test.** That is exhausting by the third fight. Failure = the offending editor line flashes `--fail` + a single screen-edge vignette pulse (300ms). Reserve real screen shake for boss defeat and boss kill.
4. Every effect ships with a `prefers-reduced-motion: reduce` variant. Shake → border flash. Parallax → static. Card physics → instant snap.

---

## 7. Zone specs

### Landing page

Monochrome. Display type doing the heavy lifting. One CTA. The hero should show the actual fight interface running — a live or looped encounter — rather than describing it. No feature-card grid, no gradient hero, no testimonial row.

### Zone A — Language coaster

The only place kinetic energy is allowed to be extravagant. It is a ten-second experience, so it can afford it.

- Heavy perspective, cards tilting along a curve as they enter and exit
- Momentum scroll with real inertia and friction; snap to nearest
- Depth blur and opacity falloff on distant items
- **Relevance depth:** if the user has picked a goal/track, matching languages pull forward and stay lit; the rest recede into haze but remain reachable
- Still monochrome — each language card shows its accent only as a thin edge, previewing what the UI will become
- Cap primary track tags at 3 per language

Build this **last**. Fake it with CSS parallax until the fight loop is proven.

### Zone B — Fight screen

The calmest surface in the product.

- Editor pane: flat `--panel`, 1px `--line` border, no glow, 24px padding, 1.7 line-height
- Monster sits above in its own clipped frame with corner brackets
- HP bar: 6px tall, `--accent` fill on `--raised` track, hard edges, no gradient, no shine. Damage drains in 300ms with a lighter "ghost" segment trailing behind for 500ms.
- Test output panel below the editor in `--font-hud`. Pass rows get a `--pass` left tick; fail rows `--fail`.
- **Damage feedback:** failing line highlights `--fail` at 12% inside the editor (use CodeMirror decorations), screen-edge vignette pulse, HP drop. Nothing else.
- **Hit feedback:** the passing test row ticks green in sequence, monster HP drains, a single accent flash across the monster frame.
- **Hide the ticker entirely during an active fight.**
- No ambient particles, no floating elements, no idle animation anywhere in this zone except the monster.

### Zone C — Hint cards

Physical objects, not UI.

- Rounded 6px, `--raised`, subtle 1px `--line`
- Rest state carries ±2° rotation so the stack looks handled
- Real drag physics with velocity-based release (`@use-gesture` + `react-spring`)
- Swipe left = discard (card tumbles away), right = save (snaps toward the backpack icon), up = insert skeleton into editor
- **Bind all three to arrow keys.** A product teaching keyboard-driven work must not require a mouse.
- Virtualize: render 3 cards, never the full deck

### Ticker

`--font-hud`, 11px, `--text-lo`. One `transform: translateX` on a single strip — never per-item DOM insertion. Present in lobby and profile, absent in fights.

### Player card / profile

Treat as a spec sheet, not a dashboard. Dense HUD rows, condensed stat numbers, hairline dividers. The mastered-language weapon graphic is the one illustrative moment — give it space and keep everything around it flat.

---

## 8. Do not

- Neon glow on everything — this is the beginner tell
- More than one accent color on screen simultaneously
- Purple-to-pink gradients, or any gradient on chrome
- Ambient particle fields or floating orbs
- Glitch effects as decoration (failure states only, sparingly)
- Rounded cards with soft drop shadows — reads as generic SaaS
- Emoji anywhere in the UI
- Pure white `#FFF` or pure black `#000`
- Rainbow-coded categories in the coaster
- Any animation that runs while the editor has focus

---

## 9. Implementation notes

**Stack:** Next.js (App Router) + Tailwind + Zustand. Tailwind theme extends from the CSS variables above — do not duplicate values in `tailwind.config`.

**Editor: CodeMirror 6, not Monaco.** CM6 is ~200KB vs ~5MB, works on touch, and its theming system is a swappable object — which is exactly what the loot economy needs. Use CM6 decorations for damage highlighting inside the editor.

**Performance budget** (editor + monster + cards + ticker on one screen is a real constraint):

- Tear down the Zone A canvas when entering a fight. `display: none` is not enough — a backgrounded R3F scene still burns frames.
- Keep the editor buffer out of the global Zustand store. Game state (HP, combo, shards) in the store; text buffer local.
- One `requestAnimationFrame` loop for all game animation, not one per component.
- Ticker, HP drain, and damage flashes are all `transform`/`opacity`.

**Mock the runtime.** Build the entire fight feel against a fake `runTests()` that resolves pass/fail after 300ms. The real execution backend can land later without touching the frontend.

**Accessibility floor** (non-negotiable, and universities will ask):

- Visible focus ring on every interactive element — 2px `--accent`, offset 2px
- All accent-on-`--void` text combinations hit 4.5:1; verify each language accent
- Full keyboard path through fight, cards, and coaster
- `prefers-reduced-motion` honored everywhere
- Responsive down to 390px — the fight screen stacks vertically, cards become a bottom sheet

---

## 10. Build order

1. Design tokens + app shell (HUD frame, nav, clip utilities)
2. Fight screen with mocked runtime — this is the product, prove it first
3. Hint card deck
4. Player card / profile
5. Landing page
6. Language coaster with real 3D

---

## 11. Definition of done, per screen

- No hardcoded hex outside the token file
- Only one accent visible; accent covers under ~5% of pixels
- Every clipped corner uses the same diagonal direction
- Nothing animates while the editor has focus
- Reduced-motion variant exists and was tested
- Keyboard-only pass completes the primary task
- Screen holds at 390px wide
