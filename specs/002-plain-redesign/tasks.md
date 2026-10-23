# Tasks: Plain Redesign and Research Blocks

**Input**: Design documents from `specs/002-plain-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/lesson-blocks.md, quickstart.md

**Tests**: FR-018 requires automated checks, so check tasks are included in each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependencies)
- **[Story]**: the user story the task belongs to (US1–US4)

---

## Phase 1: Setup

- [X] T001 List every class name used by page sources and shared JS: grep `class=`, `className`, `classList` and template strings over `lessons/**/*.html`, `lessons/**/*.js` and `site/*.src.html`. Save the list as a comment block at the top of the scratch notes. This is the keep-list for the rewrite, per research.md R2.

---

## Phase 2: Foundational (blocks every story)

- [X] T002 Write `tools/plain_scan.js`: export `scan(page)`, which evaluates in the browser and returns offenders for the research.md R8 rules (gradient text, uppercase labels, shadows on non-controls, radius > 4px on non-controls, gradient backgrounds except range tracks, non-KaTeX `@font-face`)
- [X] T003 Wire `plain_scan` into `tools/check.js`: run it on `dist-check/index.html`, `404.html`, `lessons/glossary.html` and `lessons/sample.html` in light and dark, and print `plain scan: <page> <theme> — N offenders`. It should fail now and pass at the end of US1.
- [X] T004 Remove text web fonts. Delete `site/assets/fonts/`, drop the `fonts.css` links from `site/index.src.html`, `site/404.src.html`, `lessons/sample/lesson.html` and `lessons/gl/lesson.html`, and make the KaTeX stylesheet injection in `lessons/build.py` stop depending on the `fonts.css` line (insert it before `</head>` instead).

**Checkpoint**: check runs; the scan reports the current decorations as offenders.

---

## Phase 3: User Story 1 — plain, document-like site (P1) 🎯 MVP

**Goal**: home, 404, glossary and sample lesson read like plain notes; everything still works.

**Independent test**: `node tools/check.js` passes, including the plain scan, with no regression in the 001 checks. Screenshots in `shots/` look plain.

- [X] T005 [US1] Rewrite `lessons/shared/lesson.css` from scratch, keeping only the T001 keep-list. Use the plain tokens from research.md R1 (light and dark, keeping the meaning colours), a 42rem text column, the system font, hr-style section borders, a thin top bar, plain lesson header, labs in thin-bordered frames, quiz options as bordered buttons, `details.deep` as a tinted block with radius 3px, takeaways as a plain `<ol>`, links as a plain list, reduced-motion, and the 820/640 px breakpoints
- [X] T006 [P] [US1] Restyle `lessons/shared/lab.css`, `recall.css`, `check.css` and `glossary.css`: no shadows, radius ≤ 3px on content and ≤ 6px on controls, no gradients except range tracks
- [X] T007 [US1] Update `lessons/sample/lesson.html` to the plain markup. Header: "Sample lesson" line, h1, one-line description, and meta as plain text "≈ 10 minutes · 1 lab, 1 interactive · 3 missions". Remove `.kicker`, `.hero-meta`, `.hero-list`, `.btn.primary` and the `alt` bands. Section headings become "1. Joint angles…" and so on. Labs keep all ids. Drop inline `style` widths that the new CSS covers.
- [X] T008 [P] [US1] Restyle `lessons/gl/lesson.html` and `lessons/gl/gl.css` as a plain alphabetical list with a plain search input
- [X] T009 [US1] Rewrite `site/assets/site.css` with the same tokens as `lesson.css`: nav as a thin text line, plain sections, plain program list, footer
- [X] T010 [US1] Rewrite `site/index.src.html` as a document per research.md R9. Keep `#ctaMain`, `#ctaProgress`, `#progressReset`, `#parts`, `li[data-n][data-state]`, `#themeBtn` and the PARTS array that `site/build.py` parses. Remove the hero gradient, chips, the feature cards, the `.kicker` labels and the GitHub icon button (the repo link moves to the footer text). Write the intro in first person.
- [X] T011 [P] [US1] Make `site/404.src.html` plain: h1, one sentence, two text links
- [X] T012 [P] [US1] Update `tools/og_image.js` to a plain card (system font, title in ink, one line of description, thin rule), regenerate `site/assets/og.png`, and update `shots/og-card.html` if the script uses it
- [X] T013 [US1] Run `node tools/check.js`. Fix scan offenders and regressions until every check passes, then review `shots/home-light.png`, `sample-light.png`, `sample-dark.png` and `sample-phone.png`.

**Checkpoint**: US1 is shippable on its own.

---

## Phase 4: User Story 2 — Related papers (P2)

**Goal**: the sample lesson ends with a Related papers section of four verified paper cards.

**Independent test**: the check confirms 4 `.paper` cards with all required fields, "More details" closed on load and opening on click. A manual link check against research.md R6.

- [X] T014 [US2] Create `lessons/shared/research.css` with the paper card styles from contracts/lesson-blocks.md (tinted block, meta line in `--ink-3`, `.pay` note, figure, `details.more`), the book icon as a mask-image `::before` on `[data-block="papers"] h2` and `.toc a[data-block="papers"]`, and the print rule from research.md R4. Add it to every lesson's CSS list in `lessons/build.py`.
- [X] T015 [US2] Add the `#papers` section to `lessons/sample/lesson.html` before the wrap-up, with cards for Denavit & Hartenberg 1955, Pieper 1968, Whitney 1969 and Aristidou & Lasenby 2011, using the exact citations and links from research.md R6. Write an original one-line takeaway, plus "More details" that ties each paper to the two-link arm. Give the FABRIK card a small inline SVG figure (a chain pulled toward a target). Add a "Papers" link with `data-block="papers"` to the top-bar toc.
- [X] T016 [US2] In `lessons/build.py`, make `glossarize()` skip `.paper .meta` and `.mnote` (contract "Fold-outs" section)
- [X] T017 [US2] Add paper card checks to `tools/lesson_sample.js`: count ≥ 3, fields non-empty, year has 4 digits, ids unique, `details.more` closed by default and open after a click

---

## Phase 5: User Story 3 — Research thinking (P2)

**Goal**: one research thinking block in the sample lesson, with answers and the real solution hidden until opened.

**Independent test**: the check confirms that the question is visible, both fold-outs are closed on load and each opens on click. Manual: works with JS disabled.

- [X] T018 [US3] Add the research thinking styles to `lessons/shared/research.css`: tinted block, `.q` in bold, `.think` in italic `--ink-3`, the bulb icon on `.research h3::before` and `.toc a[data-block="research"]`
- [X] T019 [US3] Add a research thinking block to `lessons/sample/lesson.html` at the end of section 1 (after "Guessing angles by hand works, but it's slow"). Question: "How could a computer find joint angles that put the hand on a target?" Possible answers: solve the triangle (closed form), nudge the joints and keep what helps (small steps), drag the hand to the target and let the links follow. Actual solution: Pieper 1968 (closed form for arms whose last three axes meet), Whitney 1969 (small steps through joint rates), Aristidou & Lasenby 2011 (FABRIK), each linking to its `#paper-…` card.
- [X] T020 [US3] Add `beforeprint`/`afterprint` handling to `lessons/shared/ui-core.js`: open every `details` before printing and restore the previous state afterwards (research.md R4)
- [X] T021 [US3] Add research thinking checks to `tools/lesson_sample.js`: `.research .q` is visible, `.answers` and `.actual` are closed on load, both open after a click, and every `#paper-…` link in `.actual` resolves to an existing card

---

## Phase 6: User Story 4 — margin notes (P3)

**Goal**: first-person notes in the margin on wide screens and inline on narrow ones.

**Independent test**: the check measures note position at 1280 px (right of the text column, top aligned with its paragraph ±40px) and at 390 px (below the paragraph, inside the column, no overlap).

- [X] T022 [US4] Add the margin note styles to `lessons/shared/research.css` per research.md R5, with the pen icon on `.mnote::before`, the float into the margin at ≥ 1200 px, `clear: right`, and the inline left-rule version below 1200 px
- [X] T023 [US4] Add two margin notes to `lessons/sample/lesson.html`: one in section 1 (about first trying to reach the target by moving only the shoulder), one in section 3 (about the inner radius surprising the author). Keep them under 280 characters, in first person.
- [X] T024 [US4] Add margin note checks to `tools/lesson_sample.js`: position at 1280 px and at 390 px as described above, the two notes don't overlap each other, and each has `aria-label`

---

## Phase 7: Polish & cross-cutting

- [X] T025 [P] Update `README.md`: the assets line no longer lists text fonts, and the lesson-authoring notes point to the three blocks in the sample
- [X] T026 [P] Update the `lessons/sample/lesson.html` top comment and the author notes so a new lesson knows to copy the blocks (SC-005)
- [X] T027 Compare built page sizes before and after (`git stash` baseline or the 001 numbers from the build output) to confirm SC-007, and record them in `specs/002-plain-redesign/quickstart.md`
- [X] T028 Run `node tools/check.js` one last time, take the final screenshots, and do the quickstart manual checks (no-JS fold-outs, print preview, paper links)

---

## Dependencies

- Setup (T001) → Foundational (T002–T004) → US1 (T005–T013).
- US2, US3 and US4 depend on US1, because they share the new `lesson.css` tokens and the sample markup. Among themselves they all touch `research.css`, `sample/lesson.html` and `lesson_sample.js`, so run them in order: US2 → US3 → US4. US3's links point to US2's cards.
- Polish comes after all stories.

## Parallel opportunities

- T006, T008, T011 and T012 touch separate files and can run alongside T005/T007/T009/T010.
- T025 and T026 run in parallel.

## Implementation strategy

MVP is US1. It fixes the owner's main complaint and can be shown before the blocks land. Then
come US2 (papers, the block the owner asked for by name), US3 and US4. Run the check after each
story.
