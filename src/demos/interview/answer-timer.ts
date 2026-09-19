/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const answerTimer: LegacyDemo = root => {
  const body = dShell(root, 'Тренировка: уложиться в 90 секунд')
  const QS = [
    'Что такое замыкание и зачем оно нужно?',
    'Чем отличается useMemo от useCallback и когда они реально нужны?',
    'Что такое индекс в базе данных и когда он не сработает?',
    'Расскажите про конфликт в команде и как вы его разрешили',
    'Чем отличается 401 от 403?',
    'Почему нельзя вызывать хуки в условии?',
    'Что такое N+1 и как его чинить?',
    'Расскажите о своей ошибке в продакшене',
  ]
  const q = dEl('div', 'pb-res wait')
  q.style.fontSize = '14px'
  body.appendChild(q)
  const bar = dEl('div', 'tl-track')
  bar.style.marginTop = '10px'
  const fill = dEl('div', 'pb-fill ok')
  fill.style.height = '100%'
  bar.appendChild(fill)
  body.appendChild(bar)
  const info = dEl('div', 'el-step', 'Возьмите вопрос и отвечайте ВСЛУХ. Разница между «понимаю» и «могу объяснить» обнаруживается только так.')
  body.appendChild(info)

  let timer = null, left = 90
  function stop() { clearInterval(timer); timer = null; go.textContent = '▶ Старт' }
  function pick() {
    stop()
    q.textContent = QS[Math.floor(Math.random() * QS.length)]
    left = 90; fill.style.width = '100%'; fill.className = 'pb-fill ok'
    info.innerHTML = 'Формула: <b>определение одной фразой → зачем нужно → пример → границы применимости</b>.'
  }
  const ctl = dEl('div', 'demo-ctl')
  ctl.appendChild(dBtn('🎲 Вопрос', 'pri', pick))
  const go = dBtn('▶ Старт', null, () => {
    if (timer) return stop()
    go.textContent = '⏸ Пауза'
    timer = setInterval(() => {
      left--
      fill.style.width = (left / 90 * 100) + '%'
      if (left <= 30) fill.className = 'pb-fill err'
      if (left <= 0) {
        stop()
        info.innerHTML = '<b style="color:var(--yel)">90 секунд вышло.</b> Если не уложились — скорее всего, вы отвечали больше, чем спросили. Дайте каркас и предложите развернуть нужную часть.'
      } else {
        info.innerHTML = 'Осталось <b>' + left + 'с</b>. Говорите вслух, не про себя.'
      }
    }, 1000)
  })
  ctl.appendChild(go)
  body.appendChild(ctl)
  pick()
}
