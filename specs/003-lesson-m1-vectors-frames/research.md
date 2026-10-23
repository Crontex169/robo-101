# Research: Lesson M.1

## R1. Lesson outline (section ids, forms, time)

| # | id | Title | Form | ≈ min |
|---|---|---|---|---|
| — | top | Vectors and coordinate frames | intro | 1 |
| — | recall | Warm-up: grid points, Pythagoras, axis directions | warm-up | 2 |
| 1 | arrows | Arrows with a length and a direction | **Lab 1**: 3 missions + free play | 10 |
| 2 | parts | Components, length and direction | small interactive | 6 |
| 3 | frames | A frame: an origin and two axes | prose + static figure (SVG) | 4 |
| 4 | two-frames | One point, two frames | **Lab 2**: 2 missions + free play | 10 |
| 5 | three-d | Into 3D: right-handed frames | small interactive (turnable 3D frame, flip an axis) | 5 |
| — | quiz | Check yourself: eight common misconceptions | quiz | 6 |
| — | finale | What we covered | wrap-up | 2 |

Total ≈ 46 min (SC-001: 30–50). Research thinking goes at the end of section 4, after the lab:
the camera and the cup. Margin notes: section 1 (a vector doesn't care where it starts),
section 4 (where the author tends to put the superscripts), section 5 (the right hand while
typing).

**Decision**: section 3 is prose with a static SVG figure, not an interactive. Section 4's lab
already lets the reader drag a point and see its position vector, so a separate frame
interactive would repeat it.

## R2. Missions

Lab 1 (`#arrows`, scene units: 1 grid square = 1 unit, scene spans −5…5 in x and y):

1. **Match** a target arrow (dashed) drawn elsewhere on the grid. The reader drags the tail and
   the tip of arrow **a**. The criterion is about the components, not the position:
   a = (3, 2) within 0.25 per component. The explanation: same length and direction means the
   same vector, wherever it is drawn.
2. **Predict the sum.** Fixed a = (3, 1) and b = (−1, 2). Bet: where does a + b end, if a starts
   at the origin? Options: (2, 3) ✓, (4, 3), (−3, 2). The action draws b head to tail, then the
   sum arrow. Criterion: a run happened. The explanation names the components rule
   (3 − 1, 1 + 2).
3. **Reach the target.** The target is at (4, 3). a starts at the origin with its tip draggable.
   b starts at a's tip with its tip draggable. Criteria: b starts at a's tip (by construction),
   and b's tip is within 0.25 of the target, with a ≠ the whole way (|a| ≥ 1 and |b| ≥ 1, so
   both arrows matter). The explanation: this is how an arm's links add up; the hand is the sum
   of the link vectors.

Lab 2 (`#two-frames`). {A} is fixed at the scene centre; {B}'s origin and P can be dragged; both
snap to 0.5 units.

1. **Predict.** {B} is placed at (2, 1) in {A} and P at (1, 3) in {B}; the readout for P in {A}
   is hidden. Bet: (3, 4) ✓, (1, 2), (−1, −2). Action: "Show P in {A}" reveals the readout and
   draws the head-to-tail sum. The explanation:
   (2, 1) + (1, 3) = (3, 4).
2. **Place {B}.** P is fixed at (1, 1) in {A}. The goal is P at (−1, 2) in {B}, so {B} must go to
   (2, −1) in {A}. Live criterion within 0.25. The explanation: P in {B} = P in {A} − {B}'s origin.

## R3. Keyboard dragging (`HeroKit.keys`)

**Decision**: `HeroKit.keys(cv, { handles: [...names], move(name, dx, dy), label(name) })`.

- The canvas gets `tabindex="0"`.
- Arrow keys move the active handle by one step: 0.5 units, or 0.1 with Shift. In the 3D view
  they turn the frame.
- `Enter`/`Space` cycles to the next handle.
- An `aria-live="polite"` line under the scene names the active handle and its position.
- A visible focus ring sits on the canvas, and the active handle gets a ring when the canvas
  has focus.

**Rationale**: Tab still leaves the scene (no keyboard trap). It is one helper for every lesson,
and the sample adopts it too.

**Alternatives considered**: a pair of sliders per handle (clutter, and it doubles the
controls); hidden number inputs (not discoverable).

## R4. Numbers the text states (asserted in Node by `tools/lesson_m1.js`)

