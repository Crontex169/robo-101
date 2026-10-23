/* =====================================================================
   check.js — shared engine for the "Checkpoint: Part N" pages: tasks from
   every lesson of the part, shuffled, and at the end a score per lesson and what to review.
   Types: multiple choice, "what happens next", ordering, a task on a scene (drawn
   by the part page itself: cfg.scene). Options are shuffled on every
   visit. The result goes into #quizScore ("Score: X of N").
   A finished checkpoint is marked in progress (kw-progress), like a lesson.
   Usage: PartCheck({ lessons, questions, scene, passText, expose }).
     lessons   — { '1.1': [title, lesson file], … } in the order of the score table;
     questions — [{ l, t: 'choice'|'predict'|'order'|'scene', q, o, a | items, e, sec, st }];
     scene(api) — the scene-task element; api: { k, card, isDone(), done(ok), hint(text) };
     passText  — result line when there are at most two mistakes; expose — name of window.__cN for checks.
   ===================================================================== */
window.PartCheck = function (cfg) {
  'use strict';
  const LESSON = cfg.lessons, Q = cfg.questions;
  const TYPE = { choice: 'Çoktan seçmeli', predict: 'Ne olur?', order: 'Sıralama', scene: 'Sahne üzerinde görev' };
  const N = Q.length, res = new Array(N).fill(null);
  const slug = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  const shuffle = (n) => { const o = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; };
  const link = (q) => `<a href="${LESSON[q.l][1]}#${q.sec}">Section "${q.st}" of lesson ${q.l} →</a>`;

  function done(k, ok, card) {
    if (res[k] !== null) return;
    res[k] = ok;
    const q = Q[k], exp = card.querySelector('.chk-exp');
    exp.innerHTML = `<b>${ok ? 'Doğru.' : 'Tam değil.'}</b> ${q.e} ${link(q)}`; exp.hidden = false;
    card.classList.add(ok ? 'right' : 'wrong');
    summary();
  }

  function choice(k, card) {
    const q = Q[k], box = h('div', { class: 'chk-opts' });
    shuffle(q.o.length).forEach((oi) => {
      const b = h('button', { type: 'button', class: 'chk-opt' }, q.o[oi]);
      b.addEventListener('click', () => {
        if (res[k] !== null) return;
        const ok = oi === q.a; b.classList.add(ok ? 'ok' : 'no');
        if (!ok) [...box.children].find((x) => x.textContent === q.o[q.a]).classList.add('ok');
        [...box.children].forEach((x) => { x.disabled = true; });
        done(k, ok, card);
      });
      box.append(b);
    });
    return box;
  }

  function order(k, card) {
    const q = Q[k], box = h('div', { class: 'chk-order' }), picked = [];
    const list = h('div', { class: 'chk-opts' }), reset = h('button', { type: 'button', class: 'g-restart' }, 'Sıralamayı baştan yap');
    const btns = shuffle(q.items.length).map((ii) => {
      const b = h('button', { type: 'button', class: 'chk-opt' }, h('span', { class: 'chk-n' }), q.items[ii]);
      b.addEventListener('click', () => {
        if (res[k] !== null || picked.includes(ii)) return;
        picked.push(ii); b.classList.add('picked'); b.querySelector('.chk-n').textContent = picked.length;
        if (picked.length === q.items.length) {
          const ok = picked.every((v, i) => v === i);
          btns.forEach((x) => { x.disabled = true; x.classList.add(+x.dataset.ii === picked.indexOf(+x.dataset.ii) ? 'ok' : 'no'); });
          if (!ok) card.querySelector('.chk-exp').before(h('p', { class: 'chk-right' }, 'Doğru sıra: ' + q.items.map((t, i) => `${i + 1}. ${t.split(':')[0]}`).join(' → ')));
          reset.hidden = true; done(k, ok, card);
        }
      });
      b.dataset.ii = ii; list.append(b); return b;
    });
    reset.addEventListener('click', () => { picked.length = 0; btns.forEach((x) => { x.classList.remove('picked'); x.querySelector('.chk-n').textContent = ''; }); });
    box.append(h('p', { class: 'chk-hint' }, 'Seçeneklere sırayla dokun: önce birinciye, sonra ikinciye…'), list, reset);
    return box;
  }

  function summary() {
    const n = res.filter((x) => x !== null).length, right = res.filter(Boolean).length;
    $('#chkWait').textContent = n < N ? `${N} görevden ${n} tanesi cevaplandı, ${right} doğru. Sonuç bütün görevler cevaplanınca görünür.` : '';
    if (n < N) return;
    $('#quizScore').textContent = `Puan: ${right} / ${N}. ${right >= N - 2 ? cfg.passText : 'Aşağıda tekrar etmeye değer ders bölümleri var.'}`;
    const by = {};
    Q.forEach((q, i) => { (by[q.l] = by[q.l] || [0, 0]); by[q.l][1]++; if (res[i]) by[q.l][0]++; });
    $('#chkTable').innerHTML = Object.keys(LESSON).map((l) => `<div class="chk-tr"><span>${l} ${LESSON[l][0]}</span><b>${by[l][0]} of ${by[l][1]}</b></div>`).join('');
    const wrong = Q.map((q, i) => (res[i] ? null : q)).filter(Boolean);
    $('#chkReview').innerHTML = wrong.length ? wrong.map((q) => `<li><a href="${LESSON[q.l][1]}#${q.sec}">${q.l} · ${q.st}</a><span>${q.q.length > 90 ? q.q.slice(0, 88) + '…' : q.q}</span></li>`).join('') : '<li><strong>Nothing to review</strong><span>Every task was answered correctly.</span></li>';
    $('#chkResult').hidden = false;
    try { // checkpoint passed: mark it in progress, like a finished lesson
      const d = JSON.parse(localStorage.getItem('kw-progress') || '{}') || {}, now = Math.round(Date.now() / 1000);
      d[slug] = Object.assign(d[slug] || { s: now }, { t: now, f: (d[slug] && d[slug].f) || now });
      localStorage.setItem('kw-progress', JSON.stringify(d));
    } catch (e) { /* private mode */ }
  }

  function render() {
    const list = $('#chkList'); list.innerHTML = ''; res.fill(null);
    Q.forEach((q, k) => {
      const card = h('div', { class: 'card chk-card', id: 'q' + (k + 1) });
      card.append(h('div', { class: 'chk-meta' }, `Görev ${k + 1} / ${N} · ${TYPE[q.t]} · ders ${q.l}`), h('p', { class: 'chk-q' }, q.q));
      const api = { k, card, isDone: () => res[k] !== null, done: (ok) => done(k, ok, card), hint: (t) => card.querySelector('.chk-exp').before(h('p', { class: 'chk-right' }, t)) };
      const exp = h('div', { class: 'chk-exp' }); exp.hidden = true;
      card.append(q.t === 'order' ? order(k, card) : q.t === 'scene' ? cfg.scene(api) : choice(k, card), exp);
      list.append(card);
    });
    $('#quizScore').textContent = ''; $('#chkResult').hidden = true; summary();
  }

  function initNav() {
    const links = $$('.toc a'), ids = links.map((a) => a.getAttribute('href').slice(1));
    const onScroll = () => {
      const doc = document.documentElement;
      $('#progress').style.width = (doc.scrollTop / Math.max(1, doc.scrollHeight - doc.clientHeight) * 100).toFixed(2) + '%';
      let cur = null; for (const id of ids) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < 140) cur = id; }
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
    };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  initTheme(); initNav(); render();
  $('#chkAgain').addEventListener('click', () => { render(); document.getElementById('tasks').scrollIntoView({ behavior: 'smooth' }); });
  if (cfg.expose) window[cfg.expose] = { Q, res };
};
