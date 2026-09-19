import { useEffect, useState } from 'react'
import type { Card } from '@/engine/types'

/**
 * Флеш-карточки: клик переворачивает, стрелки листают, пробел переворачивает.
 * Отметка «знаю» сразу переводит на следующую — так проходить быстрее.
 */
export function CardsMode({
  items, total, known, onToggleKnown,
}: {
  items: Card[]
  /** Сколько карточек в паке всего — для счётчика «освоено N из M». */
  total: number
  known: Record<string, boolean>
  onToggleKnown: (term: string) => void
}) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  // список мог отфильтроваться — не выходим за границы
  const safeIndex = items.length ? Math.min(index, items.length - 1) : 0
  const card = items[safeIndex]

  const go = (delta: number) => {
    if (!items.length) return
    setIndex((i) => (Math.min(i, items.length - 1) + delta + items.length) % items.length)
    setFlipped(false)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === ' ') { e.preventDefault(); setFlipped((v) => !v) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  if (!card) return <div className="empty">Ничего не найдено</div>

  const knownCount = Object.keys(known).length

  return (
    <>
      <div className="intro">
        <h2>Карточки</h2>
        <p>{total} терминов с английскими эквивалентами. Клик по карточке переворачивает её, стрелки листают, пробел переворачивает.</p>
      </div>

      <div className="fc" onClick={() => setFlipped((v) => !v)}>
        <div className="side">{flipped ? 'определение' : 'термин — нажмите, чтобы увидеть определение'}</div>
        <div className="term">{card.term}</div>
        <div className="en">{card.en}</div>
        {flipped && <div className="def" dangerouslySetInnerHTML={{ __html: card.def }} />}
      </div>

      <div className="fc-bar">
        <button type="button" className="btn" onClick={() => go(-1)}>← Назад</button>
        <button type="button" className="btn pri" onClick={() => go(1)}>Дальше →</button>
        <button
          type="button" className="btn"
          onClick={() => { onToggleKnown(card.term); go(1) }}
        >
          {known[card.term] ? '✓ В освоенных' : '✓ Знаю'}
        </button>
        <button
          type="button" className="btn gho"
          onClick={() => { setIndex(Math.floor(Math.random() * items.length)); setFlipped(false) }}
        >
          🎲 Случайная
        </button>
        <div className="fc-cnt">
          {safeIndex + 1} / {items.length} · освоено {knownCount} из {total}
        </div>
      </div>

      <div className="intro">
        <p>
          Карточки — про <b>язык профессии</b>. В крупной фирме половина методологии звучит
          по-английски, и знание пары «термин — термин» экономит время на любом обсуждении.
          Отметки сохраняются в браузере.
        </p>
      </div>
    </>
  )
}
