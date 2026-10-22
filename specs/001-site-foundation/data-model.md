# Data Model: Site Foundation

There is no database. Every entity below lives in a source file in the repo, except learner
progress, which lives only in the learner's browser.

## Course program

Where: the `PARTS` array in `site/index.src.html`.

| Field | Type | Notes |
|---|---|---|
| `id` | string | `M`, `F`, `1`–`5` |
| `title` | string | e.g. "Forward kinematics" |
| `L` | array of lesson entries | in teaching order; the last entry is the part's checkpoint |

A lesson entry is a tuple `[n, title, kind]`:

- `n` is the lesson number shown to the reader (`M.2`, `3.1`, `CP3` for checkpoints). It must be
  unique across the program.
- `kind` is optional: `'check'` marks a checkpoint quiz. Checkpoints are skipped when the home
  page suggests "next lesson".

Initial program (titles are working titles and can change without a new spec):

| Part | Lessons |
|---|---|
| M · Math toolkit | M.1 Vectors and coordinate frames · M.2 Trigonometry for robot arms · M.3 Matrices as transformations · M.4 Special matrices · M.5 Derivatives and small changes · CPM Checkpoint |
| F · Physics toolkit | F.1 Rigid bodies and relative motion · F.2 Rotation and angular velocity · F.3 Force, torque and equilibrium · CPF Checkpoint |
| 1 · Manipulators | 1.1 Joints and degrees of freedom · 1.2 Arm types and workspaces · CP1 Checkpoint |
| 2 · Position and orientation | 2.1 Rotation matrices · 2.2 Homogeneous transforms · 2.3 Euler and fixed angles · 2.4 Axis–angle and quaternions · CP2 Checkpoint |
| 3 · Forward kinematics | 3.1 Denavit–Hartenberg parameters · 3.2 Attaching frames to links · 3.3 Joint space and Cartesian space · 3.4 Where is the tool? · CP3 Checkpoint |
| 4 · Inverse kinematics | 4.1 Can the arm reach it? · 4.2 Multiple solutions · 4.3 Geometric and algebraic solutions · 4.4 PUMA 560 and Pieper's method · CP4 Checkpoint |
| 5 · The Jacobian | 5.1 Velocity and the Jacobian · 5.2 Singularities · 5.3 Velocity propagation · 5.4 Static forces · 5.5 Driving the arm with the Jacobian · CP5 Checkpoint |

Validation: the build fails if a `PUBLISHED` entry's `n` isn't in the program.

## Published list

Where: `site/config.json → PUBLISHED` (the check build uses `tools/fixtures/config.check.json`
instead).

| Field | Type | Notes |
|---|---|---|
| `n` | string | must match a program entry, or `G` for the glossary page |
| `file` | string | path relative to `site/`, e.g. `lessons/3-1-dh-parameters.html` |

Rules:

- The order doesn't matter.
- A listed file that wasn't built fails the assemble step.
- Only listed lessons are copied to `dist/` and appear in `sitemap.xml`.

## Lesson (source)

Where: `lessons/<key>/` plus one entry in the `LESSONS` map in `lessons/build.py`. The format is
described in [contracts/lesson-source.md](contracts/lesson-source.md).

| Field | Notes |
|---|---|
| `key` | folder name, e.g. `l31` or `sample` |
| output file name | slug used in URLs, e.g. `3-1-dh-parameters.html` |
| CSS files | shared and lesson-specific, inlined at `/*@@CSS@@*/` |
| JS files | shared and lesson-specific, inlined at `/*@@JS@@*/` |

The sections inside a lesson are `<section class="section" id="…">` elements. Their ids become
anchor targets for the glossary and progress.

## Mission

Where: JS objects passed to `Missions.mount(root, missions, api, opts)` in `shared/missions.js`.
The fields are listed in [contracts/lesson-source.md](contracts/lesson-source.md#missions).

States: `locked` → `active` → `passed`. The final mission is free play and has no criteria. The
learner can go back to any mission they have reached.

## Warm-up (recall) questions

Where: `<script type="application/json" id="recallData">` inside a lesson.

| Field | Type | Notes |
|---|---|---|
| `n`, `title`, `href` | string | the previous lesson's number, title and file |
| `q` | array | three questions, each `{ q, o: [3 options], a: index, e: explanation, sec, secTitle }` |

Lessons with no previous lesson (M.1, and the sample) omit the block.

## Quiz question

Where: passed to `Quiz.render(boxSel, questions, scoreSel)` from `shared/quiz.js`.
`{ q, o: [options], a: index, e: explanation }`. Eight per lesson.

## Glossary term

Where: `lessons/shared/glossary.json`.

| Field | Type | Notes |
|---|---|---|
| `id` | string | unique, kebab-case |
| `t` | string | term as shown |
| `d` | string | one- or two-sentence definition |
| `l` | string | lesson key that introduces it |
| `sec` | string | section id in that lesson |
| `a` | string | regex for the term's forms in text, matched case-insensitively |
| `only` | array of lesson keys | optional; restricts wrapping to these lessons |

The reference's `en` field is dropped, since the site is in English.

Validation: the build fails if `l` isn't a known lesson key or `sec` isn't a section id in that
lesson. The glossary page shows only terms whose lesson is published.

## Learner progress

Where: browser `localStorage`, key `kw-progress`.

Shape: `{ [pageSlug]: { s: firstSeenUnix, t: lastSeenUnix, i: furthestSectionIndex, sec: furthestSectionId, f?: completedUnix } }`

States: not present (not started) → present (started) → `f` set (completed: the reader
reached the wrap-up section). There is a "Reset progress" link on the home page that removes the
key. If storage is blocked, nothing is stored and nothing fails.

Theme choice: `localStorage` key `kw-theme`, value `'light'` or `'dark'`. When it's absent, the
system preference is used.
