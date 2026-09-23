import { useEffect, useMemo, useRef, useState } from 'react'
import { RichContent } from './RichContent'
import type { LegacyDemo, TheoryArticle, TheoryBookmark } from '@/engine/types'

/** Грубая оценка времени чтения: ~180 слов в минуту, код считаем медленнее. */
export function estimateReadingMinutes(html: string) {
  const text = html.replace(/<pre[\s\S]*?<\/pre>/g, ' ').replace(/<[^>]+>/g, ' ')
  const words = text.split(/\s+/).filter(Boolean).length
  const codeBlocks = (html.match(/<pre/g) ?? []).length
  return Math.max(1, Math.ceil((words + codeBlocks * 32) / 180))
}

const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

export function TheoryCard({
  item, demos, autoOpen = false, done = false, onToggleDone,
  onAddBookmark, openSectionIndex, openExcerpt,
}: {
  item: TheoryArticle
  demos: Record<string, LegacyDemo>
  /** Пришли по ссылке из плана: раскрыть и подвести к себе. */
  autoOpen?: boolean
  /** Reading progress marker. */
  done?: boolean
  onToggleDone?: () => void
  onAddBookmark?: (bookmark: TheoryBookmark) => void
  openSectionIndex?: number
  openExcerpt?: string
}) {
  const [open, setOpen] = useState(autoOpen)
  const [pendingBookmark, setPendingBookmark] = useState<{
    excerpt: string; sectionIndex: number; sectionTitle: string; top: number; left: number; label: string
  } | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  /**
   * Раскрытие уже задано начальным состоянием: переход по ссылке из плана
   * меняет режим, и карточки монтируются заново. Здесь остаётся только
   * прокрутка — ждём кадр, чтобы тело статьи успело отрисоваться.
   */
  useEffect(() => {
    if (!autoOpen) return
    const id = requestAnimationFrame(() => {
      rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => cancelAnimationFrame(id)
  }, [autoOpen])

  const meta = useMemo(() => {
    const demoCount = (item.body.match(/data-demo=/g) ?? []).length
    const parts = [`~${estimateReadingMinutes(item.body)} мин чтения`]
    if (demoCount) parts.push(`${demoCount} ${plural(demoCount, 'интерактив', 'интерактива', 'интерактивов')}`)
    return parts.join(' · ')
  }, [item.body])

  /** Оглавление строим по заголовкам разделов уже отрисованной статьи. */
  const scrollTo = (i: number) => {
    const heads = bodyRef.current?.querySelectorAll('h5')
    heads?.[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const sections = useMemo(() => {
    const matches = [...item.body.matchAll(/<h5[^>]*>([\s\S]*?)<\/h5>/gi)]
    const strip = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()
    return matches.map((match, index) => {
      const start = (match.index ?? 0) + match[0].length
      const end = matches[index + 1]?.index ?? item.body.length
      return {
        titleHtml: match[1] as string,
        title: strip(match[1] as string),
        body: item.body.slice(start, end),
      }
    })
  }, [item.body])
  const intro = useMemo(() => {
    const firstHeading = item.body.search(/<h5[^>]*>/i)
    return firstHeading < 0 ? item.body : item.body.slice(0, firstHeading)
  }, [item.body])
  const headings = useMemo(
    () => sections.map((section) => section.title),
    [sections],
  )

  useEffect(() => {
    if (!open || openSectionIndex === undefined) return
    const id = requestAnimationFrame(() => {
      const section = openSectionIndex < 0
        ? bodyRef.current?.querySelector('.th-content')
        : bodyRef.current?.querySelector(`[data-section-index="${openSectionIndex}"]`)
      const target = openExcerpt
        ? [...(section?.querySelectorAll('p,li,pre,td,h5,h6') ?? [])].find((node) =>
          (node.textContent ?? '').replace(/\s+/g, ' ').includes(openExcerpt.replace(/\s+/g, ' ').slice(0, 120)),
        )
        : undefined
      const destination = target ?? section
      destination?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (target) {
        target.classList.add('th-bookmark-target')
        window.setTimeout(() => target.classList.remove('th-bookmark-target'), 2200)
      }
    })
    return () => cancelAnimationFrame(id)
  }, [open, openSectionIndex, openExcerpt, sections])

  const captureSelection = (eventTarget?: EventTarget | null) => {
    if (!onAddBookmark) return
    if (eventTarget instanceof Element && eventTarget.closest('.th-bookmark-popover')) return
    const selection = window.getSelection()
    const excerpt = selection?.toString().replace(/\s+/g, ' ').trim()
    const anchor = selection?.anchorNode instanceof Element
      ? selection.anchorNode
      : selection?.anchorNode?.parentElement
    if (!excerpt || !anchor || !bodyRef.current?.contains(anchor)) return
    const range = selection?.getRangeAt(0)
    const container = range?.commonAncestorContainer instanceof Element
      ? range.commonAncestorContainer
      : range?.commonAncestorContainer.parentElement
    if (container?.closest('.toc, .th-bookmark-popover, .th-bookmark-btn')) return
    const section = container?.closest<HTMLElement>('[data-section-index]')
    const sectionIndex = section ? Number(section.dataset.sectionIndex) : -1
    const sectionTitle = section?.querySelector('h5')?.textContent?.trim() ?? 'Введение'
    const rect = range?.getBoundingClientRect()
    const top = Math.min(window.innerHeight - 130, Math.max(12, (rect?.bottom ?? 80) + 8))
    const left = Math.min(window.innerWidth - 300, Math.max(12, rect?.left ?? 16))
    setPendingBookmark({ excerpt: excerpt.slice(0, 500), sectionIndex, sectionTitle, top, left, label: '' })
  }

  const saveSelection = () => {
    if (!pendingBookmark || !onAddBookmark || !pendingBookmark.label.trim()) return
    const key = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
    onAddBookmark({
      key,
      articleId: item.id,
      articleTitle: item.title,
      sectionIndex: pendingBookmark.sectionIndex,
      sectionTitle: pendingBookmark.sectionTitle,
      label: pendingBookmark.label.trim().slice(0, 80),
      excerpt: pendingBookmark.excerpt,
      savedAt: Date.now(),
    })
    setPendingBookmark(null)
    window.getSelection()?.removeAllRanges()
  }

  return (
    <div className={'th-card' + (open ? ' open' : '') + (done ? ' theory-done' : '')} ref={rootRef} id={'a-' + item.id}>
      <div className="th-h" onClick={() => setOpen((v) => !v)}>
        <div className="th-t">
          <h3>{item.title}</h3>
          <p>{item.lead}</p>
          <div className="th-meta">{meta}{done ? ' · Пройдено' : ''}</div>
        </div>
        {onToggleDone ? (
          <div className="th-side">
            <span className="chip t">{item.topic}</span>
            <button
              type="button"
              className={'th-done-btn' + (done ? ' on' : '')}
              aria-pressed={done}
              title={done ? 'Снять отметку о прочтении' : 'Отметить статью прочитанной'}
              onClick={(e) => { e.stopPropagation(); onToggleDone() }}
            >
              {done ? '✓ Пройдено' : 'Отметить пройденной'}
            </button>
          </div>
        ) : <span className="chip t">{item.topic}</span>}
      </div>

      {open && (
        <div className="th-b" ref={bodyRef} onMouseUp={(event) => captureSelection(event.target)} onKeyUp={(event) => captureSelection(event.target)}>
          {headings.length > 3 && (
            <nav className="toc">
              <div className="toc-t">В этой статье</div>
              <ol>
                {headings.map((h, i) => (
                  <li key={i}>
                    <a href="#" onClick={(e) => { e.preventDefault(); scrollTo(i) }}>{h}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className="th-content">
            {intro.trim() && <RichContent html={intro} demos={demos} />}
            {sections.map((section, index) => <section className="th-section" key={`${item.id}:${index}`} data-section-index={index}>
              <h5 dangerouslySetInnerHTML={{ __html: section.titleHtml }} />
              <RichContent html={section.body} demos={demos} />
            </section>)}
          </div>
          {pendingBookmark && onAddBookmark && <form
            className="th-bookmark-popover"
            style={{ top: pendingBookmark.top, left: pendingBookmark.left }}
            onSubmit={(event) => { event.preventDefault(); saveSelection() }}
            onMouseUp={(event) => event.stopPropagation()}
          >
            <label>Название закладки<input
              autoFocus
              maxLength={80}
              value={pendingBookmark.label}
              onChange={(event) => setPendingBookmark((current) => current ? { ...current, label: event.target.value } : current)}
              placeholder="Например: разница LEFT JOIN и WHERE"
            /></label>
            <div className="th-bookmark-actions">
              <button type="button" className="btn" onClick={() => setPendingBookmark(null)}>Отмена</button>
              <button type="submit" className="btn pri" disabled={!pendingBookmark.label.trim()}>Сохранить</button>
            </div>
          </form>}
        </div>
      )}
    </div>
  )
}
