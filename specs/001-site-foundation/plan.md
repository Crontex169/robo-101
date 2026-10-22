# Implementation Plan: Site Foundation

**Branch**: `001-site-foundation` | **Date**: 2026-10-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-site-foundation/spec.md`

## Summary

Port the reference site's machinery (lesson build, shared lesson modules, home page, glossary,
progress, headless-browser checks) into a new repo at the project root, in English, with all
server-side pieces and Russian content removed. Add a sample lesson that uses every block of the
lesson format, a Windows-friendly check runner, and a GitHub Pages workflow that deploys only
when the check passes. Most of the work is moving, trimming and translating existing files. The
new code is small: a quiz module extracted from existing copies, a tiny planar-arm engine, a
browser finder, the check orchestrator and the sample lesson.

## Technical Context

**Language/Version**: Python 3.10+ (build), JavaScript ES2020 (browser and Node 22+), HTML5/CSS3

**Primary Dependencies**: none at runtime. At build time, a vendored KaTeX (`tools/vendor/katex`,
MIT) used from Node. Fonts: Inter and JetBrains Mono (OFL), KaTeX fonts (OFL)

**Storage**: source files in the repo. Learner progress and theme live in browser `localStorage`
only

**Testing**: Node assertion scripts and headless Chrome/Edge over the DevTools Protocol
(`tools/cdp.js`, no dependencies), orchestrated by `node tools/check.js`

**Target Platform**: static site, evergreen desktop and mobile browsers, works from `file://`.
Author machine: Windows 11. CI: GitHub Actions Ubuntu runner

**Project Type**: static website with a build step

**Performance Goals**: each lesson page under about 600 KB built. The full check finishes in under
2 minutes (SC-003). Scenes run at 60 fps on a mid-range phone while visible

**Constraints**: offline-capable, no external requests (SC-006), no Cyrillic in output (SC-004),
390 px minimum width, light and dark themes, reduced motion

**Scale/Scope**: about 35 pages at full program size (27 lessons, 7 checkpoints, home, glossary,
404). This feature ships the home page, glossary, 404 and an unpublished sample lesson

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | How this plan complies | Status |
|---|---|---|
| I. Written for someone starting from zero | Sample lesson demonstrates intuition-first text with formulas only in "Under the hood"; glossary tooltips work | ✅ |
| II. Explain first, then try | Sample lesson has one lab, one small interactive and one prose section, so it doesn't force a single template; missions keep prediction, live criteria, explanation and free play | ✅ |
| III. Correct and deterministic | `planar-arm.js` has no DOM and is required from Node by `tools/lesson_sample.js`, which asserts its numbers | ✅ |
| IV. Original content only | No Russian text survives (scan enforced); MIT notice kept for reused code; sample text written fresh | ✅ |
| V. Keep the stack plain | Reference pipeline kept; no framework or runtime dependency added; servers removed; quiz extracted instead of copied | ✅ |
| VI. Works on every screen | Check runs every page at 390 px and in dark mode; reduced-motion and keyboard paths come from the kept modules | ✅ |
| Scope and language: English | Every kept string and comment translated; Cyrillic scan in the check | ✅ |
| Workflow: check before publish | Pages workflow runs `node tools/check.js` before deploy | ✅ |

Post-design re-check: the data model, contracts and quickstart add no new principle conflicts.
There's one open note: the CI pins Node 22 because `tools/cdp.js` needs a global `WebSocket`.

## Project Structure

### Documentation (this feature)

```text
specs/001-site-foundation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── lesson-source.md
│   └── commands.md
└── tasks.md             # created by /speckit-tasks
```

### Source Code (repository root)

```text
.github/workflows/pages.yml     # check, then deploy dist/ to GitHub Pages
LICENSE                         # MIT, reference copyright notice kept alongside ours
README.md                       # what this is, how to build, check and add a lesson

site/
├── index.src.html              # home: hero, who it's for, how a lesson works, program (PARTS), FAQ
├── 404.src.html
├── build.py                    # placeholders from config.json, sitemap, robots (published.py removed)
├── config.json                 # SITE_URL, REPO, PUBLISHED
└── assets/
    ├── site.css, favicon.svg, apple-touch-icon.png, og.png, sprite.svg.html
    ├── fonts/                  # Inter + JetBrains Mono: latin, latin-ext, greek only
    └── katex/                  # katex.min.css + fonts

lessons/
├── build.py                    # LESSONS map; thanks/feedback/stats injection removed
├── shared/
│   ├── lesson.css, lab.css, check.css, recall.css, glossary.css   # lesson.css moved from l01/
│   ├── ui-core.js              # moved from l01/
│   ├── kit.js, missions.js, cards.js, check.js, recall.js, progress.js, glossary.js
│   ├── quiz.js                 # new: extracted renderQuiz
│   ├── planar-arm.js           # new: n-link planar FK/IK/Jacobian, no DOM
│   └── glossary.json           # terms; starts with the sample's two demo terms
├── gl/                         # glossary page
└── sample/                     # template lesson, never published
    ├── lesson.html, sample.css, ui-sample.js

tools/
├── cdp.js                      # findBrowser() added
├── katex_render.js
├── vendor/katex/
├── assemble.py                 # dist/ builder; release/thanks warnings removed; link + Cyrillic scan
├── check.js                    # new: orchestrator (research §6)
├── lesson_sample.js            # engine numbers + browser run for the sample
├── og_image.js                 # kept to regenerate og.png with the new name
└── fixtures/config.check.json  # publishes the sample as M.1 for the check build
```

Not carried over: `server/`, `proto/`, `lessons/l01`–`l18`, `c0`, `c1`, `site/about.src.html`,
`site/assets/hero/`, `site/assets/img/`, Russian-only tools (`release.py`, `stats*`, `thanks.js`,
`deploy.sh`, `s3sync.sh`, `cloud-setup.sh`, `cs_search.js`, `l02_numbers.js`, `l04_tune.js`,
`proto_operator.js`, `missions_demo.js`, the `lessonXX.js` scripts for removed lessons,
`glossary_check.js`, `recall_check.js`, `progress_check.js`, `site_*.js`).
`glossary_check.js`, `recall_check.js` and `progress_check.js` are folded into
`tools/check.js` if anything in them is still useful.

**Structure Decision**: a single static-site project at the repo root that mirrors the reference
layout (`site/`, `lessons/`, `tools/`), so the reference stays a readable guide when we port more
of it later. The reference repo stays in `modern-robotics/` (gitignored) and is copied from, never
modified.

## Complexity Tracking

No constitution violations to justify.
