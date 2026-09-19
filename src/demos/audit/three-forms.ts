/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const threeForms: LegacyDemo = root => {
  const { form, out } = calcShell(root, 'Три формы отчётности связаны жёстко',
    'Начальные остатки: ОС 30 000, запасы 10 000, дебиторка 15 000, деньги 5 000; кредиторка 12 000, займы 20 000, уставный капитал 5 000, нераспределённая прибыль 23 000 (тыс. ₽). Меняйте параметры года.');
  const f = (l, v, s) => dField(form, l, v, { step:s || 500 });
  const rev = f('Выручка, тыс. ₽', 80000, 1000);
  const cogs = f('Себестоимость, тыс. ₽', 55000, 1000);
  const opex = f('Операционные расходы (включая амортизацию), тыс. ₽', 12000, 500);
  const dep = f('в том числе амортизация, тыс. ₽', 3000, 500);
  const dar = f('Изменение дебиторской задолженности, тыс. ₽', 4000, 500);
  const din = f('Изменение запасов, тыс. ₽', 2000, 500);
  const dap = f('Изменение кредиторской задолженности, тыс. ₽', 1500, 500);
  const capex = f('Капитальные вложения, тыс. ₽', 6000, 500);
  const loan = f('Привлечено займов (нетто), тыс. ₽', 3000, 500);
  const divd = f('Выплачено дивидендов, тыс. ₽', 2000, 500);
  const tax = dField(form, 'Ставка налога на прибыль, %', 25, { step:1 });
  const grid = dEl('div', 'three'); out.appendChild(grid);
  const check = dEl('div', 'tree-out ok'); out.appendChild(check);
  function calc(){
    const R = num(rev), C = num(cogs), O = num(opex), D = num(dep);
    const gross = R - C, pbt = gross - O, t = Math.max(0, pbt) * num(tax) / 100, np = pbt - t;
    const cfo = np + D - num(dar) - num(din) + num(dap);
    const cfi = -num(capex), cff = num(loan) - num(divd);
    const dcash = cfo + cfi + cff;
    const bs = {
      os: 30000 + num(capex) - D, inv: 10000 + num(din), ar: 15000 + num(dar), cash: 5000 + dcash,
      ap: 12000 + num(dap), debt: 20000 + num(loan), uk: 5000, re: 23000 + np - num(divd),
    };
    const A = bs.os + bs.inv + bs.ar + bs.cash, P = bs.ap + bs.debt + bs.uk + bs.re;
    grid.innerHTML = '';
    const pl = dEl('div');
    pl.appendChild(dEl('h6', null, 'ОФР'));
    pl.appendChild(dEl('table', 'tbl',
      '<tr><td>Выручка</td><td class="n">' + fmt(R) + '</td></tr>' +
      '<tr><td>Себестоимость</td><td class="n">(' + fmt(C) + ')</td></tr>' +
      '<tr><td>Валовая прибыль</td><td class="n">' + fmt(gross) + '</td></tr>' +
      '<tr><td>Операционные расходы</td><td class="n">(' + fmt(O) + ')</td></tr>' +
      '<tr><td>Прибыль до налогообложения</td><td class="n">' + fmt(pbt) + '</td></tr>' +
      '<tr><td>Налог на прибыль</td><td class="n">(' + fmt(t) + ')</td></tr>' +
      '<tr class="hl"><td><b>Чистая прибыль</b></td><td class="n"><b>' + fmt(np) + '</b></td></tr>'));
    const cf = dEl('div');
    cf.appendChild(dEl('h6', null, 'ОДДС'));
    cf.appendChild(dEl('table', 'tbl',
      '<tr><td>Чистая прибыль</td><td class="n">' + fmt(np) + '</td></tr>' +
      '<tr><td>+ Амортизация</td><td class="n">' + fmt(D) + '</td></tr>' +
      '<tr><td>− Рост дебиторки</td><td class="n">(' + fmt(num(dar)) + ')</td></tr>' +
      '<tr><td>− Рост запасов</td><td class="n">(' + fmt(num(din)) + ')</td></tr>' +
      '<tr><td>+ Рост кредиторки</td><td class="n">' + fmt(num(dap)) + '</td></tr>' +
      '<tr class="hl"><td><b>Операционный поток</b></td><td class="n"><b>' + fmt(cfo) + '</b></td></tr>' +
      '<tr><td>Инвестиционный</td><td class="n">' + fmt(cfi) + '</td></tr>' +
      '<tr><td>Финансовый</td><td class="n">' + fmt(cff) + '</td></tr>' +
      '<tr class="hl"><td><b>Изменение денег</b></td><td class="n"><b>' + fmt(dcash) + '</b></td></tr>'));
    const bsd = dEl('div');
    bsd.appendChild(dEl('h6', null, 'Баланс на конец года'));
    bsd.appendChild(dEl('table', 'tbl',
      '<tr><td>Основные средства</td><td class="n">' + fmt(bs.os) + '</td></tr>' +
      '<tr><td>Запасы</td><td class="n">' + fmt(bs.inv) + '</td></tr>' +
      '<tr><td>Дебиторская задолженность</td><td class="n">' + fmt(bs.ar) + '</td></tr>' +
      '<tr><td>Денежные средства</td><td class="n">' + fmt(bs.cash) + '</td></tr>' +
      '<tr class="hl"><td><b>Актив</b></td><td class="n"><b>' + fmt(A) + '</b></td></tr>' +
      '<tr><td>Кредиторская задолженность</td><td class="n">' + fmt(bs.ap) + '</td></tr>' +
      '<tr><td>Займы</td><td class="n">' + fmt(bs.debt) + '</td></tr>' +
      '<tr><td>Уставный капитал</td><td class="n">' + fmt(bs.uk) + '</td></tr>' +
      '<tr><td>Нераспределённая прибыль</td><td class="n">' + fmt(bs.re) + '</td></tr>' +
      '<tr class="hl"><td><b>Пассив</b></td><td class="n"><b>' + fmt(P) + '</b></td></tr>'));
    grid.appendChild(pl); grid.appendChild(cf); grid.appendChild(bsd);
    const d1 = Math.abs(A - P), d2 = Math.abs((bs.cash - 5000) - dcash);
    const warn = bs.cash < 0;
    check.className = 'tree-out ' + (d1 < 0.5 && d2 < 0.5 ? (warn ? 'q' : 'ok') : 'bad');
    check.innerHTML = '<b>Сквозная сверка (tie-out)</b>' +
      'Актив ' + fmt(A) + ' = Пассив ' + fmt(P) + (d1 < 0.5 ? ' ✔' : ' ✕ расхождение ' + fmt(d1)) + '<br>' +
      'Нераспределённая прибыль: 23 000 + ' + fmt(np) + ' − ' + fmt(num(divd)) + ' = ' + fmt(bs.re) + ' ✔<br>' +
      'Изменение денег по ОДДС ' + fmt(dcash) + ' = изменение строки баланса ' + fmt(bs.cash - 5000) + (d2 < 0.5 ? ' ✔' : ' ✕') +
      (warn ? '<br><b>Внимание:</b> остаток денежных средств отрицательный — в реальности это овердрафт, то есть краткосрочное обязательство, а не отрицательный актив.' : '');
  }
  bindAll(form, calc);
}
