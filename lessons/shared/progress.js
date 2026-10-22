/* =====================================================================
   progress.js — course progress in this browser.
   A lesson is marked started when opened and completed (f) when the
   reader reaches the wrap-up section (#finale). The furthest section
   is remembered too, so the home page can offer "Continue" from there.
   Everything lives only in localStorage (key kw-progress) and is never
   sent anywhere. The home page reads the same key (site/index.src.html).
   ===================================================================== */
(function () {
  'use strict';
  const KEY = 'kw-progress';
  const page = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  if (!page) return;
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } };
  const write = (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* private mode: progress is not saved */ } };
  const update = (fn) => { const d = read(); const me = d[page] || {}; fn(me); d[page] = me; write(d); };
  const now = () => Math.round(Date.now() / 1000);
  update((me) => { me.t = now(); if (!me.s) me.s = me.t; });
  const secs = [...document.querySelectorAll('section[id]')].map((s) => s.id);
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((list) => list.forEach((e) => {
    if (!e.isIntersecting) return;
    const id = e.target.id, i = secs.indexOf(id);
    io.unobserve(e.target);
    update((me) => {
      if (i > (me.i == null ? -1 : me.i)) { me.i = i; me.sec = id; }
      if (id === 'finale' && !me.f) me.f = now();
    });
  }), { rootMargin: '0px 0px -40% 0px' });
  document.querySelectorAll('section[id]').forEach((s) => io.observe(s));
})();
