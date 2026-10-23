# Data Model: Lesson M.1

| Entity | Fields | Rules |
|---|---|---|
| Vector | components `[x, y]` (or `[x, y, z]`) | length ≥ 0; unit direction undefined at length 0 |
| Frame | name (`A`, `B`), origin in {A}, axes parallel to {A} | M.1 only translates frames |
| Point P | position in {A} | P in {B} = P in {A} − origin of {B} |
| Arrow (scene) | tail, tip in scene units, colour role | vector = tip − tail; handles snap to 0.5 (Shift-keys 0.1) |
| 3D view | yaw, pitch, flips `[fx, fy, fz] ∈ {1, −1}` | handedness = sign of det of the flipped axes |
| Mission | existing `missions.js` model | criteria tolerances ≥ display precision (0.25 vs 0.1) |
| Warm-up | existing `#recallData` JSON; `href` → `../index.html#how` | 3 questions |
| Quiz | existing `Quiz.render` list | 8 questions; numeric options checked in Node |
| Glossary term | existing `glossary.json` fields, `l: "m1"` | research.md R8 |
