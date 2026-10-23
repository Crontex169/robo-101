# Feature Specification: Lesson M.1, Vectors and Coordinate Frames

**Feature Branch**: `003-lesson-m1-vectors-frames`

**Created**: 2026-10-23

**Status**: Draft

**Input**: User description: "Lesson M.1 'Vectors and coordinate frames', the first real lesson of Part M (math toolkit), for a reader starting from zero. Goal: the reader can describe a point with a vector in a frame, add vectors head to tail, find a vector's length and unit direction, and convert a point between two frames that share orientation but have different origins (^A P = ^A P_{B origin} + ^B P), and knows what a right-handed 3D frame is. Prepares Lecture 8 material without rotations. Format per constitution; plain style; may use margin notes, one research thinking block, related reading only if real verified sources fit. Five planned sections, two labs, a DOM-free vector engine with checks, eight new glossary terms."

## Overview

This is the first lesson a real reader opens. Everything later in the course (rotation
matrices, frames attached to links, forward kinematics) describes *where things are*, and the
words for that are vectors and frames. The lesson takes someone who remembers a coordinate grid
from school and leaves them able to:

- read and draw a vector as an arrow with a length and a direction;
- add two vectors head to tail, and see that this is exactly how a robot arm's links "add up";
- split a vector into components, find its length and its unit direction;
- say what a coordinate frame is (an origin plus axes) and write a point's position vector in it;
- describe the same point from two frames that point the same way but sit in different places,
  and switch between the two descriptions;
- recognise a right-handed 3D frame.

Rotated frames are deliberately left out: they need trigonometry (M.2) and matrices (M.3), and
they return in Part 2.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Learn what a vector is by moving arrows (Priority: P1)

A beginner opens M.1. A short intro says what the lesson is for and how long it takes. A
three-question warm-up asks about things they already know from school: reading a point off a
grid, the Pythagorean theorem, and which way the axes on a graph point. Section 1 shows arrows
on a grid. The reader drags arrow tips, matches an arrow to a target, predicts where the sum of
two arrows ends before seeing it, then reaches a target by chaining two arrows head to tail. A
closing line connects this to the two-link arm: its links add up the same way.

**Why this priority**: vectors are the base of the whole course, and adding them head to tail
is the single idea the rest of M.1 builds on.

**Independent Test**: open the lesson, complete the warm-up and every mission of the section 1
lab, and confirm each mission checks its goal live and explains the result.

**Acceptance Scenarios**:

1. **Given** the first mission, **When** the reader drags the arrow until it has the same
   length and direction as the target arrow (within a set tolerance, anywhere on the grid), **Then** the mission is marked complete with a short
   explanation of what "same vector" means (same length and direction, wherever it starts).
2. **Given** the prediction mission, **When** the reader picks where the sum will end and runs
   it, **Then** the sum is drawn head to tail and the prediction is marked right or wrong with a
   reason.
3. **Given** the head-to-tail mission, **When** the reader adjusts two arrows so the second
   starts at the first one's tip and ends on the target, **Then** the mission completes and the
   text links the result to an arm's links.

---

### User Story 2 - Components, length and direction (Priority: P1)

Section 2 shows one draggable arrow with its two components drawn as the legs of a right
triangle, the length as the hypotenuse, and the unit vector (same direction, length one) drawn
alongside. Readouts update as the arrow moves.

**Why this priority**: the reader needs numbers, not just pictures, to work with frames in
section 4 and with every later lesson.

**Independent Test**: drag the arrow to a few positions, including one where a component is
negative and one with zero length, and confirm the readouts and the drawn unit vector are
correct.

**Acceptance Scenarios**:

1. **Given** the arrow at components (3, 4), **When** the reader looks at the readouts,
   **Then** the length is 5 and the unit vector is (0.6, 0.8).
2. **Given** the arrow shrunk to zero length, **When** the readouts update, **Then** the unit
   vector is shown as undefined, with a one-line reason, and nothing breaks.

---

### User Story 3 - One point, two frames (Priority: P1)

Section 3 introduces a frame as an origin plus two unit axes, and a point's position vector as
the arrow from the origin to the point, written with the frame's name as a small superscript in
front, the way the course slides do. Section 4 is a lab with two frames, {A} and {B}, that point
the same way. The reader drags {B}'s origin and the point P and sees both descriptions update:
P seen from {A}, P seen from {B}, and {B}'s origin seen from {A}. The missions ask the reader to
predict P's coordinates in {A} from its coordinates in {B} and {B}'s position, and then to place
{B} so that P has given coordinates in {B}.

