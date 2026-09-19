/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const fluxFlow: LegacyDemo = root => {
  const body = dShell(root, 'Flux: почему поток однонаправленный')
  const STEPS = [
    ['Действие', 'Пользователь нажал «выполнено». Компонент НЕ меняет данные сам — он лишь сообщает о намерении.'],
    ['Action', "{ type: 'task/toggled', payload: 42 } — обычный объект. Его можно залогировать, сохранить, воспроизвести."],
    ['Reducer', 'Чистая функция (state, action) → новый state. Никаких запросов и мутаций — только вычисление.'],
    ['Store', 'Состояние заменяется новой неизменяемой версией. Старая остаётся — отсюда time-travel debugging.'],
    ['View', 'Подписанные компоненты перерисовываются от нового состояния. Круг замкнулся.'],
  ]
  const row = dEl('div', 'rp')
  const els = STEPS.map(([n]) => { const e = dEl('div', 'rp-s', '<b>' + n + '</b>'); row.appendChild(e); return e })
  body.appendChild(row)
  const info = dEl('div', 'el-step')
  body.appendChild(info)
  let timer = null, i = 0
  function show(k) {
    i = k
    els.forEach((e, n) => e.className = 'rp-s' + (n === k ? ' on cheap' : n < k ? ' on mid' : ''))
    info.innerHTML = '<span class="el-phase micro">' + STEPS[k][0] + '</span>' + STEPS[k][1]
  }
  els.forEach((e, k) => { e.style.cursor = 'pointer'; e.onclick = () => { clearInterval(timer); timer = null; show(k) } })
  const ctl = dEl('div', 'demo-ctl')
  ctl.appendChild(dBtn('▶ Провести круг', 'pri', function () {
    if (timer) { clearInterval(timer); timer = null; this.textContent = '▶ Провести круг'; return }
    this.textContent = '⏸'
    i = -1
    const btn = this
    timer = setInterval(() => {
      i++
      if (i >= STEPS.length) { clearInterval(timer); timer = null; btn.textContent = '▶ Провести круг'; return }
      show(i)
    }, 1200)
  }))
  body.appendChild(ctl)
  body.appendChild(dEl('div', 'demo-note',
    'В MVC с несколькими моделями связи образуют паутину: модель меняет вид, вид меняет другую модель. Здесь <b>данные текут строго в одну сторону</b>, поэтому на вопрос «почему состояние стало таким» всегда есть ответ — лог действий.'))
  show(0)
}
