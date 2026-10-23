/* =====================================================================
   ui-m2.js — scenes, missions and quiz of lesson M.2, trigonometry for robot arms.
   Uses ui-core.js ($, setRangeFill, initTheme, initNav), kit.js (HeroKit), vec.js (Vec),
   planar-arm.js (PlanarArm), missions.js (Missions) and quiz.js (Quiz).
   Page text is Turkish (constitution, Scope and Language); decimals use a point.
   window.__m2 is a test hook for tools/lesson_m2.js only.
   ===================================================================== */
'use strict';
const W = 420;
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const wrap = (d) => { const x = ((d + 180) % 360 + 360) % 360 - 180; return x === -180 ? 180 : x; }; // (−180°, 180°]
const n2 = (v, d) => Vec.num(v, d == null ? 2 : d);
const css = (n) => HeroKit.css(n);
const pal = () => ({ bg: css('--surface-2'), grid: css('--line'), axis: css('--axis'), ink: css('--ink'), ink3: css('--ink-3'), surf: css('--surface'),
  a: css('--classic'), b: css('--hybrid'), c: css('--e2e'), good: css('--good'), bad: css('--critical') });
function setOut(el, html) { if (el.dataset.h !== html) { el.innerHTML = html; el.dataset.h = html; } }

// a scene with its own scale: origin (ox, oy) in px, u px per unit, y up
const view = (ox, oy, u) => ({ px: ([x, y]) => [ox + x * u, oy - y * u], un: (p) => [(p.x - ox) / u, (oy - p.y) / u], u, ox, oy });
function line(c, V, a, b, col, w, dash) { const [x0, y0] = V.px(a), [x1, y1] = V.px(b); c.strokeStyle = col; c.lineWidth = w || 2; c.lineCap = 'round'; c.setLineDash(dash ? [6, 5] : []); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.setLineDash([]); }
function arc(c, V, at, r, a0, a1, col, w) { const [x, y] = V.px(at); c.strokeStyle = col; c.lineWidth = w || 2; c.beginPath(); c.arc(x, y, r, -a0, -a1, a1 > a0); c.stroke(); }
function knob(c, V, P, p, active) {
  const [x, y] = V.px(p);
  c.beginPath(); c.arc(x, y, 7, 0, 7); c.fillStyle = P.surf; c.fill(); c.lineWidth = 2.5; c.strokeStyle = P.ink; c.stroke();
  if (active) { c.beginPath(); c.arc(x, y, 12, 0, 7); c.lineWidth = 2; c.setLineDash([3, 3]); c.stroke(); c.setLineDash([]); }
}
function label(c, k, V, s, p, col, dx, dy) { const [x, y] = V.px(p); HeroKit.label(c, k, s, x + (dx || 0), y + (dy || 0), { color: col, px: 13 }); }
function paper(c, P, V, H, step) {
  c.fillStyle = P.bg; c.fillRect(0, 0, W, H || W);
  HeroKit.grid(c, W, H || W, step || V.u, P.grid);
  c.strokeStyle = P.axis; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, V.oy + 0.5); c.lineTo(W, V.oy + 0.5); c.moveTo(V.ox + 0.5, 0); c.lineTo(V.ox + 0.5, H || W); c.stroke();
}

