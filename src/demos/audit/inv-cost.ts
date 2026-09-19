/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const invCost: LegacyDemo = root => {
  const { form, out } = calcShell(root, 'ФИФО и средняя себестоимость: что происходит с прибылью',
    'Партии поступления заданы; меняйте объём продажи и цену реализации.');
  const LOTS = [{ q:100, p:100 }, { q:150, p:120 }, { q:200, p:140 }];
  const sold = dField(form, 'Продано единиц', 300, { step:10, min:0, max:450 });
  const price = dField(form, 'Цена продажи за единицу, ₽', 190, { step:5 });
  const k = dEl('div', 'kpis'); out.appendChild(k);
  const tbl = dEl('div'); out.appendChild(tbl);
  const chart = dEl('div'); out.appendChild(chart);
  const note = dEl('div', 'demo-note'); out.appendChild(note);
  function calc(){
    const S = Math.min(450, Math.max(0, Math.round(num(sold))));
    const totalQ = LOTS.reduce((a, l) => a + l.q, 0), totalV = LOTS.reduce((a, l) => a + l.q * l.p, 0);
    let left = S, fifo = 0;
    LOTS.forEach(l => { const take = Math.min(left, l.q); fifo += take * l.p; left -= take });
    const avg = totalV / totalQ, avgCost = avg * S;
    const rev = S * num(price);
    tbl.innerHTML = '';
    const tb = dEl('table', 'tbl');
    tb.innerHTML = '<tr><th>Партия</th><th>Количество</th><th>Цена</th><th>Сумма</th></tr>' +
      LOTS.map((l, i) => '<tr><td>Поступление ' + (i + 1) + '</td><td class="n">' + fmt(l.q) + '</td><td class="n">' + fmt(l.p) +
        '</td><td class="n">' + fmt(l.q * l.p) + '</td></tr>').join('') +
      '<tr class="hl"><td><b>Итого</b></td><td class="n"><b>' + fmt(totalQ) + '</b></td><td class="n">средняя ' + fmt(avg, 2) +
      '</td><td class="n"><b>' + fmt(totalV) + '</b></td></tr>';
    tbl.appendChild(tb);
    k.innerHTML = '';
    kpi(k, 'Себестоимость продаж: ФИФО', money(fifo), 'списываются самые ранние партии', 'acc');
    kpi(k, 'Себестоимость продаж: средняя', money(avgCost), 'средняя цена ' + fmt(avg, 2) + ' ₽ за единицу', 'yel');
    kpi(k, 'Прибыль: ФИФО', money(rev - fifo), 'выручка ' + money(rev), 'grn');
    kpi(k, 'Прибыль: средняя', money(rev - avgCost), 'разница ' + money(Math.abs((rev - fifo) - (rev - avgCost))), 'grn');
    chart.innerHTML = '';
    barsV(chart, { h:200, xLabels:['Себестоимость', 'Остаток на складе', 'Валовая прибыль'],
      series:[
        { name:'ФИФО', color:'var(--s1)', values:[fifo, totalV - fifo, rev - fifo] },
        { name:'Средняя', color:'var(--s2)', values:[avgCost, totalV - avgCost, rev - avgCost] },
      ], fmt: v => money(v), tick: v => th(v) });
    note.innerHTML = 'При <b>растущих закупочных ценах</b> ФИФО даёт меньшую себестоимость и большую прибыль, а на складе остаются дорогие партии. ' +
      'Средняя сглаживает эффект. Метод выбирается в учётной политике и применяется <b>последовательно</b>: смена метода без изменения обстоятельств — ' +
      'изменение учётной политики с ретроспективным пересчётом, а не способ «улучшить» результат года. ЛИФО в российском учёте запрещён.';
  }
  bindAll(form, calc);
}
