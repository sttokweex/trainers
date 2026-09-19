/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const jwt: LegacyDemo = root => {
  const body = dShell(root, 'Что видно в JWT (подсказка: всё)')
  const enc = o => btoa(JSON.stringify(o)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = { sub: '42', email: 'user@example.com', role: 'admin', exp: 1893456000 }
  const token = enc(header) + '.' + enc(payload) + '.' + 'K3kLp9Xq2sVfA8nR4tYu1Zw6EbCdHgJmNoPqRsTuVwX'
  const box = dEl('div', 'fx-code')
  box.style.wordBreak = 'break-all'; box.style.whiteSpace = 'pre-wrap'
  const parts = token.split('.')
  box.innerHTML = '<span style="color:#f85149">' + parts[0] + '</span>.<span style="color:#bc8cff">' +
    parts[1] + '</span>.<span style="color:#58a6ff">' + parts[2] + '</span>'
  body.appendChild(box)
  const out = dEl('div')
  body.appendChild(out)
  const info = dEl('div', 'el-step', 'Нажмите «Декодировать» — и обратите внимание, что ключ для этого не нужен.')
  body.appendChild(info)

  const ctl = dEl('div', 'demo-ctl')
  ctl.appendChild(dBtn('Декодировать', 'pri', () => {
    out.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">' +
      '<div style="background:#05080c;border:1px solid #6b2020;border-radius:8px;padding:10px"><div style="color:#f85149;font:10px var(--mono);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">header</div><pre style="margin:0;font:12px var(--mono);color:#cbd6e2">' +
      JSON.stringify(header, null, 2) + '</pre></div>' +
      '<div style="background:#05080c;border:1px solid #4a3570;border-radius:8px;padding:10px"><div style="color:#bc8cff;font:10px var(--mono);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">payload</div><pre style="margin:0;font:12px var(--mono);color:#cbd6e2">' +
      JSON.stringify(payload, null, 2) + '</pre></div></div>'
    info.innerHTML = '<span class="el-phase macro">payload не зашифрован</span>Это обычный base64 — расшифровать может <b>кто угодно</b>, без секретного ключа. ' +
      'Подпись гарантирует только то, что токен <b>не изменяли</b>. Секретам в payload не место.'
  }))
  body.appendChild(ctl)
  body.appendChild(dEl('div', 'demo-note',
    'Отсюда и вся схема access + refresh: JWT нельзя отозвать, поэтому access делают коротким, а отзываемый refresh хранят на сервере.'))
}