**Why this priority**: describing the same point from different frames is what forward
kinematics does again and again. This is the lesson's main payoff.

**Independent Test**: play the section 4 lab, check that the three readouts always satisfy
"P in {A} = {B}'s origin in {A} + P in {B}", and complete both missions.

**Acceptance Scenarios**:

1. **Given** {B}'s origin at (2, 1) in {A} and P at (1, 3) in {B}, **When** the reader picks a
   prediction for P in {A} and reveals it, **Then** the answer (3, 4) is marked right and a wrong answer gets an
   explanation of the head-to-tail sum.
2. **Given** a target "P must be at (−1, 2) in {B}", **When** the reader drags {B} until it is,
   **Then** the mission completes, within a set tolerance.
3. **Given** any drag, **When** the readouts update, **Then** they are consistent with each
   other to the shown precision.

---

### User Story 4 - Into 3D: right-handed frames (Priority: P2)

Section 5 adds a third axis. A figure and a short interactive show a 3D frame from an angle the
reader can turn, explain the right-hand rule (x, then y, then z by curling the fingers), and let
the reader flip one axis to see that the frame becomes left-handed. The text says the whole
course uses right-handed frames, as the slides and Craig do.

**Why this priority**: needed from Part 2 on, but the 2D ideas carry the lesson. It can ship
as a figure plus prose if the interactive slips.

**Independent Test**: open section 5, turn the view, flip an axis, and confirm the label changes
between "right-handed" and "left-handed" correctly.

**Acceptance Scenarios**:

1. **Given** the standard frame, **When** the reader looks at it, **Then** it is labelled
   right-handed, and the text explains how to check that with the right hand.
2. **Given** the reader flips one axis, **When** the view updates, **Then** the frame is
   labelled left-handed; flipping two axes makes it right-handed again.

---

### User Story 5 - Check, think, and move on (Priority: P2)

After the sections, a research thinking block asks how a robot that sees a cup through a camera
can know where the cup is relative to its own base. A quiz of eight questions targets common
misconceptions (for example "a vector has a fixed starting point", "length can be negative",
"the order of adding vectors matters", "a point's coordinates are the same in every frame").
The wrap-up lists takeaways, one or two open questions, further reading, and a link to M.2. Two
or three margin notes in the author's voice appear along the way.

**Why this priority**: consolidates the lesson. Required by the lesson format, but it builds
on stories 1–4.

**Independent Test**: answer the quiz (all eight questions give feedback), open the research
thinking fold-outs, and confirm the wrap-up's next-lesson link only appears once M.2 is
published.

**Acceptance Scenarios**:

1. **Given** the quiz, **When** the reader answers every question, **Then** each answer gets an
   explanation and the total score is shown.
