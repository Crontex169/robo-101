# Research: Site Foundation

All decisions below come from reading the reference repo (`modern-robotics/`) end to end. There
were no open NEEDS CLARIFICATION items in the Technical Context; this file records the choices
made while mapping the reference onto our spec.

## 1. Keep the reference build pipeline as is

- **Decision**: Keep `lessons/build.py` (lesson sources → one self-contained HTML per lesson, CSS/JS
  inlined at `/*@@CSS@@*/` and `/*@@JS@@*/` markers, KaTeX rendered by `tools/katex_render.js`,
  glossary wrapping of first mentions) and `site/build.py` (placeholder substitution from
  `config.json`, sitemap, robots). Strip the parts tied to removed features: thanks/feedback
  injection, stats injection, Telegram channel, OG locale `ru_RU`.
- **Rationale**: it already meets FR-009 and FR-010 and is about 250 lines of plain Python with no
  dependencies. Rewriting it would buy nothing.
- **Alternatives considered**: a static-site generator (Eleventy, Astro). Rejected by Principle V,
  and it would also mean porting every shared module.

## 2. Publishing schedule

- **Decision**: Drop `site/published.py` and the dated "Saturday release" logic. An entry in
  `config.json → PUBLISHED` is either there (live) or not.
- **Rationale**: the reference uses dates to schedule releases ahead of time. We have no schedule,
  and the spec only asks for a single published list (FR-006).
- **Alternatives considered**: keeping the date field "for later". Rejected (YAGNI); it's easy to
  bring back if we ever want scheduled releases.

## 3. Program data location

- **Decision**: Keep the program as a `PARTS` array inside `site/index.src.html`, as the reference
  does, and keep the published list in `site/config.json`.
- **Rationale**: only the home page renders the program. A separate data file would add a load or
  build step for one consumer.
- **Alternatives considered**: `site/program.json`, read by both builds. Worth doing only if a
  second consumer appears (for example, a "next lesson" link generated at build time).

## 4. Shared modules: what to keep, move or extract

| Reference file | Decision |
|---|---|
| `lessons/l01/ui-core.js`, `lessons/l01/lesson.css` | Move to `lessons/shared/` (every lesson uses them; the `l01/` folder goes away) |
| `shared/kit.js`, `missions.js`, `cards.js`, `check.js`, `recall.js`, `progress.js`, `glossary.js`, `lab.css`, `check.css`, `recall.css`, `glossary.css` | Keep; translate user-visible strings to English |
| Quiz renderer (copied into every `ui-lXX.js` as `renderQuiz`) | Extract once into `shared/quiz.js` |
| `shared/arm-core.js`, `mpc-core.js`, `drive-*`, `kettle-*`, `actuator-core.js` | Drop. The sample lesson gets a small `shared/planar-arm.js` (n-link planar FK/IK) that later lessons will reuse for the 3R running example |
| `shared/thanks.*`, `feedback.*`, `stats.js` | Drop (FR-001) |
| `site/assets/hero/*` (Russian hero demos) | Drop; the home page gets a static hero for now |

- **Rationale**: Principle V says reuse first. The quiz extraction removes copy-paste that would
  otherwise grow with every lesson.

## 5. Finding a browser for checks on Windows

- **Decision**: In `tools/cdp.js`, replace the hardcoded macOS path with a `findBrowser()` that
  tries, in order:
  1. `CHROME_PATH` environment variable
  2. Chrome under `%ProgramFiles%`, `%ProgramFiles(x86)%` and `%LOCALAPPDATA%`
  3. Edge under the same locations
  4. the macOS Chrome path
  5. `google-chrome`, `chromium` or `chromium-browser` on `PATH`

  If none is found, it fails with a message that names `CHROME_PATH`.
- **Rationale**: FR-015. Edge is Chromium and speaks the same DevTools protocol. The `PATH`
  lookup covers the GitHub Actions Ubuntu runner, which has Chrome preinstalled.