/* ---------- Lab 1: the unit circle ---------- */
const Circle = (() => {
  const V = view(W / 2, W / 2, 150);
  const st = { th: 30 };
  let ctl = null, kb = null, busy = false;
  const pt = () => [Math.cos(st.th * D2R), Math.sin(st.th * D2R)];
  function draw() {
    const cv = $('#circleCv'), { c, k } = HeroKit.fit(cv, W, W), P = pal(), [x, y] = pt();
    paper(c, P, V, W, 30);
    c.strokeStyle = P.ink3; c.lineWidth = 1.5; c.beginPath(); c.arc(V.ox, V.oy, V.u, 0, 7); c.stroke();
    label(c, k, V, '1', [1, 0], P.ink3, 10, 12); label(c, k, V, '−1', [-1, 0], P.ink3, -12, 12); label(c, k, V, '1', [0, 1], P.ink3, 10, -8);
    arc(c, V, [0, 0], 30, 0, st.th * D2R, P.b, 2.5);
    line(c, V, [0, 0], [x, 0], P.a, 4); line(c, V, [x, 0], [x, y], P.c, 4);
    line(c, V, [0, 0], [x, y], P.ink, 2.5);
    label(c, k, V, 'cos θ', [x / 2, 0], P.a, 0, y >= 0 ? 14 : -14); label(c, k, V, 'sin θ', [x, y / 2], P.c, x >= 0 ? 26 : -26, 0);
    label(c, k, V, 'θ', [0, 0], P.b, 40 * Math.cos(st.th * D2R / 2), -40 * Math.sin(st.th * D2R / 2));
    knob(c, V, P, [x, y], kb && kb.active === 'p');
    setOut($('#circleOut'), `θ = <b>${Math.round(st.th)}°</b> = <b>${n2(st.th * D2R, 3)} rad</b> · cos θ = <b>${n2(x, 3)}</b> · sin θ = <b>${n2(y, 3)}</b>`);
  }
  function setTh(d) { st.th = wrap(Math.round(d)); draw(); if (ctl) ctl.update(); }
  const api = {
    reset() { setTh(30); },
    state: () => ({ th: st.th, cos: pt()[0], sin: pt()[1] }),
    async go(to) { busy = true; const from = st.th, steps = HeroKit.reduced() ? 1 : 30; for (let s = 1; s <= steps; s++) { st.th = from + (to - from) * s / steps; draw(); if (steps > 1) await new Promise((r) => setTimeout(r, 20)); } st.th = wrap(to); busy = false; draw(); return api.state(); },
  };
  const missions = [
    { short: 'x = 0.5', title: 'Kosinüsü 0.5 olan açı', text: 'Noktayı çember üzerinde, x koordinatı 0.5 olacak bir yere getir.',
      onEnter: () => setTh(30),
      criteria: [{ label: 'cos θ = 0.5', test: (r, s) => Math.abs(s.cos - 0.5) <= 0.01 }],
      hint: 'x = 0.5, çemberin yarıçapının yarısı. Açıyı 60°\'ye getir; başka bir cevap da var.',
      explain: (s) => `θ = ${Math.round(s.th)}°, cos θ = ${n2(s.cos, 3)}. Hem 60° hem −60° işe yarar: kosinüs, açının işaretine bakmaz. Bir kosinüs değerinden açıya dönerken bu yüzden iki aday çıkar.` },
    { short: 'İşaret', title: 'sin 210° hangi işarette?', text: 'Nokta şimdi 150°\'de. Açıyı 210°\'ye getireceksin.',
      onEnter: () => setTh(150),
      bet: { q: 'sin 210° hangi işarettedir?', options: ['Pozitif', 'Negatif', 'Sıfır'], answer: () => 1 },
      action: { label: 'Açıyı 210°\'ye getir', run: () => api.go(210) },
      criteria: [{ label: 'Açıyı 210°\'ye getirdin', test: (r) => r != null }],
      explain: (r) => `sin 210° = ${n2(r.sin, 3)}: nokta x ekseninin altında, yani y negatif. 210° çemberin sol alt çeyreğinde; orada kosinüs de negatif (${n2(r.cos, 3)}).` },
    { short: '1 rad', title: 'Bir radyan', text: 'Açıyı 1 radyana getir. Okumadaki radyan değerini izle.',
      onEnter: () => setTh(0),
      criteria: [{ label: 'θ ≈ 1 rad', test: (r, s) => Math.abs(s.th - R2D) <= 1 }],
      hint: '1 rad ≈ 57.3°.',
      explain: (s) => `θ = ${Math.round(s.th)}° ≈ ${n2(s.th * D2R, 3)} rad. Bu açıda, noktanın çember üzerinde katettiği yay yarıçap kadar, yani 1 uzunluğunda.` },
    { short: 'Serbest', title: 'Serbest oyun', text: 'Noktayı istediğin yere götür. cos θ ve sin θ\'nın dört çeyrekteki işaretlerini izle.', final: true },
  ];
  function init() {
    const cv = $('#circleCv');
    HeroKit.drag(cv, W, W, {
      hit(p) { const [x, y] = V.px(pt()); return Math.hypot(p.x - x, p.y - y) < 26 ? 'p' : null; },
      move(o, p) { if (!busy) setTh(Vec.angle(V.un(p)) * R2D); },
    });
    kb = HeroKit.keys(cv, { handles: ['p'], move: (n, dx, dy) => { if (!busy) setTh(st.th + (dx + dy) * 10); }, describe: () => `θ = ${Math.round(st.th)}°, cos ${n2(pt()[0], 3)}, sin ${n2(pt()[1], 3)}`, redraw: draw });
    HeroKit.onTheme(draw); window.addEventListener('resize', draw);
    ctl = Missions.mount('#circleMis', missions, api);
    draw();
    return { ctl, setTh, state: api.state };
  }
  return { init };
})();

