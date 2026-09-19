/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const flexbox: LegacyDemo = root => {
  const body = dShell(root, 'Flexbox: подвигайте параметры')
  const OPTS = {
    'flex-direction': ['row', 'column', 'row-reverse'],
    'justify-content': ['flex-start', 'center', 'space-between', 'space-around', 'flex-end'],
    'align-items': ['stretch', 'flex-start', 'center', 'flex-end'],
    'gap': ['8px', '0px', '20px'],
  }
  const state = { 'flex-direction': 'row', 'justify-content': 'flex-start', 'align-items': 'stretch', 'gap': '8px' }
  const ctlBox = dEl('div', 'fx-ctl')
  Object.entries(OPTS).forEach(([prop, vals]) => {
    const g = dEl('div', 'fx-g')
    g.appendChild(dEl('label', null, prop))
    const sel = document.createElement('select')
    vals.forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v; sel.appendChild(o) })
    sel.onchange = () => { state[prop] = sel.value; apply() }
    g.appendChild(sel)
    ctlBox.appendChild(g)
  })
  body.appendChild(ctlBox)
  const stage = dEl('div', 'fx-stage')
  ;[1, 2, 3].forEach(n => stage.appendChild(dEl('div', 'fx-item', 'item ' + n)))
  body.appendChild(stage)
  const code = dEl('div', 'fx-code')
  body.appendChild(code)

  function apply() {
    Object.entries(state).forEach(([k, v]) => stage.style.setProperty(k, v))
    code.textContent = '.container {\n  display: flex;\n' +
      Object.entries(state).map(([k, v]) => '  ' + k + ': ' + v + ';').join('\n') + '\n}'
  }
  body.appendChild(dEl('div', 'demo-note',
    'Переключите <b>flex-direction на column</b> и обратите внимание: justify-content и align-items <b>меняются местами</b> — они привязаны к осям, а не к экрану.'))
  apply()
}
