/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const entryDrill: LegacyDemo = root => {
  const body = dShell(root, 'Составьте проводки');
  const TASKS = [
    { t:'Компания отгрузила покупателю товар на 1 200 000 ₽, в том числе НДС 20% (200 000 ₽). Себестоимость товара — 750 000 ₽. Составьте три проводки.',
      rows:[ {d:'62',k:'90.1',s:1200000,h:'выручка признаётся с НДС, задолженность покупателя'},
             {d:'90.3',k:'68',s:200000,h:'НДС — обязательство перед бюджетом, а не доход'},
             {d:'90.2',k:'41',s:750000,h:'себестоимость проданного списывается в том же периоде'} ] },
    { t:'Начислена зарплата производственному персоналу 400 000 ₽, удержан НДФЛ 52 000 ₽, начислены страховые взносы 120 000 ₽.',
      rows:[ {d:'20',k:'70',s:400000,h:'зарплата рабочих — в себестоимость продукции'},
             {d:'70',k:'68',s:52000,h:'НДФЛ удерживается из дохода работника, расходом работодателя не является'},
             {d:'20',k:'69',s:120000,h:'взносы — расход работодателя, а не удержание'} ] },
    { t:'Приобретено оборудование за 600 000 ₽ без НДС, доставка 40 000 ₽. Объект введён в эксплуатацию.',
      rows:[ {d:'08',k:'60',s:600000,h:'сначала капвложения по ФСБУ 26/2020'},
             {d:'08',k:'60',s:40000,h:'доставка входит в стоимость капвложений'},
             {d:'01',k:'08',s:640000,h:'ввод в эксплуатацию: полная стоимость переносится на 01'} ] },
    { t:'Создан резерв по сомнительным долгам на 300 000 ₽ и списана безнадёжная задолженность 80 000 ₽ за счёт резерва.',
      rows:[ {d:'91.2',k:'63',s:300000,h:'создание резерва — прочий расход'},
             {d:'63',k:'62',s:80000,h:'списание безнадёжного долга за счёт ранее созданного резерва'} ] },
    { t:'Получен аванс от покупателя 600 000 ₽, начислен НДС с аванса по ставке 20%.',
      rows:[ {d:'51',k:'62',s:600000,h:'аванс — не выручка, а обязательство перед покупателем (субсчёт 62.АВ)'},
             {d:'76',k:'68',s:100000,h:'НДС с аванса начисляется сразу: 600 000 × 20/120 = 100 000'} ] },
  ];
  let ti = 0;
  const task = dEl('div', 'sort-q');
  const wrap = dEl('div', 'je');
  const res = dEl('div', 'demo-note');
  const sum = dEl('div', 'je-sum');
  body.appendChild(task); body.appendChild(wrap); body.appendChild(sum);
  const ctl = dEl('div', 'demo-ctl');
  ctl.appendChild(dBtn('Проверить', 'pri', check));
  ctl.appendChild(dBtn('Показать ответ', null, reveal));
  ctl.appendChild(dBtn('Следующая задача →', 'sm', () => { ti = (ti + 1) % TASKS.length; build() }));
  body.appendChild(ctl); body.appendChild(res);

  let rows = [];
  function build(){
    const T2 = TASKS[ti];
    task.innerHTML = '<b>Задача ' + (ti + 1) + ' из ' + TASKS.length + '.</b> ' + T2.t;
    wrap.innerHTML = ''; res.innerHTML = ''; rows = [];
    T2.rows.forEach((r, i) => {
      const row = dEl('div', 'je-row');
      row.appendChild(dEl('div', 'je-n', (i + 1) + '.'));
      const ds = document.createElement('select'), ks = document.createElement('select');
      [ds, ks].forEach((sel, j) => {
        const empty = document.createElement('option');
        empty.value = ''; empty.textContent = j ? 'Кредит…' : 'Дебет…';
        sel.appendChild(empty);
        ACC_KEYS.forEach(c => {
          const o = document.createElement('option');
          o.value = c; o.textContent = accLabel(c);
          sel.appendChild(o);
        });
      });
      const inp = document.createElement('input');
      inp.type = 'number'; inp.placeholder = 'сумма';
      const v = dEl('div', 'je-v', '');
      row.appendChild(ds); row.appendChild(ks); row.appendChild(inp); row.appendChild(v);
      wrap.appendChild(row);
      rows.push({ row, ds, ks, inp, v, r });
    });
    updSum();
    [...wrap.querySelectorAll('input')].forEach(i => i.oninput = updSum);
  }
  function updSum(){
    const tot = rows.reduce((a, r) => a + (parseFloat(r.inp.value) || 0), 0);
    sum.innerHTML = '<span>Введено строк: ' + rows.length + '</span><span>Итого по дебету: ' + money(tot) + '</span>';
  }
  function check(){
    let ok = 0;
    rows.forEach(r => {
      const good = r.ds.value === r.r.d && r.ks.value === r.r.k && Math.abs((parseFloat(r.inp.value) || 0) - r.r.s) < 0.5;
      r.row.className = 'je-row ' + (good ? 'ok' : 'no');
      r.v.textContent = good ? '✔ верно' : '✕ неверно';
      if (good) ok++;
    });
    res.innerHTML = 'Верно <b>' + ok + '</b> из ' + rows.length + (ok === rows.length ? ' — проводки составлены правильно' : '. Подсказка: определите, что увеличивается и что уменьшается, и какого типа каждый счёт');
  }
  function reveal(){
    rows.forEach(r => {
      r.ds.value = r.r.d; r.ks.value = r.r.k; r.inp.value = r.r.s;
      r.row.className = 'je-row'; r.v.textContent = '';
      const hint = dEl('div', 'je-hint', '↳ ' + r.r.h);
      if (!r.row.nextSibling || !r.row.nextSibling.classList || !r.row.nextSibling.classList.contains('je-hint'))
        r.row.parentNode.insertBefore(hint, r.row.nextSibling);
    });
    updSum();
    res.innerHTML = 'Эталон подставлен — разберите логику каждой строки и переходите к следующей задаче';
  }
  build();
}
