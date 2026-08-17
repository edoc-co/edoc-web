# edoc — Worlds

Layers on top of `DESIGN.md`. That document defines what is **universal** — the two registers, motion principles, performance budget, accessibility floor. This document defines what **differs between the two art directions**.

Read DESIGN.md first. Anything not listed here as world-specific is shared and must be identical across both worlds.

---

## 1. The model

Two independent axes:

**World** — the art direction. Defines geometry, typography, motion character, assets, fiction, and colour family. The user picks one and it changes how edoc *feels*.

**Mode** — luminance only. Light or dark within the chosen world.

```
data-world="forge" | "grove"
data-mode="dark" | "light"
```

Four token sets. Two identities. **One game engine underneath.**

Names are placeholders — rename freely, but keep them one word and evocative rather than descriptive.

---

## 2. World A — FORGE

Brutalist, high-contrast, kinetic. Valorant discipline, cyberpunk glow, Hot Wheels energy. This is the current build and the default.

### Tokens

**forge / dark**
```css
--void:#12101C  --panel:#1A1728  --raised:#241F35
--line:#332B4A  --line-hi:#4A3F6B
--text-hi:#F0EAE2  --text-mid:#A79FB8  --text-lo:#6E6684
--pass:#4ADE80  --fail:#FF5C6A  --gold:#F0B429  --cyan:#22D3EE
```

**forge / light**
```css
--void:#F5F1E8  --panel:#FDFBF6  --raised:#EBE4D6
--line:#D8CFBE  --line-hi:#BFB39C
--text-hi:#1C1828  --text-mid:#55506A  --text-lo:#857E99
--pass:#15803D  --fail:#C62828  --gold:#B07D0A  --cyan:#0E7490
```

### Identity
- **Geometry** — clipped corners, no radius. `--clip-panel` 14px, `--clip-btn` 8px, one diagonal direction. Hairlines 1px. Corner brackets on the active panel.
- **Display type** — Archivo, wdth + wght axes, uppercase, tight tracking
- **Motion** — decisive. `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`. Fast, snappy, no overshoot except loot.
- **Ambient motion** — forbidden except the opponent idle loop and the ticker
- **Glow** — allowed in dark mode, off in light
- **Texture** — optional grain, max 3%
- **Sound** — mechanical: clicks, impacts, synth stabs

### Fiction
You **fight**. Opponents are monsters and bosses with names like *The Loop King*. Their meter is **HP, draining toward zero**. Failure is a counter-attack. Victory shatters the frame.

---

## 3. World B — GROVE

Warm, hand-made, alive. Ghibli-adjacent: meadows, dusk light, small creatures, growing things. Cute without being childish — the target reader is 16+, not 6.

### Tokens

**grove / dark** — twilight garden
```css
--void:#1B2432  --panel:#24303F  --raised:#2F3D4E
--line:#3E4F63  --line-hi:#55697F
--text-hi:#F5F0E6  --text-mid:#B4C2CE  --text-lo:#7A8B9C
--pass:#7DD87D  --fail:#E88B8B  --gold:#FFD98A  --cyan:#8DD9E8
```

**grove / light** — daylight meadow
```css
--void:#FBF7EE  --panel:#FFFDF8  --raised:#F2EBDC
--line:#DFD5C2  --line-hi:#C4B79E
--text-hi:#2E3A2E  --text-mid:#5C6B5C  --text-lo:#8A9A8A
--pass:#3F8F4F  --fail:#C4707A  --gold:#C99A2E  --cyan:#4A9CB0
```

Grove's `--fail` is a soft coral, never an alarm red. Failure here is gentle.

