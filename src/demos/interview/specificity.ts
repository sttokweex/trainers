/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const specificity: LegacyDemo = root => {
  const body = dShell(root, 'Калькулятор специфичности')
  const input = document.createElement('input')
  input.className = 'sp-in'
  input.value = '#main .card ul li.active a:hover'
  body.appendChild(input)
  const out = dEl('div', 'sp-out')
  body.appendChild(out)
  const note = dEl('div', 'demo-note')
  body.appendChild(note)

  function calc(sel) {
    let s = sel
    let a = 0, b = 0, c = 0, d = 0
    if (/style\s*=/.test(s)) a = 1
    // :where() не добавляет специфичности
    s = s.replace(/:where\([^)]*\)/g, ' ')
    b = (s.match(/#[\w-]+/g) || []).length
    const classes = (s.match(/\.[\w-]+/g) || []).length
    const attrs = (s.match(/\[[^\]]+\]/g) || []).length
    const pseudoCls = (s.match(/:(?!:)[a-z-]+(\([^)]*\))?/gi) || [])
      .filter(x => !/^:(before|after|first-line|first-letter|selection|placeholder)/i.test(x)).length
    c = classes + attrs + pseudoCls
    const els = (s.match(/(^|[\s>+~(])([a-z][\w-]*)/gi) || []).length
    const pseudoEl = (s.match(/::[a-z-]+/gi) || []).length
    d = els + pseudoEl
    return [a, b, c, d]
  }
  function draw() {
    const v = calc(input.value)
    const labels = ['inline', 'id', 'class / attr / :pseudo', 'элемент / ::pseudo']
    out.innerHTML = ''
    v.forEach((n, i) => {
      const cell = dEl('div', 'sp-cell' + (n === 0 ? ' zero' : ''))
      cell.innerHTML = '<div class="n">' + n + '</div><div class="l">' + labels[i] + '</div>'
      out.appendChild(cell)
    })
    const total = v.join(',')
    note.innerHTML = 'Вес: <b>' + total + '</b>. Сравнение идёт слева направо: любое количество классов никогда не перебьёт один id. ' +
      (v[1] > 0 ? 'Здесь есть id — такое правило перекрыть будет трудно.' : 'Без id — правило легко перекрывается.')
  }
  input.oninput = draw

  const ctl = dEl('div', 'demo-ctl')
  ;[['.btn', 'один класс'], ['.card .btn', 'вложенность'], ['#app .btn', 'с id'],
    ['a:hover', 'псевдокласс'], [':where(.a, #b) .c', ':where обнуляет'], ['ul li a', 'только элементы']]
    .forEach(([sel, label]) => ctl.appendChild(dBtn(label, 'sm', () => { input.value = sel; draw() })))
  body.appendChild(ctl)
  draw()
}
