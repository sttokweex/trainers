/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const tAccounts: LegacyDemo = root => {
  const body = dShell(root, 'Двойная запись: проводка → Т-счета → баланс');
  const OPS = [
    { t:'Учредители внесли уставный капитал деньгами', d:'51', k:'80', s:1000000 },
    { t:'Получен товар от поставщика (без НДС)', d:'41', k:'60', s:500000 },
    { t:'Входной НДС по товару', d:'19', k:'60', s:100000 },
    { t:'Оплачен долг поставщику', d:'60', k:'51', s:600000 },
    { t:'Отгружен товар покупателю (с НДС)', d:'62', k:'90.1', s:900000 },
    { t:'Начислен НДС с реализации', d:'90.3', k:'68', s:150000 },
    { t:'Списана себестоимость проданного товара', d:'90.2', k:'41', s:500000 },
    { t:'Получена оплата от покупателя', d:'51', k:'62', s:900000 },
    { t:'Начислена зарплата', d:'26', k:'70', s:120000 },
    { t:'Начислена амортизация оборудования', d:'26', k:'02', s:30000 },
    { t:'Взят краткосрочный кредит', d:'51', k:'66', s:400000 },
  ];
  const log = [];
  const list = dEl('div', 'sort-b');
  OPS.forEach(op => {
    const b = dEl('button', null, op.t);
    b.type = 'button';
    b.onclick = () => { log.push(op); draw() };
    list.appendChild(b);
  });
  body.appendChild(dEl('h6', null, 'Кликайте операции — они складываются в учёт'));
  body.appendChild(list);
  const tz = dEl('div', 'three');
  const kz = dEl('div', 'kpis');
  const eq = dEl('div', 'demo-note');
  const ctl = dEl('div', 'demo-ctl');
  ctl.appendChild(dBtn('Очистить', 'sm', () => { log.length = 0; draw() }));
  body.appendChild(dEl('h6', null, 'Т-счета'));
  body.appendChild(tz);
  body.appendChild(kz);
  body.appendChild(eq);
  body.appendChild(ctl);

  function draw(){
    const accs = {};
    log.forEach(op => {
      (accs[op.d] = accs[op.d] || { d:[], k:[] }).d.push(op);
      (accs[op.k] = accs[op.k] || { d:[], k:[] }).k.push(op);
    });
    tz.innerHTML = '';
    Object.keys(accs).sort().forEach(code => {
      const a = accs[code], box = dEl('div', 'tacc');
      box.appendChild(dEl('div', 'n', accLabel(code)));
      const cols = dEl('div', 'cols');
      const L = dEl('div', 'side-l'), S = dEl('div', 'sep'), R = dEl('div', 'side-r');
      L.appendChild(dEl('div', 'hdr', 'Дебет')); R.appendChild(dEl('div', 'hdr', 'Кредит'));
      a.d.forEach(o => L.appendChild(dEl('div', 'row', fmt(o.s))));
      a.k.forEach(o => R.appendChild(dEl('div', 'row', fmt(o.s))));
      const sd = a.d.reduce((x, o) => x + o.s, 0), sk = a.k.reduce((x, o) => x + o.s, 0);
      L.appendChild(dEl('div', 'tot', fmt(sd))); R.appendChild(dEl('div', 'tot', fmt(sk)));
      cols.appendChild(L); cols.appendChild(S); cols.appendChild(R);
      box.appendChild(cols);
      const t = ACC[code].t, dr = sd - sk;
      const bal = (t === 'A' || t === 'X') ? dr : -dr;
      box.appendChild(dEl('div', 'bal', 'сальдо ' + fmt(Math.abs(bal)) + (bal < 0 ? ' (обратное!)' : '') ));
      tz.appendChild(box);
    });
    let A = 0, L2 = 0, E = 0, R2 = 0, X = 0;
    Object.keys(accs).forEach(code => {
      const a = accs[code], t = ACC[code].t;
      const dr = a.d.reduce((x, o) => x + o.s, 0) - a.k.reduce((x, o) => x + o.s, 0);
      if (t === 'A') A += dr;
      else if (t === 'K') A += dr;          /* контрактив уменьшает актив: его сальдо кредитовое */
      else if (t === 'L') L2 += -dr;
      else if (t === 'E') E += -dr;
      else if (t === 'R') R2 += -dr;
      else if (t === 'X') X += dr;
    });
    const profit = R2 - X;
    kz.innerHTML = '';
    kpi(kz, 'Активы', money(A), 'всё, что есть у компании', 'acc');
    kpi(kz, 'Обязательства', money(L2), 'чужие деньги');
    kpi(kz, 'Капитал + прибыль', money(E + profit), 'свои деньги: вклады ' + money(E) + ' + результат ' + money(profit), 'grn');
    const diff = A - (L2 + E + profit);
    eq.innerHTML = Math.abs(diff) < 0.5
      ? '<b>Проверка:</b> Активы = Обязательства + Капитал ✔ равенство сохранено после ' + log.length + ' операций'
      : '<b>Расхождение ' + money(diff) + '</b> — такого быть не может при двойной записи';
  }
  draw();
}
