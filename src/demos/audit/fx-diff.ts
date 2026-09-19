import { bindAll, calcShell, dEl, dField, kpi, money, num } from '@/demos/helpers'
import type { LegacyDemo } from '@/engine/types'

/** Курсовые разницы: что переоценивается, а что остаётся по старому курсу. */
export const fxDiff: LegacyDemo = (root) => {
  const { form, out } = calcShell(root, 'Курсовые разницы по ПБУ 3/2006',
    'Денежные статьи (деньги на валютном счёте, задолженность в валюте) пересчитываются на каждую отчётную дату и на дату платежа. ' +
    'Полученные и выданные авансы к ним не относятся: они фиксируются по курсу на дату аванса и больше не переоцениваются.')

  const amount = dField(form, 'Сумма контракта, валюта', 100000, { step:1000 })
  const rate1 = dField(form, 'Курс на дату отгрузки', 92.4, { step:0.1 })
  const rate2 = dField(form, 'Курс на 31 декабря', 97.8, { step:0.1 })
  const rate3 = dField(form, 'Курс на дату оплаты', 95.1, { step:0.1 })

  const kpis = dEl('div', 'kpis')
  const wires = dEl('div')
  const note = dEl('div', 'demo-note')
  out.appendChild(kpis)
  out.appendChild(wires)
  out.appendChild(note)

  const kStart = kpi(kpis, 'Выручка при отгрузке', '', 'фиксируется навсегда по курсу на дату признания')
  const kYear = kpi(kpis, 'Разница на отчётную дату', '', '', 'acc')
  const kPay = kpi(kpis, 'Разница при оплате', '', '', 'acc')
  const kTotal = kpi(kpis, 'Итого в прочих доходах и расходах', '', '')

  function calc(): void {
    const a = num(amount)
    const start = a * num(rate1)
    const atYear = a * num(rate2)
    const atPay = a * num(rate3)
    const d1 = atYear - start
    const d2 = atPay - atYear

    kStart.set(money(start), a + ' × ' + num(rate1))
    kYear.set((d1 >= 0 ? '+' : '') + money(d1), d1 >= 0
      ? 'положительная: Дт 62 Кт 91.1' : 'отрицательная: Дт 91.2 Кт 62', d1 >= 0 ? 'kpi grn' : 'kpi red')
    kPay.set((d2 >= 0 ? '+' : '') + money(d2), d2 >= 0
      ? 'положительная: Дт 52 Кт 91.1' : 'отрицательная: Дт 91.2 Кт 52', d2 >= 0 ? 'kpi grn' : 'kpi red')
    kTotal.set((d1 + d2 >= 0 ? '+' : '') + money(d1 + d2),
      'выручка при этом остаётся ' + money(start) + ' — курсовые разницы в неё не попадают', 'kpi yel')

    wires.innerHTML = ''
    const tb = dEl('table', 'tbl')
    tb.innerHTML = '<tr><th>Дата</th><th>Операция</th><th>Проводка</th><th>Сумма</th></tr>' +
      '<tr><td>Отгрузка</td><td>Признана выручка по курсу на дату отгрузки</td><td>Дт 62 Кт 90.1</td><td class="n">' + money(start) + '</td></tr>' +
      '<tr><td>31 декабря</td><td>Пересчёт валютной задолженности</td><td>' +
        (d1 >= 0 ? 'Дт 62 Кт 91.1' : 'Дт 91.2 Кт 62') + '</td><td class="n">' + money(Math.abs(d1)) + '</td></tr>' +
      '<tr><td>Оплата</td><td>Поступление валюты и разница за период</td><td>Дт 52 Кт 62 + ' +
        (d2 >= 0 ? 'Дт 62 Кт 91.1' : 'Дт 91.2 Кт 62') + '</td><td class="n">' + money(Math.abs(d2)) + '</td></tr>'
    wires.appendChild(tb)

    note.innerHTML = '<b>Что проверяет аудитор.</b> Использован ли официальный курс на нужную дату; переоценены ли <b>все</b> валютные ' +
      'денежные статьи, включая остатки на счетах, займы и проценты по ним; не переоценены ли <b>авансы</b> — ' +
      'это самая частая ошибка, из-за которой искажаются и выручка, и прочие доходы. ' +
      'Отдельно смотрят на резкие скачки курса вокруг отчётной даты: курсовые разницы способны развернуть финансовый результат, ' +
      'и в пояснениях это должно быть раскрыто.'
  }

  bindAll(form, calc)
}
