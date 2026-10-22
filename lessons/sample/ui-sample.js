/* =====================================================================
   ui-sample.js — scenes, missions and quiz of the sample lesson.
   Copy this file to start a new lesson. Uses ui-core.js ($, h, setRangeFill,
   initTheme, initNav), kit.js (HeroKit), planar-arm.js (PlanarArm),
   missions.js (Missions) and quiz.js (Quiz).
   window.__sample is a test hook for tools/lesson_sample.js only.
   ===================================================================== */
'use strict';
const L1 = 0.5, L2 = 0.4; // m
const W = 420, S = 190, O = { x: W / 2, y: W / 2 }; // scene: 190 px per metre, base at the centre, y up
const deg = (r) => r * 180 / Math.PI, rad = (d) => d * Math.PI / 180;
const wrapDeg = (d) => ((d + 180) % 360 + 360) % 360 - 180;
const fmt = (v, d) => v.toFixed(d == null ? 2 : d).replace('-', '−');
const toPx = ([x, y]) => [O.x + x * S, O.y - y * S];
const toM = (p) => [(p.x - O.x) / S, (O.y - p.y) / S];
const pal = () => ({ bg: HeroKit.css('--surface-2'), grid: HeroKit.css('--line'), ink: HeroKit.css('--ink'), ink3: HeroKit.css('--ink-3'), l1: HeroKit.css('--classic'), l2: HeroKit.css('--hybrid'), good: HeroKit.css('--good'), surf: HeroKit.css('--surface') });
function setOut(el, html) { if (el.dataset.h !== html) { el.innerHTML = html; el.dataset.h = html; } }

function drawArm(c, P, lengths, q) {
  const { joints } = PlanarArm.fk(lengths, q), px = joints.map(toPx);
  c.lineCap = 'round';
  [[P.l1, 14], [P.l2, 11]].forEach(([col, w], i) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(...px[i]); c.lineTo(...px[i + 1]); c.stroke(); });
  px.forEach(([x, y], i) => { c.beginPath(); c.arc(x, y, i === 0 ? 10 : 8, 0, 7); c.fillStyle = P.surf; c.fill(); c.lineWidth = 3; c.strokeStyle = P.ink; c.stroke(); });
  return px;
}
function background(c, P) {
  c.fillStyle = P.bg; c.fillRect(0, 0, W, W);
  HeroKit.grid(c, W, W, S / 5, P.grid);
}

