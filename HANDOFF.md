# edoc — Handoff

Paste this first in a new session, with the other files attached.

---

## What edoc is

A platform for learning to code, built as a space exploration game. The interface is a spaceship cockpit. The galaxy map is the language selector — each planet is a programming language. You fly to a planet; the journey's obstacles are coding encounters; landing unlocks the planet's surface, where each natural feature is a module. A companion robot delivers hints. Multiplayer is ship duels and crew battles.

Full detail in `PROJECT.md`.

---

## Files

| File | Role |
|---|---|
| `PROJECT.md` | Product spec — audience, modes, journey, battles, certificates, technical decisions |
| `DESIGN.md` | Visual and interaction system — cockpit, tokens, motion, per-screen specs |
| `SPEC-encounter.md` | Data contract, shared with the backend repo. Neither side changes it alone |
| `CLAUDE.md` | Frontend repo conventions, auto-loaded by Claude Code |
| `edoc-cockpit-mockup.html` | Working concept mockup — open in a browser, move the mouse for parallax |

Two repos: `edoc-web` (frontend) and `edoc-api` (backend). Both hold a copy of `PROJECT.md` and `SPEC-encounter.md`.

---

## State of the build

Built so far in `edoc-web`, against an **older** dark-brutalist direction that has since been replaced:

- Design token system, HUD components, `/styleguide` route
- Encounter types, mocked `runTests()`, three Python encounters, content validator
- A working fight screen: CodeMirror editor, opponent with health bar, test output, pass/fail feedback, dev panel to force outcomes

**All of it needs retheming to the cockpit direction.** The logic and structure are sound; the visual layer is not. Nothing is lost — retheming is a token and chrome change, not a rebuild.

Backend has not started.

---

## What changed, and what is now dead

Superseded — ignore any earlier mention of these:

- The two-world "Forge / Grove" system. Deleted. There is one universe with two modes: **moon** (dark, default) and **sun** (light).
- "Monsters" and "boss frames" → **hostiles** (aliens, ships, hazards) in a cockpit.
- The swipeable hint card deck → the **companion robot** delivers hints.
- The "language roller-coaster" → the **universe map**.
- Three.js and real-time 3D → **2.5D parallax and pre-rendered video**. This is the key scoping decision.

---

## Non-negotiables

- **Loud hull, calm console.** The cockpit is cinematic; the editor is still and silent. No animation, glow, parallax, or sound while the console has focus.
- **Never gate practice.** Loot is gated; learning never is.
- **Damage comes from failing tests**, not syntax errors mid-keystroke.
- **All assets original.** No Marvel, Star Wars, or any licensed character, ship, or world — mood reference only.
- **Anti-cheat is Proctored-mode only.** Practice and Ranked stay completely open.
- **Planet features match the world type.** Ice worlds get geysers, gas giants get storm bands. Never apply Earth features to worlds that would not have them.

---

## Where to pick up

1. Retheme the existing build to the cockpit system in `DESIGN.md` — tokens first, then chrome, then the fight screen
2. Build the interaction primitives in `DESIGN.md` §8, starting with parallax depth and shared-element transitions
3. Universe map, then companion, then surface scenes
4. Multiplayer last on the frontend
5. Backend can start immediately and in parallel — it only needs `PROJECT.md` and `SPEC-encounter.md`

---

## Open questions

- Art direction for characters and the companion — needs an artist; Rive state machines, not static renders
- Ship exterior design — not yet defined
- Realistic timeline — the earlier six-month estimate assumed a website, not this. Needs re-scoping before it goes to any client
- Content authoring remains the critical path: ~150 encounters per language, 8–10 weeks each, and it does not compress by adding engineers
