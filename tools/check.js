// The pre-publish check: one command, run before every publish (and by the Pages workflow).
//  1. builds the real site into dist/ (fails on an unbuilt published page, a broken link or Cyrillic text)
//  2. builds the check variant into dist-check/ (tools/fixtures/config.check.json publishes M.1 and,
//     as a fixture, the sample lesson as M.2)
//  3. plays every lesson in a headless browser (tools/lesson_*.js)
//  4. the home page: available vs coming soon, progress after visiting the lessons, theme toggle
//  5. the glossary pages list the terms of the published lessons
//  6. every page passes the plain-page scan (tools/plain_scan.js) in light and dark
//  7. every page fits a 390 px phone without horizontal scrolling
// Prints ✓/✗ per check and exits non-zero on any failure. Screenshots go to shots/.
const path = require('path');
const { spawnSync } = require('child_process');
const { launch, sleep } = require('./cdp');
const sample = require('./lesson_sample');
const m1 = require('./lesson_m1');
const m2 = require('./lesson_m2');
const m3 = require('./lesson_m3');
const fs = require('fs');

// What each build should show, derived from the published lists and the glossary (not hard-coded counts)
const readJSON = (f) => JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', f), 'utf-8'));
const LESSON_FILE = Object.fromEntries([...fs.readFileSync(path.resolve(__dirname, '../lessons/build.py'), 'utf-8').matchAll(/'(\w+)': \('([\w.-]+\.html)'/g)].map((m) => [m[1], m[2]]));
const published = (cfg) => readJSON(cfg).PUBLISHED.filter((p) => p.n !== 'G');
const termsOf = (cfg) => { const files = new Set(published(cfg).map((p) => path.basename(p.file))); return readJSON('lessons/shared/glossary.json').filter((g) => files.has(LESSON_FILE[g.l])).length; };
const plain = require('./plain_scan');

const ROOT = path.resolve(__dirname, '..');
const fileUrl = (p) => require('url').pathToFileURL(path.resolve(ROOT, p)).href;
const shot = (n) => path.resolve(ROOT, 'shots', n);
const PY = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
let fails = 0, n = 0;
const check = (ok, msg) => { n++; console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const finish = () => { console.log(fails ? `FAILED: ${fails} of ${n} checks` : `OK: ${n} checks`); process.exit(fails ? 1 : 0); };

function assemble(out, config) {
  const env = Object.assign({}, process.env, config ? { KW_CONFIG: config } : {});
  const r = spawnSync(PY, [path.join(ROOT, 'tools/assemble.py'), out], { cwd: ROOT, env, encoding: 'utf-8' });
  const msg = (r.stdout + r.stderr).trim().split('\n').pop();
  check(r.status === 0, `build ${out}/: ${r.status === 0 ? msg : (r.stderr || r.stdout).trim()}`);
  return r.status === 0;
}

(async () => {
  console.log('Build');
  if (!assemble('dist')) return finish();
  if (!assemble('dist-check', 'tools/fixtures/config.check.json')) return finish();

  let B;
  try { B = await launch(); } catch (e) { check(false, `browser: ${e.message}`); return finish(); }
  try {
    console.log('Sample lesson');
    await sample.run(B, fileUrl('dist-check/lessons/sample.html'), check);

    console.log('Lesson M.1');
    await m1.run(B, fileUrl('dist-check/lessons/m-1-vectors-and-frames.html'), check);

    console.log('Lesson M.2');
    await m2.run(B, fileUrl('dist-check/lessons/m-2-trigonometry.html'), check);

    console.log('Lesson M.3');
    await m3.run(B, fileUrl('dist-check/lessons/m-3-matrices-as-transformations.html'), check);

    console.log('Home page');
    const home = await B.page(fileUrl('dist-check/index.html'), { width: 1280, height: 900, light: true });
    await home.waitFor("document.querySelectorAll('#parts li').length > 0");
    const pubN = published('tools/fixtures/config.check.json').map((p) => p.n);
    const st = await home.eval(`(() => { const N = ${JSON.stringify(pubN)}, li = [...document.querySelectorAll('#parts li')];
      const pub = li.filter((x) => N.includes(x.dataset.n));
      return { states: pub.map((x) => x.dataset.state), link: pub.length === N.length && pub.every((x) => !!x.querySelector('a')), others: li.filter((x) => !pub.includes(x)).every((x) => x.dataset.state === 'soon' && !x.querySelector('a')), total: li.length }; })()`);
    check(st.link, `${pubN.join(', ')} (published in the check build) are links`);
    check(st.states.every((x) => x === 'started' || x === 'completed'), `${pubN.join(', ')} show progress from the visits: ${st.states.join(', ')}`);
    check(st.others, `the other ${st.total - pubN.length} program entries say "Coming soon" and aren't links`);
    await home.shot(shot('home-light.png'));
    const t0 = await home.eval("document.documentElement.dataset.theme || 'light'");
    await home.click('#themeBtn');
    const t1 = await home.eval('document.documentElement.dataset.theme');
    await home.S('Page.reload'); await sleep(300);
    await home.waitFor("document.readyState === 'complete'");
    const t2 = await home.eval('document.documentElement.dataset.theme');
    check(t1 !== t0 && t2 === t1, `theme toggle switches and persists after reload (${t0} → ${t1} → ${t2})`);

    console.log('Glossary');
    const gl = await B.page(fileUrl('dist/lessons/glossary.html'), { width: 1280, height: 900 });
    await gl.waitFor("document.readyState === 'complete'");
    const realN = termsOf('site/config.json');
    check(await gl.eval(realN ? `document.querySelectorAll('.gl-item').length === ${realN}` : "!document.getElementById('glEmpty').hidden && document.querySelectorAll('.gl-item').length === 0"),
      realN ? `real build: the glossary lists the ${realN} terms of the published lessons` : 'real build: the glossary shows its empty state');
    const glc = await B.page(fileUrl('dist-check/lessons/glossary.html'), { width: 1280, height: 900 });
    await glc.waitFor("document.readyState === 'complete'");
    const checkN = termsOf('tools/fixtures/config.check.json');
    check(await glc.eval(`document.querySelectorAll('.gl-item').length === ${checkN}`), `check build: the glossary lists ${checkN} terms`);

    console.log('Plain pages');
    for (const page of ['dist-check/index.html', 'dist-check/404.html', 'dist-check/lessons/glossary.html', 'dist-check/lessons/sample.html', 'dist-check/lessons/m-1-vectors-and-frames.html', 'dist-check/lessons/m-2-trigonometry.html', 'dist-check/lessons/m-3-matrices-as-transformations.html']) {
      for (const theme of ['light', 'dark']) {
        const pp = await B.page(fileUrl(page), { width: 1280, height: 900, [theme]: true });
        await pp.waitFor("document.readyState === 'complete'");
        await pp.eval(`document.documentElement.dataset.theme = '${theme}'`); await sleep(150); // the stored theme would win otherwise
        const bad = await plain.scan(pp);
        check(!bad.length, `plain scan: ${path.basename(page)} ${theme} — ${bad.length} offenders${bad.length ? ': ' + bad.slice(0, 6).join('; ') + (bad.length > 6 ? '; …' : '') : ''}`);
      }
    }

    console.log('Phone, 390 px');
    for (const page of ['dist-check/index.html', 'dist-check/lessons/glossary.html', 'dist-check/404.html']) {
      const m = await B.page(fileUrl(page), { width: 390, height: 844, mobile: true, dpr: 2 });
      await m.waitFor("document.readyState === 'complete'"); await sleep(150);
      const sw = await m.eval('document.documentElement.scrollWidth');
      check(sw <= 391, `${page}: page width ${sw} px`);
      if (page.endsWith('index.html')) await m.shot(shot('home-phone.png'));
    }
  } catch (e) {
    check(false, `unexpected error: ${e.message}`);
  } finally {
    await B.close();
  }
  finish();
})();
