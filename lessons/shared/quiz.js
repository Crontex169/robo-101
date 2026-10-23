/* =====================================================================
   quiz.js — the misconceptions quiz at the end of a lesson.
   Quiz.render('#quizBox', [{ q, o: [options], a: index, e: explanation }], '#quizScore')
   Each card takes one answer, marks it right or wrong, shows the right
   option and the explanation. Options are rotated per question (fixed,
   not random) so the right answer isn't always in the same place.
   Needs h, $, $$ from ui-core.js.
   ===================================================================== */
'use strict';
window.Quiz = {
  render(boxSel, Q, scoreSel) {
    this.last = Q; // read by the check scripts
    const box = $(boxSel); let answered = 0, correct = 0;
    Q.forEach((q, qi) => {
      const n = q.o.length, order = q.o.map((_, i) => (i + qi) % n);
      const card = h('div', { class: 'card q-card' }, h('h4', null, h('span', { class: 'qn' }, `${qi + 1}.`), h('span', null, q.q)));
      const opts = h('div', { class: 'q-opts' }), exp = h('div', { class: 'q-exp', hidden: true });
      order.forEach((oi) => {
        const b = h('button', { type: 'button', class: 'q-opt' }, q.o[oi]);
        b.addEventListener('click', () => {
          if (card.dataset.done) return; card.dataset.done = '1';
          const ok = oi === q.a; b.classList.add(ok ? 'correct' : 'incorrect');
          if (!ok) $$('.q-opt', opts)[order.indexOf(q.a)].classList.add('correct');
          exp.innerHTML = `<strong>${ok ? 'Doğru.' : 'Tam değil.'}</strong> ${q.e}`; exp.hidden = false;
          answered++; if (ok) correct++;
          $(scoreSel).textContent = answered === Q.length
            ? `Puan: ${correct} / ${Q.length}. ${correct >= Q.length - 2 ? 'Güzel, devam edebilirsin.' : 'Takıldığın bölümlere bir daha göz at.'}`
            : `${Q.length} sorudan ${answered} tanesi cevaplandı`;
        });
        opts.append(b);
      });
      card.append(opts, exp); box.append(card);
    });
  },
};
