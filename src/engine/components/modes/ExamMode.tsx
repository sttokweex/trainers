import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TheoryCard } from '../TheoryCard'
import { RichContent } from '../RichContent'
import { CardsMode } from './CardsMode'
import type { ContentPack, Question, TheoryArticle } from '@/engine/types'

type Stage = 'map' | 'read' | 'cards'
const STORAGE_KEY = 'audit-trainer-exam-progress-v1'
const CARD_STORAGE_KEY = 'audit-trainer-exam-cards-v1'
const EMPTY_EXAM: NonNullable<ContentPack['examPrep']> = { categories: [], theory: [], questions: [], cards: [] }

function readDone(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []
  } catch { return [] }
}

function readKnownCards(): Record<string, boolean> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(CARD_STORAGE_KEY) ?? '{}')
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, boolean> : {}
  } catch { return {} }
}

function ExamPracticeList({ questions, demos, onFinish }: { questions: Question[]; demos: ContentPack['demos']; onFinish: () => void }) {
  if (!questions.length) return <section className="tg-quest"><h3>Практические задания</h3><p>Для этой темы задачи пока не добавлены.</p><button type="button" className="btn pri" onClick={onFinish}>Завершить тему</button></section>
  return <section className="exam-practice-list">
    <div className="tg-eyebrow">Практика · отдельные задания после теории</div>
    <h3>Реши задачи и открой разбор под каждой</h3>
    <p className="exam-practice-intro">Сначала сформулируй ответ самостоятельно. Затем раскрой решение и сравни ход рассуждений.</p>
    {questions.map((question, index) => <article className="tg-quest exam-practice-card" key={question.id}>
      <div className="tg-eyebrow">Задача {index + 1}{question.level ? ` · ${question.level}` : ''}</div>
      <div className="tg-question" dangerouslySetInnerHTML={{ __html: question.q }} />
      {question.type === 'choice' && <ol className="exam-practice-options">{question.options.map((option, i) => <li key={i} dangerouslySetInnerHTML={{ __html: option.t }} />)}</ol>}
      {question.type === 'code' && <pre className="exam-practice-code"><code>{question.starter}</code></pre>}
      <details className="exam-practice-answer">
        <summary>Показать решение и объяснение</summary>
        {('solution' in question && question.solution) && <div className="exam-practice-solution"><b>Ход решения</b><p>{question.solution}</p></div>}
        <div className="tg-answer"><RichContent html={question.answer} demos={demos} /></div>
      </details>
    </article>)}
    <button type="button" className="btn pri" onClick={onFinish}>Завершить тему</button>
  </section>
}

