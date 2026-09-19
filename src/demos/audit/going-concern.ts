/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const goingConcern: LegacyDemo = root => {
  const { form, out } = calcShell(root, 'Непрерывность деятельности: индикаторы и Z-счёт',
    'Z-счёт Альтмана — вспомогательный индикатор, построенный на статистике банкротств, а не вывод аудитора. Он не заменяет анализ денежных потоков и планов руководства, но хорошо структурирует первый взгляд.');
  const wc = dField(form, 'Оборотный капитал (ОА − КО), ₽', -8000000, { step:1000000 });
  const re = dField(form, 'Нераспределённая прибыль, ₽', 12000000, { step:1000000 });
  const ebit = dField(form, 'Прибыль до процентов и налогов, ₽', 9000000, { step:1000000 });
  const eq = dField(form, 'Капитал (балансовая стоимость), ₽', 25000000, { step:1000000 });
  const li = dField(form, 'Обязательства, ₽', 95000000, { step:1000000 });
  const ta = dField(form, 'Активы, ₽', 120000000, { step:1000000 });
  const rev = dField(form, 'Выручка, ₽', 180000000, { step:1000000 });
  const IND = [
    'Отрицательный операционный денежный поток второй год подряд',
    'Нарушен финансовый ковенант по кредитному договору',
    'Чистые активы меньше уставного капитала',
    'Просроченная задолженность перед бюджетом или по зарплате',
    'Отказ банка в пролонгации краткосрочного кредита',
    'Потеря основного покупателя или лицензии',
    'Значительные судебные иски с возможным катастрофическим исходом',
  ];
  const box = dEl('div');
  box.appendChild(dEl('h6', null, 'Отметьте выявленные индикаторы'));
  const checks = [];
  IND.forEach(t => {
    const lab = dEl('label', 'chk');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    lab.appendChild(cb);
    lab.appendChild(dEl('span', null, t));
    box.appendChild(lab);
    checks.push(cb);
  });
  form.appendChild(box);
  const k = dEl('div', 'kpis'); out.appendChild(k);
  const verdict = dEl('div', 'tree-out ok'); out.appendChild(verdict);
  function calc(){
    const A = Math.max(1, num(ta));
    const x1 = num(wc) / A, x2 = num(re) / A, x3 = num(ebit) / A, x4 = num(eq) / Math.max(1, num(li)), x5 = num(rev) / A;
    const z = 0.717 * x1 + 0.847 * x2 + 3.107 * x3 + 0.420 * x4 + 0.998 * x5;
    const cnt = checks.filter(c => c.checked).length;
    k.innerHTML = '';
    kpi(k, 'Z-счёт (модель для непубличных компаний)', fmt(z, 2),
      z > 2.9 ? 'зона устойчивости' : (z > 1.23 ? 'серая зона' : 'зона риска банкротства'),
      z > 2.9 ? 'grn' : (z > 1.23 ? 'yel' : 'red'));
    kpi(k, 'Отмечено индикаторов', cnt + ' из ' + IND.length, 'каждый требует отдельной процедуры', cnt >= 3 ? 'red' : (cnt ? 'yel' : 'grn'));
    kpi(k, 'Финансовый рычаг', fmt(num(li) / Math.max(1, num(eq)), 2), 'обязательства ÷ капитал');
    let cls, head, txt;
    if (cnt === 0 && z > 2.9){
      cls = 'ok'; head = 'Существенной неопределённости не выявлено';
      txt = 'Процедуры выполнены, допущение о непрерывности уместно. В заключении — обычное немодифицированное мнение. Не забудьте задокументировать сам факт оценки.';
    } else if (cnt <= 2 && z > 1.23){
      cls = 'q'; head = 'Есть события и условия, требующие внимания';
      txt = 'Нужно получить анализ руководства на период не менее 12 месяцев от отчётной даты, проверить модель денежных потоков и реалистичность планов по смягчению, ' +
            'получить письменные заявления. Если смягчающие факторы убедительны и неопределённость не является существенной — мнение не модифицируется.';
    } else {
      cls = 'bad'; head = 'Признаки существенной неопределённости';
      txt = 'Дальше решает <b>качество раскрытия</b>. Если раскрытие адекватное — немодифицированное мнение плюс отдельный раздел «Существенная неопределённость в отношении непрерывности деятельности». ' +
            'Если раскрытие недостаточное — мнение с оговоркой или отрицательное. Если допущение о непрерывности вообще неуместно, а отчётность составлена как для действующей компании — отрицательное мнение.';
    }
    verdict.className = 'tree-out ' + cls;
    verdict.innerHTML = '<b>' + head + '</b>' + txt;
  }
  bindAll(form, calc);
}
