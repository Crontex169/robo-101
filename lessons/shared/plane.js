/* =====================================================================
   plane.js — 2D canvas helpers shared by lessons M.3 and M.4.
   Uses ui-core.js ($, setRangeFill), kit.js (HeroKit) and vec.js (Vec); top-level names, like the lesson scripts.
   Matrices are arrays of rows. Column 1 (the image of x̂) is --classic, column 2 (ŷ) is --e2e.
     t(x), fv(v)      numbers and vectors for readouts: at most two decimals, never −0
     mat(A, plain)    a 2×2 matrix as HTML, columns in their colours (plain: no colours)
     view(ox, oy, u)  a scene: origin in px, u px per unit, y up; px(p) and un(pointer)
     line, arrow, arc, knob, label, axes   canvas drawing in a view
     slider(sel, v, txt), setOut(el, html), pal()
     F                an F figure as segments: turns and flips are easy to see
   ===================================================================== */
'use strict';
const D2R = Math.PI / 180;
const wrap = (d) => { const x = ((d + 180) % 360 + 360) % 360 - 180; return x === -180 ? 180 : x; }; // (−180°, 180°]
// a number with at most two decimals and no trailing zeros: 0.5, 1, 0.87, −0.5 (never −0)
const t = (x) => Vec.num(x, 2).replace(/\.?0+$/, '');
const fv = (v) => `(${v.map(t).join(', ')})`;
const col = (A, j) => A.map((row) => row[j]);
const fromCols = (a, b) => [[a[0], b[0]], [a[1], b[1]]];
const same = (A, B) => A.every((row, i) => row.every((x, j) => Math.abs(x - B[i][j]) < 1e-9));
const S = (sx, sy) => [[sx, 0], [0, sy]];
const R = (deg) => Vec.rot(deg * D2R);
// a 2×2 matrix as HTML, columns in their colours
const mat = (A, plain) => { const k = (j) => (plain ? '' : ` class="c${j}"`); return `<span class="mat"><span${k(1)}>${t(A[0][0])}</span><span${k(2)}>${t(A[0][1])}</span><span${k(1)}>${t(A[1][0])}</span><span${k(2)}>${t(A[1][1])}</span></span>`; };
const css = (n) => HeroKit.css(n);
const pal = () => ({ bg: css('--surface-2'), grid: css('--line'), axis: css('--axis'), ink: css('--ink'), ink3: css('--ink-3'), surf: css('--surface'), line2: css('--line-2'),
  c1: css('--classic'), c2: css('--e2e'), arc: css('--hybrid'), soft: css('--hybrid-soft') });
function setOut(el, html) { if (el.dataset.h !== html) { el.innerHTML = html; el.dataset.h = html; } }

// a scene with its own scale: origin (ox, oy) in px, u px per unit, y up
const view = (ox, oy, u) => ({ px: ([x, y]) => [ox + x * u, oy - y * u], un: (p) => [(p.x - ox) / u, (oy - p.y) / u], u, ox, oy });
function line(c, V, a, b, colr, w, dash) { const [x0, y0] = V.px(a), [x1, y1] = V.px(b); c.strokeStyle = colr; c.lineWidth = w || 2; c.lineCap = 'round'; c.setLineDash(dash ? [6, 5] : []); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.setLineDash([]); }
function arrow(c, V, from, to, colr, w, dash) {
  const [x0, y0] = V.px(from), [x1, y1] = V.px(to), L = Math.hypot(x1 - x0, y1 - y0);
  if (L < 1) return;
  const ux = (x1 - x0) / L, uy = (y1 - y0) / L, hl = Math.min(12, L * 0.45);
  c.strokeStyle = colr; c.fillStyle = colr; c.lineWidth = w || 3; c.lineCap = 'round'; c.setLineDash(dash ? [6, 5] : []);
  c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - ux * hl * 0.8, y1 - uy * hl * 0.8); c.stroke(); c.setLineDash([]);
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - ux * hl - uy * hl * 0.45, y1 - uy * hl + ux * hl * 0.45); c.lineTo(x1 - ux * hl + uy * hl * 0.45, y1 - uy * hl - ux * hl * 0.45); c.closePath(); c.fill();
}
function arc(c, V, r, a0, a1, colr, w) { c.strokeStyle = colr; c.lineWidth = w || 2; c.beginPath(); c.arc(V.ox, V.oy, r, -a0, -a1, a1 > a0); c.stroke(); }
function knob(c, V, P, p, active) {
  const [x, y] = V.px(p);
  c.beginPath(); c.arc(x, y, 7, 0, 7); c.fillStyle = P.surf; c.fill(); c.lineWidth = 2.5; c.strokeStyle = P.ink; c.stroke();
  if (active) { c.beginPath(); c.arc(x, y, 12, 0, 7); c.lineWidth = 2; c.setLineDash([3, 3]); c.stroke(); c.setLineDash([]); }
}
function label(c, k, V, s, p, colr, dx, dy) { const [x, y] = V.px(p); HeroKit.label(c, k, s, x + (dx || 0), y + (dy || 0), { color: colr, px: 13 }); }
function axes(c, P, V, x0, x1, y0, y1) { c.strokeStyle = P.axis; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0, V.oy + 0.5); c.lineTo(x1, V.oy + 0.5); c.moveTo(V.ox + 0.5, y0); c.lineTo(V.ox + 0.5, y1); c.stroke(); }
function slider(sel, v, txt) { const inp = $(sel); inp.value = v; inp.nextElementSibling.textContent = txt; setRangeFill(inp); }
const F = [[[0, 0], [0, 1.2]], [[0, 1.2], [0.7, 1.2]], [[0, 0.6], [0.5, 0.6]]];
