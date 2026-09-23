/* eslint-disable */
// @ts-nocheck — короткий тренажёр базовых правил JavaScript
import type { LegacyDemo } from '@/engine/types'
import { dBtn, dEl, dShell } from '@/demos/helpers'

const tasks = [
  {
    q: 'Что делает const с объектом?',
    code: "const user = { name: 'Аня' }\nuser.name = 'Ира'\nconsole.log(user.name)",
    options: ['Печатает Ира', 'Ошибка при изменении поля', 'Печатает Аня'],
    answer: 0,
    why: 'const не позволяет переназначить user, но не замораживает поля объекта.',
  },
  {
    q: 'Что выведет строка с двумя операторами?',
    code: 'console.log(0 || 8, 0 ?? 8)',
    options: ['0 0', '8 0', '8 8'],
    answer: 1,
    why: '|| считает 0 ложным. ?? подставляет значение только вместо null или undefined.',
  },
  {
    q: 'Что вернёт функция без return?',
    code: 'const area = (w, h) => { w * h }\nconsole.log(area(3, 4))',
    options: ['12', '0', 'undefined'],
    answer: 2,
    why: 'Фигурные скобки создают тело функции; без явного return результат наружу не возвращается.',
  },
  {
    q: 'Какой массив получится?',
    code: 'const nums = [1, 2, 3]\nconst result = nums.map(n => n * 2)',
    options: ['[2, 4, 6]', '[1, 2, 3, 2, 4, 6]', '[2]'],
    answer: 0,
    why: 'map преобразует каждый элемент и возвращает новый массив той же длины.',
  },
  {
    q: 'Что напечатает условие?',
    code: "console.log(Boolean([]), Boolean(''))",
    options: ['false false', 'true false', 'true true'],
    answer: 1,
    why: 'Пустой массив — объект и считается истинным. Пустая строка — falsy и считается ложной.',
  },
]

export const jsFoundationLab: LegacyDemo = root => {
  const body = dShell(root, 'Разминка по базе: одна короткая задача за раз')
  const progress = dEl('div', 'demo-note')
  const prompt = dEl('div', 'pb-res wait')
  const code = dEl('pre', 'fx-code')
  const controls = dEl('div')
  const result = dEl('div')
  body.append(progress, prompt, code, controls, result)

  let order = tasks.map((_, index) => index)
  let index = 0
  let score = 0

  function draw() {
    if (index >= order.length) {
      progress.textContent = 'Раунд завершён · ' + score + ' из ' + tasks.length
      prompt.className = 'pb-res ' + (score === tasks.length ? 'ok' : score >= 3 ? 'wait' : 'err')
      prompt.textContent = score === tasks.length
        ? 'Все пять правил на месте. Отличная база.'
        : 'Верно ' + score + ' из ' + tasks.length + '. Прочитайте пояснения к ошибкам и пройдите ещё раз.'
      code.textContent = ''
      controls.innerHTML = ''
      result.innerHTML = ''
      result.appendChild(dBtn('↻ Перемешать и начать заново', 'pri', () => {
        order = tasks.map((_, i) => i).sort(() => Math.random() - 0.5)
        index = 0; score = 0; draw()
      }))
      return
    }

    const task = tasks[order[index]]
    progress.textContent = 'Задача ' + (index + 1) + ' из ' + tasks.length + ' · верно ' + score
    prompt.textContent = task.q
    code.textContent = task.code
    controls.innerHTML = ''
    result.innerHTML = ''
    const options = dEl('div', 'demo-ctl')
    task.options.forEach((label, optionIndex) => {
      const button = dBtn(label, null, () => {
        options.querySelectorAll('button').forEach(item => { item.disabled = true })
        const correct = optionIndex === task.answer
        if (correct) score += 1
        button.classList.add(correct ? 'pri' : 'err')
        button.style.outline = '2px solid ' + (correct ? 'var(--grn)' : 'var(--red)')
        button.style.outlineOffset = '2px'
        const explanation = dEl('div', 'pb-res ' + (correct ? 'ok' : 'err'))
        explanation.textContent = (correct ? '✓ Верно. ' : 'Не совсем. Верный вариант: ' + task.options[task.answer] + '. ') + task.why
        result.appendChild(explanation)
        result.appendChild(dBtn(index === order.length - 1 ? 'Итог' : 'Следующая задача →', 'pri', () => { index += 1; draw() }))
      })
      options.appendChild(button)
    })
    controls.appendChild(options)
  }
  draw()
}