- **Alternatives considered**: Puppeteer or Playwright. Rejected: they are heavy dependencies, and
  the reference's 100-line CDP client already does the job.
- **Note**: `cdp.js` uses the global `WebSocket`, which needs Node 22 or newer. The author's
  machine has Node 24; CI pins Node 22.

## 6. Check orchestration

- **Decision**: A single entry point `node tools/check.js`. It runs these steps in order and
  stops at the first failure with a non-zero exit code:
  1. `python tools/assemble.py dist` builds everything and copies only published pages into
     `dist/`. It fails if a published lesson wasn't built (FR-016).
  2. A static scan of `dist/` fails on any internal link that doesn't resolve, or on any
     character in U+0400–U+04FF (Cyrillic).
  3. A check build with `KW_CONFIG=tools/fixtures/config.check.json` publishes the sample lesson
     under a placeholder program slot, so the home page progress and the "available" state can
     be exercised.
  4. Headless browser runs over the check build: the sample lesson (warm-up, every mission,
     quiz, under-the-hood block, glossary tooltip, dark theme, 390 px), then the home page
     (coming-soon vs available, progress after visiting the sample, theme toggle), then the
     glossary page (empty state in the real build).

  Screenshots go to `shots/` (gitignored).
- **Rationale**: one command (FR-014), and the published build is never polluted by test
  fixtures.
- **Alternatives considered**: keeping the reference's per-lesson scripts only. We keep that
  pattern for real lessons (`tools/lessonXX.js`, called by `check.js`), but the foundation needs
  an orchestrator.

## 7. Lesson completion semantics

- **Decision**: Keep the reference rule: a lesson is "started" when opened and "completed" when the
  reader reaches the wrap-up section. Progress is stored in `localStorage` under `kw-progress`;
  the theme is stored under `kw-theme`.
- **Rationale**: it already works, and "completed" stays meaningful for prose-heavy lessons that
  have few missions. The spec scenario was updated to match.
- **Alternatives considered**: "completed when all missions are done". Rejected: it would require
  missions to report to progress, and some lessons have no lab.

## 8. Glossary with zero terms

- **Decision**: `lessons/shared/glossary.json` holds terms keyed by lesson. The glossary page
  lists only terms whose lesson is published and shows an empty-state message otherwise. The
  sample lesson's two demo terms therefore appear only in the check build.
- **Rationale**: FR-013 empty state plus FR-011 (the sample is never live) without special cases.

## 9. Fonts

- **Decision**: Keep the Inter and JetBrains Mono `latin`, `latin-ext` and `greek` subsets (Greek
  covers θ, α, ω in text) and the KaTeX fonts. Delete the `cyrillic`, `cyrillic-ext` and
  `vietnamese` files and their `@font-face` rules.
- **Rationale**: smaller payload, and nothing that could render Cyrillic.

## 10. GitHub Pages

- **Decision**: `.github/workflows/pages.yml` runs on every push to `main`:
  1. set up Python 3.12 and Node 22
  2. run `node tools/check.js`, which also produces `dist/`
  3. upload `dist/` with `actions/upload-pages-artifact`
  4. deploy with `actions/deploy-pages`
- **Rationale**: the constitution gate ("published only after the check passes") is enforced by
  CI, not by memory. The Pages artifact flow needs no `gh-pages` branch.
- **Alternatives considered**: committing `dist/` to a `gh-pages` branch. Rejected: build output
  would sit in git history, and it's a manual step.

## 11. Naming and English text

- **Decision**: The course name is "Kinematics Workshop" (working title). Prefixes change: CSS and
  JS globals and storage keys go from `mr-` to `kw-`, and environment variables from `MR_` to
  `KW_`. Every kept module is translated in full as part of the move, comments included,
  because lesson builds inline the JS and CSS into the published pages.
- **Rationale**: FR-002, FR-019, FR-020, and the Cyrillic scan in step 6 forces completeness.
