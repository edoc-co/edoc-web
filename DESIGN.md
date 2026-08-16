# edoc — Design System & Frontend Spec (v2)

This document is the visual source of truth. Follow it exactly. Where it is silent, choose the quieter option.

**v2 changelog:** the direction moved from cold terminal-arcade to warm fantasy arcade cabinet. Base color is now deep indigo-violet, not grey-black. Two fixed energy colors (gold, cyan) exist in every theme, outside the per-language accent. Glow and two-stop gradients are allowed on chrome. The 5% accent cap now scopes to the fight screen only. Boss frames get ornamental treatment. Three themes exist: `default` (the signature warm look), `dark` (neutral, low-stimulus), and `light` (warm paper). Geometry, typography, and motion rules from v1 carry forward unchanged except where noted.

---

## 1. The idea in one paragraph

edoc is a fantasy arcade cabinet you operate, not a website you browse. The interface is warm, energetic, and a little theatrical — deep indigo-violet surfaces, hairline structure, condensed heavy display type, controlled glow, and mono telemetry that makes the whole thing read as instrumentation with character. References are Hot Wheels (kinetic energy, saturated color), cyberpunk (glow, HUD density), and fantasy games (ornament, character, boss presence). None of those references are copied; they inform proportion, color temperature, and motion feel only. It should not read as a developer terminal.

**Governing rule: loud chrome, calm workspace.** The frame, HUD, monster, ticker, and cards carry all the energy. The code editor is the stillest, flattest, least-glowing surface in the product regardless of theme. That contrast is the identity — if everything moves or glows, nothing lands.

---

## 2. Signature element

**The interface is lit by the language you are learning.**

