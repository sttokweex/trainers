import { useEffect, useState } from 'react'
import type { Card } from '@/engine/types'

/**
 * Флеш-карточки: клик переворачивает, стрелки листают, пробел переворачивает.
 * В интервью отметка «знаю» только сохраняется — переход выполняется отдельной
 * кнопкой, чтобы карточка не исчезала из-под курсора неожиданно.
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

  const isKnown = Boolean(known[card.term])
  const markLabel = isKnown ? '✓ Знаю · отмечено' : '✓ Знаю'

  return (
    <div className="cards-mode cards-mode-interview">
      <div className="intro">
        <h2>Карточки</h2>
        <p>{total} терминов с английскими эквивалентами. Клик по карточке переворачивает её, стрелки листают, пробел переворачивает. Используйте их, чтобы быстро восстановить язык профессии перед звонком.</p>
      </div>

      {
        <div className="fc-progress" aria-label={`Карточка ${safeIndex + 1} из ${items.length}`}>
          <div className="fc-progress-head">
            <span>Карточка {safeIndex + 1} из {items.length}</span>
            <span>{knownCount} освоено всего</span>
          </div>
          <div className="fc-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={safeIndex + 1}>
            <span style={{ width: `${items.length ? ((safeIndex + 1) / items.length) * 100 : 0}%` }} />
          </div>
        </div>
      }

      <div className={'fc' + (isKnown ? ' fc-known' : '')} onClick={() => setFlipped((v) => !v)}>
        <div className="side">{flipped ? 'определение' : 'термин — нажмите, чтобы увидеть определение'}</div>
        <div className="term">{card.term}</div>
        <div className="en">{card.en}</div>
        {flipped && <div className="def" dangerouslySetInnerHTML={{ __html: card.def }} />}
      </div>

      <div className="fc-bar">
        <button type="button" className="btn" onClick={() => go(-1)}>← Назад</button>
        <button
          type="button"
          className={'btn fc-know' + (isKnown ? ' is-known' : '')}
          aria-pressed={isKnown}
          onClick={() => {
            onToggleKnown(card.term)
          }}
        >
          {markLabel}
        </button>
        <button type="button" className="btn pri" onClick={() => go(1)}>Дальше →</button>
        <button
          type="button" className="btn gho"
          onClick={() => { setIndex(Math.floor(Math.random() * items.length)); setFlipped(false) }}
        >
          🎲 Случайная
        </button>
        <div className="fc-cnt">{safeIndex + 1} / {items.length} · освоено {knownCount} из {total}</div>
      </div>

      {
        <div className="fc-status" role="status" aria-live="polite">
          {isKnown
            ? '✓ Отметка сохранена. Нажмите «Знаю» ещё раз, чтобы снять её, или переходите «Дальше». '
            : 'Сначала переверните карточку, затем отметьте «Знаю», если термин знаком.'}
        </div>
      }

      <div className="intro">
        <p>
          Карточки — про <b>язык профессии</b>. В крупной команде половина технических обсуждений
          звучит по-английски, и знание пары «термин — термин» экономит время. Отметки сохраняются в браузере.
        </p>
      </div>
    </div>
  )
}
