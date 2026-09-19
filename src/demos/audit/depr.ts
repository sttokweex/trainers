/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const depr: LegacyDemo = root => {
  const { form, out } = calcShell(root, 'Три способа амортизации по ФСБУ 6/2020');
  const cost = dField(form, 'Первоначальная стоимость, ₽', 1000000, { step:50000 });
  const lv = dField(form, 'Ликвидационная стоимость, ₽', 100000, { step:10000 });
  const spi = dField(form, 'Срок полезного использования, лет', 5, { step:1, min:1, max:15 });
  const kf = dField(form, 'Коэффициент для способа уменьшаемого остатка', 2, { step:0.5 });
  const k = dEl('div', 'kpis'); out.appendChild(k);
  const chart = dEl('div'); out.appendChild(chart);
  const tbl = dEl('div'); out.appendChild(tbl);
  const note = dEl('div', 'demo-note'); out.appendChild(note);
  function calc(){
    const C = num(cost), L = num(lv), N = Math.max(1, Math.round(num(spi))), K = num(kf);
    const dep = C - L;
    /* профиль выпуска для способа «пропорционально продукции»: отдача падает */
    const prof = []; for (let i = 0; i < N; i++) prof.push(N - i);
    const profSum = prof.reduce((a, b) => a + b, 0);
    const lin = [], red = [], unt = [];
    let bvR = C;
    for (let y = 0; y < N; y++){
      lin.push(dep / N);
      const a = (bvR - L) * K / (N - y);
      const amt = Math.max(0, Math.min(a, bvR - L));
      red.push(amt); bvR -= amt;
      unt.push(dep * prof[y] / profSum);
    }
    const resid = arr => { let b = C; return [C].concat(arr.map(a => (b -= a))) };
    const xs = ['0'].concat(lin.map((_, i) => (i + 1) + ' г.'));
    chart.innerHTML = '';
    chart.appendChild(dEl('h6', null, 'Остаточная стоимость по годам'));
    lineC(chart, { h:230, xLabels:xs, min:0, max:C * 1.05, tick: v => th(v), fmt: v => money(v),
      series:[
        { name:'Линейный', color:'var(--s1)', values:resid(lin) },
        { name:'Уменьшаемого остатка', color:'var(--s2)', values:resid(red) },
        { name:'Пропорц. продукции', color:'var(--s3)', values:resid(unt) },
      ] });
    tbl.innerHTML = '';
    const tb = dEl('table', 'tbl');
    tb.innerHTML = '<tr><th>Год</th><th>Линейный</th><th>Уменьшаемого остатка</th><th>Пропорц. продукции</th></tr>';
    for (let y = 0; y < N; y++){
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>' + (y + 1) + '</td><td class="n">' + fmt(lin[y]) + '</td><td class="n">' + fmt(red[y]) +
        '</td><td class="n">' + fmt(unt[y]) + '</td>';
      tb.appendChild(tr);
    }
    const tot = document.createElement('tr');
    tot.className = 'hl';
    tot.innerHTML = '<td><b>Итого</b></td><td class="n"><b>' + fmt(lin.reduce((a, b) => a + b, 0)) + '</b></td><td class="n"><b>' +
      fmt(red.reduce((a, b) => a + b, 0)) + '</b></td><td class="n"><b>' + fmt(unt.reduce((a, b) => a + b, 0)) + '</b></td>';
    tb.appendChild(tot);
    tbl.appendChild(tb);
    k.innerHTML = '';
    kpi(k, 'Амортизируемая величина', money(dep), 'стоимость − ликвидационная стоимость', 'acc');
    kpi(k, 'Расход 1-го года: линейный', money(lin[0]), 'равномерное распределение');
    kpi(k, 'Расход 1-го года: уменьшаемого остатка', money(red[0]), 'нагрузка смещена в начало', 'yel');
    note.innerHTML = 'Все три способа списывают <b>одну и ту же сумму</b> — разница только в распределении по годам, то есть в том, в каком году признан расход. ' +
      'Амортизация прекращается при достижении ликвидационной стоимости, а не нуля. Проверяя участок, пересчитайте амортизацию по всему реестру: ' +
      'это полностью воспроизводимая процедура, и расхождение с расчётом клиента почти всегда означает ошибку в СПИ, дате ввода или в ликвидационной стоимости.';
  }
  bindAll(form, calc);
}
