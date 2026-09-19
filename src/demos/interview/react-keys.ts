/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const reactKeys: LegacyDemo = root => {
  const body = dShell(root, 'Почему индекс — плохой key')
  body.appendChild(dEl('div', 'demo-note',
    'Впишите что-нибудь в поля (это «состояние компонента»), затем добавьте элемент <b>в начало</b> списка. ' +
    'Слева key={index}, справа key={id} — состояние хранится по ключу.'))

  let items = [{ id: 1, name: 'Аня' }, { id: 2, name: 'Боря' }]
  let nextId = 3
  const stateByIndex = {}   // «состояние React» для key=index
  const stateById = {}      // для key=id
  const wrap = dEl('div', 'kl-wrap')
  body.appendChild(wrap)

  function draw() {
    wrap.innerHTML = ''
    ;[['bad', 'key={index}', stateByIndex, (it, i) => i],
      ['good', 'key={item.id}', stateById, (it) => it.id]].forEach(([cls, title, store, keyOf]) => {
      const col = dEl('div', 'kl-col ' + cls)
      col.appendChild(dEl('h6', null, title))
      items.forEach((it, i) => {
        const key = keyOf(it, i)
        const row = dEl('div', 'kl-row')
        row.appendChild(dEl('div', 'kl-name', it.name))
        const inp = document.createElement('input')
        inp.placeholder = 'введите текст…'
        inp.value = store[key] ?? ''
        inp.oninput = () => { store[key] = inp.value }
        row.appendChild(inp)
        row.appendChild(dEl('div', 'kl-key', 'key=' + key))
        col.appendChild(row)
      })
      wrap.appendChild(col)
    })
  }

  const ctl = dEl('div', 'demo-ctl')
  ctl.appendChild(dBtn('↑ Добавить в начало', 'pri', () => {
    const name = ['Вова', 'Галя', 'Дима', 'Егор'][(nextId - 3) % 4]
    items = [{ id: nextId, name }, ...items]
    nextId++
    draw()
  }))
  ctl.appendChild(dBtn('Удалить первый', null, () => {
    if (items.length > 1) { items = items.slice(1); draw() }
  }))
  ctl.appendChild(dBtn('⟲ Сброс', 'sm', () => {
    items = [{ id: 1, name: 'Аня' }, { id: 2, name: 'Боря' }]
    nextId = 3
    Object.keys(stateByIndex).forEach(k => delete stateByIndex[k])
    Object.keys(stateById).forEach(k => delete stateById[k])
    draw()
  }))
  body.appendChild(ctl)
  body.appendChild(dEl('div', 'demo-note',
    'Слева текст <b>остаётся на своей позиции</b> и оказывается у чужого элемента: React считает, что компонент с key=0 просто получил новые пропсы. ' +
    'Справа состояние переезжает вместе с элементом.'))
  draw()
}
