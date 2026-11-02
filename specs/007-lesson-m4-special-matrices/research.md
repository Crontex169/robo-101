# Research: Lesson M.4

## R1. Outline

| # | id | Title (Turkish on the page) | Form | ≈ min |
|---|---|---|---|---|
| — | recall | Warm-up on M.3 (3 questions with section links) | warm-up | 2 |
| 1 | dot | Nokta çarpımı | prose + small interactive | 7 |
| 2 | ortho | Devrik matris ve dik matrisler | **Lab 1**, 3 missions + free play | 10 |
| 3 | inverse | Bir dönüşümü geri almak: ters matris | small interactive | 7 |
| 4 | det | Determinant: alan nasıl değişir | **Lab 2**, 4 missions + free play | 10 |
| 5 | special | Dönme matrisi nedir, ve bir adım ötesi | prose + SVG figure | 5 |
| — | papers | İlgili makaleler (Möbius 1827, Denavit–Hartenberg 1955) | 2 cards | 2 |
| — | quiz, finale | 8 questions, wrap-up | | 8 |

Total ≈ 51 min, at the top of SC-001; section 5 stays short. The research thinking block (why a
matrix can shift) sits at the end of section 5, right after the homogeneous example.

Warm-up on M.3 (section ids `product`, `grid`, `rotation`, `order`, `rotz`):

1. Columns (1, 2) and (0, 1); where does (1, 0) go? (1, 2), the first column. → `grid`
2. R(90°)·(0, 1)? (−1, 0). → `rotation`
3. In AB, which is applied first? B. → `order`

## R2. Scenes

All scenes reuse M.3's plane helpers (`view`, `line`, `arrow`, `knob`, `label`, `axes`, `slider`,
`t`, `fv`, `mat`, `pal`, `setOut`) and the F figure, moved to `lessons/shared/plane.js` (R6).

