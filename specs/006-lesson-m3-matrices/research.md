# Research: Lesson M.3

## R1. Outline

| # | id | Title (Turkish on the page) | Form | ≈ min |
|---|---|---|---|---|
| — | recall | Warm-up on M.2 (3 questions with section links) | warm-up | 2 |
| 1 | product | Matris çarpı vektör | prose + SVG figure | 6 |
| 2 | grid | Sütunlar ızgarayı taşır | **Lab 1**, 3 missions + free play | 10 |
| 3 | rotation | Dönme matrisi | small interactive | 6 |
| 4 | order | İki dönüşüm üst üste: sıra önemli | **Lab 2**, 3 missions + free play | 10 |
| 5 | rotz | Üç boyuta bir bakış: z ekseni etrafında dönme | prose + SVG figure | 4 |
| — | papers | İlgili makaleler (Cayley 1858) | 1 card | 2 |
| — | quiz, finale | 8 questions, wrap-up | | 8 |

Total ≈ 48 min. The research thinking block (why "row times column") sits at the end of
section 4, right after the reader has seen that a product means "do one, then the other".

## R2. Scenes

- **Lab 1 (grid).** Same grid as M.1, 60 px per unit, range −3…3, origin at the centre. Two
  handles: the tip of column 1 (image of x̂) and of column 2 (image of ŷ), snapping to 0.5. Keys:
  arrows move the focused tip 0.5. The transformed grid is drawn as thin lines through
  A·(i, j); the original grid stays faint behind it. The sample vector v = (1, 1) and its image
  A v are drawn; mission 2 hides A v until the bet. Readout: the matrix with column 1 and
  column 2 in their two colours, and A v. If the columns are parallel (cross product 0), the
  readout says "Düzlem bir doğruya ezildi" (no "determinant").
  Mission 2 sets the columns to (1, 0) and (1, 1) and locks them until the bet.
- **Rotation (small interactive).** Slider θ from −180° to 180°, step 1°; keys ±5°, Shift ±1°.
  Link L = 2 from the origin, drawn as R(θ)·(2, 0), with the unit-circle arc of M.2. Readout:
  R(θ) to 2 decimals and R(θ)·(2, 0).
- **Lab 2 (order).** Two side-by-side small scenes, "önce B, sonra A" (AB) and "önce A, sonra B"
  (BA), each showing an F-shaped figure (asymmetric, so a flip or a turn is visible) before and
  after. Controls: A is a rotation (angle slider, step 5°); B is a scale (sx, sy sliders from
  0.5 to 2, step 0.5) or, in mission 3, a second rotation. Readout: the matrices AB and BA, and
  where each sends (1, 0).
  - Mission 1: A = R(90°), B = S(2, 1), locked; bet "aynı" / "farklı".
  - Mission 2: A = R(90°) locked; sx, sy free; done when AB = BA (equal within 1e-9), which
    happens exactly when sx = sy.
  - Mission 3: B = R(60°) locked; A = R(α) free; done when |α − 30°| ≤ 1°. After success the
    explanation adds that rotations always commute, unlike mission 1.

## R3. Numbers asserted in Node

| Statement | Engine |
|---|---|
| [[2, −1], [1, 1]]·(1, 2) = (0, 3), also as 1·(2, 1) + 2·(−1, 1) | `Vec.mv`, `Vec.add`, `Vec.scale` |
| 2I·(x, y) = (2x, 2y) for (1, 1) and (−1, 0.5) | `Vec.mv` |
| [[1, 1], [0, 1]]·(1, 1) = (2, 1) | `Vec.mv` |
| rot(90°) = [[0, −1], [1, 0]] (no −0 in the readout) | `Vec.rot`, `Vec.num` |
| rot(30°) = [[0.87, −0.5], [0.5, 0.87]]; rot(30°)·(2, 0) = (1.73, 1) = polar(2, 30°) | `Vec.rot`, `Vec.polar` |
| rot(0°) = I | `Vec.rot` |
| R(90°)S(2, 1) = [[0, −1], [2, 0]], sends (1, 0) to (0, 2) | `Vec.mm`, `Vec.mv` |
| S(2, 1)R(90°) = [[0, −2], [1, 0]], sends (1, 0) to (0, 1) | `Vec.mm`, `Vec.mv` |
| R(90°)S(2, 2) = S(2, 2)R(90°) = [[0, −2], [2, 0]] | `Vec.mm` |
| R(30°)R(60°) = R(90°) = R(60°)R(30°) | `Vec.mm`, `Vec.rot` |
| rotZ(90°)·(1, 0, 5) = (0, 1, 5) | `Vec.rotZ`, `Vec.mv` |
| warm-up: cos 60° = 0.5; polar(2, 90°) = (0, 2); (90°, −90°) arm → (1, 1) | `Math`, `Vec.polar`, `PlanarArm.fk` |
| quiz numbers (see the quiz in the lesson) | as above |

## R4. Cayley citation (verified 2026-11-01)

A. Cayley, "A Memoir on the Theory of Matrices", *Philosophical Transactions of the Royal
Society of London* 148: 17–37, 1858. DOI 10.1098/rstl.1858.0002. Crossref returns this title,
author, journal and pages for the DOI; the volume and pages match the collected-papers listing
(vol. cxlviii, pp. 17–37; received 10 December 1857, read 14 January 1858).

Claims the lesson makes: Cayley wrote a set of linear equations as one matrix acting on the
unknowns. He defined the product of two matrices as the matrix of doing one substitution after
the other, which is what gives the row-times-column rule. He noted that the product depends on
the order. It is the first systematic treatment of matrices as objects of their own.

## R5. Glossary (l = "m3")

| id | t | en | alias | sec |
|---|---|---|---|---|
| matrix | Matris | Matrix | `matris(?:ler)?\w*` | product |
| column-vector | Sütun vektörü | Column vector | `sütun vektör\w*` | product |
| matrix-vector-product | Matris-vektör çarpımı | Matrix–vector product | `matris-vektör çarpım\w*` | product |
| linear-transformation | Doğrusal dönüşüm | Linear transformation | `doğrusal dönüşüm\w*` | grid |
| identity-matrix | Birim matris | Identity matrix | `birim matris\w*` | rotation |
| rotation-matrix | Dönme matrisi | Rotation matrix | `dönme matris\w*` | rotation |
| matrix-product | Matris çarpımı | Matrix product | `matris çarpım\w*` | order |

"matris" must first appear in section 1's defining sentence; the intro and warm-up avoid it
(they say "tablo"). Longer aliases (matris-vektör…, matris çarpım…, birim matris…, dönme
matris…) win over "matris" by the build's length sort. "birim matris" must not be caught by
M.1's "birim vektör" or M.2's "birim çember"; they don't overlap.
