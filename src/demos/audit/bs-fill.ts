import { bindAll, calcShell, dEl, dField, fmt, kpi } from '@/demos/helpers'
import type { LegacyDemo } from '@/engine/types'

interface Row {
  /** Счёт. */
  acc: string
  name: string
  /** Сальдо: положительное — дебетовое, отрицательное — кредитовое. */
  v: number
  /** Куда попадает в балансе. */
  line: string
  side: 'A' | 'P'
}

/** Собираем баланс из оборотки: видно, что строка — это сумма сальдо. */
export const bsFill: LegacyDemo = (root) => {
  const { form, out } = calcShell(root, 'Соберите баланс из оборотно-сальдовой ведомости',
    'Меняйте сальдо — строки баланса пересчитаются. Обратите внимание: актив и пассив сходятся сами собой, ' +
    'пока каждое сальдо попадает в свою строку. Расхождение означает потерянный счёт, а не «ошибку программы».')

  const ROWS: Row[] = [
    { acc:'01', name:'Основные средства', v:42000, line:'1150 Основные средства', side:'A' },
    { acc:'02', name:'Амортизация ОС', v:-15600, line:'1150 Основные средства', side:'A' },
    { acc:'04', name:'НМА', v:3200, line:'1110 Нематериальные активы', side:'A' },
    { acc:'05', name:'Амортизация НМА', v:-900, line:'1110 Нематериальные активы', side:'A' },
    { acc:'09', name:'Отложенные налоговые активы', v:1400, line:'1180 Отложенные налоговые активы', side:'A' },
    { acc:'10', name:'Материалы', v:8200, line:'1210 Запасы', side:'A' },
    { acc:'41', name:'Товары', v:19800, line:'1210 Запасы', side:'A' },
    { acc:'14', name:'Резерв под обесценение запасов', v:-1200, line:'1210 Запасы', side:'A' },
    { acc:'19', name:'НДС по приобретённым ценностям', v:900, line:'1220 НДС по приобретённым ценностям', side:'A' },
    { acc:'62', name:'Расчёты с покупателями (дебет)', v:31000, line:'1230 Дебиторская задолженность', side:'A' },
    { acc:'63', name:'Резерв по сомнительным долгам', v:-2600, line:'1230 Дебиторская задолженность', side:'A' },
    { acc:'60', name:'Авансы выданные (дебет)', v:1800, line:'1230 Дебиторская задолженность', side:'A' },
    { acc:'51', name:'Расчётный счёт', v:14000, line:'1250 Денежные средства', side:'A' },
    { acc:'50', name:'Касса', v:120, line:'1250 Денежные средства', side:'A' },
    { acc:'80', name:'Уставный капитал', v:-5000, line:'1310 Уставный капитал', side:'P' },
    { acc:'82', name:'Резервный капитал', v:-750, line:'1360 Резервный капитал', side:'P' },
    { acc:'84', name:'Нераспределённая прибыль', v:-38170, line:'1370 Нераспределённая прибыль', side:'P' },
    { acc:'67', name:'Долгосрочные кредиты', v:-20000, line:'1410 Заёмные средства (долгоср.)', side:'P' },
    { acc:'77', name:'Отложенные налоговые обязательства', v:-800, line:'1420 Отложенные налоговые обязательства', side:'P' },
    { acc:'66', name:'Краткосрочные кредиты', v:-9000, line:'1510 Заёмные средства (краткоср.)', side:'P' },
    { acc:'60к', name:'Расчёты с поставщиками (кредит)', v:-21000, line:'1520 Кредиторская задолженность', side:'P' },
    { acc:'62к', name:'Авансы полученные (кредит)', v:-2400, line:'1520 Кредиторская задолженность', side:'P' },
    { acc:'68', name:'Расчёты по налогам', v:-3100, line:'1520 Кредиторская задолженность', side:'P' },
    { acc:'70', name:'Расчёты с персоналом', v:-3100, line:'1520 Кредиторская задолженность', side:'P' },
    { acc:'96', name:'Оценочные обязательства (отпуска)', v:-1800, line:'1540 Оценочные обязательства', side:'P' },
  ]

  const inputs: { row: Row; inp: HTMLInputElement }[] = []
  form.appendChild(dEl('h6', null, 'Сальдо по счетам, тыс. ₽ (минус — кредитовое)'))
  const cols = dEl('div', 'two')
  const left = dEl('div')
  const right = dEl('div')
  cols.appendChild(left)
  cols.appendChild(right)
  form.appendChild(cols)

  ROWS.forEach((row, i) => {
    const inp = dField(i < 14 ? left : right, row.acc + ' — ' + row.name, row.v, { step:100 })
    inputs.push({ row, inp })
  })

  const kpis = dEl('div', 'kpis')
  const tableBox = dEl('div')
  out.appendChild(kpis)
  out.appendChild(tableBox)
  const kA = kpi(kpis, 'Итого актив', '', 'сумма дебетовых строк', 'acc')
  const kP = kpi(kpis, 'Итого пассив', '', 'сумма кредитовых строк', 'acc')
  const kD = kpi(kpis, 'Проверка', '', '')

  function calc(): void {
    const lines = new Map<string, { sum: number; side: 'A' | 'P' }>()
    for (const { row, inp } of inputs) {
      const v = Number(String(inp.value).replace(',', '.')) || 0
      const cur = lines.get(row.line) ?? { sum: 0, side: row.side }
      cur.sum += row.side === 'A' ? v : -v
      lines.set(row.line, cur)
    }

    let totalA = 0
    let totalP = 0
    const rows: string[] = []
    for (const [name, { sum, side }] of lines) {
      if (side === 'A') totalA += sum
      else totalP += sum
      rows.push('<tr><td>' + name + '</td><td class="n">' + fmt(sum) + '</td><td>' +
        (side === 'A' ? 'актив' : 'пассив') + '</td></tr>')
    }

    tableBox.innerHTML = ''
    const tb = dEl('table', 'tbl')
    tb.innerHTML = '<tr><th>Строка баланса</th><th>Сумма, тыс. ₽</th><th>Сторона</th></tr>' + rows.join('') +
      '<tr class="hl"><td><b>БАЛАНС (актив)</b></td><td class="n"><b>' + fmt(totalA) + '</b></td><td></td></tr>' +
      '<tr class="hl"><td><b>БАЛАНС (пассив)</b></td><td class="n"><b>' + fmt(totalP) + '</b></td><td></td></tr>'
    tableBox.appendChild(tb)

    kA.set(fmt(totalA) + ' тыс. ₽')
    kP.set(fmt(totalP) + ' тыс. ₽')
    const diff = totalA - totalP
    kD.set(Math.abs(diff) < 0.5 ? 'сходится ✔' : 'расхождение ' + fmt(diff),
      Math.abs(diff) < 0.5
        ? 'актив равен пассиву — оборотка собрана полностью'
        : 'ищите счёт, сальдо которого не попало ни в одну строку',
      Math.abs(diff) < 0.5 ? 'kpi grn' : 'kpi red')
  }

  bindAll(form, calc)
}
