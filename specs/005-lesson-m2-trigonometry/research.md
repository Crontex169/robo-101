# Research: Lesson M.2

## R1. Outline

| # | id | Title (Turkish on the page) | Form | ≈ min |
|---|---|---|---|---|
| — | recall | Warm-up on M.1 (3 questions with section links) | warm-up | 2 |
| 1 | angles | Açılar: derece ve radyan | prose + SVG figure | 5 |
| 2 | circle | Birim çember: kosinüs ve sinüs | **Lab 1**, 3 missions + free play | 10 |
| 3 | links | Bir uzuv: uzunluk ve açı | **Lab 2**, 2 missions + free play | 10 |
| 4 | atan2 | Açıyı geri bulmak: atan2 | small interactive | 6 |
| 5 | cosrule | Kosinüs teoremi ve dirsek | small interactive | 6 |
| — | papers | İlgili makaleler (Volder 1959) | 1 card | 2 |
| — | quiz, finale | 8 questions, wrap-up | | 8 |

Total ≈ 49 min. The research thinking block (computing sin/cos without a fast multiplier) sits
at the end of section 2.

## R2. Scenes

- **Lab 1.** The unit circle has radius 150 px in a 420 canvas. The handle is the point on the
  circle. Drag sets θ = atan2 and snaps to 1°. Keys turn it 5° per press, 1° with Shift.
  Readouts: θ in ° and rad, cos θ and sin θ to 3 decimals.
- **Lab 2.** L₁ = L₂ = 1 unit at 90 px per unit, base at the centre. Two sliders (θ₁, θ₂) plus the
  elbow and hand handles: drag as in the sample, keys ±5°. Readouts: the elbow
  (cos θ₁, sin θ₁) and the hand. The θ₂ arc is drawn from the dashed extension of link 1.
- **atan2.** Same grid as M.1, with the point snapping to 0.5 units. Readouts: arctan(y/x) and
  atan2(y, x) in °, or "tanımsız" when x = 0. The true angle is drawn as a solid arc, and the
  arctan answer as a dashed ray.
- **Law of cosines.** Slider d from 0 to 2.4 in steps of 0.01, plus a "√2" button that sets
  d = √2 exactly. The triangle is drawn with the target on the x axis and the elbow up
  (`ik2` solution with θ₁ ≥ 0). Readouts: γ and θ₂ = 180° − γ, or "ulaşılamaz".

## R3. Numbers asserted in Node

| Statement | Engine |
|---|---|
| 180° = π rad; 1 rad = 57.3°; 90° = 1.571 rad | arithmetic |
| cos 60° = 0.5; sin 30° = 0.5; sin 210° = −0.5; cos 120° = −0.5 | Math |
| polar(2, 90°) = (0, 2) | `Vec.polar` |
| two-link (90°, −90°) → hand (1, 1) | `PlanarArm.fk` |
| (30°, 60°) → hand (0.866, 1.5), target (0.87, 1.5) within 0.05 | `PlanarArm.fk` |
| arctan(1/−1) = −45°; atan2(1, −1) = 135°; atan2(−1, −1) = −135° | `Vec.angle` |
| cosRule(1, 1, √2) = 90°; cosRule(3, 4, 5) = 90°; cosRule(1, 1, 2.2) = null | `Vec.cosRule` |
| warm-up: len(3, 4) = 5; (1, 1) + (2, 0) = (3, 1) | `Vec` |

## R4. CORDIC citation (verified 2026-10-23)

J. E. Volder, "The CORDIC Trigonometric Computing Technique", *IRE Transactions on Electronic
Computers* EC-8(3): 330–334, September 1959. DOI 10.1109/TEC.1959.5222693, which redirects to
IEEE Xplore document 5222693; the page may need a subscription. Confirmed by the author's
Wikipedia entry, the NIST Dictionary of Algorithms and Data Structures and Volder's 2000 Springer
retrospective, "The Birth of CORDIC". That retrospective states the motivation: replacing the
analog navigation computer of the B-58 aircraft with a digital one.

Claims the lesson makes: CORDIC computes sine and cosine by rotating a vector in a fixed sequence
of shrinking steps whose tangents are powers of two, so each step needs only shifts and
additions. It was developed for the B-58's navigation computer, and it is still used in hardware
without a fast multiplier.

## R5. Glossary (l = "m2")

| id | t | en | alias | sec |
|---|---|---|---|---|
| radian | Radyan | Radian | `radyan\w*` | angles |
| unit-circle | Birim çember | Unit circle | `birim çember\w*` | circle |
| cosine | Kosinüs | Cosine | `kosinüs\w*` | circle |
| sine | Sinüs | Sine | `sinüs\w*` | circle |
| polar-coordinates | Kutupsal koordinatlar | Polar coordinates | `kutupsal koordinat\w*` | links |
| atan2 | atan2 | atan2 | `atan2` | atan2 |
| law-of-cosines | Kosinüs teoremi | Law of cosines | `kosinüs teorem\w*` | cosrule |

"kosinüs" must first appear in section 2's defining sentence; sections 1 and the warm-up avoid
it. The longer alias "kosinüs teorem…" is matched before "kosinüs" by the build's length sort.
