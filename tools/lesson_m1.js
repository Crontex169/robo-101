// Check for lesson M.1: first every number the text, missions and quiz state (Node, vec.js), then
// the lesson in a headless browser: warm-up, both labs (one mission of each played with the keyboard),
// the components scene, the 3D frame, research block, glossary tooltips, quiz, dark theme and a
// 390 px phone. Screenshots go to shots/m1-*.png.
// Standalone: node tools/lesson_m1.js (builds m1 first). tools/check.js calls run().
const path = require('path');
const fs = require('fs');
const { launch, sleep } = require('./cdp');
const Vec = require('../lessons/shared/vec.js');

const shot = (n) => path.resolve(__dirname, '../shots', n);
const fileUrl = (p) => require('url').pathToFileURL(path.resolve(p)).href;
const TERMS = ['vector', 'component', 'magnitude', 'unit-vector', 'coordinate-frame', 'origin', 'position-vector', 'right-handed-frame'];

function nodeNumbers(check) {
  const eq = (a, b) => Vec.near(a, b, 1e-9);
  check(Vec.len([3, 4]) === 5 && eq(Vec.unit([3, 4]), [0.6, 0.8]), '§2: (3, 4) has length 5 and unit vector (0.6, 0.8)');
  check(Vec.unit([0, 0]) === null, '§2: the zero vector has no unit vector');
  check(Vec.len([6, 8]) === 10, 'warm-up: legs 6 and 8 give 10');
  check(eq(Vec.add([3, 1], [-1, 2]), [2, 3]), 'lab 1, mission 2: (3, 1) + (−1, 2) = (2, 3)');
  check(Vec.len([4, 3]) === 5, 'lab 1, mission 3: the target (4, 3) is 5 from the dot');
  check(eq(Vec.toParent([1, 3], [2, 1]), [3, 4]), 'lab 2, mission 1: (2, 1) + (1, 3) = (3, 4)');
  check(eq(Vec.inFrame([1, 1], [2, -1]), [-1, 2]), 'lab 2, mission 2: (1, 1) − (2, −1) = (−1, 2)');
  const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1], neg = (v) => Vec.scale(v, -1);
  check(eq(Vec.cross3(X, Y), Z) && Vec.handedness(X, Y, Z) === 'right', '§5: x × y = z, the standard frame is right-handed');
  check(Vec.handedness(X, Y, neg(Z)) === 'left' && Vec.handedness(neg(X), Y, neg(Z)) === 'right', '§5: one flip → left-handed, two flips → right-handed');
  check(eq(Vec.add([2, -1], [-3, 4]), [-1, 3]) && Vec.len([5, 12]) === 13 && eq(Vec.toParent([1, 2], [4, 0]), [5, 2]) && eq(Vec.inFrame([3, 3], [1, 2]), [2, 1]),
    'quiz: (2, −1) + (−3, 4) = (−1, 3); |(5, 12)| = 13; (4, 0) + (1, 2) = (5, 2); (3, 3) − (1, 2) = (2, 1)');
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
    return document.querySelector('.rc-total').textContent; })()`);
  check(recall.startsWith('3 of 3 correct'), `warm-up: "${recall.slice(0, 40)}"`);

  const key = (sel, k, n) => p.eval(`(() => { const cv = document.querySelector('${sel}'); cv.focus(); for (let i = 0; i < ${n || 1}; i++) cv.dispatchEvent(new KeyboardEvent('keydown', { key: '${k}', bubbles: true })); return true; })()`);
  const done = (lab, k) => p.waitFor(`window.__m1.${lab}.ctl.ctx.done[${k}] === true`, 4000).then(() => true, () => false);

  // Lab 1
  await p.eval("window.__m1.arrows.set('tail', [-4, -3]); window.__m1.arrows.set('tip', [-1, -1])");
  check(await done('arrows', 0), 'lab 1, mission 1: a = (3, 2) drawn elsewhere counts as the same vector');
  await p.click('#arrowsMis .g-next');
  check(await p.eval("document.querySelector('#arrowsMis .g-go').disabled"), 'lab 1, mission 2: run is disabled before a prediction');
  await p.eval("document.querySelectorAll('#arrowsMis .m-bet .opts button')[1].click()");
  await p.click('#arrowsMis .g-go');
  const out2 = await done('arrows', 1) && await p.eval("document.querySelector('#arrowsMis .g-out').textContent");
  check(!!out2 && out2.includes('prediction was right') && out2.includes('(2.0, 3.0)'), `lab 1, mission 2: prediction (2, 3) is right ("${String(out2).slice(0, 60)}…")`);
  await p.click('#arrowsMis .g-next');
  await key('#arrowsCv', 'ArrowRight', 4); await key('#arrowsCv', 'Enter'); await key('#arrowsCv', 'ArrowUp', 4);
  check(await done('arrows', 2), 'lab 1, mission 3: reached the target with the keyboard only (a = (4, 0), b = (0, 3))');
  await p.click('#arrowsMis .g-next');
  await p.shotEl(shot('m1-lab1.png'), '#arrows .lab', 8);

  // Components, length and unit vector
  await p.eval('window.__m1.parts.set([3, 4])');
  const parts = await p.eval("document.getElementById('partsOut').textContent");
  check(parts.includes('length 5.00') && parts.includes('(0.60, 0.80)'), `§2: ${parts}`);
  await p.eval('window.__m1.parts.set([0, 0])');
  check((await p.eval("document.getElementById('partsOut').textContent")).includes('undefined'), '§2: zero vector reads "undefined", no NaN');

  // Lab 2
  check(await p.eval("document.getElementById('framesOut').textContent.endsWith('?')"), 'lab 2, mission 1: P in {A} is hidden before the reveal');
  await p.eval("document.querySelectorAll('#framesMis .m-bet .opts button')[1].click()");
  await p.click('#framesMis .g-go');
  const f1 = await done('frames', 0) && await p.eval("document.querySelector('#framesMis .g-out').textContent");
  check(!!f1 && f1.includes('prediction was right') && f1.includes('(3.0, 4.0)'), 'lab 2, mission 1: prediction (3, 4) is right');
  await p.click('#framesMis .g-next');
  await key('#framesCv', 'ArrowRight', 10); await key('#framesCv', 'ArrowUp', 2);
  check(await done('frames', 1), 'lab 2, mission 2: {B} placed at (2, −1) with the keyboard only');
  await p.click('#framesMis .g-next');
  const consistent = await p.eval(`(() => { let s = 7, ok = true; const r = () => { s = (s * 16807) % 2147483647; return Math.round(((s / 2147483647) * 8 - 4) * 2) / 2; };
    for (let i = 0; i < 25; i++) { window.__m1.frames.set('B', [r(), r()]); window.__m1.frames.set('P', [r(), r()]);
      const st = window.__m1.frames.state(), t = document.getElementById('framesOut').textContent;
      ok = ok && Vec.near(Vec.add(st.oB, st.pB), st.P, 1e-9) && t.includes(Vec.fmt(st.oB)) && t.includes(Vec.fmt(st.pB)) && t.includes(Vec.fmt(st.P)); }
    return ok; })()`);
  check(consistent, 'lab 2, free play: after 25 seeded drags, origin of {B} + P in {B} = P in {A} in every readout');
  await p.shotEl(shot('m1-lab2.png'), '#two-frames .lab', 8);

  // 3D frame
  const hand = await p.eval(`(() => { const t = window.__m1.three, o = () => document.getElementById('threeOut').textContent.split('.')[0];
    const a = [t.state().hand, o()]; t.flip(2); const b = [t.state().hand, o()]; t.flip(0); const c = [t.state().hand, o()]; t.flip(0); t.flip(2); return [a, b, c]; })()`);
  check(hand[0][0] === 'right' && hand[1][0] === 'left' && hand[2][0] === 'right' && hand[0][1] === 'Right-handed' && hand[1][1] === 'Left-handed',
    `§5: right-handed → flip z → left-handed → flip x → right-handed (${hand.map((h) => h[0]).join(' → ')})`);

  // Research thinking, glossary, quiz
  const rt = await p.eval(`(() => { const r = document.querySelector('.research'), a = r.querySelector('.answers'), s = r.querySelector('.actual'), closed = !a.open && !s.open;
    a.querySelector('summary').click(); s.querySelector('summary').click(); return closed && a.open && s.open; })()`);
  check(rt, 'research thinking: answers and solution folded, open on click');
  const gl = await p.eval("[...new Set([...document.querySelectorAll('span.gl')].map((s) => s.dataset.gl))]");
  check(TERMS.every((t) => gl.includes(t)), `glossary: ${gl.length} terms marked at first mention (${TERMS.filter((t) => !gl.includes(t)).join(', ') || 'all 8 of M.1'})`);
  const score = await p.eval(`(() => { const Q = window.Quiz.last;
    [...document.querySelectorAll('#quizBox .q-card')].forEach((card, i) => [...card.querySelectorAll('.q-opt')].find((b) => b.textContent === Q[i].o[Q[i].a]).click());
    return document.getElementById('quizScore').textContent; })()`);
  check(score.startsWith('Score: 8 of 8'), `quiz: "${score.slice(0, 20)}"`);
  const qa = await p.eval('window.Quiz.last.map((q) => q.o[q.a])');
  check(qa[3] === '(−1, 3)' && qa[4] === '13' && qa[6] === '(5, 2)' && qa[7] === '(2, 1)', 'quiz: the marked answers are the numbers checked in Node');
  await p.shot(shot('m1-light.png'));

  const d = await B.page(url, { width: 1280, height: 900 });
  await d.waitFor('window.__lessonReady === true');
  await d.eval("document.documentElement.dataset.theme = 'dark'"); await sleep(200);
  await d.eval("document.getElementById('two-frames').scrollIntoView()"); await sleep(200);
  await d.shot(shot('m1-dark.png'));
  const m = await B.page(url, { width: 390, height: 844, mobile: true, dpr: 2 });
  await m.waitFor('window.__lessonReady === true'); await sleep(200);
  const sw = await m.eval('document.documentElement.scrollWidth');
  check(sw <= 391, `390 px phone: page width ${sw} px, no horizontal scroll`);
  await m.eval("document.getElementById('arrows').scrollIntoView()"); await sleep(200);
  await m.shot(shot('m1-phone.png'));
}

module.exports = { run };

if (require.main === module) {
  const { execFileSync } = require('child_process');
  execFileSync(process.env.PYTHON || 'python', [path.resolve(__dirname, '../lessons/build.py'), 'm1'], { stdio: 'inherit' });
  let fails = 0, n = 0;
  const check = (ok, msg) => { n++; console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
  (async () => {
    const B = await launch();
    try { await run(B, fileUrl(path.resolve(__dirname, '../site/lessons/m-1-vectors-and-frames.html')), check); } finally { await B.close(); }
    console.log(fails ? `FAILED: ${fails} of ${n} checks` : `OK: ${n} checks`);
    process.exit(fails ? 1 : 0);
  })().catch((e) => { console.error(e); process.exit(1); });
}
