import { useCallback, useEffect, useState } from 'react'
import type { ContentPack, Mark } from '@/engine/types'

type Marks = Record<string, Mark>

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
 * поэтому уже проставленные отметки «знаю / повторить» не теряются.
 */
export function useProgress(pack: ContentPack) {
  const marksKey = pack.id === 'interview' ? 'interview-trainer-v1' : `${pack.storagePrefix}:marks`
  const revealKey = pack.id === 'interview' ? 'interview-trainer-reveal' : `${pack.storagePrefix}:reveal`

  const [marks, setMarks] = useState<Marks>(() => read<Marks>(marksKey, {}))
  const [reveal, setReveal] = useState<boolean>(() => {
    try { return localStorage.getItem(revealKey) !== 'hide' } catch { return true }
  })

  useEffect(() => { save(marksKey, marks) }, [marksKey, marks])
  useEffect(() => {
    try { localStorage.setItem(revealKey, reveal ? 'show' : 'hide') } catch { /* ignore */ }
  }, [revealKey, reveal])

  /** Повторный клик по той же отметке снимает её. */
  const toggleMark = useCallback((id: string, mark: Mark) => {
    setMarks((prev) => {
      const next = { ...prev }
      if (next[id] === mark) delete next[id]
      else next[id] = mark
      return next
    })
  }, [])

  const reset = useCallback(() => setMarks({}), [])

  const known = Object.values(marks).filter((m) => m === 'know').length
  const repeat = Object.values(marks).filter((m) => m === 'repeat').length

  return { marks, toggleMark, reset, reveal, setReveal, known, repeat }
}
