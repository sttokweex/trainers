/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const slidingWindow: LegacyDemo = root => {
  const body = dShell(root, 'Скользящее окно: длиннейшая подстрока без повторов')
  const str = 'abcabcbb'
  let steps = [], i = 0

  function build() {
    steps = []
    const seen = new Map()
    let left = 0, best = 0, bestRange = [0, 0]
    for (let right = 0; right < str.length; right++) {
      const ch = str[right]
      let moved = false
      if (seen.has(ch) && seen.get(ch) >= left) { left = seen.get(ch) + 1; moved = true }
      seen.set(ch, right)
      const len = right - left + 1
      if (len > best) { best = len; bestRange = [left, right] }
      steps.push({ left, right, best, moved, ch, bestRange: [...bestRange] })
    }
    i = 0
  }
  const arrBox = dEl('div', 'arr')
  body.appendChild(arrBox)
  const info = dEl('div', 'el-step')
  body.appendChild(info)

  function draw() {
    const s = steps[i]
    arrBox.innerHTML = ''
    str.split('').forEach((ch, idx) => {
      const c = dEl('div', 'arr-c')
      c.innerHTML = ch + '<span class="i">' + idx + '</span>'
      if (idx >= s.left && idx <= s.right) c.classList.add('win')
      else c.classList.add('out')
      if (idx === s.right && s.moved) c.classList.add('dup')
      arrBox.appendChild(c)
    })
    info.innerHTML = '<span class="el-phase ' + (s.moved ? 'macro' : 'sync') + '">right = ' + s.right + '</span>' +
      'Впустили «' + s.ch + '». ' +
      (s.moved ? '<b style="color:var(--yel)">Символ уже в окне → сдвигаем левую границу за его прошлую позицию: left = ' + s.left + '.</b> '
               : 'Повторов нет, окно растёт. ') +
      'Длина окна = ' + (s.right - s.left + 1) + ', лучший результат = ' + s.best + '.'
    nextB.disabled = i >= steps.length - 1
  }
  const ctl = dEl('div', 'demo-ctl')
  const nextB = dBtn('Шаг →', 'pri', () => { if (i < steps.length - 1) { i++; draw() } })
  ctl.appendChild(nextB)
  ctl.appendChild(dBtn('⟲', 'sm', () => { build(); draw() }))
  body.appendChild(ctl)
  body.appendChild(dEl('div', 'demo-note',
    'Оба указателя проходят строку максимум один раз, поэтому это <b>O(n)</b>, несмотря на внешне вложенную логику.'))
  build(); draw()
}
