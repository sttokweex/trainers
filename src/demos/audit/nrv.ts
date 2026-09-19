/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const nrv: LegacyDemo = root => {
  const { form, out } = calcShell(root, 'Тест на обесценение запасов: чистая стоимость продажи',
    'Запасы оцениваются по наименьшей из двух величин: фактическая себестоимость и ЧСП. Меняйте ожидаемые цены — резерв пересчитается.');
  const POS = [
    { n:'Товар А (ходовой)', c:1200000, q:'текущая цена выше закупки', price:1500000, sell:60000 },
    { n:'Товар Б (сезонный, остаток)', c:800000, q:'сезон прошёл, распродажа', price:700000, sell:50000 },
    { n:'Товар В (снят с производства)', c:450000, q:'ликвидация остатков', price:300000, sell:40000 },
    { n:'Материалы Г', c:2000000, q:'используются в производстве', price:2400000, sell:80000 },
  ];
  const inputs = [];
  const tb = dEl('table', 'tbl');
  tb.innerHTML = '<tr><th>Позиция</th><th>Себестоимость</th><th>Ожидаемая цена продажи</th><th>Затраты на продажу</th><th>ЧСП</th><th>Резерв</th></tr>';
  POS.forEach((p, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' + p.n + '<br><span style="color:var(--mut2)">' + p.q + '</span></td><td class="n">' + fmt(p.c) + '</td>';
    const td1 = document.createElement('td'), td2 = document.createElement('td');
    const i1 = document.createElement('input'), i2 = document.createElement('input');
    i1.type = 'number'; i1.value = p.price; i2.type = 'number'; i2.value = p.sell;
    td1.appendChild(i1); td2.appendChild(i2);
    tr.appendChild(td1); tr.appendChild(td2);
    const tdN = document.createElement('td'), tdR = document.createElement('td');
    tdN.className = 'n'; tdR.className = 'n';
    tr.appendChild(tdN); tr.appendChild(tdR);
    tb.appendChild(tr);
    inputs.push({ p, i1, i2, tdN, tdR, tr });
  });
  form.appendChild(tb);
  const k = dEl('div', 'kpis'); out.appendChild(k);
  const note = dEl('div', 'demo-note'); out.appendChild(note);
  function calc(){
    let total = 0, cost = 0;
    inputs.forEach(x => {
      const nrv = (parseFloat(x.i1.value) || 0) - (parseFloat(x.i2.value) || 0);
      const res = Math.max(0, x.p.c - nrv);
      total += res; cost += x.p.c;
      x.tdN.textContent = fmt(nrv);
      x.tdR.textContent = res > 0 ? fmt(res) : '—';
      x.tr.className = res > 0 ? 'bad' : '';
    });
    k.innerHTML = '';
    kpi(k, 'Себестоимость запасов', money(cost), 'до обесценения');
    kpi(k, 'Резерв под обесценение', money(total), 'Дт 90.2 (или 91.2) Кт 14', total > 0 ? 'red' : 'grn');
    kpi(k, 'Балансовая стоимость запасов', money(cost - total), 'показывается в балансе нетто', 'acc');
    note.innerHTML = 'Резерв считается <b>по каждой позиции или однородной группе</b>, а не по запасам в целом: превышение ЧСП над себестоимостью по ходовым товарам ' +
      '<b>не компенсирует</b> обесценение по неликвиду. Лучшее доказательство ЧСП — фактические цены продаж <b>после отчётной даты</b>: если в январе товар продан ниже себестоимости, ' +
      'на 31.12 он уже был обесценен.';
  }
  bindAll(form, calc);
  bindAll(out, calc);
}
