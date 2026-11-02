// Check for lesson M.4: every number the text, missions and quiz state (Node: vec.js), then the lesson
// in a headless browser: warm-up, both interactives, both labs (missions with the keyboard: canvas keys
// for the labs, real key presses on the sliders), research block, glossary, quiz, dark theme and 390 px.
// Screenshots go to shots/m4-*.png.
// Standalone: node tools/lesson_m4.js (builds m4 first). tools/check.js calls run().
const path = require('path');
const fs = require('fs');
const { launch, sleep } = require('./cdp');
const Vec = require('../lessons/shared/vec.js');

const shot = (n) => path.resolve(__dirname, '../shots', n);
const fileUrl = (p) => require('url').pathToFileURL(path.resolve(p)).href;
const TERMS = ['dot-product', 'orthogonal', 'transpose', 'orthogonal-matrix', 'inverse-matrix', 'determinant', 'reflection', 'homogeneous-coordinates'];
const HOME = { 'dot-product': 'dot', orthogonal: 'dot', transpose: 'ortho', 'orthogonal-matrix': 'ortho', 'inverse-matrix': 'inverse', determinant: 'det', reflection: 'det', 'homogeneous-coordinates': 'special' };
const D = Math.PI / 180;

function nodeNumbers(check) {
  const eq = (a, b, t) => Vec.near(a, b, t || 1e-9);
  const meq = (A, B, t) => A.length === B.length && A.every((r, i) => eq(r, B[i], t));
  const R = (d) => Vec.rot(d * D), I = [[1, 0], [0, 1]], I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const AtA = (A) => Vec.mm(Vec.tr(A), A), cols = (a, b) => [[a[0], b[0]], [a[1], b[1]]];
  check(Vec.dot([1, 2], [3, 1]) === 5 && Vec.dot([3, 4], [4, -3]) === 0 && Vec.dot([3, 4], [3, 4]) === 25 && Vec.len([3, 4]) ** 2 === 25,
    '§1: (1, 2)·(3, 1) = 5; (3, 4)·(4, −3) = 0; (3, 4)·(3, 4) = 25 = |(3, 4)|²');
  const ab = (ph) => Vec.dot([2, 0], Vec.polar(1, ph * D));
  check(Math.abs(ab(60) - 1) < 1e-9 && Vec.num(ab(90), 2) === '0.00' && Math.abs(ab(0) - 2) < 1e-9 && Math.abs(ab(180) + 2) < 1e-9,
    '§1 interactive: a = (2, 0), |b| = 1: a·b = 1 at 60°, 0 at 90° (no −0), 2 at 0°, −2 at 180°');
  const M3 = [[2, -1], [1, 1]];
  check(meq(Vec.tr(M3), [[2, 1], [-1, 1]]) && meq(AtA(M3), [[5, -1], [-1, 2]]) && AtA(M3)[0][1] === Vec.dot([2, 1], [-1, 1]),
    '§2: [[2, −1], [1, 1]]ᵀ = [[2, 1], [−1, 1]]; its AᵀA = [[5, −1], [−1, 2]] lists the column dot products');
  check(meq(AtA(cols([1, 0], [0, 1])), I) && meq(AtA(cols([1, 0], [0, -1])), I) && Vec.det2(cols([1, 0], [0, 1])) === 1 && Vec.det2(cols([1, 0], [0, -1])) === -1,
    'lab 1, missions 1–2: columns (1, 0), (0, ±1) give AᵀA = I; det +1 is R(0°), det −1 the mirror [[1, 0], [0, −1]]');
  const A = cols([2, 1], [3, 0]), B = cols([1, 1], [0, 2]);
  check(meq(Vec.tr(Vec.mm(A, B)), Vec.mm(Vec.tr(B), Vec.tr(A))) && Math.abs(Vec.det2(Vec.mm(A, B)) - Vec.det2(A) * Vec.det2(B)) < 1e-9,
    '§2 and §4 fold-outs: (AB)ᵀ = BᵀAᵀ and det(AB) = det A · det B on an example');
  const all = []; for (let d = -180; d <= 180; d += 5) all.push(d);
  check(meq(AtA(R(30)), I) && all.every((d) => meq(AtA(R(d)), I) && Math.abs(Vec.det2(R(d)) - 1) < 1e-9),
    'lab 1, mission 3 and §4: R(30°)ᵀR(30°) = I; every R(θ), θ = −180…180 step 5, is orthogonal with det 1');
  check(meq(Vec.tr(R(50)), R(-50)) && meq(Vec.tr(R(50)), [[0.64, 0.77], [-0.77, 0.64]], 0.005) && meq(Vec.mm(R(-50), R(50)), I),
    '§3: R(50°)ᵀ = R(−50°) ≈ [[0.64, 0.77], [−0.77, 0.64]]; R(−50°)R(50°) = I');
  const inv = Vec.inv2(M3);
  check(meq(inv, [[1 / 3, 1 / 3], [-1 / 3, 2 / 3]]) && eq(Vec.mv(inv, [0, 3]), [1, 2]) && eq(Vec.mv(M3, [1, 2]), [0, 3]) && Vec.inv2(cols([1, 1], [2, 2])) === null,
    '§3 fold-out: [[2, −1], [1, 1]]⁻¹ = 1/3·[[1, 1], [−1, 2]] sends (0, 3) back to (1, 2); a det-0 matrix has no inverse');
  check(Vec.det2(cols([2, 1], [-1, 1])) === 3 && Vec.det2(cols([1, 0], [1, 1])) === 1 && Vec.det2(cols([1, 1], [2, 2])) === 0 && Vec.det2(cols([1, 0], [0, -1])) === -1,
    'lab 2: det of columns (2, 1), (−1, 1) is 3; shear (1, 0), (1, 1) is 1; (1, 1), (2, 2) is 0; (1, 0), (0, −1) is −1');
  const Rz = Vec.rotZ(90 * D), RzC = Vec.tr(Rz);
  check(meq(Vec.mm(Vec.tr(Rz), Rz), I3) && Math.abs(Vec.det3(RzC[0], RzC[1], RzC[2]) - 1) < 1e-9, '§5: R_z(90°)ᵀR_z(90°) = I and its determinant is 1');
  const T = [[0, -1, 2], [1, 0, 1], [0, 0, 1]];
  check(eq(Vec.mv(T, [1, 0, 1]), [2, 2, 1]) && eq(Vec.add(Vec.mv(R(90), [1, 0]), [2, 1]), [2, 2]) && eq(Vec.mv(T, [0, 0, 1]), [2, 1, 1]),
    '§5: [[0, −1, 2], [1, 0, 1], [0, 0, 1]]·(1, 0, 1) = (2, 2, 1) = R(90°)·(1, 0) + (2, 1); the origin moves to (2, 1)');
  check(eq(Vec.mv(cols([1, 2], [0, 1]), [1, 0]), [1, 2]) && eq(Vec.mv(R(90), [0, 1]), [-1, 0]), 'warm-up: columns (1, 2), (0, 1) send (1, 0) to (1, 2); R(90°)·(0, 1) = (−1, 0)');
  check(Vec.dot([1, 2], [2, -1]) === 0 && meq(Vec.tr([[1, 2], [3, 4]]), [[1, 3], [2, 4]]) && meq(Vec.tr(R(40)), R(-40)) && Vec.det2(cols([3, 0], [0, 2])) === 6 &&
    Vec.det2([[1, 0], [0, -1]]) === -1 && meq(AtA([[1, 0], [0, -1]]), I) && meq(R(180), [[-1, 0], [0, -1]]) && eq(Vec.mv([[1, 0, 3], [0, 1, -1], [0, 0, 1]], [2, 2, 1]), [5, 1, 1]),
    'quiz: (1, 2)·(2, −1) = 0; [[1, 2], [3, 4]]ᵀ; R(40°)ᵀ = R(−40°); det 6; the mirror is orthogonal with det −1; R(180°); (2, 2) → (5, 1)');
}

