import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DEFAULT_PACK, PACK_META, loadPack } from '@/content'
import { QuestionCard } from '@/engine/components/QuestionCard'
import { TheoryCard } from '@/engine/components/TheoryCard'
import { CardsMode } from '@/engine/components/modes/CardsMode'
import { PlanMode } from '@/engine/components/modes/PlanMode'
import { ToolsMode } from '@/engine/components/modes/ToolsMode'
import { DashboardMode } from '@/engine/components/modes/DashboardMode'
import { SessionMode } from '@/engine/components/modes/SessionMode'
import { TheoryGameMode } from '@/engine/components/modes/TheoryGameMode'
import { ExamMode } from '@/engine/components/modes/ExamMode'
import { useFilters } from '@/engine/hooks/useFilters'
import { useProgress } from '@/engine/hooks/useProgress'
import type { ContentPack, PackMode, PlanLink, Question, TheoryArticle } from '@/engine/types'
import { theoryForQuestion } from '@/engine/theoryLinks'
import '@/engine/styles/index.css'

const MODE_LABEL: Record<PackMode, string> = {
  questions: 'Вопросы', theory: 'Теория', 'theory-game': '🎮 Теория-игра', tools: 'Практикум', cards: 'Карточки', plan: 'План',
  dashboard: 'Обзор', session: 'Пробник',
}
const TYPE_LABEL: Record<Question['type'], string> = {
  theory: 'теория', code: 'код', output: 'вывод', manual: 'написать', choice: 'выбор', num: 'расчёт',
}

const matches = (haystack: string, q: string) => !q || haystack.toLowerCase().includes(q.toLowerCase())

export function App() {
  const { packId } = useParams()
  const [pack, setPack] = useState<ContentPack | null>(null)

  useEffect(() => {
    let cancelled = false
    loadPack(packId ?? DEFAULT_PACK).then((p) => { if (!cancelled) setPack(p) })
    return () => { cancelled = true }
  }, [packId])

  if (!pack) return <div className="empty">Загружаем контент…</div>
  return <Trainer key={pack.id} pack={pack} />
}

