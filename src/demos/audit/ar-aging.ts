/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const arAging: LegacyDemo = root => {
  const { form, out } = calcShell(root, 'Матрица старения дебиторской задолженности',
    'Классический подход к оценке резерва: процент резервирования растёт со сроком просрочки. Проценты обосновываются статистикой погашения прошлых лет — их нельзя брать «с потолка».');
  const B = [
    { n:'Не просрочена', v:186000000, r:0 },
    { n:'1–30 дней', v:62000000, r:2 },
    { n:'31–90 дней', v:41000000, r:10 },
    { n:'91–180 дней', v:28000000, r:30 },
    { n:'181–365 дней', v:19000000, r:60 },
    { n:'Более года', v:14000000, r:100 },
  ];
  const rows = [];
  const tb = dEl('table', 'tbl');
  tb.innerHTML = '<tr><th>Срок</th><th>Сумма, ₽</th><th>% резерва</th><th>Резерв, ₽</th></tr>';
  B.forEach(b => {
    const tr = document.createElement('tr');
    const td0 = document.createElement('td'); td0.textContent = b.n;
    const td1 = document.createElement('td'), td2 = document.createElement('td'), td3 = document.createElement('td');
    const i1 = document.createElement('input'), i2 = document.createElement('input');
    i1.type = 'number'; i1.value = b.v; i2.type = 'number'; i2.value = b.r;
    td1.appendChild(i1); td2.appendChild(i2); td3.className = 'n';
    tr.appendChild(td0); tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
    tb.appendChild(tr);
    rows.push({ b, i1, i2, td3 });
  });
  form.appendChild(tb);
  const k = dEl('div', 'kpis'); out.appendChild(k);
  const chart = dEl('div'); out.appendChild(chart);
  const note = dEl('div', 'demo-note'); out.appendChild(note);
  function calc(){
    let tot = 0, res = 0;
    rows.forEach(r => {
      const v = parseFloat(r.i1.value) || 0, p = parseFloat(r.i2.value) || 0;
      const x = v * p / 100;
      tot += v; res += x;
      r.td3.textContent = fmt(x);
    });
    k.innerHTML = '';
    kpi(k, 'Дебиторская задолженность', money(tot), 'до резерва');
    kpi(k, 'Резерв по сомнительным долгам', money(res), 'Дт 91.2 Кт 63', 'red');
    kpi(k, 'В балансе (нетто)', money(tot - res), 'ожидаемая к получению сумма', 'acc');
    kpi(k, 'Доля резерва', pct(res / Math.max(1, tot) * 100), 'сравните с прошлым годом и с отраслью', 'yel');
    chart.innerHTML = '';
    barsV(chart, { h:220, xLabels:rows.map(r => r.b.n), tick: v => th(v), fmt: v => money(v),
      series:[
        { name:'Задолженность', color:'var(--s1)', values:rows.map(r => parseFloat(r.i1.value) || 0) },
        { name:'Резерв', color:'var(--s2)', values:rows.map(r => (parseFloat(r.i1.value) || 0) * (parseFloat(r.i2.value) || 0) / 100) },
      ] });
    note.innerHTML = 'Что проверяет аудитор: <b>корректность самого распределения по срокам</b> (частая ошибка — задолженность «молодеет» из-за перезачётов и новых отгрузок), ' +
      'обоснованность процентов, наличие обеспечения, а также <b>индивидуальный анализ</b> крупных должников — по ним матрица не работает, нужна оценка конкретной ситуации. ' +
      'Резерв в бухучёте обязателен при наличии признаков сомнительности и не совпадает с налоговым резервом по статье 266 НК — отсюда временные разницы по ПБУ 18/02.';
  }
  bindAll(form, calc);
}
