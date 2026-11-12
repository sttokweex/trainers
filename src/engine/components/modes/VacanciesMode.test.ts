// @vitest-environment jsdom
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, it } from 'vitest'
import { VacanciesMode } from './VacanciesMode'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
const container = document.createElement('div')
document.body.appendChild(container)
const root = createRoot(container)
afterEach(async () => { await act(async () => root.render(null)) })

it('показывает каталог вакансий, фильтрует его и открывает выбранную подготовку', async () => {
  await act(async () => root.render(createElement(VacanciesMode, { query: '' })))
  expect(container.querySelectorAll('.vacancy-tile')).toHaveLength(2)
  await act(async () => root.render(createElement(VacanciesMode, { query: 'ClickHouse' })))
  expect(container.querySelectorAll('.vacancy-tile')).toHaveLength(1)
  expect(container.textContent).toContain('deeplay')
  const open = container.querySelector<HTMLButtonElement>('.vacancy-tile button')
  await act(async () => open?.click())
  expect(container.textContent).toContain('Системный дизайн')
  expect(container.querySelector('.vacancies-back')).not.toBeNull()
})
