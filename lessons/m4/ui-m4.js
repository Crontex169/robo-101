/* =====================================================================
   ui-m4.js — scenes, missions and quiz of lesson M.4, special matrices.
   Uses ui-core.js ($, setRangeFill, initTheme, initNav), kit.js (HeroKit), vec.js (Vec), plane.js
   (drawing helpers, F), missions.js (Missions) and quiz.js (Quiz).
   Column 1 is --classic, column 2 is --e2e, as in M.3. A flipped square (det < 0) is --serious.
   window.__m4 is a test hook for tools/lesson_m4.js only.
   ===================================================================== */
'use strict';
const W = 420;
const I2 = [[1, 0], [0, 1]];
const nearI = (M, tol) => M.every((row, i) => row.every((x, j) => Math.abs(x - I2[i][j]) <= tol));
const square = (c, V, M, fill) => {
  const q = [[0, 0], [1, 0], [1, 1], [0, 1]].map((p) => V.px(Vec.mv(M, p)));
  c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fillStyle = fill; c.fill();
};

/* ---------- Small interactive: the dot product ---------- */
const Dot = (() => {
  const H = 300, V = view(170, 150, 80), a = [2, 0];
  let ph = 30, kb = null;
  const b = () => Vec.polar(1, ph * D2R);
  function draw() {
    const cv = $('#dotCv'), { c, k } = HeroKit.fit(cv, W, H), P = pal(), bb = b(), d = Vec.dot(a, bb);
    c.fillStyle = P.bg; c.fillRect(0, 0, W, H); HeroKit.grid(c, W, H, V.u / 2, P.grid); axes(c, P, V, 0, W, 0, H);
    c.strokeStyle = P.line2; c.lineWidth = 1.2; c.setLineDash([4, 4]); c.beginPath(); c.arc(V.ox, V.oy, V.u, 0, 7); c.stroke(); c.setLineDash([]);
    // b's shadow on a's line
    line(c, V, bb, [bb[0], 0], P.ink3, 1.5, true);
    line(c, V, [0, 0], [bb[0], 0], P.ink, 5);
    arc(c, V, 30, 0, ph * D2R, P.arc, 2.5); label(c, k, V, 'φ', [0, 0], P.arc, 44 * Math.cos(ph * D2R / 2), -44 * Math.sin(ph * D2R / 2));
    arrow(c, V, [0, 0], a, P.c1, 4); arrow(c, V, [0, 0], bb, P.c2, 4);
    label(c, k, V, 'a', a, P.c1, 0, 16); label(c, k, V, 'b', bb, P.c2, 12 * Math.cos(ph * D2R), -12 * Math.sin(ph * D2R) - 4);
    knob(c, V, P, bb, kb && kb.active === 'b');
    setOut($('#dotOut'), `φ = <b>${t(ph)}°</b> · a = <b class="c1">(2, 0)</b> · b = <b class="c2">${fv(bb)}</b><br>a · b = 2 · ${t(bb[0])} + 0 · ${t(bb[1])} = <b>${t(d)}</b>` +
      (Math.abs(d) < 1e-9 ? ' · <b>a ile b dik</b>' : ''));
  }
  function set(d) { ph = wrap(Math.round(d)); slider("#dotIn", ph, `${t(ph)}°`); draw(); }
  function init() {
    const cv = $('#dotCv');
    $('#dotIn').addEventListener('input', (e) => set(+e.target.value));
    HeroKit.drag(cv, W, H, {
      hit(p) { const [x, y] = V.px(b()); return Math.hypot(p.x - x, p.y - y) < 24 ? 'b' : null; },
      move(n, p) { set(Vec.angle(V.un(p)) / D2R); },
    });
    kb = HeroKit.keys(cv, { handles: ['b'], move: (n, dx, dy) => set(ph + (dx + dy) * 10), describe: () => `φ = ${t(ph)}°, a · b = ${t(Vec.dot(a, b()))}`, redraw: draw });
    HeroKit.onTheme(draw); window.addEventListener('resize', draw);
    set(30);
    return { set, read: () => $('#dotOut').textContent };
  }
  return { init };
})();

