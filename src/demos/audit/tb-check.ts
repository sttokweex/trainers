/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const tbCheck: LegacyDemo = root => {
  const body = dShell(root, 'Оборотно-сальдовая ведомость: найдите ошибку');
  body.appendChild(dEl('div', 'demo-note',
    'Три встроенные проверки ОСВ: сальдо на начало сходится, обороты сходятся, сальдо на конец сходится. ' +
    'По каждой строке должно выполняться: <b>сальдо на конец = сальдо на начало + оборот Дт − оборот Кт</b>. Кликните строку, в которой ошибка.'));
  const R = [
    { c:'01', open:42000, d:6000, k:1200 }, { c:'02', open:-12400, d:900, k:4100 },
    { c:'10', open:8200, d:31000, k:29500 }, { c:'41', open:19800, d:74000, k:70300 },
    { c:'51', open:14000, d:212000, k:222000 }, { c:'60', open:-21000, d:96000, k:99400 },
    { c:'62', open:31000, d:212000, k:195000, wrong:46000 }, { c:'68', open:-3100, d:24000, k:25600 },
    { c:'70', open:-5500, d:42000, k:43200 }, { c:'80', open:-5000, d:0, k:0 },
    { c:'84', open:-68000, d:0, k:12000 }, { c:'Прочие', open:0, d:62400, k:58000 },
  ];
  R.forEach(r => { r.close = r.open + r.d - r.k; r.shown = r.wrong != null ? r.wrong : r.close });
  const tb = dEl('table', 'tbl');
  const side = v => v >= 0 ? [fmt(v), '—'] : ['—', fmt(-v)];
  tb.innerHTML = '<tr><th>Счёт</th><th>Сальдо нач. Дт</th><th>Сальдо нач. Кт</th><th>Оборот Дт</th><th>Оборот Кт</th><th>Сальдо кон. Дт</th><th>Сальдо кон. Кт</th></tr>';
  let picked = null;
  R.forEach((r, i) => {
    const o = side(r.open), c = side(r.shown);
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.innerHTML = '<td>' + (ACC[r.c] ? r.c + ' ' + ACC[r.c].n : r.c) + '</td><td class="n">' + o[0] + '</td><td class="n">' + o[1] +
      '</td><td class="n">' + fmt(r.d) + '</td><td class="n">' + fmt(r.k) + '</td><td class="n">' + c[0] + '</td><td class="n">' + c[1] + '</td>';
    tr.onclick = () => {
      picked = i;
      [...tb.querySelectorAll('tr')].forEach(x => x.classList.remove('hl'));
      tr.classList.add('hl');
    };
    tb.appendChild(tr);
  });
  const sum = (f) => R.reduce((a, r) => a + f(r), 0);
  const od = sum(r => Math.max(0, r.open)), ok2 = sum(r => Math.max(0, -r.open));
  const td2 = sum(r => r.d), tk = sum(r => r.k);
  const cd = sum(r => Math.max(0, r.shown)), ck = sum(r => Math.max(0, -r.shown));
  const tot = document.createElement('tr');
  tot.className = 'hl';
  tot.innerHTML = '<td><b>Итого</b></td><td class="n"><b>' + fmt(od) + '</b></td><td class="n"><b>' + fmt(ok2) +
    '</b></td><td class="n"><b>' + fmt(td2) + '</b></td><td class="n"><b>' + fmt(tk) + '</b></td><td class="n"><b>' + fmt(cd) +
    '</b></td><td class="n"><b>' + fmt(ck) + '</b></td>';
  tb.appendChild(tot);
  body.appendChild(tb);
  const k = dEl('div', 'kpis');
  kpi(k, 'Сальдо на начало', od === ok2 ? 'сходится ✔' : 'расхождение ' + fmt(od - ok2), fmt(od) + ' против ' + fmt(ok2), od === ok2 ? 'grn' : 'red');
  kpi(k, 'Обороты', td2 === tk ? 'сходятся ✔' : 'расхождение ' + fmt(td2 - tk), fmt(td2) + ' против ' + fmt(tk), td2 === tk ? 'grn' : 'red');
  kpi(k, 'Сальдо на конец', cd === ck ? 'сходится ✔' : 'расхождение ' + fmt(cd - ck), fmt(cd) + ' против ' + fmt(ck), cd === ck ? 'grn' : 'red');
  body.appendChild(k);
  const res = dEl('div', 'demo-note');
  const ctl = dEl('div', 'demo-ctl');
  ctl.appendChild(dBtn('Проверить выбор', 'pri', () => {
    const bad = R.findIndex(r => r.wrong != null);
    if (picked === bad){
      res.innerHTML = '✔ Верно. По счёту <b>62</b>: 31 000 + 212 000 − 195 000 = <b>48 000</b>, а в ведомости стоит 46 000. ' +
        'Ошибка на 2 000 тыс. ₽ — ровно на эту сумму не сходится итог сальдо на конец. ' +
        'Дальше аудитор смотрит, что это: ошибка выгрузки, ручная правка отчёта или неотражённая проводка — и обязательно проверяет, попала ли сумма в баланс.';
    } else if (picked == null){
      res.innerHTML = 'Выберите строку — и обратите внимание, что итог по сальдо на конец уже не сходится на 2 000 тыс. ₽. Эта сумма и есть подсказка.';
    } else {
      res.innerHTML = '✕ В строке <b>' + R[picked].c + '</b> проверка выполняется: ' + fmt(R[picked].open) + ' + ' + fmt(R[picked].d) +
        ' − ' + fmt(R[picked].k) + ' = ' + fmt(R[picked].close) + '. Ищите строку, где эта формула нарушена.';
    }
  }));
  body.appendChild(ctl); body.appendChild(res);
}
