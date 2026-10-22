/* =====================================================================
   kit.js — shared helpers for interactive scenes: canvas sized for
   pixel density, theme colours, seeded randomness, mouse and touch
   dragging, and an animation loop that runs only while visible.
   ===================================================================== */
'use strict';
window.HeroDemos = window.HeroDemos || {};
window.HeroKit = (function () {
  const root = document.documentElement;
  const css = (n) => getComputedStyle(root).getPropertyValue(n).trim();
  const dark = () => root.dataset.theme === 'dark';
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Prepare a canvas: logical coordinates W×H, real resolution from its on-screen width.
   *  Returns the context and k, the number of logical units per screen pixel
   *  (so labels stay 12 px on any screen). */
  function fit(cv, W, H) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = cv.getBoundingClientRect().width || W;
    const pw = Math.round(cssW * dpr), ph = Math.round(cssW * dpr * H / W);
    if (cv.width !== pw || cv.height !== ph) { cv.width = pw; cv.height = ph; }
    const c = cv.getContext('2d');
    c.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0);
    return { c, k: W / cssW };
  }

  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function randn(r) { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }

  /** Dragging. hit(p) → object or null; move(obj, p); end(obj); tap(p) — a click that misses every object.
   *  Touching an object blocks page scrolling; touching elsewhere does not. */
  function drag(cv, W, H, o) {
    let cur = null, down = null;
    const pt = (x, y) => { const r = cv.getBoundingClientRect(); return { x: (x - r.left) / r.width * W, y: (y - r.top) / r.height * H }; };
    cv.addEventListener('touchstart', (e) => {
      const t = e.touches[0]; if (!t) return;
      const p = pt(t.clientX, t.clientY);
      if (o.hit(p) || (o.tapBlocksScroll && o.tapBlocksScroll(p))) e.preventDefault();
    }, { passive: false });
    cv.addEventListener('pointerdown', (e) => {
      const p = pt(e.clientX, e.clientY), obj = o.hit(p);
      down = p;
      if (obj) { cur = obj; cv.setPointerCapture(e.pointerId); cv.classList.add('grabbing'); if (o.start) o.start(cur, p); }
    });
    cv.addEventListener('pointermove', (e) => {
      const p = pt(e.clientX, e.clientY);
      if (cur) { o.move(cur, p); return; }
      if (e.pointerType === 'mouse') cv.style.cursor = o.hit(p) ? 'grab' : (o.tap ? (o.tapCursor || 'crosshair') : 'default');
    });
    const up = (e) => {
      const p = pt(e.clientX, e.clientY);
      if (cur) { const obj = cur; cur = null; cv.classList.remove('grabbing'); if (o.end) o.end(obj, p); }
      else if (down && o.tap && e.type === 'pointerup' && Math.hypot(p.x - down.x, p.y - down.y) < 12) o.tap(p);
      down = null;
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    return { get active() { return !!cur; } };
  }

  /** Animation loop that runs only while the element is visible on screen. */
  function loop(el, frame) {
    let vis = false, raf = 0, alive = true, last = 0;
    const tick = (now) => {
      raf = 0; if (!alive || !vis) return;
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      try { frame(dt, now); } catch (e) { console.error(e); } // a failing frame must not stop the loop
      if (vis && alive) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((es) => { vis = es[es.length - 1].isIntersecting; if (vis && !raf && alive) { last = 0; raf = requestAnimationFrame(tick); } });
    io.observe(el);
    return { stop() { alive = false; io.disconnect(); if (raf) cancelAnimationFrame(raf); } };
  }

  /** Canvas labels: font size is given in screen pixels. */
  function font(c, k, px, weight, mono) {
    c.font = `${weight || 600} ${px * k}px ${mono ? '"JetBrains Mono", ui-monospace, Menlo, monospace' : 'Inter, system-ui, -apple-system, sans-serif'}`;
  }
  /** Text on a background-coloured plate, so the label reads over lines. */
  function label(c, k, text, x, y, o) {
    o = o || {};
    font(c, k, o.px || 12, o.weight, o.mono);
    c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
    if (o.halo !== false) { c.lineJoin = 'round'; c.lineWidth = 4 * k; c.strokeStyle = o.haloColor || css('--surface'); c.strokeText(text, x, y); }
    c.fillStyle = o.color || css('--ink-2'); c.fillText(text, x, y);
  }
  function grid(c, W, H, step, color) {
    c.strokeStyle = color; c.lineWidth = 1;
    c.beginPath();
    for (let x = step; x < W; x += step) { c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, H); }
    for (let y = step; y < H; y += step) { c.moveTo(0, y + 0.5); c.lineTo(W, y + 0.5); }
    c.stroke();
  }
  /** 45° hatching inside the current path (for obstacles). */
  function hatch(c, x0, y0, x1, y1, color, gap, lw) {
    c.save(); c.clip(); c.strokeStyle = color; c.lineWidth = lw || 1.2; c.beginPath();
    const h = y1 - y0;
    for (let x = x0 - h; x < x1; x += gap) { c.moveTo(x, y1); c.lineTo(x + h, y0); }
    c.stroke(); c.restore();
  }
  function cross(c, x, y, r, color, lw) { c.strokeStyle = color; c.lineWidth = lw || 2.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - r, y - r); c.lineTo(x + r, y + r); c.moveTo(x + r, y - r); c.lineTo(x - r, y + r); c.stroke(); }
  function check(c, x, y, r, color, lw) { c.strokeStyle = color; c.lineWidth = lw || 2.4; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x - r, y); c.lineTo(x - r * 0.3, y + r * 0.7); c.lineTo(x + r, y - r * 0.7); c.stroke(); }
  function onTheme(fn) { const mo = new MutationObserver(fn); mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] }); return () => mo.disconnect(); }
  function el(tag, attrs, html) { const e = document.createElement(tag); if (attrs) for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (html != null) e.innerHTML = html; return e; }

  return { css, dark, reduced, fit, rng, randn, drag, loop, font, label, grid, hatch, cross, check, onTheme, el };
})();