### Identity
- **Geometry** — rounded and organic. Radius 16px on panels, 12px on buttons, 20px on cards. **No clip-paths anywhere.** Soft shadows permitted (`0 4px 24px rgba(0,0,0,0.08)` in light, deeper in dark). No corner brackets — the active panel is marked by a soft accent glow or a 2px accent border instead.
- **Display type** — Fraunces, using its `SOFT` and `WONK` axes. Sentence case, not uppercase. Relaxed tracking.
- **UI type** — Nunito
- **Motion** — gentle. `--ease-out: cubic-bezier(0.34, 1.1, 0.64, 1)`, durations ~1.4× Forge's. Slight overshoot is welcome.
- **Ambient motion** — permitted and encouraged: drifting leaves or petals, slow light shifts, creature idle breathing. **Never within 100px of the editor pane** — the workspace register from DESIGN.md §2 still holds absolutely.
- **Glow** — soft bloom rather than hard neon
- **Texture** — subtle paper grain, watercolour edges on large panels
- **Sound** — organic: wooden knocks, chimes, birdsong, soft strings

### Fiction
You **tend**. Opponents are creatures, spirits, and overgrown things with names like *The Tangled Vine*. Their meter is **Bloom, filling toward full**. Failure is the creature drooping and the light dimming. Victory is a bloom, petals lifting, the creature freed.

---

## 4. One engine, two fictions

The game logic is identical. Only presentation differs.

| Engine concept | Forge | Grove |
|---|---|---|
| Opponent meter | HP, drains 100 → 0 | Bloom, fills 0 → 100 |
| Passing test | Damage dealt | Growth added |
| Failing test | Counter-attack, HP loss | Creature droops, light dims |
| Player meter | HP | Spirit |
| Defeat | Defeated, rematch | Wilted, try again |
| Victory | Frame shatters, screen shake | Bloom bursts, petals rise, light warms |
| Loot | Chest, gold burst | Seed pod opening, fireflies |

**Grove's inverted meter is one derived value, not a second state machine:**

```ts
const displayValue = world === 'grove' ? maxHp - currentHp : currentHp;
```

Nothing else about combat state changes. Do not fork the fight logic.

---

## 5. What must never differ

These are shared across both worlds. Changing them per world is a bug.

- **Code typeface** — JetBrains Mono in the editor, always. Legibility is not an aesthetic decision.
- **Telemetry typeface** — IBM Plex Mono, always.
- **`--pass` and `--fail` semantics** — hue varies per world, meaning never does. Green means a test passed. Nothing else, ever.
- **Role separation** — accent = structure, gold = loot, cyan = social.
- **The two registers** (DESIGN.md §2). The editor pane and test output are calm in *both* worlds. Grove's ambient motion stops at the workspace boundary.
- **Encounter data.** Same JSON, same tests, same `failureMap`, same difficulty. Worlds are a skin, never a difficulty or content fork.
- **Accessibility floor** and **performance budget** (DESIGN.md §11, §12).
- **Language accents.** Same hues in both worlds; only the light/dark variants differ.

---

## 6. Encounter data implications

`SPEC-encounter.md` needs one addition. The `Monster` type becomes `Opponent`, with per-world presentation:

```ts
interface Opponent {
  id: string;
  hp: number;
  attacks: Attack[];
  worlds: {
    forge: { name: string; sprite: string; attackMessages: Record<string, string> };
    grove: { name: string; sprite: string; attackMessages: Record<string, string> };
  };
}
```

Every opponent needs a name and a sprite in both worlds. `hp`, `attacks[].damage`, `tests`, and `failureMap` stay shared — mechanics never fork.

**This is a contract change. It must be agreed with the backend before either side implements it.**

---

## 7. Switching behaviour

- World and mode are both persisted per user and settable from the HUD header and settings.
- **Default world is Forge; default mode is dark.**
- Ask the user to choose a world once, on first run, with a visual side-by-side. Never bury it in settings.
- Switching worlds mid-session is allowed and animates: a 600ms crossfade with the accent flood, not a hard swap.
- Switching worlds **never** alters progress, points, mastery, or certificates.

---

## 8. Build order

1. Refactor tokens to the `data-world` × `data-mode` matrix; keep Forge working exactly as it is now
2. Add per-world geometry and motion profiles as token sets, so components read tokens rather than branching on world
3. Grove tokens, type, geometry, motion
4. Grove fiction layer: meter inversion, labels, messages
5. Grove assets (Rive creature set, sounds) — the long pole, needs an artist
6. First-run world picker

**Components should almost never branch on `world`.** If a component contains `if (world === 'grove')` for anything other than the meter inversion or a label, the difference belongs in tokens instead.
