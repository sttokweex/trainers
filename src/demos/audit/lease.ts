/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const lease: LegacyDemo = root => {
  const { form, out } = calcShell(root, 'Аренда: приведённая стоимость и график погашения');
  const pay = dField(form, 'Годовой арендный платёж, ₽', 1200000, { step:50000 });
  const yrs = dField(form, 'Срок аренды, лет', 5, { step:1, min:1, max:15 });
  const rate = dField(form, 'Ставка дисконтирования, % годовых', 14, { step:0.5 });
  const k = dEl('div', 'kpis'); out.appendChild(k);
  const chart = dEl('div'); out.appendChild(chart);
  const tbl = dEl('div'); out.appendChild(tbl);
  const note = dEl('div', 'demo-note'); out.appendChild(note);
  function calc(){
    const P = num(pay), N = Math.max(1, Math.round(num(yrs))), r = num(rate) / 100;
    const pv = r === 0 ? P * N : P * (1 - Math.pow(1 + r, -N)) / r;
    const amort = pv / N;
    let ob = pv;
    const rows = [], obl = [pv], rou = [pv];
    for (let y = 1; y <= N; y++){
      const int = ob * r, princ = P - int;
      ob = Math.max(0, ob - princ);
      rows.push({ y, open: obl[y - 1], int, pay:P, princ, close: ob, amort, total: amort + int });
      obl.push(ob); rou.push(Math.max(0, pv - amort * y));
    }
    k.innerHTML = '';
    kpi(k, 'Право пользования активом', money(pv), 'признаётся в внеоборотных активах', 'acc');
    kpi(k, 'Обязательство по аренде', money(pv), 'приведённая стоимость платежей', 'yel');
    kpi(k, 'Сумма платежей за срок', money(P * N), 'номинально');
    kpi(k, 'Процентный расход всего', money(P * N - pv), 'разница между номиналом и приведённой стоимостью', 'red');
    chart.innerHTML = '';
    chart.appendChild(dEl('h6', null, 'Балансовая стоимость по годам'));
    lineC(chart, { h:220, xLabels:['0'].concat(rows.map(r2 => r2.y + ' г.')), min:0, tick: v => th(v), fmt: v => money(v),
      series:[
        { name:'Обязательство', color:'var(--s2)', values:obl },
        { name:'ППА', color:'var(--s1)', values:rou },
      ] });
    tbl.innerHTML = '';
    const tb = dEl('table', 'tbl');
    tb.innerHTML = '<tr><th>Год</th><th>Обязательство на начало</th><th>Проценты</th><th>Платёж</th><th>Обязательство на конец</th><th>Амортизация ППА</th><th>Расход всего</th></tr>';
    rows.forEach(r2 => {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>' + r2.y + '</td><td class="n">' + fmt(r2.open) + '</td><td class="n">' + fmt(r2.int) +
        '</td><td class="n">' + fmt(r2.pay) + '</td><td class="n">' + fmt(r2.close) + '</td><td class="n">' + fmt(r2.amort) +
        '</td><td class="n">' + fmt(r2.total) + '</td>';
      tb.appendChild(tr);
    });
    tbl.appendChild(tb);
    note.innerHTML = 'Проводки: признание — <code class="i">Дт 08/ППА Кт 76.Аренда</code> на приведённую стоимость; ежегодно — <code class="i">Дт 20/26 Кт 02.ППА</code> (амортизация) и <code class="i">Дт 91.2 Кт 76.Аренда</code> (проценты); платёж — <code class="i">Дт 76.Аренда Кт 51</code>. ' +
      'Обратите внимание на <b>убывающий процентный расход</b>: суммарный расход первого года (' + money(rows[0].total) + ') заметно выше равномерного платежа (' + money(P) + '), а к концу срока — ниже. ' +
      'Занижение ставки дисконтирования завышает и актив, и обязательство, поэтому её обоснование — предмет отдельной проверки.';
  }
  bindAll(form, calc);
}
