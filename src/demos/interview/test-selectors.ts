/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const testSelectors: LegacyDemo = root => {
  const body = dShell(root, 'Какой запрос выбрать в Testing Library')
  const Q = [
    ['getByRole', 1, "getByRole('button', { name: /сохранить/i })", 'Как элемент видит скринридер и пользователь. Если он не находится — скорее всего, у вас проблема с доступностью.'],
    ['getByLabelText', 1, "getByLabelText('Email')", 'Идеально для полей формы: проверяет и связь label с input.'],
    ['getByPlaceholderText', 2, "getByPlaceholderText('введите email')", 'Приемлемо, но placeholder — не замена label.'],
    ['getByText', 2, "getByText('Сохранено')", 'Для неинтерактивного контента.'],
    ['getByTestId', 3, "getByTestId('save-btn')", 'Крайний случай: ничего не говорит о доступности и завязан на разметку, которую пользователь не видит.'],
    ['querySelector', 4, "container.querySelector('.btn-primary')", 'Так не делают: тест ломается при любом переименовании класса, хотя поведение не изменилось.'],
  ]
  const list = dEl('div')
  body.appendChild(list)
  const info = dEl('div', 'el-step', 'Нажмите на вариант.')
  body.appendChild(info)
  const COLORS = { 1: ['var(--grn)', 'предпочтительно'], 2: ['var(--yel)', 'допустимо'], 3: ['#ff9d5c', 'крайний случай'], 4: ['var(--red)', 'плохо'] }
  Q.forEach(([name, rank, code, note]) => {
    const row = dEl('div', 'kl-row')
    row.style.cursor = 'pointer'
    row.innerHTML = '<span style="color:' + COLORS[rank][0] + ';font:12px var(--mono);flex:0 0 150px">' + name + '</span>' +
      '<span style="font:11.5px var(--mono);color:var(--mut);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis">' + code + '</span>' +
      '<span style="font:10px var(--mono);color:' + COLORS[rank][0] + '">' + COLORS[rank][1] + '</span>'
    row.onclick = () => {
      info.innerHTML = '<span class="el-phase ' + (rank === 1 ? 'micro' : rank === 4 ? 'macro' : 'sync') + '">' + name + '</span>' + note
    }
    list.appendChild(row)
  })
  body.appendChild(dEl('div', 'demo-note',
    'Правило: <b>чем больше тест похож на то, как пользуются вашим кодом, тем больше уверенности он даёт</b>. Тест, знающий про классы и внутреннее состояние, ломается при рефакторинге, который ничего не сломал.'))
}