2. **Given** the research thinking block, **When** first shown, **Then** the answers and the
   real solution are folded, and the solution names the idea of chaining frames (the camera's
   position in the base frame plus the cup's position in the camera frame).

### Edge Cases

- Dragging an arrow tip onto its tail (zero vector): length 0, unit vector undefined, no crash
  and no division by zero shown as a number.
- Dragging outside the visible grid: positions clamp to the scene, and the arrow stays
  grabbable.
- A touch screen at 390 px: every handle is large enough to grab with a finger, and the page
  doesn't scroll while dragging inside a scene.
- Keyboard only: every draggable handle can be moved with the arrow keys, and missions can be
  completed without a pointer.
- Reduced motion: no animation is needed to understand any mission result.
- Readouts round to a fixed number of decimals; a mission tolerance is never smaller than the
  shown precision, so a readout never says "(3.00, 4.00)" while the mission says "not yet".

## Requirements *(mandatory)*

### Functional Requirements

**Lesson structure (constitution II, VII)**

- **FR-001**: The lesson MUST follow the course lesson format: a plain intro with time estimate
  and lab and mission counts, a three-question warm-up, five numbered sections, an
  eight-question misconceptions quiz and a wrap-up with takeaways, open questions, further
  reading and a conditional link to M.2.
- **FR-002**: The lesson MUST contain exactly two labs (sections 1 and 4) and at most two small
  interactives (sections 2, 3 and optionally 5). Section 3 MAY be prose with a figure only.
- **FR-003**: The page MUST pass the plain-page scan and the 390 px and dark-theme checks.
- **FR-004**: Formulas (component sum, length, unit vector, the frame-change sum) MUST sit in
  "Under the hood" fold-outs; the main text explains them in words and pictures.

**Content**

- **FR-005**: The lesson MUST use the course's notation from the start: a point P's position in
  frame {A} written with a leading superscript A, and {B}'s origin in {A} written the same way,
  matching the slides and Craig.
- **FR-006**: Section 1 MUST state the connection between head-to-tail addition and an arm's
  links adding up, and link to nothing that isn't published.
- **FR-007**: Section 4 MUST be limited to frames that point the same way (translation only), and
  the text MUST say that turned frames come later (Part 2).
- **FR-008**: Section 5 MUST define a right-handed frame and state that the whole course uses
  right-handed frames.
- **FR-009**: The lesson MUST contain one research thinking block and two or three margin notes.
  A Related papers section is included only if a real, verified source fits a beginner math
  lesson; otherwise the wrap-up's further reading carries the references.
- **FR-010**: The lesson MUST introduce and glossarise these terms at their first mention:
  vector, component, length (magnitude), unit vector, coordinate frame, origin, position vector,
  right-handed frame.

**Labs and missions (constitution II)**

- **FR-011**: The section 1 lab MUST have three missions: match a target arrow; predict where a
  sum ends before it is shown; reach a target by chaining two arrows head to tail. A free-play
  step follows.
- **FR-012**: The section 4 lab MUST have two missions: predict P's coordinates in {A} from its
  coordinates in {B} and {B}'s origin; place {B} so that P has given coordinates in {B}. A
  free-play step follows.
- **FR-013**: Every mission MUST check its goal live (✓/✗), explain the result after success,
  and work with mouse, touch and keyboard.
- **FR-014**: Every handle in every scene MUST be draggable with a pointer and movable with the
  arrow keys when focused, and every scene MUST carry a text description for screen readers.

**Correctness (constitution III)**

- **FR-015**: Every number the text, the missions or the quiz states (for example 3-4-5, the
  unit vector (0.6, 0.8), the frame example (2, 1) + (1, 3) = (3, 4)) MUST be computed by the
  lesson's vector engine and verified by an automated check.
- **FR-016**: The vector engine MUST work without a browser so the checks can run it directly.

**Publishing**

- **FR-017**: The lesson MUST have its own check script that verifies the engine's numbers,
  plays every mission, the warm-up, the quiz, the research block, dark theme and 390 px. It
  MUST be part of the site check.
- **FR-018**: The lesson MUST be added to the published list as M.1 only after the site check
  passes; the home page then shows it as available.

### Key Entities

- **Vector**: two (or three) components; derived length and unit direction (undefined at zero
  length).
- **Frame**: a name ({A}, {B}), an origin given in a parent frame, axes parallel to the parent's
  in this lesson.
- **Point**: a position, describable in any frame as a position vector.
- **Mission**: goal text, live criteria, optional prediction, explanation on success (existing
  course model).
- **Glossary term**: id, title, one-line definition, lesson and section where it's introduced
  (existing course model).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reader starting from zero completes the lesson, including every mission, in
  30–50 minutes.
- **SC-002**: 100 % of the numbers stated in text, missions and quiz match the engine's output
  in the automated check.
- **SC-003**: Every mission can be completed with the keyboard alone and on a 390 px touch
  screen.
- **SC-004**: The lesson passes the full site check (plain scan, dark theme, 390 px, no errors),
  and the home page lists M.1 as available.
- **SC-005**: After the lesson, a reader can answer "where is P in {A}?" for a translated frame
  {B} without the scene. The quiz contains at least two such questions with different numbers.
- **SC-006**: The project owner, reading the lesson, judges it clear for a beginner and plain
  in style.

## Assumptions

- The warm-up of the first lesson reviews school knowledge (grid coordinates, Pythagoras, axis
  directions) instead of a previous lesson, and links back to the home page's "How a lesson
  works" section.
- 2D scenes use metres-free "units" on a grid, because no physical arm is involved yet. The
  section 1 closing line refers to the sample-style two-link arm only in words.
- Section 5's interactive is a simple turnable 3D frame drawn in the page's own canvas. No 3D
  library is added (constitution V). If it turns out heavier than a small interactive, it falls
  back to a static figure.
- Rotations, dot products and matrices are out of scope (M.2–M.4 and Part 2).
- Craig and the slides are references for notation and scope only. No text, figures or
  exercises are copied (constitution IV).
- The output file is `lessons/m-1-vectors-and-frames.html`, matching the name the sample
  lesson's "Next" link already expects.