- **Dot (small interactive).** a = (2, 0) fixed (column-1 colour), b unit at angle φ
  (column-2 colour). Slider φ −180…180, step 1; keys ±5°, Shift ±1° (as M.3's rotation slider).
  Draws a, b, the arc of φ and the shadow of b on a's line. Readout:
  a·b = 2 · bₓ + 0 · b_y = value; at |a·b| < 1e-9 adds "a ile b dik".
- **Lab 1 (ortho).** Column 1 = (cos α, sin α), α slider −180…180, step 5. Column 2 tip is
  dragged; snapping, in order: within 0.1 of a perpendicular unit vector (±90° from column 1),
  snap to it; else within 0.1 of the unit circle, snap onto the circle; else round to 0.1.
  Keys move column 2 by 0.1, then the same snapping. Scene: faint grid, moved unit square,
  both columns. Readout: c₁·c₁, c₁·c₂, c₂·c₂ and AᵀA (plain `mat`, no column colours: its
  entries are dot products, not columns). AᵀA = I is tested within 0.05 per entry.
  - Mission 1: α = 0 locked; done when AᵀA ≈ I. Stores which side (+90° or −90°).
  - Mission 2: α = 0 locked; done when AᵀA ≈ I on the other side. Explanation: +90° is R(0°),
    −90° is the mirror [[1, 0], [0, −1]]; section 4 tells them apart with one number.
  - Mission 3: α = 30°, column 2 = R(30°)'s second column, both locked, AᵀA hidden. Bet
    "evet" / "hayır"; run shows I.
  - Mission 4: free (α and column 2).
- **Inverse (small interactive).** The F at home (faint), after R(50°) (dashed) and after
  R(β)R(50°) (solid). Slider β −180…180, step 1; keys ±5°, Shift ±1°. Readout: R(50°)ᵀ, R(β)
  and R(β)R(50°); within 1° of −50° adds "Şekil evine döndü". Fold-out: the 2×2 inverse formula
  with M.3's matrix.
- **Lab 2 (det).** M.3's grid lab: two column tips, snapping 0.5, range ±3.5, keys 0.5. The image
  of the unit square is filled with `--hybrid-soft` when det > 0 and `--serious-soft` when
  det < 0 (`--serious` is used by no other scene); a point or a segment when det = 0. Readout:
  A, det A = ad − bc, and "ters var" / "ters yok" (no division shown).
  - Mission 1: done when det = 3.
  - Mission 2: columns (1, 0), (1, 1) locked, det hidden; bet 0 / 1 / 2; run shows 1.
  - Mission 3: done when det = 0 and not both columns zero.
  - Mission 4: done when det < 0.
  - Mission 5: free.

## R3. Numbers asserted in Node

| Statement | Engine |
|---|---|
| (1, 2)·(3, 1) = 5; (3, 4)·(4, −3) = 0 | `Vec.dot` |
| a = (2, 0), b = polar(1, φ): a·b = 1 at 60°, 0 at 90° (shown as 0) | `Vec.dot`, `Vec.polar`, `Vec.num` |
| a·a = |a|² for (3, 4): 25 | `Vec.dot`, `Vec.len` |
| [[2, −1], [1, 1]]ᵀ = [[2, 1], [−1, 1]] | `Vec.tr` |
| AᵀA = [[c₁·c₁, c₁·c₂], [c₂·c₁, c₂·c₂]] for M.3's matrix | `Vec.tr`, `Vec.mm`, `Vec.dot` |
| columns (1, 0), (0, ±1): AᵀA = I; the snap rule reaches both from the keyboard | `Vec.tr`, `Vec.mm` |
| R(30°)ᵀR(30°) = I | `Vec.rot`, `Vec.tr`, `Vec.mm` |
| R(50°)ᵀ = R(−50°) ≈ [[0.64, 0.77], [−0.77, 0.64]]; R(−50°)R(50°) = I | `Vec.rot`, `Vec.tr`, `Vec.mm` |
| inv2([[2, −1], [1, 1]]) = 1/3 · [[1, 1], [−1, 2]]; it sends (0, 3) to (1, 2) | `Vec.inv2`, `Vec.mv` |
| det2: (2, 1), (−1, 1) → 3; (1, 0), (1, 1) → 1; (1, 1), (2, 2) → 0; (1, 0), (0, −1) → −1; R(θ) → 1 for θ in −180…180 step 5 | `Vec.det2`, `Vec.rot` |
| inv2 of a det-0 matrix is null | `Vec.inv2` |
| rotZ(90°)ᵀ rotZ(90°) = I (3×3) | `Vec.rotZ`, `Vec.tr`, `Vec.mm` |
| [[0, −1, 2], [1, 0, 1], [0, 0, 1]]·(1, 0, 1) = (2, 2, 1), equal to R(90°)·(1, 0) + (2, 1) | `Vec.mv`, `Vec.rot`, `Vec.add` |
| warm-up: columns (1, 2), (0, 1) send (1, 0) to (1, 2); R(90°)·(0, 1) = (−1, 0) | `Vec.mv`, `Vec.rot` |
| quiz numbers (see the quiz in the lesson) | as above |

New `vec.js` helpers, DOM-free, one line each: `dot(a, b)`, `tr(A)` (any size), `det2(A)`,
`inv2(A)` (null when |det| < 1e-9).

## R4. Citations (verified 2026-11-02)

- J. Denavit, R. S. Hartenberg, "A Kinematic Notation for Lower-Pair Mechanisms Based on
  Matrices", *Journal of Applied Mechanics* 22(2): 215–221, June 1955. DOI 10.1115/1.4011045.
  Crossref returns this title, both authors, journal, volume 22, issue 2, pages 215–221 and the
  date 1955-06-01.
  Claims the lesson makes: they described each link of a mechanism by a few numbers and wrote
  the move from one link to the next as a matrix, so a chain of links is a product of matrices.
  This is the notation Part 3 uses.
- A. F. Möbius, *Der barycentrische Calcul*, Leipzig: J. A. Barth, 1827. No DOI (a book). Stable
  link: the Bayerische Staatsbibliothek scan, https://www.digitale-sammlungen.de/en/view/bsb11267597
  (also archive.org `11267597bsb`, "Leipzig : Barth 1827").
  Claim the lesson makes: Möbius introduced coordinates in which a point is written with one
  number more than usual, and only the ratios matter; these are the homogeneous coordinates
  that let one matrix rotate and shift. The lesson does not claim Möbius used them for motion.

## R5. Glossary (l = "m4")

| id | t | en | alias | sec |
|---|---|---|---|---|
| dot-product | Nokta çarpımı | Dot product | `nokta çarpım\w*` | dot |
| orthogonal | Dik | Orthogonal (perpendicular) | `dik` | dot |
| transpose | Devrik matris | Transpose | `devri[gğk]\w*` | ortho |
| orthogonal-matrix | Dik matris | Orthogonal matrix | `dik matris\w*` | ortho |
| inverse-matrix | Ters matris | Inverse matrix | `ters matris\w*` | inverse |
| determinant | Determinant | Determinant | `determinant\w*` | det |
| reflection | Yansıma | Reflection | `yansıma\w*` | det |
| homogeneous-coordinates | Homojen koordinatlar | Homogeneous coordinates | `homojen koordinat\w*` | special |

"dik" must not catch "dikey", "dikkat" or "dikdörtgen" (the build's `(?![\w-])` boundary stops it) and "dik matris"
wins over "dik" by the build's length sort. The intro and warm-up avoid "dik" and "determinant"
so the first mention is in the defining sentence. Earlier terms linked at first mention:
vektör, birim vektör, kosinüs, matris, dönme matrisi, matris çarpımı, birim matris.

## R6. Reuse

Decision: move M.3's plane helpers and the F figure into `lessons/shared/plane.js`; M.3 and M.4
load it. `.mat`, `.c1`, `.c2` move from `m3/m3.css` to `shared/lab.css`.
Rationale: M.4's four scenes need the same twelve helpers; a second copy is the slop to avoid.
`tools/lesson_m3.js` proves M.3 still works after the move.
Alternatives: copy the helpers into `ui-m4.js` as M.1–M.3 did (rejected: third copy of the same
code); move M.1 and M.2 to the shared file too (rejected: their helpers have different
signatures and touching them is out of scope).
