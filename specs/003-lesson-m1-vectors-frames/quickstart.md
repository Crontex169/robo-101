# Quickstart: validating lesson M.1

```bash
node tools/lesson_m1.js   # builds m1, asserts the engine numbers, plays the lesson headless
node tools/check.js       # whole site, including M.1, the sample (as M.2 in the check build) and the plain scan
```

Expected new lines in the check: engine numbers from research.md R4; warm-up 3 of 3; lab 1
missions 1–3; lab 2 missions 1–2 (the prediction (3, 4) is right); keyboard moves a handle and
completes lab 2 mission 2; 3D view flips to left-handed and back; 8 glossary tooltips; quiz
8 of 8; research block folded and then opened; dark theme; 390 px without horizontal scroll;
plain scan 0 offenders.

Manual: open `dist/lessons/m-1-vectors-and-frames.html` from disk. Work through it on a phone
width with touch emulation, then once with the keyboard only (Tab to a scene, arrows,
Enter to switch handles).

## Results (2026-10-23)

`node tools/lesson_m1.js`: OK, 28 checks. `node tools/check.js`: OK, 72 checks, with M.1 on the
real published list (the real glossary lists its 8 terms). The built page is 131 KB. Keyboard-only
runs completed lab 1 mission 3 and lab 2 mission 2. The owner's reading (SC-001, SC-006) is
still to do.
