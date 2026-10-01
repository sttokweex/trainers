// @vitest-environment jsdom
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, it } from 'vitest'
import { theoryChapters } from '@/content/interview/volga/theory'
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
  const firstChapter = container.querySelector<HTMLDetailsElement>('.volga-theory')
  await act(async () => firstChapter?.querySelector('summary')?.click())
  const firstAnswer = firstChapter?.querySelector<HTMLDetailsElement>('.volga-check details')
  expect(firstAnswer?.open).toBe(false)
  await act(async () => firstAnswer?.querySelector('summary')?.click())
  expect(firstAnswer?.open).toBe(true)
  expect(firstAnswer?.querySelector('p')?.textContent?.length).toBeGreaterThan(40)
})

it('каждая глава содержит объяснения и ответы на вопросы', () => {
  expect(theoryChapters.length).toBeGreaterThanOrEqual(25)
  expect(new Set(theoryChapters.map((chapter) => chapter.id)).size).toBe(theoryChapters.length)
  for (const chapter of theoryChapters) {
    expect(chapter.points.length).toBeGreaterThanOrEqual(4)
    expect(chapter.check.length).toBeGreaterThanOrEqual(2)
    for (const item of chapter.check) expect(item.answer.length).toBeGreaterThan(40)
  }
})
