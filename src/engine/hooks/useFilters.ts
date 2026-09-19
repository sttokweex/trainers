import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ContentPack, PackMode } from '@/engine/types'

export interface Filters {
  mode: PackMode
  topic: string
  kind: string
  level: string
  status: string
  query: string
  /** id статьи или инструмента, который надо раскрыть и показать. */
  open: string
}

/**
 * Фильтры живут в URL: работает кнопка «назад», ссылку можно сохранить,
 * перезагрузка не сбрасывает выбор.
 */
export function useFilters(pack: ContentPack) {
  const [params, setParams] = useSearchParams()

  const filters = useMemo<Filters>(() => ({
    mode: (params.get('mode') as PackMode | null) ?? pack.defaultMode,
    topic: params.get('topic') ?? 'all',
    kind: params.get('kind') ?? 'all',
    level: params.get('level') ?? 'all',
    status: params.get('status') ?? 'all',
    query: params.get('q') ?? '',
    open: params.get('open') ?? '',
  }), [params, pack.defaultMode])

  const set = useCallback((patch: Partial<Filters>) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      const map: Record<keyof Filters, string> = {
        mode: 'mode', topic: 'topic', kind: 'kind', level: 'level',
        status: 'status', query: 'q', open: 'open',
      }
      for (const [k, v] of Object.entries(patch)) {
        const key = map[k as keyof Filters]
        // «всё» и пустая строка — значения по умолчанию, их в URL не держим
        if (!v || v === 'all') next.delete(key)
        else next.set(key, String(v))
      }
      return next
    }, { replace: true })
  }, [setParams])

  return { filters, set }
}
