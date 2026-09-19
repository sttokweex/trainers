import { barsV, bindAll, calcShell, dEl, dField, dSelect, kpi, money, num, pct, th } from '@/demos/helpers'
import type { LegacyDemo } from '@/engine/types'

/** Выбор базы распределения меняет себестоимость — и прибыль по продуктам. */
export const costAlloc: LegacyDemo = (root) => {
  const { form, out } = calcShell(root, 'Распределение косвенных расходов',
    'Прямые затраты относятся на продукт напрямую, косвенные — по выбранной базе. База закрепляется в учётной политике. ' +
    'Посмотрите, как один и тот же цех даёт разную себестоимость при разных базах.')

  const overhead = dField(form, 'Косвенные расходы цеха за период, ₽', 4000000, { step:100000 })
  const base = dSelect(form, 'База распределения', [
    { v:'labor', t:'Зарплата основных рабочих' },
    { v:'mat', t:'Стоимость материалов' },
    { v:'hours', t:'Машино-часы' },
  ], 'labor')

  form.appendChild(dEl('h6', null, 'Продукт А'))
  const aMat = dField(form, 'Материалы, ₽', 3000000, { step:100000 })
  const aLab = dField(form, 'Зарплата рабочих, ₽', 1000000, { step:100000 })
  const aHours = dField(form, 'Машино-часы', 800, { step:50 })
  const aRev = dField(form, 'Выручка, ₽', 7000000, { step:100000 })

  form.appendChild(dEl('h6', null, 'Продукт Б'))
  const bMat = dField(form, 'Материалы, ₽', 1000000, { step:100000 })
  const bLab = dField(form, 'Зарплата рабочих, ₽', 3000000, { step:100000 })
  const bHours = dField(form, 'Машино-часы', 2400, { step:50 })
  const bRev = dField(form, 'Выручка, ₽', 6000000, { step:100000 })

  const kpis = dEl('div', 'kpis')
  const chart = dEl('div')
  const note = dEl('div', 'demo-note')
  out.appendChild(kpis)
  out.appendChild(chart)
  out.appendChild(note)

  const kA = kpi(kpis, 'Себестоимость А', '', '', 'acc')
  const kB = kpi(kpis, 'Себестоимость Б', '', '', 'acc')
  const kMa = kpi(kpis, 'Рентабельность А', '', '')
  const kMb = kpi(kpis, 'Рентабельность Б', '', '')

  function calc(): void {
    const pick = base.value
    const aBase = pick === 'mat' ? num(aMat) : pick === 'hours' ? num(aHours) : num(aLab)
    const bBase = pick === 'mat' ? num(bMat) : pick === 'hours' ? num(bHours) : num(bLab)
    const sum = aBase + bBase || 1

    const aOver = num(overhead) * aBase / sum
    const bOver = num(overhead) * bBase / sum
    const aCost = num(aMat) + num(aLab) + aOver
    const bCost = num(bMat) + num(bLab) + bOver
    const aMargin = num(aRev) ? (num(aRev) - aCost) / num(aRev) * 100 : 0
    const bMargin = num(bRev) ? (num(bRev) - bCost) / num(bRev) * 100 : 0

    kA.set(money(aCost), 'в том числе косвенных ' + money(aOver))
    kB.set(money(bCost), 'в том числе косвенных ' + money(bOver))
    kMa.set(pct(aMargin), 'выручка ' + money(num(aRev)), aMargin < 0 ? 'kpi red' : 'kpi grn')
    kMb.set(pct(bMargin), 'выручка ' + money(num(bRev)), bMargin < 0 ? 'kpi red' : 'kpi grn')

    chart.innerHTML = ''
    chart.appendChild(dEl('h6', null, 'Себестоимость по продуктам'))
    barsV(chart, {
      h: 210,
      xLabels: ['Продукт А', 'Продукт Б'],
      series: [
        { name:'Прямые затраты', color:'var(--s1)', values:[num(aMat) + num(aLab), num(bMat) + num(bLab)] },
        { name:'Косвенные расходы', color:'var(--s2)', values:[aOver, bOver] },
      ],
      fmt: (v) => money(v ?? 0),
      tick: (v) => th(v ?? 0),
    })

    note.innerHTML = '<b>Зачем это аудитору.</b> Сумма косвенных расходов не меняется — меняется только то, на какой продукт они сядут. ' +
      'Поэтому база распределения влияет на себестоимость запасов, на остаток незавершённого производства и, через него, на прибыль периода. ' +
      'Проверяйте: закреплена ли база в учётной политике, применяется ли она последовательно, не менялась ли она в отчётном году ' +
      '(смена базы без изменения обстоятельств — это изменение учётной политики с ретроспективным пересчётом), ' +
      'и не попали ли в косвенные расходы управленческие затраты, которые по ФСБУ 5/2019 в себестоимость запасов не включаются.'
  }

  bindAll(form, calc)
}
