/* =====================================================================
   ui-m3.js — scenes, missions and quiz of lesson M.3, matrices as transformations.
   Uses ui-core.js ($, setRangeFill, initTheme, initNav), kit.js (HeroKit), vec.js (Vec), plane.js
   (drawing helpers, F), missions.js (Missions) and quiz.js (Quiz).
   Matrices are arrays of rows. Column 1 (the image of x̂) is --classic, column 2 (ŷ) is --e2e,
   in every scene and readout.
   window.__m3 is a test hook for tools/lesson_m3.js only.
   ===================================================================== */
'use strict';
const W = 420;

/* ---------- Lab 1: columns move the grid ---------- */
const Grid = (() => {
  const V = view(W / 2, W / 2, 52.5), v = [1, 1], N = 9; // 4 units each way from the centre
  const st = { c1: [1, 0], c2: [0, 1], locked: false, hideV: false };
  let ctl = null, kb = null;
  const A = () => fromCols(st.c1, st.c2);
  const Av = () => Vec.mv(A(), v);
  const flat = () => Math.abs(st.c1[0] * st.c2[1] - st.c1[1] * st.c2[0]) < 1e-9;
  function draw() {
    const cv = $('#gridCv'), { c, k } = HeroKit.fit(cv, W, W), P = pal(), M = A(), act = kb && kb.active;
    c.fillStyle = P.bg; c.fillRect(0, 0, W, W); HeroKit.grid(c, W, W, V.u, P.grid); axes(c, P, V, 0, W, 0, W);
    // the image of the unit square, then the moved grid
    const q = [[0, 0], [1, 0], [1, 1], [0, 1]].map((p) => V.px(Vec.mv(M, p)));
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fillStyle = P.soft; c.fill();
    for (let i = -N; i <= N; i++) {
      line(c, V, Vec.mv(M, [i, -N]), Vec.mv(M, [i, N]), P.line2, i ? 1 : 2);
      line(c, V, Vec.mv(M, [-N, i]), Vec.mv(M, [N, i]), P.line2, i ? 1 : 2);
    }
    arrow(c, V, [0, 0], v, P.ink3, 2, true);
    if (!st.hideV) { arrow(c, V, [0, 0], Av(), P.ink, 2.5); label(c, k, V, 'Av', Av(), P.ink, 14, -10); }
    label(c, k, V, 'v', v, P.ink3, 10, 12);
    arrow(c, V, [0, 0], st.c1, P.c1, 4); arrow(c, V, [0, 0], st.c2, P.c2, 4);
    label(c, k, V, '1. sütun', st.c1, P.c1, 0, 18); label(c, k, V, '2. sütun', st.c2, P.c2, 0, -16);
    if (!st.locked) { knob(c, V, P, st.c1, act === 'c1'); knob(c, V, P, st.c2, act === 'c2'); }
    const z = !Vec.len(st.c1) && !Vec.len(st.c2);
    setOut($('#gridOut'), `A = ${mat(M)} · x̂ → <b class="c1">${fv(st.c1)}</b> · ŷ → <b class="c2">${fv(st.c2)}</b> · v = (1, 1) → Av = <b>${st.hideV ? '?' : fv(Av())}</b>` +
      (flat() ? ` · <b>${z ? 'Düzlem tek bir noktaya ezildi.' : 'Sütunlar aynı doğru üzerinde: düzlem bir doğruya ezildi.'}</b>` : ''));
  }
  function set(n, p) { if (st.locked) return; st[n] = p.map((x) => Math.max(-3.5, Math.min(3.5, Math.round(x * 2) / 2))); draw(); if (ctl) ctl.update(); }
  function setCols(a, b) { st.c1 = a; st.c2 = b; draw(); if (ctl) ctl.update(); }
  const api = {
    reset() { st.locked = false; st.hideV = false; setCols([1, 0], [0, 1]); },
    state: () => ({ c1: st.c1.slice(), c2: st.c2.slice(), Av: Av(), flat: flat() }),
    async run() { st.hideV = false; st.locked = false; draw(); return api.state(); },
  };
  const missions = [
    { short: 'İki kat', title: 'Her şeyi iki katına çıkar', text: 'Sütunların uçlarını sürükle: her vektörü iki kat uzatan matrisi kur. Örnek vektör v = (1, 1) de (2, 2)\'ye gitmeli.',
      onEnter: () => { st.locked = false; st.hideV = false; setCols([1, 0], [0, 1]); },
      criteria: [{ label: 'x̂ → (2, 0)', test: (r, s) => Vec.near(s.c1, [2, 0], 1e-9) }, { label: 'ŷ → (0, 2)', test: (r, s) => Vec.near(s.c2, [0, 2], 1e-9) }],
      hint: 'x̂ şimdi (1, 0)\'da. İki katı nerede?',
      explain: (s) => `Matris ${mat(fromCols(s.c1, s.c2))}. Her sütun bir birim vektörün gittiği yer: x̂ iki kat uzadı, ŷ de. Her vektör x x̂ + y ŷ olduğu için hepsi iki kat uzar: v = (1, 1) → ${fv(s.Av)}.` },
    { short: 'Tahmin', title: 'Eğik ızgara', text: 'Sütunlar şimdi (1, 0) ve (1, 1). Izgaranın kareleri sağa yattı. v = (1, 1) nereye gidecek?',
      onEnter: () => { st.hideV = true; st.locked = false; setCols([1, 0], [1, 1]); st.locked = true; draw(); },
      bet: { q: 'Av hangi noktadadır?', options: ['(1, 1)', '(2, 1)', '(1, 2)'], answer: () => 1 },
      action: { label: 'Dönüşümü uygula', run: () => api.run() },
      criteria: [{ label: 'Dönüşümü uyguladın', test: (r) => r != null }],
      explain: (r) => `1 · (1, 0) + 1 · (1, 1) = ${fv(r.Av)}. Kareler yana yattı ama boyları değişmedi: ŷ'nin ucu hâlâ 1 yüksekte. Bu dönüşüme kayma (shear) denir. Artık sütunları yeniden sürükleyebilirsin.` },
    { short: '90°', title: 'Düzlemi 90° döndür', text: 'Sütunları öyle yerleştir ki bütün ızgara saat yönünün tersine 90° dönsün.',
      onEnter: () => { st.locked = false; st.hideV = false; setCols([1, 0], [0, 1]); },
      criteria: [{ label: 'x̂ → (0, 1)', test: (r, s) => Vec.near(s.c1, [0, 1], 1e-9) }, { label: 'ŷ → (−1, 0)', test: (r, s) => Vec.near(s.c2, [-1, 0], 1e-9) }],
      hint: 'x̂ sağı gösteriyor; 90° dönünce yukarıyı göstermeli. ŷ yukarıyı gösteriyor; dönünce sola bakmalı.',
      explain: (s) => `Matris ${mat(fromCols(s.c1, s.c2))}. 3. bölümde bunun R(90°) olduğunu göreceksin: dönme matrisinin sütunları birim çemberin üzerindedir.` },
    { short: 'Serbest', title: 'Serbest oyun', text: 'Sütunları istediğin yere götür. İkisini aynı doğruya koyarsan ne olduğuna bak.', final: true, onEnter: () => { st.locked = false; st.hideV = false; draw(); } },
  ];
  function init() {
    const cv = $('#gridCv');
    HeroKit.drag(cv, W, W, {
      hit(p) { if (st.locked) return null; for (const n of ['c1', 'c2']) { const [x, y] = V.px(st[n]); if (Math.hypot(p.x - x, p.y - y) < 22) return n; } return null; },
      move(n, p) { set(n, V.un(p)); },
    });
    kb = HeroKit.keys(cv, {
      get handles() { return st.locked ? [] : ['c1', 'c2']; },
      move: (n, dx, dy) => set(n, Vec.add(st[n], [Math.sign(dx) * 0.5, Math.sign(dy) * 0.5])),
      describe: (n) => `${n === 'c1' ? '1. sütun, x̂' : '2. sütun, ŷ'}: ${fv(st[n])}`, redraw: draw,
    });
    HeroKit.onTheme(draw); window.addEventListener('resize', draw);
    ctl = Missions.mount('#gridMis', missions, api);
    draw();
    return { ctl, set, setCols, state: api.state };
  }
  return { init };
})();

