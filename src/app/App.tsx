import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DEFAULT_PACK, PACK_META, loadPack } from '@/content'
import { QuestionCard } from '@/engine/components/QuestionCard'
import { TheoryCard } from '@/engine/components/TheoryCard'
import { CardsMode } from '@/engine/components/modes/CardsMode'
import { PlanMode } from '@/engine/components/modes/PlanMode'
import { ToolsMode } from '@/engine/components/modes/ToolsMode'
import { useFilters } from '@/engine/hooks/useFilters'
import { useProgress } from '@/engine/hooks/useProgress'
import type { ContentPack, PackMode, PlanLink, Question, TheoryArticle } from '@/engine/types'
import '@/engine/styles/index.css'

const MODE_LABEL: Record<PackMode, string> = {
  questions: 'Вопросы', theory: 'Теория', tools: 'Практикум', cards: 'Карточки', plan: 'План',
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
    marks, toggleMark, cardsKnown, toggleCard, planDone, togglePlan,
    reset, reveal, setReveal, known, repeat,
  } = useProgress(pack)

  const searchRef = useRef<HTMLInputElement>(null)
  const topRef = useRef<HTMLElement>(null)

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
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const mode = pack.modes.includes(filters.mode) ? filters.mode : pack.defaultMode

  /** План — единственный режим без фильтров: там нечего фильтровать. */
  const showSidebar = mode !== 'plan'

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
  const grouped = useMemo(() => {
    const out: { topic: string; items: (Question | TheoryArticle)[] }[] = []
    for (const item of listed) {
      const last = out[out.length - 1]
      if (last && last.topic === item.topic) last.items.push(item)
      else out.push({ topic: item.topic, items: [item] })
    }
    return out
  }, [listed])

  /** Переход по ссылке из плана: меняем режим, тему и цель раскрытия разом. */
  const goToLink = (link: PlanLink) => {
    set({
      mode: link.mode,
      topic: link.topic ?? 'all',
      open: link.id ?? '',
      query: '',
      kind: 'all',
      level: 'all',
      status: 'all',
    })
    window.scrollTo({ top: 0 })
  }

  const pickRandom = () => {
    const pool = questions.filter((q) => marks[q.id] !== 'know')
    const src = pool.length ? pool : questions
    const item = src[Math.floor(Math.random() * src.length)]
    if (item) document.getElementById('q-' + item.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const categories = pack.categories
  const topicGroups = categories
    ? categories.map((c) => ({ name: c.name, topics: c.topics.filter((t) => topicCounts.has(t)) }))
    : [{ name: '', topics: [...topicCounts.keys()] }]

  const totalInMode =
    mode === 'theory' ? theory.length
      : mode === 'tools' ? tools.length
      : mode === 'cards' ? cards.length
      : questions.length

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
                onClick={() => set({ mode: m, topic: 'all' })}
              >
                {MODE_LABEL[m]}
              </button>
            ))}
          </div>

          {mode === 'questions' && (
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
            onChange={(e) => set({ query: e.target.value })}
          />
          {mode === 'questions' && (
            <button type="button" className="btn" onClick={pickRandom}>🎲 Случайный</button>
          )}
          <button
            type="button" className="btn gho"
            onClick={() => { if (confirm('Сбросить отметки по вопросам, карточкам и плану?')) reset() }}
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

      {/* В режиме плана сайдбар не нужен — и его нельзя просто спрятать:
          сетка осталась бы двухколоночной, а main уехал бы в колонку сайдбара. */}
      <div className={'wrap' + (showSidebar ? '' : ' wrap-full')}>
        {showSidebar && (
        <aside className="side">
          <div className="side-box">
            <h4>Темы</h4>
            <button
              type="button" className={'tp' + (filters.topic === 'all' ? ' on' : '')}
              onClick={() => set({ topic: 'all' })}
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
                    onClick={() => set({ topic: t })}
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
                  onClick={() => set({ kind: 'all' })}
                >
                  <span>Любой формат</span>
                </button>
                {[...new Set(pack.questions.map((q) => q.type))].map((k) => (
                  <button
                    key={k} type="button"
                    className={'tp' + (filters.kind === k ? ' on' : '')}
                    onClick={() => set({ kind: k })}
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
                        onClick={() => set({ level: l })}
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
                      onClick={() => set({ status: v })}
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
          {mode === 'plan' && pack.plan && (
            <PlanMode
              weeks={pack.plan} done={planDone}
              onToggle={togglePlan} onNavigate={goToLink}
            />
          )}

          {mode === 'tools' && (
            <ToolsMode items={tools} demos={pack.demos} openId={filters.open} />
          )}

          {mode === 'cards' && (
            <CardsMode
              items={cards}
              total={pack.cards?.length ?? 0}
              known={cardsKnown}
              onToggleKnown={toggleCard}
            />
          )}

          {(mode === 'questions' || mode === 'theory') && (
            <>
              {listed.length === 0 && <div className="empty">Ничего не найдено — сбросьте фильтры</div>}
              {grouped.map((group) => (
                <div key={group.topic}>
                  <div className="grp">{group.topic}</div>
                  {group.items.map((item, i) =>
                    mode === 'theory'
                      ? (
                        <TheoryCard
                          key={item.id}
                          item={item as TheoryArticle}
                          demos={pack.demos}
                          autoOpen={item.id === filters.open}
                        />
                      )
                      : (
                        <QuestionCard
                          key={item.id}
                          item={item as Question}
                          index={i}
                          mark={marks[item.id]}
                          onToggleMark={toggleMark}
                          reveal={reveal}
                          demos={pack.demos}
                        />
                      ),
                  )}
                </div>
              ))}
            </>
          )}
        </main>
      </div>
    </>
  )
}
