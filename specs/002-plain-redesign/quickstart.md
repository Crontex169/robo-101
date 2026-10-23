# Quickstart: validating the plain redesign

## Prerequisites

Python 3.10+, Node 22+, Chrome or Edge installed (same as 001).

## Run

```bash
node tools/check.js
```

Expected: `OK: N checks`, with these new lines among them:

- `plain scan: index.html light/dark — 0 offenders` (same for 404, glossary, sample)
- `sample: 4 paper cards, every card has title link, authors, venue, year, takeaway`
- `sample: research thinking — answers and solution closed on load, open on click`
- `sample: margin note in the margin at 1280 px, inline below its paragraph at 390 px`
- `no text web fonts loaded`

All 001 checks (missions, quiz, warm-up, glossary, theme, 390 px) still pass.

## Look at it

Open `shots/home-light.png`, `shots/sample-light.png`, `shots/sample-dark.png` and
`shots/sample-phone.png` (written by the check), or open `dist-check/index.html` and
`dist-check/lessons/sample.html` from disk.

Manual checks:

1. Side by side with https://lena-voita.github.io/nlp_course.html: same kind of plainness
   (SC-002, owner's judgement).
2. Turn off JavaScript in DevTools, reload the sample: "More details", "Possible answers" and
   "What was actually done" still open; margin notes still visible.
3. Print preview of the sample: all fold-outs printed expanded.
4. Every paper link opens the right paper; citation fields match research.md R6.

## Results (2026-10-23)

`node tools/check.js`: OK, 41 checks (26 from 001 plus 8 plain scans and 7 block checks).

Built page sizes, before → after (SC-007):

| Page | Before | After |
|---|---|---|
| `lessons/sample.html` (check build, now with 4 paper cards and a research block) | 133 KB | 107 KB |
| `index.html` | 28 KB | 16 KB |
| `lessons/glossary.html` | 67 KB | 35 KB |
| `404.html` | 1.5 KB | 1.0 KB |

Text web fonts (6 woff2 files) are gone. `dist/` went from 0.7 MB to 0.4 MB.

Manual: print emulation shows every closed fold-out's content. The paper links resolve:
the ASME and IEEE DOIs redirect to the right articles; ASME and DTIC answer 403 to scripted
requests but open in a browser. The SC-002 side-by-side judgement is the owner's.
