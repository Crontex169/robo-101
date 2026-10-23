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
    setOut($('#armOut'), `El: x = <b>${fmt(x)} m</b>, y = <b>${fmt(y)} m</b> · hedefe uzaklık <b>${fmt(dist() * 100, 0)} cm</b>`);
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
    { short: 'Hedef', title: 'Hedefe dokun', text: 'Eklemleri, el yeşil hedefin 3 cm yakınına gelene kadar döndür. Dirseği ya da eli sürükle, veya kaydırıcıları kullan.',
      criteria: [{ label: 'El hedefin 3 cm yakınında', test: (r, s) => s.dist < 0.03 }],
      hint: 'Hedef tabanın sol yukarısında. Önce omzu 90°\'nin ötesine savur, sonra dirseği geri bük.',
      explain: (s) => `Eklem açıları θ₁ = ${fmt(s.q[0], 0)}°, θ₂ = ${fmt(s.q[1], 0)}°. İki sayı bütün duruşu belirledi, elin konumu da onlardan çıktı: ileri kinematik bu.` },
    { short: 'Tahmin', title: 'Önce tahmin, sonra kontrol', text: 'Kol şimdi masa boyunca uzanmış, dirsek biraz bükülü. Dirseği 20° daha bükmek üzeresin.',
      onEnter: () => setAngles(0, 30),
      bet: { q: 'El nereye gidecek?', options: ['Yukarı', 'Aşağı', 'Hiçbir yere'], answer: (r) => (r.dy > 0 ? 0 : 1) },
      action: { label: 'Dirseği +20° bük', run: () => api.bend(20) },
      criteria: [{ label: 'Dirseği büktün ve eli izledin', test: (r) => r != null }],
      explain: (r) => `El ${fmt(r.dy * 100, 0)} cm yukarı çıktı. Pozitif bir açı ön kolu dirsek etrafında saat yönünün tersine döndürür; bu duruşta bu, eli kaldırır.` },
    { short: 'Serbest', title: 'Serbest oyun', text: 'Kolu istediğin gibi hareket ettir. Eli aynı noktaya koyan iki farklı duruş bulabilir misin?', final: true },
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
    HeroKit.keys(cv, { // keyboard twin of the drag: the elbow handle turns the shoulder, the hand handle turns the elbow, 5° per key (1° with Shift)
      handles: ['elbow', 'hand'],
      move(n, dx, dy) { if (animating) return; const d = (dx + dy) * 10, q = st.q.map(deg); if (n === 'elbow') setAngles(q[0] + d, q[1]); else setAngles(q[0], q[1] + d); },
      describe: (n) => (n === 'elbow' ? `Omuz θ₁ = ${Math.round(deg(st.q[0]))}°` : `Dirsek θ₂ = ${Math.round(deg(st.q[1]))}°`),
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
    setOut($('#reachOut'), `El, tabandan <b>${fmt(r.inner)} m</b> ile <b>${fmt(r.outer)} m</b> arasına ulaşıyor.${r.inner === 0 ? ' Uzuvlar eşit: halka dolu bir disk.' : ''}`);
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
    { q: 'İleri kinematik neyi hesaplar?', o: ['El konumundan eklem açılarını', 'Eklem açılarından el konumunu', 'Eklemlerdeki kuvvetleri'], a: 1, e: 'İleri: açılar girer, el konumu çıkar. Öbür yön ters kinematik.' },
    { q: 'Bu dersteki dirsek açısı θ₂, ön kolu masaya göre mi ölçer?', o: ['Evet', 'Hayır, birinci uzva göre', 'Hayır, hedefe göre'], a: 1, e: 'Her eklem açısı bir önceki uzva göre ölçülür; bu yüzden ön kol θ₁ + θ₂ yönünde uzanır.' },
    { q: '0.5 m + 0.4 m\'lik bir kol ne kadar uzağa ulaşabilir?', o: ['0.4 m', '0.5 m', '0.9 m'], a: 2, e: 'Tamamen gerildiğinde uzuvlar aynı doğrultuya gelir: 0.5 + 0.4 = 0.9 m.' },
    { q: 'Bu kol tabanından 5 cm uzaktaki bir noktaya dokunabilir mi?', o: ['Evet, katlanarak', 'Hayır, en yakın 0.1 m\'ye gelebilir', 'Ancak üçüncü bir eklemle'], a: 1, e: 'Geri katlandığında el tabandan |0.5 − 0.4| = 0.1 m uzaktadır. Daha yakını çalışma uzayının dışında.' },
    { q: 'İki uzuvlu düzlemsel bir kolun çalışma uzayı nedir?', o: ['Tabanın çevresinde bir halka', 'Bir kare', 'Tek bir çember çizgisi'], a: 0, e: 'Katlanmış ve gerilmiş yarıçap arasındaki her uzaklık, her yönde mümkün: bir halka.' },
    { q: 'İki uzuv eşit uzunluktaysa çalışma uzayı…', o: ['delikli bir halkadır', 'dolu bir disktir', 'boştur'], a: 1, e: 'İç yarıçap |L₁ − L₂| sıfır olur; el tabanın kendisine ulaşabilir.' },
    { q: 'Bu kolun duruşunu kaç eklem açısı belirler?', o: ['Bir', 'İki', 'Dört'], a: 1, e: 'Eklem başına bir: θ₁ ve θ₂.' },
    { q: 'İki farklı duruş eli aynı noktaya koyabilir mi?', o: ['Asla', 'Evet, dirsek yukarı ve dirsek aşağı', 'Sadece tabanda'], a: 1, e: 'Halkanın içinde, tabandan ele giden doğruya göre birbirinin aynası olan iki çözüm var. 4. bölüm tamamen bununla ilgili.' },
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
