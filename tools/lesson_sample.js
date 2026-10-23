// Check for the sample lesson: first the engine numbers the text states (Node), then the whole
// lesson in a headless browser: warm-up, every mission, "Under the hood", a glossary tooltip, the
// quiz, related papers, research thinking, margin notes, dark theme and a 390 px phone.
// Screenshots go to shots/sample-*.png.
// Standalone: node tools/lesson_sample.js (builds the sample first). tools/check.js calls run().
const path = require('path');
const fs = require('fs');
const { launch, sleep } = require('./cdp');
const Arm = require('../lessons/shared/planar-arm.js');

const shot = (n) => path.resolve(__dirname, '../shots', n);
const fileUrl = (p) => require('url').pathToFileURL(path.resolve(p)).href;

function nodeNumbers(check) {
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  const r = Arm.reach([0.5, 0.4]);
  check(near(r.outer, 0.9) && near(r.inner, 0.1), `reach of a 0.5 + 0.4 m arm: ${r.inner.toFixed(2)}–${r.outer.toFixed(2)} m (text says 0.1–0.9 m)`);
  check(near(Arm.reach([0.5, 0.5]).inner, 0), 'equal links: the ring is a full disc');
  const sols = Arm.ik2(0.5, 0.4, 0.4, 0.3);
  check(sols.length === 2 && sols.every((q) => { const t = Arm.fk([0.5, 0.4], q).tip; return Math.hypot(t[0] - 0.4, t[1] - 0.3) < 1e-9; }), 'an interior target has two IK solutions that both reach it');
  const t0 = Arm.fk([0.5, 0.4], [0, 30 * Math.PI / 180]).tip, t1 = Arm.fk([0.5, 0.4], [0, 50 * Math.PI / 180]).tip;
  check(t1[1] - t0[1] > 0.05, `mission 2: bending the elbow +20° from (0°, 30°) lifts the hand by ${((t1[1] - t0[1]) * 100).toFixed(0)} cm`);
}

