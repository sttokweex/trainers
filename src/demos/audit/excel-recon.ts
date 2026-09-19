/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const excelRecon: LegacyDemo = root => {
  const body = dShell(root, 'Сверка нашего учёта с актом сверки контрагента');
  body.appendChild(dEl('div', 'demo-note',
    'Слева — данные учёта клиента, справа — акт сверки, подписанный контрагентом. Отметьте строки, которые нужно разобрать, и проверьте себя.'));
  const R = [
    { d:'12.11', doc:'УПД № 4471', us:1240000, them:1240000, w:'совпадает — сверять нечего.' },
    { d:'03.12', doc:'УПД № 4688', us:860000, them:0, w:'<b>у контрагента документа нет.</b> Варианты: он получил товар в январе (вопрос cut-off), документ потерян, либо операции не было вовсе. Поднимаем транспортные документы и подпись получателя.' },
    { d:'18.12', doc:'УПД № 4712', us:2150000, them:2150000, w:'совпадает.' },
    { d:'24.12', doc:'УПД № 4790', us:1780000, them:1483333, w:'<b>расхождение 296 667 ₽.</b> Похоже на разницу в НДС или на частичный возврат. Первым делом сверяем сумму с НДС и без, затем ищем кредит-ноту.' },
    { d:'27.12', doc:'Оплата п/п 812', us:-3000000, them:-3000000, w:'совпадает.' },
    { d:'29.12', doc:'Оплата п/п 830', us:0, them:-1500000, w:'<b>контрагент показывает оплату, которой нет в учёте.</b> Классика: деньги зачислены 09.01 (деньги в пути, счёт 57) либо платёж ушёл на другой договор. Проверяем выписку января.' },
    { d:'31.12', doc:'Корректировка', us:-450000, them:0, w:'<b>односторонняя корректировка.</b> Ретробонус или скидка, о которой контрагент не знает. Проверяем договор: есть ли основание и подписан ли документ.' },
  ];
  const picks = {};
  const tb = dEl('table', 'tbl');
  tb.innerHTML = '<tr><th>Дата</th><th>Документ</th><th>Наш учёт</th><th>Акт контрагента</th><th>Разница</th><th>Разобрать?</th></tr>';
  R.forEach((r, i) => {
    const diff = r.us - r.them;
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' + r.d + '</td><td>' + r.doc + '</td><td class="n">' + fmt(r.us) + '</td><td class="n">' + fmt(r.them) +
      '</td><td class="n">' + (diff ? fmt(diff) : '—') + '</td>';
    const td = document.createElement('td');
    const b = dEl('button', 'demo-b sm', 'отметить');
    b.type = 'button';
    b.onclick = () => { picks[i] = !picks[i]; b.classList.toggle('on', picks[i]); b.textContent = picks[i] ? '✔ отмечено' : 'отметить' };
    td.appendChild(b); tr.appendChild(td);
    tb.appendChild(tr);
    r.node = tr; r.diff = diff;
  });
  body.appendChild(tb);
  const k = dEl('div', 'kpis');
  const ourTotal = R.reduce((a, r) => a + r.us, 0), theirTotal = R.reduce((a, r) => a + r.them, 0);
  kpi(k, 'Сальдо по нашему учёту', money(ourTotal), 'задолженность контрагента');
  kpi(k, 'Сальдо по акту контрагента', money(theirTotal), 'его версия', 'yel');
  kpi(k, 'Расхождение', money(ourTotal - theirTotal), 'сумма всех неразобранных позиций', 'red');
  body.appendChild(k);
  const res = dEl('div', 'demo-note');
  const ctl = dEl('div', 'demo-ctl');
  ctl.appendChild(dBtn('Проверить', 'pri', () => {
    let ok = 0;
    res.innerHTML = '';
    R.forEach((r, i) => {
      const should = r.diff !== 0, got = !!picks[i];
      if (should === got) ok++;
      r.node.className = should ? 'bad' : '';
      res.innerHTML += (should === got ? '✔' : '✕') + ' <b>' + r.doc + '</b> — ' + r.w + '<br>';
    });
    res.innerHTML += '<br>Совпало решений: <b>' + ok + '</b> из ' + R.length +
      '. Обратите внимание: расхождение в обе стороны одинаково важно. Позиция, которой нет <b>у нас</b>, — потенциальное неучтённое обязательство или неотражённая оплата.';
  }));
  body.appendChild(ctl); body.appendChild(res);
}
