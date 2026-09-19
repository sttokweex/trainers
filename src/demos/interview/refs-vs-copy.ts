/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const refsVsCopy: LegacyDemo = root => {
  const body = dShell(root, 'Ссылка, поверхностная и глубокая копия')
  const view = dEl('div')
  body.appendChild(view)
  const log = dEl('div', 'demo-note', 'Измените вложенное поле и посмотрите, что произойдёт с оригиналом.')

  let orig, copy, mode = 'ref'
  function reset() {
    orig = { name: 'Аня', address: { city: 'Москва' } }
    copy = mode === 'ref' ? orig
         : mode === 'shallow' ? { ...orig }
         : structuredClone(orig)
    draw()
  }
  function draw() {
    const same = orig.address === copy.address
    view.innerHTML =
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
      ['orig', 'copy'].map(k => {
        const o = k === 'orig' ? orig : copy
        return '<div style="background:#05080c;border:1px solid var(--bd);border-radius:8px;padding:10px;font:12px var(--mono)">' +
          '<div style="color:var(--acc);margin-bottom:6px">' + k + '</div>' +
          '<div style="color:var(--mut)">name: <b style="color:#dce7f3">' + o.name + '</b></div>' +
          '<div style="color:var(--mut)">address.city: <b style="color:#dce7f3">' + o.address.city + '</b></div>' +
          '</div>'
      }).join('') + '</div>' +
      '<div style="text-align:center;margin-top:10px;font:12px var(--mono);color:' +
      (same ? 'var(--red)' : 'var(--grn)') + '">orig.address === copy.address → <b>' + same + '</b>' +
      (same ? ' — вложенный объект ОБЩИЙ' : ' — вложенный объект независим') + '</div>'
  }

  const ctl = dEl('div', 'demo-ctl')
  const modes = [['ref', 'copy = orig'], ['shallow', 'copy = {...orig}'], ['deep', 'structuredClone']]
  const btns = modes.map(([m, label]) => dBtn(label, m === 'ref' ? 'pri' : null, () => {
    mode = m
    btns.forEach((b, i) => b.className = 'demo-b' + (modes[i][0] === m ? ' pri' : ''))
    reset()
  }))
  btns.forEach(b => ctl.appendChild(b))
  body.appendChild(ctl)

  const ctl2 = dEl('div', 'demo-ctl')
  ctl2.appendChild(dBtn("copy.address.city = 'Питер'", 'sm', () => {
    copy.address.city = 'Питер'
    draw()
    log.innerHTML = orig.address.city === 'Питер'
      ? '<b>Оригинал тоже изменился.</b> Присваивание и спред копируют только верхний уровень — вложенный объект остался общим по ссылке.'
      : 'Оригинал не тронут: structuredClone создал независимую копию всего дерева.'
  }))
  ctl2.appendChild(dBtn("copy.name = 'Боря'", 'sm', () => {
    copy.name = 'Боря'
    draw()
    log.innerHTML = orig.name === 'Боря'
      ? '<b>Оригинал изменился</b> — copy и orig это один и тот же объект.'
      : 'Оригинал не тронут: строка на верхнем уровне скопировалась по значению.'
  }))
  ctl2.appendChild(dBtn('⟲ Сброс', 'sm', () => { reset(); log.textContent = 'Состояние восстановлено.' }))
  body.appendChild(ctl2)
  body.appendChild(log)
  reset()
}
