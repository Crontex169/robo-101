# Feature Specification: Lesson M.3, Matrices as Transformations

**Feature Branch**: `006-lesson-m3-matrices`

**Created**: 2026-11-01

**Status**: Draft

**Input**: Owner: "tamam başla" (start M.3). Program entry M.3 "Dönüşüm olarak matrisler".

## Overview

M.2 rotated a link by writing (L cos θ, L sin θ) by hand. That works for one vector at a time.
M.3 packs a whole transformation into one table of numbers, the matrix, and reads that table as
a move of the whole plane. A reader who finishes it can:

- multiply a 2×2 matrix by a vector and read it as "x times the first column plus y times the
  second column";
- see that the columns are where x̂ and ŷ land, and read any 2×2 matrix as a change of the grid;
- build the rotation matrix R(θ) from M.2's cos and sin, and check that R(θ)·(L, 0) gives M.2's
  (L cos θ, L sin θ);
- compose two transformations as a matrix product, with AB meaning "B first, then A"; see that
  order matters for rotate and scale, and that two rotations compose by adding angles (the
  two-link arm of M.2);
- read the 3×3 rotation about z as the 2D one with the z row and column left alone.

Out of scope, saved for M.4 "Özel matrisler": orthogonality, transpose, inverse, determinant,
homogeneous transforms.

The site text is Turkish (constitution v1.3.0). Decimals use a point.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A matrix times a vector (Priority: P1)

The reader starts with a warm-up on M.2, with links back to its sections. Section 1 (prose with
a figure) introduces a matrix as a table with two columns. It works one product by hand:
[[2, −1], [1, 1]]·(1, 2) = 1·(2, 1) + 2·(−1, 1) = (0, 3). A "Perde arkası" fold-out gives the
row-by-row rule and shows it gives the same answer.

**Independent Test**: answer the warm-up; the worked product in the text matches the engine.

**Acceptance Scenarios**:

1. **Given** the warm-up, **When** the reader answers a question, **Then** the feedback links to
   the matching M.2 section.
2. **Given** section 1, **Then** the worked product reads (0, 3), and the column reading and the
   row rule give the same answer.

### User Story 2 - Columns move the grid (Priority: P1)

Section 2 is a lab. The scene shows the grid, x̂ and ŷ, and one sample vector v. The reader drags
the tips of the two column vectors (snapping to 0.5). The grid, v and the live matrix readout
follow. Missions:

1. Double everything: make the matrix that sends every vector to twice its length.
2. Predict, then run: with columns (1, 0) and (1, 1) (a shear), where does (1, 1) land?
3. Rotate by 90° counterclockwise.
4. Free play.

**Independent Test**: complete the four missions with the pointer and with the keyboard.

**Acceptance Scenarios**:

1. **Given** mission 1, **When** the columns are (2, 0) and (0, 2), **Then** it completes, and
   the explanation says each column is where a unit vector lands.
2. **Given** mission 2, **When** the reader bets (2, 1) and runs, **Then** the bet is right
   (1·(1, 0) + 1·(1, 1)), and the grid squares are shown leaning but not stretched in height.
3. **Given** mission 3, **When** the columns are (0, 1) and (−1, 0), **Then** it completes, and
   the explanation points ahead to R(90°) in section 3.

### User Story 3 - The rotation matrix (Priority: P1)

Section 3 is a small interactive. An angle slider (with keys) sets θ, and the readout shows
R(θ) = [[cos θ, −sin θ], [sin θ, cos θ]] with live numbers. A link of length L = 2 along the x
axis turns with it. The text ties the columns back to M.2's unit circle: the first column is the
point at angle θ, the second is the point at θ + 90°.

**Acceptance Scenarios**:

1. **Given** θ = 30°, **Then** R(θ) reads [[0.87, −0.5], [0.5, 0.87]], and R(θ)·(2, 0) reads
   (1.73, 1), the same as M.2's (2 cos 30°, 2 sin 30°).
2. **Given** θ = 90°, **Then** R(θ) reads [[0, −1], [1, 0]], the matrix of section 2's
   mission 3.

### User Story 4 - Order matters (Priority: P1)

Section 4 is a lab. Two transformations, A and B, are picked from a short list (rotate by an
angle, scale x and y). The scene shows a shape (for example, a small arrow or the letter F) moved
by AB and by BA side by side, with both products as matrices. Missions:

1. Predict, then run: R = R(90°), S = scale x by 2. Do RS and SR send (1, 0) to the same place?
   (No: RS·(1, 0) = (0, 2), SR·(1, 0) = (0, 1).)
2. Make the order stop mattering: pick a scale that gives RS = SR for R = R(90°). (Any equal
   scale on x and y, for example 2 and 2.)
