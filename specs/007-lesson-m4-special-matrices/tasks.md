# Tasks: Lesson M.4, Special Matrices

Order: T001–T004 first (shared code, M.3 must still pass), then US1–US5 in order (one page,
one `ui-m4.js`), then T011–T012. No [P]: every story edits the same two files.

## Setup and foundation

- [X] T001 Move M.3's plane helpers (`view`, `line`, `arrow`, `arc`, `knob`, `label`, `axes`, `slider`, `t`, `fv`, `mat`, `pal`, `setOut`) and the F figure from `lessons/m3/ui-m3.js` into new `lessons/shared/plane.js`; move `.mat`, `.c1`, `.c2` from `lessons/m3/m3.css` to `lessons/shared/lab.css`; load `shared/plane.js` for `m3` in `lessons/build.py`; `node tools/lesson_m3.js` passes
- [X] T002 Add `dot`, `tr`, `det2`, `inv2` to `lessons/shared/vec.js` and document them in its header
- [X] T003 Register `m4` in `lessons/build.py` (output `m-4-special-matrices.html`; CSS lesson, lab, research, `m4/m4.css`; JS as M.3 plus `shared/plane.js`)
- [X] T004 Update `tools/fixtures/config.check.json` (M.1–M.4 real, sample → M.5)

## Lesson

- [X] T005 [US1] Write `lessons/m4/lesson.html`: intro, warm-up on M.3 (research.md R1), section 1 text with "Perde arkası" a·b = |a||b| cos φ, margin note; `Dot` interactive in `lessons/m4/ui-m4.js`
- [X] T006 [US2] Section 2 text (transpose, AᵀA as dot products, "Perde arkası" (AB)ᵀ = BᵀAᵀ); Lab 1 `Ortho` in `lessons/m4/ui-m4.js` with the snap rule and 3 missions + free play (research.md R2)
- [X] T007 [US3] Section 3 text and "Perde arkası" 2×2 inverse; `Inverse` interactive in `lessons/m4/ui-m4.js`
- [X] T008 [US4] Section 4 text; Lab 2 `Det` in `lessons/m4/ui-m4.js` with signed-area fill (`--serious-soft` when flipped), "ters var / ters yok" readout, 4 missions + free play
- [X] T009 [US5] Section 5 text and SVG figure (homogeneous example), research thinking block, Related papers cards (Möbius 1827, Denavit–Hartenberg 1955, research.md R4), quiz (8), wrap-up with conditional M.5 link, glossary entries in `lessons/shared/glossary.json` (research.md R5); `lessons/m4/m4.css`

## Check and publish

- [X] T010 `tools/lesson_m4.js`: Node asserts (research.md R3) plus a browser run (warm-up, missions incl. keyboard, both interactives, glossary, quiz, research, dark, 390 px; screenshots `shots/m4-*.png`); wire into `tools/check.js`
- [X] T011 Run `node tools/check.js`, review screenshots, add M.4 to `site/config.json`, run again
- [X] T012 `python tools/assemble.py dist` and open `dist/index.html` for the owner; owner reviews before merge and push
