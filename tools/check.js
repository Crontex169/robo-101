// The pre-publish check: one command, run before every publish (and by the Pages workflow).
//  1. builds the real site into dist/ (fails on an unbuilt published page, a broken link or Cyrillic text)
//  2. builds the check variant into dist-check/ (tools/fixtures/config.check.json publishes the sample as M.1)
//  3. plays the sample lesson in a headless browser (tools/lesson_sample.js)
//  4. the home page: available vs coming soon, progress after visiting the sample, theme toggle
//  5. the glossary page of the real build shows its empty state
//  6. every page fits a 390 px phone without horizontal scrolling
// Prints ✓/✗ per check and exits non-zero on any failure. Screenshots go to shots/.
const path = require('path');
const { spawnSync } = require('child_process');
const { launch, sleep } = require('./cdp');
const sample = require('./lesson_sample');

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

    console.log('Home page');
    const home = await B.page(fileUrl('dist-check/index.html'), { width: 1280, height: 900, light: true });
    await home.waitFor("document.querySelectorAll('#parts li').length > 0");
    const st = await home.eval(`(() => { const li = [...document.querySelectorAll('#parts li')];
      const m1 = li.find((x) => x.dataset.n === 'M.1');
      return { m1: m1.dataset.state, link: !!m1.querySelector('a'), others: li.filter((x) => x !== m1).every((x) => x.dataset.state === 'soon' && !x.querySelector('a')), total: li.length }; })()`);
    check(st.link, 'M.1 (the sample in the check build) is a link');
    check(st.m1 === 'started' || st.m1 === 'completed', `M.1 shows progress from the visit: ${st.m1}`);
    check(st.others, `the other ${st.total - 1} program entries say "Coming soon" and aren't links`);
    await home.shot(shot('home-light.png'));
    await home.click('#themeBtn');
    const t1 = await home.eval('document.documentElement.dataset.theme');
    await home.S('Page.reload'); await sleep(300);
    await home.waitFor("document.readyState === 'complete'");
    const t2 = await home.eval('document.documentElement.dataset.theme');
    check(t1 === 'dark' && t2 === 'dark', `theme toggle persists after reload (${t1} → ${t2})`);

    console.log('Glossary');
    const gl = await B.page(fileUrl('dist/lessons/glossary.html'), { width: 1280, height: 900 });
    await gl.waitFor("document.readyState === 'complete'");
    check(await gl.eval("!document.getElementById('glEmpty').hidden && document.querySelectorAll('.gl-item').length === 0"), 'real build: the glossary shows its empty state');
    const glc = await B.page(fileUrl('dist-check/lessons/glossary.html'), { width: 1280, height: 900 });
    await glc.waitFor("document.readyState === 'complete'");
    check(await glc.eval("document.querySelectorAll('.gl-item').length === 2"), 'check build: the glossary lists the sample\'s 2 terms');

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
