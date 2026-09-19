/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const typeNarrow: LegacyDemo = root => {
  const body = dShell(root, 'Как TypeScript сужает тип')
  const STEPS = [
    ['const value: unknown = getData()', 'unknown', 'Ничего нельзя: ни вызвать, ни обратиться к полю. Это безопасный «верх» иерархии.'],
    ['if (typeof value === "object" && value !== null) {', 'object', 'typeof отсеял примитивы. Проверка на null обязательна: typeof null тоже даёт "object".'],
    ['  if ("id" in value) {', '{ id: unknown }', 'Оператор in подтвердил наличие поля — TypeScript добавил его в тип.'],
    ['    if (typeof value.id === "number") {', '{ id: number }', 'Теперь поле типизировано точно, и с ним можно работать без as и без ?.'],
  ]
  const codeBox = dEl('div', 'el-code')
  const lines = STEPS.map(([c]) => { const n = dEl('div', 'el-line', c.replace(/</g, '&lt;')); codeBox.appendChild(n); return n })
  body.appendChild(codeBox)
  const t = dEl('div', 'el-step')
  body.appendChild(t)
  let i = 0
  function draw() {
    lines.forEach((n, k) => n.className = 'el-line' + (k === i ? ' on' : k < i ? ' done' : ''))
    t.innerHTML = '<span class="el-phase micro">тип: ' + STEPS[i][1] + '</span>' + STEPS[i][2]
    nx.disabled = i >= STEPS.length - 1; pv.disabled = i === 0
  }
  const ctl = dEl('div', 'demo-ctl')
  const pv = dBtn('←', 'sm', () => { i--; draw() })
  const nx = dBtn('Сузить →', 'pri', () => { i++; draw() })
  ctl.appendChild(pv); ctl.appendChild(nx)
  body.appendChild(ctl)
  body.appendChild(dEl('div', 'demo-note',
    'Сужать можно через <b>typeof</b>, <b>instanceof</b>, <b>in</b>, проверку на null, сравнение с литералом и свои предикаты <code>v is User</code>.'))
  draw()
}
