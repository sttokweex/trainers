// @vitest-environment jsdom
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, it } from 'vitest'
import { VolgaMode } from './VolgaMode'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const container = document.createElement('div')
document.body.appendChild(container)
const root = createRoot(container)
afterEach(async () => { await act(async () => root.render(null)) })

it('показывает ответы по стеку и переключает на каверзные вопросы', async () => {
  await act(async () => root.render(createElement(VolgaMode, { query: '' })))
  expect(container.textContent).toContain('React 19, хуки, композиция, Suspense')
  const button = Array.from(container.querySelectorAll<HTMLButtonElement>('.volga-nav button')).find((item) => item.textContent === 'Каверзные вопросы')
  await act(async () => button?.click())
  expect(container.textContent).toContain('Почему Redux, а не MobX или Zustand?')
  expect(container.textContent).not.toContain('React 19, хуки, композиция, Suspense')
  const theory = Array.from(container.querySelectorAll<HTMLButtonElement>('.volga-nav button')).find((item) => item.textContent === 'Теория')
  await act(async () => theory?.click())
  expect(container.textContent).toContain('React 19: рендер, хуки и Suspense')
  expect(container.textContent).toContain('Проверь себя')
})
