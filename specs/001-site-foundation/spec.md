# Feature Specification: Site Foundation

**Feature Branch**: `001-site-foundation`

**Created**: 2026-10-21

**Status**: Draft

**Input**: User description: "Site foundation for the Kinematics Workshop: turn the cloned modern-robotics reference repo into the skeleton of our robot-kinematics course site. Keep the reference build pipeline, the shared lesson modules and the headless-Chrome check harness. Remove everything server-side, the prototypes, and all Russian lessons and texts. Deliver an English home page with the full program, an empty glossary page, one minimal sample lesson that exercises the full lesson format, GitHub Pages publishing, and a check script that runs on Windows."

## Overview

Before we write any real lesson, we need a site that lessons can live in. The reference site
(modern-robotics) already solves most of this: lessons build into single self-contained pages,
labs have missions, there's a glossary, progress tracking, a warm-up quiz and light/dark themes.
This feature takes that machinery, strips out what we don't need (servers, Russian content,
prototypes), and turns it into an empty but working English course site for robot kinematics.

When this is done, a visitor can open the home page, see what the course is and how it's laid out,
and open a sample lesson that shows every building block a real lesson will use. An author can
copy that sample to start a new lesson, run one check, and publish.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor understands the course from the home page (Priority: P1)

A learner who knows nothing about robot kinematics lands on the home page. It tells
them what they'll learn, who it's for, and how a lesson works (read first, then try it in a live
scene, then check yourself). It shows the full program: the math primer, the physics primer and
the five main parts, each lesson with its number and title, and a checkpoint quiz at the end of
each part. Lessons that aren't written yet are clearly marked "Coming soon" and can't be
opened.

**Why this priority**: the home page is the front door, and it's the one page every later lesson
links back to. It also forces us to pin down the program in one place.

**Independent Test**: build the site, open the home page from disk with no server, and confirm the
intro, the "how a lesson works" section and all seven parts with their lessons and checkpoint
quizzes are there, with unpublished lessons marked and not clickable.

**Acceptance Scenarios**:

1. **Given** no lesson is published, **When** the visitor opens the home page, **Then** every
   lesson and checkpoint in the program shows as coming soon and none of them is a working link.
2. **Given** one lesson is marked as published, **When** the site is rebuilt and the home page
   opened, **Then** that lesson shows as available and opens its lesson page.
3. **Given** the visitor's system prefers dark mode, **When** the home page loads, **Then** it
   renders in the dark theme, and the theme toggle switches it and remembers the choice.

---

### User Story 2 - Author starts a new lesson from a working template (Priority: P1)

An author (us) wants to write lesson 3.1. They copy the sample lesson, change the text and the
scene, add it to the published list, and build. The sample shows every block a lesson can have:
the intro with time and mission counts, the three-question warm-up, a lab with missions
(prediction, live ✓/✗ criteria, explanation, free play at the end), a small interactive with no
missions, a prose section with a collapsible "Under the hood" block containing a formula, the
misconceptions quiz, and the wrap-up with takeaways, open questions, further reading and a link to
the next lesson. Terms in the text that are in the glossary get their hover/tap definitions.

**Why this priority**: every one of the ~27 lessons will start from this. If the template is
broken or incomplete, every lesson inherits the problem.

**Independent Test**: build the sample lesson, open it from disk, complete each mission, answer
the warm-up and the quiz, open the "Under the hood" block, and confirm that the formula is already
typeset in the built file (no formula library loaded in the browser).

**Acceptance Scenarios**:

1. **Given** the sample lesson is built, **When** the learner drags the arm in the lab, **Then**
   the readouts and the mission criteria update live, and the mission completes when its criteria
   are met.
2. **Given** a mission with a prediction, **When** the learner hasn't made a prediction yet,
   **Then** the mission can't be marked complete.
3. **Given** the learner finishes the quiz, **When** they look at the result, **Then** each answer
   shows whether it was right and why.
4. **Given** a check build where the sample lesson is temporarily on the published list, **When**
   the learner opens it and then returns to the home page, **Then** that lesson shows as
   "started", or "completed" once they have scrolled to the wrap-up.

---

### User Story 3 - One command checks everything before publishing (Priority: P2)

