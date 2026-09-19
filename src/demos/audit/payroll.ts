import { bindAll, calcShell, dEl, dField, kpi, money, num } from '@/demos/helpers'
import type { LegacyDemo } from '@/engine/types'

/** Что происходит с рублём зарплаты: начисление, удержание, взносы, проводки. */
export const payroll: LegacyDemo = (root) => {
  const { form, out } = calcShell(root, 'Зарплата: начисления, удержания, взносы',
    'Ставки вынесены в поля: НДФЛ с 2025 года считается по прогрессивной шкале, а тариф страховых взносов зависит от статуса ' +
    'работодателя (для малого и среднего бизнеса часть выплат облагается по пониженному тарифу) и от предельной базы. ' +
    'Сверяйтесь с действующей редакцией НК на дату начисления.')

  const gross = dField(form, 'Начислено работнику за месяц, ₽', 120000, { step:1000 })
  const ndfl = dField(form, 'Ставка НДФЛ, %', 13, { step:1 })
  const deduct = dField(form, 'Стандартные вычеты за месяц, ₽', 0, { step:500 })
  const ins = dField(form, 'Совокупный тариф страховых взносов, %', 30, { step:0.1 })
  const njury = dField(form, 'Взносы на травматизм, %', 0.2, { step:0.1 })
  const cost = dField(form, 'Счёт затрат (20 — производство, 26 — АУП, 44 — продажи)', 26, { step:1 })

  const kpis = dEl('div', 'kpis')
  const wires = dEl('div')
  const note = dEl('div', 'demo-note')
  out.appendChild(kpis)
  out.appendChild(wires)
  out.appendChild(note)

  const kHand = kpi(kpis, 'На руки работнику', '', 'начислено минус НДФЛ', 'grn')
  const kNdfl = kpi(kpis, 'НДФЛ к перечислению', '', 'удержание из дохода работника', 'yel')
  const kIns = kpi(kpis, 'Страховые взносы', '', 'расход работодателя сверх зарплаты', 'red')
  const kTotal = kpi(kpis, 'Полная стоимость для компании', '', '', 'acc')

  function calc(): void {
    const g = num(gross)
    const base = Math.max(0, g - num(deduct))
    const tax = base * num(ndfl) / 100
    const contrib = g * (num(ins) + num(njury)) / 100
    const acc = String(Math.round(num(cost)))

    kHand.set(money(g - tax), 'начислено ' + money(g) + ' − НДФЛ ' + money(tax))
    kNdfl.set(money(tax), 'база ' + money(base) + ' × ' + num(ndfl) + '%')
    kIns.set(money(contrib), 'от начисленной суммы, а не от суммы на руки')
    kTotal.set(money(g + contrib), 'зарплата + взносы; на каждый рубль «на руки» приходится ' +
      (g - tax > 0 ? (((g + contrib) / (g - tax)).toFixed(2)) : '—') + ' ₽ затрат')

    wires.innerHTML = ''
    const tb = dEl('table', 'tbl')
    tb.innerHTML = '<tr><th>Операция</th><th>Проводка</th><th>Сумма</th></tr>' +
      '<tr><td>Начислена заработная плата</td><td>Дт ' + acc + ' Кт 70</td><td class="n">' + money(g) + '</td></tr>' +
      '<tr><td>Удержан НДФЛ</td><td>Дт 70 Кт 68</td><td class="n">' + money(tax) + '</td></tr>' +
      '<tr><td>Начислены страховые взносы</td><td>Дт ' + acc + ' Кт 69</td><td class="n">' + money(contrib) + '</td></tr>' +
      '<tr><td>Выплачена зарплата</td><td>Дт 70 Кт 51</td><td class="n">' + money(g - tax) + '</td></tr>' +
      '<tr><td>Перечислен НДФЛ</td><td>Дт 68 Кт 51</td><td class="n">' + money(tax) + '</td></tr>' +
      '<tr><td>Перечислены взносы</td><td>Дт 69 Кт 51</td><td class="n">' + money(contrib) + '</td></tr>'
    wires.appendChild(tb)

    note.innerHTML = '<b>Что здесь проверяет аудитор.</b> Пересчёт по выборке (оклад × отработанное время, надбавки, удержания), ' +
      'сверку итогов расчётной ведомости с оборотами по счетам 70, 68 и 69, сверку с отчётностью по взносам и НДФЛ, ' +
      'аналитику «средняя зарплата × численность» по месяцам. Ключевое различие, которое путают: ' +
      '<b>НДФЛ — удержание из дохода работника</b> (Дт 70), а <b>взносы — расход работодателя</b> (Дт счёта затрат). ' +
      'Отсюда и разный эффект на прибыль: взносы её уменьшают, НДФЛ — нет.'
  }

  bindAll(form, calc)
}
