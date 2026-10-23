<!--
Sync Impact Report
- Version change: 1.2.0 → 1.3.0 (MINOR: site language switched from English to Turkish)
- Modified principles: none
- Modified sections: Scope and Language (site language Turkish; code and docs stay English;
  glossary carries English terms; notation unchanged)
- Added sections: none
- Removed sections: none
- Templates requiring updates:
  ✅ .specify/templates/plan-template.md — no language-specific gate; no edit needed
  ✅ .specify/templates/spec-template.md — specs stay English; no edit needed
  ✅ .specify/templates/tasks-template.md — no edit needed
  ✅ README.md — describes the site in English; one line added about the Turkish site language
- Follow-up TODOs: none
-->

# Kinematics Workshop Constitution

## Core Principles

### I. Written for Someone Starting From Zero

Our reader has never studied robot kinematics. A lesson may assume only what earlier lessons
taught, plus the math (Part M) and physics (Part F) primers. Every new term is defined where it
first appears and added to the glossary. The main text builds intuition with words, diagrams and
interaction; formulas, derivations and heavy algebra go into collapsible "Under the hood" blocks.
When a lesson leans on a prerequisite, it links to the primer lesson that covers it, right there.

Why: if the reader gets lost, no amount of interactivity saves them. Intuition first, formalism
second.

### II. Explain First, Then Let Them Try It

Lessons follow the structure of the reference site (modern-robotics), not its look; the visual
style follows Principle VII. The structure is: an intro with time estimate
and lab/mission counts, a three-question warm-up on the previous lesson, numbered sections, an
eight-question misconceptions quiz, and a wrap-up with takeaways, open questions, further reading
and a bridge to the next lesson.

Each section picks the form its idea needs:

- **Lab** — a live scene taking roughly half the screen plus a mission card. At most three per
  lesson.
- **Small interactive** — one scene or two side by side, with zero or one mission.
- **Prose** — text, an optional diagram, and an optional "Under the hood" block.

Forcing every section into the same template is not allowed.

Lab missions have a clear goal, criteria checked live (✓/✗), a prediction before the reveal when
it teaches something, and an explanation after success. Controls unlock gradually; the last
mission is free play. Interaction is direct manipulation: dragging the arm updates the DH table,
the matrices and the readouts as you move.

Why: the reader understands by reading, then confirms with their hands. Interaction that isn't
needed just pulls attention away.

### III. Correct and Deterministic (NON-NEGOTIABLE)

Kinematics and math engines are plain JS modules with no DOM access, so they run in both the
browser and Node. Every number the text states ("two solutions", "0.36 m from the shoulder") is
verified by a Node check. Any randomness uses a fixed seed. The whole site uses Craig's modified
DH convention (`α_{i−1}, a_{i−1}, d_i, θ_i`). Units are SI; the UI shows angles in degrees. Facts
and formulas are checked against primary sources: Craig, Lynch & Park, and the course slides.

Why: a beginner can't catch our mistakes. A wrong number teaches a wrong idea.

### IV. Original Content Only

Craig's book and the AIN451 slides are references for scope, depth and fact-checking. We never
copy their text, figures or exercises. Code from the reference site is MIT-licensed and may be
reused with its license notice kept. Its Russian lesson text is CC BY-NC; we take inspiration
from the format, but we don't translate or copy the text.

Why: the site will be public, and we can't carry copyright risk.

### V. Keep the Stack Plain

Plain HTML, CSS and JS. A Python build turns each lesson into one self-contained static HTML
file, with KaTeX rendered at build time. No framework, no runtime dependencies, no server. The
site works offline and from `file://`. Before writing a new module, reuse the reference repo's
equivalent (`kit.js`, `missions.js`, `cards.js`, `check.js`, glossary, progress tracking).
Server-side pieces such as counters, analytics and cloud functions are left out.

Why: fewer moving parts means fewer things break, and a single-file lesson opens anywhere.

### VI. Works on Every Screen, for Everyone

Every lesson works at 390 px phone width and on desktop, in light and dark themes, and respects
`prefers-reduced-motion`. Everything can be used with mouse, touch and keyboard. Canvas scenes
carry an `aria-label`. Animation loops run only while the scene is on screen.

Why: readers often open a lesson on their phone. Accessibility is part of the baseline, not
something we add at the end.

### VII. Plain Pages

Every page reads like a teacher's notes. The model is Lena Voita's NLP course
(lena-voita.github.io/nlp_course.html): we follow its plainness, not its layout or content.

- One narrow text column (about 75 characters per line); figures and labs may be wider.
- The reader's system font stack. No web fonts for text; KaTeX's math fonts are the only
  exception.
- Plain links. Sections separated by thin horizontal rules.
- One ink colour for headings and body text. Colour MUST carry meaning: the per-lesson meaning
  colours in figures, labs and formulas, the link colour, pass/fail states, and the light tint of
  research blocks.
- Banned: gradient text, uppercase "eyebrow" labels above headings, pill or chip badges,
  shadowed content cards, corner rounding beyond a few pixels, pairs of big call-to-action
  buttons.
- Personality comes from the writing, the figures and the author's first-person margin notes.
- Lessons MAY carry Related papers, Research thinking and margin note blocks. Every citation
  (title, authors, venue, year) MUST match the original publication; every summary is in our
  own words.

Why: decoration made the site look like a generated product page. A plain page keeps the
reader's attention on the idea.

## Scope and Language

- **Site language:** Turkish for everything a reader sees: lesson text, UI strings, glossary,
  page titles and descriptions, link previews. The owner polishes the Turkish wording by hand.
- **Working language:** English for code, code comments, specs, plans, README and other docs.
- **Glossary:** every entry shows the English term next to the Turkish one, so readers can
  follow English sources such as Craig and the course slides.
- **Notation:** stays as in the slides and Craig (ᴬP, {A}, BORG subscripts, DH symbols).
- **Program:** Part M, math primer (5 lessons); Part F, physics primer (3 lessons); Part 1,
  manipulators; Part 2, position and orientation; Part 3, forward kinematics; Part 4, inverse
  kinematics; Part 5, the Jacobian. Each part ends with a checkpoint quiz.
- **Out of scope:** dynamics (Newton–Euler, Lagrange), trajectory generation and control. Adding
  any of these requires amending this constitution.
- **Running example:** a planar 3R arm is the main character. 3D topics (DH, PUMA) use whatever
  arm shows the idea best.
- **Publishing:** a static site on GitHub Pages. The list in `config.json` decides which lessons
  are live.

## Development Workflow

- Each part or lesson goes through the spec-kit flow: `/speckit-specify` →
  `/speckit-clarify` (when needed) → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
- Each lesson has a check script (`tools/lessonXX.js`). It first verifies the engine's numbers in
  Node, then plays every mission, the quiz, dark mode and the 390 px layout in headless Chrome.
- A lesson joins the published list only after its check script passes.
- A change to a shared module means re-running the checks of every lesson that uses it.

## Governance

This constitution takes precedence over every other practice; specs, plans and tasks must not
contradict it. Every plan shows compliance in its "Constitution Check" section, and any justified
deviation is recorded under "Complexity Tracking". The project owner approves amendments, which
are made in this file along with an updated Sync Impact Report. Versioning is semantic: MAJOR
for removing or redefining a principle, MINOR for adding a principle or section, PATCH for
wording fixes.

**Version**: 1.3.0 | **Ratified**: 2026-10-21 | **Last Amended**: 2026-10-23