export function ExamMode({ pack }: { pack: ContentPack }) {
  const exam = pack.examPrep ?? EMPTY_EXAM
  const [searchParams, setSearchParams] = useSearchParams()
  const [stage, setStage] = useState<Stage>('map')
  const [done, setDone] = useState<string[]>(readDone)
  const [knownCards, setKnownCards] = useState<Record<string, boolean>>(readKnownCards)
  const [article, setArticle] = useState<TheoryArticle | null>(null)

  // Экран темы хранится в URL: браузерные «назад/вперёд» остаются внутри
  // экзамена вместо выхода в предыдущий пак (например, «Собеседование»).
  const examView = searchParams.get('examView')
  const examTopicId = searchParams.get('examTopic')
  useEffect(() => {
    if (examTopicId) {
      const nextArticle = exam.theory.find((item) => item.id === examTopicId) ?? null
      setArticle(nextArticle)
      setStage(nextArticle ? 'read' : 'map')
      return
    }
    setArticle(null)
    setStage(examView === 'cards' ? 'cards' : 'map')
  }, [exam.theory, examTopicId, examView])

  function updateExamLocation(patch: { examTopic?: string | null; examView?: string | null }, replace = false) {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      for (const [key, value] of Object.entries(patch)) {
        if (value) next.set(key, value)
        else next.delete(key)
      }
      return next
    }, { replace })
  }

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(done)) } catch { /* storage may be unavailable */ }
  }, [done])

  useEffect(() => {
    try { localStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(knownCards)) } catch { /* storage may be unavailable */ }
  }, [knownCards])

  useEffect(() => {
    const reset = () => { setDone([]); setKnownCards({}) }
    window.addEventListener('audit-trainer-progress-reset', reset)
    return () => window.removeEventListener('audit-trainer-progress-reset', reset)
  }, [])

  const categoryByTopic = useMemo(() => {
    const map = new Map<string, string>()
    for (const category of exam.categories) for (const topic of category.topics) map.set(topic, category.name)
    return map
  }, [exam.categories])

  const worlds = useMemo(() => {
    const map = new Map<string, TheoryArticle[]>()
    for (const item of exam.theory) {
      const name = categoryByTopic.get(item.topic) ?? 'Дополнительные главы'
      map.set(name, [...(map.get(name) ?? []), item])
    }
    return [...map].map(([name, articles]) => ({ name, articles }))
  }, [exam.theory, categoryByTopic])

  const allComplete = done.length >= exam.theory.length

  function openChapter(item: TheoryArticle) {
    setArticle(item)
    setStage('read')
    updateExamLocation({ examTopic: item.id, examView: null })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function finishChapter() {
    if (article) setDone((previous) => previous.includes(article.id) ? previous : [...previous, article.id])
    setArticle(null); setStage('map')
    updateExamLocation({ examTopic: null, examView: null }, true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (article && stage === 'read') return (
    <div className="theory-game">
      <div className="tg-topline"><button type="button" className="btn" onClick={() => { setArticle(null); setStage('map'); updateExamLocation({ examTopic: null }, true) }}>← К темам экзамена</button><span>{article.topic}</span></div>
      <div className="tg-reading-head"><div className="tg-eyebrow">Теория · затем отдельные практические задачи</div><h2>{article.title}</h2><p>{article.lead}</p></div>
      <TheoryCard key={article.id} item={article} demos={pack.demos} autoOpen />
      <ExamPracticeList questions={exam.questions.filter((question) => question.topic === article.topic)} demos={pack.demos} onFinish={finishChapter} />
    </div>
  )

  if (stage === 'cards') return <div className="theory-game"><div className="tg-topline"><button type="button" className="btn" onClick={() => { setStage('map'); updateExamLocation({ examView: null }, true) }}>← К темам экзамена</button><span>Карточки · экзаменационная программа</span></div><CardsMode items={exam.cards} total={exam.cards.length} known={knownCards} onToggleKnown={(term) => setKnownCards((previous) => { const next = { ...previous }; if (next[term]) delete next[term]; else next[term] = true; return next })} /></div>

  return (
    <div className="theory-game">
      <section className="tg-hero"><div className="tg-hero-copy"><div className="tg-eyebrow">Подготовка к квалификационному экзамену аудитора</div><h1>Теория и практика</h1><p>На карте показаны 11 модулей программы из Word. Внутри каждой темы сначала идет теория с нормативными пояснениями, затем отдельный список практических заданий. Под каждым заданием доступен подробный разбор.</p></div><div className="tg-avatar" aria-hidden="true">✓</div></section>
      <section className="tg-progress"><div className="tg-level-row"><div><span className="tg-eyebrow">Прогресс подготовки</span><b>{done.length} из {exam.theory.length} тем пройдено</b></div><strong>{allComplete ? 'Готово' : `${Math.round((done.length / Math.max(1, exam.theory.length)) * 100)}%`}</strong></div><div className="tg-xp-track" role="progressbar" aria-label="Прогресс подготовки" aria-valuemin={0} aria-valuemax={exam.theory.length} aria-valuenow={Math.min(done.length, exam.theory.length)}><span style={{ width: `${Math.min(100, (done.length / Math.max(1, exam.theory.length)) * 100)}%` }} /></div><div className="tg-stats"><div><b>{exam.theory.length}</b><span>теоретических глав</span></div><div><b>{exam.questions.length}</b><span>вопросов в пуле</span></div><div><b>{exam.cards.length}</b><span>карточек терминов</span></div></div></section>
      <div className="tg-map-heading"><div><div className="tg-eyebrow">Экзаменационные темы</div><h2>Выбери тему</h2></div><span>{allComplete ? 'Темы можно пройти повторно' : 'Порядок свободный'}</span></div>
      <button type="button" className="btn" onClick={() => { setStage('cards'); updateExamLocation({ examView: 'cards', examTopic: null }) }}>Открыть карточки терминов · {exam.cards.length}</button>
      <div className="tg-worlds">{worlds.map((world) => <section className="tg-world" key={world.name}><div className="tg-world-heading"><h3>{world.name}</h3><span>{world.articles.filter((item) => done.includes(item.id)).length}/{world.articles.length} тем</span></div><div className="tg-chapters">{world.articles.map((item, i) => { const blocks = item.body.match(/<h5\b/g)?.length ?? 0; const tasks = exam.questions.filter((q) => q.topic === item.topic).length; return <button key={item.id} type="button" className={['tg-chapter', done.includes(item.id) ? 'complete' : ''].filter(Boolean).join(' ')} onClick={() => openChapter(item)}><span className="tg-chapter-mark">{done.includes(item.id) ? '✓' : String(i + 1).padStart(2, '0')}</span><span className="tg-chapter-copy"><b>{item.title}</b><small>{item.lead}</small></span><span className="tg-chapter-xp">{blocks} блоков · {tasks} задач</span></button> })}</div></section>)}</div>
      <p className="tg-footnote">Прогресс экзамена хранится отдельно от вкладки собеседования и обычных отметок по теории.</p>
    </div>
  )
}
