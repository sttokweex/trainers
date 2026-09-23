import { useCallback, useEffect, useMemo, useState } from 'react'
import { theoryForQuestion } from '@/engine/theoryLinks'
import type { ContentPack, Mark, Question, TheoryArticle, TheoryBookmark } from '@/engine/types'
import { QuestionCard } from '../QuestionCard'
import { estimateReadingMinutes, TheoryCard } from '../TheoryCard'

type Stage = 'map' | 'read' | 'tasks'

function pickPair(article: TheoryArticle, questions: Question[]): Question[] {
  const exact = questions.filter((question) => question.theoryId === article.id)
  const pool = exact.length ? exact : questions.filter((question) => !question.theoryId && question.topic === article.topic)
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  const first = shuffled.find((question) => question.type === 'choice') ?? shuffled[0]
  const second = shuffled.find((question) => question.id !== first?.id && question.type !== 'choice')
    ?? shuffled.find((question) => question.id !== first?.id)
  return [first, second].filter((question): question is Question => Boolean(question))
}

export function TheoryStudyMode({
  pack, articles, marks, onToggleMark, notes, onNoteChange, done, onToggleDone,
  bookmarks, onAddBookmark, onRemoveBookmark,
  openId,
}: {
  pack: ContentPack
  articles: TheoryArticle[]
  marks: Record<string, Mark | undefined>
  onToggleMark: (id: string, mark: Mark) => void
  notes: Record<string, string>
  onNoteChange: (id: string, value: string) => void
  done: Record<string, boolean>
  onToggleDone: (id: string) => void
  bookmarks: Record<string, TheoryBookmark>
  onAddBookmark: (bookmark: TheoryBookmark) => void
  onRemoveBookmark: (key: string) => void
  openId?: string
}) {
  const [stage, setStage] = useState<Stage>('map')
  const [article, setArticle] = useState<TheoryArticle | null>(null)
  const [tasks, setTasks] = useState<Question[]>([])
  const [taskIndex, setTaskIndex] = useState(0)
  const [openSectionIndex, setOpenSectionIndex] = useState<number | undefined>()
  const [openExcerpt, setOpenExcerpt] = useState<string | undefined>()

  useEffect(() => {
    if (article && !pack.theory.some((item) => item.id === article.id)) {
      setArticle(null)
      setStage('map')
    }
  }, [article, pack.theory])

  const categoryByTopic = useMemo(() => {
    const result = new Map<string, string>()
    for (const category of pack.categories ?? []) for (const topic of category.topics) result.set(topic, category.name)
    return result
  }, [pack.categories])

  const worlds = useMemo(() => {
    const grouped = new Map<string, TheoryArticle[]>()
    for (const item of articles) {
      const category = categoryByTopic.get(item.topic) ?? 'Другие темы'
      grouped.set(category, [...(grouped.get(category) ?? []), item])
    }
    return [...grouped].map(([name, items]) => {
      const byTopic = new Map<string, TheoryArticle[]>()
      for (const item of items) byTopic.set(item.topic, [...(byTopic.get(item.topic) ?? []), item])
      return { name, topics: [...byTopic] }
    })
  }, [articles, categoryByTopic])

  const openArticle = useCallback((item: TheoryArticle, sectionIndex?: number, excerpt?: string) => {
    setArticle(item)
    setOpenSectionIndex(sectionIndex)
    setOpenExcerpt(excerpt)
    setTasks(pickPair(item, pack.questions))
    setTaskIndex(0)
    setStage('read')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pack.questions])

  useEffect(() => {
    if (!openId) return
    const linked = pack.theory.find((item) => item.id === openId)
    if (linked && article?.id !== linked.id) openArticle(linked)
  }, [openId, pack.theory, article?.id, openArticle])

  function finishArticle() {
    if (article && !done[article.id]) onToggleDone(article.id)
    setArticle(null)
    setOpenSectionIndex(undefined)
    setOpenExcerpt(undefined)
    setStage('map')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (article && stage === 'read') return (
    <div className="theory-study">
      <div className="tg-topline"><button type="button" className="btn" onClick={() => setStage('map')}>← К темам и закладкам</button><span>{article.topic}</span>{article.id !== 'th-glossary' && <button type="button" className="btn" onClick={() => { const terms = articles.find((item) => item.id === 'th-glossary'); if (terms) openArticle(terms) }}>Словарь терминов</button>}</div>
      <div className="tg-reading-head"><div className="tg-eyebrow">Теория · ~{estimateReadingMinutes(article.body)} мин чтения</div><h2>{article.title}</h2><p>{article.lead}</p><small>Выдели фрагмент в статье — появится возможность сохранить его под своим названием.</small></div>
      <TheoryCard key={article.id} item={article} demos={pack.demos} autoOpen done={Boolean(done[article.id])} onToggleDone={() => onToggleDone(article.id)} onAddBookmark={onAddBookmark} openSectionIndex={openSectionIndex} openExcerpt={openExcerpt} />
      <div className="tg-reading-action"><span>После чтения ответь на два вопроса по этой теме.</span><button type="button" className="btn pri" onClick={() => { setTaskIndex(0); setStage('tasks') }}>К вопросам →</button></div>
    </div>
  )

  if (article && stage === 'tasks') {
    const task = tasks[taskIndex]
    const links = task
      ? theoryForQuestion(task, pack.theory).map((item) => ({ id: item.id, title: item.title, topic: item.topic }))
      : undefined
    return (
      <div className="theory-study">
        <div className="tg-topline"><button type="button" className="btn" onClick={() => setStage('read')}>← Вернуться к теории</button><span>Закрепление · {article.topic}</span></div>
        <section className="tg-quest">
          <div className="tg-eyebrow">Задача {taskIndex + 1} из {Math.max(2, tasks.length)}</div>
          {task ? <QuestionCard
            key={`${article.id}-${task.id}`}
            item={task}
            index={taskIndex}
            mark={marks[task.id]}
            onToggleMark={onToggleMark}
            reveal={false}
            demos={pack.demos}
            autoOpen
            note={notes[task.id]}
            onNoteChange={(value) => onNoteChange(task.id, value)}
            notesEnabled
            hint={task.hint}
            theoryLinks={links}
            onOpenTheory={(id) => {
              const linked = pack.theory.find((item) => item.id === id)
              if (linked) openArticle(linked)
            }}
          /> : <div className="empty">Для этой статьи пока не найдено двух вопросов в банке. Добавь их в раздел «Вопросы», чтобы пройти закрепление.</div>}
          <div className="tg-reading-action">
            {taskIndex < tasks.length - 1
              ? <button type="button" className="btn pri" onClick={() => setTaskIndex((index) => index + 1)}>Следующая задача →</button>
              : <button type="button" className="btn pri" onClick={finishArticle}>Завершить тему</button>}
          </div>
        </section>
      </div>
    )
  }

  const completedCount = articles.filter((item) => done[item.id]).length
  const savedBookmarks = Object.values(bookmarks).filter((bookmark) => pack.theory.some((item) => item.id === bookmark.articleId)).sort((a, b) => b.savedAt - a.savedAt)
  return (
    <div className="theory-study">
      <section className="tg-hero"><div className="tg-hero-copy"><div className="tg-eyebrow">Теория и закрепление</div><h1>Изучи тему и проверь себя</h1><p>Прочитай главу, затем реши два вопроса из банка практики по этой теме.</p></div><div className="tg-avatar" aria-hidden="true">↗</div></section>
      <section className="tg-progress"><div className="tg-level-row"><div><span className="tg-eyebrow">Прогресс</span><b>{completedCount} из {articles.length} тем пройдено</b></div><strong>{articles.length ? `${Math.round(completedCount / articles.length * 100)}%` : '0%'}</strong></div><div className="tg-xp-track" role="progressbar" aria-label="Прогресс теории" aria-valuemin={0} aria-valuemax={articles.length} aria-valuenow={completedCount}><span style={{ width: `${articles.length ? completedCount / articles.length * 100 : 0}%` }} /></div><div className="tg-stats"><div><b>{articles.length}</b><span>глав</span></div><div><b>{pack.questions.length}</b><span>вопросов в банке</span></div><div><b>2</b><span>задачи после главы</span></div></div></section>
      {savedBookmarks.length > 0 && <section className="tg-bookmarks"><div className="tg-bookmarks-head"><div><div className="tg-eyebrow">Сохранённые фрагменты</div><h2>Мои закладки</h2></div><span>{savedBookmarks.length}</span></div><div className="tg-bookmarks-list">{savedBookmarks.map((bookmark) => {
        const savedArticle = pack.theory.find((item) => item.id === bookmark.articleId)
        if (!savedArticle) return null
        return <article className="tg-bookmark" key={bookmark.key}><button type="button" className="tg-bookmark-open" onClick={() => openArticle(savedArticle, bookmark.sectionIndex, bookmark.excerpt)}><strong>{bookmark.label}</strong><span>{bookmark.articleTitle} · {bookmark.sectionTitle}</span><q>{bookmark.excerpt}</q></button><button type="button" className="tg-bookmark-remove" aria-label={`Удалить закладку ${bookmark.label}`} title="Удалить закладку" onClick={() => onRemoveBookmark(bookmark.key)}>×</button></article>
      })}</div></section>}
      <div className="tg-map-heading"><div><div className="tg-eyebrow">Темы</div><h2>Выбери главу</h2></div><span>Порядок свободный</span></div>
      <div className="tg-worlds">{worlds.map((world) => <section className="tg-world" key={world.name}><div className="tg-world-heading"><h3>{world.name}</h3><span>{world.topics.flatMap(([, items]) => items).filter((item) => done[item.id]).length}/{world.topics.reduce((sum, [, items]) => sum + items.length, 0)} глав</span></div>{world.topics.map(([topic, items]) => <div key={topic}><div className="grp">{topic}</div><div className="tg-chapters">{items.map((item, index) => {
        const count = pack.questions.filter((question) => question.theoryId === item.id || (!question.theoryId && question.topic === item.topic)).length
        return <button key={item.id} type="button" className={['tg-chapter', done[item.id] ? 'complete' : ''].filter(Boolean).join(' ')} onClick={() => openArticle(item)}><span className="tg-chapter-mark">{done[item.id] ? '✓' : String(index + 1).padStart(2, '0')}</span><span className="tg-chapter-copy"><b>{item.title}</b><small>{item.lead}</small></span><span className="tg-chapter-xp">~{estimateReadingMinutes(item.body)} мин · {count} вопросов</span></button>
      })}</div></div>)}</section>)}</div>
    </div>
  )
}
