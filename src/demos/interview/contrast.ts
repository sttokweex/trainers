/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const contrast: LegacyDemo = root => {
  const body = dShell(root, 'Проверка контраста по WCAG')
  let fg = '#8b98a8', bg = '#0a0e14'
  const prev = dEl('div')
  prev.style.cssText = 'border:1px solid var(--bd);border-radius:8px;padding:16px;margin-bottom:10px'
  body.appendChild(prev)
  const info = dEl('div', 'el-step')
  body.appendChild(info)

  const lum = hex => {
    const v = [1, 3, 5].map(i => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]
  }
  function draw() {
    const l1 = lum(fg), l2 = lum(bg)
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
    const r = ratio.toFixed(2)
    prev.style.background = bg; prev.style.color = fg
    prev.innerHTML = '<div style="font-size:15px;margin-bottom:6px">Обычный текст 15px — так выглядит основной контент</div>' +
      '<div style="font-size:22px;font-weight:600">Крупный текст 22px</div>'
    const okAA = ratio >= 4.5, okLarge = ratio >= 3
    info.innerHTML = '<span class="el-phase ' + (okAA ? 'micro' : okLarge ? 'macro' : 'end') + '">' + r + ':1</span>' +
      'Обычный текст (нужно 4.5:1): <b style="color:' + (okAA ? 'var(--grn)' : 'var(--red)') + '">' + (okAA ? 'проходит' : 'НЕ проходит') + '</b> · ' +
      'крупный и границы контролов (3:1): <b style="color:' + (okLarge ? 'var(--grn)' : 'var(--red)') + '">' + (okLarge ? 'проходит' : 'НЕ проходит') + '</b>'
  }
  const ctl = dEl('div', 'fx-ctl')
  ;[['Текст', v => fg = v, () => fg], ['Фон', v => bg = v, () => bg]].forEach(([label, set, get]) => {
    const g = dEl('div', 'fx-g')
    g.appendChild(dEl('label', null, label))
    const inp = document.createElement('input')
    inp.type = 'color'; inp.value = get()
    inp.style.cssText = 'width:100%;height:32px;background:#05080c;border:1px solid var(--bd2);border-radius:6px;cursor:pointer'
    inp.oninput = () => { set(inp.value); draw() }
    g.appendChild(inp)
    ctl.appendChild(g)
  })
  body.appendChild(ctl)
  const ctl2 = dEl('div', 'demo-ctl')
  ;[['#8b98a8', '#0a0e14', 'серый на тёмном'], ['#58a6ff', '#0a0e14', 'акцент'], ['#3d4754', '#0a0e14', 'слишком блёклый'], ['#e6edf3', '#0a0e14', 'основной текст']]
    .forEach(([f, b, label]) => ctl2.appendChild(dBtn(label, 'sm', () => { fg = f; bg = b; draw(); ctl.querySelectorAll('input').forEach((x, i) => x.value = i ? b : f) })))
  body.appendChild(ctl2)
  body.appendChild(dEl('div', 'demo-note',
    'И помните второе правило: <b>не передавайте смысл только цветом</b>. К красной рамке нужен текст ошибки и иконка — около 8% мужчин имеют нарушения цветовосприятия.'))
  draw()
}
