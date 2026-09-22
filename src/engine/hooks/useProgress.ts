import { useCallback, useEffect, useState } from 'react'
import type { ContentPack, Mark, ReviewState } from '@/engine/types'

type Marks = Record<string, Mark>
type Flags = Record<string, boolean>
type Reviews = Record<string, ReviewState>

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
        theory: 'interview-trainer-theory',
        notes: 'interview-trainer-notes',
        reviews: 'interview-trainer-reviews',
      }
    : {
        marks: `${pack.storagePrefix}:marks`,
        reveal: `${pack.storagePrefix}:reveal`,
        cards: `${pack.storagePrefix}:cards`,
        plan: `${pack.storagePrefix}:plan`,
        theory: '',
        notes: '',
        reviews: '',
      }

  const [marks, setMarks] = useState<Marks>(() => read<Marks>(keys.marks, {}))
  const [cardsKnown, setCardsKnown] = useState<Flags>(() => (keys.cards ? read<Flags>(keys.cards, {}) : {}))
  const [planDone, setPlanDone] = useState<Flags>(() => (keys.plan ? read<Flags>(keys.plan, {}) : {}))
  const [theoryDone, setTheoryDone] = useState<Flags>(() => (keys.theory ? read<Flags>(keys.theory, {}) : {}))
  const [notes, setNotes] = useState<Record<string, string>>(() => (keys.notes ? read<Record<string, string>>(keys.notes, {}) : {}))
  const [reviews, setReviews] = useState<Reviews>(() => (keys.reviews ? read<Reviews>(keys.reviews, {}) : {}))
  const [reveal, setReveal] = useState<boolean>(() => {
    try { return localStorage.getItem(keys.reveal) !== 'hide' } catch { return true }
  })

  useEffect(() => { save(keys.marks, marks) }, [keys.marks, marks])
  useEffect(() => { if (keys.cards) save(keys.cards, cardsKnown) }, [keys.cards, cardsKnown])
  useEffect(() => { if (keys.plan) save(keys.plan, planDone) }, [keys.plan, planDone])
  useEffect(() => { if (keys.theory) save(keys.theory, theoryDone) }, [keys.theory, theoryDone])
  useEffect(() => { if (keys.notes) save(keys.notes, notes) }, [keys.notes, notes])
  useEffect(() => { if (keys.reviews) save(keys.reviews, reviews) }, [keys.reviews, reviews])
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

  /** Отметка прочитанной статьи. Доступна только интервью-паку. */
  const toggleTheory = useCallback((id: string) => {
    if (!keys.theory) return
    setTheoryDone((prev) => {
      const next = { ...prev }
      if (next[id]) delete next[id]
      else next[id] = true
      return next
    })
  }, [keys.theory])

  const setNote = useCallback((id: string, value: string) => {
    setNotes((prev) => {
      const next = { ...prev }
      if (value.trim()) next[id] = value
      else delete next[id]
      return next
    })
  }, [])

  /** Результат ответа двигает вопрос по простой лестнице повторений. */
  const recordAttempt = useCallback((id: string, correct: boolean) => {
    setReviews((prev) => {
      const old = prev[id]
      const attempts = (old?.attempts ?? 0) + 1
      const correctCount = (old?.correct ?? 0) + (correct ? 1 : 0)
      const intervals = [1, 3, 7, 14, 30]
      const step = correct ? Math.min(correctCount, intervals.length) - 1 : 0
      const days = correct ? (intervals[Math.max(0, step)] ?? 0) : 0
      const now = Date.now()
      return {
        ...prev,
        [id]: { attempts, correct: correctCount, next: now + days * 86400000, last: now },
      }
    })
  }, [])

  const reset = useCallback(() => {
    setMarks({}); setCardsKnown({}); setPlanDone({}); setTheoryDone({}); setNotes({}); setReviews({})
  }, [])

  const exportProgress = useCallback(() => JSON.stringify({
    pack: pack.id, version: 1, exportedAt: new Date().toISOString(), marks, cardsKnown, planDone, theoryDone, notes, reviews,
  }, null, 2), [pack.id, marks, cardsKnown, planDone, theoryDone, notes, reviews])

  const importProgress = useCallback((raw: string) => {
    try {
      const data = JSON.parse(raw) as Partial<{
        pack: string; version: number
        marks: Marks; cardsKnown: Flags; planDone: Flags; theoryDone: Flags
        notes: Record<string, string>; reviews: Reviews
      }>
      if (!data || typeof data !== 'object') return false
      if (data.pack && data.pack !== pack.id) return false
      if (data.version && data.version !== 1) return false
      if (data.marks && typeof data.marks === 'object') setMarks(data.marks)
      if (data.cardsKnown && typeof data.cardsKnown === 'object') setCardsKnown(data.cardsKnown)
      if (data.planDone && typeof data.planDone === 'object') setPlanDone(data.planDone)
      if (data.theoryDone && typeof data.theoryDone === 'object') setTheoryDone(data.theoryDone)
      if (data.notes && typeof data.notes === 'object') setNotes(data.notes)
      if (data.reviews && typeof data.reviews === 'object') setReviews(data.reviews)
      return true
    } catch {
      return false
    }
  }, [pack.id])

  const known = Object.values(marks).filter((m) => m === 'know').length
  const repeat = Object.values(marks).filter((m) => m === 'repeat').length

  return {
    marks, toggleMark,
    cardsKnown, toggleCard,
    planDone, togglePlan, theoryDone, toggleTheory,
    notes, setNote, reviews, recordAttempt, exportProgress, importProgress,
    reset, reveal, setReveal, known, repeat,
  }
}
