/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const musPick: LegacyDemo = root => {
  const { form, out } = calcShell(root, 'Отбор элементов методом MUS',
    'Единица отбора — рубль. Каждый элемент занимает на «денежной ленте» отрезок, равный своей сумме, поэтому крупные элементы попадают в выборку чаще, а элементы больше интервала — гарантированно.');
  const items = [
    { n:'ООО «Вектор»', v:12400000 }, { n:'АО «Стройресурс»', v:980000 }, { n:'ООО «Транс-Лайн»', v:3150000 },
    { n:'ИП Сидоров', v:120000 }, { n:'ООО «Мега-Торг»', v:7600000 }, { n:'АО «Прогресс»', v:2450000 },
    { n:'ООО «Сфера»', v:640000 }, { n:'ООО «Атлант»', v:5300000 }, { n:'АО «Импульс»', v:1870000 },
    { n:'ООО «Кварц»', v:430000 }, { n:'ООО «Ориент»', v:9100000 }, { n:'АО «Дельта»', v:2050000 },
  ];
  const interval = dField(form, 'Интервал выборки, ₽', 5000000, { step:500000 });
  const start = dField(form, 'Стартовая точка (случайное число в интервале), ₽', 1740000, { step:10000 });
  const out2 = dEl('div'); out.appendChild(out2);
  const note = dEl('div', 'demo-note'); out.appendChild(note);
  function calc(){
    const iv = Math.max(1, num(interval)), st = Math.min(num(start), iv);
    let cum = 0, hit = st, picked = 0;
    const tb = dEl('table', 'tbl');
    tb.innerHTML = '<tr><th>Контрагент</th><th>Сумма</th><th>Нарастающим итогом</th><th>Отбор</th></tr>';
    items.forEach(it => {
      const from = cum; cum += it.v;
      const marks = [];
      while (hit <= cum){ marks.push(hit); hit += iv }
      const tr = document.createElement('tr');
      if (marks.length){ tr.className = 'hl'; picked++ }
      tr.innerHTML = '<td>' + it.n + '</td><td class="n">' + fmt(it.v) + '</td><td class="n">' + fmt(cum) +
        '</td><td>' + (marks.length ? '✔ попал (' + marks.map(m => fmt(m)).join(', ') + ')' : '—') + '</td>';
      tb.appendChild(tr);
    });
    out2.innerHTML = '';
    out2.appendChild(tb);
    const big = items.filter(i => i.v >= iv).length;
    note.innerHTML = 'Отобрано <b>' + picked + '</b> элементов из ' + items.length + ' при совокупности ' + money(cum) +
      '. Элементов, превышающих интервал: <b>' + big + '</b> — они попадают в выборку автоматически, как бы ни легла стартовая точка. ' +
      'Если в таком элементе найдено искажение, оно берётся в фактической сумме; искажение в элементе меньше интервала <b>экстраполируется</b>: доля искажения × интервал.';
  }
  bindAll(form, calc);
}
