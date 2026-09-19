/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const vat: LegacyDemo = root => {
  const { form, out } = calcShell(root, 'НДС: выделение, начисление, расчёт к уплате',
    'Ставка вынесена в поле ввода намеренно: она берётся из действующей редакции главы 21 НК РФ на дату операции. Проверять ставку, а не помнить её, — профессиональная привычка.');
  const rate = dField(form, 'Ставка НДС, %', 20, { step:1 });
  const gross = dField(form, 'Сумма с НДС, ₽', 1200000, { step:10000 });
  form.appendChild(dEl('h6', null, 'Расчёт налога к уплате за период'));
  const sales = dField(form, 'Реализация без НДС за период, ₽', 84000000, { step:100000 });
  const adv = dField(form, 'Полученные авансы (с НДС), ₽', 6000000, { step:100000 });
  const inp = dField(form, 'Входной НДС, принимаемый к вычету, ₽', 11300000, { step:100000 });
  const advDed = dField(form, 'Вычет НДС с авансов при отгрузке, ₽', 900000, { step:100000 });
  const rest = dField(form, 'Восстановленный НДС, ₽', 150000, { step:10000 });
  const k1 = dEl('div', 'kpis'); out.appendChild(k1);
  const k2 = dEl('div', 'kpis'); out.appendChild(k2);
  const chart = dEl('div'); out.appendChild(chart);
  const note = dEl('div', 'demo-note'); out.appendChild(note);
  const kBase = kpi(k1, 'Сумма без НДС', '', 'база: сумма × 100 ÷ (100 + ставка)');
  const kTax = kpi(k1, 'НДС в сумме', '', 'расчётная ставка: сумма × ставка ÷ (100 + ставка)', 'acc');
  const kOut = kpi(k2, 'НДС начисленный', '', 'с реализации и авансов', 'yel');
  const kIn = kpi(k2, 'НДС к вычету', '', 'входной + вычет с авансов', 'grn');
  const kPay = kpi(k2, 'К уплате в бюджет', '', '', 'acc');
  function calc(){
    const r = num(rate);
    const base = num(gross) * 100 / (100 + r);
    kBase.set(money(base), 'из ' + money(num(gross)) + ' с НДС');
    kTax.set(money(num(gross) - base), 'расчётная ставка ' + fmt(r) + '/' + fmt(100 + r));
    const outTax = num(sales) * r / 100 + num(adv) * r / (100 + r);
    const inTax = num(inp) + num(advDed);
    const pay = outTax - inTax + num(rest);
    kOut.set(money(outTax), 'реализация ' + money(num(sales) * r / 100) + ' + авансы ' + money(num(adv) * r / (100 + r)));
    kIn.set(money(inTax), 'входной ' + money(num(inp)) + ' + с авансов ' + money(num(advDed)));
    kPay.set(money(pay), pay < 0 ? 'НДС к возмещению — почти гарантированная камеральная проверка' : 'начисленный − вычеты + восстановленный',
      pay < 0 ? 'kpi red' : 'kpi acc');
    chart.innerHTML = '';
    stackRow(chart, { segments:[
      { name:'Вычеты', value:inTax, color:'var(--s3)' },
      { name:'Восстановлено', value:num(rest), color:'var(--s4)' },
      { name:'К уплате', value:Math.max(0, pay), color:'var(--s1)' },
    ], fmt: v => money(v) });
    note.innerHTML = 'Что проверяет аудитор: <b>сверку оборотов по счёту 90.1 и 91.1 с налоговой базой в декларации</b>, полноту начисления НДС с авансов (база возникает на более раннюю из дат — отгрузки или оплаты), наличие корректных счетов-фактур по принятым вычетам и обоснованность восстановления. Доля вычетов, близкая к 100%, — повод для отдельного внимания и к налоговому риску.';
  }
  bindAll(form, calc);
}
