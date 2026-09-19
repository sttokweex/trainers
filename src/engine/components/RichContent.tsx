import { Fragment, useMemo } from 'react'
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
          ? <div key={i} dangerouslySetInnerHTML={{ __html: p.value }} />
          : <Demo key={i} name={p.name} mount={demos[p.name]} />,
      )}
    </>
  )
}

/** Разбивка текста на пункты оглавления — по заголовкам разделов. */
export function useHeadings(html: string) {
  return useMemo(() => {
    const out: { id: string; text: string }[] = []
    let i = 0
    for (const m of html.matchAll(/<h5[^>]*>([\s\S]*?)<\/h5>/g)) {
      out.push({ id: 's' + i++, text: (m[1] as string).replace(/<[^>]+>/g, '') })
    }
    return out
  }, [html])
}

export { Fragment }
