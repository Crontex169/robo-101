/* =====================================================================
   recall.js — warm-up at the start of a lesson: 2–3 questions on the
   previous lesson. Recalling from memory beats re-reading.
   Data lives in the lesson, in a script element with type="application/json" and id="recallData":
   { "n": "3.1", "title": "Denavit–Hartenberg parameters", "href": "3-1-dh-parameters.html",
     "q": [{ "q": "question", "o": ["option", ...], "a": 1, "e": "explanation",
             "sec": "dh", "secTitle": "section title" }] }
   The first lesson has no previous lesson: it sets "head" (the heading) and "miss" (the line
   shown after a wrong answer) instead, and its questions carry no "sec" links.
   The block renders into [data-recall]. Answers are not stored anywhere.
   ===================================================================== */
(function () {
  'use strict';
  const box = document.querySelector('[data-recall]'), src = document.getElementById('recallData');
  if (!box || !src) return;
  let D;
  try { D = JSON.parse(src.textContent); } catch (e) { return; }
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const head = el('div', 'rc-head');
  head.append(el('div', 'g-kicker', 'Warm-up'), el('h3', null, D.head || `Recall lesson ${D.n}: ${D.title}`),
    el('p', 'rc-sub', `${D.q.length} ${D.q.length === 1 ? 'question' : 'questions'} to connect the lessons. You can skip them and read on.`));
  box.append(head);
  const total = el('p', 'rc-total'); total.hidden = true;
  let answered = 0, right = 0;
  D.q.forEach((q, qi) => {
    const card = el('div', 'rc-q');
    card.append(el('div', 'rc-text', `${qi + 1}. ${q.q}`));
    const opts = el('div', 'rc-opts'), exp = el('div', 'rc-exp'); exp.hidden = true;
    // shuffle the options on every visit so the right answer is not always in the same place
    const order = q.o.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    order.forEach((oi) => {
      const o = q.o[oi];
      const b = el('button', 'rc-opt', o); b.type = 'button';
      b.addEventListener('click', () => {
        if (card.classList.contains('done')) return;
        card.classList.add('done');
        const ok = oi === q.a; answered++; if (ok) right++;
        b.classList.add(ok ? 'ok' : 'no');
        if (!ok) opts.children[order.indexOf(q.a)].classList.add('ok');
        [...opts.children].forEach((x) => { x.disabled = true; });
        exp.append(el('b', null, ok ? 'Correct. ' : 'Not quite. '), document.createTextNode(q.e + ' '));
        if (q.sec) { const a = el('a', null, `Section "${q.secTitle}" of lesson ${D.n} →`); a.href = `${D.href}#${q.sec}`; exp.append(a); }
        exp.hidden = false;
        if (answered === D.q.length) { total.textContent = `${right} of ${D.q.length} correct. ${right === D.q.length ? 'Ready to move on.' : (D.miss || 'If something slipped, the links lead to the right sections of the previous lesson.')}`; total.hidden = false; }
      });
      opts.append(b);
    });
    card.append(opts, exp);
    box.append(card);
  });
  box.append(total);
})();
