/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const riskModel: LegacyDemo = root => {
  const { form, out } = calcShell(root, 'AR = IR × CR × DR: как оценка превращается в объём работы',
    'Аудиторский риск задаётся приемлемо низким. Неотъемлемый риск и риск средств контроля определяются клиентом — аудитор ими не управляет. Единственная переменная в руках аудитора — риск необнаружения.');
  const ir = dRange(form, 'Неотъемлемый риск (IR)', 80, 20, 100, 5, v => v + '%');
  const cr = dRange(form, 'Риск средств контроля (CR)', 70, 20, 100, 5, v => v + '%');
  const ar = dRange(form, 'Приемлемый аудиторский риск (AR)', 5, 1, 10, 1, v => v + '%');
  const k = dEl('div', 'kpis'); out.appendChild(k);
  const chart = dEl('div'); out.appendChild(chart);
  const note = dEl('div', 'demo-note'); out.appendChild(note);
  const kR = kpi(k, 'RMM = IR × CR', '', 'риск существенного искажения', 'yel');
  const kD = kpi(k, 'Требуемый DR', '', 'риск необнаружения, который можно себе позволить', 'acc');
  const kW = kpi(k, 'Что это значит для работы', '', '');
  function calc(){
    const I = +ir.value / 100, C = +cr.value / 100, A = +ar.value / 100;
    const rmm = I * C, dr = Math.min(1, A / rmm);
    kR.set(pct(rmm * 100), 'IR ' + ir.value + '% × CR ' + cr.value + '%');
    kD.set(pct(dr * 100), 'DR = AR ÷ RMM');
    /* условный индекс объёма процедур: обратная величина DR, нормированная */
    const eff = Math.min(100, Math.round(12 / (dr * 100) * 100));
    let txt;
    if (dr > 0.35) txt = 'Низкий риск: допустимы аналитические процедуры по существу и небольшие выборки, можно полагаться на контроли.';
    else if (dr > 0.12) txt = 'Средний риск: сочетание тестов контролей и детальных тестов, выборки среднего объёма.';
    else txt = 'Высокий риск: только процедуры по существу, большие выборки, более надёжные доказательства (внешние подтверждения, процедуры ближе к отчётной дате), привлечение более опытных членов команды.';
    kW.set(txt, '', dr > 0.35 ? 'kpi grn' : (dr > 0.12 ? 'kpi yel' : 'kpi red'));
    chart.innerHTML = '';
    barsH(chart, { padL:190, data:[
      { label:'Неотъемлемый риск', value:+ir.value, color:'var(--s2)', note:'определяется бизнесом клиента' },
      { label:'Риск средств контроля', value:+cr.value, color:'var(--s4)', note:'определяется системой контроля клиента' },
      { label:'Риск существенного искажения', value:+(rmm * 100).toFixed(1), color:'var(--s3)', note:'IR × CR' },
      { label:'Допустимый DR', value:+(dr * 100).toFixed(1), color:'var(--s1)', note:'чем меньше, тем больше процедур' },
      { label:'Относительный объём процедур', value:eff, color:'var(--crit)', note:'условный индекс трудозатрат' },
    ], fmt: v => fmt(v, 1) + '%' });
    note.innerHTML = 'Модель <b>концептуальная</b>: на практике риск оценивается качественно (низкий / средний / высокий), а не перемножением процентов. Ценность модели — в направлении зависимости: <b>выше оценённый риск → ниже допустимый риск необнаружения → больше и надёжнее процедуры</b>.';
  }
  bindAll(form, calc);
}
