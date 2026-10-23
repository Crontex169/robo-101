/* =====================================================================
   ui-m1.js — scenes, missions and quiz of lesson M.1, vectors and coordinate frames.
   Uses ui-core.js ($, initTheme, initNav), kit.js (HeroKit), vec.js (Vec),
   missions.js (Missions) and quiz.js (Quiz).
   Scenes: a 10 × 10 grid of units, (0, 0) at the centre, y up.
   window.__m1 is a test hook for tools/lesson_m1.js only.
   ===================================================================== */
'use strict';
const W = 420, U = 42, C = W / 2; // 42 px per unit
const toPx = ([x, y]) => [C + x * U, C - y * U];
const toU = (p) => [(p.x - C) / U, (C - p.y) / U];
const snap = (v, s) => v.map((x) => Math.round(x / (s || 0.5)) * (s || 0.5));
const clamp = (v, m) => v.map((x) => Math.max(-m, Math.min(m, x)));
const fmt = (v, d) => Vec.fmt(v, d);
const css = (n) => HeroKit.css(n);
const pal = () => ({ bg: css('--surface-2'), grid: css('--line'), axis: css('--axis'), ink: css('--ink'), ink3: css('--ink-3'), surf: css('--surface'),
  a: css('--classic'), b: css('--hybrid'), sum: css('--e2e'), good: css('--good'), x: css('--critical'), y: css('--good'), z: css('--classic') });
function setOut(el, html) { if (el.dataset.h !== html) { el.innerHTML = html; el.dataset.h = html; } }
const sup = (f, s) => `<sup>${f}</sup>P${s ? `<sub>${s}</sub>` : ''}`;

function arrow(c, from, to, col, w, dash) {
  const [x0, y0] = toPx(from), [x1, y1] = toPx(to), L = Math.hypot(x1 - x0, y1 - y0);
  if (L < 1) return;
  const ux = (x1 - x0) / L, uy = (y1 - y0) / L, hl = Math.min(13, L * 0.45);
  c.strokeStyle = col; c.fillStyle = col; c.lineWidth = w || 3; c.lineCap = 'round';
  c.setLineDash(dash ? [6, 5] : []);
  c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - ux * hl * 0.8, y1 - uy * hl * 0.8); c.stroke(); c.setLineDash([]);
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - ux * hl - uy * hl * 0.45, y1 - uy * hl + ux * hl * 0.45); c.lineTo(x1 - ux * hl + uy * hl * 0.45, y1 - uy * hl - ux * hl * 0.45); c.closePath(); c.fill();
}
function knob(c, P, p, active) {
  const [x, y] = toPx(p);
  c.beginPath(); c.arc(x, y, 7, 0, 7); c.fillStyle = P.surf; c.fill(); c.lineWidth = 2.5; c.strokeStyle = P.ink; c.stroke();
  if (active) { c.beginPath(); c.arc(x, y, 12, 0, 7); c.lineWidth = 2; c.setLineDash([3, 3]); c.stroke(); c.setLineDash([]); }
}
function dot(c, p, col, r) { const [x, y] = toPx(p); c.beginPath(); c.arc(x, y, r || 5, 0, 7); c.fillStyle = col; c.fill(); }
function text(c, k, s, p, col, dx, dy) { const [x, y] = toPx(p); HeroKit.label(c, k, s, x + (dx || 0), y + (dy || 0), { color: col, px: 13 }); }
function background(c, P, axes) {
  c.fillStyle = P.bg; c.fillRect(0, 0, W, W);
  HeroKit.grid(c, W, W, U, P.grid);
  if (axes) { c.strokeStyle = P.axis; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, C + 0.5); c.lineTo(W, C + 0.5); c.moveTo(C + 0.5, 0); c.lineTo(C + 0.5, W); c.stroke(); }
}
// pointer + keyboard for a scene; pos(name) → units, set(name, units)
function handles(cv, o) {
  HeroKit.drag(cv, W, W, {
    hit(p) { for (const n of o.names()) { const [x, y] = toPx(o.pos(n)); if (Math.hypot(p.x - x, p.y - y) < 22) return n; } return null; },
    move(n, p) { o.set(n, clamp(snap(toU(p)), 4.5)); },
  });
  return HeroKit.keys(cv, {
    get handles() { return o.names(); },
    move(n, dx, dy) { const v = o.pos(n); o.set(n, clamp(Vec.add(v, [dx, dy]).map((x) => Math.round(x * 10) / 10), 4.5)); },
    describe: (n) => o.say(n),
    redraw: o.redraw,
  });
}

