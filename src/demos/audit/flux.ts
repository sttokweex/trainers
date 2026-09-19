/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const flux: LegacyDemo = root => {
  const body = dShell(root, 'Flux-анализ: какие отклонения нужно расследовать');
  body.appendChild(dEl('div', 'demo-note',
    'Правило двойного порога: отклонение требует объяснения, только если оно превышает <b>и</b> процентный порог, <b>и</b> абсолютный (обычно привязанный к PM). Отметьте строки, которые взяли бы в работу.'));
  const ROWS = [
    { n:'Выручка', p:180000, c:212000, w:'рост 17,8% на 32 000 тыс. ₽ — выше обоих порогов. Нужно объяснение: рост объёма, цен, новые клиенты? Сверить с динамикой дебиторки.' },
    { n:'Себестоимость продаж', p:122000, c:131000, w:'рост 7,4% при росте выручки на 17,8% — валовая маржа выросла. Само по себе отклонение ниже процентного порога, но <b>несоответствие динамике выручки</b> — повод для вопроса.' },
    { n:'Коммерческие расходы', p:9000, c:9300, w:'рост 3,3% на 300 тыс. ₽ — ниже обоих порогов, рутинное изменение.' },
    { n:'Управленческие расходы', p:14000, c:21500, w:'рост 53,6% на 7 500 тыс. ₽ — выше обоих порогов. Проверить состав: разовые консультационные услуги, премии, новые договоры.' },
    { n:'Прочие расходы', p:4100, c:12800, w:'рост более чем втрое на 8 700 тыс. ₽ — выше порогов. Частое содержание: списания, резервы, штрафы, убыток от выбытия активов.' },
    { n:'Расходы на канцтовары', p:180, c:340, w:'рост 88,9%, но всего на 160 тыс. ₽ — процентный порог пройден, абсолютный нет. Расследовать не нужно: именно для этого и существует второй порог.' },
    { n:'Проценты к уплате', p:5200, c:5400, w:'рост 3,8% на 200 тыс. ₽ — в пределах порогов, но стоит сверить с динамикой долга: при росте займов проценты обязаны расти пропорционально.' },
  ];
  const PTH = 10, ATH = 5000;
  const picks = {};
  const tb = dEl('table', 'tbl');
  tb.innerHTML = '<tr><th>Статья</th><th>Прошлый год</th><th>Отчётный год</th><th>Δ, тыс. ₽</th><th>Δ, %</th><th>Взять в работу?</th></tr>';
  ROWS.forEach((r, i) => {
    const d = r.c - r.p, dp = d / r.p * 100;
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' + r.n + '</td><td class="n">' + fmt(r.p) + '</td><td class="n">' + fmt(r.c) +
      '</td><td class="n">' + fmt(d) + '</td><td class="n">' + fmt(dp, 1) + '%</td>';
    const td = document.createElement('td');
    const b = dEl('button', 'demo-b sm', 'отметить');
    b.type = 'button';
    b.onclick = () => { picks[i] = !picks[i]; b.classList.toggle('on', picks[i]); b.textContent = picks[i] ? '✔ отмечено' : 'отметить' };
    td.appendChild(b);
    tr.appendChild(td);
    tb.appendChild(tr);
    r.node = tr; r.d = d; r.dp = dp;
  });
  body.appendChild(tb);
  const res = dEl('div', 'demo-note');
  const ctl = dEl('div', 'demo-ctl');
  ctl.appendChild(dBtn('Проверить', 'pri', () => {
    let ok = 0;
    res.innerHTML = '<b>Пороги:</b> отклонение ' + PTH + '% и ' + fmt(ATH) + ' тыс. ₽ одновременно.<br>';
    ROWS.forEach((r, i) => {
      const should = Math.abs(r.dp) >= PTH && Math.abs(r.d) >= ATH;
      const got = !!picks[i];
      if (should === got) ok++;
      r.node.className = should ? 'hl' : '';
      res.innerHTML += (should === got ? '✔' : '✕') + ' <b>' + r.n + '</b> — ' + r.w + '<br>';
    });
    res.innerHTML += '<br>Совпало решений: <b>' + ok + '</b> из ' + ROWS.length;
  }));
  body.appendChild(ctl); body.appendChild(res);
}