/* ---------- Small interactive: the rotation matrix ---------- */
const Rotation = (() => {
  const V = view(W / 2, W / 2, 84), L = 2;
  let th = 30, kb = null;
  function draw() {
    const cv = $('#rotCv'), { c, k } = HeroKit.fit(cv, W, W), P = pal(), M = R(th), tip = Vec.mv(M, [L, 0]);
    c.fillStyle = P.bg; c.fillRect(0, 0, W, W); HeroKit.grid(c, W, W, V.u / 2, P.grid); axes(c, P, V, 0, W, 0, W);
    c.strokeStyle = P.line2; c.lineWidth = 1.2; c.setLineDash([4, 4]); c.beginPath(); c.arc(V.ox, V.oy, V.u, 0, 7); c.stroke(); c.beginPath(); c.arc(V.ox, V.oy, L * V.u, 0, 7); c.stroke(); c.setLineDash([]);
    line(c, V, [0, 0], [L, 0], P.ink3, 2, true);
    arc(c, V, 34, 0, th * D2R, P.arc, 2.5); label(c, k, V, 'θ', [0, 0], P.arc, 48 * Math.cos(th * D2R / 2), -48 * Math.sin(th * D2R / 2));
    line(c, V, [0, 0], tip, P.ink, 8);
    arrow(c, V, [0, 0], col(M, 0), P.c1, 3.5); arrow(c, V, [0, 0], col(M, 1), P.c2, 3.5);
    c.beginPath(); c.arc(...V.px([0, 0]), 7, 0, 7); c.fillStyle = P.ink; c.fill();
    knob(c, V, P, tip, kb && kb.active === 'th');
    setOut($('#rotOut'), `θ = <b>${Math.round(th)}°</b> · R(θ) = ${mat(M)} · R(θ) · (2, 0) = <b>${fv(tip)}</b> = (2 cos θ, 2 sin θ)`);
  }
  function set(d) { th = wrap(Math.round(d)); slider('#rotIn', th, `${th}°`); draw(); }
  function init() {
    const cv = $('#rotCv');
    $('#rotIn').addEventListener('input', (e) => set(+e.target.value));
    HeroKit.drag(cv, W, W, {
      hit(p) { const [x, y] = V.px(Vec.mv(R(th), [L, 0])); return Math.hypot(p.x - x, p.y - y) < 24 ? 'th' : null; },
      move(n, p) { set(Vec.angle(V.un(p)) / D2R); },
    });
    kb = HeroKit.keys(cv, { handles: ['th'], move: (n, dx, dy) => set(th + (dx + dy) * 10), describe: () => `θ = ${Math.round(th)}°, uç ${fv(Vec.mv(R(th), [L, 0]))}`, redraw: draw });
    HeroKit.onTheme(draw); window.addEventListener('resize', draw);
    set(30);
    return { set, read: () => $('#rotOut').textContent };
  }
  return { init };
})();

