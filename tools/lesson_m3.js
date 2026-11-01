// Check for lesson M.3: every number the text, missions and quiz state (Node: vec.js, planar-arm.js),
// then the lesson in a headless browser: warm-up, both labs (missions with the keyboard: canvas keys
// for lab 1, real key presses on the sliders for lab 2), the rotation scene, research block,
// glossary, quiz, dark theme and 390 px. Screenshots go to shots/m3-*.png.
// Standalone: node tools/lesson_m3.js (builds m3 first). tools/check.js calls run().
const path = require('path');
const fs = require('fs');
const { launch, sleep } = require('./cdp');
const Vec = require('../lessons/shared/vec.js');
const Arm = require('../lessons/shared/planar-arm.js');

const shot = (n) => path.resolve(__dirname, '../shots', n);
const fileUrl = (p) => require('url').pathToFileURL(path.resolve(p)).href;
const TERMS = ['matrix', 'column-vector', 'matrix-vector-product', 'linear-transformation', 'rotation-matrix', 'identity-matrix', 'matrix-product'];
const D = Math.PI / 180;

function nodeNumbers(check) {
  const eq = (a, b, t) => Vec.near(a, b, t || 1e-9);
  const meq = (A, B, t) => A.every((r, i) => eq(r, B[i], t));
  const R = (d) => Vec.rot(d * D), S = (sx, sy) => [[sx, 0], [0, sy]], I = [[1, 0], [0, 1]];
  check(eq(Vec.mv([[2, -1], [1, 1]], [1, 2]), [0, 3]) && eq(Vec.add(Vec.scale([2, 1], 1), Vec.scale([-1, 1], 2)), [0, 3]) && 2 * 1 + -1 * 2 === 0 && 1 * 1 + 1 * 2 === 3,
    '§1: [[2, −1], [1, 1]]·(1, 2) = 1·(2, 1) + 2·(−1, 1) = (0, 3), and the row rule agrees');
  check(eq(Vec.mv(S(2, 2), [1, 1]), [2, 2]) && eq(Vec.mv(S(2, 2), [-1, 0.5]), [-2, 1]), 'lab 1, mission 1: columns (2, 0), (0, 2) double every vector; (1, 1) → (2, 2)');
  check(eq(Vec.mv([[1, 1], [0, 1]], [1, 1]), [2, 1]), 'lab 1, mission 2: shear with columns (1, 0), (1, 1) sends (1, 1) to (2, 1)');
  check(meq(R(90), [[0, -1], [1, 0]]) && Vec.num(R(90)[0][0], 2) === '0.00' && meq(R(0), I), '§2 mission 3 and §3: R(90°) = [[0, −1], [1, 0]] (no −0 shown); R(0°) = I');
  check(meq(R(30), [[0.87, -0.5], [0.5, 0.87]], 0.005) && eq(Vec.mv(R(30), [2, 0]), [1.73, 1], 0.005) && eq(Vec.mv(R(30), [2, 0]), Vec.polar(2, 30 * D)),
    '§3: R(30°) ≈ [[0.87, −0.5], [0.5, 0.87]]; R(30°)·(2, 0) = (1.73, 1) = (2 cos 30°, 2 sin 30°)');
  const RS = Vec.mm(R(90), S(2, 1)), SR = Vec.mm(S(2, 1), R(90));
  check(meq(RS, [[0, -1], [2, 0]]) && meq(SR, [[0, -2], [1, 0]]) && eq(Vec.mv(RS, [1, 0]), [0, 2]) && eq(Vec.mv(SR, [1, 0]), [0, 1]),
    'lab 2, mission 1 and §4: R(90°)S(2, 1) = [[0, −1], [2, 0]] sends (1, 0) to (0, 2); S(2, 1)R(90°) = [[0, −2], [1, 0]] sends it to (0, 1)');
  const commute = (sx, sy) => meq(Vec.mm(R(90), S(sx, sy)), Vec.mm(S(sx, sy), R(90)));
  const sl = [0.5, 1, 1.5, 2], pairs = sl.flatMap((a) => sl.map((b) => [a, b])).filter(([a, b]) => commute(a, b));
  check(pairs.every(([a, b]) => a === b) && pairs.length === 4 && meq(Vec.mm(R(90), S(2, 2)), [[0, -2], [2, 0]]),
    'lab 2, mission 2: on the slider values R(90°) and S commute exactly when sx = sy; for 2 both orders give [[0, −2], [2, 0]]');
  const ok = [-180, -90, 0, 30, 60, 90].filter((a) => meq(Vec.mm(R(a), R(60)), R(90)));
  check(ok.length === 1 && ok[0] === 30 && meq(Vec.mm(R(60), R(30)), R(90)), 'lab 2, mission 3: R(α)R(60°) = R(90°) only for α = 30°; R(60°)R(30°) too');
  check(eq(Vec.mv(Vec.rotZ(90 * D), [1, 0, 5]), [0, 1, 5]) && eq(Vec.mv(Vec.rotZ(90 * D), [2, 0, 3]), [0, 2, 3]) && eq(Vec.mv(Vec.rotZ(37 * D), [0, 0, 1]), [0, 0, 1]),
    '§5 and quiz: R_z(90°)·(1, 0, 5) = (0, 1, 5), (2, 0, 3) → (0, 2, 3), ẑ stays');
  const sq = R(90).map((r) => r.map((x) => x * x));
  check(meq(sq, [[0, 1], [1, 0]]) && meq(Vec.mm(R(90), R(90)), R(180)) && meq(R(180), [[-1, 0], [0, -1]]), 'research: R(90°) squared entry by entry is the swap [[0, 1], [1, 0]]; R(90°)R(90°) = R(180°)');
  check(eq(Vec.mv([[2, 0], [0, 3]], [1, 1]), [2, 3]) && eq(Vec.mv(R(90), [1, 0]), [0, 1]) && meq(Vec.mm(R(30), R(45)), R(75)) && meq(Vec.mm(R(-40), R(40)), I),
    'quiz and wrap-up: columns (2, 0), (0, 3) send (1, 1) to (2, 3); R(90°)·(1, 0) = (0, 1); R(30°)R(45°) = R(75°); R(−θ)R(θ) = I');
  check(Math.abs(Math.cos(60 * D) - 0.5) < 1e-9 && eq(Vec.polar(2, 30 * D), [2 * Math.cos(30 * D), 2 * Math.sin(30 * D)]) && eq(Arm.fk([1, 1], [30 * D, 60 * D]).tip, Vec.add(Vec.polar(1, 30 * D), Vec.polar(1, 90 * D))),
    'warm-up: cos 60° = 0.5; a link of 2 at 30° ends at (2 cos 30°, 2 sin 30°); with θ₁ = 30°, θ₂ = 60° the second link points along 90°');
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
  check(recall.total.startsWith('3 sorudan 3 doğru') && recall.links.length === 3 && recall.links.every((h) => /^m-2-trigonometry\.html#(circle|links)$/.test(h)), `warm-up: "${recall.total.slice(0, 30)}", links to M.2 sections`);

  // canvas keys: the lesson's own keydown handler; sliders: real key presses through the browser
  const key = (sel, k, n) => p.eval(`(() => { const cv = document.querySelector('${sel}'); cv.focus(); for (let i = 0; i < ${n || 1}; i++) cv.dispatchEvent(new KeyboardEvent('keydown', { key: '${k}', bubbles: true })); return true; })()`);
  const VK = { ArrowRight: 39, ArrowLeft: 37, ArrowUp: 38, ArrowDown: 40 };
  const press = async (sel, k, n) => {
    await p.eval(`document.querySelector('${sel}').focus()`);
    for (let i = 0; i < (n || 1); i++) for (const type of ['keyDown', 'keyUp']) await p.S('Input.dispatchKeyEvent', { type, key: k, code: k, windowsVirtualKeyCode: VK[k] });
  };
  const done = (lab, k) => p.waitFor(`window.__m3.${lab}.ctl.ctx.done[${k}] === true`, 5000).then(() => true, () => false);
  const out = (sel) => p.eval(`document.querySelector('${sel} .g-out').textContent`);
  const mat = (sel, i) => p.eval(`[...document.querySelectorAll('${sel} .mat')][${i || 0}] ? [...[...document.querySelectorAll('${sel} .mat')][${i || 0}].children].map((s) => s.textContent) : null`);

  // Lab 1: columns move the grid
  await key('#gridCv', 'ArrowRight', 2); await key('#gridCv', 'Enter'); await key('#gridCv', 'ArrowUp', 2); // x̂ → (2, 0), ŷ → (0, 2)
  check(await done('grid', 0) && (await out('#gridMis')).includes('(2, 2)'), 'lab 1, mission 1: columns (2, 0), (0, 2) by keyboard; v → (2, 2)');
  await p.click('#gridMis .g-next');
  check(await p.eval("document.querySelector('#gridMis .g-go').disabled") && (await p.eval("document.getElementById('gridOut').textContent")).includes('Av = ?'), 'lab 1, mission 2: run disabled and Av hidden before a prediction');
  await key('#gridCv', 'ArrowRight', 2);
  check(Vec.near((await p.eval('window.__m3.grid.state()')).c2, [1, 1], 1e-9), 'lab 1, mission 2: the columns are locked before the run');
  await p.eval("document.querySelectorAll('#gridMis .m-bet .opts button')[1].click()");
  await p.click('#gridMis .g-go');
  check(await done('grid', 1) && (await out('#gridMis')).includes('Tahminin doğruydu') && (await out('#gridMis')).includes('(2, 1)'), 'lab 1, mission 2: "(2, 1)" is right');
  await p.click('#gridMis .g-next');
  await p.eval('window.__m3.grid.setCols([0, 1], [-1, 0])');
  check(await done('grid', 2) && (await mat('#gridMis')).join(' ') === '0 −1 1 0', 'lab 1, mission 3: columns (0, 1), (−1, 0) turn the plane by 90°, shown as [[0, −1], [1, 0]]');
  await p.click('#gridMis .g-next');
  await p.eval('window.__m3.grid.setCols([1, 1], [2, 2])');
  const fl = await p.eval("document.getElementById('gridOut').textContent");
  await p.eval('window.__m3.grid.setCols([0, 0], [0, 0])');
  const fl0 = await p.eval("document.getElementById('gridOut').textContent");
  check(fl.includes('doğruya ezildi') && fl0.includes('noktaya ezildi') && !/determinant/i.test(fl + fl0), 'lab 1, free play: parallel columns flatten the plane to a line, zero columns to a point, without the word "determinant"');
  await p.eval('window.__m3.grid.setCols([1, 0], [1, 1])');
  await p.shotEl(shot('m3-lab1.png'), '#grid .lab', 8);

  // Rotation
  await p.eval('window.__m3.rotation.set(30)');
  const r30 = await p.eval("document.getElementById('rotOut').textContent"), m30 = await mat('#rotOut');
  await press('#rotIn', 'ArrowRight', 60); // 30° + 60 × 1° = 90°
  const m90 = await mat('#rotOut'), th90 = await p.eval("document.getElementById('rotIn').value");
  await p.eval('window.__m3.rotation.set(0)');
  const m0 = await mat('#rotOut');
  check(m30.join(' ') === '0.87 −0.5 0.5 0.87' && r30.includes('(1.73, 1)'), `§3: R(30°) = [[0.87, −0.5], [0.5, 0.87]] and R(30°)·(2, 0) = (1.73, 1)`);
  check(th90 === '90' && m90.join(' ') === '0 −1 1 0' && m0.join(' ') === '1 0 0 1', `§3: the slider by keyboard to 90° gives [[0, −1], [1, 0]]; θ = 0 gives I with no −0 (${m90.join(' ')}; ${m0.join(' ')})`);
  await p.eval('window.__m3.rotation.set(30)');
  await p.shotEl(shot('m3-rot.png'), '#rotation .lab', 8);

  // Lab 2: order matters
  check(await p.eval("document.querySelector('#orderMis .g-go').disabled && document.getElementById('alRow').hidden && document.getElementById('bKind').hidden") && (await p.eval("document.getElementById('orderOut').textContent")).includes('AB · (1, 0) = ?'),
    'lab 2, mission 1: run disabled, controls hidden, answers hidden before a prediction');
  await p.eval("document.querySelectorAll('#orderMis .m-bet .opts button')[1].click()");
  await p.click('#orderMis .g-go');
  const o1 = await p.eval("document.getElementById('orderOut').textContent");
  check(await done('order', 0) && (await out('#orderMis')).includes('Tahminin doğruydu') && o1.includes('AB · (1, 0) = (0, 2)') && o1.includes('BA · (1, 0) = (0, 1)') && o1.includes('AB ≠ BA'),
    'lab 2, mission 1: "Farklı" is right; AB·(1, 0) = (0, 2), BA·(1, 0) = (0, 1)');
  await p.click('#orderMis .g-next');
  await press('#syIn', 'ArrowRight', 2); // y ratio 1 → 2, so sx = sy = 2
  check(await done('order', 1) && (await mat('#orderOut', 0)).join(' ') === '0 −2 2 0' && (await mat('#orderOut', 1)).join(' ') === '0 −2 2 0', 'lab 2, mission 2: y ratio to 2 with real key presses; AB = BA = [[0, −2], [2, 0]]');
  await p.click('#orderMis .g-next');
  check(!(await done('order', 2)), 'lab 2, mission 3: not done at α = 0°');
  await press('#alIn', 'ArrowRight', 6); // 0° + 6 × 5° = 30°
  check(await done('order', 2) && (await mat('#orderOut', 0)).join(' ') === '0 −1 1 0' && (await mat('#orderOut', 1)).join(' ') === '0 −1 1 0', 'lab 2, mission 3: α = 30° with real key presses; R(30°)R(60°) = R(60°)R(30°) = R(90°)');
  await p.click('#orderMis .g-next');
  check(await p.eval("!document.getElementById('alRow').hidden && !document.getElementById('sxRow').hidden && !document.getElementById('bKind').hidden"), 'lab 2, free play: every control is shown');
  await p.click('#bScale'); await p.eval("window.__m3.order.set({ al: 90, sx: 2, sy: 1 })");
  await p.shotEl(shot('m3-lab2.png'), '#order .lab', 8);

  // Research, glossary, quiz
  const rt = await p.eval(`(() => { const r = document.querySelector('.research'), a = r.querySelector('.answers'), s = r.querySelector('.actual'), closed = !a.open && !s.open;
    a.querySelector('summary').click(); s.querySelector('summary').click(); return closed && a.open && s.open && !!document.getElementById(s.querySelector('a[href^="#paper-"]').getAttribute('href').slice(1)); })()`);
  check(rt, 'research thinking: folded, opens, links to the Cayley card');
  const gl = await p.eval("[...new Set([...document.querySelectorAll('span.gl')].map((s) => s.dataset.gl))]");
  const sec = await p.eval(`Object.fromEntries([...document.querySelectorAll('span.gl')].map((s) => [s.dataset.gl, s.closest('section').id]))`);
  const home = { matrix: 'product', 'column-vector': 'product', 'matrix-vector-product': 'product', 'linear-transformation': 'grid', 'rotation-matrix': 'rotation', 'identity-matrix': 'rotation', 'matrix-product': 'order' };
  check(TERMS.every((t) => gl.includes(t) && sec[t] === home[t]), `glossary: ${TERMS.filter((t) => gl.includes(t)).length} of 7 M.3 terms marked in their sections (${TERMS.filter((t) => sec[t] !== home[t]).join(', ') || 'all'}); also linked: ${gl.filter((t) => !TERMS.includes(t)).join(', ') || 'none'}`);
  const score = await p.eval(`(() => { const Q = window.Quiz.last;
    [...document.querySelectorAll('#quizBox .q-card')].forEach((card, i) => [...card.querySelectorAll('.q-opt')].find((b) => b.textContent === Q[i].o[Q[i].a]).click());
    return document.getElementById('quizScore').textContent; })()`);
  check(score.startsWith('Puan: 8 / 8'), `quiz: "${score.slice(0, 20)}"`);
  const qa = await p.eval('window.Quiz.last.map((q) => q.o[q.a])');
  check(qa[1] === '(2, 3)' && qa[3] === 'B' && qa[4] === '(0, 1)' && qa[6] === 'R(75°)' && qa[7] === 'z', 'quiz: the marked answers are the numbers checked in Node');
  await p.shot(shot('m3-light.png'));

  const d = await B.page(url, { width: 1280, height: 900 });
  await d.waitFor('window.__lessonReady === true');
  await d.eval("document.documentElement.dataset.theme = 'dark'"); await sleep(200);
  await d.eval("document.getElementById('grid').scrollIntoView()"); await sleep(200);
  await d.shot(shot('m3-dark.png'));
  const m = await B.page(url, { width: 390, height: 844, mobile: true, dpr: 2 });
  await m.waitFor('window.__lessonReady === true'); await sleep(200);
  const sw = await m.eval('document.documentElement.scrollWidth');
  check(sw <= 391, `390 px phone: page width ${sw} px, no horizontal scroll`);
  await m.eval("document.getElementById('order').scrollIntoView()"); await sleep(200);
  await m.shot(shot('m3-phone.png'));
}

module.exports = { run };

if (require.main === module) {
  const { execFileSync } = require('child_process');
  execFileSync(process.env.PYTHON || 'python', [path.resolve(__dirname, '../lessons/build.py'), 'm3'], { stdio: 'inherit' });
  let fails = 0, n = 0;
  const check = (ok, msg) => { n++; console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
  (async () => {
    const B = await launch();
    try { await run(B, fileUrl(path.resolve(__dirname, '../site/lessons/m-3-matrices-as-transformations.html')), check); } finally { await B.close(); }
    console.log(fails ? `FAILED: ${fails} of ${n} checks` : `OK: ${n} checks`);
    process.exit(fails ? 1 : 0);
  })().catch((e) => { console.error(e); process.exit(1); });
}
