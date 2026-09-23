// @vitest-environment jsdom
/**
 * Регрессия: если тема одного топика собрана из нескольких файлов контента
 * (не идущих подряд в исходном массиве), группировка «по соседним элементам»
 * рисовала два блока с одинаковым topic → одинаковый React key у соседних
 * <div> → сломанная реконсиляция при смене фильтра (верхний блок переставал
 * обновляться и не реагировал на клики). Смотри App.tsx: const grouped = ...
 */
import { createElement } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
;(globalThis as any).ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }

async function renderAt(path: string) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const router = createMemoryRouter([{ path: '/:packId', element: createElement(App) }], { initialEntries: [path] })
  const root = createRoot(container)
  await act(async () => { root.render(createElement(RouterProvider, { router, future: { v7_startTransition: true } })) })
  // На CI холодный импорт пака (динамический import()) заметно медленнее, чем локально —
  // бюджет ожидания должен быть щедрым, чтобы тест не был флаки-падающим.
  for (let i = 0; i < 100 && !container.querySelector('.grp'); i++) {
    await act(async () => { await new Promise((r) => setTimeout(r, 50)) })
  }
  return container
}

const groupsOf = (c: HTMLElement) => Array.from(c.querySelectorAll('.grp')).map((n) => n.textContent)

describe('группировка карточек по теме (App.tsx grouped)', () => {
  let containers: HTMLElement[] = []
  beforeEach(() => { containers = [] })
  afterEach(() => { for (const c of containers) c.remove() })

  it('прямой заход с готовым topic в URL даёт один блок без дублей', async () => {
    const c = await renderAt('/interview?mode=theory&topic=' + encodeURIComponent('ООП и принципы'))
    containers.push(c)
    expect(groupsOf(c)).toEqual(['ООП и принципы'])
  })

  it('клик по теме в сайдбаре после загрузки в режиме «Теория» не дублирует заголовки', async () => {
    const c = await renderAt('/interview?mode=theory')
    containers.push(c)
    const target = Array.from(c.querySelectorAll('button.tp')).find((b) => b.textContent?.includes('ООП и принципы'))
    expect(target).toBeTruthy()
    await act(async () => {
      target!.dispatchEvent(new Event('click', { bubbles: true }))
      await new Promise((r) => setTimeout(r, 50))
    })
    expect(groupsOf(c)).toEqual(['ООП и принципы'])
  })

  it('переключение из «Вопросы» с темой в режим «Теория» не тащит чужие темы', async () => {
    const c = await renderAt('/interview?topic=' + encodeURIComponent('ООП и принципы'))
    containers.push(c)
    const theoryBtn = Array.from(c.querySelectorAll('.modes button')).find((b) => b.textContent?.trim() === 'Теория')
    expect(theoryBtn).toBeTruthy()
    await act(async () => {
      theoryBtn!.dispatchEvent(new Event('click', { bubbles: true }))
      await new Promise((r) => setTimeout(r, 50))
    })
    // клик по режиму сбрасывает тему на «все» — сайдбар должен это отражать,
    // а не оставлять «включённой» больше одной кнопки темы
    const onButtons = Array.from(c.querySelectorAll('button.tp.on'))
    expect(onButtons).toHaveLength(1)
    expect(onButtons[0]?.textContent).toContain('Все темы')
  })

  it.each(['interview', 'audit'])('ни один заголовок группы не повторяется в паке «%s» (теория)', async (packId) => {
    const c = await renderAt(`/${packId}?mode=theory`)
    containers.push(c)
    const groups = groupsOf(c)
    expect(groups.length).toBeGreaterThan(0)
    expect(new Set(groups).size).toBe(groups.length)
  })

  it.each(['interview', 'audit'])('ни один заголовок группы не повторяется в паке «%s» (вопросы)', async (packId) => {
    const c = await renderAt(`/${packId}`)
    containers.push(c)
    const groups = groupsOf(c)
    expect(groups.length).toBeGreaterThan(0)
    expect(new Set(groups).size).toBe(groups.length)
  })
})