/* ---------- Lab 1: transpose and orthogonal matrices ---------- */
const Ortho = (() => {
  const V = view(W / 2, W / 2, 84);
  const st = { al: 0, c2: [1, 1], locked: false, hide: false };
  let ctl = null, kb = null;
  const c1 = () => Vec.polar(1, st.al * D2R);
  const A = () => fromCols(c1(), st.c2);
  const AtA = () => Vec.mm(Vec.tr(A()), A());
  // column 2 snaps to the two unit vectors at ±90° from column 1, then onto the unit circle, then to 0.1
  function snap(p) {
    for (const s of [1, -1]) { const q = Vec.mv(R(90 * s), c1()); if (Vec.len(Vec.sub(p, q)) < 0.1) return q; }
    const l = Vec.len(p);
    if (Math.abs(l - 1) < 0.1) return Vec.scale(p, 1 / l);
    return p.map((x) => Math.max(-2.4, Math.min(2.4, Math.round(x * 10) / 10)));
  }
  function draw() {
    const cv = $('#orthoCv'), { c, k } = HeroKit.fit(cv, W, W), P = pal(), M = A(), act = kb && kb.active;
    c.fillStyle = P.bg; c.fillRect(0, 0, W, W); HeroKit.grid(c, W, W, V.u / 2, P.grid); axes(c, P, V, 0, W, 0, W);
    c.strokeStyle = P.line2; c.lineWidth = 1.2; c.setLineDash([4, 4]); c.beginPath(); c.arc(V.ox, V.oy, V.u, 0, 7); c.stroke(); c.setLineDash([]);
    square(c, V, M, Vec.det2(M) < 0 ? css('--serious-soft') : P.soft);
    arrow(c, V, [0, 0], c1(), P.c1, 4); arrow(c, V, [0, 0], st.c2, P.c2, 4);
    label(c, k, V, '1. sütun', c1(), P.c1, 0, 18); label(c, k, V, '2. sütun', st.c2, P.c2, 0, -16);
    if (!st.locked) knob(c, V, P, st.c2, act === 'c2');
    const G = AtA(), q = st.hide ? '?' : null, d = (x, y) => q || t(Vec.dot(x, y));
    setOut($('#orthoOut'), `A = ${mat(M)} · c₁ · c₁ = <b>${d(c1(), c1())}</b> · c₁ · c₂ = <b>${d(c1(), st.c2)}</b> · c₂ · c₂ = <b>${d(st.c2, st.c2)}</b><br>AᵀA = ${q || mat(G, true)}` +
      (!st.hide && nearI(G, 0.05) ? ' · <b>AᵀA = I: A dik bir matris</b>' : ''));
  }
  function setC2(p) { if (st.locked) return; st.c2 = snap(p); draw(); if (ctl) ctl.update(); }
  function set(o) { Object.assign(st, o); st.al = wrap(Math.round(st.al)); slider("#orthoIn", st.al, `${t(st.al)}°`); draw(); if (ctl) ctl.update(); }
  const api = {
    reset() { set({ al: 0, c2: [1, 1], locked: false, hide: false }); },
    state: () => ({ al: st.al, c1: c1(), c2: st.c2.slice(), AtA: AtA(), orth: nearI(AtA(), 0.05), side: Math.sign(Vec.det2(A())) }),
    async run() { st.hide = false; draw(); return api.state(); },
  };
  const isRot = (s) => s.side > 0;
  const missions = [
    { short: 'AᵀA = I', title: 'AᵀA\'yı birim matris yap', text: 'Birinci sütun (1, 0). İkinci sütunun ucunu öyle bir yere götür ki AᵀA = I olsun. İki cevap var; birini bul.',
      onEnter: () => set({ al: 0, c2: [1, 1], locked: false, hide: false }),
      criteria: [{ label: 'c₂ · c₂ = 1', test: (r, s) => Math.abs(s.AtA[1][1] - 1) <= 0.05 }, { label: 'c₁ · c₂ = 0', test: (r, s) => Math.abs(s.AtA[0][1]) <= 0.05 }],
      hint: 'İkinci sütunun uzunluğu 1 olmalı ve birinci sütuna dik durmalı. Birinci sütun sağı gösteriyor.',
      explain: (s) => `İkinci sütun ${fv(s.c2)}: uzunluğu 1 ve birinci sütuna dik, yani AᵀA = I. ${isRot(s) ? 'Bu, birim matrisin kendisi: R(0°).' : 'Bu matris ızgarayı x ekseninde aynalıyor.'} Şimdi öbür cevabı bul.` },
    { short: 'Öbürü', title: 'Öbür cevap', text: 'AᵀA = I yapan ikinci bir yer daha var. Onu bul.',
      onEnter: (a, ctx) => set({ al: 0, c2: [1, 1], locked: false, hide: false }),
      criteria: [{ label: 'AᵀA = I', test: (r, s) => s.orth }, { label: 'İlk cevaptan farklı', test: (r, s, ctx) => ctx.results[0] && s.side === -ctx.results[0].side }],
      hint: 'İlk cevabın birinci sütunun bir tarafındaydı. Dik olan iki yön var.',
      explain: () => 'İki cevap da dik matris. İkinci sütun birinci sütunun 90° ilerisindeyse (saat yönünün tersine) matris bir dönmedir; burada R(0°) = I. 90° gerisindeyse matris [[1, 0], [0, −1]] olur: ızgarayı aynalar, karenin rengi bu yüzden değişti. 4. bölümde ikisini tek bir sayıyla ayıracağız.' },
    { short: 'Tahmin', title: 'Bir dönme dik mi?', text: 'Sütunlar R(30°)\'nın sütunları: (cos 30°, sin 30°) ve (−sin 30°, cos 30°). AᵀA = I olur mu?',
      onEnter: () => { set({ al: 30, c2: Vec.mv(R(90), Vec.polar(1, 30 * D2R)), locked: false, hide: true }); st.locked = true; draw(); },
      bet: { q: 'R(30°)ᵀ R(30°) = I mi?', options: ['Evet', 'Hayır'], answer: () => 0 },
      action: { label: 'AᵀA\'yı hesapla', run: () => api.run() },
      criteria: [{ label: 'AᵀA\'yı hesapladın', test: (r) => r != null }],
      explain: (r) => `AᵀA = ${mat(r.AtA, true)}. İki sütunun uzunluğu 1 ve nokta çarpımları 0.87 · (−0.5) + 0.5 · 0.87 = 0. Her açıda böyle: her dönme matrisi dik bir matristir. Artık her şeyi yeniden değiştirebilirsin.` },
    { short: 'Serbest', title: 'Serbest oyun', text: 'Birinci sütunun açısını ve ikinci sütunu istediğin gibi değiştir. Her açıda AᵀA = I yapan iki yeri bul.', final: true,
      onEnter: () => { st.locked = false; set({ hide: false }); } },
  ];
  function init() {
    const cv = $('#orthoCv');
    $('#orthoIn').addEventListener('input', (e) => set({ al: +e.target.value }));
    HeroKit.drag(cv, W, W, {
      hit(p) { if (st.locked) return null; const [x, y] = V.px(st.c2); return Math.hypot(p.x - x, p.y - y) < 22 ? 'c2' : null; },
      move(n, p) { setC2(V.un(p)); },
    });
    kb = HeroKit.keys(cv, {
      get handles() { return st.locked ? [] : ['c2']; },
      move: (n, dx, dy) => setC2(Vec.add(st.c2, [Math.sign(dx) * 0.1, Math.sign(dy) * 0.1])),
      describe: () => `2. sütun: ${fv(st.c2)}`, redraw: draw,
    });
    HeroKit.onTheme(draw); window.addEventListener('resize', draw);
    ctl = Missions.mount('#orthoMis', missions, api, { controls: { al: '#orthoRow' } });
    draw();
    return { ctl, set, setC2, state: api.state };
  }
  return { init };
})();

