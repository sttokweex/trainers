/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const balanceStruct: LegacyDemo = root => {
  const body = dShell(root, 'Вертикальный анализ: что изменилось в структуре');
  const Y1 = [
    { n:'Основные средства', v:42000 }, { n:'Запасы', v:28000 },
    { n:'Дебиторская задолженность', v:31000 }, { n:'Денежные средства', v:14000 }, { n:'Прочие активы', v:5000 },
  ];
  const Y2 = [
    { n:'Основные средства', v:44000 }, { n:'Запасы', v:47000 },
    { n:'Дебиторская задолженность', v:52000 }, { n:'Денежные средства', v:4000 }, { n:'Прочие активы', v:6000 },
  ];
  const COLORS = ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)', 'var(--mut2)'];
  body.appendChild(dEl('h6', null, 'Структура активов: прошлый год'));
  stackRow(body, { segments: Y1.map((x, i) => ({ name:x.n, value:x.v, color:COLORS[i] })), fmt: v => fmt(v) + ' тыс. ₽' });
  body.appendChild(dEl('h6', null, 'Структура активов: отчётный год'));
  stackRow(body, { segments: Y2.map((x, i) => ({ name:x.n, value:x.v, color:COLORS[i] })), fmt: v => fmt(v) + ' тыс. ₽' });
  const t1 = Y1.reduce((a, b) => a + b.v, 0), t2 = Y2.reduce((a, b) => a + b.v, 0);
  const tb = dEl('table', 'tbl');
  tb.innerHTML = '<tr><th>Статья</th><th>Прошлый год</th><th>Доля</th><th>Отчётный год</th><th>Доля</th><th>Сдвиг доли</th></tr>';
  Y1.forEach((x, i) => {
    const d1 = x.v / t1 * 100, d2 = Y2[i].v / t2 * 100, sh = d2 - d1;
    const tr = document.createElement('tr');
    if (Math.abs(sh) >= 4) tr.className = 'bad';
    tr.innerHTML = '<td>' + x.n + '</td><td class="n">' + fmt(x.v) + '</td><td class="n">' + pct(d1) +
      '</td><td class="n">' + fmt(Y2[i].v) + '</td><td class="n">' + pct(d2) + '</td><td class="n">' +
      (sh > 0 ? '+' : '') + fmt(sh, 1) + ' п.п.</td>';
    tb.appendChild(tr);
  });
  body.appendChild(tb);
  const k = dEl('div', 'kpis');
  kpi(k, 'Валюта баланса', fmt(t2) + ' тыс. ₽', 'рост на ' + pct((t2 / t1 - 1) * 100) + ' к прошлому году', 'acc');
  kpi(k, 'Доля запасов и дебиторки', pct((Y2[1].v + Y2[2].v) / t2 * 100), 'было ' + pct((Y1[1].v + Y1[2].v) / t1 * 100), 'yel');
  kpi(k, 'Доля денежных средств', pct(Y2[3].v / t2 * 100), 'было ' + pct(Y1[3].v / t1 * 100), 'red');
  body.appendChild(k);
  body.appendChild(dEl('div', 'demo-note',
    'Как это читает аудитор: активы выросли, но рост целиком пришёлся на <b>запасы и дебиторскую задолженность</b>, а денежные средства сжались втрое. ' +
    'Это типичная картина, при которой прибыль в отчётности есть, а денег нет. Гипотезы на проверку: <b>завышение выручки и досрочное признание</b> (смотрим cut-off и подтверждения), ' +
    '<b>недостаточный резерв по сомнительным долгам</b> (матрица старения), <b>затоваривание и обесценение запасов</b> (тест ЧСП, анализ неликвидов). ' +
    'Структурный анализ сам по себе ничего не доказывает — он показывает, куда направить процедуры.'));
}
