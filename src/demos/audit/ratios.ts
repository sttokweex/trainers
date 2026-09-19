/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const ratios: LegacyDemo = root => {
  const { form, out } = calcShell(root, 'Коэффициенты по вашей отчётности');
  const two = dEl('div', 'two'); form.appendChild(two);
  const c1 = dEl('div'), c2 = dEl('div');
  two.appendChild(c1); two.appendChild(c2);
  c1.appendChild(dEl('h6', null, 'Баланс, тыс. ₽'));
  const va = dField(c1, 'Внеоборотные активы', 42000, { step:1000 });
  const inv = dField(c1, 'Запасы', 28000, { step:1000 });
  const ar = dField(c1, 'Дебиторская задолженность', 31000, { step:1000 });
  const cash = dField(c1, 'Денежные средства', 14000, { step:1000 });
  const eqf = dField(c1, 'Капитал', 46000, { step:1000 });
  const lt = dField(c1, 'Долгосрочные обязательства', 30000, { step:1000 });
  const st = dField(c1, 'Краткосрочные обязательства', 39000, { step:1000 });
  c2.appendChild(dEl('h6', null, 'ОФР, тыс. ₽'));
  const rev = dField(c2, 'Выручка', 180000, { step:1000 });
  const cogs = dField(c2, 'Себестоимость', 122000, { step:1000 });
  const ebit = dField(c2, 'Прибыль до процентов и налогов', 19000, { step:1000 });
  const intr = dField(c2, 'Проценты к уплате', 5200, { step:100 });
  const np = dField(c2, 'Чистая прибыль', 10400, { step:100 });
  const ap = dField(c2, 'Кредиторская задолженность', 24000, { step:1000 });
  const k = dEl('div', 'kpis'); out.appendChild(k);
  const chart = dEl('div'); out.appendChild(chart);
  const dupont = dEl('div'); out.appendChild(dupont);
  const note = dEl('div', 'demo-note'); out.appendChild(note);
  function calc(){
    const oa = num(inv) + num(ar) + num(cash), A = num(va) + oa;
    const cur = oa / Math.max(1, num(st)), quick = (oa - num(inv)) / Math.max(1, num(st)), abs = num(cash) / Math.max(1, num(st));
    const dte = (num(lt) + num(st)) / Math.max(1, num(eqf));
    const icr = num(ebit) / Math.max(1, num(intr));
    const gm = (num(rev) - num(cogs)) / Math.max(1, num(rev)) * 100;
    const ros = num(np) / Math.max(1, num(rev)) * 100, roe = num(np) / Math.max(1, num(eqf)) * 100, roa = num(np) / Math.max(1, A) * 100;
    const dso = num(ar) / Math.max(1, num(rev)) * 365, dio = num(inv) / Math.max(1, num(cogs)) * 365, dpo = num(ap) / Math.max(1, num(cogs)) * 365;
    k.innerHTML = '';
    kpi(k, 'Текущая ликвидность', fmt(cur, 2), 'ориентир около 1,5–2; ниже 1 — оборотных активов не хватает на краткосрочные долги',
      cur < 1 ? 'red' : (cur < 1.5 ? 'yel' : 'grn'));
    kpi(k, 'Быстрая ликвидность', fmt(quick, 2), 'без запасов');
    kpi(k, 'Абсолютная ликвидность', fmt(abs, 2), 'только деньги');
    kpi(k, 'Долг / Капитал', fmt(dte, 2), 'финансовый рычаг', dte > 2 ? 'red' : 'acc');
    kpi(k, 'Покрытие процентов', fmt(icr, 2) + '×', 'частый ковенант; ниже 1,5 — тревожно', icr < 1.5 ? 'red' : 'grn');
    kpi(k, 'ROE', pct(roe), 'отдача на капитал собственника', 'grn');
    kpi(k, 'Денежный цикл', fmt(dso + dio - dpo, 0) + ' дн.', 'DSO ' + fmt(dso, 0) + ' + DIO ' + fmt(dio, 0) + ' − DPO ' + fmt(dpo, 0), 'yel');
    chart.innerHTML = '';
    chart.appendChild(dEl('h6', null, 'Оборачиваемость в днях'));
    barsH(chart, { padL:230, data:[
      { label:'Дебиторка (DSO)', value:+dso.toFixed(0), color:'var(--s1)', note:'сколько дней ждём оплату' },
      { label:'Запасы (DIO)', value:+dio.toFixed(0), color:'var(--s2)', note:'сколько дней лежит склад' },
      { label:'Кредиторка (DPO)', value:+dpo.toFixed(0), color:'var(--s3)', note:'сколько дней не платим поставщикам' },
      { label:'Денежный цикл', value:+(dso + dio - dpo).toFixed(0), color:'var(--s4)', note:'DSO + DIO − DPO' },
    ], fmt: v => fmt(v) + ' дн.' });
    dupont.innerHTML = '';
    dupont.appendChild(dEl('h6', null, 'Разложение DuPont'));
    dupont.appendChild(dEl('table', 'tbl',
      '<tr><th>Компонент</th><th>Значение</th><th>Что означает</th></tr>' +
      '<tr><td>Рентабельность продаж (ЧП ÷ Выручка)</td><td class="n">' + pct(ros) + '</td><td>маржинальность бизнеса</td></tr>' +
      '<tr><td>Оборачиваемость активов (Выручка ÷ Активы)</td><td class="n">' + fmt(num(rev) / Math.max(1, A), 2) + '</td><td>насколько эффективно работают активы</td></tr>' +
      '<tr><td>Финансовый рычаг (Активы ÷ Капитал)</td><td class="n">' + fmt(A / Math.max(1, num(eqf)), 2) + '</td><td>сколько активов на рубль собственного капитала</td></tr>' +
      '<tr class="hl"><td><b>ROE (произведение)</b></td><td class="n"><b>' + pct(roe) + '</b></td><td>ROA ' + pct(roa) + ' × рычаг</td></tr>'));
    note.innerHTML = 'Для аудитора коэффициенты — это <b>генератор гипотез</b>, а не вывод. Рост DSO → проверяем резерв и cut-off выручки. Рост DIO → проверяем обесценение запасов. ' +
      'Падение покрытия процентов → смотрим ковенанты и непрерывность деятельности. Рост ROE только за счёт рычага → это рост риска, а не эффективности.';
  }
  bindAll(form, calc);
}