Before publishing, the author runs a single check on their Windows machine. It builds the whole
site, then opens the sample lesson in a headless browser and plays it: every mission, the
warm-up, the quiz, the dark theme, and a 390 px phone layout. It saves screenshots and prints a
clear pass/fail line per step. If anything fails, it exits with a failure.

**Why this priority**: the constitution says no lesson is published without a passing check. The
check has to work on the machine we actually use, and the reference version only runs on macOS.

**Independent Test**: run the check on Windows with Chrome or Edge installed and see every step
pass; then deliberately break a mission criterion and see the check fail on that step.

**Acceptance Scenarios**:

1. **Given** Chrome or Edge is installed in its standard location, **When** the author runs the
   check, **Then** it finds the browser by itself without editing any path.
2. **Given** a mission in the sample lesson is broken, **When** the check runs, **Then** it reports
   which mission failed and exits with a non-zero status.

---

### User Story 4 - The site is published on GitHub Pages (Priority: P2)

Once the check passes, the built site is published to GitHub Pages. Only published lessons (and
the home page, glossary and 404 page) go out; drafts and the sample/template lesson don't.

**Why this priority**: the site has to be reachable, but nothing is worth publishing until the
pages above work.

**Independent Test**: produce the publishable folder and confirm it contains the home page,
glossary, 404 page, shared assets and only the lessons on the published list, and that every link
inside it resolves.

**Acceptance Scenarios**:

1. **Given** the published list is empty, **When** the publishable folder is produced, **Then** it
   contains the home page, glossary page, 404 page and assets, and no lesson pages.
2. **Given** a push to the main branch, **When** the publish step runs, **Then** the live site
   matches the publishable folder.

---

### User Story 5 - Glossary page exists and is ready to grow (Priority: P3)

The glossary page works with zero or more terms. Each term will show its name,
a short definition and a link to the lesson section where it's introduced.
For now it holds only the few terms the sample lesson uses, or shows a friendly "no terms yet"
message if there are none.

**Why this priority**: lessons link to the glossary from day one, so the page has to exist, but
real terms only arrive with real lessons.

**Independent Test**: build with an empty term list and see the empty-state message; add one term
and see it listed with its link.

**Acceptance Scenarios**:

1. **Given** the term list is empty, **When** the glossary page is opened, **Then** it shows an
   empty-state message instead of an empty table.
2. **Given** a term is defined in a published lesson, **When** that term first appears in the
   lesson text, **Then** it gets a hover/tap definition that links to the glossary.

### Edge Cases

- A lesson is listed as published but its page wasn't built: the build warns loudly and the
  publish step refuses to go out with a broken link.
- A lesson's source contains a formula with a typo: the build stops and shows which formula
  failed, rather than shipping raw markup.
- The visitor opens a page directly from disk (`file://`) or offline: everything except external
  links still works.
- The visitor's browser blocks local storage (private mode): progress and theme choice simply
  aren't remembered; nothing breaks.
- The visitor has reduced motion turned on: scenes don't auto-animate; dragging still works.
- Neither Chrome nor Edge is found by the check: it says so plainly and tells the author how to
  point it at a browser.
- Leftover Russian text: the check fails if any Cyrillic text appears in the built site.

## Requirements *(mandatory)*

### Functional Requirements

**Cleanup**

- **FR-001**: The new site MUST NOT contain the reference site's server-side pieces (thank-you
  counter, analytics, release function, cloud deploy scripts) or any code that calls them.
- **FR-002**: The new site MUST NOT contain the reference site's prototypes, Russian lessons,
  Russian glossary, author bio, photos or other Russian text. Comments in reused modules MUST be
  translated to English too, because lesson builds inline those modules into the published pages.
- **FR-003**: Reused code MUST keep the reference project's MIT license notice.

**Home page**

- **FR-004**: The home page MUST be in English and include a course intro, a "who is this for"
  note (learners starting from zero), a "how a lesson works" section and the full program.
- **FR-005**: The program MUST list Part M (5 lessons), Part F (3 lessons) and Parts 1–5 with
  their lessons as agreed in the course outline, plus a checkpoint quiz at the end of each part.
- **FR-006**: Each lesson in the program MUST show as available (linked) or coming soon (not
  linked), based on one published list that is the single source of truth.
- **FR-007**: The home page MUST show the learner's progress per lesson (not started / started /
  completed), stored only in their own browser, with a way to reset it.

