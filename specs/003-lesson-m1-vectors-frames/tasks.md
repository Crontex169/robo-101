# Tasks: Lesson M.1, Vectors and Coordinate Frames

**Input**: `specs/003-lesson-m1-vectors-frames/` (spec, plan, research, data-model, contracts, quickstart)

**Tests**: required by constitution III and FR-017. Engine asserts are written with the engine.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [X] T001 Register lesson `m1` in `lessons/build.py`. Output `m-1-vectors-and-frames.html`; CSS = lesson, lab, research, `m1/m1.css`; JS = ui-core, kit, vec, missions, quiz, `m1/ui-m1.js`.
- [X] T002 [P] Create a `lessons/m1/lesson.html` skeleton: head, top bar with the toc, plain intro, recall section, five sections with ids from research.md R1, quiz, finale, footer and markers, with placeholder prose.

## Phase 2: Foundational

- [X] T003 [P] Write `lessons/shared/vec.js` per contracts/vec-and-keys.md (browser global plus `module.exports`)
- [X] T004 [P] Add `keys()` to `lessons/shared/kit.js` per the contract. Switch the `font()` label stacks to `system-ui`/`ui-monospace` (the text web fonts are gone).
- [X] T005 Create `tools/lesson_m1.js` with `nodeNumbers(check)` asserting every row of research.md R4, plus an empty `run()` that the next phases fill in; wire it into `tools/check.js`
- [X] T006 Update `tools/fixtures/config.check.json` (M.1 → m-1 lesson, M.2 → sample) and `tools/check.js`: the home page expects M.1 and M.2 as links, and the glossary counts change. Move the sample's progress visit to M.2.

**Checkpoint**: `node tools/check.js` builds; Node asserts pass.

---

## Phase 3: US1, vectors by moving arrows (P1)

- [X] T007 [US1] In `lessons/m1/ui-m1.js`: scene helpers (grid in units, arrow drawing, `toPx`/`toU`, snapping, palette) and lab 1 `Arrows`, with draggable handles (pointer through `HeroKit.drag`, keyboard through `HeroKit.keys`) and the three missions plus free play from research.md R2
- [X] T008 [US1] Write the intro, the warm-up JSON (research.md R4 warm-up numbers) and section 1 prose in `lessons/m1/lesson.html`, with a margin note and an "Under the hood" for component-wise addition
- [X] T009 [US1] Lab 1 checks in `tools/lesson_m1.js`: warm-up 3/3, each mission completed through the `window.__m1` hooks, and one mission completed through keyboard events

## Phase 4: US2, components, length and direction (P1)

- [X] T010 [US2] `Parts` interactive in `ui-m1.js`: one draggable arrow from the origin, legs drawn, the unit vector drawn, readouts, and an "undefined" message at zero
- [X] T011 [US2] Section 2 prose plus "Under the hood" (length and unit-vector formulas) in `lesson.html`
- [X] T012 [US2] Checks: the arrow set to (3, 4) reads length 5.0 and unit (0.6, 0.8); at (0, 0) it reads undefined

## Phase 5: US3, one point, two frames (P1)

- [X] T013 [US3] Section 3 prose and a static SVG figure (frame {A}, its origin, axes, point P and its position vector) in `lesson.html`
- [X] T014 [US3] Lab 2 `TwoFrames` in `ui-m1.js`: {A} fixed, {B} origin and P draggable, readouts for P in {A}, P in {B} and {B} in {A}, the two missions plus free play from research.md R2
- [X] T015 [US3] Section 4 prose, an "Under the hood" for the frame-change sum, a margin note, and the research thinking block (research.md R6) in `lesson.html`
- [X] T016 [US3] Checks: readout consistency after random drags (fixed seed), mission 1 prediction (3, 4) right, mission 2 completed with keyboard moves

## Phase 6: US4, right-handed frames (P2)

- [X] T017 [US4] `ThreeD` view in `ui-m1.js`: projection, depth-ordered axes, drag and keys to turn it, flip buttons, handedness label from `Vec.handedness`
- [X] T018 [US4] Section 5 prose and a margin note in `lesson.html`
- [X] T019 [US4] Checks: the label says right-handed by default, left-handed after one flip and right-handed after two

## Phase 7: US5, quiz, glossary, wrap-up (P2)

- [X] T020 [US5] Quiz (8 questions, at least 2 numeric frame-change ones) in `ui-m1.js`, with its numeric options asserted in `nodeNumbers`
- [X] T021 [US5] Glossary entries (research.md R8) in `lessons/shared/glossary.json`
- [X] T022 [US5] Wrap-up in `lesson.html`: takeaways, open questions, further reading (Lynch & Park ch. 2–3, Paul 1981), conditional link to M.2
- [X] T023 [US5] Checks: 8 glossary tooltips present, quiz 8/8, research fold-outs, dark theme, 390 px, screenshots `shots/m1-*.png`

## Phase 8: Polish

- [X] T024 [P] Adopt `HeroKit.keys` in `lessons/sample/ui-sample.js` (elbow and hand handles) and keep the sample check green
- [X] T025 [P] Update `specs/001-site-foundation/contracts/lesson-source.md` skeleton to the plain intro (from 002)
- [X] T026 Run `node tools/check.js`; review screenshots; then add M.1 to `site/config.json` PUBLISHED and run the check again

## Dependencies

Setup → Foundational → US1 → US2 → US3 → US4 → US5 → Polish. Every story touches
`lesson.html`, `ui-m1.js` and `lesson_m1.js`, so they run in order. T003, T004 and T002 can run
in parallel.
