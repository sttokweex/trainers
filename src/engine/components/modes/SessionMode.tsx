import { useEffect, useState } from 'react'
import { RichContent } from '../RichContent'
import { CodeBlock } from '../CodeBlock'
import type { ContentPack, Mark, Question, ReviewState } from '@/engine/types'

const LIMIT = 10
const MINUTES = 15
const norm = (value: string) => value.trim().replace(/[\s]+/g, ' ').replace(/["'`]/g, '').toLowerCase()

const TYPE_PRIORITY: Record<Question['type'], number> = {
  output: 0,
  code: 1,
  choice: 2,
  num: 3,
  manual: 4,
  theory: 5,
}

/**
 * Собирает короткий пробный раунд из всего банка.
 *
 * Сначала важность определяется повторением (просроченные → новые → остальные),
 * но внутри одной важности вопросы идут по типу задачи. Затем темы выбираются
 * по кругу: пока есть другая тема, второй вопрос из текущей не берём. Так в
 * пробнике рядом не оказываются пять вопросов только про JavaScript, а в раунд
 * попадают разные форматы — код, вывод, выбор и объяснение.
 */
function shuffled<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}

function makeQueue(questions: Question[], reviews: Record<string, ReviewState>, marks: Record<string, Mark>) {
  const now = Date.now()
  const rank = (q: Question) => {
    const review = reviews[q.id]
    const isDue = review?.next !== undefined && review.next <= now
    const isFresh = !review && !marks[q.id]
    return isDue ? 0 : isFresh ? 1 : 2
  }
  const byTopic = new Map<string, Question[]>()
  shuffled(questions)
    .map((question, position) => ({ question, position }))
    .sort((a, b) => rank(a.question) - rank(b.question)
      || TYPE_PRIORITY[a.question.type] - TYPE_PRIORITY[b.question.type]
      || a.position - b.position)
    .forEach(({ question }) => {
      const list = byTopic.get(question.topic) ?? []
      list.push(question)
      byTopic.set(question.topic, list)
    })

  // Тема и задача внутри неё перемешиваются при старте нового раунда.
  const topics = [...byTopic.keys()]
  const queue: Question[] = []
  let cursor = 0
  while (queue.length < LIMIT && topics.length) {
    if (cursor >= topics.length) cursor = 0
    const topic = topics[cursor]!
    const list = byTopic.get(topic)
    const next = list?.shift()
    if (next) queue.push(next)
    if (!list?.length) {
      byTopic.delete(topic)
      topics.splice(cursor, 1)
    } else {
      cursor += 1
    }
  }
  return queue
}

function isAutoQuestion(item: Question): item is Extract<Question, { type: 'choice' | 'num' | 'output' }> {
  return item.type === 'choice' || item.type === 'num' || item.type === 'output'
}

export function SessionMode({
  pack, reviews, marks, onAttempt, onToggleMark, onNavigate,
}: {
  pack: ContentPack
  reviews: Record<string, ReviewState>
  marks: Record<string, Mark>
  onAttempt: (id: string, correct: boolean) => void
  onToggleMark: (id: string, mark: Mark) => void
  onNavigate: (link: { mode: 'questions'; status?: 'repeat' | 'all' }) => void
}) {
  const [startedAt] = useState(() => Date.now())
  const [left, setLeft] = useState(MINUTES * 60)
  const [index, setIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const [result, setResult] = useState<Record<string, boolean>>({})
  const [answer, setAnswer] = useState('')
  const [choice, setChoice] = useState<Set<number>>(new Set())
  const [checked, setChecked] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [queue] = useState(() => makeQueue(pack.questions, reviews, marks))
  const current = queue[index]
  const [selectedMark, setSelectedMark] = useState<Mark | undefined>(() => current ? marks[current.id] : undefined)

  useEffect(() => {
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)
      const value = Math.max(0, MINUTES * 60 - elapsed)
      setLeft(value)
      if (value === 0) setFinished(true)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [startedAt])

  const finish = () => { setFinished(true); setChecked(false) }
  const chooseMark = (mark: Mark) => {
    if (!current) return
    onToggleMark(current.id, mark)
    setSelectedMark((previous) => previous === mark ? undefined : mark)
  }
  const nextQuestion = () => {
    if (!current) return
    if (index + 1 >= queue.length) finish()
    else {
      setAnswer(''); setChoice(new Set()); setChecked(false); setShowSolution(false)
      setSelectedMark(undefined)
      setIndex((value) => value + 1)
    }
  }
  const submit = (correct: boolean) => {
    if (!current || checked) return
    setChecked(true)
    setResult((prev) => ({ ...prev, [current.id]: correct }))
    onAttempt(current.id, correct)
  }
  const check = () => {
    if (!current) return
    if (current.type === 'choice') {
      const right = current.options.every((option, i) => option.ok === choice.has(i))
      submit(right)
    } else if (current.type === 'num') {
      const value = Number(answer.replace(/\s/g, '').replace(',', '.'))
      submit(Number.isFinite(value) && Math.abs(value - current.expect) <= (current.tol ?? 0.01))
    } else if (current.type === 'output') {
      const expected = current.expected.split('\n').map(norm)
      const actual = answer.split('\n').map(norm)
      submit(expected.length === actual.length && expected.every((value, i) => value === actual[i]))
    }
  }

  if (finished) {
    const answered = Object.keys(result).length
    const correct = Object.values(result).filter(Boolean).length
    return (
      <div className="session session-finish">
        <div className="eyebrow">Пробный раунд завершён</div>
        <h2>{correct} из {answered || queue.length}</h2>
        <p>Ошибки и вопросы, которые вы отметили для повтора, останутся в обычном банке и попадут в следующую очередь.</p>
        <div className="session-actions">
          <button type="button" className="btn pri" onClick={() => { setIndex(0); setFinished(false); setResult({}); setLeft(MINUTES * 60); setAnswer(''); setChoice(new Set()); setChecked(false); setShowSolution(false); setSelectedMark(undefined) }}>Пройти ещё раз</button>
          <button type="button" className="btn" onClick={() => onNavigate({ mode: 'questions', status: 'repeat' })}>Открыть повторы</button>
        </div>
      </div>
    )
  }

  if (!current) return <div className="session session-finish"><h2>Пока нет вопросов</h2><p>Добавьте вопросы в банк, чтобы начать пробный раунд.</p></div>

  const minutes = String(Math.floor(left / 60)).padStart(2, '0')
  const seconds = String(left % 60).padStart(2, '0')
  const auto = isAutoQuestion(current)
  const priorResult = result[current.id]

  return (
    <div className="session">
      <div className="session-top">
        <div><div className="eyebrow">Пробное собеседование</div><h2>Вопрос {index + 1} из {queue.length}</h2></div>
        <div className={'session-timer' + (left < 60 ? ' danger' : '')} aria-label="Оставшееся время">{minutes}:{seconds}</div>
      </div>
      <div className="session-progress"><i style={{ width: `${((index + 1) / queue.length) * 100}%` }} /></div>
      <article className="session-card">
        <div className="chips"><span className="chip t">{current.topic}</span><span className="chip">{current.type}</span>{current.level && <span className="chip lv">{current.level}</span>}</div>
        <h3 dangerouslySetInnerHTML={{ __html: current.q }} />
        {current.code && <CodeBlock code={current.code} />}
        {current.type === 'choice' && (
          <div className="session-options">
            {current.options.map((option, i) => <button key={i} type="button" className={'session-option' + (choice.has(i) ? ' selected' : '')} disabled={checked} onClick={() => setChoice((prev) => { const next = new Set(prev); if (current.multi) { if (next.has(i)) next.delete(i); else next.add(i) } else { next.clear(); next.add(i) } return next })}><b>{String.fromCharCode(65 + i)}</b><span dangerouslySetInnerHTML={{ __html: option.t }} /></button>)}
          </div>
        )}
        {current.type === 'num' && <input className="session-input" inputMode="decimal" placeholder="Введите число" value={answer} disabled={checked} onChange={(e) => setAnswer(e.target.value)} />}
        {current.type === 'output' && <textarea className="session-textarea" rows={Math.min(8, current.expected.split('\n').length + 2)} placeholder="Одна строка вывода на строку" value={answer} disabled={checked} onChange={(e) => setAnswer(e.target.value)} />}
        {!auto && !showSolution && <button type="button" className="btn" onClick={() => setShowSolution(true)}>Показать разбор</button>}
        {showSolution && <div className="session-result"><RichContent html={current.answer} demos={pack.demos} /></div>}
        {auto && !checked && <button type="button" className="btn pri" onClick={check}>Проверить</button>}
        {checked && <div className={'session-verdict ' + (priorResult ? 'ok' : 'no')}>{priorResult ? '✓ Верно' : '✕ Есть ошибка — разбор ниже'}</div>}
        {checked && <div className="session-result"><RichContent html={current.answer} demos={pack.demos} /></div>}
      </article>
      <div className="session-bottom">
        <div className="session-mark-state">
          <span>{selectedMark ? (selectedMark === 'know' ? 'Отмечено: знаю' : 'Отмечено: повторить') : 'Отметьте результат, когда будете готовы'}</span>
          <small>Отметка сохраняется на этой карточке. Переход выполняется отдельной кнопкой.</small>
        </div>
        <div className="session-actions">
          <button type="button" className={'btn' + (selectedMark === 'know' ? ' active' : '')} aria-pressed={selectedMark === 'know'} onClick={() => chooseMark('know')}>✓ Знаю</button>
          <button type="button" className={'btn' + (selectedMark === 'repeat' ? ' active' : '')} aria-pressed={selectedMark === 'repeat'} onClick={() => chooseMark('repeat')}>↻ Нужно повторить</button>
          <button type="button" className="btn pri" onClick={nextQuestion}>{index + 1 >= queue.length ? 'Завершить пробник' : 'Следующий вопрос →'}</button>
          <button type="button" className="btn gho" onClick={finish}>Закончить сейчас</button>
        </div>
      </div>
    </div>
  )
}
