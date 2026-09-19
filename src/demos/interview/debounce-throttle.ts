/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const debounceThrottle: LegacyDemo = root => {
  const body = dShell(root, 'Debounce и throttle: нажимайте часто')
  const WINDOW = 4000, MS = 500
  const rows = {}
  const tl = dEl('div', 'tl')
  ;[['raw', 'события'], ['deb', 'debounce 500'], ['thr', 'throttle 500']].forEach(([k, label]) => {
    const row = dEl('div', 'tl-row')
    row.appendChild(dEl('div', 'tl-lbl', label))
    const track = dEl('div', 'tl-track')
    row.appendChild(track)
    const cnt = dEl('div', 'tl-cnt', '0')
    row.appendChild(cnt)
    tl.appendChild(row)
    rows[k] = { track, cnt, n: 0 }
  })
  body.appendChild(tl)

  let t0 = Date.now(), debTimer = null, lastThr = 0
  function tick(kind) {
    const r = rows[kind]
    const pos = ((Date.now() - t0) % WINDOW) / WINDOW * 100
    const el = dEl('div', 'tl-tick ' + kind)
    el.style.left = pos + '%'
    r.track.appendChild(el)
    r.n++
    r.cnt.textContent = r.n
    setTimeout(() => el.remove(), WINDOW)
  }
  function press() {
    tick('raw')
    clearTimeout(debTimer)
    debTimer = setTimeout(() => tick('deb'), MS)
    const now = Date.now()
    if (now - lastThr >= MS) { lastThr = now; tick('thr') }
  }

  const ctl = dEl('div', 'demo-ctl')
  const b = dBtn('Нажимай меня часто', 'pri', press)
  ctl.appendChild(b)
  ctl.appendChild(dBtn('⟲ Сброс', 'sm', () => {
    Object.values(rows).forEach(r => { r.track.innerHTML = ''; r.n = 0; r.cnt.textContent = '0' })
    clearTimeout(debTimer); lastThr = 0; t0 = Date.now()
  }))
  body.appendChild(ctl)
  body.appendChild(dEl('div', 'demo-note',
    '<b>Debounce</b> ждёт паузы в 500мс и выполняется один раз в конце серии — идеален для поиска. ' +
    '<b>Throttle</b> пропускает не чаще раза в 500мс, срабатывая регулярно — для скролла и drag.'))
}