/* ---------- Small interactive: undoing a rotation ---------- */
const Inverse = (() => {
  const H = 300, V = view(W / 2, 165, 80), R50 = R(50);
  let be = 0;
  const home = () => Math.abs(wrap(be + 50)) <= 1;
  function draw() {
    const cv = $('#invCv'), { c, k } = HeroKit.fit(cv, W, H), P = pal(), M = Vec.mm(R(be), R50);
    c.fillStyle = P.bg; c.fillRect(0, 0, W, H); HeroKit.grid(c, W, H, V.u / 2, P.grid); axes(c, P, V, 0, W, 0, H);
    F.forEach(([p, q]) => line(c, V, p, q, P.ink3, 3, true));
    F.forEach(([p, q]) => line(c, V, Vec.mv(R50, p), Vec.mv(R50, q), P.arc, 3, true));
    F.forEach(([p, q]) => line(c, V, Vec.mv(M, p), Vec.mv(M, q), P.ink, 5));
    HeroKit.label(c, k, 'kesikli gri: ev · kesikli mor: R(50°) sonrası · koyu: R(β) R(50°) sonrası', W / 2, H - 12, { color: P.ink3, px: 12 });
    setOut($('#invOut'), `β = <b>${t(be)}°</b> · R(50°)ᵀ = ${mat(Vec.tr(R50))} · R(β) = ${mat(R(be))}<br>R(β) R(50°) = ${mat(M)}` + (home() ? ' · <b>Şekil evine döndü.</b>' : ''));
  }
  function set(d) { be = wrap(Math.round(d)); slider("#invIn", be, `${t(be)}°`); draw(); }
  function init() {
    $('#invIn').addEventListener('input', (e) => set(+e.target.value));
    HeroKit.onTheme(draw); window.addEventListener('resize', draw);
    set(0);
    return { set, home, read: () => $('#invOut').textContent };
  }
  return { init };
})();

