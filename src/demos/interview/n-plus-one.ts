/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const nPlusOne: LegacyDemo = root => {
  const body = dShell(root, 'N+1: посчитайте запросы')
  const out = dEl('div', 'el-step')
  const list = dEl('div', 'arr')
  body.appendChild(list)
  body.appendChild(out)
  let n = 50

  function run(kind) {
    const queries = kind === 'bad' ? 1 + n * 2 : kind === 'join' ? 1 : 3
    list.innerHTML = ''
    for (let i = 0; i < Math.min(queries, 60); i++) {
      const c = dEl('div', 'arr-c')
      c.style.minWidth = '14px'; c.style.padding = '10px 3px'
      c.className = 'arr-c ' + (kind === 'bad' ? 'dup' : 'win')
      list.appendChild(c)
    }
    if (queries > 60) list.appendChild(dEl('div', 'arr-c', '+' + (queries - 60)))
    const rtt = 2
    out.innerHTML = kind === 'bad'
      ? '<span class="el-phase macro">' + queries + ' запроса</span>1 за списком + по одному на автора и позиции каждого из ' + n +
        ' заказов. При round-trip ' + rtt + 'мс это <b>~' + (queries * rtt) + 'мс</b> только на ожидание сети.'
      : kind === 'join'
      ? '<span class="el-phase micro">1 запрос</span>JOIN подтягивает связи сразу: <b>~' + rtt + 'мс</b>. Осторожно: несколько JOIN по коллекциям дают декартово произведение строк.'
      : '<span class="el-phase micro">3 запроса</span>Батч-загрузка: список + <code>WHERE id IN (…)</code> для авторов и позиций, связывание через Map в памяти. <b>~' + (3 * rtt) + 'мс</b>, без риска JOIN-взрыва.'
  }
  const ctl = dEl('div', 'demo-ctl')
  ctl.appendChild(dBtn('Цикл с await (N+1)', null, () => run('bad')))
  ctl.appendChild(dBtn('relations / JOIN', 'pri', () => run('join')))
  ctl.appendChild(dBtn('Батч через IN', null, () => run('batch')))
  body.appendChild(ctl)
  body.appendChild(dEl('div', 'demo-note',
    'Каждый квадрат — один поход в базу. Ловят N+1 по логам SQL на один HTTP-запрос или по «гребёнке» одинаковых спанов в трейсе.'))
  run('bad')
}
