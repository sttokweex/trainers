/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const plBuild: LegacyDemo = root => {
  const { form, out } = calcShell(root, 'Соберите отчёт о финансовых результатах',
    'Введите показатели — увидите, как формируются четыре уровня прибыли и что происходит с маржинальностью.');
  const rev = dField(form, 'Выручка (без НДС), ₽', 100000000, { step:1000000 });
  const cogs = dField(form, 'Себестоимость продаж, ₽', 68000000, { step:1000000 });
  const sell = dField(form, 'Коммерческие расходы, ₽', 9000000, { step:500000 });
  const adm = dField(form, 'Управленческие расходы, ₽', 14000000, { step:500000 });
  const oth = dField(form, 'Прочие доходы, ₽', 2200000, { step:100000 });
  const othx = dField(form, 'Прочие расходы, ₽', 4100000, { step:100000 });
  const int2 = dField(form, 'Проценты к уплате, ₽', 3400000, { step:100000 });
  const tax = dField(form, 'Ставка налога на прибыль, %', 25, { step:1 });
  const tbl = dEl('div'); out.appendChild(tbl);
  const chart = dEl('div'); out.appendChild(chart);
  const note = dEl('div', 'demo-note'); out.appendChild(note);
  function calc(){
    const R = num(rev), gross = R - num(cogs), sales = gross - num(sell) - num(adm);
    const pbt = sales + num(oth) - num(othx) - num(int2);
    const t = Math.max(0, pbt) * num(tax) / 100, np = pbt - t;
    tbl.innerHTML = '';
    const tb = dEl('table', 'tbl');
    const row = (n, v, hl) => '<tr' + (hl ? ' class="hl"' : '') + '><td>' + n + '</td><td class="n">' + fmt(v) + '</td><td class="n">' +
      (R ? pct(v / R * 100) : '—') + '</td></tr>';
    tb.innerHTML = '<tr><th>Показатель</th><th>Сумма, ₽</th><th>% к выручке</th></tr>' +
      row('Выручка', R) + row('Себестоимость продаж', -num(cogs)) + row('Валовая прибыль', gross, 1) +
      row('Коммерческие расходы', -num(sell)) + row('Управленческие расходы', -num(adm)) +
      row('Прибыль от продаж', sales, 1) +
      row('Прочие доходы', num(oth)) + row('Прочие расходы', -num(othx)) + row('Проценты к уплате', -num(int2)) +
      row('Прибыль до налогообложения', pbt, 1) + row('Налог на прибыль', -t) + row('Чистая прибыль', np, 1);
    tbl.appendChild(tb);
    chart.innerHTML = '';
    chart.appendChild(dEl('h6', null, 'Маржинальность на каждом уровне'));
    barsH(chart, { padL:200, rowH:32, data:[
      { label:'Валовая маржа', value:+(gross / R * 100).toFixed(1), color:'var(--s1)', note:'выручка минус себестоимость' },
      { label:'Маржа от продаж', value:+(sales / R * 100).toFixed(1), color:'var(--s3)', note:'после коммерческих и управленческих расходов' },
      { label:'Маржа до налогообложения', value:+(pbt / R * 100).toFixed(1), color:'var(--s4)', note:'после прочих и процентов' },
      { label:'Чистая маржа', value:+(np / R * 100).toFixed(1), color:'var(--s2)', note:'итог для собственника' },
    ], fmt: v => fmt(v, 1) + '%' });
    note.innerHTML = 'Разрывы между уровнями показывают, где «теряется» прибыль. Аудитора интересует <b>стабильность этих долей год к году</b>: ' +
      'скачок валовой маржи без изменения бизнес-модели чаще всего означает не рост эффективности, а ошибку — неверный cut-off себестоимости, ' +
      'перенос расходов между статьями, завышение остатка запасов или незакрытое незавершённое производство.';
  }
  bindAll(form, calc);
}
