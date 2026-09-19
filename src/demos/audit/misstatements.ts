/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const misstatements: LegacyDemo = root => {
  const { form, out } = calcShell(root, 'Перечень неисправленных искажений и его влияние на мнение');
  const om = dField(form, 'Существенность для отчётности (OM), ₽', 12000000, { step:500000 });
  const pm = dField(form, 'Существенность для процедур (PM), ₽', 7800000, { step:500000 });
  const M = [
    { n:'Не отражён счёт подрядчика за декабрьские работы', v:2400000, t:'Фактическое', eff:'Занижены расходы и кредиторка' },
    { n:'Занижен резерв по сомнительным долгам (оценка аудитора)', v:4100000, t:'Оценочное', eff:'Завышены дебиторка и прибыль' },
    { n:'Экстраполяция искажений выборки по расходам', v:1900000, t:'Прогнозное', eff:'Занижены расходы' },
    { n:'Не начислен НДС с декабрьского аванса', v:900000, t:'Фактическое', eff:'Занижено обязательство перед бюджетом' },
    { n:'Выручка января проведена декабрём (cut-off)', v:3200000, t:'Фактическое', eff:'Завышены выручка и дебиторка' },
    { n:'Не раскрыта сделка со связанной стороной на 5 млн ₽', v:0, t:'Качественное', eff:'Раскрытие: суммы нет, но искажение существенно по характеру' },
  ];
  const fixed = {};
  const tb = dEl('table', 'tbl');
  tb.innerHTML = '<tr><th>Искажение</th><th>Вид</th><th>Эффект</th><th>Сумма, ₽</th><th>Клиент исправил?</th></tr>';
  M.forEach((m, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' + m.n + '</td><td>' + m.t + '</td><td>' + m.eff + '</td><td class="n">' + (m.v ? fmt(m.v) : '—') + '</td>';
    const td = document.createElement('td');
    const b = dEl('button', 'demo-b sm', 'не исправлено');
    b.type = 'button';
    b.onclick = () => { fixed[i] = !fixed[i]; b.classList.toggle('on', fixed[i]); b.textContent = fixed[i] ? '✔ исправлено' : 'не исправлено'; calc() };
    td.appendChild(b); tr.appendChild(td);
    tb.appendChild(tr);
    m.node = tr;
  });
  form.appendChild(tb);
  const k = dEl('div', 'kpis'); out.appendChild(k);
  const verdict = dEl('div', 'tree-out ok'); out.appendChild(verdict);
  const note = dEl('div', 'demo-note'); out.appendChild(note);
  function calc(){
    let tot = 0, qual = false;
    M.forEach((m, i) => {
      if (fixed[i]){ m.node.className = ''; return }
      m.node.className = 'bad';
      if (m.t === 'Качественное') qual = true; else tot += m.v;
    });
    k.innerHTML = '';
    kpi(k, 'Сумма неисправленных искажений', money(tot), 'агрегированно, без учёта знака — консервативный подход', tot >= num(om) ? 'red' : 'yel');
    kpi(k, 'Доля от OM', pct(tot / Math.max(1, num(om)) * 100), 'существенность ' + money(num(om)));
    kpi(k, 'Качественное искажение', qual ? 'есть' : 'нет', qual ? 'нераскрытая связанная сторона' : '', qual ? 'red' : 'grn');
    let cls, head, txt;
    if (qual){
      cls = 'bad'; head = 'Мнение с оговоркой (как минимум)';
      txt = 'Нераскрытая операция со связанной стороной существенна <b>по характеру</b> независимо от суммы: она влияет на понимание пользователем отношений и рисков. ' +
            'Пока раскрытие не исправлено, немодифицированное мнение невозможно.';
    } else if (tot >= num(om)){
      cls = 'bad'; head = 'Мнение с оговоркой или отрицательное';
      txt = 'Совокупные неисправленные искажения превышают OM. Если искажения сосредоточены в конкретных статьях — оговорка; если они затрагивают значительную часть отчётности ' +
            'и влияние всеобъемлющее — отрицательное мнение.';
    } else if (tot >= num(pm)){
      cls = 'q'; head = 'Ниже OM, но выше PM — зона повышенного внимания';
      txt = 'Формально отчётность не искажена существенно, но запас невелик: невыявленные искажения могут перевести сумму через порог. ' +
            'Нужно расширить процедуры на участках-источниках и ещё раз настоять на исправлении.';
    } else {
      cls = 'ok'; head = 'Немодифицированное мнение возможно';
      txt = 'Совокупность неисправленных искажений ниже существенности. Перечень всё равно передаётся лицам, отвечающим за корпоративное управление, ' +
            'и включается в письменные заявления руководства.';
    }
    verdict.className = 'tree-out ' + cls;
    verdict.innerHTML = '<b>' + head + '</b>' + txt;
    note.innerHTML = 'Тонкости, о которых спрашивают на ревью: (1) искажения агрегируются <b>с учётом эффекта прошлых периодов</b>; ' +
      '(2) взаимозачёт разнонаправленных искажений возможен, но требует осторожности — завышение выручки не «компенсируется» занижением расходов, если это разные предпосылки и разные статьи; ' +
      '(3) большое количество мелких исправленных искажений само по себе сигнализирует о недостатках контроля и может изменить оценку рисков.';
  }
  bindAll(form, calc);
}
