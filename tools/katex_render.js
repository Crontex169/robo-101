// Lesson formulas are rendered at build time; the browser doesn't need KaTeX, only its styles and fonts (site/assets/katex).
// In a lesson source: \( … \) is an inline formula, \[ … \] a display formula.
// Reads HTML from stdin, writes to stdout. Leaves <script>, <style>, <pre>, <code>, <textarea> and comments untouched.
// A formula error stops the build and shows the formula.
const katex = require('./vendor/katex/katex.min.js');
const fs = require('fs');

const src = fs.readFileSync(0, 'utf8');
const name = process.argv[2] || 'lesson';
const PROTECT = /(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>|<textarea[\s\S]*?<\/textarea>|<!--[\s\S]*?-->)/gi;
const MACROS = {
  '\\T': '^{\\mathsf{T}}',
};
const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, '\u00a0').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
let count = 0;
function render(tex, displayMode) {
  try {
    count++;
    return katex.renderToString(decode(tex).trim(), {
      displayMode, throwOnError: true, macros: { ...MACROS },
      strict: (code) => (code === 'unicodeTextInMathMode' ? 'ignore' : 'warn'),
    });
  } catch (e) {
    console.error(`${name}: formula error in ${displayMode ? '\\[' : '\\('} ${tex.trim()} ${displayMode ? '\\]' : '\\)'}\n  ${e.message}`);
    process.exit(1);
  }
}
const out = src.split(PROTECT).map((part, i) => {
  if (i % 2 === 1) return part; // protected chunk
  return part
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, t) => render(t, true))
    // punctuation right after an inline formula must not wrap onto a new line
    .replace(/\\\(([\s\S]+?)\\\)([,.;:!?…)]+)?/g, (_, t, punct) => (punct ? `<span class="nobr">${render(t, false)}${punct}</span>` : render(t, false)));
}).join('');
process.stdout.write(out);
console.error(`${name}: ${count} formulas`);