/* ---------- Lab 1: arrows ---------- */
const Arrows = (() => {
  const MATCH = [3, 2], TARGET = [4, 3], A2 = [3, 1], B2 = [-1, 2], B2_PARK = [-3, -3];
  const st = { mode: 'match', a0: [-4, -3], a1: [-2, -2], b: [0, 1], bTail: B2_PARK, added: false };
  let ctl = null, kb = null, busy = false;
  const a = () => Vec.sub(st.a1, st.a0);
  const names = () => (busy ? [] : st.mode === 'match' ? ['tail', 'tip'] : st.mode === 'sum' ? [] : ['a', 'b']);
  const pos = (n) => (n === 'tail' ? st.a0 : n === 'tip' || n === 'a' ? st.a1 : Vec.add(st.a1, st.b));
  function set(n, v) {
    if (n === 'tail') st.a0 = v; else if (n === 'tip' || n === 'a') st.a1 = v;
    else st.b = Vec.sub(v, st.a1); // b keeps its own length and direction when a moves, like a second link
    sync();
  }
  function draw() {
    const cv = $('#arrowsCv'), { c, k } = HeroKit.fit(cv, W, W), P = pal(), act = kb && kb.active;
    background(c, P, false);
    dot(c, [0, 0], P.ink3, 4);
    if (st.mode === 'match') {
      arrow(c, [1, 1], Vec.add([1, 1], MATCH), P.ink3, 2.5, true);
      arrow(c, st.a0, st.a1, P.a, 4);
      text(c, k, 'a', Vec.scale(Vec.add(st.a0, st.a1), 0.5), P.a, -12, -12);
      knob(c, P, st.a0, act === 'tail'); knob(c, P, st.a1, act === 'tip');
    } else if (st.mode === 'sum') {
      arrow(c, [0, 0], A2, P.a, 4); text(c, k, 'a', [1.5, 0.5], P.a, 0, -14);
      arrow(c, st.bTail, Vec.add(st.bTail, B2), P.b, 4); text(c, k, 'b', Vec.add(st.bTail, [-0.5, 1]), P.b, -14, 0);
      if (st.added) { arrow(c, [0, 0], Vec.add(A2, B2), P.sum, 3, true); text(c, k, 'a + b', [1, 1.5], P.sum, -18, 0); }
    } else {
      const end = Vec.add(st.a1, st.b);
      if (st.mode === 'chain') { const [tx, ty] = toPx(TARGET); c.beginPath(); c.arc(tx, ty, 0.3 * U, 0, 7); c.setLineDash([4, 4]); c.strokeStyle = P.good; c.lineWidth = 2.5; c.stroke(); c.setLineDash([]); }
      if (st.mode === 'free') { arrow(c, [0, 0], end, P.sum, 2.5, true); }
      arrow(c, [0, 0], st.a1, P.a, 4); arrow(c, st.a1, end, P.b, 4);
      text(c, k, 'a', Vec.scale(st.a1, 0.5), P.a, -12, -12); text(c, k, 'b', Vec.add(st.a1, Vec.scale(st.b, 0.5)), P.b, 12, -12);
      knob(c, P, st.a1, act === 'a'); knob(c, P, end, act === 'b');
    }
    const r = st.mode === 'match' ? `a = <b>${fmt(a())}</b> · dashed arrow = <b>${fmt(MATCH)}</b>`
      : st.mode === 'sum' ? `a = <b>${fmt(A2)}</b> · b = <b>${fmt(B2)}</b>${st.added ? ` · a + b = <b>${fmt(Vec.add(A2, B2))}</b>` : ''}`
      : `a = <b>${fmt(st.a1)}</b> · b = <b>${fmt(st.b)}</b> · a + b = <b>${fmt(Vec.add(st.a1, st.b))}</b>`;
    setOut($('#arrowsOut'), r);
  }
  function sync() { draw(); if (ctl) ctl.update(); }
  const api = {
    reset() { st.mode = 'match'; st.a0 = [-4, -3]; st.a1 = [-2, -2]; st.b = [0, 1]; st.bTail = B2_PARK; st.added = false; sync(); },
    state: () => ({ a: st.mode === 'match' ? a() : st.a1, b: st.b, end: Vec.add(st.a1, st.b) }),
    async addB() { // slide b onto the tip of a, then draw the sum
      busy = true; const steps = HeroKit.reduced() ? 1 : 24, from = st.bTail;
      for (let s = 1; s <= steps; s++) { st.bTail = Vec.add(from, Vec.scale(Vec.sub(A2, from), s / steps)); draw(); if (steps > 1) await new Promise((r) => setTimeout(r, 20)); }
      st.added = true; busy = false; draw();
      return { sum: Vec.add(A2, B2) };
    },
  };
  const missions = [
    { short: 'Match', title: 'Same vector, different place', text: 'The dashed arrow is a vector. Drag the two ends of the blue arrow <b>a</b> until it is the same vector: same length, same direction. It doesn\'t have to sit on top of the dashed one.',
      onEnter: () => { st.mode = 'match'; sync(); },
      criteria: [{ label: 'a has the same length and direction as the dashed arrow', test: (r, s) => Vec.near(s.a, MATCH, 0.25) }],
      hint: 'Put the tip 3 squares to the right of the tail and 2 squares above it.',
      explain: (s) => `a = ${fmt(s.a)}, the same as the dashed arrow, although the two start in different places. A vector is only a length and a direction; where you draw it is up to you.` },
    { short: 'Predict', title: 'Predict the sum', text: 'Arrow <b>a</b> goes 3 right and 1 up from the dot in the middle. Arrow <b>b</b> goes 1 left and 2 up. You\'re about to slide b so that it starts where a ends. The sum a + b is the arrow from the dot to b\'s new tip.',
      onEnter: () => { st.mode = 'sum'; st.bTail = B2_PARK; st.added = false; sync(); },
      bet: { q: 'Where does a + b end?', options: ['(4, 3)', '(2, 3)', '(−3, 2)'], answer: () => 1 },
      action: { label: 'Put b on the tip of a', run: () => api.addB() },
      criteria: [{ label: 'You added the two arrows', test: (r) => r != null }],
      explain: (r) => `a + b = (3 − 1, 1 + 2) = ${fmt(r.sum)}. Head to tail on the grid, and in numbers: add the x parts, then add the y parts.` },
    { short: 'Reach', title: 'Two arrows to the target', text: 'Now <b>a</b> starts at the dot and <b>b</b> starts wherever a ends. Drag the two tips so that b ends on the green target. Each arrow must be at least one square long.',
      onEnter: () => { st.mode = 'chain'; st.a1 = [2, 0]; st.b = [0, 1]; sync(); },
      criteria: [
        { label: 'b ends on the target', test: (r, s) => Vec.near(s.end, TARGET, 0.25) },
        { label: 'Both arrows are at least 1 square long', test: (r, s) => Vec.len(s.a) >= 1 && Vec.len(s.b) >= 1 },
      ],
      hint: 'The target is 4 right and 3 up. Any a works if b makes up the rest: try a = (2, 2) and b = (2, 1).',
      explain: (s) => `a = ${fmt(s.a)} and b = ${fmt(s.b)} add up to ${fmt(Vec.add(s.a, s.b))}. Many pairs reach the target; it only fixes the sum. A robot arm works the same way: each link is a vector, and the hand sits at the sum of the links.` },
    { short: 'Free play', title: 'Free play', text: 'Move both tips. The dashed orange arrow is always a + b. Can you make the sum zero?', final: true, onEnter: () => { st.mode = 'free'; sync(); } },
  ];
  function init() {
    const cv = $('#arrowsCv');
    kb = handles(cv, { names, pos, set, redraw: draw, say: (n) => `${n === 'tail' ? 'Tail of a' : n === 'tip' || n === 'a' ? 'Tip of a' : 'Tip of b'} at ${fmt(pos(n))}` });
    HeroKit.onTheme(draw); window.addEventListener('resize', draw);
    ctl = Missions.mount('#arrowsMis', missions, api);
    sync();
    return { ctl, set, state: api.state, st };
  }
  return { init };
})();