/* ---------- Lab: joint angles → hand position ---------- */
const Arm = (() => {
  const st = { q: [rad(20), rad(60)] };
  const TARGET = PlanarArm.fk([L1, L2], [rad(110), rad(-75)]).tip;
  let ctl = null, animating = false;
  const tip = () => PlanarArm.fk([L1, L2], st.q).tip;
  const dist = () => Math.hypot(tip()[0] - TARGET[0], tip()[1] - TARGET[1]);
  function draw() {
    const cv = $('#armCv'), { c } = HeroKit.fit(cv, W, W), P = pal();
    background(c, P);
    const [tx, ty] = toPx(TARGET); c.setLineDash([5, 4]); c.strokeStyle = P.good; c.lineWidth = 2.5; c.beginPath(); c.arc(tx, ty, 0.03 * S, 0, 7); c.stroke(); c.setLineDash([]);
    drawArm(c, P, [L1, L2], st.q);
    const [x, y] = tip();
    setOut($('#armOut'), `Hand: x = <b>${fmt(x)} m</b>, y = <b>${fmt(y)} m</b> · distance to target <b>${fmt(dist() * 100, 0)} cm</b>`);
  }
  function sync() {
    [['#armQ1', 0], ['#armQ2', 1]].forEach(([sel, i]) => { const inp = $(sel); inp.value = Math.round(deg(st.q[i])); inp.nextElementSibling.textContent = `${inp.value}°`; setRangeFill(inp); });
    draw(); if (ctl) ctl.update();
  }
  function setAngles(a1, a2) { st.q = [rad(wrapDeg(a1)), rad(Math.max(-170, Math.min(170, a2)))]; sync(); }
  const api = {
    reset() { st.q = [rad(20), rad(60)]; sync(); },
    state: () => ({ dist: dist(), q: st.q.map(deg), tip: tip() }),
    async bend(dDeg) { // turn the elbow smoothly (instantly with reduced motion); returns how far the hand moved
      const y0 = tip()[1], a0 = deg(st.q[1]), steps = HeroKit.reduced() ? 1 : 24;
      animating = true;
      for (let k = 1; k <= steps; k++) { setAngles(deg(st.q[0]), a0 + dDeg * k / steps); if (steps > 1) await new Promise((r) => setTimeout(r, 20)); }
      animating = false;
      return { dy: tip()[1] - y0 };
    },
  };
  const missions = [
    { short: 'Target', title: 'Touch the target', text: 'Turn the joints until the hand is within 3 cm of the green target. Drag the elbow or the hand, or use the sliders.',
      criteria: [{ label: 'Hand within 3 cm of the target', test: (r, s) => s.dist < 0.03 }],
      hint: 'The target is up and to the left of the base. Swing the shoulder past 90° first, then bend the elbow back.',
      explain: (s) => `Joint angles θ₁ = ${fmt(s.q[0], 0)}°, θ₂ = ${fmt(s.q[1], 0)}°. Two numbers fixed the whole pose, and the hand's position followed from them: that's forward kinematics.` },
    { short: 'Predict', title: 'Predict, then check', text: 'The arm is now stretched along the table with the elbow bent a little. You are about to bend the elbow by another 20°.',
      onEnter: () => setAngles(0, 30),
      bet: { q: 'Where will the hand go?', options: ['Up', 'Down', 'Nowhere'], answer: (r) => (r.dy > 0 ? 0 : 1) },
      action: { label: 'Bend the elbow +20°', run: () => api.bend(20) },
      criteria: [{ label: 'You bent the elbow and watched the hand', test: (r) => r != null }],
      explain: (r) => `The hand went up by ${fmt(r.dy * 100, 0)} cm. A positive angle turns the forearm counterclockwise around the elbow, and from this pose that lifts the hand.` },
    { short: 'Free play', title: 'Free play', text: 'Move the arm however you like. Can you find two different poses that put the hand on the same point?', final: true },
  ];
  function init() {
    const cv = $('#armCv');
    ['#armQ1', '#armQ2'].forEach((sel, i) => $(sel).addEventListener('input', (e) => { if (animating) return; const q = st.q.map(deg); q[i] = +e.target.value; setAngles(q[0], q[1]); }));
    HeroKit.drag(cv, W, W, {
      hit(p) { const px = PlanarArm.fk([L1, L2], st.q).joints.map(toPx); for (const [k, i] of [['hand', 2], ['elbow', 1]]) if (Math.hypot(p.x - px[i][0], p.y - px[i][1]) < 22) return k; return null; },
      move(obj, p) {
        if (animating) return;
        const [x, y] = toM(p);
        if (obj === 'elbow') setAngles(deg(Math.atan2(y, x)), deg(st.q[1]));
        else { const e = PlanarArm.fk([L1], [st.q[0]]).tip; setAngles(deg(st.q[0]), wrapDeg(deg(Math.atan2(y - e[1], x - e[0]) - st.q[0]))); }
      },
    });
    HeroKit.onTheme(draw); window.addEventListener('resize', draw);
    ctl = Missions.mount('#armMis', missions, api);
    sync();
    return { ctl, setAngles, state: api.state, target: TARGET };
  }
  return { init };
})();