/* ---------- Lab 2: the determinant ---------- */
const Det = (() => {
  const V = view(W / 2, W / 2, 52.5), N = 9;
  const st = { c1: [1, 0], c2: [0, 1], locked: false, hide: false };
  let ctl = null, kb = null;
  const A = () => fromCols(st.c1, st.c2);
  const det = () => Vec.det2(A());
  function draw() {
    const cv = $('#detCv'), { c, k } = HeroKit.fit(cv, W, W), P = pal(), M = A(), act = kb && kb.active, d = det();
    c.fillStyle = P.bg; c.fillRect(0, 0, W, W); HeroKit.grid(c, W, W, V.u, P.grid); axes(c, P, V, 0, W, 0, W);
    for (let i = -N; i <= N; i++) {
      line(c, V, Vec.mv(M, [i, -N]), Vec.mv(M, [i, N]), P.line2, i ? 1 : 2);
      line(c, V, Vec.mv(M, [-N, i]), Vec.mv(M, [N, i]), P.line2, i ? 1 : 2);
    }
    if (!st.hide) square(c, V, M, d < 0 ? css('--serious-soft') : P.soft);
    arrow(c, V, [0, 0], st.c1, P.c1, 4); arrow(c, V, [0, 0], st.c2, P.c2, 4);
    label(c, k, V, '1. sütun', st.c1, P.c1, 0, 18); label(c, k, V, '2. sütun', st.c2, P.c2, 0, -16);
    if (!st.locked) { knob(c, V, P, st.c1, act === 'c1'); knob(c, V, P, st.c2, act === 'c2'); }
    const flat = Math.abs(d) < 1e-9, z = !Vec.len(st.c1) && !Vec.len(st.c2);
    setOut($('#detOut'), `A = ${mat(M)} · det A = <b>${st.hide ? '?' : t(d)}</b>` + (st.hide ? '' : ` · <b>${flat ? 'ters yok' : 'ters var'}</b>`) +
      (st.hide ? '' : flat ? ` · ${z ? 'Düzlem tek bir noktaya ezildi.' : 'Düzlem bir doğruya ezildi.'}` : d < 0 ? ' · Kare ters yüz oldu: yansıma.' : ''));
  }
  function set(n, p) { if (st.locked) return; st[n] = p.map((x) => Math.max(-3.5, Math.min(3.5, Math.round(x * 2) / 2))); draw(); if (ctl) ctl.update(); }
  function setCols(a, b) { st.c1 = a; st.c2 = b; draw(); if (ctl) ctl.update(); }
  const api = {
    reset() { st.locked = false; st.hide = false; setCols([1, 0], [0, 1]); },
    state: () => ({ c1: st.c1.slice(), c2: st.c2.slice(), det: det() }),
    async run() { st.hide = false; draw(); return api.state(); },
  };
  const open = () => { st.locked = false; st.hide = false; setCols([1, 0], [0, 1]); };
  const missions = [
    { short: 'Alan 3', title: 'Alanı 3 yap', text: 'Sütunların uçlarını sürükle: birim kareyi alanı 3 olan bir paralelkenara götür.', onEnter: open,
      criteria: [{ label: 'det A = 3', test: (r, s) => Math.abs(s.det - 3) < 1e-9 }],
      hint: 'En kolayı: x̂\'yi (3, 0)\'a götür, ŷ\'yi yerinde bırak. Ya da M.3\'ün matrisini kur: sütunlar (2, 1) ve (−1, 1).',
      explain: (s) => `A = ${mat(fromCols(s.c1, s.c2))}, det A = 3: birim kare, alanı 3 olan bir paralelkenara gitti. Matris her şekli aynı oranda büyütür; her karenin alanı 3 katına çıktı.` },
    { short: 'Tahmin', title: 'Eğik kare', text: 'Sütunlar (1, 0) ve (1, 1): M.3\'teki kayma. Kare sağa yatıyor. Alanı ne olur?',
      onEnter: () => { st.locked = false; st.hide = true; setCols([1, 0], [1, 1]); st.locked = true; draw(); },
      bet: { q: 'det A kaçtır?', options: ['0', '1', '2'], answer: () => 1 },
      action: { label: 'Alanı ölç', run: () => api.run() },
      criteria: [{ label: 'Alanı ölçtün', test: (r) => r != null }],
      explain: (r) => `det A = 1 · 1 − 1 · 0 = ${t(r.det)}. Kare yana yattı ama tabanı da yüksekliği de 1 kaldı: alan değişmedi. Artık sütunları yeniden sürükleyebilirsin.` },
    { short: 'Ez', title: 'Düzlemi ez', text: 'İki sütunu aynı doğru üzerine koy.', onEnter: open,
      criteria: [{ label: 'det A = 0', test: (r, s) => Math.abs(s.det) < 1e-9 }, { label: 'Sütunlardan biri sıfır değil', test: (r, s) => Vec.len(s.c1) > 0 || Vec.len(s.c2) > 0 }],
      hint: 'Birinci sütun (1, 0). İkinci sütunu da x ekseninin üzerine indir.',
      explain: () => 'det A = 0. Bütün düzlem bir doğruya ezildi: birçok nokta aynı yere düşüyor, bu yüzden bu dönüşümü geri alan bir matris yok. M.3\'ün açık sorusunun cevabı bu; 3. bölümdeki formülün paydası da tam bu sayı.' },
    { short: 'Aynala', title: 'Kareyi ters yüz et', text: 'det A eksi olsun.', onEnter: open,
      criteria: [{ label: 'det A < 0', test: (r, s) => s.det < -1e-9 }],
      hint: 'ŷ\'yi aşağıya, (0, −1)\'e götür.',
      explain: (s) => `det A = ${t(s.det)}: kare ters yüz oldu, rengi bu yüzden değişti. Bu bir yansıma; 2. bölümün ikinci görevinde bulduğun [[1, 0], [0, −1]] de böyleydi (det = −1). Bir dönme kareyi asla ters yüz etmez: her dönmenin determinantı 1.` },
    { short: 'Serbest', title: 'Serbest oyun', text: 'Sütunları istediğin yere götür ve alanı izle. Alanın işaretinin hangi anda değiştiğine bak.', final: true,
      onEnter: () => { st.locked = false; st.hide = false; draw(); } },
  ];
  function init() {
    const cv = $('#detCv');
    HeroKit.drag(cv, W, W, {
      hit(p) { if (st.locked) return null; for (const n of ['c1', 'c2']) { const [x, y] = V.px(st[n]); if (Math.hypot(p.x - x, p.y - y) < 22) return n; } return null; },
      move(n, p) { set(n, V.un(p)); },
    });
    kb = HeroKit.keys(cv, {
      get handles() { return st.locked ? [] : ['c1', 'c2']; },
      move: (n, dx, dy) => set(n, Vec.add(st[n], [Math.sign(dx) * 0.5, Math.sign(dy) * 0.5])),
      describe: (n) => `${n === 'c1' ? '1. sütun, x̂' : '2. sütun, ŷ'}: ${fv(st[n])}, det A = ${t(det())}`, redraw: draw,
    });
    HeroKit.onTheme(draw); window.addEventListener('resize', draw);
    ctl = Missions.mount('#detMis', missions, api);
    draw();
    return { ctl, set, setCols, state: api.state };
  }
  return { init };
})();

