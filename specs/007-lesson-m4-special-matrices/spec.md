# Feature Specification: Lesson M.4, Special Matrices

**Feature Branch**: `007-lesson-m4-special-matrices`

**Created**: 2026-11-02

**Status**: Draft

**Input**: Owner: "projeyi yapmaya devam edelim" (continue). Program entry M.4 "Özel matrisler".
Scope deferred from M.3: orthogonality, transpose, inverse, determinant, homogeneous transforms.

## Overview

M.3 read a matrix as a move of the plane and built R(θ). It ended on two open questions: what
happens when the two columns fall on one line, and which matrix undoes a rotation. M.4 answers
both and shows what makes rotation matrices special. A reader who finishes it can:

- compute a dot product, read a·b = 0 as "perpendicular" and a·a = 1 as "unit length";
- transpose a matrix, and read AᵀA as the table of dot products of A's columns;
- recognise an orthogonal matrix (AᵀA = I: unit columns at right angles) and see that R(θ) is one;
- undo a transformation with its inverse; see that for a rotation the inverse is just the
  transpose, R(θ)ᵀ = R(−θ);
- read the determinant as the signed area of the unit square after the move: 0 means the plane
  was flattened (no inverse), a negative sign means a mirror flip, every rotation has
  determinant 1;
- name a rotation matrix as "orthogonal with determinant +1", and see a first preview of the
  homogeneous trick that packs rotate-and-shift into one 3×3 matrix (full treatment in 2.2).

Out of scope: eigenvalues, general n×n determinants and inverses beyond 2×2 (3×3 only in prose),
the 4×4 homogeneous transform and its inverse (lesson 2.2), Euler angles (2.3).

The site text is Turkish (constitution v1.3.0). Decimals use a point.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The dot product (Priority: P1)

The reader starts with a warm-up on M.3, with links back to its sections. Section 1 (prose with
a figure and a small interactive) introduces the dot product a·b = aₓbₓ + a_yb_y. Two worked
examples: (1, 2)·(3, 1) = 5 and (3, 4)·(4, −3) = 0. The interactive lets the reader turn vector b
around a fixed a (angle slider, with keys) and shows a·b live; it reads 0 exactly when b is at
right angles to a. A "Perde arkası" fold-out gives a·b = |a||b| cos φ and ties it to M.2's cosine.
The text notes a·a = |a|², so a unit vector has a·a = 1.

**Independent Test**: answer the warm-up; the worked dot products in the text match the engine.

**Acceptance Scenarios**:

1. **Given** the warm-up, **When** the reader answers a question, **Then** the feedback links to
   the matching M.3 section.
2. **Given** section 1, **Then** the worked examples read 5 and 0.
3. **Given** the interactive with a = (2, 0) and |b| = 1, **When** the angle is 90°, **Then** the
   readout shows a·b = 0; at 60° it shows 1.

### User Story 2 - Transpose and orthogonal matrices (Priority: P1)

Section 2 is a lab. The transpose Aᵀ is introduced first in prose (rows become columns;
[[2, −1], [1, 1]]ᵀ = [[2, 1], [−1, 1]]). The text then shows that AᵀA lists the dot products of
A's columns: c₁·c₁, c₁·c₂, c₂·c₁, c₂·c₂. In the lab, column 1 is set by an angle slider (unit
length); the reader drags the tip of column 2. The scene shows the two columns and the moved
grid; the readout shows the three dot products and AᵀA. Missions:

1. Make AᵀA = I. There are two answers; find one. (Column 2 at +90° from column 1, or at −90°.)
2. Find the other answer. The explanation says one of them is a rotation and the other a mirror
   flip, and points ahead to section 4 to tell them apart with one number.
3. Predict, then run: for R(30°), is R(30°)ᵀ R(30°) equal to I? (Yes.)
4. Free play.

**Independent Test**: complete the four missions with the pointer and with the keyboard.

**Acceptance Scenarios**:

1. **Given** column 1 at 0°, **When** column 2 is (0, 1), **Then** AᵀA reads [[1, 0], [0, 1]] and
   mission 1 completes; **When** column 2 is then moved to (0, −1), **Then** mission 2 completes.
2. **Given** mission 3, **When** the reader bets "evet" and runs, **Then** the bet is right and
   AᵀA reads I.

