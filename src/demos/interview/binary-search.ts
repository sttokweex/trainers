/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const binarySearch: LegacyDemo = root => {
  const body = dShell(root, 'Бинарный поиск по шагам')
  const arr = [2, 5, 8, 12, 16, 23, 38, 45, 56, 67, 72, 91]
  let target = 45, steps = [], i = 0

  const arrBox = dEl('div', 'arr')
  body.appendChild(arrBox)
  const info = dEl('div', 'el-step')
  body.appendChild(info)

  function build() {
    steps = []
    let lo = 0, hi = arr.length - 1
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2)
      if (arr[mid] === target) { steps.push({ lo, hi, mid, done: 'found' }); break }
      if (arr[mid] < target) { steps.push({ lo, hi, mid, go: 'right' }); lo = mid + 1 }
      else { steps.push({ lo, hi, mid, go: 'left' }); hi = mid - 1 }
    }
    if (!steps.length || (!steps[steps.length - 1].done && steps.length)) {
      const last = steps[steps.length - 1]
      if (!last || last.done !== 'found') steps.push({ lo: -1, hi: -1, mid: -1, done: 'miss' })
    }
    i = 0
  }
  function draw() {
    const s = steps[i] || {}
    arrBox.innerHTML = ''
    arr.forEach((v, idx) => {
      const c = dEl('div', 'arr-c')
      c.innerHTML = v + '<span class="i">' + idx + '</span>'
      if (s.lo >= 0 && idx >= s.lo && idx <= s.hi) c.classList.add('range')
      else c.classList.add('out')
      if (idx === s.mid) c.classList.add(s.done === 'found' ? 'found' : 'mid')
      arrBox.appendChild(c)
    })
    let text
    if (s.done === 'found') text = '<span class="el-phase micro">найдено</span>arr[' + s.mid + '] = ' + arr[s.mid] + ' — это цель. Шагов: ' + (i + 1) + ' вместо ' + arr.length + ' при переборе.'
    else if (s.done === 'miss') text = '<span class="el-phase end">не найдено</span>Диапазон схлопнулся: lo > hi. Возвращаем −1.'
    else text = '<span class="el-phase sync">шаг ' + (i + 1) + '</span>lo=' + s.lo + ', hi=' + s.hi + ', mid=' + s.mid +
      '. arr[' + s.mid + ']=' + arr[s.mid] + (s.go === 'right' ? ' &lt; цели → отбрасываем ЛЕВУЮ половину, lo = mid+1' : ' &gt; цели → отбрасываем ПРАВУЮ половину, hi = mid−1')
    info.innerHTML = text
    nextB.disabled = i >= steps.length - 1
  }
  const ctl = dEl('div', 'demo-ctl')
  const sel = document.createElement('select')
  sel.className = 'demo-b'
  arr.concat([100]).forEach(v => {
    const o = document.createElement('option'); o.value = v
    o.textContent = 'искать ' + v + (v === 100 ? ' (нет в массиве)' : '')
    sel.appendChild(o)
  })
  sel.value = 45
  sel.onchange = () => { target = +sel.value; build(); draw() }
  ctl.appendChild(sel)
  const nextB = dBtn('Шаг →', 'pri', () => { if (i < steps.length - 1) { i++; draw() } })
  ctl.appendChild(nextB)
  ctl.appendChild(dBtn('⟲', 'sm', () => { build(); draw() }))
  body.appendChild(ctl)
  body.appendChild(dEl('div', 'demo-note',
    'Каждый шаг отбрасывает <b>половину</b> оставшегося. 12 элементов → максимум 4 шага; миллион → 20 шагов.'))
  build(); draw()
}
