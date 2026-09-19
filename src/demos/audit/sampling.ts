/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const sampling: LegacyDemo = root => {
  const { form, out } = calcShell(root, 'Объём выборки: MUS и нестатистический подход');
  const bv = dField(form, 'Балансовая стоимость совокупности, ₽', 412350000, { step:1000000 });
  const keyv = dField(form, 'Из них ключевые элементы (проверяются сплошь), ₽', 286100000, { step:1000000 });
  const tm = dField(form, 'Допустимое искажение (обычно = PM), ₽', 8400000, { step:100000 });
  const risk = dSelect(form, 'Допустимый риск выборки', [
    { v:'3.0', t:'5% (уверенность 95%) — коэффициент 3,0' },
    { v:'2.3', t:'10% (уверенность 90%) — коэффициент 2,3' },
    { v:'1.6', t:'20% — коэффициент 1,6' },
  ], '3.0');
  const k = dEl('div', 'kpis'); out.appendChild(k);
  const chart = dEl('div'); out.appendChild(chart);
  const note = dEl('div', 'demo-note'); out.appendChild(note);
  const kI = kpi(k, 'Интервал выборки', '', 'каждый N-й рубль совокупности', 'acc');
  const kN = kpi(k, 'Объём выборки', '', 'элементов из остатка совокупности', 'grn');
  const kC = kpi(k, 'Покрытие', '', 'доля совокупности под процедурами');
  function calc(){
    const rest = Math.max(0, num(bv) - num(keyv));
    const rf = parseFloat(risk.value);
    const interval = num(tm) / rf;
    const n = Math.ceil(rest / interval);
    kI.set(money(interval), 'допустимое искажение ÷ коэффициент ' + rf);
    kN.set(fmt(n) + ' шт.', 'остаток совокупности ' + money(rest) + ' ÷ интервал');
    const covered = num(keyv) + Math.min(rest, n * interval * 0.25);
    kC.set(pct(num(keyv) / Math.max(1, num(bv)) * 100), 'только ключевыми элементами; выборка добавляет покрытие сверху');
    chart.innerHTML = '';
    const variants = [0.5, 0.75, 1, 1.5, 2].map(m => ({
      label: 'TM × ' + m, value: Math.ceil(rest / (num(tm) * m / rf)), note:'допустимое искажение ' + money(num(tm) * m),
    }));
    barsV(chart, { h:200, xLabels:variants.map(v => v.label),
      series:[{ name:'Объём выборки, элементов', color:'var(--s1)', values:variants.map(v => v.value) }],
      fmt: v => fmt(v) + ' шт.' });
    note.innerHTML = 'Обратите внимание на форму зависимости: <b>вдвое более жёсткое допустимое искажение удваивает объём выборки</b>. Поэтому существенность, посчитанная слишком консервативно на планировании, напрямую оплачивается часами команды. Размер совокупности в этой модели не участвует — для больших совокупностей он почти не влияет на объём.';
  }
  bindAll(form, calc);
}
