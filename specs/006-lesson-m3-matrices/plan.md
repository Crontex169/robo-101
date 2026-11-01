# Implementation Plan: Lesson M.3, Matrices as Transformations

**Branch**: `006-lesson-m3-matrices` | **Date**: 2026-11-01 | **Spec**: [spec.md](spec.md)

## Summary

Lesson key `m3`, output `lessons/m-3-matrices-as-transformations.html`. It reuses M.1 and M.2:
`vec.js`, `HeroKit.drag/keys`, missions, quiz, recall, research blocks.

- `vec.js` gains four DOM-free helpers (`mv` and `mm` work for any size): `mv(A, v)` (matrix times
  vector), `mm(A, B)` (matrix product), `rot(th)` (2×2) and `rotZ(th)` (3×3). Matrices are
  arrays of rows. `num` already prints −0 as 0.
- The check fixture moves the sample lesson to M.4, so the check build publishes M.1–M.3 and
  the sample.
- `tools/check.js` already derives its expectations from the fixture and `glossary.json`; it
  only gains the `lesson_m3.js` run.

## Technical Context

Same as spec 003: JavaScript ES2020, Python build, no new dependency; checks run headless
through CDP; Turkish UI text, English code and docs.

## Constitution Check

| Principle | How | Status |
|---|---|---|
| I. From zero | Warm-up on M.2; the column reading comes before the row rule; formulas in "Perde arkası" | ✅ |
| II. Explain, then try | 2 labs (≤ 3), 1 small interactive, 2 prose sections; missions with bets and explanations | ✅ |
| III. Correct | Every number in research R3 is asserted in `tools/lesson_m3.js` against `vec.js` | ✅ |
| IV. Original | Text and figures written fresh; Cayley cited, not quoted | ✅ |
| V. Plain stack | No dependency; four small engine helpers | ✅ |
| VI. Every screen | Keys (column tips move 0.5 per arrow press), touch, 390 px, dark | ✅ |
| VII. Plain pages | Same CSS and blocks; colour only for column 1 / column 2; plain scan | ✅ |
| Language (v1.3.0) | Turkish page text, English code/docs, glossary with English terms, decimal point | ✅ |

## Project Structure

```text
lessons/m3/{lesson.html, m3.css, ui-m3.js}   NEW
lessons/shared/vec.js                         + mv, mm, rot, rotZ
lessons/shared/glossary.json                  + 7 terms (l: "m3")
lessons/build.py                              register m3
tools/lesson_m3.js                            NEW
tools/check.js                                run lesson_m3
tools/fixtures/config.check.json              M.1–M.3 real; sample → M.4
site/config.json                              + M.3 once the check passes
```

## Complexity Tracking

None.