| Where | Statement | Engine call |
|---|---|---|
| §2 text and SC | (3, 4) has length 5 and unit vector (0.6, 0.8) | `len([3,4])`, `unit([3,4])` |
| §2 edge | zero vector: unit is undefined | `unit([0,0]) === null` |
| §1 m2 | (3, 1) + (−1, 2) = (2, 3) | `add` |
| §1 m3 | the target (4, 3) is at distance 5 | `len` |
| §4 m1 | (2, 1) + (1, 3) = (3, 4) | `toParent(pB, oB)` |
| §4 m2 | P(1, 1) in {A} and {B} at (2, −1) → P in {B} = (−1, 2) | `inFrame(pA, oB)` |
| §5 | x × y = z for the standard frame; flipping one axis gives det −1, flipping two gives +1 | `cross3`, `handedness` |
| quiz | every numeric option (listed in ui-m1.js `QUIZ`) | evaluated per question |
| warm-up | a 6-8-10 triangle: the hypotenuse of legs 6 and 8 is 10 | `len([6,8])` |

## R5. 3D view without a library

**Decision**: orthographic projection of three unit axes. Yaw and pitch angles are set by
dragging (or the arrow keys), and each axis is drawn as a coloured arrow with its label. The
draw order follows depth, so the nearer axis covers the farther one. Three toggle buttons flip
x, y or z. The label "right-handed / left-handed" comes from `handedness(axes)` (the sign of
the determinant). The colours follow the usual convention (x red, y green, z blue), using the
course's meaning colours: x = `--critical`, y = `--good`, z = `--classic`.

**Rationale**: about 60 lines; the engine part is testable in Node.

## R6. Research thinking: the camera and the cup

- **Context**: a robot sees a cup through a camera bolted above its base. The camera reports
  the cup at (0.3, 0.1) m in its own frame. The robot needs the cup in its base frame.
- **Question**: what else do you need to know, and how do you combine it?
- **Possible answers**: (1) measure the camera's position in the base frame and add it to the
  cup's position in the camera frame, as in the section 4 lab; (2) point the camera so that its
  frame coincides with the base frame (often impossible); (3) also find out how the camera is
  turned (needed in general; Part 2).
- **What was actually done**: robotics gives every object its own frame and chains the
  descriptions, base → camera → cup. Sources, verified 2026-10-23:
  - Lawrence G. Roberts, *Machine Perception of Three-Dimensional Solids*, PhD thesis, MIT, 1963
    (DSpace@MIT handle 1721.1/11589). One of the first programs to recover 3D objects from a
    camera image by relating object models and the camera with coordinate transformations.
    We claim only this; whether the 1963 thesis itself introduced homogeneous coordinates is
    not settled by the sources, so the lesson doesn't say it.
  - Richard P. Paul, *Robot Manipulators: Mathematics, Programming, and Control*, MIT Press,
    1981. Its first chapters are homogeneous transformations and transformation equations, the
    chains of frames robot programmers write.

**Decision**: these go in the research block's reveal and in further reading. There is no
Related papers section in M.1: both are a thesis and a book, not papers that fit a card, and the
spec allows leaving the section out (FR-009).

## R7. Check fixture and published list

**Decision**: `tools/fixtures/config.check.json` publishes `M.1 → lessons/m-1-vectors-and-frames.html`
and `M.2 → lessons/sample.html` (a fixture so the sample is still built and played), plus `G`.
`tools/check.js` changes as follows:

- the home page expects M.1 and M.2 as links and the rest "coming soon";
- the progress test visits M.1;
- the real glossary lists M.1's 8 terms; the check glossary lists 10.

The real `site/config.json` gets M.1 after the check passes.

## R8. Glossary entries

| id | title | alias regex | section |
|---|---|---|---|
| vector | Vector | `vectors?` | arrows |
| component | Component | `components?` | parts |
| magnitude | Length (magnitude) | `magnitude` | parts |
| unit-vector | Unit vector | `unit vectors?` | parts |
| coordinate-frame | Coordinate frame | `coordinate frames?` | frames |
| origin | Origin | `origins?` | frames |
| position-vector | Position vector | `position vectors?` | frames |
| right-handed-frame | Right-handed frame | `right-handed frames?` | three-d |

The text must make each alias's first match inside a section paragraph the defining mention.
For example, "origin" must not appear in sections 1–2 prose. The check confirms every term
gets a tooltip.
