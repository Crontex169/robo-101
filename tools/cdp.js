// Minimal headless Chrome/Edge driver over the DevTools Protocol (no external dependencies).
// Usage: const B = await launch(); const p = await B.page(url); await p.eval('...'); await p.shot('a.png');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** A Chromium-based browser: CHROME_PATH, then Chrome and Edge in the usual Windows places,
 *  then macOS Chrome, then google-chrome / chromium on PATH (Linux, CI). */
function findBrowser() {
  if (process.env.CHROME_PATH) {
    if (fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
    throw new Error(`CHROME_PATH points to a missing file: ${process.env.CHROME_PATH}`);
  }
  const roots = [process.env.ProgramFiles, process.env['ProgramFiles(x86)'], process.env.LOCALAPPDATA].filter(Boolean);
  const candidates = [
    ...roots.map((r) => path.join(r, 'Google', 'Chrome', 'Application', 'chrome.exe')),
    ...roots.map((r) => path.join(r, 'Microsoft', 'Edge', 'Application', 'msedge.exe')),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  for (const name of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    for (const dir of (process.env.PATH || '').split(path.delimiter)) {
      const p = path.join(dir, name);
      if (dir && fs.existsSync(p)) return p;
    }
  }
  throw new Error('No Chromium browser found; set CHROME_PATH to chrome.exe or msedge.exe');
}

function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ''; res.on('data', (c) => (d += c)); res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(e); } }); }).on('error', reject);
  });
}

class Conn {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.handlers = [];
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) { const { resolve, reject } = this.pending.get(msg.id); this.pending.delete(msg.id); msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result); }
      else this.handlers.forEach((h) => h(msg));
    });
  }
  send(method, params, sessionId) {
    const id = ++this.id;
    const payload = { id, method, params: params || {} };
    if (sessionId) payload.sessionId = sessionId;
    this.ws.send(JSON.stringify(payload));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
}

async function launch(opts) {
  opts = opts || {};
  const port = 9300 + Math.floor(Math.random() * 500);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rc-chrome-'));
  const args = ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', `--window-size=${opts.w || 1440},${opts.h || 1000}`];
  const proc = spawn(findBrowser(), args, { stdio: 'ignore' });
  let ver = null;
  for (let i = 0; i < 60 && !ver; i++) { await sleep(150); try { ver = await getJSON(`http://127.0.0.1:${port}/json/version`); } catch (e) { /* still starting */ } }
  if (!ver) throw new Error('The browser did not start');
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  const conn = new Conn(ws);
  return {
    conn,
    async page(url, vp) {
      vp = vp || { width: opts.w || 1440, height: opts.h || 1000 };
      const { targetId } = await conn.send('Target.createTarget', { url: 'about:blank' });
      const { sessionId } = await conn.send('Target.attachToTarget', { targetId, flatten: true });
      const logs = [];
      conn.handlers.push((m) => {
        if (m.sessionId !== sessionId) return;
        if (m.method === 'Runtime.consoleAPICalled') logs.push(`[${m.params.type}] ` + m.params.args.map((a) => a.value !== undefined ? a.value : a.description).join(' '));
        if (m.method === 'Runtime.exceptionThrown') logs.push('[exception] ' + (m.params.exceptionDetails.exception ? m.params.exceptionDetails.exception.description : m.params.exceptionDetails.text));
        if (m.method === 'Log.entryAdded') logs.push(`[log:${m.params.entry.level}] ${m.params.entry.text}`);
      });
      const S = (method, params) => conn.send(method, params, sessionId);
      await S('Runtime.enable'); await S('Log.enable'); await S('Page.enable');
      await S('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: vp.dpr || 1, mobile: !!vp.mobile });
      if (vp.dark || vp.light) await S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: vp.dark ? 'dark' : 'light' }] });
      await S('Page.navigate', { url });
      const p = {
        logs, S,
        async eval(expr, awaitPromise) {
          const r = await S('Runtime.evaluate', { expression: expr, awaitPromise: !!awaitPromise, returnByValue: true });
          if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception ? r.exceptionDetails.exception.description : r.exceptionDetails.text));
          return r.result.value;
        },
        async waitFor(expr, timeout) {
          const t0 = Date.now();
          while (Date.now() - t0 < (timeout || 20000)) { try { if (await p.eval(expr)) return true; } catch (e) { /* still loading */ } await sleep(150); }
          throw new Error('timeout: ' + expr);
        },
        async shot(file, clip) {
          const params = { format: 'png', captureBeyondViewport: !!clip };
          if (clip) params.clip = Object.assign({ scale: 1 }, clip);
          const r = await S('Page.captureScreenshot', params);
          fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
          return file;
        },
        // screenshot of one element by selector (scrolls to it first)
        async shotEl(file, sel, pad) {
          pad = pad || 0;
          const rect = await p.eval(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); const r0 = e.getBoundingClientRect(); window.scrollTo(0, r0.top + scrollY - 110); const r = e.getBoundingClientRect(); return {x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height}; })()`);
          await sleep(250);
          return p.shot(file, { x: Math.max(0, rect.x - pad), y: Math.max(0, rect.y - pad), width: rect.w + 2 * pad, height: rect.h + 2 * pad });
        },
        async click(sel) { return p.eval(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) throw new Error('no element ' + ${JSON.stringify(sel)}); e.click(); return true; })()`); },
      };
      return p;
    },
    async close() { try { await conn.send('Browser.close'); } catch (e) { /* already closed */ } proc.kill(); },
  };
}
module.exports = { launch, sleep, findBrowser };