/* ---------- Small interactive: the reachable ring ---------- */
const Reach = (() => {
  let l2 = 0.4;
  function draw() {
    const cv = $('#reachCv'), { c } = HeroKit.fit(cv, W, W), P = pal(), r = PlanarArm.reach([L1, l2]);
    background(c, P);
    c.beginPath(); c.arc(O.x, O.y, r.outer * S, 0, 2 * Math.PI);
    c.moveTo(O.x + r.inner * S, O.y); c.arc(O.x, O.y, r.inner * S, 0, 2 * Math.PI);
    c.fillStyle = P.good; c.globalAlpha = 0.18; c.fill('evenodd'); c.globalAlpha = 1;
    c.strokeStyle = P.good; c.lineWidth = 2; c.beginPath(); c.arc(O.x, O.y, r.outer * S, 0, 7); c.stroke();
    if (r.inner > 0) { c.beginPath(); c.arc(O.x, O.y, r.inner * S, 0, 7); c.stroke(); }
    drawArm(c, P, [L1, l2], [rad(35), rad(110)]);
    setOut($('#reachOut'), `The hand reaches from <b>${fmt(r.inner)} m</b> to <b>${fmt(r.outer)} m</b> from the base.${r.inner === 0 ? ' Equal links: the ring is a full disc.' : ''}`);
  }
  function init() {
    const inp = $('#reachL2');
    const sync = () => { l2 = +inp.value; inp.nextElementSibling.textContent = `${fmt(l2)} m`; setRangeFill(inp); draw(); };
    inp.addEventListener('input', sync); HeroKit.onTheme(draw); window.addEventListener('resize', draw);
    sync();
  }
  return { init };
})();

/* ---------- Quiz ---------- */
function initQuiz() {
  Quiz.render('#quizBox', [
    { q: 'What does forward kinematics compute?', o: ['Joint angles from the hand position', 'The hand position from the joint angles', 'The forces in the joints'], a: 1, e: 'Forward: angles in, hand position out. The other direction is inverse kinematics.' },
    { q: 'Does the elbow angle θ₂ in this lesson measure the forearm against the table?', o: ['Yes', 'No, against the first link', 'No, against the target'], a: 1, e: 'Each joint angle is measured relative to the previous link, so the forearm points along θ₁ + θ₂.' },
    { q: 'How far can a 0.5 m + 0.4 m arm reach?', o: ['0.4 m', '0.5 m', '0.9 m'], a: 2, e: 'Fully stretched, the links line up: 0.5 + 0.4 = 0.9 m.' },
    { q: 'Can that arm touch a point 5 cm from its base?', o: ['Yes, by folding', 'No, the closest it gets is 0.1 m', 'Only with a third joint'], a: 1, e: 'Folded back, the hand is |0.5 − 0.4| = 0.1 m from the base. Anything closer is outside the workspace.' },
    { q: 'What is the workspace of a two-link planar arm?', o: ['A ring around the base', 'A square', 'A single circle line'], a: 0, e: 'Between the folded and the stretched radius every distance is possible, in every direction: a ring.' },
    { q: 'If both links are equally long, the workspace is…', o: ['a ring with a hole', 'a full disc', 'empty'], a: 1, e: 'The inner radius |L₁ − L₂| is zero, so the hand can reach the base itself.' },
    { q: 'How many joint angles fix the pose of this arm?', o: ['One', 'Two', 'Four'], a: 1, e: 'One per joint: θ₁ and θ₂.' },
    { q: 'Can two different poses put the hand on the same point?', o: ['Never', 'Yes, elbow up and elbow down', 'Only at the base'], a: 1, e: 'Inside the ring there are two solutions, mirrored across the line from the base to the hand. Part 4 is all about this.' },
  ], '#quizScore');
}

(function boot() {
  const safe = (name, fn) => { try { return fn(); } catch (e) { console.error('[lesson] error in', name, e); } };
  const start = () => {
    safe('theme', initTheme); safe('nav', initNav);
    const arm = safe('arm', Arm.init); safe('reach', Reach.init); safe('quiz', initQuiz);
    window.__sample = arm; window.__lessonReady = true;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
