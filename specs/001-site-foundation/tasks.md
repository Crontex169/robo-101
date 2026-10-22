---
description: "Task list for 001-site-foundation"
---

# Tasks: Site Foundation

**Input**: Design documents from `specs/001-site-foundation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: The spec asks for checks (User Story 3) and the constitution requires one check script
per lesson, so check-script tasks are included. They are browser and Node assertion scripts, not
a unit-test suite.

**Organization**: Tasks are grouped by user story so each story can be built and verified on its
own.

**Source of truth for copying**: `modern-robotics/` (gitignored reference). Copy files from it;
never edit it. Every copied file is translated to English in full (comments included) in the
same task that copies it, because the Cyrillic scan covers everything that reaches the built
pages.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: the user story the task belongs to (US1–US5)

## Path Conventions

This is a single static-site project at the repo root, with `site/`, `lessons/` and `tools/` as in
plan.md.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: repository skeleton, license and the files every later task copies into.

- [X] T001 Create the directories `site/assets/`, `lessons/shared/`, `lessons/gl/`, `lessons/sample/`, `tools/vendor/`, `tools/fixtures/` and `.github/workflows/` at the repo root, and add `dist/`, `shots/`, `site/*.html`, `site/lessons/`, `site/sitemap.xml`, `site/robots.txt` and `site/assets/hero/` to `.gitignore`
- [X] T002 [P] Create `LICENSE` (MIT), keeping the reference copyright line from `modern-robotics/LICENSE` and adding ours below it
- [X] T003 [P] Copy `modern-robotics/tools/vendor/katex/` to `tools/vendor/katex/` unchanged (it is MIT, and its LICENSE file comes along)
- [X] T004 [P] Copy `modern-robotics/site/assets/katex/` to `site/assets/katex/` unchanged
- [X] T005 [P] Copy only the `latin`, `latin-ext` and `greek` Inter and JetBrains Mono `.woff2` files from `modern-robotics/site/assets/fonts/` to `site/assets/fonts/`, and copy `fonts.css` with the `@font-face` rules for cyrillic, cyrillic-ext and vietnamese removed (research §9)
- [X] T006 [P] Copy `favicon.svg`, `apple-touch-icon.png` and `sprite.svg.html` from `modern-robotics/site/assets/` to `site/assets/`, removing any Telegram/LinkedIn icons that the new pages won't use

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: the build pipeline and shared lesson modules that every story depends on.

**⚠️ CRITICAL**: no user story work can begin until this phase is complete.

- [X] T007 Create `site/config.json` with `SITE_URL` (GitHub Pages URL placeholder, `https://<user>.github.io/<repo>`), `REPO`, and an empty `PUBLISHED` array; no CHANNEL, LINKEDIN, THANKS_API or STATS_API keys
- [X] T008 Port `modern-robotics/site/build.py` to `site/build.py`:
  - drop the `published.py` import, so the date logic goes and `PUBLISHED` is used as is
  - read the config from the `KW_CONFIG` environment variable, defaulting to `site/config.json`
  - copy `lessons/shared/kit.js` only
  - stop copying thanks/stats files
  - fail if a `PUBLISHED` `n` isn't in the program (parse the `PARTS` ns out of `index.src.html`)
  - translate all messages and comments
- [X] T009 Port `modern-robotics/lessons/build.py` to `lessons/build.py`:
  - empty the `LESSONS` map down to `gl` and `sample`
  - read the config from `KW_CONFIG`
  - drop the `published` import and use `PUBLISHED` names directly for `<!--if:-->` blocks
  - remove `FEEDBACK`, `THANKS`, `add_thanks`, `issue_url` and the stats injection (still inject `progress.js`, `recall.js` and `glossary.js`)
  - `add_og`: site name "Kinematics Workshop", `og:locale` `en_US`
  - glossary: drop the `en` field, and fail when a term's `l` or `sec` is unknown
  - translate all strings and comments
- [X] T010 [P] Copy `modern-robotics/tools/katex_render.js` to `tools/katex_render.js` and translate its comments and error messages
- [X] T011 [P] Move `modern-robotics/lessons/l01/lesson.css` to `lessons/shared/lesson.css`, deleting the Ada-specific rules (`.ada-*`) and translating comments
- [X] T012 [P] Move `modern-robotics/lessons/l01/ui-core.js` to `lessons/shared/ui-core.js`, rename the theme storage key to `kw-theme`, and translate everything
- [X] T013 [P] Copy `kit.js`, `missions.js`, `cards.js`, `lab.css` from `modern-robotics/lessons/shared/` to `lessons/shared/`, translating every user-visible string (e.g. "Начать заново" → "Start over", "Следующая миссия" → "Next mission") and every comment
- [X] T014 [P] Copy `recall.js`, `recall.css`, `progress.js` from `modern-robotics/lessons/shared/` to `lessons/shared/`, renaming the storage key `mr-progress` to `kw-progress` and translating everything
- [X] T015 [P] Copy `glossary.js` and `glossary.css` from `modern-robotics/lessons/shared/` to `lessons/shared/` and translate them; create `lessons/shared/glossary.json` as `[]`
- [X] T016 [P] Copy `check.js` and `check.css` from `modern-robotics/lessons/shared/` to `lessons/shared/` (the part-checkpoint engine, used by future checkpoint pages), removing the anonymous-stats event code and translating everything
- [X] T017 Create `lessons/shared/quiz.js` by extracting `renderQuiz` from `modern-robotics/lessons/l03/ui-l03.js`. It exposes `window.Quiz = { render(boxSel, questions, scoreSel) }`, where each question is `{ q, o, a, e }`, and shows right/wrong and the explanation per answer, plus "Score: X of N" in `scoreSel`. Strings in English
- [X] T018 Create `lessons/shared/planar-arm.js`: a DOM-free n-link planar arm with
  - `fk(lengths, angles) → { joints: [[x,y]…], tip: [x,y], phi }`
  - `ik2(L1, L2, x, y) → [ [θ1,θ2] … ]` (0, 1 or 2 solutions)
  - `jacobian(lengths, angles) → 2×n`

  It is exported for both Node and the browser (contracts/lesson-source.md §Engines)
- [X] T019 Run `python lessons/build.py all` and `python site/build.py` once the US1/US2 sources exist; until then, check that both scripts start and fail with a clear "no such lesson/source" message rather than a traceback

**Checkpoint**: the build scripts run and the shared modules are in place, so story work can
start.

---

## Phase 3: User Story 1 - Visitor understands the course from the home page (Priority: P1) 🎯 MVP

**Goal**: an English home page with the course intro, who it's for, how a lesson works, and the
full seven-part program. Unpublished entries show "Coming soon"; progress and theme work.

**Independent Test**: `python site/build.py`, then open `site/index.html` from disk. All seven
parts and their lessons and checkpoints are listed, none of them clickable. Adding one entry to
`PUBLISHED` and rebuilding makes exactly that entry a link. The theme toggle persists across
reloads.

- [X] T020 [US1] Create `site/index.src.html` from `modern-robotics/site/index.src.html`:
  - keep the page skeleton, top bar, theme bootstrap script, the "how a lesson works" cards, the program renderer and the progress/"continue" logic
  - remove the hero demos, the author section, the "who is this for" Russian content, the FAQ content, the thanks button and the stats script
  - rename storage keys to `kw-*`
- [X] T021 [US1] Write the English home-page copy in `site/index.src.html`: a hero (course name "Kinematics Workshop", a one-paragraph promise for learners starting from zero, a "Start with M.1" button), a "Who is this for" block, "How a lesson works" (read first, then try it, under-the-hood formulas, check yourself), and three short FAQ entries (prerequisites, time per lesson, is it free)
- [X] T022 [US1] Replace the `PARTS` array in `site/index.src.html` with the program from `specs/001-site-foundation/data-model.md` (parts M, F, 1–5; each ends with a `'check'` checkpoint entry `CPx`), and make the program renderer show "Coming soon" (not linked) for entries missing from `READY`
- [X] T023 [P] [US1] Create `site/404.src.html` in English from `modern-robotics/site/404.src.html`, with a link back to the home page
- [X] T024 [P] [US1] Port `modern-robotics/site/assets/site.css` to `site/assets/site.css`, deleting rules for removed sections (author, hero demos, thanks) and translating comments
- [X] T025 [P] [US1] Port `modern-robotics/tools/og_image.js` to `tools/og_image.js` with the new course name and English tagline, and generate `site/assets/og.png`
- [X] T026 [US1] Build with `python site/build.py` and verify the Independent Test above by hand (light/dark, 390 px in browser dev tools)

**Checkpoint**: the home page is complete and usable on its own.

---

## Phase 4: User Story 2 - Author starts a new lesson from a working template (Priority: P1)

**Goal**: an unpublished sample lesson that uses every block of the lesson format, so it can be
copied to start any real lesson.

**Independent Test**: `python lessons/build.py sample`, then open `site/lessons/sample.html` from
disk. Go through the warm-up, all lab missions (one of them with a prediction), the small
interactive, the "Under the hood" block (formula already typeset, no KaTeX script in the source),
a glossary tooltip and the quiz.

- [X] T027 [P] [US2] Add two demo terms (`forward-kinematics`, `workspace`) to `lessons/shared/glossary.json` with `"l": "sample"` and `sec` set to the sample's section ids
- [X] T028 [US2] Create `lessons/sample/lesson.html` following contracts/lesson-source.md, in English, with these sections:
  - a hero with time, lab and mission counts
  - `#recall` with three placeholder questions
  - `#arm`: a lab where the reader drags a 2-link planar arm to reach a target
  - `#reach`: a small interactive with a slider and no missions, showing the reachable ring
  - `#why`: prose with an "Under the hood" `<details class="deep">` containing the 2R forward-kinematics formulas in `\[ … \]`
  - `#quiz`
  - `#finale` with takeaways, an open question, further reading and a placeholder "next lesson" link wrapped in `<!--if:…-->`
- [X] T029 [P] [US2] Create `lessons/sample/sample.css` with only the layout the sample needs beyond `shared/lesson.css` and `shared/lab.css`
- [X] T030 [US2] Create `lessons/sample/ui-sample.js`. The lab scene uses `PlanarArm.fk`, `HeroKit.fit` and `HeroKit.drag`. The missions run through `Missions.mount`:
  1. "Touch the target" (live criterion: tip within 3 cm)
  2. "Predict, then check" (bet: does the tip move up or down when θ₂ grows from the given pose?)
  3. "Free play" (`final`)

  The small interactive draws the reachable ring for the slider's L₂. The quiz has 8 questions through `Quiz.render`. All text is in English and it respects `prefers-reduced-motion`
- [X] T031 [US2] Register `sample` in the `LESSONS` map in `lessons/build.py` (output `sample.html`, CSS: `shared/lesson.css`, `shared/lab.css`, `sample/sample.css`; JS: `shared/ui-core.js`, `shared/kit.js`, `shared/planar-arm.js`, `shared/missions.js`, `shared/quiz.js`, `sample/ui-sample.js`)
- [X] T032 [US2] Build with `python lessons/build.py sample` and verify the Independent Test above by hand

**Checkpoint**: the sample lesson works and can be copied to start a real lesson.

---

## Phase 5: User Story 3 - One command checks everything before publishing (Priority: P2)

**Goal**: `node tools/check.js` builds everything, scans the output, and plays the home page,
the sample lesson and the glossary page in headless Chrome or Edge on Windows.

**Independent Test**: on Windows, `node tools/check.js` ends with `OK: N checks`. Each negative
check in quickstart.md §5 makes it fail on the named step.

- [X] T033 [US3] Port `modern-robotics/tools/cdp.js` to `tools/cdp.js`:
  - replace the `CHROME` constant with `findBrowser()`, which tries `CHROME_PATH`, then Chrome and Edge under `%ProgramFiles%`, `%ProgramFiles(x86)%` and `%LOCALAPPDATA%`, then the macOS path, then `google-chrome`, `chromium` and `chromium-browser` on `PATH` (research §5)
  - throw `No Chromium browser found; set CHROME_PATH` when nothing is found
  - translate all comments and messages
- [X] T034 [P] [US3] Create `tools/fixtures/config.check.json`, a copy of `site/config.json` whose `PUBLISHED` has `{ "n": "M.1", "file": "lessons/sample.html" }` and `{ "n": "G", "file": "lessons/glossary.html" }`
- [X] T035 [US3] Port `modern-robotics/tools/assemble.py` to `tools/assemble.py`:
  - honour `KW_CONFIG`
  - copy `index.html`, `404.html`, `robots.txt`, `sitemap.xml`, `assets/` and the published lessons only
  - remove the thanks warning and the release logic
  - after copying, fail on any internal `href`/`src` in `dist/` that doesn't resolve to a file in `dist/`
  - fail on any character U+0400–U+04FF in a `dist/` text file (`.html`, `.css`, `.js`, `.json`, `.xml`, `.txt`)
- [X] T036 [US3] Create `tools/lesson_sample.js`:
  - Node part: assert the `PlanarArm` numbers that the sample text states (e.g. the reach radii for L₁ = 0.5, L₂ = 0.4: 0.9 m outer and 0.1 m inner, and two IK solutions for an interior target)
  - browser part, through `tools/cdp.js`: answer the warm-up; complete mission 1 by setting angles through the lab's exposed test hook; make the prediction and complete mission 2; reach free play; open "Under the hood" and assert there is a `.katex` element and no KaTeX `<script>`; hover a glossary term and assert the tooltip appears; answer the quiz and assert "Score: 8 of 8"
  - then dark theme and 390 px with no horizontal overflow, with screenshots to `shots/sample-*.png`
- [X] T037 [US3] Expose a test hook in `lessons/sample/ui-sample.js` (`window.__sample = { setAngles(a1, a2), state() }`) used only by `tools/lesson_sample.js`
- [X] T038 [US3] Create `tools/check.js`, the orchestrator (research §6):
  1. run `python tools/assemble.py dist` with the real config
  2. build the check variant into `dist-check/` with `KW_CONFIG=tools/fixtures/config.check.json`
  3. run `tools/lesson_sample.js` against `dist-check/lessons/sample.html`
  4. open `dist-check/index.html` in the same browser profile, and assert that M.1 is a link marked "started" or "completed", that other entries say "Coming soon", and that the theme toggle persists after a reload
  5. open the glossary page from the real `dist/` and assert the empty state
  6. check that every page has no horizontal overflow at 390 px

  Print `✓`/`✗` per step and `OK: N checks` or `FAILED: k of N checks`, and exit non-zero on failure. Add `dist-check/` to `.gitignore`
- [X] T039 [US3] Run `node tools/check.js` on Windows until it passes, then run each negative check from quickstart.md §5 and confirm it fails on the named step

**Checkpoint**: one command proves the site is ready to publish.

---

## Phase 6: User Story 4 - The site is published on GitHub Pages (Priority: P2)

**Goal**: every push to `main` runs the check and, only if it passes, deploys `dist/` to GitHub
Pages.

**Independent Test**: after a push to `main`, the "Pages" workflow is green and the live URL shows
the same home page as `dist/index.html`.

- [X] T040 [US4] Create `.github/workflows/pages.yml`:
  - runs on push to `main` and on `workflow_dispatch`
  - permissions: `pages: write`, `id-token: write`, `contents: read`
  - build job: `actions/checkout`, `actions/setup-python` (3.12), `actions/setup-node` (22), `node tools/check.js`, `actions/upload-pages-artifact` with `path: dist`
  - deploy job: `actions/deploy-pages`, which needs the build job
- [ ] T041 [US4] Set `SITE_URL` and `REPO` in `site/config.json` and `tools/fixtures/config.check.json` to the real GitHub repo and Pages URL once the repo exists on GitHub. The repo will be **public** (decided 2026-10-22), so Pages works on the free plan. Ask for the repo name before creating or pushing anything

**Checkpoint**: the site goes live automatically after every passing check.

---

## Phase 7: User Story 5 - Glossary page exists and is ready to grow (Priority: P3)

**Goal**: an English glossary page that lists published terms and shows an empty state when there
are none.

**Independent Test**: in the real build, `dist/lessons/glossary.html` shows the empty-state
message. In the check build, it lists the sample's two terms with links to their sections.

- [X] T042 [US5] Port `modern-robotics/lessons/gl/lesson.html`, `gl.css` and `ui-gl.js` to `lessons/gl/`:
  - in English, titled "Glossary — Kinematics Workshop"
  - each entry shows the term, its definition and a "where it's introduced" link
  - remove the English-equivalent column
  - show "No terms yet. They'll appear here as lessons are published." when the list is empty
- [X] T043 [US5] Make the glossary data published-aware in `lessons/build.py`: `@@GLOSSARY_JSON@@` includes only terms whose lesson output file is in `PUBLISHED`. Add `{ "n": "G", "file": "lessons/glossary.html" }` to `site/config.json → PUBLISHED`, and add a "Glossary" link to the home page menu and footer in `site/index.src.html`
- [X] T044 [US5] Rebuild and verify the Independent Test above (also covered by `tools/check.js` step 5)

**Checkpoint**: all five user stories work on their own.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T045 [P] Write `README.md`: what the project is, the requirements (Python 3.10+, Node 22+, Chrome or Edge), the commands from contracts/commands.md, how to start a lesson from `lessons/sample/`, and the licenses (code MIT, fonts OFL, KaTeX MIT; course content original)
- [X] T046 [P] Grep the repo (excluding `modern-robotics/`, `.git/`, fonts and `tools/vendor/`) for leftover `mr-`, `MR_`, `modernrobotics`, `Шипитько`, `Ada`/`Ада` and any Cyrillic, and fix every hit
- [X] T047 Run quickstart.md end to end (§1–§5) and tick off spec success criteria SC-001–SC-006 in `specs/001-site-foundation/checklists/requirements.md` notes
- [X] T048 Commit the work on branch `001-site-foundation` with a conventional message, and leave merging and pushing for the user to approve

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** has no dependencies.
- **Foundational (Phase 2)** depends on Setup and blocks every user story.
- **US1 (Phase 3)** and **US2 (Phase 4)** depend on Foundational and are independent of each other.
- **US3 (Phase 5)** depends on US1 and US2, since it checks them.
- **US5 (Phase 7)** depends on Foundational only; the full check in US3 step 5 picks it up once it's done.
- **US4 (Phase 6)** depends on US3, because the workflow runs the check.
- **Polish (Phase 8)** comes after everything else.

### Within each story

The order is: sources, then build registration, then the build, then verification. Check-script
tasks (US3) come after the pages they check.

### Parallel Opportunities

- Setup: T002–T006 together.
- Foundational: T010–T016 together (separate files). T017 and T018 are new files and can also run
  alongside them. T008 and T009 touch different build scripts and can run in parallel with each
  other.
- US1 and US2 can run in parallel once Foundational is done; within US1, T023–T025 together.
- US5 can run alongside US1 and US2.

---

## Parallel Example: Foundational

```text
Task: "T011 Move lesson.css to lessons/shared/lesson.css"
Task: "T012 Move ui-core.js to lessons/shared/ui-core.js"
Task: "T013 Copy kit.js, missions.js, cards.js, lab.css"
Task: "T014 Copy recall.*, progress.js"
Task: "T017 Create lessons/shared/quiz.js"
Task: "T018 Create lessons/shared/planar-arm.js"
```

---

## Implementation Strategy

### MVP first (User Story 1 only)

1. Phase 1 and Phase 2.
2. Phase 3 (US1). Stop and validate: the home page opens from disk with the full program.

### Incremental delivery

1. Add US2: the sample lesson works and becomes the template.
2. Add US5: the glossary page.
3. Add US3: the single check passes, which is the gate for publishing.
4. Add US4: Pages deploys on push.
5. Polish.

### Notes

- After each phase, run the builds; after US3 exists, run `node tools/check.js`.
- Commit after each phase, on branch `001-site-foundation`.
- Never edit `modern-robotics/`; it is the read-only reference.