/* ---------- Lab 2: order matters ---------- */
const Order = (() => {
  const H = 240, PW = W / 2, u = 35; // origins on grid lines: 105 = 3u, 140 = 4u
  const VL = view(PW / 2, 140, u), VR = view(PW + PW / 2, 140, u);
  const st = { al: 90, sx: 2, sy: 1, bRot: false, hide: false };
  let ctl = null, busy = false;
  const A = () => R(st.al);
  const B = () => (st.bRot ? R(60) : S(st.sx, st.sy));
  const AB = () => Vec.mm(A(), B()), BA = () => Vec.mm(B(), A());
  function panel(c, k, P, V, M, title, x0) {
    c.save(); c.beginPath(); c.rect(x0, 0, PW, H); c.clip();
    HeroKit.grid(c, W, H, u, P.grid); axes(c, P, V, x0, x0 + PW, 0, H);
    F.forEach(([a, b]) => line(c, V, a, b, P.ink3, 3, true));
    if (!st.hide) { F.forEach(([a, b]) => line(c, V, Vec.mv(M, a), Vec.mv(M, b), P.ink, 4)); arrow(c, V, [0, 0], Vec.mv(M, [1, 0]), P.c1, 3); }
    c.restore();
    HeroKit.label(c, k, title, x0 + PW / 2, 16, { color: P.ink, px: 13 });
  }
  function draw() {
    const cv = $('#orderCv'), { c, k } = HeroKit.fit(cv, W, H), P = pal();
    c.fillStyle = P.bg; c.fillRect(0, 0, W, H);
    panel(c, k, P, VL, AB(), 'AB: önce B, sonra A', 0); panel(c, k, P, VR, BA(), 'BA: önce A, sonra B', PW);
    c.strokeStyle = P.line2; c.lineWidth = 1.5; c.beginPath(); c.moveTo(PW + 0.5, 0); c.lineTo(PW + 0.5, H); c.stroke();
    const bName = st.bRot ? 'R(60°)' : `S(${t(st.sx)}, ${t(st.sy)})`, eq = same(AB(), BA());
    setOut($('#orderOut'), `A = R(${st.al}°) · B = ${bName}<br>AB = ${st.hide ? '?' : mat(AB())} · BA = ${st.hide ? '?' : mat(BA())}${st.hide ? '' : ` · <b>${eq ? 'AB = BA' : 'AB ≠ BA'}</b>`}<br>` +
      `AB · (1, 0) = <b>${st.hide ? '?' : fv(Vec.mv(AB(), [1, 0]))}</b> · BA · (1, 0) = <b>${st.hide ? '?' : fv(Vec.mv(BA(), [1, 0]))}</b>`);
  }
  function sync() {
    slider('#alIn', st.al, `${st.al}°`); slider('#sxIn', st.sx, t(st.sx)); slider('#syIn', st.sy, t(st.sy));
    $('#bScale').setAttribute('aria-pressed', String(!st.bRot)); $('#bRot').setAttribute('aria-pressed', String(st.bRot));
    $('#sxIn').disabled = $('#syIn').disabled = st.bRot;
    draw(); if (ctl) ctl.update();
  }
  function set(o) { Object.assign(st, o); st.al = wrap(Math.round(st.al)); sync(); }
  const api = {
    reset() { set({ al: 90, sx: 2, sy: 1, bRot: false, hide: false }); },
    state: () => ({ al: st.al, sx: st.sx, sy: st.sy, bRot: st.bRot, AB: AB(), BA: BA(), same: same(AB(), BA()) }),
    async run() { busy = true; st.hide = false; draw(); busy = false; return api.state(); },
  };
  const missions = [
    { short: 'Tahmin', title: 'Döndür ve esnet', text: 'A = R(90°) düzlemi 90° döndürür. B = S(2, 1) yatayda 2 kat esnetir, dikeyde bir şey yapmaz. (1, 0) vektörü iki sırada da aynı yere mi gider?',
      onEnter: () => set({ al: 90, sx: 2, sy: 1, bRot: false, hide: true }),
      bet: { q: 'AB · (1, 0) ile BA · (1, 0) aynı nokta mı?', options: ['Aynı', 'Farklı'], answer: () => 1 },
      action: { label: 'İki sırayı uygula', run: () => api.run() },
      criteria: [{ label: 'İki sırayı uyguladın', test: (r) => r != null }],
      explain: () => 'AB: önce esnet, (1, 0) → (2, 0); sonra döndür: (0, 2). BA: önce döndür, (1, 0) → (0, 1); sonra yatayda esnet, ama x zaten 0: (0, 1). Sıra değişince sonuç değişti.' },
    { short: 'Eşitle', title: 'Sırayı önemsizleştir', text: 'A = R(90°) sabit. B\'nin x ve y oranlarını öyle seç ki AB = BA olsun.', controls: ['sx', 'sy'],
      onEnter: () => set({ al: 90, sx: 2, sy: 1, bRot: false, hide: false }),
      criteria: [{ label: 'AB = BA', test: (r, s) => s.same }],
      hint: 'Döndürmeden önce ya da sonra esnetmenin fark etmemesi için esnetme her yönde aynı olmalı.',
      explain: (s) => `x ve y oranı ${t(s.sx)}: esnetme her yönü aynı oranda büyütüyor, bu yüzden dönmeden önce ya da sonra yapılması fark etmiyor. AB = BA = ${mat(s.AB)}.` },
    { short: 'İki dönme', title: 'İki dönme art arda', text: 'Şimdi B de bir dönme: B = R(60°). A = R(α) için α\'yı öyle seç ki AB = R(90°) olsun.', controls: ['al'],
      onEnter: () => set({ al: 0, bRot: true, hide: false }),
      criteria: [{ label: 'AB = R(90°)', test: (r, s) => s.bRot && Math.abs(s.al - 30) <= 1 }],
      hint: 'Önce 60°, sonra α kadar dönersen toplam ne kadar dönmüş olursun?',
      explain: (s) => `R(${s.al}°) · R(60°) = R(90°) = ${mat(s.AB)}: art arda iki dönme açıları toplar. M.2'deki iki uzuvlu kolda ikinci uzvun θ₁ + θ₂ yönünde durması da bu yüzden. Dönmeler kendi aralarında sırayı umursamaz: sağ sahnede BA de aynı.` },
    { short: 'Serbest', title: 'Serbest oyun', text: 'A\'yı ve B\'yi istediğin gibi değiştir. B\'yi esnetme ile dönme arasında değiştirip AB ile BA\'yı karşılaştır.', final: true,
      onEnter: () => set({ hide: false }) },
  ];
  function init() {
    $('#alIn').addEventListener('input', (e) => { if (!busy) set({ al: +e.target.value }); });
    $('#sxIn').addEventListener('input', (e) => set({ sx: +e.target.value }));
    $('#syIn').addEventListener('input', (e) => set({ sy: +e.target.value }));
    $('#bScale').addEventListener('click', () => set({ bRot: false }));
    $('#bRot').addEventListener('click', () => set({ bRot: true }));
    HeroKit.onTheme(draw); window.addEventListener('resize', draw);
    ctl = Missions.mount('#orderMis', missions, api, { controls: { al: '#alRow', sx: '#sxRow', sy: '#syRow', bk: '#bKind' } });
    sync();
    return { ctl, set, state: api.state };
  }
  return { init };
})();

