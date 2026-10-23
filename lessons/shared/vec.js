/* =====================================================================
   vec.js — vectors and frames for the lessons. No DOM: runs in the
   browser (window.Vec) and in Node (require) for the check scripts.
   Vectors are plain arrays [x, y] or [x, y, z]; nothing mutates its inputs.
     add, sub, scale, len, unit (null at zero length), near
     toParent(pB, oB)  → P in {A} = origin of {B} in {A} + P in {B}   (frames that point the same way)
     inFrame(pA, oB)   → P in {B} = P in {A} − origin of {B} in {A}
     cross3, det3, handedness(x, y, z) → 'right' | 'left' | null
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
  const num = (v, d) => { const s = (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toFixed(d); return s.replace('-', '−'); };
  const fmt = (v, d) => '(' + v.map((x) => num(x, d == null ? 1 : d)).join(', ') + ')';
  const Vec = { add, sub, scale, len, unit, near, toParent, inFrame, cross3, det3, handedness, num, fmt };
  if (typeof module === 'object' && module.exports) module.exports = Vec; else root.Vec = Vec;
})(this);
