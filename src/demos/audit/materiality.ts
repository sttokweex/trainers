/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const materiality: LegacyDemo = root => {
  const { form, out } = calcShell(root, 'Расчёт существенности',
    'Выберите бенчмарк и процент. Обоснование выбора бенчмарка документируется — это часть рабочего документа по планированию.');
  const bench = dSelect(form, 'Бенчмарк', [
    { v:'pbt', t:'Прибыль до налогообложения' }, { v:'rev', t:'Выручка' },
    { v:'ta', t:'Активы' }, { v:'eq', t:'Капитал' },
  ], 'pbt');
  const val = dField(form, 'Значение бенчмарка, ₽', 42000000, { step:100000 });
  const rate = dField(form, 'Применяемый процент, %', 5, { step:0.1 });
  const pmr = dRange(form, 'PM как доля OM', 65, 50, 75, 5, v => v + '%');
  const cttr = dRange(form, 'Порог явной незначительности (CTT) как доля OM', 5, 1, 10, 1, v => v + '%');
  const test = dField(form, 'Проверить конкретное искажение, ₽', 1800000, { step:10000 });
  const DEF = { pbt:5, rev:0.75, ta:1.5, eq:3 };
  const HINT = {
    pbt:'Ориентир 5%. Подходит стабильно прибыльной компании; не годится, если прибыль близка к нулю или сильно колеблется.',
    rev:'Ориентир 0,5–1%. Используют, когда прибыль нерепрезентативна: убытки, стартап, компания в стадии роста.',
    ta:'Ориентир 1–2%. Фондоёмкий бизнес, инвестиционные и холдинговые компании.',
    eq:'Ориентир 1–5%. Когда ключевой вопрос для пользователя — достаточность капитала и чистых активов.',
  };
  bench.onchange = () => { rate.value = DEF[bench.value]; calc() };
  const k = dEl('div', 'kpis'); out.appendChild(k);
  const chart = dEl('div'); out.appendChild(chart);
  const note = dEl('div', 'demo-note'); out.appendChild(note);
  const kOM = kpi(k, 'OM — существенность для отчётности', '', 'порог влияния на решения пользователя', 'acc');
  const kPM = kpi(k, 'PM — для выполнения процедур', '', 'применяется при планировании выборок', 'grn');
  const kCT = kpi(k, 'CTT — явная незначительность', '', 'ниже не накапливаем и не сообщаем');
  const kTS = kpi(k, 'Проверяемое искажение', '', '');
  function calc(){
    const om = num(val) * num(rate) / 100;
    const pm = om * (+pmr.value) / 100;
    const ctt = om * (+cttr.value) / 100;
    const t = num(test);
    kOM.set(money(om), pct(num(rate), 2) + ' от бенчмарка ' + money(num(val)));
    kPM.set(money(pm), pmr.value + '% от OM — «запас» на невыявленные искажения');
    kCT.set(money(ctt), cttr.value + '% от OM');
    let verdict, cls;
    if (t < ctt){ verdict = 'ниже CTT'; cls = 'kpi grn'; }
    else if (t < pm){ verdict = 'накапливаем в перечне'; cls = 'kpi yel'; }
    else if (t < om){ verdict = 'выше PM — расширяем процедуры'; cls = 'kpi yel'; }
    else { verdict = 'выше OM — существенно'; cls = 'kpi red'; }
    kTS.set(money(t), verdict, cls);
    chart.innerHTML = '';
    barsH(chart, { padL:120, data:[
      { label:'OM', value:om, color:'var(--s1)', note:'существенность для отчётности в целом' },
      { label:'PM', value:pm, color:'var(--s3)', note:'существенность для выполнения процедур' },
      { label:'Искажение', value:t, color:t >= om ? 'var(--crit)' : (t >= ctt ? 'var(--s4)' : 'var(--s2)'), note:verdict },
      { label:'CTT', value:ctt, color:'var(--s2)', note:'порог явной незначительности' },
    ], fmt: v => money(v) });
    note.innerHTML = '<b>' + HINT[bench.value] + '</b> Помните про качественную существенность: искажение ниже любого порога всё равно существенно, если оно переводит убыток в прибыль, нарушает ковенант или связано с недобросовестными действиями.';
  }
  bindAll(form, calc);
}
