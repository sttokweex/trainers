/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const eventLoop: LegacyDemo = root => {
  const body = dShell(root, 'Event loop по шагам')

  const CODE = [
    `console.log('1')`,
    `setTimeout(t2, 0)`,
    `Promise.resolve().then(p3)`,
    `queueMicrotask(m4)`,
    `;(async () => {`,
    `   console.log('5')`,
    `   await null`,
    `   console.log('6')`,
    `})()`,
    `console.log('7')`,
  ]
  // каждый шаг: строка кода, стек, микро, макро, консоль, фаза, пояснение
  const S = [
    [0, ['main'], [], [], [], 'sync', 'Скрипт целиком — это одна макрозадача. Она выполнится до конца без перерывов.'],
    [0, ['main', "log('1')"], [], [], ['1'], 'sync', 'Обычный синхронный вызов: печатает сразу и уходит из стека.'],
    [1, ['main'], [], ['t2'], ['1'], 'sync', 'setTimeout НЕ выполняет функцию. Он отдаёт её окружению, а та попадёт в очередь макрозадач.'],
    [2, ['main'], ['p3'], ['t2'], ['1'], 'sync', 'Промис уже выполнен, поэтому колбэк .then сразу встаёт в очередь микрозадач.'],
    [3, ['main'], ['p3', 'm4'], ['t2'], ['1'], 'sync', 'queueMicrotask кладёт функцию в ту же очередь микрозадач, без создания промиса.'],
    [5, ['main', 'async fn'], ['p3', 'm4'], ['t2'], ['1', '5'], 'sync', 'Async-функция вызывается СИНХРОННО. Код до первого await выполняется сразу.'],
    [6, ['main'], ['p3', 'm4', 'после await'], ['t2'], ['1', '5'], 'sync', 'await приостанавливает функцию: всё после него становится микрозадачей и встаёт третьим в очередь.'],
    [9, ['main', "log('7')"], ['p3', 'm4', 'после await'], ['t2'], ['1', '5', '7'], 'sync', 'Управление вернулось в основной код — печатается 7.'],
    [-1, [], ['p3', 'm4', 'после await'], ['t2'], ['1', '5', '7'], 'sync', 'Синхронная фаза закончена, стек пуст. Теперь цикл событий выгребает микрозадачи.'],
    [-1, ['p3'], ['m4', 'после await'], ['t2'], ['1', '5', '7', '3'], 'micro', 'Микрозадачи выгребаются ВСЕ до единой, по порядку добавления.'],
    [-1, ['m4'], ['после await'], ['t2'], ['1', '5', '7', '3', '4'], 'micro', 'Вторая микрозадача.'],
    [-1, ['async fn'], [], ['t2'], ['1', '5', '7', '3', '4', '6'], 'micro', 'Третья — продолжение async-функции после await. Очередь микрозадач опустела.'],
    [-1, [], [], [], ['1', '5', '7', '3', '4', '6'], 'macro', 'Только теперь берётся ОДНА макрозадача: колбэк setTimeout. Между этим и предыдущим шагом браузер мог отрисовать кадр.'],
    [-1, [], [], [], ['1', '5', '7', '3', '4', '6', '2'], 'end', 'Итог: 1 5 7 3 4 6 2. Обратите внимание — 2 был запланирован вторым, а выполнился последним.'],
  ]

  const wrap = dEl('div', 'el-wrap')
  const codeBox = dEl('div', 'el-code')
  const lines = CODE.map(c => { const n = dEl('div', 'el-line', c.replace(/</g, '&lt;')); codeBox.appendChild(n); return n })
  wrap.appendChild(codeBox)

  const cols = dEl('div', 'el-cols')
  function box(title) {
    const b = dEl('div', 'el-box')
    b.appendChild(dEl('h6', null, title))
    const items = dEl('div', 'el-items')
    b.appendChild(items)
    cols.appendChild(b)
    return items
  }
  const stackBox = box('Стек вызовов')
  const microBox = box('Очередь микрозадач')
  const macroBox = box('Очередь макрозадач')
  const outBox = box('Консоль')
  wrap.appendChild(cols)
  body.appendChild(wrap)

  const stepText = dEl('div', 'el-step')
  body.appendChild(stepText)

  let i = 0, timer = null
  function fill(el, arr, cls) {
    el.innerHTML = ''
    if (!arr.length) { el.appendChild(dEl('span', 'el-empty', 'пусто')); return }
    arr.forEach(v => el.appendChild(dEl('span', 'el-chip ' + cls, v)))
  }
  function draw() {
    const [line, stack, micro, macro, out, phase, note] = S[i]
    lines.forEach((n, idx) => {
      n.className = 'el-line' + (idx === line ? ' on' : (line === -1 || idx < line ? ' done' : ''))
    })
    fill(stackBox, stack, 'stack')
    fill(microBox, micro, 'micro')
    fill(macroBox, macro, 'macro')
    fill(outBox, out, 'out')
    const names = { sync: 'синхронно', micro: 'микрозадача', macro: 'макрозадача', end: 'готово' }
    stepText.innerHTML = '<span class="el-phase ' + phase + '">' + names[phase] + '</span>' + note
    prev.disabled = i === 0
    next.disabled = i === S.length - 1
  }
  const ctl = dEl('div', 'demo-ctl')
  const prev = dBtn('← Назад', 'sm', () => { stop(); i = Math.max(0, i - 1); draw() })
  const next = dBtn('Шаг →', 'pri', () => { stop(); i = Math.min(S.length - 1, i + 1); draw() })
  const play = dBtn('▶ Авто', null, () => {
    if (timer) return stop()
    play.textContent = '⏸ Пауза'
    timer = setInterval(() => {
      if (i >= S.length - 1) return stop()
      i++; draw()
    }, 1500)
  })
  function stop() { clearInterval(timer); timer = null; play.textContent = '▶ Авто' }
  ctl.appendChild(prev); ctl.appendChild(next); ctl.appendChild(play)
  ctl.appendChild(dBtn('⟲ Сброс', 'sm', () => { stop(); i = 0; draw() }))
  body.appendChild(ctl)
  draw()
}