/* ---------- Small interactive: components, length, unit vector ---------- */
const Parts = (() => {
  let v = [2, 3], kb = null;
  function draw() {
    const cv = $('#partsCv'), { c, k } = HeroKit.fit(cv, W, W), P = pal();
    background(c, P, true);
    const u = Vec.unit(v), L = Vec.len(v);
    if (Math.abs(v[0]) > 0.01) { c.strokeStyle = P.a; c.lineWidth = 3; c.beginPath(); c.moveTo(...toPx([0, 0])); c.lineTo(...toPx([v[0], 0])); c.stroke(); text(c, k, `x: ${Vec.num(v[0], 1)}`, [v[0] / 2, 0], P.a, 0, v[1] >= 0 ? 14 : -14); }
    if (Math.abs(v[1]) > 0.01) { c.strokeStyle = P.sum; c.lineWidth = 3; c.beginPath(); c.moveTo(...toPx([v[0], 0])); c.lineTo(...toPx(v)); c.stroke(); text(c, k, `y: ${Vec.num(v[1], 1)}`, [v[0], v[1] / 2], P.sum, v[0] >= 0 ? 24 : -24, 0); }
    arrow(c, [0, 0], v, P.ink, 3);
    if (u) { arrow(c, [0, 0], u, P.b, 5); }
    knob(c, P, v, kb && kb.active === 'tip');
    setOut($('#partsOut'), `v = <b>${fmt(v)}</b> · length <b>${Vec.num(L, 2)}</b> · unit vector ${u ? `<b>${fmt(u, 2)}</b>` : '<b>undefined</b>: an arrow of length zero points nowhere'}`);
  }
  function set(n, p) { v = p; draw(); }
  function init() {
    kb = handles($('#partsCv'), { names: () => ['tip'], pos: () => v, set, redraw: draw, say: () => `Tip at ${fmt(v)}, length ${Vec.num(Vec.len(v), 2)}` });
    HeroKit.onTheme(draw); window.addEventListener('resize', draw);
    draw();
    return { set: (p) => set('tip', p) };
  }
  return { init };
})();

