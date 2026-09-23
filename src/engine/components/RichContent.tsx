import { useMemo } from 'react'
import { Demo } from './Demo'
import { ExamSectionQuiz } from './ExamSectionQuiz'
import { highlightCodeBlocks } from './codeHighlight'
import type { LegacyDemo, Question } from '@/engine/types'

const SPLIT = /<div\s+data-demo="([^"]+)"\s*><\/div>/g
const EXAM_QUIZ_SPLIT = /<div\s+data-exam-quiz="([^"]+)"\s*><\/div>/g

/**
 * Рендерит HTML-строку статьи или разбора, подставляя на место маркеров
 * <div data-demo="…"></div> настоящие React-компоненты.
 */
export function RichContent({ html, demos, examQuestions = [] }: { html: string; demos: Record<string, LegacyDemo>; examQuestions?: Question[] }) {
  const parts = useMemo(() => {
    const chunks: ({ type: 'html'; value: string } | { type: 'demo'; name: string } | { type: 'exam-quiz'; id: string })[] = []
    let last = 0
    const markers: { match: RegExpMatchArray; type: 'demo' | 'exam-quiz' }[] = [...html.matchAll(SPLIT)].map((m) => ({ match: m, type: 'demo' }))
    markers.push(...[...html.matchAll(EXAM_QUIZ_SPLIT)].map((m) => ({ match: m, type: 'exam-quiz' as const })))
    markers.sort((a, b) => (a.match.index ?? 0) - (b.match.index ?? 0))
    for (const { match: m, type } of markers) {
      const at = m.index ?? 0
      if (at > last) chunks.push({ type: 'html', value: html.slice(last, at) })
      chunks.push(type === 'demo' ? { type, name: m[1] as string } : { type, id: m[1] as string })
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
          ? <div key={i} className="rc" dangerouslySetInnerHTML={{ __html: highlightCodeBlocks(p.value) }} />
          : p.type === 'demo'
            ? <Demo key={i} name={p.name} mount={demos[p.name]} />
            : <ExamSectionQuiz key={p.id} id={p.id} questions={examQuestions} />,
      )}
    </>
  )
}
