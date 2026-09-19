/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const bigo: LegacyDemo = root => {
  const body = dShell(root, 'Как растёт время при росте n')
  const W = 520, H = 170, PAD = 8
  const FN = [
    ['O(1)',        n => 1,                 '#7ee787'],
    ['O(log n)',    n => Math.log2(n + 1),  '#79c0ff'],
    ['O(n)',        n => n,                 '#f0c674'],
    ['O(n log n)',  n => n * Math.log2(n + 1), '#ff9d5c'],
    ['O(n²)',       n => n * n,             '#f85149'],
  ]
  const box = dEl('div', 'bo-chart')
  box.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none"></svg>'
  body.appendChild(box)
  const svg = box.querySelector('svg')

  const out = dEl('div', 'demo-note')
  function draw(maxN) {
    const pts = 60
    let max = 0
    const series = FN.map(([, f]) => {
      const arr = []
      for (let i = 0; i <= pts; i++) {
        const n = (i / pts) * maxN
        const v = f(n)
        arr.push(v)
        if (v > max) max = v
      }
      return arr
    })
    svg.innerHTML = FN.map(([, , color], si) => {
      const d = series[si].map((v, i) => {
        const x = PAD + (i / pts) * (W - PAD * 2)
        const y = H - PAD - (v / max) * (H - PAD * 2)
        return (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1)
      }).join(' ')
      return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linejoin="round"/>'
    }).join('')

    const rows = FN.map(([name, f]) => {
      const v = f(maxN)
      return name + ': ' + (v < 1000 ? Math.round(v) : v.toExponential(1)) + ' операций'
    })
    out.innerHTML = 'При n = <b>' + maxN + '</b> → ' + rows.join(' · ')
  }

  const leg = dEl('div', 'bo-leg')
  FN.forEach(([name, , color]) => {
    const sp = dEl('span')
    const i = dEl('i'); i.style.background = color
    sp.appendChild(i); sp.appendChild(document.createTextNode(name))
    leg.appendChild(sp)
  })
  body.appendChild(leg)

  const ctl = dEl('div', 'demo-ctl')
  const sl = document.createElement('input')
  sl.type = 'range'; sl.min = 10; sl.max = 2000; sl.value = 200; sl.style.flex = '1'
  sl.oninput = () => draw(+sl.value)
  ctl.appendChild(dEl('span', 'demo-note', 'n ='))
  ctl.appendChild(sl)
  body.appendChild(ctl)
  body.appendChild(out)
  draw(200)
}