### User Story 3 - Undoing a move: the inverse (Priority: P1)

Section 3 is a small interactive. A shape (the letter F, as in M.3) is moved by R(50°). The reader
sets the angle of a second rotation with a slider (with keys) and sees the shape moved by both.
When the angle is −50°, the shape is back home. The readout shows R(50°)ᵀ next to the reader's
matrix so they see the two are equal at −50°. The text defines the inverse A⁻¹ by A⁻¹A = I and
states R(θ)⁻¹ = R(θ)ᵀ = R(−θ). A "Perde arkası" fold-out gives the 2×2 inverse formula
[[a, b], [c, d]]⁻¹ = 1/(ad − bc) · [[d, −b], [−c, a]] with M.3's worked matrix:
[[2, −1], [1, 1]]⁻¹ = 1/3 · [[1, 1], [−1, 2]], which sends M.3's answer (0, 3) back to (1, 2).
The fold-out notes that the formula fails when ad − bc = 0 and names that number for section 4.

**Acceptance Scenarios**:

1. **Given** the undo angle −50°, **Then** the shape is back at its start and the reader's matrix
   equals R(50°)ᵀ, both reading [[0.64, 0.77], [−0.77, 0.64]].
2. **Given** the fold-out, **Then** the inverse reads 1/3 · [[1, 1], [−1, 2]] and its product with
   (0, 3) reads (1, 2).

### User Story 4 - The determinant (Priority: P1)

Section 4 is a lab. The reader drags the tips of both columns (snapping to 0.5), as in M.3's
section 2. The unit square is drawn after the move as a shaded parallelogram, with its signed
area det A = ad − bc shown live. A flipped square (det < 0) is drawn in a different shade.
Missions:

1. Make the area 3. (Any matrix with det 3, for example M.3's [[2, −1], [1, 1]].)
2. Predict, then run: the shear with columns (1, 0) and (1, 1). What is its area? (1: the square
   leans but keeps its area.)
3. Flatten it: put both columns on one line. The explanation ties det = 0 to M.3's open question
   and to section 3: the plane is squashed, many points land on one, and no inverse exists.
4. Flip it: make det negative. The explanation says this is a mirror image, links to mission 2
   of section 2, and states that every rotation has det = 1.
5. Free play.

**Acceptance Scenarios**:

1. **Given** columns (2, 1) and (−1, 1), **Then** the readout shows det = 3 and mission 1
   completes.
2. **Given** mission 2, **When** the reader bets 1 and runs, **Then** the bet is right.
3. **Given** columns (1, 1) and (2, 2), **Then** det reads 0, the readout says there is no inverse,
   and mission 3 completes.
4. **Given** columns (1, 0) and (0, −1), **Then** det reads −1, the square is drawn flipped, and
   mission 4 completes.

### User Story 5 - What a rotation matrix is, a look ahead, think, check, wrap up (Priority: P2)

Section 5 (prose with a figure) puts the pieces together: a rotation matrix is an orthogonal
matrix with determinant +1. The same holds for the 3×3 R_z(θ) of M.3 (stated, with
R_z(90°)ᵀ R_z(90°) = I worked out). Then a short look ahead: a rotation alone can't shift a point,
but one extra row and column can. The 3×3 matrix [[0, −1, 2], [1, 0, 1], [0, 0, 1]] rotates by
90° and then shifts by (2, 1); acting on (1, 0, 1) it gives (2, 2, 1), the point (2, 2). The text
says this is the homogeneous transform, the main tool of lesson 2.2 and of forward kinematics.

A research thinking block asks: "A shift is not a linear move (it doesn't keep the origin), so
why can a matrix do it?" The reveal: add a coordinate that is always 1 (homogeneous coordinates,
Möbius 1827); Denavit and Hartenberg (1955) used such matrices to describe linkages, the notation
behind Part 3. A Related papers card lists the verified source(s).

The lesson also has an 8-question quiz, 2–3 margin notes, glossary terms, and a wrap-up with a
conditional link to M.5.

**Acceptance Scenarios**:

1. **Given** section 5, **Then** the homogeneous example reads (2, 2, 1).
2. **Given** the quiz, **When** every right answer is marked, **Then** the score reads 8 / 8, and
   every number in the answers matches the engine.