async function run(B, url, check) {
  nodeNumbers(check);
  fs.mkdirSync(shot(''), { recursive: true });
  const p = await B.page(url, { width: 1280, height: 900 });
  await p.waitFor('window.__lessonReady === true');
  check(!p.logs.some((l) => l.startsWith('[exception]') || l.startsWith('[error]')), 'no errors on load' + (p.logs.length ? `: ${p.logs.join(' | ')}` : ''));

  // Warm-up: answer every question correctly, by its text
  const recall = await p.eval(`(() => {
    const D = JSON.parse(document.getElementById('recallData').textContent);
    [...document.querySelectorAll('.rc-q')].forEach((card, i) => [...card.querySelectorAll('.rc-opt')].find((b) => b.textContent === D.q[i].o[D.q[i].a]).click());
    return document.querySelector('.rc-total').textContent;
  })()`);
  check(recall.startsWith('3 sorudan 3 doğru'), `warm-up: "${recall.slice(0, 40)}"`);

  // Mission 1: put the hand on the target
  await p.eval('window.__sample.setAngles(110, -75)');
  await p.waitFor('window.__sample.ctl.ctx.done[0] === true', 3000).catch(() => {});
  check(await p.eval('window.__sample.ctl.ctx.done[0] === true'), 'mission 1 completes when the hand is on the target');
  await p.click('#armMis .g-next');
  // Mission 2: the run button waits for a prediction, then the elbow bends and the bet is judged
  check(await p.eval("document.querySelector('#armMis .g-go').disabled"), 'mission 2: run is disabled before a prediction');
  await p.eval("document.querySelector('#armMis .m-bet .opts button').click()"); // "Up"
  await p.click('#armMis .g-go');
  await p.waitFor('window.__sample.ctl.ctx.done[1] === true', 5000).catch(() => {});
  const out2 = await p.eval("document.querySelector('#armMis .g-out').textContent");
  check(await p.eval('window.__sample.ctl.ctx.done[1] === true') && out2.includes('Tahminin doğruydu'), `mission 2: prediction "Up" is right ("${out2.slice(0, 50)}…")`);
  await p.click('#armMis .g-next');
  check(await p.eval('window.__sample.ctl.index === 2'), 'free play reached');
  await p.shotEl(shot('sample-lab.png'), '#arm .lab', 8);

  // Under the hood: typeset at build time, no formula library in the page
  const deep = await p.eval(`(() => { const d = document.querySelector('details.deep'); d.open = true;
    return { katex: d.querySelectorAll('.katex').length, lib: document.documentElement.innerHTML.includes('renderToString') }; })()`);
  check(deep.katex > 0 && !deep.lib, `"Under the hood": ${deep.katex} typeset formulas, no KaTeX script`);

  // Glossary tooltip at the first mention
  const gl = await p.eval(`(() => { const t = document.querySelector('span.gl'); if (!t) return null; t.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
    const pop = document.getElementById('glPop'); return pop && !pop.hidden ? pop.textContent : null; })()`);
  check(!!gl && gl.includes('İleri kinematik') && gl.includes('(Forward kinematics)'), 'glossary tooltip shows the definition' + (gl ? '' : ' (no tooltip)'));

  // Quiz: answer every question correctly
  const score = await p.eval(`(() => { const Q = window.Quiz.last;
    [...document.querySelectorAll('#quizBox .q-card')].forEach((card, i) => [...card.querySelectorAll('.q-opt')].find((b) => b.textContent === Q[i].o[Q[i].a]).click());
    return document.getElementById('quizScore').textContent; })()`);
  check(score.startsWith('Puan: 8 / 8'), `quiz: "${score.slice(0, 20)}"`);
  await p.shot(shot('sample-light.png'));

  // Related papers: every card has its fields; "More details" is closed until clicked
  const papers = await p.eval(`(() => { const cards = [...document.querySelectorAll('#papers .paper')];
    const ok = (c) => !!(c.querySelector('h3 a[href]') && c.querySelector('h3 a').textContent.trim() && c.querySelector('.authors').textContent.trim()
      && c.querySelector('.venue').textContent.trim() && /^\\d{4}$/.test(c.querySelector('.year').textContent.trim()) && c.querySelector('.takeaway').textContent.trim());
    const ids = cards.map((c) => c.id), more = cards.map((c) => c.querySelector('details.more')).filter(Boolean);
    const closed = more.every((d) => !d.open); more.forEach((d) => d.querySelector('summary').click());
    return { n: cards.length, fields: cards.every(ok), unique: ids.every((id) => id) && new Set(ids).size === ids.length, closed, opened: more.length > 0 && more.every((d) => d.open) }; })()`);
  check(papers.n >= 3 && papers.fields && papers.unique, `${papers.n} paper cards, every card has title link, authors, venue, year and takeaway, ids unique`);
  check(papers.closed && papers.opened, '"More details" closed on load, opens on click');

  // Research thinking: question visible, answers and the real solution folded until clicked; card links resolve
  const rt = await p.eval(`(() => { const r = document.querySelector('.research'); if (!r) return null;
    const a = r.querySelector('details.answers'), s = r.querySelector('details.actual');
    const res = { q: r.querySelector('.q').getBoundingClientRect().height > 0, closed: !a.open && !s.open };
    a.querySelector('summary').click(); s.querySelector('summary').click();
    res.opened = a.open && s.open && a.querySelectorAll('li').length >= 2;
    res.links = [...s.querySelectorAll('a[href^="#paper-"]')].map((x) => !!document.getElementById(x.getAttribute('href').slice(1)));
    return res; })()`);
  check(!!rt && rt.q && rt.closed && rt.opened, 'research thinking: question visible, answers and solution closed on load, open on click');
  check(!!rt && rt.links.length >= 1 && rt.links.every(Boolean), `research thinking: ${rt ? rt.links.length : 0} links to paper cards, all resolve`);

  // Margin notes: beside their paragraph on a wide screen, below it on a phone, never overlapping
  const notesAt = (pg) => pg.eval(`(() => [...document.querySelectorAll('.noted')].map((w) => { const pr = w.querySelector('p').getBoundingClientRect(), n = w.querySelector('.mnote');
    const r = n.getBoundingClientRect(); return { label: n.getAttribute('aria-label'), dx: r.left - pr.right, dy: r.top - pr.top, below: r.top - pr.bottom, top: r.top + scrollY, bottom: r.bottom + scrollY, right: r.right }; }))()`);
  const wide = await notesAt(p);
  check(wide.length >= 2 && wide.every((n) => n.dx > 0 && Math.abs(n.dy) <= 40 && n.right <= 1280 && n.label), `margin notes at 1280 px: ${wide.length} notes in the right margin, top-aligned with their paragraph`);
  check(wide.every((n, i) => !i || n.top >= wide[i - 1].bottom), "margin notes don't overlap");

  // Dark theme and a 390 px phone
  const d = await B.page(url, { width: 1280, height: 900, dark: true });
  await d.waitFor('window.__lessonReady === true');
  check(await d.eval("document.documentElement.dataset.theme !== 'dark'"), 'light theme is the default, even when the system is dark');
  await d.click('#themeBtn');
  check(await d.eval("document.documentElement.dataset.theme === 'dark'"), 'the theme button switches to dark');
  await d.shot(shot('sample-dark.png'));
  const m = await B.page(url, { width: 390, height: 844, mobile: true, dpr: 2 });
  await m.waitFor('window.__lessonReady === true'); await sleep(200);
  const sw = await m.eval('document.documentElement.scrollWidth');
  check(sw <= 391, `390 px phone: page width ${sw} px, no horizontal scroll`);
  const narrow = await notesAt(m);
  check(narrow.length >= 2 && narrow.every((n) => n.below >= -1 && n.right <= 391), 'margin notes at 390 px: inline below their paragraph');
  await m.shot(shot('sample-phone.png'));
}

module.exports = { run };

if (require.main === module) {
  const { execFileSync } = require('child_process');
  execFileSync('python', [path.resolve(__dirname, '../lessons/build.py'), 'sample'], { stdio: 'inherit' });
  let fails = 0, n = 0;
  const check = (ok, msg) => { n++; console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
  (async () => {
    const B = await launch();
    try { await run(B, fileUrl(path.resolve(__dirname, '../site/lessons/sample.html')), check); } finally { await B.close(); }
    console.log(fails ? `FAILED: ${fails} of ${n} checks` : `OK: ${n} checks`);
    process.exit(fails ? 1 : 0);
  })().catch((e) => { console.error(e); process.exit(1); });
}