/* ---------- Lab 2: a link is a length and an angle ---------- */
const Links = (() => {
  const V = view(W / 2, W / 2, 90), L = [1, 1], TARGET = [0.87, 1.5];
  const st = { q: [0, 0], mode: 'predict', reveal: false };
  let ctl = null, kb = null, busy = false;
  const fk = () => PlanarArm.fk(L, st.q.map((d) => d * D2R));
  const dist = () => Vec.len(Vec.sub(fk().tip, TARGET));
  function draw() {
    const cv = $('#linksCv'), { c, k } = HeroKit.fit(cv, W, W), P = pal(), { joints } = fk(), act = kb && kb.active, show = st.mode !== 'predict' || st.reveal;
    paper(c, P, V, W, 45);
    if (st.mode === 'reach') { const [tx, ty] = V.px(TARGET); c.beginPath(); c.arc(tx, ty, 0.05 * V.u * 2, 0, 7); c.setLineDash([4, 4]); c.strokeStyle = P.good; c.lineWidth = 2.5; c.stroke(); c.setLineDash([]); }
    const [e, h] = [joints[1], joints[2]], t1 = st.q[0] * D2R;
    line(c, V, e, Vec.add(e, Vec.polar(0.55, t1)), P.ink3, 1.5, true);
    arc(c, V, [0, 0], 26, 0, t1, P.a, 2); arc(c, V, e, 24, t1, t1 + st.q[1] * D2R, P.b, 2);
    line(c, V, [0, 0], e, P.a, 9); line(c, V, e, h, P.b, 7);
    label(c, k, V, 'θ₁', [0, 0], P.a, 38 * Math.cos(t1 / 2), -38 * Math.sin(t1 / 2));
    const m2 = t1 + st.q[1] * D2R / 2; label(c, k, V, 'θ₂', e, P.b, 36 * Math.cos(m2), -36 * Math.sin(m2));
    c.beginPath(); c.arc(...V.px([0, 0]), 8, 0, 7); c.fillStyle = P.ink; c.fill();
    knob(c, V, P, e, act === 'elbow'); knob(c, V, P, h, act === 'hand');
    setOut($('#linksOut'), `Dirsek: <b>${Vec.fmt(e, 2)}</b> = (cos θ₁, sin θ₁) · El: <b>${show ? Vec.fmt(h, 2) : '?'}</b> · ikinci uzvun açısı θ₁ + θ₂ = <b>${Math.round(wrap(st.q[0] + st.q[1]))}°</b>`);
  }
  function sync() {
    [['#q1In', 0], ['#q2In', 1]].forEach(([sel, i]) => { const inp = $(sel); inp.value = Math.round(st.q[i]); inp.nextElementSibling.textContent = `${inp.value}°`; setRangeFill(inp); });
    draw(); if (ctl) ctl.update();
  }
  function setQ(a, b) { st.q = [wrap(Math.round(a)), wrap(Math.round(b))]; sync(); }
  const api = {
    reset() { st.mode = 'predict'; st.reveal = false; setQ(0, 0); },
    state: () => ({ q: st.q.slice(), tip: fk().tip, dist: dist() }),
    async pose(a, b) {
      busy = true; const [a0, b0] = st.q, steps = HeroKit.reduced() ? 1 : 30;
      for (let s = 1; s <= steps; s++) { st.q = [a0 + (a - a0) * s / steps, b0 + (b - b0) * s / steps]; draw(); if (steps > 1) await new Promise((r) => setTimeout(r, 20)); }
      busy = false; st.reveal = true; setQ(a, b); return api.state();
    },
  };
  const missions = [
    { short: 'Tahmin', title: 'El nerede olacak?', text: 'Kolu θ₁ = 90°, θ₂ = −90° açılarına getireceksin. İki uzvun da uzunluğu 1.',
      onEnter: () => { st.mode = 'predict'; st.reveal = false; setQ(0, 0); },
      bet: { q: 'El hangi noktada olacak?', options: ['(0, 2)', '(1, 1)', '(−1, 1)'], answer: () => 1 },
      action: { label: 'Açıları uygula', run: () => api.pose(90, -90) },
      criteria: [{ label: 'Kolu bu açılara getirdin', test: (r) => r != null }],
      explain: (r) => `El ${Vec.fmt(r.tip, 2)} noktasında. Dirsek (cos 90°, sin 90°) = (0, 1) noktasında. İkinci uzuv θ₁ + θ₂ = 0° yönünde, yani (1, 0) ekliyor: (0, 1) + (1, 0) = (1, 1).` },
    { short: 'Hedef', title: 'Eli hedefe koy', text: 'Eli yeşil hedefin, yani (0.87, 1.5) noktasının üstüne getir. Kaydırıcıları, ok tuşlarını ya da sürüklemeyi kullan.',
      onEnter: () => { st.mode = 'reach'; setQ(0, 0); },
      criteria: [{ label: 'El hedefin 0.05 yakınında', test: (r, s) => s.dist <= 0.05 }],
      hint: 'θ₁ = 30°, θ₂ = 60° dene. Bir çözüm daha var: θ₁ = 90°, θ₂ = −60°.',
      explain: (s) => `θ₁ = ${Math.round(s.q[0])}°, θ₂ = ${Math.round(s.q[1])}°. İkinci uzuv x ekseninden θ₁ + θ₂ = ${Math.round(wrap(s.q[0] + s.q[1]))}° açıyla uzanıyor; el = (cos θ₁ + cos(θ₁ + θ₂), sin θ₁ + sin(θ₁ + θ₂)) = ${Vec.fmt(s.tip, 2)}.` },
    { short: 'Serbest', title: 'Serbest oyun', text: 'Kolu istediğin gibi oynat. θ₁\'i değiştirince ikinci uzvun da birlikte döndüğüne dikkat et.', final: true, onEnter: () => { st.mode = 'free'; draw(); } },
  ];
  function init() {
    const cv = $('#linksCv');
    ['#q1In', '#q2In'].forEach((sel, i) => $(sel).addEventListener('input', (e) => { if (busy) return; const q = st.q.slice(); q[i] = +e.target.value; setQ(q[0], q[1]); }));
    HeroKit.drag(cv, W, W, {
      hit(p) { const { joints } = fk(); for (const [n, i] of [['hand', 2], ['elbow', 1]]) { const [x, y] = V.px(joints[i]); if (Math.hypot(p.x - x, p.y - y) < 22) return n; } return null; },
      move(n, p) {
        if (busy) return; const u = V.un(p);
        if (n === 'elbow') setQ(Vec.angle(u) * R2D, st.q[1]);
        else { const e = fk().joints[1]; setQ(st.q[0], Vec.angle(Vec.sub(u, e)) * R2D - st.q[0]); }
      },
    });
    kb = HeroKit.keys(cv, {
      handles: ['elbow', 'hand'],
      move(n, dx, dy) { if (busy) return; const d = (dx + dy) * 10; if (n === 'elbow') setQ(st.q[0] + d, st.q[1]); else setQ(st.q[0], st.q[1] + d); },
      describe: (n) => (n === 'elbow' ? `Omuz θ₁ = ${Math.round(st.q[0])}°` : `Dirsek θ₂ = ${Math.round(st.q[1])}°`), redraw: draw,
    });
    HeroKit.onTheme(draw); window.addEventListener('resize', draw);
    ctl = Missions.mount('#linksMis', missions, api);
    sync();
    return { ctl, setQ, state: api.state };
  }
  return { init };
})();

