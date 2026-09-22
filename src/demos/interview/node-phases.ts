/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const nodePhases: LegacyDemo = root => {
  const body = dShell(root, 'Фазы цикла событий в Node.js')
  const PH = [
    ['timers', 'Будильники: setTimeout и setInterval, чей срок уже пришёл'],
    ['pending', 'Редкие системные уведомления, например отдельные ошибки TCP'],
    ['idle/prepare', 'Служебная подготовка внутри Node; ваш код сюда не попадает'],
    ['poll', 'Главная очередь: Node получает готовый файл, HTTP-ответ или сокет и вызывает их callback'],
    ['check', 'Отдельный ящик setImmediate — открывается сразу после poll'],
    ['close', 'Прощание: socket.on("close") и другие уведомления о закрытии'],
  ]
  const row = dEl('div', 'rp')
  row.style.flexDirection = 'column'
  const els = PH.map(([n, d]) => {
    const e = dEl('div', 'rp-s', '<b>' + n + '</b>' + d)
    e.style.textAlign = 'left'; e.style.cursor = 'pointer'
    row.appendChild(e); return e
  })
  body.appendChild(row)
  const info = dEl('div', 'el-step')
  body.appendChild(info)
  let timer = null, i = 0
  function show(k) {
    i = k
    els.forEach((e, n) => e.className = 'rp-s' + (n === k ? ' on cheap' : ''))
    info.innerHTML = '<span class="el-phase sync">' + PH[k][0] + '</span>' + PH[k][1] +
      '<br><b style="color:var(--yel)">Между каждым колбэком</b> (а не только между фазами) выгребаются микрозадачи: сначала process.nextTick, затем промисы.'
  }
  els.forEach((e, k) => { e.onclick = () => { clearInterval(timer); timer = null; show(k) } })
  const ctl = dEl('div', 'demo-ctl')
  ctl.appendChild(dBtn('▶ Круг цикла', 'pri', function () {
    if (timer) { clearInterval(timer); timer = null; this.textContent = '▶ Круг цикла'; return }
    const btn = this; btn.textContent = '⏸'; i = -1
    timer = setInterval(() => { i = (i + 1) % PH.length; show(i) }, 1100)
  }))
  body.appendChild(ctl)
  body.appendChild(dEl('div', 'demo-note',
    'Отсюда классический вопрос: внутри I/O-колбэка <b>setImmediate всегда раньше setTimeout(0)</b>, потому что фаза check идёт сразу за poll, а до timers нужно пройти целый круг.'))
  show(3)
}
