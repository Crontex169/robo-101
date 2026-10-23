# Implementation Plan: Lesson M.1, Vectors and Coordinate Frames

**Branch**: `003-lesson-m1-vectors-frames` | **Date**: 2026-10-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-lesson-m1-vectors-frames/spec.md`

## Summary

Write the first real lesson as `lessons/m1/` and build it to `lessons/m-1-vectors-and-frames.html`.
It is built from the sample lesson's parts:

- a new DOM-free shared engine, `lessons/shared/vec.js`, for 2D/3D vectors, frame changes and
  handedness;
- two labs with missions (arrows; one point in two frames);
- two small interactives (components and unit vector; a turnable 3D frame);
- a prose section with a static figure;
- a research thinking block, margin notes and the quiz.

Shared work this lesson forces:

- **Keyboard dragging.** A helper in `kit.js` (`HeroKit.keys`) moves scene handles with the
  arrow keys (FR-014). The sample lesson gets it too.
- **Fonts.** `kit.js` canvas labels lose the deleted Inter/JetBrains fonts.
- **Check fixture.** The check build publishes the real M.1 and moves the sample to M.2.
- **Publishing.** M.1 goes on the real published list once `node tools/check.js` passes.

## Technical Context

**Language/Version**: JavaScript ES2020 (browser and Node 22+), HTML/CSS, Python 3.10+ build

**Primary Dependencies**: none new. Uses `ui-core.js`, `kit.js`, `missions.js`, `quiz.js`,
`recall.js` and `glossary.js`. KaTeX renders formulas at build time

**Storage**: N/A (progress and theme in `localStorage`, as before)

**Testing**: `tools/lesson_m1.js` (Node engine asserts plus a headless browser run), called by
`tools/check.js`; the plain scan covers the new page

**Target Platform**: static page, `file://` and GitHub Pages, desktop and 390 px phones

**Project Type**: static website, one new lesson

**Performance Goals**: page under ~150 KB built; scenes redraw on input only (no idle animation
loop), the 3D view redraws on drag

**Constraints**: constitution I–VII. No 3D library (V). Every stated number checked (III).
Keyboard and touch on every handle (VI). Plain page (VII)

**Scale/Scope**: 1 lesson, 5 sections, 2 labs (5 missions + 2 free plays), 2 small interactives,
1 figure, 8 quiz questions, 3 warm-up questions, 8 glossary terms

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | How this plan complies | Status |
|---|---|---|
| I. From zero | Warm-up reviews school ideas; every term defined at first use and glossarised; formulas only in "Under the hood" | ✅ |
| II. Explain, then try | Lesson format kept; 2 labs (≤ 3), small interactives and prose chosen per idea; missions with live ✓/✗, bets, explanations, free play | ✅ |
| III. Correct, deterministic | `vec.js` has no DOM; `tools/lesson_m1.js` asserts every stated number (research R4 lists them); no randomness | ✅ |
| IV. Original content | Notation follows slides/Craig (a convention, not text); all prose, figures and exercises written fresh; Roberts and Paul cited, not quoted | ✅ |
| V. Plain stack | No new dependency; 3D view is ~60 lines of 2D canvas projection; reuses missions/quiz/recall/glossary | ✅ |
| VI. Every screen | `HeroKit.keys` for keyboard; touch via existing `HeroKit.drag`; 390 px and dark checked; scenes have aria-labels | ✅ |
| VII. Plain pages | Same markup and CSS as the sample; plain scan in the check | ✅ |
| Workflow | Own check script, joins `tools/check.js`; published only after it passes | ✅ |

Post-design re-check: no conflicts. Shared-module changes (`kit.js`) mean the sample's check
re-runs, as it already does inside `tools/check.js`.

## Project Structure

### Documentation (this feature)

```text
specs/003-lesson-m1-vectors-frames/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── vec-and-keys.md     # vec.js API and HeroKit.keys contract
└── tasks.md
```

### Source Code (repository root)

```text
lessons/
├── build.py                 # register 'm1' → m-1-vectors-and-frames.html
├── shared/
│   ├── vec.js               # NEW: DOM-free vectors and frames (browser + Node)
│   ├── kit.js               # + keys() helper; label fonts → system stack
│   └── glossary.json        # + 8 terms for lesson m1
├── m1/
│   ├── lesson.html          # NEW: the lesson
│   ├── m1.css               # NEW: small lesson styles (scene controls)
│   └── ui-m1.js             # NEW: scenes, missions, quiz
└── sample/ui-sample.js      # adopt HeroKit.keys for its handles
site/config.json             # + M.1 published (after the check passes)
tools/
├── lesson_m1.js             # NEW: engine asserts + browser run
├── check.js                 # run lesson_m1; home and glossary expectations updated
└── fixtures/config.check.json  # M.1 → real lesson, M.2 → sample (fixture only)
specs/001-site-foundation/contracts/lesson-source.md  # skeleton updated to the plain intro (002 left it stale)
```

**Structure Decision**: same lesson layout as the sample. `vec.js` is shared because Parts 2–5
reuse vectors and frames.

## Complexity Tracking

No violations.