/* ---------- Quiz ---------- */
const QUIZ = [
  { q: '(1, 2) ile (2, −1) birbirine dik midir?', o: ['Hayır', 'Evet', 'Bilemeyiz, açıyı ölçmek gerekir'], a: 1, e: '(1, 2) · (2, −1) = 2 − 2 = 0. Nokta çarpımı sıfır: diktirler. Açıyı ölçmeye gerek yok.' },
  { q: '(3, 4) · (3, 4) kaçtır?', o: ['7', '12', '25'], a: 2, e: '9 + 16 = 25 = 5²: bir vektörün kendisiyle nokta çarpımı, uzunluğunun karesidir.' },
  { q: '[[1, 2], [3, 4]] matrisinin devriği hangisidir?', o: ['[[1, 3], [2, 4]]', '[[4, 3], [2, 1]]', '[[1, −2], [−3, 4]]'], a: 0, e: 'Satırlar sütun olur: birinci satır (1, 2), devriğin birinci sütunu olur.' },
  { q: 'R(40°)\'yi geri alan matris hangisidir?', o: ['R(80°)', 'R(40°)ᵀ', 'R(40°)'], a: 1, e: 'Dönme matrisinin tersi devriğidir: R(40°)ᵀ = R(−40°).' },
  { q: 'Sütunları (3, 0) ve (0, 2) olan matris alanları kaç katına çıkarır?', o: ['5', '1', '6'], a: 2, e: 'det = 3 · 2 − 0 · 0 = 6: birim kare 3\'e 2\'lik bir dikdörtgene gider. Uzunluklar toplanmaz, alan çarpılır.' },
  { q: 'det A = 0 ise ne olur?', o: ['Düzlem ezilir ve A\'nın tersi yoktur', 'A bir dönmedir', 'A hiçbir şeyi değiştirmez'], a: 0, e: 'Alan sıfıra iner: birçok nokta aynı yere düşer ve dönüşüm geri alınamaz. Hiçbir şeyi değiştirmeyen I\'nın determinantı 1\'dir.' },
  { q: '[[1, 0], [0, −1]] bir dönme matrisi midir?', o: ['Evet, 180° dönmedir', 'Hayır, bir yansımadır', 'Evet, 90° dönmedir'], a: 1, e: 'Dik bir matris, ama determinantı −1: ızgarayı x ekseninde aynalar. 180° dönme [[−1, 0], [0, −1]]\'dir.' },
  { q: '[[1, 0, 3], [0, 1, −1], [0, 0, 1]] matrisi (2, 2) noktasını nereye götürür?', o: ['(2, 2)', '(3, −1)', '(5, 1)'], a: 2, e: 'Nokta (2, 2, 1) diye yazılır. Dönme yok, kaydırma (3, −1): (2 + 3, 2 − 1) = (5, 1).' },
];
function initQuiz() { Quiz.render('#quizBox', QUIZ, '#quizScore'); }

(function boot() {
  const safe = (name, fn) => { try { return fn(); } catch (e) { console.error('[lesson] error in', name, e); } };
  const start = () => {
    safe('theme', initTheme); safe('nav', initNav);
    const dot = safe('dot', Dot.init), ortho = safe('ortho', Ortho.init), inverse = safe('inverse', Inverse.init), det = safe('det', Det.init);
    safe('quiz', initQuiz);
    window.__m4 = { dot, ortho, inverse, det, quiz: QUIZ }; window.__lessonReady = true;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
