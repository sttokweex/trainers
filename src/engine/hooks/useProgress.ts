import { useCallback, useEffect, useState } from 'react'
import type { ContentPack, Mark } from '@/engine/types'

type Marks = Record<string, Mark>
type Flags = Record<string, boolean>

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
const save = (key: string, value: unknown) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* приватный режим */ }
}

/**
 * Прогресс хранится под теми же ключами, что и в старых HTML-тренажёрах,
 * поэтому уже проставленные отметки не теряются.
 */
export function useProgress(pack: ContentPack) {
  const keys = pack.id === 'interview'
    ? {
        marks: 'interview-trainer-v1',
        reveal: 'interview-trainer-reveal',
        cards: 'interview-trainer-cards',
        plan: 'interview-trainer-plan',
      }
    : {
        marks: `${pack.storagePrefix}:marks`,
        reveal: `${pack.storagePrefix}:reveal`,
        cards: `${pack.storagePrefix}:cards`,
        plan: `${pack.storagePrefix}:plan`,
      }

  const [marks, setMarks] = useState<Marks>(() => read<Marks>(keys.marks, {}))
  const [cardsKnown, setCardsKnown] = useState<Flags>(() => (keys.cards ? read<Flags>(keys.cards, {}) : {}))
  const [planDone, setPlanDone] = useState<Flags>(() => (keys.plan ? read<Flags>(keys.plan, {}) : {}))
  const [reveal, setReveal] = useState<boolean>(() => {
    try { return localStorage.getItem(keys.reveal) !== 'hide' } catch { return true }
  })

  useEffect(() => { save(keys.marks, marks) }, [keys.marks, marks])
  useEffect(() => { if (keys.cards) save(keys.cards, cardsKnown) }, [keys.cards, cardsKnown])
  useEffect(() => { if (keys.plan) save(keys.plan, planDone) }, [keys.plan, planDone])
  useEffect(() => {
    try { localStorage.setItem(keys.reveal, reveal ? 'show' : 'hide') } catch { /* ignore */ }
  }, [keys.reveal, reveal])

  /** Повторный клик по той же отметке снимает её. */
  const toggleMark = useCallback((id: string, mark: Mark) => {
    setMarks((prev) => {
      const next = { ...prev }
      if (next[id] === mark) delete next[id]
      else next[id] = mark
      return next
    })
  }, [])

  const toggleCard = useCallback((term: string) => {
    setCardsKnown((prev) => {
      const next = { ...prev }
      if (next[term]) delete next[term]
      else next[term] = true
      return next
    })
  }, [])

  const togglePlan = useCallback((key: string, value: boolean) => {
    setPlanDone((prev) => ({ ...prev, [key]: value }))
  }, [])

  const reset = useCallback(() => { setMarks({}); setCardsKnown({}); setPlanDone({}) }, [])

  const known = Object.values(marks).filter((m) => m === 'know').length
  const repeat = Object.values(marks).filter((m) => m === 'repeat').length

  return {
    marks, toggleMark,
    cardsKnown, toggleCard,
    planDone, togglePlan,
    reset, reveal, setReveal, known, repeat,
  }
}
