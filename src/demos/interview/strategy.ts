/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const strategy: LegacyDemo = root => {
  const body = dShell(root, 'Паттерн Стратегия: меняем поведение, не меняя код клиента')
  const STRATS = {
    'Обычный': { fn: b => b, code: 'class Regular { calc(b) { return b } }' },
    'Премиум −20%': { fn: b => b * 0.8, code: 'class Premium { calc(b) { return b * 0.8 } }' },
    'Опт −35% от 5000': { fn: b => b >= 5000 ? b * 0.65 : b, code: 'class Wholesale {\n  calc(b) { return b >= 5000 ? b * 0.65 : b }\n}' },
  }
  let cur = 'Обычный', amount = 3000
  const out = dEl('div', 'pb-res ok')
  const code = dEl('div', 'fx-code')
  body.appendChild(out)
  body.appendChild(code)

  function draw() {
    const s = STRATS[cur]
    out.innerHTML = 'checkout.total(' + amount + ') → <b>' + Math.round(s.fn(amount)) + ' ₽</b>'
    code.textContent = s.code + '\n\n// клиентский код НЕ меняется:\nconst checkout = new Checkout(strategy)\ncheckout.total(' + amount + ')'
  }
  const ctl = dEl('div', 'demo-ctl')
  const btns = Object.keys(STRATS).map(k => dBtn(k, k === cur ? 'pri' : null, () => {
    cur = k
    btns.forEach(b => b.className = 'demo-b' + (b.textContent === k ? ' pri' : ''))
    draw()
  }))
  btns.forEach(b => ctl.appendChild(b))
  body.appendChild(ctl)
  const ctl2 = dEl('div', 'demo-ctl')
  ;[1000, 3000, 8000].forEach(v => ctl2.appendChild(dBtn(v + ' ₽', 'sm', () => { amount = v; draw() })))
  body.appendChild(ctl2)
  body.appendChild(dEl('div', 'demo-note',
    'Добавление четвёртой стратегии — <b>новый класс</b>, а не новая ветка в switch. Это и есть принцип Open/Closed в действии.'))
  draw()
}