3. Two rotations: with R(60°) set first, pick α so that R(α)·R(60°) = R(90°) (α = 30°). The
   explanation links to M.2's two-link arm, where the second link points along θ₁ + θ₂.
4. Free play.

**Acceptance Scenarios**:

1. **Given** mission 1, **When** the reader bets "farklı" and runs, **Then** the bet is right,
   and the two answers (0, 2) and (0, 1) are shown.
2. **Given** mission 2, **When** the scale is equal on both axes, **Then** RS and SR show the
   same matrix ([[0, −2], [2, 0]] for scale 2) and the mission completes.
3. **Given** mission 3, **When** α is within 1° of 30°, **Then** it completes.

### User Story 5 - Into 3D, think, check, wrap up (Priority: P2)

Section 5 (prose with a figure) shows R_z(θ) as a 3×3 matrix: the 2D rotation in the top-left,
1 in the bottom-right, zeros elsewhere. A worked example: R_z(90°)·(1, 0, 5) = (0, 1, 5), so
height stays the same. A research thinking block asks why matrix multiplication is defined in
the "row times column" way and not entry by entry. The reveal: it is the rule that makes the
product of two matrices the matrix of "do one, then the other" (Cayley, 1858), with a Related
papers card. The lesson also has an 8-question quiz, 2–3 margin notes, glossary terms, and a
wrap-up with a conditional link to M.4.

**Acceptance Scenarios**:

1. **Given** the quiz, **When** every right answer is marked, **Then** the score reads 8 / 8,
   and every number in the answers matches the engine.
2. **Given** M.4 is not published, **Then** the wrap-up names M.4 without a link.

### Edge Cases

- Section 2: columns dragged onto the same line (for example (1, 1) and (2, 2)) squash the grid
  into a line. The lab shows it and does not break; the readout says the plane was flattened.
  The word "determinant" is not used (M.4).
- Section 2: a column dragged to (0, 0). Same as above.
- Section 3: θ = 0 gives the identity [[1, 0], [0, 1]]; −0 is never shown.
- Section 4: two rotations always commute; the text says so after mission 3 so the reader
  doesn't think every pair fails.
- Every readout rounds to two decimals and never shows −0.

## Requirements *(mandatory)*

- **FR-001**: Lesson format and plain style as in M.1 and M.2: intro, warm-up, five numbered
  sections, quiz, wrap-up. Labs in sections 2 and 4; a small interactive in section 3; sections
  1 and 5 are prose with a figure.
- **FR-002**: The warm-up has three questions on M.2, each linking to its M.2 section.
- **FR-003**: Every stated number is computed by the engine and checked in Node: (0, 3);
  (2, 1); R(30°) and (1.73, 1); R(90°); RS and SR and their images of (1, 0); [[0, −2], [2, 0]];
  α = 30°; (0, 1, 5); the quiz numbers.
- **FR-004**: Formulas and the row rule live in "Perde arkası" fold-outs.
- **FR-005**: New glossary terms (Turkish, with English): matris, sütun vektörü,
  matris-vektör çarpımı, doğrusal dönüşüm, dönme matrisi, matris çarpımı, birim matris. Earlier
  terms (vektör, birim vektör, bileşen, kosinüs, sinüs, birim çember) are linked at first
  mention.
- **FR-006**: Keyboard, touch, 390 px, dark theme and the plain scan, as for M.1 and M.2. The
  draggable column tips also move with the arrow keys in 0.5 steps.
- **FR-007**: The lesson's own check script, run by the site check. M.3 goes on the published
  list once the check passes. The owner reviews before it is merged and pushed.
- **FR-008**: Every citation is verified (Cayley 1858: title, journal, volume, pages, DOI).
- **FR-009**: Colour carries meaning (Principle VII): the first column/x̂ and the second
  column/ŷ keep the same two colours in every scene and in the matrix readouts.

## Success Criteria *(mandatory)*

- **SC-001**: 30–50 minutes for a beginner.
- **SC-002**: Every number the lesson states matches the engine.
- **SC-003**: Every mission can be completed with the keyboard and at 390 px.
- **SC-004**: The site check passes with M.1, M.2 and M.3 published.
- **SC-005**: The owner judges M.3 clear and natural in Turkish.

## Assumptions

- Matrices act on column vectors from the left (v′ = A v), as in Craig and Modern Robotics.
  AB means "B first, then A"; the lesson says this out loud.
- Section 4's list of transformations stays small (rotation by an angle, scale per axis) so the
  lab teaches order, not a menu.
- 3D is prose only; no 3D scene in this lesson.
- Output file `lessons/m-3-matrices-as-transformations.html`, the name M.2 already links to.
- If Cayley 1858 can't be verified in the plan phase, the research block picks another verified
  source on the same question.