function Trainer({ pack }: { pack: ContentPack }) {
  const navigate = useNavigate()
  const { filters, set } = useFilters(pack)
  const {
    marks, toggleMark, cardsKnown, toggleCard, planDone, togglePlan, theoryDone, toggleTheory,
    reset, reveal, setReveal, known, repeat,
    notes, setNote, reviews, recordAttempt, exportProgress, importProgress,
  } = useProgress(pack)

  const searchRef = useRef<HTMLInputElement>(null)
  const topRef = useRef<HTMLElement>(null)
  const sideRef = useRef<HTMLElement>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  /** Interview-only marker for the last random question. */
  const [randomPick, setRandomPick] = useState<{ id: string; filterKey: string; nonce: number } | null>(null)

  /** Высота липкой шапки уезжает в CSS — от неё считается высота сайдбара. */
  useEffect(() => {
    const node = topRef.current
    if (!node) return
    const sync = () => document.documentElement.style.setProperty('--top-h', node.offsetHeight + 'px')
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(node)
    return () => ro.disconnect()
  }, [])

  /** «/» фокусирует поиск — как в старом тренажёре. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === '?' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault()
        setHelpOpen(true)
      }
      if (e.key === 'Escape') setHelpOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const mode = pack.modes.includes(filters.mode) ? filters.mode : pack.defaultMode

  /** A random marker is useful only inside the current result set. */
  const randomFilterKey = `${pack.id}|${filters.mode}|${filters.topic}|${filters.kind}|${filters.level}|${filters.status}|${filters.query}|${filters.open}`
  const changeFilters = (patch: Partial<typeof filters>) => {
    setRandomPick(null)
    set(patch)
  }

  /** В заголовке вкладки сразу видно, какой пак и режим открыт. */
  useEffect(() => {
    document.title = `${pack.title} · ${MODE_LABEL[mode]} — Тренажёры`
    return () => { document.title = 'Тренажёры' }
  }, [pack.title, mode])

  /** План — единственный режим без фильтров: там нечего фильтровать. */
  const showSidebar = mode !== 'plan' && mode !== 'dashboard' && mode !== 'session' && mode !== 'theory-game'

  /** Сайдбар — свой скролл-контейнер (position:sticky + overflow-y:auto), и он
      не сбрасывается сам при выборе темы. Если до этого его прокрутили вниз
      (длинный список тем не помещается в высоту экрана), после клика по теме
      верх сайдбара — «Все темы» — оставался за пределами видимости, и чтобы
      выбрать другую тему, приходилось докручивать сайдбар отдельно от страницы. */
  useEffect(() => {
    if (sideRef.current) sideRef.current.scrollTop = 0
  }, [filters.topic, mode])

  const questions = useMemo(() => pack.questions.filter((q) => {
    if (filters.topic !== 'all' && q.topic !== filters.topic) return false
    if (filters.kind !== 'all' && q.type !== filters.kind) return false
    if (filters.level !== 'all' && q.level !== filters.level) return false
    const mark = marks[q.id]
    if (filters.status === 'know' && mark !== 'know') return false
    if (filters.status === 'repeat' && mark !== 'repeat') return false
    if (filters.status === 'new' && mark) return false
    return matches([q.q, q.answer, q.topic].join(' '), filters.query)
  }), [pack.questions, filters, marks])

  const theory = useMemo(() => pack.theory.filter((t) =>
    (filters.topic === 'all' || t.topic === filters.topic)
    && matches([t.title, t.lead, t.body, t.topic].join(' '), filters.query),
  ), [pack.theory, filters])

  const tools = useMemo(() => (pack.tools ?? []).filter((t) =>
    (filters.topic === 'all' || t.topic === filters.topic)
    && matches([t.t, t.d, t.topic].join(' '), filters.query),
  ), [pack.tools, filters])

  const cards = useMemo(() => (pack.cards ?? []).filter((c) =>
    (filters.topic === 'all' || c.topic === filters.topic)
    && matches([c.term, c.en, c.def].join(' '), filters.query),
  ), [pack.cards, filters])

  /** Темы и счётчики берутся из того реестра, который сейчас показан. */
  const topicCounts = useMemo(() => {
    const src: { topic: string }[] =
      mode === 'theory' ? pack.theory
        : mode === 'tools' ? (pack.tools ?? [])
        : mode === 'cards' ? (pack.cards ?? [])
        : pack.questions
    const map = new Map<string, number>()
    for (const x of src) map.set(x.topic, (map.get(x.topic) ?? 0) + 1)
    return map
  }, [pack, mode])

  const listed: (Question | TheoryArticle)[] = mode === 'theory' ? theory : questions
  /** Группировка по теме целиком, а не по соседним элементам: если статьи одной
      темы лежат в разных файлах контента (например, «ООП и принципы» собрана из
      th-oop.ts и th-patterns.ts), они не идут подряд в исходном массиве — группировка
      «пока тема не сменилась» давала два блока с одинаковым topic и, как следствие,
      одинаковым React key у соседних <div>, что ломало реконсиляцию при смене фильтра
      (верхний блок переставал обновляться и реагировать на клики). */
  const grouped = useMemo(() => {
    const order: string[] = []
    const byTopic = new Map<string, (Question | TheoryArticle)[]>()
    for (const item of listed) {
      let bucket = byTopic.get(item.topic)
      if (!bucket) { bucket = []; byTopic.set(item.topic, bucket); order.push(item.topic) }
      bucket.push(item)
    }
    return order.map((topic) => ({ topic, items: byTopic.get(topic)! }))
  }, [listed])

  /** Переход по ссылке из плана: меняем режим, тему и цель раскрытия разом. */
  const goToLink = (link: PlanLink) => {
    changeFilters({
      mode: link.mode,
      topic: link.topic ?? 'all',
      open: link.id ?? '',
      query: '',
      kind: 'all',
      level: 'all',
      status: link.status ?? 'all',
    })
    window.scrollTo({ top: 0 })
  }

  const pickRandom = () => {
    const pool = questions.filter((q) => marks[q.id] !== 'know')
    const src = pool.length ? pool : questions
    const item = src[Math.floor(Math.random() * src.length)]
    if (!item) return
    if (pack.id === 'interview') {
      setRandomPick((previous) => ({
        id: item.id,
        filterKey: randomFilterKey,
        nonce: (previous?.nonce ?? 0) + 1,
      }))
    }
    document.getElementById('q-' + item.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const categories = pack.categories
  const topicGroups = categories
    ? categories.map((c) => ({ name: c.name, topics: c.topics.filter((t) => topicCounts.has(t)) }))
    : [{ name: '', topics: [...topicCounts.keys()] }]

  /** Счётчик у «Все темы» — как и topicCounts, игнорирует все фильтры, кроме режима:
      иначе при выбранной теме он совпадал бы с её же счётчиком. */
  const totalInMode =
    mode === 'theory' ? pack.theory.length
      : mode === 'tools' ? (pack.tools ?? []).length
      : mode === 'cards' ? (pack.cards ?? []).length
      : pack.questions.length

  return (
    <>
      <header className="top" ref={topRef}>
        <div className="top-in">
          <div className="brand">Тренажёр <span>{pack.title.toLowerCase()}</span></div>

          {/* при сборке под один пак переключать нечего */}
          {PACK_META.length > 1 && (
            <div className="modes">
              {PACK_META.map((p) => (
                <button
                  key={p.id} type="button"
                  className={'md' + (p.id === pack.id ? ' on' : '')}
                  onClick={() => navigate('/' + p.id)}
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}

          <div className="modes">
            {pack.modes.map((m) => (
              <button
                key={m} type="button"
                className={'md' + (m === mode ? ' on' : '')}
                onClick={() => changeFilters({ mode: m, topic: 'all' })}
              >
                {m === 'theory-game' && pack.id === 'audit' ? 'Экзамен' : MODE_LABEL[m]}
              </button>
            ))}
          </div>

          {mode === 'questions' && pack.id !== 'interview' && (
            <div className="modes">
              <button
                type="button" className={'md' + (reveal ? ' on' : '')}
                onClick={() => setReveal(true)}
                title="Ответ на теоретические вопросы виден сразу"
              >
                Изучение
              </button>
              <button
                type="button" className={'md' + (!reveal ? ' on' : '')}
                onClick={() => setReveal(false)}
                title="Сначала ответьте сами"
              >
                Проверка
              </button>
            </div>
          )}

          <input
            ref={searchRef}
            className="search"
            placeholder="Поиск…  (/)"
            value={filters.query}
            onChange={(e) => changeFilters({ query: e.target.value })}
          />
          <button
            type="button"
            className="btn help-btn"
            aria-label="Горячие клавиши и возможности"
            title="Горячие клавиши (?)"
            onClick={() => setHelpOpen(true)}
          >
            ?
          </button>
          {mode === 'questions' && (
            <button type="button" className="btn" onClick={pickRandom}>🎲 Случайный</button>
          )}
          <button
            type="button" className="btn gho"
            onClick={() => {
              const message = pack.id === 'interview'
                ? 'Сбросить прогресс вопросов, карточек, теории и игрового пути собеседования?'
                : 'Сбросить отметки по вопросам, карточкам и плану?'
              if (confirm(message)) reset()
            }}
          >
            Сброс
          </button>

          <div className="bar">
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: (pack.questions.length ? (known / pack.questions.length) * 100 : 0) + '%' }}
              />
            </div>
            <div className="bar-num">{known} / {pack.questions.length}</div>
          </div>
        </div>
      </header>

      {helpOpen && (
        <div
          className="help-backdrop"
          role="presentation"
          onMouseDown={() => setHelpOpen(false)}
        >
          <div
            className="help-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="help-head">
              <h2 id="help-title">Быстрые действия</h2>
              <button type="button" className="btn" aria-label="Закрыть" onClick={() => setHelpOpen(false)}>×</button>
            </div>
            <div className="help-grid">
              <div><kbd>/</kbd><span>Фокус на поиск</span></div>
              <div><kbd>?</kbd><span>Открыть эту подсказку</span></div>
              <div><kbd>Esc</kbd><span>Закрыть окно</span></div>
              <div><kbd>←</kbd> <kbd>→</kbd><span>Листать карточки</span></div>
              <div><kbd>Space</kbd><span>Перевернуть карточку</span></div>
              <div><kbd>🎲</kbd><span>Взять случайный вопрос</span></div>
            </div>
            <p className="help-note">Выбранные темы, поиск и режим сохраняются в URL — ссылкой можно поделиться. Отметки, карточки и план сохраняются в браузере.</p>
          </div>
        </div>
      )}

      {/* В режиме плана сайдбар не нужен — и его нельзя просто спрятать:
          сетка осталась бы двухколоночной, а main уехал бы в колонку сайдбара. */}
      <div className={'wrap' + (showSidebar ? '' : ' wrap-full')} data-pack={pack.id}>
        {showSidebar && (
        <aside className="side" ref={sideRef}>
          <div className="side-box">
            <h4>Темы</h4>
            <button
              type="button" className={'tp' + (filters.topic === 'all' ? ' on' : '')}
              onClick={() => changeFilters({ topic: 'all' })}
            >
              <span>Все темы</span><b>{totalInMode}</b>
            </button>
            {topicGroups.map((cat) => (
              // Fragment, а не div: кнопки-темы должны быть прямыми flex-детьми
              // .side-box, иначе на узких экранах (flex-wrap) вся категория
              // сжимается в одну колонку вместо того, чтобы её кнопки сами оборачивались.
              <Fragment key={cat.name || 'all'}>
                {cat.name && cat.topics.length > 0 && <div className="cat">{cat.name}</div>}
                {cat.topics.map((t) => (
                  <button
                    key={t} type="button"
                    className={'tp' + (filters.topic === t ? ' on' : '')}
                    onClick={() => changeFilters({ topic: t })}
                  >
                    <span>{t}</span><b>{topicCounts.get(t) ?? 0}</b>
                  </button>
                ))}
              </Fragment>
            ))}
          </div>

          {mode === 'questions' && (
            <>
              <div className="side-box">
                <h4>Формат</h4>
                <button
                  type="button" className={'tp' + (filters.kind === 'all' ? ' on' : '')}
                  onClick={() => changeFilters({ kind: 'all' })}
                >
                  <span>Любой формат</span>
                </button>
                {[...new Set(pack.questions.map((q) => q.type))].map((k) => (
                  <button
                    key={k} type="button"
                    className={'tp' + (filters.kind === k ? ' on' : '')}
                      onClick={() => changeFilters({ kind: k })}
                  >
                    <span>{TYPE_LABEL[k]}</span>
                    <b>{pack.questions.filter((q) => q.type === k).length}</b>
                  </button>
                ))}
                {pack.hasLevelFilter && (
                  <div className="lvl">
                    {['all', 'junior', 'middle', 'senior'].map((l) => (
                      <button
                        key={l} type="button"
                        className={'tp' + (filters.level === l ? ' on' : '')}
                        onClick={() => changeFilters({ level: l })}
                      >
                        <span>{l === 'all' ? 'все' : l}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="side-box">
                <h4>Статус</h4>
                {([['all', 'Все'], ['new', 'Не отмечено'], ['repeat', 'Повторить'], ['know', 'Знаю']] as const).map(
                  ([v, label]) => (
                    <button
                      key={v} type="button"
                      className={'tp' + (filters.status === v ? ' on' : '')}
                      onClick={() => changeFilters({ status: v })}
                    >
                      <span>{label}</span>
                    </button>
                  ),
                )}
                <div className="stat">
                  знаю: <b>{known}</b><br />повторить: <b>{repeat}</b><br />
                  осталось: <b>{pack.questions.length - known - repeat}</b>
                </div>
              </div>
            </>
          )}
        </aside>
        )}

        <main id="list">
          {mode === 'dashboard' && pack.id === 'interview' && (
            <DashboardMode
              pack={pack}
              marks={marks}
              reviews={reviews}
              notes={notes}
              cardsKnown={cardsKnown}
              theoryDone={theoryDone}
              known={known}
              repeat={repeat}
              onNavigate={goToLink}
              onExport={exportProgress}
              onImport={importProgress}
            />
          )}

          {mode === 'session' && pack.id === 'interview' && (
            <SessionMode
              pack={pack}
              reviews={reviews}
              marks={marks}
              onAttempt={recordAttempt}
              onToggleMark={toggleMark}
              onNavigate={goToLink}
            />
          )}

          {mode === 'theory-game' && pack.id === 'interview' && (
            <TheoryGameMode
              pack={pack}
              onOpenClassic={() => changeFilters({ mode: 'theory', topic: 'all', query: '', open: '' })}
            />
          )}

          {mode === 'theory-game' && pack.id === 'audit' && (
            <ExamMode pack={pack} />
          )}

          {mode === 'plan' && pack.plan && (
            <PlanMode
              weeks={pack.plan} done={planDone} context={pack.id === 'interview' ? 'interview' : 'audit'}
              onToggle={togglePlan} onNavigate={goToLink}
            />
          )}

          {mode === 'tools' && (
            <ToolsMode items={tools} demos={pack.demos} openId={filters.open} context={pack.id === 'interview' ? 'interview' : 'audit'} />
          )}

          {mode === 'cards' && (
            <CardsMode
              items={cards}
              total={pack.cards?.length ?? 0}
              known={cardsKnown}
              onToggleKnown={toggleCard}
              context={pack.id === 'interview' ? 'interview' : 'audit'}
            />
          )}

          {(mode === 'questions' || mode === 'theory') && (
            <>
              {listed.length === 0 && <div className="empty">Ничего не найдено — сбросьте фильтры</div>}
              {grouped.map((group) => (
                <div key={group.topic}>
                  <div className="grp">{group.topic}</div>
                  {group.items.map((item, i) => {
                    const isRandomQuestion = pack.id === 'interview'
                      && randomPick?.filterKey === randomFilterKey
                      && randomPick.id === item.id
                    return (
                    mode === 'theory'
                      ? (
                        <TheoryCard
                          key={item.id}
                          item={item as TheoryArticle}
                          demos={pack.demos}
                          autoOpen={item.id === filters.open}
                          done={pack.id === 'interview' ? Boolean(theoryDone[item.id]) : false}
                          onToggleDone={pack.id === 'interview' ? () => toggleTheory(item.id) : undefined}
                        />
                      )
                      : (
                        <QuestionCard
                          key={item.id + (isRandomQuestion ? `-random-${randomPick?.nonce ?? 0}` : '')}
                          item={item as Question}
                          index={i}
                          mark={marks[item.id]}
                          onToggleMark={toggleMark}
                          reveal={pack.id === 'interview' ? false : reveal}
                          demos={pack.demos}
                          highlighted={isRandomQuestion}
                          autoOpen={isRandomQuestion}
                          note={pack.id === 'interview' ? notes[item.id] : undefined}
                          onNoteChange={pack.id === 'interview' ? (value) => setNote(item.id, value) : undefined}
                          notesEnabled={pack.id === 'interview'}
                          context={pack.id === 'interview' ? 'interview' : 'audit'}
                          hint={pack.id === 'interview' ? (item as Question).hint : undefined}
                          theoryLinks={pack.id === 'interview' ? theoryForQuestion(item as Question, pack.theory).map((article) => ({ id: article.id, title: article.title, topic: article.topic })) : undefined}
                          onOpenTheory={pack.id === 'interview' ? (id) => goToLink({ mode: 'theory', id }) : undefined}
                        />
                      )
                    )
                  })}
                </div>
              ))}
            </>
          )}
        </main>
      </div>
    </>
  )
}
