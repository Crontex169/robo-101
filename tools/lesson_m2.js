// Check for lesson M.2: every number the text, missions and quiz state (Node: vec.js, planar-arm.js),
// then the lesson in a headless browser: warm-up, both labs (one mission of each with the keyboard),
// the atan2 and law-of-cosines scenes, research block, glossary, quiz, dark theme and 390 px.
// Screenshots go to shots/m2-*.png.
// Standalone: node tools/lesson_m2.js (builds m2 first). tools/check.js calls run().
const path = require('path');
const fs = require('fs');
const { launch, sleep } = require('./cdp');
const Vec = require('../lessons/shared/vec.js');
const Arm = require('../lessons/shared/planar-arm.js');

const shot = (n) => path.resolve(__dirname, '../shots', n);
const fileUrl = (p) => require('url').pathToFileURL(path.resolve(p)).href;
const TERMS = ['radian', 'unit-circle', 'cosine', 'sine', 'polar-coordinates', 'atan2', 'law-of-cosines'];
const D = Math.PI / 180;

function nodeNumbers(check) {
  const near = (a, b, t) => Math.abs(a - b) <= (t || 1e-9), eq = (a, b, t) => Vec.near(a, b, t || 1e-9);
  check(near(180 * D, Math.PI) && near(1 / D, 57.2958, 1e-4) && near(90 * D, 1.571, 5e-4), '§1: 180° = π rad, 1 rad = 57.3°, 90° = 1.571 rad');
  check(near(Math.cos(60 * D), 0.5) && near(Math.sin(30 * D), 0.5) && near(Math.sin(210 * D), -0.5) && near(Math.cos(120 * D), -0.5) && near(Math.cos(-60 * D), 0.5),
    '§2 and quiz: cos 60° = cos −60° = 0.5, sin 30° = 0.5, sin 210° = −0.5, cos 120° = −0.5');
  check(eq(Vec.polar(2, 90 * D), [0, 2]), 'quiz: a link of length 2 at 90° ends at (0, 2)');
  check(eq(Arm.fk([1, 1], [90 * D, -90 * D]).tip, [1, 1]), 'lab 2, mission 1: θ₁ = 90°, θ₂ = −90° puts the hand at (1, 1)');
  const t1 = Arm.fk([1, 1], [30 * D, 60 * D]).tip, t2 = Arm.fk([1, 1], [90 * D, -60 * D]).tip;
  check(Vec.len(Vec.sub(t1, [0.87, 1.5])) < 0.05 && Vec.len(Vec.sub(t2, [0.87, 1.5])) < 0.05, `lab 2, mission 2: (30°, 60°) and (90°, −60°) both reach (0.87, 1.5) → ${Vec.fmt(t1, 3)}`);
  check(near(Math.atan(1 / -1) / D, -45) && near(Vec.angle([-1, 1]) / D, 135) && near(Vec.angle([-1, -1]) / D, -135) && near(Math.atan(-1 / -1) / D, 45),
    '§4 and quiz: arctan(1/−1) = −45° but atan2 = 135°; atan2(−1, −1) = −135° while arctan says 45°');
  check(near(Vec.cosRule(1, 1, Math.SQRT2) / D, 90) && near(Vec.cosRule(3, 4, 5) / D, 90) && Vec.cosRule(1, 1, 2.2) === null && near(Vec.cosRule(1, 1, 2), Math.PI, 1e-6),
    '§5 and quiz: γ(1, 1, √2) = 90°, γ(3, 4, 5) = 90°, d = 2 → γ = 180° so θ₂ = 0° (stretched), d = 2.2 unreachable');
  check(Vec.len([3, 4]) === 5 && eq(Vec.toParent([2, 0], [1, 1]), [3, 1]), 'warm-up: |(3, 4)| = 5; (1, 1) + (2, 0) = (3, 1)');
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
  check(recall.total.startsWith('3 sorudan 3 doğru') && recall.links.every((h) => /^m-1-vectors-and-frames\.html#(parts|two-frames)$/.test(h)), `warm-up: "${recall.total.slice(0, 30)}", links to M.1 sections`);

  const key = (sel, k, n) => p.eval(`(() => { const cv = document.querySelector('${sel}'); cv.focus(); for (let i = 0; i < ${n || 1}; i++) cv.dispatchEvent(new KeyboardEvent('keydown', { key: '${k}', bubbles: true })); return true; })()`);
  const done = (lab, k) => p.waitFor(`window.__m2.${lab}.ctl.ctx.done[${k}] === true`, 5000).then(() => true, () => false);
  const out = (sel) => p.eval(`document.querySelector('${sel} .g-out').textContent`);

  // Lab 1: the unit circle
  await key('#circleCv', 'ArrowRight', 6); // 30° + 6 × 5° = 60°
  check(await done('circle', 0) && (await out('#circleMis')).includes('−60°'), 'lab 1, mission 1: θ = 60° by keyboard, the explanation names −60° too');
  await p.click('#circleMis .g-next');
  check(await p.eval("document.querySelector('#circleMis .g-go').disabled"), 'lab 1, mission 2: run is disabled before a prediction');
  await p.eval("document.querySelectorAll('#circleMis .m-bet .opts button')[1].click()");
  await p.click('#circleMis .g-go');
  check(await done('circle', 1) && (await out('#circleMis')).includes('Tahminin doğruydu') && (await out('#circleMis')).includes('−0.500'), 'lab 1, mission 2: "Negatif" is right, sin 210° = −0.500');
  await p.click('#circleMis .g-next');
  await p.eval('window.__m2.circle.setTh(57)');
  check(await done('circle', 2), 'lab 1, mission 3: 57° counts as one radian');
  await p.click('#circleMis .g-next');
  await p.shotEl(shot('m2-lab1.png'), '#circle .lab', 8);

  // Lab 2: two links
  await p.eval("document.querySelectorAll('#linksMis .m-bet .opts button')[1].click()");
  await p.click('#linksMis .g-go');
  check(await done('links', 0) && (await out('#linksMis')).includes('Tahminin doğruydu') && (await out('#linksMis')).includes('(1.00, 1.00)'), 'lab 2, mission 1: (1, 1) is right');
  await p.click('#linksMis .g-next');
  await key('#linksCv', 'ArrowRight', 6); await key('#linksCv', 'Enter'); await key('#linksCv', 'ArrowRight', 12); // θ₁ = 30°, θ₂ = 60°
  check(await done('links', 1), 'lab 2, mission 2: the hand on (0.87, 1.5) with the keyboard only (30°, 60°)');
  await p.click('#linksMis .g-next');
  await p.shotEl(shot('m2-lab2.png'), '#links .lab', 8);

  // atan2 and the law of cosines
  const at = await p.eval(`(() => { const a = window.__m2.atan, r = []; for (const v of [[-1, 1], [0, 2], [-1, -1]]) { a.set(v); r.push(document.getElementById('atanOut').textContent); } return r; })()`);
  check(at[0].includes('−45.0°') && at[0].includes('135.0°'), `§4: P(−1, 1) → arctan −45°, atan2 135° ("${at[0]}")`);
  check(at[1].includes('tanımsız (x = 0)') && at[1].includes('90.0°') && at[2].includes('45.0°') && at[2].includes('−135.0°'), '§4: x = 0 → arctan undefined, atan2 90°; (−1, −1) → 45° vs −135°');
  const cr = await p.eval(`(() => { const c = window.__m2.cos; document.getElementById('dSqrt2').click(); const a = c.read(); c.set(2.2); const b = c.read(); c.set(Math.SQRT2); return [a, b]; })()`);
  check(cr[0].includes('γ = 90.0°') && cr[0].includes('θ₂ = 180° − γ = 90.0°') && cr[1].includes('ulaşılamaz'), `§5: d = √2 → γ = 90°, θ₂ = 90°; d = 2.2 unreachable`);
  await p.shotEl(shot('m2-cos.png'), '#cosrule .lab', 8);

  // Research, glossary, quiz
  const rt = await p.eval(`(() => { const r = document.querySelector('.research'), a = r.querySelector('.answers'), s = r.querySelector('.actual'), closed = !a.open && !s.open;
    a.querySelector('summary').click(); s.querySelector('summary').click(); return closed && a.open && s.open && !!document.getElementById(s.querySelector('a[href^="#paper-"]').getAttribute('href').slice(1)); })()`);
  check(rt, 'research thinking: folded, opens, links to the Volder card');
  const gl = await p.eval("[...new Set([...document.querySelectorAll('span.gl')].map((s) => s.dataset.gl))]");
  check(TERMS.every((t) => gl.includes(t)), `glossary: ${TERMS.filter((t) => gl.includes(t)).length} of 7 M.2 terms marked (${TERMS.filter((t) => !gl.includes(t)).join(', ') || 'all'}); also linked: ${gl.filter((t) => !TERMS.includes(t)).join(', ') || 'none'}`);
  const score = await p.eval(`(() => { const Q = window.Quiz.last;
    [...document.querySelectorAll('#quizBox .q-card')].forEach((card, i) => [...card.querySelectorAll('.q-opt')].find((b) => b.textContent === Q[i].o[Q[i].a]).click());
    return document.getElementById('quizScore').textContent; })()`);
  check(score.startsWith('Puan: 8 / 8'), `quiz: "${score.slice(0, 20)}"`);
  const qa = await p.eval('window.Quiz.last.map((q) => q.o[q.a])');
  check(qa[0] === 'π' && qa[2] === '0.5' && qa[4] === '(0, 2)' && qa[5] === '−135°' && qa[7] === '90°', 'quiz: the marked answers are the numbers checked in Node');
  await p.shot(shot('m2-light.png'));

  const d = await B.page(url, { width: 1280, height: 900 });
  await d.waitFor('window.__lessonReady === true');
  await d.eval("document.documentElement.dataset.theme = 'dark'"); await sleep(200);
  await d.eval("document.getElementById('links').scrollIntoView()"); await sleep(200);
  await d.shot(shot('m2-dark.png'));
  const m = await B.page(url, { width: 390, height: 844, mobile: true, dpr: 2 });
  await m.waitFor('window.__lessonReady === true'); await sleep(200);
  const sw = await m.eval('document.documentElement.scrollWidth');
  check(sw <= 391, `390 px phone: page width ${sw} px, no horizontal scroll`);
  await m.eval("document.getElementById('circle').scrollIntoView()"); await sleep(200);
  await m.shot(shot('m2-phone.png'));
}

module.exports = { run };

if (require.main === module) {
  const { execFileSync } = require('child_process');
  execFileSync(process.env.PYTHON || 'python', [path.resolve(__dirname, '../lessons/build.py'), 'm2'], { stdio: 'inherit' });
  let fails = 0, n = 0;
  const check = (ok, msg) => { n++; console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
  (async () => {
    const B = await launch();
    try { await run(B, fileUrl(path.resolve(__dirname, '../site/lessons/m-2-trigonometry.html')), check); } finally { await B.close(); }
    console.log(fails ? `FAILED: ${fails} of ${n} checks` : `OK: ${n} checks`);
    process.exit(fails ? 1 : 0);
  })().catch((e) => { console.error(e); process.exit(1); });
}
