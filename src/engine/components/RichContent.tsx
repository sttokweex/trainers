import { useMemo } from 'react'
import { Demo } from './Demo'
import type { LegacyDemo } from '@/engine/types'

const SPLIT = /<div\s+data-demo="([^"]+)"\s*><\/div>/g

/**
 * Рендерит HTML-строку статьи или разбора, подставляя на место маркеров
 * <div data-demo="…"></div> настоящие React-компоненты.
 */
export function RichContent({ html, demos }: { html: string; demos: Record<string, LegacyDemo> }) {
  const parts = useMemo(() => {
    const chunks: ({ type: 'html'; value: string } | { type: 'demo'; name: string })[] = []
    let last = 0
    for (const m of html.matchAll(SPLIT)) {
      const at = m.index ?? 0
      if (at > last) chunks.push({ type: 'html', value: html.slice(last, at) })
      chunks.push({ type: 'demo', name: m[1] as string })
      last = at + m[0].length
    }
    if (last < html.length) chunks.push({ type: 'html', value: html.slice(last) })
    return chunks
  }, [html])

  return (
    <>
      {parts.map((p, i) =>
        p.type === 'html'
          // класс нужен стилям: из-за этой обёртки текстовые блоки перестали
          // быть прямыми потомками .th-b, и селекторы ширины строки их теряли
          ? <div key={i} className="rc" dangerouslySetInnerHTML={{ __html: p.value }} />
          : <Demo key={i} name={p.name} mount={demos[p.name]} />,
      )}
    </>
  )
}
