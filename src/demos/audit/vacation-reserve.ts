import { bindAll, calcShell, dEl, dField, kpi, money, num } from '@/demos/helpers'
import type { LegacyDemo } from '@/engine/types'

/** Резерв отпусков — обязательство, про которое чаще всего забывают. */
export const vacationReserve: LegacyDemo = (root) => {
  const { form, out } = calcShell(root, 'Резерв на оплату отпусков',
    'Оценочное обязательство по ПБУ 8/2010: работник уже заработал дни отпуска, значит, обязанность у компании возникла — ' +
    'независимо от того, когда он пойдёт отдыхать. Не создают резерв только организации, имеющие право на упрощённый учёт.')

  const heads = dField(form, 'Численность работников', 48, { step:1 })
  const days = dField(form, 'Среднее число неиспользованных дней на человека', 11, { step:1 })
  const salary = dField(form, 'Средний дневной заработок, ₽', 3400, { step:100 })
  const ins = dField(form, 'Тариф страховых взносов, %', 30.2, { step:0.1 })
  const prev = dField(form, 'Сальдо счёта 96 на начало года, ₽', 3900000, { step:100000 })
  const used = dField(form, 'Использовано резерва за год (начислены отпускные), ₽', 4600000, { step:100000 })

  const kpis = dEl('div', 'kpis')
  const wires = dEl('div')
  const note = dEl('div', 'demo-note')
  out.appendChild(kpis)
  out.appendChild(wires)
  out.appendChild(note)

  const kBase = kpi(kpis, 'Отпускные без взносов', '', 'дни × средний заработок × численность')
  const kAll = kpi(kpis, 'Резерв на отчётную дату', '', 'с учётом страховых взносов', 'acc')
  const kMove = kpi(kpis, 'Доначислить за год', '', 'разница с остатком после использования', 'yel')
  const kEff = kpi(kpis, 'Влияние на прибыль', '', '')

  function calc(): void {
    const base = num(heads) * num(days) * num(salary)
    const total = base * (1 + num(ins) / 100)
    const rest = num(prev) - num(used)
    const move = total - rest

    kBase.set(money(base), num(heads) + ' чел. × ' + num(days) + ' дн. × ' + money(num(salary)))
    kAll.set(money(total), 'взносы ' + num(ins) + '% начисляются на отпускные так же, как на зарплату')
    kMove.set(money(move), move >= 0
      ? 'резерв доначисляется: Дт счёта затрат Кт 96'
      : 'избыток резерва восстанавливается: Дт 96 Кт 91.1', move >= 0 ? 'kpi yel' : 'kpi grn')
    kEff.set(money(-move), move >= 0 ? 'настолько уменьшится прибыль до налогообложения' : 'настолько увеличится прибыль',
      move >= 0 ? 'kpi red' : 'kpi grn')

    wires.innerHTML = ''
    const tb = dEl('table', 'tbl')
    tb.innerHTML = '<tr><th>Операция</th><th>Проводка</th></tr>' +
      '<tr><td>Создан (доначислен) резерв</td><td>Дт 20 / 26 / 44 Кт 96</td></tr>' +
      '<tr><td>Начислены отпускные за счёт резерва</td><td>Дт 96 Кт 70</td></tr>' +
      '<tr><td>Начислены взносы с отпускных</td><td>Дт 96 Кт 69</td></tr>' +
      '<tr><td>Восстановлен избыточный резерв</td><td>Дт 96 Кт 91.1</td></tr>'
    wires.appendChild(tb)

    note.innerHTML = '<b>Процедуры аудитора.</b> Получить кадровые данные об остатках отпусков на 31 декабря и пересчитать резерв самостоятельно; ' +
      'сверить численность с расчётной ведомостью; проверить, что взносы включены в расчёт; посмотреть ретроспективно, ' +
      'как прошлогодний резерв соотносится с фактически начисленными отпускными. ' +
      '<b>Частая находка:</b> резерв не создаётся вовсе — тогда занижены и обязательства, и расходы, а вместе с ними завышена прибыль. ' +
      'Вторая по частоте: резерв есть в бухучёте, но по нему не признана временная разница по ПБУ 18/02, ' +
      'потому что в налоговом учёте резерв формируется по другим правилам (статья 324.1 НК).'
  }

  bindAll(form, calc)
}
