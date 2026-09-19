/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const pbu18: LegacyDemo = root => {
  const { form, out } = calcShell(root, 'ПБУ 18/02: от бухгалтерской прибыли к расходу по налогу');
  const pbt = dField(form, 'Прибыль до налогообложения (бухгалтерская), ₽', 24000000, { step:100000 });
  const perm = dField(form, 'Постоянные разницы (непринимаемые расходы), ₽', 1800000, { step:100000 });
  const vtd = dField(form, 'Прирост вычитаемых временных разниц (резервы и пр.), ₽', 3200000, { step:100000 });
  const ttd = dField(form, 'Прирост налогооблагаемых временных разниц (ускоренная амортизация и пр.), ₽', 5000000, { step:100000 });
  const rate = dField(form, 'Ставка налога на прибыль, %', 25, { step:1 });
  const k1 = dEl('div', 'kpis'); out.appendChild(k1);
  const tbl = dEl('div'); out.appendChild(tbl);
  const note = dEl('div', 'demo-note'); out.appendChild(note);
  const kBase = kpi(k1, 'Налоговая база', '', 'по правилам главы 25 НК');
  const kCur = kpi(k1, 'Текущий налог', '', 'то, что в декларации', 'acc');
  const kExp = kpi(k1, 'Расход по налогу в ОФР', '', 'текущий + отложенный', 'yel');
  const kEff = kpi(k1, 'Эффективная ставка', '', 'расход ÷ бухгалтерская прибыль', 'grn');
  function calc(){
    const r = num(rate) / 100;
    const base = num(pbt) + num(perm) + num(vtd) - num(ttd);
    const cur = base * r;
    const ona = num(vtd) * r;     /* рост ОНА уменьшает расход по налогу */
    const ono = num(ttd) * r;     /* рост ОНО увеличивает расход */
    const exp = cur + ono - ona;
    const net = num(pbt) - exp;
    kBase.set(money(base), 'прибыль + постоянные + вычитаемые − налогооблагаемые');
    kCur.set(money(cur), 'база × ' + pct(num(rate), 0));
    kExp.set(money(exp), 'текущий ' + money(cur) + ' + ΔОНО ' + money(ono) + ' − ΔОНА ' + money(ona));
    kEff.set(pct(exp / Math.max(1, num(pbt)) * 100), 'номинальная ставка ' + pct(num(rate), 0) + ', разницу объясняют постоянные разницы');
    tbl.innerHTML = '';
    const tb = dEl('table', 'tbl');
    tb.innerHTML = '<tr><th>Показатель</th><th>Сумма</th><th>Проводка</th></tr>' +
      '<tr><td>Текущий налог на прибыль</td><td class="n">' + fmt(cur) + '</td><td>Дт 99 Кт 68</td></tr>' +
      '<tr><td>Признан отложенный налоговый актив (ОНА)</td><td class="n">' + fmt(ona) + '</td><td>Дт 09 Кт 68</td></tr>' +
      '<tr><td>Признано отложенное налоговое обязательство (ОНО)</td><td class="n">' + fmt(ono) + '</td><td>Дт 68 Кт 77</td></tr>' +
      '<tr class="hl"><td><b>Расход по налогу на прибыль в ОФР</b></td><td class="n"><b>' + fmt(exp) + '</b></td><td>—</td></tr>' +
      '<tr class="hl"><td><b>Чистая прибыль</b></td><td class="n"><b>' + fmt(net) + '</b></td><td>→ счёт 84</td></tr>';
    tb.appendChild(dEl('tr', null, '<td colspan="3" style="color:var(--mut)">Сверка: ' + money(num(pbt)) + ' × ' + pct(num(rate), 0) +
      ' = ' + money(num(pbt) * r) + ' + постоянные ' + money(num(perm) * r) + ' = <b>' + money(num(pbt) * r + num(perm) * r) +
      '</b> — должно совпасть с расходом по налогу</td>'));
    tbl.appendChild(tb);
    note.innerHTML = 'Проверьте себя на расхождении: если сверка не сходится, ошибка либо в классификации разницы (постоянная приняли за временную), либо в расчёте отложенных налогов. <b>Самая частая находка аудитора здесь — непризнанные временные разницы</b> по резерву отпусков, резерву по сомнительным долгам и аренде по ФСБУ 25/2018, а также <b>ОНА, восстанавливаемость которого не подтверждена</b> будущей налогооблагаемой прибылью.';
  }
  bindAll(form, calc);
}