/* ---------- Lab 2: one point, two frames ---------- */
const TwoFrames = (() => {
  const st = { mode: 'predict', oB: [2, 1], P: [3, 4], reveal: false };
  let ctl = null, kb = null;
  const pB = () => Vec.inFrame(st.P, st.oB);
  const names = () => (st.mode === 'predict' ? [] : st.mode === 'place' ? ['B'] : ['B', 'P']);
  const pos = (n) => (n === 'B' ? st.oB : st.P);
  function set(n, v) { if (n === 'B') st.oB = v; else st.P = v; sync(); }
  function frame(c, k, P, o, col, name) {
    arrow(c, o, Vec.add(o, [1.2, 0]), col, 2.5); arrow(c, o, Vec.add(o, [0, 1.2]), col, 2.5);
    text(c, k, `x${name}`, Vec.add(o, [1.3, 0]), col, 10, 10); text(c, k, `y${name}`, Vec.add(o, [0, 1.3]), col, -12, 0);
    dot(c, o, col, 4); text(c, k, `{${name}}`, o, col, -16, 14);
  }
  function draw() {
    const cv = $('#framesCv'), { c, k } = HeroKit.fit(cv, W, W), P = pal(), act = kb && kb.active, show = st.mode !== 'predict' || st.reveal;
    background(c, P, false);
    frame(c, k, P, [0, 0], P.ink, 'A'); frame(c, k, P, st.oB, P.a, 'B');
    arrow(c, [0, 0], st.oB, P.ink3, 2, true);
    arrow(c, st.oB, st.P, P.a, 3);
    if (show) arrow(c, [0, 0], st.P, P.sum, 3);
    dot(c, st.P, P.ink, 5); text(c, k, 'P', st.P, P.ink, 12, -12);
    if (st.mode !== 'predict') { knob(c, P, st.oB, act === 'B'); if (st.mode === 'free') knob(c, P, st.P, act === 'P'); }
    setOut($('#framesOut'), `${sup('A', 'BORG')} = <b>${fmt(st.oB)}</b> · ${sup('B')} = <b>${fmt(pB())}</b> · ${sup('A')} = <b>${show ? fmt(st.P) : '?'}</b>`);
  }
  function sync() { draw(); if (ctl) ctl.update(); }
  const api = {
    reset() { st.mode = 'predict'; st.oB = [2, 1]; st.P = [3, 4]; st.reveal = false; sync(); },
    state: () => ({ oB: st.oB, P: st.P, pB: pB() }),
    async show() { st.reveal = true; draw(); return { pA: Vec.toParent(pB(), st.oB) }; },
  };
  const missions = [
    { short: 'Predict', title: 'P seen from {A}', text: '{B}\'s origin sits at (2, 1) in {A}, and P sits at (1, 3) in {B}. Where is P in {A}?',
      onEnter: () => { st.mode = 'predict'; st.oB = [2, 1]; st.P = [3, 4]; st.reveal = false; sync(); },
      bet: { q: 'Where is P in {A}?', options: ['(1, 2)', '(3, 4)', '(−1, −2)'], answer: () => 1 },
      action: { label: 'Show P in {A}', run: () => api.show() },
      criteria: [{ label: 'You revealed P in {A}', test: (r) => r != null }],
      explain: (r) => `${sup('A')} = (2, 1) + (1, 3) = ${fmt(r.pA)}. From {A}'s origin, walk to {B}'s origin, then on to P: two arrows head to tail, as in the first lab.` },
    { short: 'Place {B}', title: 'Move the frame, not the point', text: 'P is fixed at (1, 1) in {A}. Drag frame {B} until P sits at (−1, 2) in {B}: one unit to the left of {B}\'s origin and two up.',
      onEnter: () => { st.mode = 'place'; st.P = [1, 1]; st.oB = [-3, -2]; sync(); },
      criteria: [{ label: `${sup('B')} = (−1, 2)`, test: (r, s) => Vec.near(s.pB, [-1, 2], 0.25) }],
      hint: 'P must be 1 to the left of {B}\'s origin, so the origin is 1 to the right of P; and 2 below it.',
      explain: (s) => `{B}'s origin is at ${fmt(s.oB)} in {A}. Check: (1, 1) − (2, −1) = (−1, 2). Going from {A} to {B}, you subtract {B}'s origin instead of adding it.` },
    { short: 'Free play', title: 'Free play', text: 'Drag {B} and P anywhere. The three readouts always fit together: the first plus the second is the third.', final: true, onEnter: () => { st.mode = 'free'; sync(); } },
  ];
  function init() {
    kb = handles($('#framesCv'), { names, pos, set, redraw: draw, say: (n) => (n === 'B' ? `Origin of {B} at ${fmt(st.oB)} in {A}` : `P at ${fmt(st.P)} in {A}, ${fmt(pB())} in {B}`) });
    HeroKit.onTheme(draw); window.addEventListener('resize', draw);
    ctl = Missions.mount('#framesMis', missions, api);
    sync();
    return { ctl, set, state: api.state, st };
  }
  return { init };
})();

