import { useEffect, useMemo, useState } from 'react'
import { TheoryCard } from '../TheoryCard'
import { RichContent } from '../RichContent'
import { CardsMode } from './CardsMode'
import type { ChoiceQuestion, ContentPack, Question, TheoryArticle } from '@/engine/types'

type Stage = 'map' | 'read' | 'challenge' | 'practice' | 'cards'
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

function pick<T,>(items: T[]): T | undefined {
  return items.length ? items[Math.floor(Math.random() * items.length)] : undefined
}

export function ExamMode({ pack }: { pack: ContentPack }) {
  const exam = pack.examPrep ?? EMPTY_EXAM
  const [stage, setStage] = useState<Stage>('map')
  const [done, setDone] = useState<string[]>(readDone)
  const [knownCards, setKnownCards] = useState<Record<string, boolean>>(readKnownCards)
  const [article, setArticle] = useState<TheoryArticle | null>(null)
  const [challenge, setChallenge] = useState<ChoiceQuestion | undefined>()
  const [practice, setPractice] = useState<Question | undefined>()
  const [picked, setPicked] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [answer, setAnswer] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [selfRated, setSelfRated] = useState(false)

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
    const pool = exam.questions.filter((q) => q.topic === item.topic)
    setArticle(item)
    setChallenge(pick(pool.filter((q): q is ChoiceQuestion => q.type === 'choice' && !q.multi)))
    setPractice(pick(pool.filter((q) => q.type !== 'choice')) ?? pick(pool))
    setPicked(null); setChecked(false); setAnswer(''); setRevealed(false); setSelfRated(false)
    setStage('read')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function finishChapter() {
    if (article) setDone((previous) => previous.includes(article.id) ? previous : [...previous, article.id])
    setArticle(null); setStage('map')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (article && stage === 'read') return (
    <div className="theory-game">
      <div className="tg-topline"><button type="button" className="btn" onClick={() => setStage('map')}>← К темам экзамена</button><span>{article.topic}</span></div>
      <div className="tg-reading-head"><div className="tg-eyebrow">Теория · затем две разные задачи</div><h2>{article.title}</h2><p>{article.lead}</p></div>
      <TheoryCard key={article.id} item={article} demos={pack.demos} autoOpen />
      <div className="tg-reading-action"><span>Сначала проверь понимание, затем реши отдельную практическую задачу.</span><button type="button" className="btn pri" onClick={() => { setPicked(null); setChecked(false); setStage(challenge ? 'challenge' : 'practice') }}>К проверке →</button></div>
    </div>
  )

  if (stage === 'cards') return <div className="theory-game"><div className="tg-topline"><button type="button" className="btn" onClick={() => setStage('map')}>← К темам экзамена</button><span>Карточки · экзаменационная программа</span></div><CardsMode items={exam.cards} total={exam.cards.length} known={knownCards} onToggleKnown={(term) => setKnownCards((previous) => { const next = { ...previous }; if (next[term]) delete next[term]; else next[term] = true; return next })} /></div>

  if (article && stage === 'challenge' && challenge) {
    const correct = picked !== null && challenge.options[picked]?.ok === true
    return (
      <div className="theory-game">
        <div className="tg-topline"><button type="button" className="btn" onClick={() => setStage('read')}>← Вернуться к теории</button><span>Проверка понимания · {article.topic}</span></div>
        <section className="tg-quest"><div className="tg-eyebrow">Задача 1 · теория</div><div className="tg-question" dangerouslySetInnerHTML={{ __html: challenge.q }} />
          <div className="tg-choices">{challenge.options.map((option, i) => <button key={i} type="button" className={['tg-choice', picked === i ? 'selected' : '', checked && option.ok ? 'correct' : '', checked && picked === i && !option.ok ? 'incorrect' : ''].filter(Boolean).join(' ')} disabled={checked} onClick={() => setPicked(i)}><b>{String.fromCharCode(65 + i)}</b><span dangerouslySetInnerHTML={{ __html: option.t }} /></button>)}</div>
          {!checked ? <button type="button" className="btn pri" disabled={picked === null} onClick={() => setChecked(true)}>Проверить</button> : <><div className={'tg-verdict ' + (correct ? 'correct' : 'incorrect')}>{correct ? 'Верно. Теперь закрепи тему задачей другого типа.' : 'Ответ и пояснение ниже. После разбора переходи к практике.'}</div><div className="tg-answer"><RichContent html={challenge.answer} demos={pack.demos} /></div><button type="button" className="btn pri" onClick={() => { setAnswer(''); setRevealed(false); setStage('practice') }}>Перейти к практике →</button></>}
        </section>
      </div>
    )
  }

  if (article && stage === 'practice') {
    const numeric = practice?.type === 'num'
    const numCorrect = practice?.type === 'num'
      && Math.abs(Number(answer.replace(',', '.')) - practice.expect) <= (practice.tol ?? 0.01)
    return (
      <div className="theory-game">
        <div className="tg-topline"><button type="button" className="btn" onClick={() => setStage(challenge ? 'challenge' : 'read')}>← Назад</button><span>Практика · {article.topic}</span></div>
        <section className="tg-quest"><div className="tg-eyebrow">Задача 2 · самостоятельная практика</div>
          {practice ? <>
            <div className="tg-question" dangerouslySetInnerHTML={{ __html: practice.q }} />
            {numeric && <label className="exam-answer-field">Твой ответ{practice.unit ? `, ${practice.unit}` : ''}<input value={answer} onChange={(e) => setAnswer(e.target.value)} inputMode="decimal" disabled={revealed} /></label>}
            {!revealed ? <button type="button" className="btn pri" disabled={numeric && !answer.trim()} onClick={() => { setRevealed(true); setSelfRated(true) }}>{numeric ? 'Проверить ответ' : 'Показать разбор'}</button> : <>
              {numeric && practice?.type === 'num' && <div className={'tg-verdict ' + (numCorrect ? 'correct' : 'incorrect')}>{numCorrect ? 'Верно.' : `Проверь расчёт. Правильный ответ: ${practice.expect}${practice.unit ? ` ${practice.unit}` : ''}.`}</div>}
              <div className="tg-answer"><RichContent html={practice.answer} demos={pack.demos} /></div>
              {!numeric && <><p className="tg-self-check">Сверь ход решения и вывод с разбором.</p><div className="tg-choices"><button type="button" className="tg-choice" onClick={() => setSelfRated(true)}>Понял задачу</button><button type="button" className="tg-choice" onClick={() => setSelfRated(true)}>Отмечу тему для повтора</button></div></>}
              {(numeric || selfRated) && <button type="button" className="btn pri" onClick={finishChapter}>Завершить тему</button>}
            </>}
          </> : <><div className="tg-question">Для этой статьи пока нет отдельной задачи в пуле. Сформулируй ключевой вывод и проверь себя по теории.</div><button type="button" className="btn pri" onClick={() => setRevealed(true)}>Показать теорию</button>{revealed && <button type="button" className="btn pri" onClick={finishChapter}>Завершить тему</button>}</>}
        </section>
      </div>
    )
  }

  return (
    <div className="theory-game">
      <section className="tg-hero"><div className="tg-hero-copy"><div className="tg-eyebrow">Подготовка к квалификационному экзамену аудитора</div><h1>Теория и практика</h1><p>На карте показаны 11 модулей программы из Word. Открой модуль: внутри подробная теория по его разделам и нормативным материалам. После чтения система предложит проверочный вопрос и практический кейс; в пуле по каждой теме есть несколько вариантов.</p></div><div className="tg-avatar" aria-hidden="true">✓</div></section>
      <section className="tg-progress"><div className="tg-level-row"><div><span className="tg-eyebrow">Прогресс подготовки</span><b>{done.length} из {exam.theory.length} тем пройдено</b></div><strong>{allComplete ? 'Готово' : `${Math.round((done.length / Math.max(1, exam.theory.length)) * 100)}%`}</strong></div><div className="tg-xp-track" role="progressbar" aria-label="Прогресс подготовки" aria-valuemin={0} aria-valuemax={exam.theory.length} aria-valuenow={Math.min(done.length, exam.theory.length)}><span style={{ width: `${Math.min(100, (done.length / Math.max(1, exam.theory.length)) * 100)}%` }} /></div><div className="tg-stats"><div><b>{exam.theory.length}</b><span>теоретических глав</span></div><div><b>{exam.questions.length}</b><span>вопросов в пуле</span></div><div><b>{exam.cards.length}</b><span>карточек терминов</span></div></div></section>
      <div className="tg-map-heading"><div><div className="tg-eyebrow">Экзаменационные темы</div><h2>Выбери тему</h2></div><span>{allComplete ? 'Темы можно пройти повторно' : 'Порядок свободный'}</span></div>
      <button type="button" className="btn" onClick={() => setStage('cards')}>Открыть карточки терминов · {exam.cards.length}</button>
      <div className="tg-worlds">{worlds.map((world) => <section className="tg-world" key={world.name}><div className="tg-world-heading"><h3>{world.name}</h3><span>{world.articles.filter((item) => done.includes(item.id)).length}/{world.articles.length} тем</span></div><div className="tg-chapters">{world.articles.map((item, i) => <button key={item.id} type="button" className={['tg-chapter', done.includes(item.id) ? 'complete' : ''].filter(Boolean).join(' ')} onClick={() => openChapter(item)}><span className="tg-chapter-mark">{done.includes(item.id) ? '✓' : String(i + 1).padStart(2, '0')}</span><span className="tg-chapter-copy"><b>{item.title}</b><small>{item.lead}</small></span><span className="tg-chapter-xp">{exam.questions.filter((q) => q.topic === item.topic).length} задач</span></button>)}</div></section>)}</div>
      <p className="tg-footnote">Прогресс экзамена хранится отдельно от вкладки собеседования и обычных отметок по теории.</p>
    </div>
  )
}