3. **Given** M.5 is not published, **Then** the wrap-up names M.5 without a link.

### Edge Cases

- Section 1: b at 90° must read exactly 0, never −0 or 0.00000001 shown as −0.
- Section 2: column 2 at (0, 0). AᵀA shows zeros; nothing breaks. Column 2 snaps to the unit
  circle and to ±90° from column 1 when within 0.1, so missions 1–2 can be done by hand and by
  keyboard; the checks use a tolerance of 0.05.
- Section 3: undo angle 310° is the same as −50°; the slider range is −180° to 180°, so this
  doesn't arise. Within 1° of −50° counts as home.
- Section 4: both columns at (0, 0): det 0, square drawn as a point; the lab doesn't break.
- Section 4: det = 0 never shows a division or "Infinity" anywhere; the inverse readout says
  "ters yok".
- Every readout rounds to two decimals and never shows −0.

## Requirements *(mandatory)*

- **FR-001**: Lesson format and plain style as in M.1–M.3: intro, warm-up, five numbered
  sections, quiz, wrap-up. Labs in sections 2 and 4; small interactives in sections 1 and 3;
  section 5 is prose with a figure.
- **FR-002**: The warm-up has three questions on M.3, each linking to its M.3 section.
- **FR-003**: Every stated number is computed by the engine and checked in Node: 5 and 0; the
  section 1 readout at 60° and 90°; [[2, 1], [−1, 1]]; AᵀA = I for the two mission answers and
  for R(30°); R(50°)ᵀ; 1/3 · [[1, 1], [−1, 2]] and (1, 2); det 3, 1, 0, −1; R_z(90°)ᵀR_z(90°) = I;
  (2, 2, 1); the quiz numbers.
- **FR-004**: Formulas (a·b = |a||b| cos φ, the 2×2 inverse, (AB)ᵀ = BᵀAᵀ) live in
  "Perde arkası" fold-outs.
- **FR-005**: New glossary terms (Turkish, with English): nokta çarpımı (dot product), dik
  (orthogonal), devrik matris (transpose), dik matris (orthogonal matrix), ters matris (inverse),
  determinant, yansıma (reflection), homojen koordinatlar (homogeneous coordinates). Earlier terms
  (vektör, birim vektör, kosinüs, matris, dönme matrisi, matris çarpımı, birim matris) are linked
  at first mention.
- **FR-006**: Keyboard, touch, 390 px, dark theme and the plain scan, as for M.1–M.3. Draggable
  tips also move with the arrow keys (0.5 steps in section 4; section 2 as in the edge cases).
- **FR-007**: The lesson's own check script, run by the site check. M.4 goes on the published
  list once the check passes. The owner reviews before it is merged and pushed.
- **FR-008**: Every citation is verified (title, venue, volume, pages, DOI or stable link).
- **FR-009**: Colour carries meaning (Principle VII): column 1/x̂ and column 2/ŷ keep M.3's two
  colours; the flipped square in section 4 uses one extra colour used for nothing else.
- **FR-010**: M.3's two open questions (columns on one line; undoing a rotation) are answered in
  sections 3 and 4, and the M.3 wrap-up link to M.4 resolves once M.4 is published.

## Success Criteria *(mandatory)*

- **SC-001**: 30–50 minutes for a beginner.
- **SC-002**: Every number the lesson states matches the engine.
- **SC-003**: Every mission can be completed with the keyboard and at 390 px.
- **SC-004**: The site check passes with M.1–M.4 published.
- **SC-005**: The owner judges M.4 clear and natural in Turkish.

## Assumptions

- Matrices act on column vectors from the left (v′ = A v), as in M.3.
- Homogeneous transforms are a preview only (one worked 3×3 example in 2D); the 4×4 form, its
  inverse and chaining frames belong to lesson 2.2. Owner can move more into M.4 if wanted.
- The dot product is new here (M.1–M.3 did not teach it) and is needed for orthogonality.
- 3D is prose only; no 3D scene in this lesson.
- Output file `lessons/m-4-special-matrices.html`, the name M.3 already links to.
- If Möbius 1827 or Denavit–Hartenberg 1955 can't be verified in the plan phase, the research
  block picks another verified source on the same question.