/* ---------- Small interactive: a 3D frame you can turn, and flip ---------- */
const ThreeD = (() => {
  const H = 300, O3 = { x: W / 2, y: 170 }, R = 110, rad = (d) => d * Math.PI / 180;
  const st = { yaw: 35, pitch: 20, flip: [1, 1, 1] };
  let kb = null, last = null;
  const axes = () => [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((e, i) => Vec.scale(e, st.flip[i]));
  function project(v) { // screen right, screen up, towards the viewer: a proper rotation, so nothing is mirrored
    const y = rad(st.yaw), p = rad(st.pitch);
    const r = [Math.cos(y), -Math.sin(y), 0], u = [Math.sin(p) * Math.sin(y), Math.sin(p) * Math.cos(y), Math.cos(p)], t = Vec.cross3(r, u);
    const d = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    return { x: O3.x + d(v, r) * R, y: O3.y - d(v, u) * R, z: d(v, t) };
  }
  function draw() {
    const cv = $('#threeCv'), { c, k } = HeroKit.fit(cv, W, H), P = pal();
    c.fillStyle = P.bg; c.fillRect(0, 0, W, H);
    const cols = [P.x, P.y, P.z], ax = axes();
    ax.map((v, i) => ({ i, p: project(v) })).sort((m, n) => m.p.z - n.p.z).forEach(({ i, p }) => {
      const L = Math.hypot(p.x - O3.x, p.y - O3.y), ux = (p.x - O3.x) / (L || 1), uy = (p.y - O3.y) / (L || 1), hl = 12;
      c.strokeStyle = cols[i]; c.fillStyle = cols[i]; c.lineWidth = 4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(O3.x, O3.y); c.lineTo(p.x - ux * hl * 0.8, p.y - uy * hl * 0.8); c.stroke();
      if (L > 14) { c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - ux * hl - uy * hl * 0.45, p.y - uy * hl + ux * hl * 0.45); c.lineTo(p.x - ux * hl + uy * hl * 0.45, p.y - uy * hl - ux * hl * 0.45); c.closePath(); c.fill(); }
      HeroKit.label(c, k, 'xyz'[i], p.x + ux * 16, p.y + uy * 16, { color: cols[i], px: 15 });
    });
    c.beginPath(); c.arc(O3.x, O3.y, 5, 0, 7); c.fillStyle = P.ink; c.fill();
    const h = Vec.handedness(...ax), flipped = 'xyz'.split('').filter((_, i) => st.flip[i] < 0);
    setOut($('#threeOut'), h === 'right'
      ? `<b>Right-handed.</b> Curl your right hand's fingers from x towards y: your thumb points along z.${flipped.length ? ` (Flipped: ${flipped.join(' and ')}.)` : ''}`
      : `<b>Left-handed.</b> Flipped: ${flipped.join(', ')}. Your right thumb now points against z; only the left hand fits.`);
    ['X', 'Y', 'Z'].forEach((n, i) => $('#flip' + n).setAttribute('aria-pressed', String(st.flip[i] < 0)));
  }
  function turn(dyaw, dpitch) { st.yaw = (st.yaw + dyaw) % 360; st.pitch = Math.max(-80, Math.min(80, st.pitch + dpitch)); draw(); }
  function flip(i) { st.flip[i] *= -1; draw(); }
  function init() {
    const cv = $('#threeCv');
    HeroKit.drag(cv, W, H, {
      hit: () => 'view', start: (o, p) => { last = p; },
      move(o, p) { turn(-(p.x - last.x) * 0.6, (p.y - last.y) * 0.6); last = p; },
    });
    kb = HeroKit.keys(cv, { handles: ['view'], move: (n, dx, dy) => turn(-dx * 20, -dy * 20), describe: () => $('#threeOut').textContent });
    ['X', 'Y', 'Z'].forEach((n, i) => $('#flip' + n).addEventListener('click', () => flip(i)));
    HeroKit.onTheme(draw); window.addEventListener('resize', draw);
    draw();
    return { flip, state: () => ({ flip: st.flip.slice(), hand: Vec.handedness(...axes()) }) };
  }
  return { init };
})();