Before a language is selected — landing page, language coaster — the UI shows no per-language accent (it reads as the theme's own ink color). The moment the user commits to a language, the entire interface floods with that language's accent: HP bars, active states, focus rings, corner brackets, cursor, damage flashes.

This does three jobs: it makes selection feel consequential, it gives each language a distinct felt identity, and it is the mechanical hook for the loot economy (theme keys swap one variable).

The per-language accent is a layer on top of whichever theme is active — it works in `default`, `dark`, and `light` alike. It is not the only color in the room anymore (gold and cyan are always present too), but it stays the *personal* one: nothing else changes when you pick a language.

---

## 3. Color tokens

Define these as CSS custom properties, scoped per `[data-theme]`. Never hardcode a hex outside `styles/tokens.css`.

### Themes

Three themes, chosen via a `data-theme` attribute on `<html>`:

- **`default`** — warm dark, the signature look. This is what a new user sees.
- **`dark`** — neutral, high-contrast, low-stimulus. For long sessions where the warmth becomes visual noise.
- **`light`** — warm paper, never pure white. A comfort option. It is *supposed* to read calmer than the other two — don't fake the arcade look here with heavy shadows. Reduce glow to near zero, drop gradients, rely on hairlines and flat fills.

```css
/* default */
--void:#12101C --panel:#1A1728 --raised:#241F35 --line:#332B4A --line-hi:#4A3F6B
--text-hi:#F0EAE2 --text-mid:#A79FB8 --text-lo:#6E6684
--pass:#4ADE80 --fail:#FF5C6A --gold:#F0B429 --cyan:#22D3EE

/* dark */
--void:#0B0C0E --panel:#141619 --raised:#1D2024 --line:#2A2E34 --line-hi:#3A404A
--text-hi:#E8E6E1 --text-mid:#A0A6AF --text-lo:#6B717A
--pass:#4ADE80 --fail:#E5484D --gold:#D9A21B --cyan:#22D3EE

/* light */
--void:#F5F1E8 --panel:#FDFBF6 --raised:#EBE4D6 --line:#D8CFBE --line-hi:#BFB39C
--text-hi:#1C1828 --text-mid:#55506A --text-lo:#857E99
--pass:#15803D --fail:#C62828 --gold:#B07D0A --cyan:#0E7490
```

`--pass` is sacred. It appears nowhere decorative. If green shows up, a test passed. Same for `--fail`. There is no `--warn`. Low HP and expiring timers are states, not colors: low HP (<20%) pulses the HP bar at 1s and turns the HP number `--fail`; an expiring timer pulses rather than changing color. Motion carries the urgency, not a third semantic hue.

### Energy colors (fixed, present in every theme)

`--gold` and `--cyan` sit outside the per-language accent layer — they mean the same thing regardless of which language (or no language) is selected, and regardless of theme:

- **Gold** — loot, keys, rewards. Anything the player earns.
- **Cyan** — the language coaster, the ticker, multiplayer. Anything social or exploratory.

Never repurpose them for anything else, and never let a per-language accent collide with what they mean (they're allowed to share a hue with a language's accent incidentally — Go's accent is cyan too — but gold/cyan-as-*energy-colors* only ever mean loot/reward and coaster/ticker/multiplayer).

### Accent (themed per language, layered on top of the active theme)

```css
--accent:      /* set at runtime */
--accent-rgb:  /* same hue, as an "R, G, B" triplet — for rgba() mixes */
--accent-dim:  /* rgba(var(--accent-rgb), 0.4) — for fills and glows */
--accent-text: /* same hue adjusted to hit 4.5:1 on --void */
```

Language assignments (base values — used by both `default` and `dark`, since both are dark-void themes):

| Language | `--accent` |
|---|---|
| *(none selected)* | that theme's `--text-hi` |
| Python | `#E89B2C` |
| JavaScript | `#E5D63C` |
| TypeScript | `#3B82F6` |
| Go | `#22D3EE` |
| Rust | `#F26430` |
| Java | `#D9544F` |
| C++ | `#EC4899` |
| SQL | `#8B5CF6` |

**`light` theme gets its own darker/desaturated variant per language**, not a reuse of the dark-theme hex — a hue tuned for 4.5:1 on a near-black void rarely still hits 4.5:1 on a warm cream one. Verify each one.

**Rule: no language may be assigned a green hue.** Green belongs to `--pass` and nothing else. If a green language accent is ever needed, shift it to teal-violet instead.

### Accent budget — now scoped to the fight screen only

On the fight screen (Zone B), the accent may occupy no more than roughly 5% of visible pixels: HP bar fill, one active state, focus ring, cursor, damage flash, one primary CTA. If the fight screen looks colorful, remove accent until it doesn't — the editor and the combat readouts still need to read calm and legible above all else.

**Everywhere else, color can be freer.** The coaster, the ticker, the player card, loot moments, and the styleguide are allowed to use gold, cyan, and accent more liberally — this is the "arcade cabinet" energy the v2 direction asks for. Freer doesn't mean unlimited: still no more than one accent color plus the two energy colors visible at once, still no rainbow-coding.

### Glow

Glow is allowed — a controlled outer glow (`box-shadow`, soft, not a hard ring) on:

- Active panels (accent glow)
- HP bars above 50% (accent glow)
- Loot drops and reward moments (gold glow)
- Boss frames, in `default` and `dark` only

**Never on or near the editor**, in any theme. The editor is the one surface glow is not allowed to touch, full stop.

Three tokens carry this: `--glow-accent`, `--glow-gold`, `--glow-cyan` — each a full `box-shadow` value. All three resolve to `none` in `light` theme; components don't need to branch on theme themselves, the token already does it.

### Gradients

Two-stop gradients are allowed on chrome (header bars, boss nameplates, primary buttons) via `--chrome-surface`, a two-stop `linear-gradient(135deg, var(--panel), var(--raised))`. **Never on the editor surface.** In `light` theme, `--chrome-surface` redefines to a flat `var(--panel)` fill — no gradients there.

---

## 4. Typography

Three roles, three faces. Load only the weights listed. Unchanged from v1.

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

Editor line-height is **1.7**. Everything else 1.5. Display type 1.05. Boss name and Zone title use Archivo's `wdth` axis at its expanded end (~125%); Stat number uses the condensed end (~75%) — set via `font-stretch`, not a separate cut of the face. Word-spacing (`0.12em`) is added on all three display roles to offset the negative letter-tracking, so multi-word display type doesn't read as one word.

### Telemetry copy

Fake system readouts are chrome, but they must never lie about state. `HP 340/500` reflects real HP. `SYS://PY_CORE/E04` reflects the real encounter ID. Decorative-looking text that is actually accurate is what makes the machine feel real.

Write all UI copy in sentence case, active voice, plain verbs. `Run code`, not `Execute Submission`. Errors state what broke and what to do; they never apologize.

---

## 5. Geometry

**No rounded corners on chrome.** This is still the most identity-defining rule.

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

**Exception 1:** hint cards in Zone C get `border-radius: 6px` and no clip. They are physical objects being handled, not machine chrome. The difference should be felt.

**Exception 2 (new in v2):** boss frames get ornamental treatment — this is fantasy presence, not military discipline:

- A heavier border — 3px, not 1px. The one other place a chrome border exceeds the 1px hairline rule.
- A soft accent glow (`--glow-accent`), off in light theme.
- Four small gold corner flourishes (diamonds, not brackets) — decorative, not functional; they don't mean "active panel" the way corner brackets do.
- A nameplate — a small gold-filled tag naming what this frame is, overlapping the top border like a plate riveted to it.

### Other structural rules

- Chrome borders are `1px solid var(--line)` by default. Never 2px, except the boss frame's 3px (above). Never a colored border except on focus, an active panel's accent, or the boss frame.
- **Corner brackets** mark the active panel: four 14px L-shapes in `--accent`, 1px, inset 6px. Only one panel wears them at a time. Boss frames use flourishes instead, not brackets.
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
--dur-ghost: 500ms;  /* HP bar ghost segment, trailing the primary drain */
--dur-pulse: 1000ms; /* low-HP bar pulse, expiring-timer pulse */
--ease-out:  cubic-bezier(0.2, 0, 0, 1);
--ease-snap: cubic-bezier(0.34, 1.2, 0.64, 1);  /* card release only */
```

Rules — unchanged from v1:

1. **Motion is reactive, never ambient.** Things move because the user did something. The only exceptions are the monster's idle breathing loop (4s, ±2px translate) and the ticker strip.
2. **Animate `transform` and `opacity` only.** Anything touching layout will stutter the editor mid-keystroke. (A glow's `box-shadow` is set/cleared, not animated between values, for the same reason — it can transition, but don't keyframe it.)
3. **No full-screen shake on a failed test.** That is exhausting by the third fight. Failure = the offending editor line flashes `--fail` + a single screen-edge vignette pulse (300ms). Reserve real screen shake for boss defeat and boss kill.
4. Every effect ships with a `prefers-reduced-motion: reduce` variant. Shake → border flash. Parallax → static. Card physics → instant snap. A pulsing glow → a fixed, permanently-on glow instead of motion.

---

## 7. Zone specs

### Landing page

The theme's own ink color only, no per-language accent yet. Display type doing the heavy lifting. One CTA. The hero should show the actual fight interface running — a live or looped encounter — rather than describing it. No feature-card grid, no testimonial row. A `--chrome-surface` gradient hero background is fine now (v1 forbade all gradient heroes; v2 allows it since it's chrome, not the editor).

### Zone A — Language coaster

The only place kinetic energy is allowed to be extravagant, and now also the home of `--cyan` (multiplayer/coaster's fixed color) as ambient chrome. It is a ten-second experience, so it can afford it.

- Heavy perspective, cards tilting along a curve as they enter and exit
- Momentum scroll with real inertia and friction; snap to nearest
- Depth blur and opacity falloff on distant items
- **Relevance depth:** if the user has picked a goal/track, matching languages pull forward and stay lit; the rest recede into haze but remain reachable
- Each language card shows its accent only as a thin edge before selection, previewing what the UI will become
- Cap primary track tags at 3 per language

Build this **last**. Fake it with CSS parallax until the fight loop is proven.

### Zone B — Fight screen

Still the calmest surface in the product — this did not change in v2. The 5% accent cap still applies here specifically (§3).

- **Editor pane: flat `--panel`, 1px `--line` border, no glow, no gradient, 24px padding, 1.7 line-height, in every theme.** This is the one place the warm/energetic v2 direction stops.
- Monster sits above in its own ornamental boss frame (§5 exception 2) with corner flourishes and a nameplate, not a plain clipped panel with brackets.
- HP bar: 6px tall, `--accent` fill on `--raised` track, hard edges. A soft `--glow-accent` above 50% HP; below 20% it pulses at 1s and the HP number turns `--fail`, instead of glowing or changing fill color. Damage drains in 300ms with a lighter "ghost" segment trailing behind for 500ms.
- Test output panel below the editor in `--font-hud`. Pass rows get a `--pass` left tick; fail rows `--fail`.
- **Damage feedback:** failing line highlights `--fail` at 12% inside the editor (CodeMirror decoration, flat, no glow), screen-edge vignette pulse, HP drop. Nothing else.
- **Hit feedback:** the passing test row ticks green in sequence, monster HP drains, a single accent flash across the monster frame.
- Loot/reward moments (post-fight drops) use `--gold` with a glow — the one place gold appears inside Zone B.
- **Hide the ticker entirely during an active fight.**
- No ambient particles, no floating elements, no idle animation anywhere in this zone except the monster's breathing.

### Zone C — Hint cards

Physical objects, not UI.

- Rounded 6px, `--raised`, subtle 1px `--line`
- Rest state carries ±2° rotation so the stack looks handled
- Real drag physics with velocity-based release (`@use-gesture` + `react-spring`)
- Swipe left = discard (card tumbles away), right = save (snaps toward the backpack icon), up = insert skeleton into editor
- **Bind all three to arrow keys.** A product teaching keyboard-driven work must not require a mouse.
- Virtualize: render 3 cards, never the full deck

### Ticker

`--font-hud`, 11px, `--text-lo`, with `--cyan` available for anything multiplayer-flavored moving through it. One `transform: translateX` on a single strip — never per-item DOM insertion. Present in lobby and profile, absent in fights.

### Player card / profile

Treat as a spec sheet with character, not a flat dashboard. Dense HUD rows, condensed stat numbers, hairline dividers, gold accents on earned loot/certificates. The mastered-language weapon graphic is the one illustrative moment — give it space, a glow is fine here, and keep everything around it disciplined.

---

## 8. Themes

A `ThemeProvider` sets `data-theme` on `<html>`, persists the choice (e.g. `localStorage`), and defaults to `default`. A blocking inline script runs before first paint to apply the persisted choice immediately — no flash of the wrong theme.

A compact three-way switcher (`default` / `dark` / `light`) lives in the HUD header, present on every screen that uses it, and again on `/styleguide`.

Every component reads color exclusively through the CSS custom properties in §3 — never a literal hex — so all three themes fall out of the token layer with no component-level branching. The one thing that *does* need explicit per-theme handling is contrast: verify every accent, and every text-on-surface pairing, hits 4.5:1 in all three themes independently. Light is the easiest to get wrong — check it specifically, don't assume "we tuned dark, light will be fine."

---

## 9. Do not

- More than one accent color plus the two energy colors visible at once
- Glitch effects as decoration (failure states only, sparingly)
- Rounded cards with soft drop shadows outside the two named exceptions (hint cards, boss frame) — reads as generic SaaS
- Emoji anywhere in the UI
- Pure white `#FFF` or pure black `#000`
- Rainbow-coded categories in the coaster
- Any animation, glow, or gradient that runs on or near the editor, in any theme
- Faking the arcade look in light theme with heavy shadows — light is a calm, comfort option by design

---

## 10. Implementation notes

**Stack:** Next.js (App Router) + Tailwind + Zustand. Tailwind theme extends from the CSS variables above — do not duplicate values in `tailwind.config`.

**Editor: CodeMirror 6, not Monaco.** CM6 is ~200KB vs ~5MB, works on touch, and its theming system is a swappable object — which is exactly what the loot economy needs. Use CM6 decorations for damage highlighting inside the editor. The editor's own theme reads the same CSS variables as everything else, so it re-themes automatically — but never gains glow or gradient no matter what theme is active.

**Performance budget** (editor + monster + cards + ticker on one screen is a real constraint):

- Tear down the Zone A canvas when entering a fight. `display: none` is not enough — a backgrounded R3F scene still burns frames.
- Keep the editor buffer out of the global Zustand store. Game state (HP, combo, shards) in the store; text buffer local.
- One `requestAnimationFrame` loop for all game animation, not one per component. (Prefer plain CSS transitions/keyframes where the effect allows — they run on the compositor and don't depend on the tab actively compositing frames the way a hand-rolled `requestAnimationFrame` polling loop does.)
- Ticker, HP drain, and damage flashes are all `transform`/`opacity`.

**Mock the runtime.** Build the entire fight feel against a fake `runTests()` that resolves pass/fail after 300ms. The real execution backend can land later without touching the frontend.

**Accessibility floor** (non-negotiable, and universities will ask):

- Visible focus ring on every interactive element, in all three themes — 2px `--accent`, offset 2px
- All accent-on-`--void` and text-on-surface combinations hit 4.5:1; verify each language accent **in each theme**, light especially
- Full keyboard path through fight, cards, and coaster
- `prefers-reduced-motion` honored everywhere, including anything glow-related
- Responsive down to 390px — the fight screen stacks vertically, cards become a bottom sheet

---

## 11. Build order

1. Design tokens + app shell (HUD frame, nav, clip utilities, themes)
2. Fight screen with mocked runtime — this is the product, prove it first
3. Hint card deck
4. Player card / profile
5. Landing page
6. Language coaster with real 3D

---

## 12. Definition of done, per screen

- No hardcoded hex outside the token file
- Fight screen: accent covers under ~5% of pixels. Elsewhere: at most one accent + the two energy colors visible at once.
- Every clipped corner uses the same diagonal direction (boss frame and hint cards are the two named exceptions to clipping itself)
- Nothing animates, glows, or gradients on or near the editor
- Reduced-motion variant exists and was tested
- Contrast verified in all three themes, light specifically
- Keyboard-only pass completes the primary task, focus ring visible in all three themes
- Screen holds at 390px wide