async function run(B, url, check) {
  nodeNumbers(check);
  fs.mkdirSync(shot(''), { recursive: true });
  const p = await B.page(url, { width: 1280, height: 900, light: true });
  await p.waitFor('window.__lessonReady === true');
  check(!p.logs.some((l) => l.startsWith('[exception]') || l.startsWith('[error]')), 'no errors on load' + (p.logs.length ? `: ${p.logs.join(' | ')}` : ''));
  await p.eval("document.documentElement.dataset.theme = 'light'");

  const recall = await p.eval(`(() => {
    const D = JSON.parse(document.getElementById('recallData').textContent);
    [...document.querySelectorAll('.rc-q')].forEach((card, i) => [...card.querySelectorAll('.rc-opt')].find((b) => b.textContent === D.q[i].o[D.q[i].a]).click());
    return { total: document.querySelector('.rc-total').textContent, links: [...document.querySelectorAll('.rc-exp a')].map((a) => a.getAttribute('href')) }; })()`);
  check(recall.total.startsWith('3 sorudan 3 doğru') && recall.links.length === 3 && recall.links.every((h) => /^m-3-matrices-as-transformations\.html#(grid|rotation|order)$/.test(h)), `warm-up: "${recall.total.slice(0, 30)}", links to M.3 sections`);

  const key = (sel, k, n) => p.eval(`(() => { const cv = document.querySelector('${sel}'); cv.focus(); for (let i = 0; i < ${n || 1}; i++) cv.dispatchEvent(new KeyboardEvent('keydown', { key: '${k}', bubbles: true })); return true; })()`);
  const VK = { ArrowRight: 39, ArrowLeft: 37, ArrowUp: 38, ArrowDown: 40 };
  const press = async (sel, k, n) => {
    await p.eval(`document.querySelector('${sel}').focus()`);
    for (let i = 0; i < (n || 1); i++) for (const type of ['keyDown', 'keyUp']) await p.S('Input.dispatchKeyEvent', { type, key: k, code: k, windowsVirtualKeyCode: VK[k] });
  };
  const done = (lab, k) => p.waitFor(`window.__m4.${lab}.ctl.ctx.done[${k}] === true`, 5000).then(() => true, () => false);
  const out = (sel) => p.eval(`document.querySelector('${sel} .g-out').textContent`);
  const txt = (id) => p.eval(`document.getElementById('${id}').textContent`);
  const mat = (sel, i) => p.eval(`[...document.querySelectorAll('${sel} .mat')][${i || 0}] ? [...[...document.querySelectorAll('${sel} .mat')][${i || 0}].children].map((s) => s.textContent).join(' ') : null`);

  // §1: the dot product
  await key('#dotCv', 'ArrowRight', 6); // 30° + 6 × 5° = 60°
  const d60 = await txt('dotOut');
  await press('#dotIn', 'ArrowRight', 30); // 60° + 30 × 1° = 90°
  const d90 = await txt('dotOut');
  check(d60.includes('φ = 60°') && /= 1(?!\d|\.)/.test(d60.split('a · b')[1]) && !d60.includes('dik'), `§1: φ = 60° by canvas keys gives a·b = 1`);
  check(d90.includes('φ = 90°') && /= 0 · a ile b dik/.test(d90) && !d90.includes('−0'), '§1: the slider by real key presses to 90° gives a·b = 0, "a ile b dik", no −0');
  await p.eval('window.__m4.dot.set(30)');
  await p.shotEl(shot('m4-dot.png'), '#dot .lab', 8);

  // Lab 1: transpose and orthogonal matrices
  check(await p.eval("document.getElementById('orthoRow').hidden"), 'lab 1, mission 1: the angle slider is hidden');
  let n = 0;
  while (n < 15 && !(await p.eval('window.__m4.ortho.state().orth'))) { await key('#orthoCv', 'ArrowLeft'); n++; }
  const s1 = await p.eval('window.__m4.ortho.state()');
  check(await done('ortho', 0) && Vec.near(s1.c2, [0, 1], 1e-9) && (await mat('#orthoOut', 1)) === '1 0 0 1', `lab 1, mission 1: column 2 from (1, 1) to (0, 1) in ${n} arrow presses (snap rule); AᵀA = I`);
  await p.click('#orthoMis .g-next');
  await p.eval('window.__m4.ortho.setC2([0, 1])');
  check(!(await done('ortho', 1)), 'lab 1, mission 2: the first answer again does not count');
  await p.eval('window.__m4.ortho.setC2([0.05, -0.97])'); // snaps to (0, −1)
  check(await done('ortho', 1) && Vec.near((await p.eval('window.__m4.ortho.state()')).c2, [0, -1], 1e-9) && (await out('#orthoMis')).includes('[[1, 0], [0, −1]]'), 'lab 1, mission 2: (0.05, −0.97) snaps to (0, −1), the mirror');
  await p.click('#orthoMis .g-next');
  check(await p.eval("document.querySelector('#orthoMis .g-go').disabled") && (await txt('orthoOut')).includes('AᵀA = ?'), 'lab 1, mission 3: run disabled and AᵀA hidden before a prediction');
  await p.eval("document.querySelectorAll('#orthoMis .m-bet .opts button')[0].click()");
  await p.click('#orthoMis .g-go');
  check(await done('ortho', 2) && (await out('#orthoMis')).includes('Tahminin doğruydu') && (await mat('#orthoOut', 1)) === '1 0 0 1' && (await mat('#orthoOut', 0)) === '0.87 −0.5 0.5 0.87',
    'lab 1, mission 3: "Evet" is right; A = R(30°), AᵀA = I');
  await p.click('#orthoMis .g-next');
  check(await p.eval("!document.getElementById('orthoRow').hidden"), 'lab 1, free play: the angle slider is shown');
  await p.eval('window.__m4.ortho.setC2([0, 0])');
  check((await txt('orthoOut')).includes('AᵀA'), 'lab 1, free play: column 2 at (0, 0) does not break the lab');
  await p.eval('window.__m4.ortho.set({ al: 30 })'); await p.eval('window.__m4.ortho.setC2([-0.5, 0.87])');
  await p.shotEl(shot('m4-lab1.png'), '#ortho .lab', 8);

  // §3: undoing a rotation
  const i0 = await txt('invOut');
  await press('#invIn', 'ArrowLeft', 50); // 0° − 50 × 1° = −50°
  const i50 = await txt('invOut');
  check(!i0.includes('evine') && i50.includes('β = −50°') && i50.includes('Şekil evine döndü') && (await mat('#invOut', 0)) === '0.64 0.77 −0.77 0.64' && (await mat('#invOut', 1)) === '0.64 0.77 −0.77 0.64' && (await mat('#invOut', 2)) === '1 0 0 1',
    '§3: the slider by real key presses to −50° brings the F home; R(−50°) = R(50°)ᵀ = [[0.64, 0.77], [−0.77, 0.64]]');
  await p.eval('window.__m4.inverse.set(-20)');
  await p.shotEl(shot('m4-inv.png'), '#inverse .lab', 8);

  // Lab 2: the determinant
  await key('#detCv', 'ArrowRight', 4); // column 1 (1, 0) → (3, 0)
  check(await done('det', 0) && (await txt('detOut')).includes('det A = 3'), 'lab 2, mission 1: column 1 to (3, 0) by keyboard; det A = 3');
  await p.click('#detMis .g-next');
  check(await p.eval("document.querySelector('#detMis .g-go').disabled") && (await txt('detOut')).includes('det A = ?'), 'lab 2, mission 2: run disabled and det hidden before a prediction');
  await key('#detCv', 'ArrowRight', 2);
  check(Vec.near((await p.eval('window.__m4.det.state()')).c2, [1, 1], 1e-9), 'lab 2, mission 2: the columns are locked before the run');
  await p.eval("document.querySelectorAll('#detMis .m-bet .opts button')[1].click()");
  await p.click('#detMis .g-go');
  check(await done('det', 1) && (await out('#detMis')).includes('Tahminin doğruydu') && (await txt('detOut')).includes('det A = 1'), 'lab 2, mission 2: "1" is right');
  await p.click('#detMis .g-next');
  await p.eval('window.__m4.det.setCols([1, 1], [2, 2])');
  const flat = await txt('detOut');
  check(await done('det', 2) && flat.includes('det A = 0') && flat.includes('ters yok') && flat.includes('doğruya ezildi') && !/Infinity|NaN/.test(flat), 'lab 2, mission 3: columns (1, 1), (2, 2): det 0, "ters yok"');
  await p.click('#detMis .g-next');
  await key('#detCv', 'Enter'); await key('#detCv', 'ArrowDown', 4); // column 2 (0, 1) → (0, −1)
  const flip = await txt('detOut');
  check(await done('det', 3) && flip.includes('det A = −1') && flip.includes('yansıma'), 'lab 2, mission 4: column 2 to (0, −1) by keyboard; det −1, a reflection');
  await p.click('#detMis .g-next');
  await p.eval('window.__m4.det.setCols([0, 0], [0, 0])');
  const z = await txt('detOut');
  check(z.includes('noktaya ezildi') && z.includes('ters yok') && !/Infinity|NaN|−0/.test(z), 'lab 2, free play: both columns zero, the lab does not break');
  await p.eval('window.__m4.det.setCols([2, 1], [-1, 1])');
  await p.shotEl(shot('m4-lab2.png'), '#det .lab', 8);

  // Research, glossary, quiz, wrap-up
  const rt = await p.eval(`(() => { const r = document.querySelector('.research'), a = r.querySelector('.answers'), s = r.querySelector('.actual'), closed = !a.open && !s.open;
    a.querySelector('summary').click(); s.querySelector('summary').click();
    const ids = [...s.querySelectorAll('a[href^="#paper-"]')].map((x) => x.getAttribute('href').slice(1));
    return closed && a.open && s.open && ids.length === 2 && ids.every((id) => !!document.getElementById(id)); })()`);
  check(rt, 'research thinking: folded, opens, links to the Möbius and Denavit–Hartenberg cards');
  const gl = await p.eval("[...new Set([...document.querySelectorAll('span.gl')].map((s) => s.dataset.gl))]");
  const sec = await p.eval(`Object.fromEntries([...document.querySelectorAll('span.gl')].map((s) => [s.dataset.gl, s.closest('section').id]))`);
  check(TERMS.every((t) => gl.includes(t) && sec[t] === HOME[t]), `glossary: ${TERMS.filter((t) => gl.includes(t)).length} of 8 M.4 terms marked in their sections (${TERMS.filter((t) => sec[t] !== HOME[t]).join(', ') || 'all'}); also linked: ${gl.filter((t) => !TERMS.includes(t)).join(', ') || 'none'}`);
  const score = await p.eval(`(() => { const Q = window.Quiz.last;
    [...document.querySelectorAll('#quizBox .q-card')].forEach((card, i) => [...card.querySelectorAll('.q-opt')].find((b) => b.textContent === Q[i].o[Q[i].a]).click());
    return document.getElementById('quizScore').textContent; })()`);
  check(score.startsWith('Puan: 8 / 8'), `quiz: "${score.slice(0, 20)}"`);
  const qa = await p.eval('window.Quiz.last.map((q) => q.o[q.a])');
  check(qa[0] === 'Evet' && qa[1] === '25' && qa[2] === '[[1, 3], [2, 4]]' && qa[3] === 'R(40°)ᵀ' && qa[4] === '6' && qa[6].startsWith('Hayır') && qa[7] === '(5, 1)', 'quiz: the marked answers are the numbers checked in Node');
  const fin = await p.eval(`(() => { const f = document.getElementById('finale'); return { text: f.textContent, m5: !!f.querySelector('a[href^="m-5-"]') }; })()`);
  check(fin.text.includes('Sıradaki ders M.5') && !fin.m5, 'wrap-up: names M.5, no link while it is not published');
  await p.shot(shot('m4-light.png'));

  const d = await B.page(url, { width: 1280, height: 900 });
  await d.waitFor('window.__lessonReady === true');
  await d.eval("document.documentElement.dataset.theme = 'dark'"); await sleep(200);
  await d.eval("document.getElementById('det').scrollIntoView()"); await sleep(200);
  await d.shot(shot('m4-dark.png'));
  const m = await B.page(url, { width: 390, height: 844, mobile: true, dpr: 2 });
  await m.waitFor('window.__lessonReady === true'); await sleep(200);
  const sw = await m.eval('document.documentElement.scrollWidth');
  check(sw <= 391, `390 px phone: page width ${sw} px, no horizontal scroll`);
  await m.eval("document.getElementById('ortho').scrollIntoView()"); await sleep(200);
  await m.shot(shot('m4-phone.png'));
}

module.exports = { run };

if (require.main === module) {
  const { execFileSync } = require('child_process');
  execFileSync(process.env.PYTHON || 'python', [path.resolve(__dirname, '../lessons/build.py'), 'm4'], { stdio: 'inherit' });
  let fails = 0, n = 0;
  const check = (ok, msg) => { n++; console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
  (async () => {
    const B = await launch();
    try { await run(B, fileUrl(path.resolve(__dirname, '../site/lessons/m-4-special-matrices.html')), check); } finally { await B.close(); }
    console.log(fails ? `FAILED: ${fails} of ${n} checks` : `OK: ${n} checks`);
    process.exit(fails ? 1 : 0);
  })().catch((e) => { console.error(e); process.exit(1); });
}
