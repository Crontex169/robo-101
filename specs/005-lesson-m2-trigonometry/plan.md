# Implementation Plan: Lesson M.2, Trigonometry for Robot Arms

**Branch**: `005-lesson-m2-trigonometry` | **Date**: 2026-10-23 | **Spec**: [spec.md](spec.md)

## Summary

Lesson key `m2`, output `lessons/m-2-trigonometry.html`. It reuses everything M.1 built:
`vec.js`, `HeroKit.drag/keys`, missions, quiz, recall, the research blocks and `planar-arm.js`
(fk, ik2).

- `vec.js` gains three DOM-free helpers: `polar(r, θ)`, `angle(v)` (atan2) and
  `cosRule(a, b, c)`, the angle opposite c, or `null` when no such triangle exists.
- The check fixture moves the sample lesson to M.3, so the check build publishes M.1, M.2 and
  the sample.
- `tools/check.js` derives its home-page and glossary expectations from the fixture and
  `glossary.json` instead of fixed counts.

## Technical Context

Same as spec 003: JavaScript ES2020, Python build, no new dependency; checks run headless
through CDP; Turkish UI text, English code and docs.

## Constitution Check

| Principle | How | Status |
|---|---|---|
| I. From zero | Warm-up on M.1; radians explained before use; formulas in "Perde arkası" | ✅ |
| II. Explain, then try | 2 labs (≤ 3), 2 small interactives, 1 prose section; missions with bets and explanations | ✅ |
| III. Correct | Every number in research R3 is asserted in `tools/lesson_m2.js` against `vec.js`/`planar-arm.js` | ✅ |
| IV. Original | Text and figures written fresh; Volder cited, not quoted | ✅ |
| V. Plain stack | No dependency; three small engine helpers | ✅ |
| VI. Every screen | Keys, touch, 390 px, dark | ✅ |
| VII. Plain pages | Same CSS and blocks; plain scan | ✅ |
| Language (v1.3.0) | Turkish page text, English code/docs, glossary with English terms, decimal point | ✅ |

## Project Structure

```text
lessons/m2/{lesson.html, m2.css, ui-m2.js}   NEW
lessons/shared/vec.js                         + polar, angle, cosRule
lessons/shared/glossary.json                  + 7 terms (l: "m2")
lessons/build.py                              register m2
tools/lesson_m2.js                            NEW
tools/check.js                                run lesson_m2; expectations derived from config + glossary
tools/fixtures/config.check.json              M.1, M.2 real; sample → M.3
site/config.json                              + M.2 (branch only until the owner approves)
```

## Complexity Tracking

None.
