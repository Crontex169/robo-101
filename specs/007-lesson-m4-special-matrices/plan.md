# Implementation Plan: Lesson M.4, Special Matrices

**Branch**: `007-lesson-m4-special-matrices` | **Date**: 2026-11-02 | **Spec**: [spec.md](spec.md)

## Summary

Lesson key `m4`, output `lessons/m-4-special-matrices.html` (the name M.3's wrap-up already
links to). It reuses M.1–M.3: `vec.js`, `HeroKit.drag/keys`, missions, quiz, recall, research
blocks, and M.3's plane helpers and F figure, which move to a shared file (research R6).

- `vec.js` gains four DOM-free one-liners: `dot(a, b)`, `tr(A)`, `det2(A)`, `inv2(A)` (null when
  |det| < 1e-9).
- `lessons/shared/plane.js` (new): the twelve plane helpers from `ui-m3.js` and the F figure.
  `ui-m3.js` drops its copies and loads the shared file; `.mat/.c1/.c2` move to `lab.css`.
- The check fixture moves the sample lesson to M.5, so the check build publishes M.1–M.4 and
  the sample.
- `tools/check.js` already derives its expectations from the fixture and `glossary.json`; it only
  gains the `lesson_m4.js` run.

## Technical Context

Same as spec 003: JavaScript ES2020, Python build, no new dependency; checks run headless
through CDP; Turkish UI text, English code and docs. No unknowns.

## Constitution Check

| Principle | How | Status |
|---|---|---|
| I. From zero | Warm-up on M.3; dot product taught before orthogonality; formulas in "Perde arkası" | ✅ |
| II. Explain, then try | 2 labs (≤ 3), 2 small interactives, 1 prose section; missions with bets and explanations | ✅ |
| III. Correct | Every number in research R3 is asserted in `tools/lesson_m4.js` against `vec.js` | ✅ |
| IV. Original | Text and figures written fresh; Möbius and Denavit–Hartenberg cited, not quoted | ✅ |
| V. Plain stack | No dependency; four one-line engine helpers; shared helpers moved, not rewritten | ✅ |
| VI. Every screen | Keys (column 2 by 0.1 with snapping in lab 1, tips by 0.5 in lab 2), touch, 390 px, dark | ✅ |
| VII. Plain pages | Same CSS and blocks; colour for column 1 / column 2, one extra (`--serious-soft`) for the flip only; plain scan | ✅ |
| Language (v1.3.0) | Turkish page text, English code/docs, glossary with English terms, decimal point | ✅ |

Post-design re-check: unchanged, all pass.

## Project Structure

```text
lessons/m4/{lesson.html, m4.css, ui-m4.js}   NEW
lessons/shared/plane.js                       NEW: plane helpers + F figure, from ui-m3.js
lessons/shared/vec.js                         + dot, tr, det2, inv2
lessons/shared/lab.css                        + .mat, .c1, .c2 (moved from m3.css)
lessons/m3/{ui-m3.js, m3.css}                 drop the moved code
lessons/shared/glossary.json                  + 8 terms (l: "m4")
lessons/build.py                              register m4; m3 and m4 load shared/plane.js
tools/lesson_m4.js                            NEW
tools/check.js                                run lesson_m4
tools/fixtures/config.check.json              M.1–M.4 real; sample → M.5
site/config.json                              + M.4 once the check passes
```

## Validation

`node tools/check.js` (runs `lesson_m3.js` and `lesson_m4.js` with the rest), then
`python tools/assemble.py dist` and open `dist/index.html` for the owner. Screenshots in
`shots/m4-*.png`.

## Complexity Tracking

None.
