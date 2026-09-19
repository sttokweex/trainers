/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const hooksOrder: LegacyDemo = root => {
  const body = dShell(root, 'Почему хук нельзя вызывать в условии')
  const out = dEl('div')
  body.appendChild(out)
  const info = dEl('div', 'el-step')
  body.appendChild(info)
  let show = true, broken = false

  function draw() {
    const calls = broken
      ? (show ? [['useState(0)', 'a'], ['useState("")', 'b']] : [['useState("")', 'b']])
      : [['useState(0)', 'a'], ['useState("")', 'b']]
    const slots = ['слот 0', 'слот 1']
    out.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      slots.map((sl, i) => {
        const c = calls[i]
        const expected = i === 0 ? 'a (число)' : 'b (строка)'
        const actual = c ? c[1] + ' (' + (c[0].includes('0') ? 'число' : 'строка') + ')' : '—'
        const bad = c && c[1] !== (i === 0 ? 'a' : 'b')
        return '<div style="background:#05080c;border:1px solid ' + (bad ? 'var(--red)' : 'var(--bd)') +
          ';border-radius:8px;padding:10px;font:12px var(--mono)">' +
          '<div style="color:var(--mut2);font-size:10px;text-transform:uppercase;letter-spacing:.08em">' + sl + '</div>' +
          '<div style="color:var(--mut);margin-top:6px">React ждёт: ' + expected + '</div>' +
          '<div style="color:' + (bad ? 'var(--red)' : 'var(--grn)') + ';margin-top:2px">Пришло: ' + actual + '</div>' +
          '</div>'
      }).join('') + '</div>'
    info.innerHTML = broken && !show
      ? '<span class="el-phase macro">состояния перепутались</span>Хук <b>b</b> встал в слот 0 и читает состояние, принадлежащее <b>a</b>. React сопоставляет хуки <b>по порядку вызова</b>, а не по именам — имён он не знает.'
      : broken
        ? '<span class="el-phase sync">пока всё в порядке</span>При show=true порядок совпадает. Переключите show — и он сломается.'
        : '<span class="el-phase micro">хуки вызваны безусловно</span>Порядок одинаков при любом значении show. Правильный способ: вызвать хук всегда, а условие поместить внутрь.'
  }
  const ctl = dEl('div', 'demo-ctl')
  ctl.appendChild(dBtn('Хук в if (так нельзя)', null, () => { broken = true; draw() }))
  ctl.appendChild(dBtn('Хуки безусловно', 'pri', () => { broken = false; draw() }))
  ctl.appendChild(dBtn('Переключить show', 'sm', () => { show = !show; draw() }))
  body.appendChild(ctl)
  draw()
}
