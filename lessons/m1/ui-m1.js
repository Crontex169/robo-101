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
    const r = st.mode === 'match' ? `a = <b>${fmt(a())}</b> · kesikli ok = <b>${fmt(MATCH)}</b>`
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
    { short: 'Eşle', title: 'Aynı vektör, farklı yer', text: 'Kesikli ok bir vektör. Mavi <b>a</b> okunun iki ucunu, aynı vektör olana kadar sürükle: aynı uzunluk, aynı yön. Kesikli okun üstüne oturması gerekmiyor.',
      onEnter: () => { st.mode = 'match'; sync(); },
      criteria: [{ label: 'a, kesikli okla aynı uzunlukta ve aynı yönde', test: (r, s) => Vec.near(s.a, MATCH, 0.25) }],
      hint: 'Ucu, kuyruğun 3 kare sağına ve 2 kare yukarısına koy.',
      explain: (s) => `a = ${fmt(s.a)}, kesikli okla aynı; oysa ikisi farklı yerlerden başlıyor. Vektör yalnızca bir uzunluk ve bir yön; nereye çizeceğin sana kalmış.` },
    { short: 'Tahmin', title: 'Toplamı tahmin et', text: '<b>a</b> oku ortadaki noktadan 3 sağa ve 1 yukarı gidiyor. <b>b</b> oku 1 sola ve 2 yukarı gidiyor. Şimdi b\'yi, a\'nın bittiği yerden başlayacak şekilde kaydıracaksın. a + b toplamı, noktadan b\'nin yeni ucuna giden oktur.',
      onEnter: () => { st.mode = 'sum'; st.bTail = B2_PARK; st.added = false; sync(); },
      bet: { q: 'a + b nerede biter?', options: ['(4, 3)', '(2, 3)', '(−3, 2)'], answer: () => 1 },
      action: { label: 'b\'yi a\'nın ucuna koy', run: () => api.addB() },
      criteria: [{ label: 'İki oku topladın', test: (r) => r != null }],
      explain: (r) => `a + b = (3 − 1, 1 + 2) = ${fmt(r.sum)}. Izgarada uç uca; sayılarda ise önce x parçalarını, sonra y parçalarını topla.` },
    { short: 'Ulaş', title: 'İki okla hedefe', text: 'Şimdi <b>a</b> noktadan başlıyor, <b>b</b> de a nerede bitiyorsa oradan. İki ucu, b yeşil hedefte bitecek şekilde sürükle. Her ok en az bir kare uzunluğunda olmalı.',
      onEnter: () => { st.mode = 'chain'; st.a1 = [2, 0]; st.b = [0, 1]; sync(); },
      criteria: [
        { label: 'b hedefte bitiyor', test: (r, s) => Vec.near(s.end, TARGET, 0.25) },
        { label: 'İki ok da en az 1 kare uzunluğunda', test: (r, s) => Vec.len(s.a) >= 1 && Vec.len(s.b) >= 1 },
      ],
      hint: 'Hedef 4 sağda ve 3 yukarıda. b geri kalanı tamamladığı sürece her a olur: a = (2, 2) ve b = (2, 1) dene.',
      explain: (s) => `a = ${fmt(s.a)} ve b = ${fmt(s.b)}, toplamda ${fmt(Vec.add(s.a, s.b))} ediyor. Hedefe ulaşan pek çok çift var; hedef yalnızca toplamı belirliyor. Robot kolu da böyle çalışır: her uzuv bir vektördür ve el, uzuvların toplamında durur.` },
    { short: 'Serbest', title: 'Serbest oyun', text: 'İki ucu da hareket ettir. Kesikli turuncu ok her zaman a + b. Toplamı sıfır yapabilir misin?', final: true, onEnter: () => { st.mode = 'free'; sync(); } },
  ];
  function init() {
    const cv = $('#arrowsCv');
    kb = handles(cv, { names, pos, set, redraw: draw, say: (n) => `${n === 'tail' ? 'a\'nın kuyruğu' : n === 'tip' || n === 'a' ? 'a\'nın ucu' : 'b\'nin ucu'}: ${fmt(pos(n))}` });
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
    setOut($('#partsOut'), `v = <b>${fmt(v)}</b> · uzunluk <b>${Vec.num(L, 2)}</b> · birim vektör ${u ? `<b>${fmt(u, 2)}</b>` : '<b>tanımsız</b>: uzunluğu sıfır olan bir ok hiçbir yöne bakmaz'}`);
  }
  function set(n, p) { v = p; draw(); }
  function init() {
    kb = handles($('#partsCv'), { names: () => ['tip'], pos: () => v, set, redraw: draw, say: () => `Uç: ${fmt(v)}, uzunluk ${Vec.num(Vec.len(v), 2)}` });
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
    { short: 'Tahmin', title: '{A}\'dan bakınca P', text: '{B}\'nin orijini {A}\'da (2, 1) noktasında, P ise {B}\'de (1, 3) noktasında. P, {A}\'da nerede?',
      onEnter: () => { st.mode = 'predict'; st.oB = [2, 1]; st.P = [3, 4]; st.reveal = false; sync(); },
      bet: { q: 'P, {A}\'da nerede?', options: ['(1, 2)', '(3, 4)', '(−1, −2)'], answer: () => 1 },
      action: { label: 'P\'yi {A}\'da göster', run: () => api.show() },
      criteria: [{ label: 'P\'nin {A}\'daki yerini açtın', test: (r) => r != null }],
      explain: (r) => `${sup('A')} = (2, 1) + (1, 3) = ${fmt(r.pA)}. {A}'nın orijininden {B}'nin orijinine, oradan da P'ye yürü: ilk laboratuvardaki gibi uç uca iki ok.` },
    { short: '{B}\'yi yerleştir', title: 'Noktayı değil çerçeveyi taşı', text: 'P, {A}\'da (1, 1) noktasında sabit. {B} çerçevesini, P {B}\'de (−1, 2) noktasına gelene kadar sürükle: {B}\'nin orijininin bir birim solu ve iki birim yukarısı.',
      onEnter: () => { st.mode = 'place'; st.P = [1, 1]; st.oB = [-3, -2]; sync(); },
      criteria: [{ label: `${sup('B')} = (−1, 2)`, test: (r, s) => Vec.near(s.pB, [-1, 2], 0.25) }],
      hint: 'P, {B}\'nin orijininin 1 solunda olmalı; yani orijin P\'nin 1 sağında, ve 2 aşağısında.',
      explain: (s) => `{B}'nin orijini {A}'da ${fmt(s.oB)} noktasında. Kontrol: (1, 1) − (2, −1) = (−1, 2). {A}'dan {B}'ye geçerken {B}'nin orijinini eklemek yerine çıkarırsın.` },
    { short: 'Serbest', title: 'Serbest oyun', text: '{B}\'yi ve P\'yi istediğin yere sürükle. Üç okuma her zaman birbirini tutar: birincisi artı ikincisi üçüncüyü verir.', final: true, onEnter: () => { st.mode = 'free'; sync(); } },
  ];
  function init() {
    kb = handles($('#framesCv'), { names, pos, set, redraw: draw, say: (n) => (n === 'B' ? `{B}'nin orijini, {A}'da ${fmt(st.oB)}` : `P, {A}'da ${fmt(st.P)}, {B}'de ${fmt(pB())}`) });
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
      ? `<b>Sağ elli.</b> Sağ elinin parmaklarını x'ten y'ye doğru kıvır: başparmağın z yönünü gösterir.${flipped.length ? ` (Ters çevrilen: ${flipped.join(' ve ')}.)` : ''}`
      : `<b>Sol elli.</b> Ters çevrilen: ${flipped.join(', ')}. Sağ başparmağın artık z'nin tersini gösteriyor; yalnızca sol el uyuyor.`);
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
  { q: 'İki okun uzunluğu aynı ve aynı yöne bakıyorlar, ama farklı yerlerden başlıyorlar. Aynı vektör müdürler?', o: ['Hayır, başlangıç önemli', 'Evet', 'Ancak aynı yerde de bitiyorlarsa'], a: 1, e: 'Vektör bir uzunluk ve bir yöndür, fazlası değil. Nereye çizdiğin onu değiştirmez.' },
  { q: 'Bir vektörün uzunluğu negatif olabilir mi?', o: ['Evet, sola bakıyorsa', 'Hayır, uzunluk asla negatif olmaz', 'Sadece 3B\'de'], a: 1, e: 'Sola bakan bir vektörün x bileşeni negatiftir, ama uzunluğu bir mesafedir; sıfır ya da daha büyüktür.' },
  { q: 'a + b ile b + a aynı mıdır?', o: ['Evet', 'Hayır, sıra önemli', 'Sadece birim vektörler için'], a: 0, e: 'Hangi sırayla uç uca koyarsan koy aynı noktada bitersin; sayılarda da her bileşen düz bir toplamdır.' },
  { q: '(2, −1) + (−3, 4) kaçtır?', o: ['(−1, 3)', '(5, −5)', '(−1, −5)'], a: 0, e: 'x parçalarını ve y parçalarını ayrı ayrı topla: (2 − 3, −1 + 4) = (−1, 3).' },
  { q: '(5, 12) vektörünün uzunluğu kaçtır?', o: ['17', '13', '60'], a: 1, e: 'Pisagor: √(25 + 144) = √169 = 13. Bileşenleri toplamak (17) sık yapılan bir hata.' },
  { q: 'Sağ elli bir çerçevenin yalnızca z eksenini ters çeviriyorsun. Ne elde edersin?', o: ['Sağ elli bir çerçeve', 'Sol elli bir çerçeve', 'Hiç çerçeve kalmaz'], a: 1, e: 'Tek bir ters çevirme, sağ elli çerçeveyi ayna görüntüsüne dönüştürür. İkinci bir ters çevirme geri getirir.' },
  { q: '{B}\'nin orijini {A}\'da (4, 0) noktasında, bir nokta da {B}\'de (1, 2) noktasında. Bu nokta {A}\'da nerede?', o: ['(3, −2)', '(5, 2)', '(4, 2)'], a: 1, e: 'Uç uca: (4, 0) + (1, 2) = (5, 2).' },
  { q: 'Bir nokta {A}\'da (3, 3) noktasında, {B}\'nin orijini de {A}\'da (1, 2) noktasında. Nokta {B}\'de nerede?', o: ['(4, 5)', '(2, 1)', '(−2, −1)'], a: 1, e: '{A}\'dan {B}\'ye geçerken {B}\'nin orijinini çıkar: (3 − 1, 3 − 2) = (2, 1). Aynı noktanın farklı çerçevelerde farklı koordinatları vardır.' },
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