/* ---------- Small interactive: arctan vs atan2 ---------- */
const Atan = (() => {
  const V = view(W / 2, W / 2, 42);
  let p = [2, 1], kb = null;
  function draw() {
    const cv = $('#atanCv'), { c, k } = HeroKit.fit(cv, W, W), P = pal();
    paper(c, P, V, W, 42);
    const zero = Math.abs(p[0]) < 1e-9 && Math.abs(p[1]) < 1e-9, a2 = Vec.angle(p), at = Math.abs(p[0]) < 1e-9 ? null : Math.atan(p[1] / p[0]);
    if (!zero) {
      arc(c, V, [0, 0], 34, 0, a2, P.c, 3);
      if (at != null) line(c, V, [0, 0], Vec.polar(3.2, at), P.a, 2.5, true);
      line(c, V, [0, 0], p, P.ink, 2.5);
    }
    knob(c, V, P, p, kb && kb.active === 'p'); label(c, k, V, 'P', p, P.ink, 12, -12);
    const deg = (r) => `${n2(r * R2D, 1)}°`;
    setOut($('#atanOut'), `P = <b>${Vec.fmt(p)}</b> · <span style="color:var(--classic)">arctan(y/x)</span> = <b>${at == null ? 'tanımsız (x = 0)' : deg(at)}</b> · <span style="color:var(--e2e)">atan2(y, x)</span> = <b>${zero ? 'tanımsız (P orijinde)' : deg(a2)}</b>`);
  }
  function set(v) { p = v.map((x) => Math.max(-4.5, Math.min(4.5, x))); draw(); }
  function init() {
    const cv = $('#atanCv');
    HeroKit.drag(cv, W, W, {
      hit(q) { const [x, y] = V.px(p); return Math.hypot(q.x - x, q.y - y) < 24 ? 'p' : null; },
      move(o, q) { set(V.un(q).map((x) => Math.round(x * 2) / 2)); },
    });
    kb = HeroKit.keys(cv, { handles: ['p'], move: (n, dx, dy) => set(Vec.add(p, [dx, dy]).map((x) => Math.round(x * 10) / 10)), describe: () => $('#atanOut').textContent, redraw: draw });
    HeroKit.onTheme(draw); window.addEventListener('resize', draw);
    draw();
    return { set };
  }
  return { init };
})();

