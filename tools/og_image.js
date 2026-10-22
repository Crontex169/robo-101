// Link-preview image 1200×630 for messengers and social networks: site/assets/og.png.
const { launch, sleep } = require('./cdp');
const fs = require('fs'), path = require('path');
const fonts = 'file:///' + path.resolve(__dirname, '../site/assets/fonts/fonts.css').replace(/\\/g, '/');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="${fonts}">
<style>
html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
body { background: #f6f5f1; font-family: Inter, system-ui, sans-serif; color: #0b0b0b; position: relative; }
.bar { position: absolute; left: 0; top: 0; width: 100%; height: 10px; background: linear-gradient(90deg, #2a78d6, #4a3aa7, #eb6834); }
.box { position: absolute; left: 88px; right: 430px; top: 112px; }
.kicker { font-size: 26px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #6b6a65; margin-bottom: 26px; }
h1 { font-size: 92px; line-height: 1.02; font-weight: 820; letter-spacing: -0.035em; margin: 0 0 30px; }
p { font-size: 32px; line-height: 1.4; color: #3d3c38; margin: 0; }
svg { position: absolute; right: 70px; top: 150px; width: 340px; }
.foot { position: absolute; left: 88px; right: 88px; bottom: 64px; font-size: 26px; color: #6b6a65; font-weight: 600; }
</style></head><body><div class="bar"></div>
<div class="box"><div class="kicker">Free interactive course</div><h1>Kinematics<br>Workshop</h1>
<p>Robot arm kinematics from zero, with live labs in your browser.</p></div>
<svg viewBox="0 0 420 360"><line x1="80" y1="300" x2="170" y2="150" stroke="#2a78d6" stroke-width="16" stroke-linecap="round"/>
<line x1="170" y1="150" x2="290" y2="130" stroke="#4a3aa7" stroke-width="13" stroke-linecap="round"/>
<line x1="290" y1="130" x2="334" y2="100" stroke="#eb6834" stroke-width="10" stroke-linecap="round"/>
<rect x="56" y="300" width="48" height="16" rx="4" fill="#6b6a65"/>
<circle cx="80" cy="300" r="10" fill="#fff" stroke="#0b0b0b" stroke-width="3"/><circle cx="170" cy="150" r="9" fill="#fff" stroke="#0b0b0b" stroke-width="3"/><circle cx="290" cy="130" r="8" fill="#fff" stroke="#0b0b0b" stroke-width="3"/></svg>
<div class="foot">Frames · Forward and inverse kinematics · The Jacobian</div></body></html>`;
(async () => {
  fs.mkdirSync(path.resolve(__dirname, '../shots'), { recursive: true });
  const tmp = path.resolve(__dirname, '../shots/og-card.html'); fs.writeFileSync(tmp, html);
  const B = await launch({ w: 1200, h: 630 });
  const p = await B.page('file:///' + tmp.replace(/\\/g, '/'), { width: 1200, height: 630 });
  await p.waitFor('document.readyState === "complete" && document.fonts.status === "loaded"'); await sleep(400);
  const out = path.resolve(__dirname, '../site/assets/og.png');
  await p.shot(out); console.log('done:', out, fs.statSync(out).size, 'bytes');
  await B.close();
})().catch((e) => { console.error(e); process.exit(1); });
