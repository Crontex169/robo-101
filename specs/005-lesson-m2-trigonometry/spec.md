# Feature Specification: Lesson M.2, Trigonometry for Robot Arms

**Feature Branch**: `005-lesson-m2-trigonometry`

**Created**: 2026-10-23

**Status**: Draft (owner reviews M.1 and M.2 together before publishing)

**Input**: Owner: "Do the next one too; then I'll check both at once." Program entry M.2
"Robot kolları için trigonometri".

## Overview

M.1 gave the reader vectors and frames, but every arrow was given by its components. A robot
joint doesn't know components: it knows an angle. M.2 connects the two. A reader who finishes it
can:

- measure angles in degrees and radians, positive counterclockwise;
- read cos θ and sin θ off the unit circle, with their signs in every quadrant;
- turn a link of length L at angle θ into the vector (L cos θ, L sin θ), and add two links whose
  angles add up (the two-link arm);
- get the angle back from components with atan2, and see why plain arctan fails;
- find the angle between two links from three lengths with the law of cosines, which is the
  first step of inverse kinematics.

The site text is Turkish (constitution v1.3.0). Decimals use a point.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Angles and the unit circle (Priority: P1)

The reader starts with a warm-up on M.1, with links back to its sections. Section 1 introduces
degrees and radians. Section 2 is a lab: a point on the unit circle whose x is cos θ and whose
y is sin θ. The reader drags it and completes three missions: find an angle with cos θ = 0.5;
predict the sign of sin 210°; set the angle to one radian. Then comes free play.

**Independent Test**: complete the warm-up and the three missions with the pointer and with the
keyboard.

**Acceptance Scenarios**:

1. **Given** mission 1, **When** the point sits where x = 0.5 (±0.01), **Then** it completes, and
   the explanation says both 60° and −60° work.
2. **Given** mission 2, **When** the reader bets and runs, **Then** "negatif" is the right answer
   (sin 210° = −0.5).
3. **Given** mission 3, **When** θ is within 1° of 57.3°, **Then** it completes, and the
   explanation says that the arc is then as long as the radius.

### User Story 2 - A link is a length and an angle (Priority: P1)

Section 3 writes a link of length L at angle θ as (L cos θ, L sin θ). It then shows a two-link
arm, L₁ = L₂ = 1, where the second link points along θ₁ + θ₂. Lab 2 has two angle sliders, plus
dragging and keys. Missions: predict the hand position for θ₁ = 90°, θ₂ = −90° (answer (1, 1));
put the hand on the target (0.87, 1.5).

**Acceptance Scenarios**:

1. **Given** mission 1, **When** the reader bets (1, 1) and runs, **Then** the bet is right and
   the explanation adds the two link vectors.
2. **Given** mission 2, **When** the hand is within 0.05 of (0.87, 1.5), **Then** it completes
   (θ₁ = 30°, θ₂ = 60° is one answer).

### User Story 3 - Angles back from components (Priority: P1)

In section 4, a small interactive places a draggable point. It shows arctan(y/x) and atan2(y, x)
side by side, so the reader sees them disagree in the left half and sees arctan fail at x = 0.

**Acceptance Scenarios**:

1. **Given** the point (−1, 1), **Then** arctan(y/x) reads −45° and atan2 reads 135°.
2. **Given** x = 0, **Then** arctan reads "tanımsız" and atan2 still gives ±90°.

### User Story 4 - The law of cosines and the elbow (Priority: P2)

Section 5 has a slider for the distance d from the base to the target, with L₁ = L₂ = 1. It shows
the triangle, the angle γ between the links, and the elbow angle θ₂ = 180° − γ. When d > 2 it
reports "ulaşılamaz".

**Acceptance Scenarios**:

1. **Given** d = √2 (1.41), **Then** γ reads 90° and θ₂ reads 90°.
2. **Given** d = 2.2, **Then** the readout says the target can't be reached and explains why
   (cos γ < −1).

### User Story 5 - Think, check, wrap up (Priority: P2)

A research thinking block asks how a small computer with no fast multiplier can compute sin and
cos. The reveal is CORDIC (Volder, 1959), with a Related papers card. The lesson also has an
8-question quiz, 2–3 margin notes, glossary terms, and a wrap-up with a conditional link to M.3.

## Requirements *(mandatory)*

- **FR-001**: Lesson format and plain style as in M.1: intro, warm-up, five numbered sections,
  quiz, wrap-up; labs only in sections 2 and 3; small interactives in sections 4 and 5;
  section 1 is prose with a figure.
- **FR-002**: The warm-up has three questions on M.1, each linking to its M.1 section.
- **FR-003**: Every stated number (π, 57.3°, cos 60° = 0.5, sin 210° = −0.5, (1, 1),
  (0.87, 1.5), −45° vs 135°, √2 → 90°, 3-4-5 → 90°, the quiz numbers) is computed by the
  engine and checked in Node.
- **FR-004**: Formulas live in "Perde arkası" fold-outs.
- **FR-005**: New glossary terms (Turkish, with English): radyan, birim çember, sinüs, kosinüs,
  kutupsal koordinatlar, atan2, kosinüs teoremi.
- **FR-006**: Keyboard, touch, 390 px, dark theme and the plain scan, as for M.1.
- **FR-007**: The lesson's own check script, run by `tools/check.js`. M.2 goes on the published
  list once the check passes. The owner reviews before it is merged and pushed.
- **FR-008**: Every citation is verified (Volder 1959: title, journal, volume, issue, pages,
  DOI).

## Success Criteria *(mandatory)*

- **SC-001**: 30–50 minutes for a beginner.
- **SC-002**: Every number the lesson states matches the engine.
- **SC-003**: Every mission can be completed with the keyboard and at 390 px.
- **SC-004**: The site check passes with M.1 and M.2 published.
- **SC-005**: The owner judges M.1 and M.2 clear and natural in Turkish.

## Assumptions

- The two-link arm uses L₁ = L₂ = 1 "birim" (units), as M.1 does; metres return in Part 1.
- Inverse kinematics proper (both elbow solutions, θ₁ from atan2) is Part 4. Section 5 only
  finds the angle between the links.
- Output file `lessons/m-2-trigonometry.html`, the name M.1 already links to.
