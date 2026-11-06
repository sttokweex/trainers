// @vitest-environment jsdom
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, it } from 'vitest'
import { deeplayChapters } from '@/content/interview/deeplay/theory'
import { DeeplayMode } from './DeeplayMode'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const container = document.createElement('div')
document.body.appendChild(container)
const root = createRoot(container)
afterEach(async () => {
  await act(async () => root.render(null))
  localStorage.removeItem('deeplay-study-complete-v1')
})

it('содержит подробный учебный маршрут с уникальными главами и проверкой знаний', () => {
  expect(deeplayChapters.length).toBeGreaterThanOrEqual(18)
  expect(new Set(deeplayChapters.map((item) => item.id)).size).toBe(deeplayChapters.length)
  for (const id of ['ts-contracts', 'retries-idempotency', 'concurrency-db', 'grpc', 'clickhouse', 'kubernetes', 'ai-llm']) {
    expect(deeplayChapters.some((item) => item.id === id)).toBe(true)
  }
  for (const chapter of deeplayChapters) {
    expect(chapter.sections.length).toBeGreaterThanOrEqual(4)
    expect(chapter.check.length).toBeGreaterThanOrEqual(2)
    expect(new Set(chapter.sections.map((item) => item.title)).size).toBe(chapter.sections.length)
  }
})

it('показывает теорию, сохраняет прогресс и фильтрует главы', async () => {
  await act(async () => root.render(createElement(DeeplayMode, { query: '' })))
  expect(container.querySelectorAll('.deeplay-chapter')).toHaveLength(deeplayChapters.length)
  const chapter = container.querySelector<HTMLDetailsElement>('.deeplay-chapter')
  await act(async () => chapter?.querySelector('summary')?.click())
  const done = chapter?.querySelector<HTMLButtonElement>('.deeplay-complete')
  await act(async () => done?.click())
  expect(done?.getAttribute('aria-pressed')).toBe('true')
  expect(JSON.parse(localStorage.getItem('deeplay-study-complete-v1') ?? '[]')).toContain(deeplayChapters[0]?.id)
  await act(async () => root.render(createElement(DeeplayMode, { query: 'MergeTree' })))
  expect(container.querySelectorAll('.deeplay-chapter')).toHaveLength(1)
})

it('открывает требования и вероятные вопросы', async () => {
  await act(async () => root.render(createElement(DeeplayMode, { query: '' })))
  const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('.volga-nav button'))
  await act(async () => buttons.find((item) => item.textContent === 'Требования и опыт')?.click())
  expect(container.textContent).toContain('Themost: ledger')
  await act(async () => buttons.find((item) => item.textContent === 'Вопросы и ответы')?.click())
  expect(container.textContent).toContain('вероятные вопросы по вакансии')
})
