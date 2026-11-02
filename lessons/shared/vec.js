/* =====================================================================
   vec.js — vectors and frames for the lessons. No DOM: runs in the
   browser (window.Vec) and in Node (require) for the check scripts.
   Vectors are plain arrays [x, y] or [x, y, z]; nothing mutates its inputs.
     add, sub, scale, len, unit (null at zero length), near
     toParent(pB, oB)  → P in {A} = origin of {B} in {A} + P in {B}   (frames that point the same way)
     inFrame(pA, oB)   → P in {B} = P in {A} − origin of {B} in {A}
     cross3, det3, handedness(x, y, z) → 'right' | 'left' | null
     polar(r, th)      → (r cos th, r sin th)        angle(v) → atan2(y, x), radians in (−π, π]
     cosRule(a, b, c)  → angle opposite side c of a triangle with sides a, b, c (radians), or null if none exists
     mv(A, v), mm(A, B) → matrix times vector, matrix product; a matrix is an array of rows, any size
     rot(th) → 2×2 rotation [[cos, −sin], [sin, cos]]     rotZ(th) → 3×3 rotation about z
     dot(a, b), tr(A) (transpose, any size), det2(A), inv2(A) (2×2 inverse, null when det is 0)
     fmt(v, d)         → "(3.0, 4.0)" with a real minus sign, for readouts
   ===================================================================== */
'use strict';
(function (root) {
  const add = (a, b) => a.map((v, i) => v + b[i]);
  const sub = (a, b) => a.map((v, i) => v - b[i]);
  const scale = (a, k) => a.map((v) => v * k);
  const len = (a) => Math.hypot(...a);
  const unit = (a) => { const l = len(a); return l < 1e-9 ? null : scale(a, 1 / l); };
  const near = (a, b, tol) => a.every((v, i) => Math.abs(v - b[i]) <= tol);
  const toParent = (pB, oB) => add(oB, pB);
  const inFrame = (pA, oB) => sub(pA, oB);
  const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const det3 = (x, y, z) => { const c = cross3(y, z); return x[0] * c[0] + x[1] * c[1] + x[2] * c[2]; };
  const handedness = (x, y, z) => { const d = det3(x, y, z); return Math.abs(d) < 1e-9 ? null : d > 0 ? 'right' : 'left'; };
  const polar = (r, th) => [r * Math.cos(th), r * Math.sin(th)];
  const angle = (v) => Math.atan2(v[1], v[0]);
  const cosRule = (a, b, c) => { const k = (a * a + b * b - c * c) / (2 * a * b); return k > 1 + 1e-9 || k < -1 - 1e-9 ? null : Math.acos(Math.max(-1, Math.min(1, k))); };
  const mv = (A, v) => A.map((row) => row.reduce((s, a, j) => s + a * v[j], 0));
  const mm = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
  const rot = (th) => { const c = Math.cos(th), s = Math.sin(th); return [[c, -s], [s, c]]; };
  const rotZ = (th) => { const [[c, ms], [s]] = rot(th); return [[c, ms, 0], [s, c, 0], [0, 0, 1]]; };
  const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  const tr = (A) => A[0].map((_, j) => A.map((row) => row[j]));
  const det2 = ([[a, b], [c, d]]) => a * d - b * c;
  const inv2 = (A) => { const D = det2(A), [[a, b], [c, d]] = A; return Math.abs(D) < 1e-9 ? null : [[d / D, -b / D], [-c / D, a / D]]; };
  const num = (v, d) => { const s = (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toFixed(d); return s.replace('-', '−'); };
  const fmt = (v, d) => '(' + v.map((x) => num(x, d == null ? 1 : d)).join(', ') + ')';
  const Vec = { add, sub, scale, len, unit, near, toParent, inFrame, cross3, det3, handedness, polar, angle, cosRule, mv, mm, rot, rotZ, dot, tr, det2, inv2, num, fmt };
  if (typeof module === 'object' && module.exports) module.exports = Vec; else root.Vec = Vec;
})(this);
