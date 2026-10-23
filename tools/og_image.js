// Link-preview image 1200×630 for messengers and social networks: site/assets/og.png.
const { launch, sleep } = require('./cdp');
const fs = require('fs'), path = require('path');
const { pathToFileURL } = require('url');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<style>
html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
body { background: #f5f3ed; font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #222; position: relative; }
.box { position: absolute; left: 88px; right: 440px; top: 120px; }
h1 { font-size: 84px; line-height: 1.05; font-weight: 600; margin: 0 0 28px; }
p { font-size: 32px; line-height: 1.4; color: #333; margin: 0; }
svg { position: absolute; right: 80px; top: 150px; width: 320px; }
.foot { position: absolute; left: 88px; right: 88px; bottom: 60px; padding-top: 22px; border-top: 2px solid #dcd8ce; font-size: 26px; color: #666; }
</style></head><body>
<div class="box"><h1>Kinematics<br>Workshop</h1>
<p>Robot arm kinematics from zero, with live labs in your browser.</p></div>
<svg viewBox="0 0 420 360"><line x1="40" y1="300" x2="400" y2="300" stroke="#cbcbc6" stroke-width="1.5"/><line x1="80" y1="330" x2="80" y2="30" stroke="#cbcbc6" stroke-width="1.5"/>
<circle cx="338" cy="96" r="18" fill="none" stroke="#0ca30c" stroke-width="2.5" stroke-dasharray="5 4"/>
<line x1="80" y1="300" x2="170" y2="150" stroke="#2a78d6" stroke-width="14" stroke-linecap="round"/>
<line x1="170" y1="150" x2="290" y2="130" stroke="#4a3aa7" stroke-width="11" stroke-linecap="round"/>
<line x1="290" y1="130" x2="334" y2="100" stroke="#eb6834" stroke-width="8" stroke-linecap="round"/>
<rect x="56" y="300" width="48" height="14" fill="#666"/>
<circle cx="80" cy="300" r="9" fill="#fff" stroke="#111" stroke-width="3"/><circle cx="170" cy="150" r="8" fill="#fff" stroke="#111" stroke-width="3"/><circle cx="290" cy="130" r="7" fill="#fff" stroke="#111" stroke-width="3"/></svg>
<div class="foot">Frames · Forward and inverse kinematics · The Jacobian</div></body></html>`;
(async () => {
  fs.mkdirSync(path.resolve(__dirname, '../shots'), { recursive: true });
  const tmp = path.resolve(__dirname, '../shots/og-card.html'); fs.writeFileSync(tmp, html);
  const B = await launch({ w: 1200, h: 630 });
  const p = await B.page(pathToFileURL(tmp).href, { width: 1200, height: 630 });
  await p.waitFor('document.readyState === "complete" '); await sleep(400);
  const out = path.resolve(__dirname, '../site/assets/og.png');
  await p.shot(out); console.log('done:', out, fs.statSync(out).size, 'bytes');
  await B.close();
})().catch((e) => { console.error(e); process.exit(1); });
