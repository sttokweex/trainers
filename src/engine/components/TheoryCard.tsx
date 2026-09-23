import { useEffect, useMemo, useRef, useState } from 'react'
import { RichContent } from './RichContent'
import type { LegacyDemo, TheoryArticle } from '@/engine/types'

/** Грубая оценка времени чтения: ~180 слов в минуту, код считаем медленнее. */
function readTime(html: string) {
  const text = html.replace(/<pre[\s\S]*?<\/pre>/g, ' ').replace(/<[^>]+>/g, ' ')
  const words = text.split(/\s+/).filter(Boolean).length
  const codeBlocks = (html.match(/<pre/g) ?? []).length
  return Math.max(1, Math.round((words + codeBlocks * 32) / 180))
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
}: {
  item: TheoryArticle
  demos: Record<string, LegacyDemo>
  /** Пришли по ссылке из плана: раскрыть и подвести к себе. */
  autoOpen?: boolean
  /** Reading progress marker. */
  done?: boolean
  onToggleDone?: () => void
}) {
  const [open, setOpen] = useState(autoOpen)
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
    const parts = [`~${readTime(item.body)} мин чтения`]
    if (demoCount) parts.push(`${demoCount} ${plural(demoCount, 'интерактив', 'интерактива', 'интерактивов')}`)
    return parts.join(' · ')
  }, [item.body])

  /** Оглавление строим по заголовкам разделов уже отрисованной статьи. */
  const scrollTo = (i: number) => {
    const heads = bodyRef.current?.querySelectorAll('h5')
    heads?.[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const headings = useMemo(
    () => [...item.body.matchAll(/<h5[^>]*>([\s\S]*?)<\/h5>/g)].map((m) => (m[1] as string).replace(/<[^>]+>/g, '')),
    [item.body],
  )

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
        <div className="th-b" ref={bodyRef}>
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
          <RichContent html={item.body} demos={demos} />
        </div>
      )}
    </div>
  )
}