/* ---------- Small interactive: law of cosines and the elbow ---------- */
const CosRule = (() => {
  const H = 300, V = view(70, 230, 120), L1 = 1, L2 = 1;
  let d = 1.2;
  function draw() {
    const cv = $('#cosCv'), { c, k } = HeroKit.fit(cv, W, H), P = pal();
    c.fillStyle = P.bg; c.fillRect(0, 0, W, H); HeroKit.grid(c, W, H, 30, P.grid);
    const g = Vec.cosRule(L1, L2, d), T = [d, 0];
    line(c, V, [0, 0], T, P.ink3, 1.5, true); label(c, k, V, `d = ${n2(d)}`, [d / 2, 0], P.ink3, 0, 14);
    if (g != null) {
      const sols = PlanarArm.ik2(L1, L2, d, 0), q = sols.reduce((m, s) => (s[0] > m[0] ? s : m), sols[0]); // elbow up
      const { joints } = PlanarArm.fk([L1, L2], q), e = joints[1];
      line(c, V, [0, 0], e, P.a, 8); line(c, V, e, joints[2], P.b, 6);
      if (g > 1e-3) { const a0 = Vec.angle(Vec.sub([0, 0], e)), a1 = Vec.angle(Vec.sub(T, e)); arc(c, V, e, 24, Math.min(a0, a1), Math.max(a0, a1), P.c, 2.5); label(c, k, V, 'γ', e, P.c, 0, 36); }
      c.beginPath(); c.arc(...V.px(e), 6, 0, 7); c.fillStyle = P.surf; c.fill(); c.strokeStyle = P.ink; c.lineWidth = 2.5; c.stroke();
      const [tx, ty] = V.px(T); c.beginPath(); c.arc(tx, ty, 9, 0, 7); c.strokeStyle = P.good; c.lineWidth = 2.5; c.stroke();
    } else {
      line(c, V, [0, 0], [1, 0], P.a, 8); line(c, V, [1, 0], [2, 0], P.b, 6);
      const [tx, ty] = V.px(T); HeroKit.cross(c, tx, ty, 8, P.bad, 3);
    }
    c.beginPath(); c.arc(...V.px([0, 0]), 7, 0, 7); c.fillStyle = P.ink; c.fill();
    const cg = (L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2);
    setOut($('#cosOut'), g == null
      ? `d = <b>${n2(d)}</b> · <b>ulaşılamaz</b>: cos γ = ${n2(cg)} çıkardı, oysa kosinüs −1'den küçük olamaz. İki uzuv en fazla ${n2(L1 + L2)} birim uzanır.`
      : `d = <b>${n2(d)}</b> · uzuvlar arası açı γ = <b>${n2(g * R2D, 1)}°</b> · dirsek açısı θ₂ = 180° − γ = <b>${n2(180 - g * R2D, 1)}°</b>`);
  }
  function set(v) { d = v; const inp = $('#dIn'); inp.value = Math.min(2.4, v); inp.nextElementSibling.textContent = n2(v); setRangeFill(inp); draw(); }
  function init() {
    $('#dIn').addEventListener('input', (e) => set(+e.target.value));
    $('#dSqrt2').addEventListener('click', () => set(Math.SQRT2));
    HeroKit.onTheme(draw); window.addEventListener('resize', draw);
    set(1.2);
    return { set, read: () => $('#cosOut').textContent };
  }
  return { init };
})();

