/* =====================================================================
   gl/ui-gl.js — the glossary page: every published term from
   shared/glossary.json (lessons/build.py fills in the data), search, a
   letter index, and jumping to #id from the lesson tooltips.
   ===================================================================== */
(function () {
  'use strict';
  const G = JSON.parse(document.getElementById('glAll').textContent);
  initTheme();
  const doc = document.documentElement;
  window.addEventListener('scroll', () => { $('#progress').style.width = (doc.scrollTop / Math.max(1, doc.scrollHeight - doc.clientHeight) * 100).toFixed(2) + '%'; }, { passive: true });
  if (!G.length) { $('#glEmpty').hidden = false; $('#glSearch').hidden = true; return; }
  const norm = (s) => s.toLowerCase();
  const first = (t) => { const c = t.trim()[0].toUpperCase(); return /[A-Z]/.test(c) ? c : '#'; };
  const items = G.slice().sort((a, b) => a.t.localeCompare(b.t, 'en'));
  const list = $('#glList'), abc = $('#glAbc');
  const groups = [];
  items.forEach((g) => { const L = first(g.t); let grp = groups[groups.length - 1]; if (!grp || grp.L !== L) { grp = { L, items: [] }; groups.push(grp); } grp.items.push(g); });
  groups.forEach((grp) => {
    const box = h('div', { class: 'gl-group', id: 'letter-' + grp.L }, h('div', { class: 'gl-letter' }, grp.L));
    grp.items.forEach((g) => {
      box.append(h('article', { class: 'card gl-item', id: g.id, 'data-s': norm([g.t, g.d].join(' ')) },
        h('h3', null, g.t), h('p', null, g.d),
        h('a', { class: 'gl-from', href: g.href }, `Lesson ${g.n}${g.st ? ` · ${g.st}` : ''} →`)));
    });
    list.append(box);
    abc.append(h('a', { href: '#letter-' + grp.L }, grp.L));
  });
  const q = $('#glQ'), count = $('#glCount');
  function filter() {
    const s = norm(q.value.trim()); let n = 0;
    $$('.gl-group').forEach((grp) => { let k = 0; $$('.gl-item', grp).forEach((it) => { const ok = !s || it.dataset.s.includes(s); it.hidden = !ok; if (ok) k++; }); grp.hidden = !k; n += k; });
    count.textContent = s ? `${n} of ${items.length}` : `${items.length} ${items.length === 1 ? 'term' : 'terms'}`;
    $('#glNone').hidden = n > 0;
  }
  q.addEventListener('input', filter); filter();
  function mark() { const id = decodeURIComponent(location.hash.slice(1)); const el = id && document.getElementById(id); if (el && el.classList.contains('gl-item')) { $$('.gl-item.hit').forEach((x) => x.classList.remove('hit')); el.classList.add('hit'); el.scrollIntoView({ block: 'center' }); } }
  window.addEventListener('hashchange', mark); mark();
})();
