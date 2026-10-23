// Plain-page scan (constitution Principle VII): finds the decorations a page must not have.
// Runs inside the page through cdp's p.eval and returns a list of offenders, empty when the page is plain:
//  - gradient or clipped text, uppercase labels, shadows on content, rounded content blocks (> 4 px),
//    gradient backgrounds, and any @font-face family other than KaTeX's.
// Controls (buttons, inputs, summary) may keep a radius up to 6 px and a focus ring; tiny status glyphs
// (≤ 24 px, e.g. the ✓ circles of mission criteria) may be round.
const EXPR = `(() => {
  const out = new Set();
  const control = (el) => el.matches('button, input, select, textarea, summary, label.hd-range, .btn, [role="button"]');
  const name = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
    (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/).join('.') : '');
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('svg, canvas, .katex, script, style')) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const glyph = r.width <= 24 && r.height <= 24;
    const cs = getComputedStyle(el);
    if (cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text') out.add(name(el) + ': clipped (gradient) text');
    if (cs.textTransform === 'uppercase' && el.textContent.trim().length > 3) out.add(name(el) + ': uppercase label');
    if (cs.boxShadow !== 'none' && !control(el) && !glyph) out.add(name(el) + ': box-shadow');
    const rad = Math.max(...['TopLeft', 'TopRight', 'BottomLeft', 'BottomRight'].map((k) => parseFloat(cs['border' + k + 'Radius']) || 0));
    if (!glyph && rad > (control(el) ? 6 : 4)) out.add(name(el) + ': border-radius ' + rad + 'px');
    if (/gradient\\(/.test(cs.backgroundImage) && !glyph && !control(el)) out.add(name(el) + ': gradient background');
  }
  for (const f of document.fonts) {
    const fam = f.family.replace(/["']/g, '');
    if (!/^KaTeX/.test(fam)) out.add('@font-face ' + fam);
  }
  return [...out];
})()`;

async function scan(page) { return page.eval(EXPR); }

module.exports = { scan };
