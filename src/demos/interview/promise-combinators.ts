/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const promiseCombinators: LegacyDemo = root => {
  const body = dShell(root, 'Комбинаторы промисов: что вернётся')
  const TASKS = [
    { name: 'A', ms: 1200, ok: true,  val: "'a'" },
    { name: 'B', ms: 600,  ok: false, val: "Error('boom')" },
    { name: 'C', ms: 1800, ok: true,  val: "'c'" },
  ]
  const rows = TASKS.map(t => {
    const row = dEl('div', 'pb')
    row.appendChild(dEl('div', 'pb-lbl', t.name + ' · ' + t.ms + 'мс'))
    const track = dEl('div', 'pb-track')
    const fill = dEl('div', 'pb-fill ' + (t.ok ? 'ok' : 'err'))
    track.appendChild(fill); row.appendChild(track)
    const st = dEl('div', 'pb-st', '')
    row.appendChild(st)
    body.appendChild(row)
    return { fill, st, t }
  })
  const res = dEl('div', 'pb-res wait', 'Выберите комбинатор')
  body.appendChild(res)

  let running = false
  function run(kind) {
    if (running) return
    running = true
    res.className = 'pb-res wait'
    res.textContent = 'Выполняется…'
    const started = Date.now()
    let settled = 0, firstErr = null, firstOk = null
    const results = []

    rows.forEach(({ fill, st, t }) => {
      fill.style.transition = 'none'; fill.style.width = '0'
      st.textContent = ''; st.style.color = 'var(--mut2)'
      requestAnimationFrame(() => {
        fill.style.transition = 'width ' + t.ms + 'ms linear'
        fill.style.width = '100%'
      })
      setTimeout(() => {
        const el = Date.now() - started
        st.textContent = (t.ok ? '✓ ' : '✕ ') + el + 'мс'
        st.style.color = t.ok ? 'var(--grn)' : 'var(--red)'
        settled++
        results.push(t)
        if (!t.ok && !firstErr) firstErr = t
        if (t.ok && !firstOk) firstOk = t

        if (kind === 'race' && results.length === 1) return finish(
          t.ok ? 'ok' : 'err',
          'race → ' + (t.ok ? 'резолв ' + t.val : 'РЕДЖЕКТ ' + t.val) +
          ' (первый ЗАВЕРШИВШИЙСЯ, неважно как) через ' + el + 'мс')
        if (kind === 'all' && !t.ok) return finish('err',
          'all → реджект ' + t.val + ' через ' + el + 'мс. Остальные промисы НЕ отменяются — они продолжают выполняться впустую.')
        if (kind === 'any' && t.ok) return finish('ok',
          'any → резолв ' + t.val + ' через ' + el + 'мс (первый УСПЕШНЫЙ, ошибки игнорируются)')

        if (settled === TASKS.length) {
          if (kind === 'all') finish('ok', "all → ['a','c'] … но сюда мы не дойдём: B упал раньше")
          else if (kind === 'allSettled') finish('ok',
            'allSettled → [{fulfilled,a},{rejected,boom},{fulfilled,c}] через ' + el + 'мс. Ждёт ВСЕХ, не падает никогда.')
          else if (kind === 'any') finish('err', 'any → AggregateError: все промисы упали')
          else finish('ok', 'готово за ' + el + 'мс')
        }
      }, t.ms)
    })
    function finish(cls, text) {
      if (!running) return
      running = false
      res.className = 'pb-res ' + cls
      res.textContent = text
    }
  }

  const ctl = dEl('div', 'demo-ctl')
  ;['all', 'allSettled', 'race', 'any'].forEach(k =>
    ctl.appendChild(dBtn('Promise.' + k, k === 'all' ? 'pri' : null, () => run(k))))
  body.appendChild(ctl)
  body.appendChild(dEl('div', 'demo-note',
    'B завершается ошибкой на 600мс, A успешно на 1200мс, C успешно на 1800мс. <b>Запустите все четыре и сравните.</b>'))
}