**Lesson format**

- **FR-008**: A sample lesson MUST demonstrate every block a lesson can contain: intro, warm-up,
  lab with missions, small interactive, prose section with an "Under the hood" formula block,
  misconceptions quiz and wrap-up.
- **FR-009**: Formulas MUST be typeset when the site is built, so no formula library runs in the
  visitor's browser.
- **FR-010**: Each built lesson MUST be a single page that works opened directly from disk.
- **FR-011**: The sample lesson MUST NOT appear in the program or the published site; it exists as
  the template for authors.
- **FR-012**: Glossary terms MUST get a hover/tap definition at their first appearance in a lesson.

**Glossary**

- **FR-013**: A glossary page MUST exist, list every defined term (name, definition, link to the
  introducing lesson section), and show an empty state when there
  are none.

**Checks and publishing**

- **FR-014**: A single check command MUST build the whole site and play the sample lesson end to
  end in a headless browser: missions, warm-up, quiz, dark theme and 390 px phone width.
- **FR-015**: The check MUST find Chrome or Edge on Windows without a hardcoded path, and allow
  overriding the browser location.
- **FR-016**: The check MUST fail on any of: a failed mission step, a broken internal link, a
  published lesson that wasn't built, or Cyrillic text in the built site.
- **FR-017**: The site MUST be publishable to GitHub Pages, and only published lessons plus the
  home, glossary and 404 pages and their assets MUST be published.

**Look and feel**

- **FR-018**: All pages MUST support light and dark themes, a 390 px phone width, keyboard and
  touch use, and reduced motion.
- **FR-019**: The site name, page titles and link previews MUST use the new course name, not the
  reference site's.
- **FR-020**: All site text, UI labels, glossary entries and code comments written for this
  project MUST be in English.

### Key Entities

- **Course program**: the ordered list of parts, each with its lessons and a checkpoint quiz.
  Each entry has a number (e.g. "3.1", "M.2"), a title and a slug.
- **Published list**: which program entries are live. Drives the home page links, the sitemap and
  what gets published.
- **Lesson**: one self-contained page built from its sources; has sections, missions, a warm-up,
  a quiz and a wrap-up.
- **Mission**: a goal inside a lab, with optional prediction, live criteria, hint and explanation.
- **Glossary term**: name, definition, the lesson and section that introduce it.
- **Learner progress**: per-lesson state (not started / started / completed), kept only in the
  learner's browser.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can tell, from the home page alone and within 2 minutes, what
  the course covers, what order it goes in, and which lessons are available.
- **SC-002**: An author can go from copying the sample lesson to a built, checked lesson page with
  their own title and one working mission in under 30 minutes.
- **SC-003**: The full check runs on a standard Windows machine with no manual path edits and
  finishes in under 2 minutes.
- **SC-004**: The built site contains zero Cyrillic characters and zero references to the
  reference site's servers.
- **SC-005**: Every page passes the check at 390 px width and in both themes with no element
  overflowing the screen horizontally.
- **SC-006**: The live site loads its home page and any published lesson with no network requests
  to anything other than the site itself.

## Assumptions

- The course outline agreed in conversation is final for this feature: Part M (vectors and
  coordinate frames; trigonometry; matrices as transformations; special matrices; derivatives),
  Part F (rigid bodies and relative motion; rotation and angular velocity; force, torque,
  equilibrium and virtual work), Part 1 (2 lessons), Part 2 (4), Part 3 (4), Part 4 (4), Part 5
  (5). Exact titles are drafted during planning and can change later without a new spec.
- The sample lesson uses a simple planar arm (the course's running example) so its code is a
  realistic starting point, but its text is placeholder and it is never published.
- Fonts already bundled in the reference repo (Inter, JetBrains Mono, KaTeX fonts) are kept; they
  are under open licenses that allow redistribution.
- The reference site's feedback form, "say thanks" button and anonymous statistics are dropped
  entirely rather than replaced; feedback goes through GitHub issues if we want it later.
- GitHub Pages is the host; a custom domain is out of scope for now.
- The repository is new and lives at the project root; the reference repo, slides and book PDF
  stay outside version control.
- The author's machine is Windows 11 with Python 3 and Node.js available; Chrome is installed in
  its default location.
- The home page's "about the author" section is out of scope; it can be added later.