/* ---------- Quiz ---------- */
const QUIZ = [
  { q: 'Sütunları (1, 0) ve (0, 1) olan matris bir vektöre ne yapar?', o: ['Hiçbir şey', 'İki katına çıkarır', 'Sıfıra götürür'], a: 0, e: 'Birim matris: x̂ ve ŷ yerinde kalır, bu yüzden her vektör de yerinde kalır.' },
  { q: 'Sütunları (2, 0) ve (0, 3) olan matris (1, 1)\'i nereye götürür?', o: ['(2, 3)', '(3, 2)', '(5, 0)'], a: 0, e: '1 · (2, 0) + 1 · (0, 3) = (2, 3).' },
  { q: 'Bir matrisin birinci sütunu neyi gösterir?', o: ['x̂ vektörünün gittiği yeri', 'Sonucun x bileşenini', 'Matrisin büyüklüğünü'], a: 0, e: 'A · (1, 0) birinci sütundur. Sonucun x bileşeni ise birinci satırdan gelir.' },
  { q: 'AB yazınca hangi dönüşüm önce uygulanır?', o: ['A', 'B', 'Fark etmez'], a: 1, e: '(AB)v = A(Bv): vektöre en yakın duran B önce uygulanır.' },
  { q: 'R(90°) · (1, 0) nedir?', o: ['(0, 1)', '(1, 0)', '(0, −1)'], a: 0, e: 'R(90°)\'nin birinci sütunu (cos 90°, sin 90°) = (0, 1).' },
  { q: 'Her A ve B matrisi için AB = BA midir?', o: ['Evet, her zaman', 'Hayır, çoğu zaman değildir', 'Yalnızca 2×2 matrislerde'], a: 1, e: 'R(90°) ile S(2, 1) iki sırada farklı sonuç verir. Bazı çiftlerde eşitlik olur (iki dönme, ya da dönme ile her yönde aynı esnetme), ama bu bir kural değildir.' },
  { q: 'R(30°) · R(45°) hangi matristir?', o: ['R(75°)', 'R(15°)', 'R(1350°)'], a: 0, e: 'Art arda iki dönme açıları toplar: 30° + 45° = 75°. Açılar çarpılmaz.' },
  { q: 'z ekseni etrafında dönme (2, 0, 3) noktasının hangi bileşenini hiç değiştirmez?', o: ['x', 'y', 'z'], a: 2, e: 'R_z\'nin üçüncü satırı (0, 0, 1): yükseklik aynı kalır. 90° dönmede (2, 0, 3) → (0, 2, 3).' },
];
function initQuiz() { Quiz.render('#quizBox', QUIZ, '#quizScore'); }

(function boot() {
  const safe = (name, fn) => { try { return fn(); } catch (e) { console.error('[lesson] error in', name, e); } };
  const start = () => {
    safe('theme', initTheme); safe('nav', initNav);
    const grid = safe('grid', Grid.init), rotation = safe('rotation', Rotation.init), order = safe('order', Order.init);
    safe('quiz', initQuiz);
    window.__m3 = { grid, rotation, order, quiz: QUIZ }; window.__lessonReady = true;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