/* ---------- Quiz ---------- */
const QUIZ = [
  { q: '180° kaç radyandır?', o: ['π/2', 'π', '2π'], a: 1, e: 'Yarım tur π radyandır; tam tur 2π.' },
  { q: 'Pozitif bir açı hangi yöne döner?', o: ['Saat yönünde', 'Saat yönünün tersine', 'Fark etmez'], a: 1, e: 'Matematikte ve robotikte pozitif açı saat yönünün tersidir: x ekseninden y eksenine doğru.' },
  { q: 'sin 30° kaçtır?', o: ['0.5', '0.866', '1'], a: 0, e: 'sin 30° = 0.5. 0.866, cos 30°\'dir.' },
  { q: 'cos 120° hangi işarettedir?', o: ['Pozitif', 'Negatif', 'Sıfır'], a: 1, e: 'cos 120° = −0.5: birim çemberdeki nokta y ekseninin solunda.' },
  { q: 'Uzunluğu 2 olan bir uzuv 90° açıyla duruyor. Ucu nerededir?', o: ['(2, 0)', '(0, 2)', '(2, 2)'], a: 1, e: '(2 cos 90°, 2 sin 90°) = (0, 2).' },
  { q: '(−1, −1) noktasının x ekseniyle yaptığı açı nedir?', o: ['45°', '−135°', '135°'], a: 1, e: 'atan2(−1, −1) = −135° (ya da 225°). arctan(−1/−1) = 45° derdi: yanlış çeyrek.' },
  { q: 'Açıyı bileşenlerden bulurken arctan(y/x) yerine neden atan2(y, x) kullanılır?', o: ['Daha hızlı olduğu için', 'x ve y\'nin işaretine bakıp doğru çeyreği bulduğu için', 'Derece verdiği için'], a: 1, e: 'y/x bölümü işaret bilgisini kaybeder ve x = 0\'da tanımsızdır; atan2 ikisini ayrı alır.' },
  { q: 'Uzuvları 3 ve 4 olan bir kolun eli tabandan 5 uzakta. Uzuvlar arasındaki açı kaçtır?', o: ['90°', '60°', '180°'], a: 0, e: 'Kosinüs teoremi: cos γ = (9 + 16 − 25) / (2 · 3 · 4) = 0, yani γ = 90°. 3-4-5 dik üçgeni.' },
];
function initQuiz() { Quiz.render('#quizBox', QUIZ, '#quizScore'); }

(function boot() {
  const safe = (name, fn) => { try { return fn(); } catch (e) { console.error('[lesson] error in', name, e); } };
  const start = () => {
    safe('theme', initTheme); safe('nav', initNav);
    const circle = safe('circle', Circle.init), links = safe('links', Links.init), atan = safe('atan', Atan.init), cos = safe('cos', CosRule.init);
    safe('quiz', initQuiz);
    window.__m2 = { circle, links, atan, cos, quiz: QUIZ }; window.__lessonReady = true;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
