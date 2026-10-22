/* =====================================================================
   planar-arm.js — kinematics of a planar arm with n revolute joints
   (the course's running example is the 3R arm). No DOM: runs in the
   browser (window.PlanarArm) and in Node (require) for the check scripts.
   Angles in radians, lengths in metres; each joint angle is relative to
   the previous link.
     fk(lengths, angles)      → { joints: [[x, y] … base … tip], tip: [x, y], phi }
     ik2(L1, L2, x, y)        → [[θ1, θ2] …] with 0, 1 or 2 solutions (elbow up first)
     jacobian(lengths, angles) → 2×n matrix: tip velocity = J · joint velocities
     reach(lengths)           → { outer, inner } radii of the reachable ring
   ===================================================================== */
'use strict';
(function (root) {
  function fk(lengths, angles) {
    let x = 0, y = 0, phi = 0; const joints = [[0, 0]];
    lengths.forEach((L, i) => { phi += angles[i]; x += L * Math.cos(phi); y += L * Math.sin(phi); joints.push([x, y]); });
    return { joints, tip: [x, y], phi };
  }
  const EPS = 1e-9;
  function ik2(L1, L2, x, y) {
    const c2 = (x * x + y * y - L1 * L1 - L2 * L2) / (2 * L1 * L2);
    if (c2 > 1 + EPS || c2 < -1 - EPS) return [];
    const cc = Math.max(-1, Math.min(1, c2));
    const sol = (s) => { const t2 = s * Math.acos(cc); return [Math.atan2(y, x) - Math.atan2(L2 * Math.sin(t2), L1 + L2 * Math.cos(t2)), t2]; };
    return Math.abs(Math.abs(cc) - 1) < EPS ? [sol(1)] : [sol(1), sol(-1)];
  }
  function jacobian(lengths, angles) {
    const n = lengths.length, phis = []; let phi = 0;
    for (let i = 0; i < n; i++) { phi += angles[i]; phis.push(phi); }
    const J = [new Array(n).fill(0), new Array(n).fill(0)];
    for (let i = 0; i < n; i++) for (let k = i; k < n; k++) { J[0][i] -= lengths[k] * Math.sin(phis[k]); J[1][i] += lengths[k] * Math.cos(phis[k]); }
    return J;
  }
  function reach(lengths) {
    const sum = lengths.reduce((a, b) => a + b, 0), longest = Math.max(...lengths);
    return { outer: sum, inner: Math.max(0, 2 * longest - sum) };
  }
  const api = { fk, ik2, jacobian, reach };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PlanarArm = api;
})(typeof window !== 'undefined' ? window : globalThis);
