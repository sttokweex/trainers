/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const closeCycle: LegacyDemo = root => {
  const START = { '90.1':{d:0,k:12000000}, '90.2':{d:8400000,k:0}, '90.3':{d:2000000,k:0},
                  '26':{d:1500000,k:0}, '91.1':{d:0,k:300000}, '91.2':{d:500000,k:0},
                  '99':{d:0,k:0}, '84':{d:0,k:4200000}, '68':{d:0,k:0} };
  const STEPS = [
    { n:'Исходное состояние на 31 декабря', ops:[], note:'Субсчета 90 и 91 накопили обороты с начала года. Сальдо по синтетическим счетам 90 и 91 нулевое, но субсчета «наполнены».' },
    { n:'Списание общехозяйственных расходов', ops:[{d:'90.2',k:'26',s:1500000}], note:'При директ-костинге счёт 26 закрывается напрямую в себестоимость продаж. Альтернатива — распределение на 20, тогда расходы «оседают» в запасах.' },
    { n:'Закрытие счёта 90 «Продажи»', ops:[{d:'90.1',k:'99',s:12000000},{d:'99',k:'90.2',s:9900000},{d:'99',k:'90.3',s:2000000}], note:'Результат от обычных видов деятельности: 12 000 000 − 9 900 000 − 2 000 000 = 100 000 ₽ прибыли.' },
    { n:'Закрытие счёта 91 «Прочие доходы и расходы»', ops:[{d:'91.1',k:'99',s:300000},{d:'99',k:'91.2',s:500000}], note:'Прочая деятельность дала убыток 200 000 ₽. Итог на 99: 100 000 − 200 000 = −100 000 ₽.' },
    { n:'Начисление налога на прибыль', ops:[{d:'99',k:'68',s:0}], note:'Убыток по данным бухучёта — текущий налог в этом примере не начисляется, но в реальности налоговая база считается по главе 25 НК и может быть положительной даже при бухгалтерском убытке. Здесь же возникают ОНА/ОНО по ПБУ 18/02.' },
    { n:'Реформация баланса', ops:[{d:'84',k:'99',s:100000}], note:'Итог года переносится на счёт 84. Убыток уменьшает нераспределённую прибыль: 4 200 000 − 100 000 = 4 100 000 ₽. После реформации счёт 99 обнулён.' },
  ];
  mkSteps(root, 'Закрытие периода шаг за шагом', {
    steps: STEPS,
    render(panel, s, i){
      const st = JSON.parse(JSON.stringify(START));
      for (let j = 1; j <= i; j++) STEPS[j].ops.forEach(o => {
        if (!o.s) return;
        (st[o.d] = st[o.d] || {d:0,k:0}).d += o.s;
        (st[o.k] = st[o.k] || {d:0,k:0}).k += o.s;
      });
      panel.appendChild(dEl('h6', null, s.n));
      if (s.ops.length && s.ops[0].s){
        const pre = document.createElement('pre');
        pre.textContent = s.ops.filter(o => o.s).map(o => 'Дт ' + o.d + '  Кт ' + o.k + '   ' + fmt(o.s)).join('\n');
        panel.appendChild(pre);
      }
      const tb = dEl('table', 'tbl');
      tb.innerHTML = '<tr><th>Счёт</th><th>Оборот Дт</th><th>Оборот Кт</th><th>Сальдо</th></tr>';
      Object.keys(st).forEach(c => {
        const a = st[c], bal = a.d - a.k;
        const t = ACC[c] ? ACC[c].t : 'A';
        const shown = (t === 'A' || t === 'X') ? bal : -bal;
        const tr = document.createElement('tr');
        if (Math.abs(shown) > 0.5 && (c === '99' || c === '84')) tr.className = 'hl';
        tr.innerHTML = '<td>' + accLabel(c) + '</td><td class="n">' + fmt(a.d) + '</td><td class="n">' + fmt(a.k) +
          '</td><td class="n">' + (Math.abs(shown) < 0.5 ? '—' : fmt(shown)) + '</td>';
        tb.appendChild(tr);
      });
      panel.appendChild(tb);
    }
  });
}
