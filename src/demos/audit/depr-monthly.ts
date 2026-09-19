import { bindAll, calcShell, dEl, dField, dSelect, fmt, kpi, money, num } from '@/demos/helpers'
import type { LegacyDemo } from '@/engine/types'

/** С какого месяца начинать амортизацию — ошибка на стыке ФСБУ и привычки. */
export const deprMonthly: LegacyDemo = (root) => {
  const { form, out } = calcShell(root, 'Амортизация по месяцам: с какой даты начислять',
    'ФСБУ 6/2020 допускает два варианта начала начисления: с даты признания объекта в учёте либо с 1-го числа месяца, ' +
    'следующего за месяцем признания. Выбор закрепляется в учётной политике и применяется последовательно. ' +
    'Сравните, как расходятся суммы первого года.')

  const cost = dField(form, 'Первоначальная стоимость, ₽', 1200000, { step:50000 })
  const lv = dField(form, 'Ликвидационная стоимость, ₽', 120000, { step:10000 })
  const spi = dField(form, 'Срок полезного использования, лет', 5, { step:1, min:1, max:30 })
  const month = dSelect(form, 'Месяц ввода в эксплуатацию', [
    { v:1, t:'Январь' }, { v:2, t:'Февраль' }, { v:3, t:'Март' }, { v:4, t:'Апрель' },
    { v:5, t:'Май' }, { v:6, t:'Июнь' }, { v:7, t:'Июль' }, { v:8, t:'Август' },
    { v:9, t:'Сентябрь' }, { v:10, t:'Октябрь' }, { v:11, t:'Ноябрь' }, { v:12, t:'Декабрь' },
  ], '9')

  const kpis = dEl('div', 'kpis')
  const tableBox = dEl('div')
  const note = dEl('div', 'demo-note')
  out.appendChild(kpis)
  out.appendChild(tableBox)
  out.appendChild(note)

  const kMonth = kpi(kpis, 'Месячная амортизация', '', '(стоимость − ликвидационная) ÷ срок в месяцах', 'acc')
  const kNext = kpi(kpis, 'За год: со следующего месяца', '', 'привычный подход, знакомый по ПБУ 6/01')
  const kSame = kpi(kpis, 'За год: с даты признания', '', 'вариант, разрешённый ФСБУ 6/2020', 'grn')
  const kDiff = kpi(kpis, 'Разница в первом году', '', 'ровно один месяц амортизации', 'yel')

  function calc(): void {
    const months = Math.max(1, Math.round(num(spi)) * 12)
    const perMonth = (num(cost) - num(lv)) / months
    const m = Math.round(num(month))
    const nextMonths = Math.max(0, 12 - m)
    const sameMonths = Math.max(0, 13 - m)

    kMonth.set(money(perMonth), months + ' месяцев полезного использования')
    kNext.set(money(perMonth * nextMonths), nextMonths + ' мес. начисления в первом году')
    kSame.set(money(perMonth * sameMonths), sameMonths + ' мес. начисления в первом году')
    kDiff.set(money(perMonth), 'на эту сумму отличаются расходы и остаточная стоимость на 31 декабря')

    tableBox.innerHTML = ''
    const tb = dEl('table', 'tbl')
    const names = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
    let rows = '<tr><th>Месяц</th><th>Со следующего месяца</th><th>С даты признания</th></tr>'
    for (let i = 1; i <= 12; i++) {
      const a = i > m ? perMonth : 0
      const b = i >= m ? perMonth : 0
      rows += '<tr' + (i === m ? ' class="hl"' : '') + '><td>' + names[i - 1] + (i === m ? ' — ввод' : '') +
        '</td><td class="n">' + (a ? fmt(a) : '—') + '</td><td class="n">' + (b ? fmt(b) : '—') + '</td></tr>'
    }
    tb.innerHTML = rows
    tableBox.appendChild(tb)

    note.innerHTML = '<b>Почему это важно проверять.</b> Разница в один месяц выглядит мелочью, но на реестре из сотен объектов ' +
      'она складывается в заметную сумму и легко переходит порог существенности по статье. ' +
      'Дополнительно проверьте: применяется ли выбранный вариант последовательно ко всем объектам; ' +
      'не приостановлена ли амортизация на время простоя или консервации (по ФСБУ 6/2020 её не приостанавливают); ' +
      'прекращается ли начисление при достижении балансовой стоимостью ликвидационной, а не нуля.'
  }

  bindAll(form, calc)
}