/* ---------- Quiz ---------- */
const QUIZ = [
  { q: 'Two arrows have the same length and point the same way, but start in different places. Are they the same vector?', o: ['No, the start matters', 'Yes', 'Only if they also end in the same place'], a: 1, e: 'A vector is a length and a direction, nothing more. Where you draw it doesn\'t change it.' },
  { q: 'Can the length of a vector be negative?', o: ['Yes, when it points left', 'No, a length is never negative', 'Only in 3D'], a: 1, e: 'A vector pointing left has a negative x component, but its length is a distance, so it is zero or more.' },
  { q: 'Is a + b the same as b + a?', o: ['Yes', 'No, the order matters', 'Only for unit vectors'], a: 0, e: 'Head to tail in either order ends at the same point, and in numbers each component is a plain sum.' },
  { q: 'What is (2, −1) + (−3, 4)?', o: ['(−1, 3)', '(5, −5)', '(−1, −5)'], a: 0, e: 'Add the x parts and the y parts separately: (2 − 3, −1 + 4) = (−1, 3).' },
  { q: 'How long is the vector (5, 12)?', o: ['17', '13', '60'], a: 1, e: 'Pythagoras: √(25 + 144) = √169 = 13. Adding the components (17) is a common slip.' },
  { q: 'You flip only the z axis of a right-handed frame. What do you get?', o: ['A right-handed frame', 'A left-handed frame', 'No frame at all'], a: 1, e: 'One flip turns a right-handed frame into its mirror image. A second flip turns it back.' },
  { q: '{B}\'s origin is at (4, 0) in {A}, and a point is at (1, 2) in {B}. Where is it in {A}?', o: ['(3, −2)', '(5, 2)', '(4, 2)'], a: 1, e: 'Head to tail: (4, 0) + (1, 2) = (5, 2).' },
  { q: 'A point is at (3, 3) in {A}, and {B}\'s origin is at (1, 2) in {A}. Where is the point in {B}?', o: ['(4, 5)', '(2, 1)', '(−2, −1)'], a: 1, e: 'Going from {A} to {B}, subtract {B}\'s origin: (3 − 1, 3 − 2) = (2, 1). The same point has different coordinates in different frames.' },
];
function initQuiz() { Quiz.render('#quizBox', QUIZ, '#quizScore'); }

(function boot() {
  const safe = (name, fn) => { try { return fn(); } catch (e) { console.error('[lesson] error in', name, e); } };
  const start = () => {
    safe('theme', initTheme); safe('nav', initNav);
    const arrows = safe('arrows', Arrows.init), parts = safe('parts', Parts.init), frames = safe('frames', TwoFrames.init), three = safe('three', ThreeD.init);
    safe('quiz', initQuiz);
    window.__m1 = { arrows, parts, frames, three, quiz: QUIZ }; window.__lessonReady = true;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
