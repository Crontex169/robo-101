# Implementation Plan: Plain Redesign and Research Blocks

**Branch**: `002-plain-redesign` | **Date**: 2026-10-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-plain-redesign/spec.md`

## Summary

Replace the landing-page look with a plain, document-like one (Principle VII) and add three
lesson blocks: Related papers, Research thinking and margin notes. The two shared stylesheets
(`lessons/shared/lesson.css`, `site/assets/site.css`) are rewritten from scratch. About two thirds
of `lesson.css` is still unused CSS from the reference site (arena, timeline, metro, spectrum,
bins), and it goes in the same pass. The page sources lose their eyebrow labels, chips, hero
gradient and card wrappers. Text web fonts go away. The new blocks are plain HTML built on native
`<details>`, so they work without scripts, styled by a new `lessons/shared/research.css`. The
sample lesson gets four verified paper cards, one research thinking block and two margin notes.
The check gains a decoration scan and block checks.

## Technical Context

**Language/Version**: Python 3.10+ (build), JavaScript ES2020 (browser, Node 22+), HTML5/CSS3

**Primary Dependencies**: none at runtime. Vendored KaTeX at build time (its math fonts stay).
Inter and JetBrains Mono are removed

**Storage**: N/A (theme and progress stay in `localStorage` as before)

**Testing**: `node tools/check.js` (headless Chrome/Edge over CDP, `tools/cdp.js`), extended with
`tools/plain_scan.js` (decoration scan) and new block checks in `tools/lesson_sample.js`

**Target Platform**: static site on GitHub Pages and `file://`, evergreen desktop and mobile
browsers

**Project Type**: static website with a build step

**Performance Goals**: built pages no more than 10 % heavier than before, excluding new block
text (SC-007). Dropping the fonts and the unused CSS should make them lighter

**Constraints**: offline, no external requests, 390 px minimum width, light and dark, reduced
motion, fold-outs work without JS and print expanded

**Scale/Scope**: 4 pages restyled (home, 404, glossary, sample lesson), 3 new block types, about
1 300 lines of CSS replaced by about 450

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | How this plan complies | Status |
|---|---|---|
| I. Written for someone starting from zero | Paper takeaways and research context are written for beginners; "More details" holds the heavier part | ✅ |
| II. Explain first, then try | Lesson structure unchanged (intro, warm-up, sections, quiz, wrap-up); Research thinking asks for a guess before the reveal, like a mission prediction | ✅ |
| III. Correct and deterministic | No engine change; existing Node number checks keep running. Citations verified against primary records (research.md R6) | ✅ |
| IV. Original content only | Summaries written fresh; Voita's layout, icons and text not copied; icons drawn for this project | ✅ |
| V. Keep the stack plain | No dependency added, fonts removed, native `<details>` instead of a JS widget, dead CSS deleted | ✅ |
| VI. Works on every screen | Margin notes go inline under 1 200 px; 390 px and dark checks extended to the new blocks | ✅ |
| VII. Plain pages | The whole feature; enforced by `tools/plain_scan.js` on every built page | ✅ |
| Workflow: check before publish | New checks join `node tools/check.js`, which gates the Pages deploy | ✅ |

Post-design re-check: data model, contracts and quickstart add no conflicts. One deliberate
exception, recorded in research.md R3: interactive controls (sliders, quiz options, mission
buttons) keep a small corner radius and focus ring, because they are controls, not content
decoration.

## Project Structure

### Documentation (this feature)

```text
specs/002-plain-redesign/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── lesson-blocks.md   # markup contract for paper card, research thinking, margin note
└── tasks.md               # created by /speckit-tasks
```

### Source Code (repository root)

```text
lessons/
├── build.py                  # add shared/research.css to every lesson's CSS list; print helper JS
├── shared/
│   ├── lesson.css            # REWRITTEN: plain tokens, typography, sections, labs, quiz, warm-up
│   ├── research.css          # NEW: paper cards, research thinking, margin notes, block icons
│   ├── lab.css               # restyled: thin borders, no shadows
│   ├── recall.css, check.css, glossary.css   # restyled to match
│   └── ui-core.js            # beforeprint: open all <details>
├── sample/lesson.html        # plain header and sections; new blocks with real papers
└── gl/lesson.html, gl/gl.css # plain glossary
site/
├── index.src.html            # REWRITTEN as a plain document
├── 404.src.html              # plain
└── assets/
    ├── site.css              # REWRITTEN to match lesson.css tokens
    ├── fonts/                # DELETED (Inter, JetBrains Mono)
    └── og.png                # regenerated in the plain style
tools/
├── check.js                  # runs plain_scan on every page
├── plain_scan.js             # NEW: banned-decoration scan in the browser
├── lesson_sample.js          # new block checks
└── og_image.js               # system fonts, plain card
README.md                     # assets line: no text fonts
```

**Structure Decision**: same single static-site layout as 001. One new stylesheet for the blocks
so lessons that don't use them stay small to read; it is still inlined into every lesson by
`build.py`, because a lesson must stay one self-contained file.

## Complexity Tracking

No violations.
