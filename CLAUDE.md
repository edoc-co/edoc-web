# CLAUDE.md

Frontend for **edoc**, a platform for learning to code built as a space exploration game. Read `PROJECT.md` for product context and `DESIGN.md` before touching any UI. `SPEC-encounter.md` is the shared contract with the backend repo (`edoc-api`).

## Stack

Next.js (App Router) · TypeScript · Tailwind · Zustand · CodeMirror 6 · Framer Motion · GSAP · Lenis · Rive · Howler · @use-gesture/react

## Layout

```
app/                    routes
components/
  cockpit/              struts, instrument bays, HUD chrome
  console/              editor, diagnostics — the calm register
  universe/             planet map, approach, landing
  surface/              planet scenes, module hotspots
  crew/                 lobby, duels, multiplayer
  companion/            robot, hints
  motion/               reusable interaction primitives
  profile/              pilot card
lib/
  runtime/              runTests() — mocked for now
  store/                Zustand slices
  audio/                Howler manager with global mute
  encounters/           content JSON + validation
styles/tokens.css       ALL colours, type, motion, clip-paths
content/                encounter + planet JSON
```

## Hard rules

- **No hardcoded hex, px font sizes, or durations outside `styles/tokens.css`.** Tailwind extends from those variables; never duplicate values in `tailwind.config.ts`.
- **No `border-radius` on hull chrome.** Use the `--clip-panel` / `--clip-btn` clip-paths.
- **The console register is sacred.** No animation, no glow within 24px, no parallax, no custom cursor, and **no sound** while the console has focus.
- **Animate `transform` and `opacity` only.** Layout properties stutter the editor mid-keystroke.
- **Console text buffer stays in local state**, never the Zustand store. Game state (integrity, shards, combo) goes in the store.
- **CodeMirror 6, never Monaco.**
- **No Three.js.** Depth comes from parallax layers and pre-rendered video.
- Every motion effect ships a `prefers-reduced-motion: reduce` variant in the same commit.
- Visible focus ring on every interactive element, both modes.
- All screens work at 390px and 200% zoom.
- **No licensed IP** in any asset, name, or reference.

## Runtime

`lib/runtime/runTests.ts` is **mocked** — resolves pass/fail after ~300ms against the `RunResult` shape in `SPEC-encounter.md`. Do not build real code execution. Do not change the interface without agreeing it with the backend and updating both copies of the spec.

## Content

Encounters and planets follow `SPEC-encounter.md` exactly. `npm run validate:content` must pass — it checks that test damage sums to hostile integrity, every encounter has a catch-all failure rule, hint skeletons contain blanks, and test counts are 3–8.

## Working style

- One slice at a time. Stop and report when done; don't roll into the next.
- Prefer editing existing files over creating new ones.
- No new dependencies without asking.
- No README, no summary docs, no comments explaining obvious code.
- If a request conflicts with `DESIGN.md` or `SPEC-encounter.md`, say so before proceeding.

## Copy

Sentence case. Active voice. Plain verbs — "Run code", not "Execute Submission". Nav reads as ship systems (Navigation, Systems, Crew, Hangar, Comms), not Learn/Practice/Build. Errors say what broke and what to do next; they never apologise. No emoji in the UI.
