/* eslint-disable */
// @ts-nocheck — интерактивная тренировка ответа, DOM-реализация демо
import type { LegacyDemo } from '@/engine/types'
import { dBtn, dEl, dShell } from '@/demos/helpers'

export const mockInterview: LegacyDemo = root => {
  const body = dShell(root, 'Мини-собеседование: ответ → самооценка → следующий шаг')
  const prompts = [
    'Спроектируйте API ленты уведомлений для миллиона пользователей.',
    'Почему после релиза вырос INP и как это докажете?',
    'Расскажите о конфликте в команде и результате.',
    'Как выкатить миграцию базы без простоя?',
    'Чем WebSocket отличается от SSE в вашем проекте?',
  ]
  const q = dEl('div', 'pb-res wait')
  q.style.fontSize = '14px'
  body.appendChild(q)
  const hint = dEl('div', 'demo-note', 'Говорите вслух 90 секунд. После ответа оцените ясность, глубину и конкретику.')
  body.appendChild(hint)
  const track = dEl('div', 'tl-track')
  const fill = dEl('div', 'pb-fill ok')
  fill.style.width = '100%'
  fill.style.height = '100%'
  track.appendChild(fill)
  body.appendChild(track)

  const rubric = dEl('div', 'demo-ctl')
  const sliders = ['Структура', 'Техническая глубина', 'Пример/цифры']
  const values = []
  sliders.forEach(label => {
    const wrap = dEl('label', 'fld')
    wrap.appendChild(dEl('span', null, label))
    const range = document.createElement('input')
    range.type = 'range'; range.min = '1'; range.max = '5'; range.value = '3'
    const out = dEl('b', 'rv', '3/5')
    range.oninput = () => { out.textContent = range.value + '/5'; score() }
    wrap.appendChild(range); wrap.appendChild(out); rubric.appendChild(wrap)
    values.push(range)
  })
  body.appendChild(rubric)
  const result = dEl('div', 'demo-note')
  body.appendChild(result)
  let timer = null, left = 90
  const score = () => {
    const n = values.reduce((s, x) => s + +x.value, 0)
    result.innerHTML = 'Сейчас <b>' + n + '/15</b>. ' + (n >= 12 ? 'Можно переходить к уточняющим вопросам.' : 'Добавьте границы, пример и измеримый результат.')
  }
  const pick = () => {
    q.textContent = prompts[Math.floor(Math.random() * prompts.length)]
    left = 90; fill.style.width = '100%'; fill.className = 'pb-fill ok'
    values.forEach(x => { x.value = '3' }); score()
  }
  const ctl = dEl('div', 'demo-ctl')
  ctl.appendChild(dBtn('🎲 Новый вопрос', 'pri', () => { stop(); pick() }))
  const start = dBtn('▶ Старт', null, () => {
    if (timer) { stop(); return }
    start.textContent = '⏸ Пауза'
    timer = setInterval(() => {
      left--; fill.style.width = (left / 90 * 100) + '%'
      if (left <= 30) fill.className = 'pb-fill err'
      if (left <= 0) { stop(); hint.innerHTML = '<b style="color:var(--yel)">Время вышло.</b> Оцените ответ и нажмите «Новый вопрос».' }
    }, 1000)
  })
  ctl.appendChild(start)
  body.appendChild(ctl)
  function stop() { if (timer) clearInterval(timer); timer = null; start.textContent = '▶ Старт' }
  pick()
}
