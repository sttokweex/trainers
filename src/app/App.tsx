import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PACKS, getPack } from '@/content'
import { QuestionCard } from '@/engine/components/QuestionCard'
import { TheoryCard } from '@/engine/components/TheoryCard'
import { useFilters } from '@/engine/hooks/useFilters'
import { useProgress } from '@/engine/hooks/useProgress'
import type { PackMode, Question, TheoryArticle } from '@/engine/types'
import '@/engine/styles/legacy.css'

const MODE_LABEL: Record<PackMode, string> = {
  questions: 'Вопросы', theory: 'Теория', tools: 'Практикум', cards: 'Карточки', plan: 'План',
}
const TYPE_LABEL: Record<Question['type'], string> = {
  theory: 'теория', code: 'код', output: 'вывод', manual: 'написать', choice: 'выбор', num: 'расчёт',
}

const matches = (haystack: string, q: string) => !q || haystack.toLowerCase().includes(q.toLowerCase())

export function App() {
  const { packId } = useParams()
  const navigate = useNavigate()
  const pack = getPack(packId ?? 'interview')
  const { filters, set } = useFilters(pack)
  const { marks, toggleMark, reset, reveal, setReveal, known, repeat } = useProgress(pack)

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

  const theory = useMemo(() => pack.theory.filter((t) => {
    if (filters.topic !== 'all' && t.topic !== filters.topic) return false
    return matches([t.title, t.lead, t.body, t.topic].join(' '), filters.query)
  }), [pack.theory, filters])

  const isTheory = filters.mode === 'theory'
  const source: (Question | TheoryArticle)[] = isTheory ? theory : questions

  /** Темы и счётчики берутся из того реестра, который сейчас показан. */
  const topicCounts = useMemo(() => {
    const src = isTheory ? pack.theory : pack.questions
    const map = new Map<string, number>()
    for (const x of src) map.set(x.topic, (map.get(x.topic) ?? 0) + 1)
    return map
  }, [pack, isTheory])

  const grouped = useMemo(() => {
    const out: { topic: string; items: (Question | TheoryArticle)[] }[] = []
    for (const item of source) {
      const last = out[out.length - 1]
      if (last && last.topic === item.topic) last.items.push(item)
      else out.push({ topic: item.topic, items: [item] })
    }
    return out
  }, [source])

  const pickRandom = () => {
    const pool = questions.filter((q) => marks[q.id] !== 'know')
    const src = pool.length ? pool : questions
    const item = src[Math.floor(Math.random() * src.length)]
    if (!item) return
    document.getElementById('q-' + item.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const categories = pack.categories
  const topicsInOrder = categories
    ? categories.map((c) => ({ name: c.name, topics: c.topics.filter((t) => topicCounts.has(t)) }))
    : [{ name: '', topics: [...topicCounts.keys()] }]

  return (
    <>
      <header className="top">
        <div className="top-in">
          <div className="brand">Тренажёр <span>{pack.title.toLowerCase()}</span></div>

          <div className="modes">
            {PACKS.map((p) => (
              <button
                key={p.id} type="button"
                className={'md' + (p.id === pack.id ? ' on' : '')}
                onClick={() => navigate('/' + p.id)}
              >
                {p.title}
              </button>
            ))}
          </div>

          <div className="modes">
            {pack.modes.map((m) => (
              <button
                key={m} type="button"
                className={'md' + (m === filters.mode ? ' on' : '')}
                onClick={() => set({ mode: m, topic: 'all' })}
              >
                {MODE_LABEL[m]}
              </button>
            ))}
          </div>

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

          <input
            className="search"
            placeholder="Поиск по вопросам и статьям…"
            value={filters.query}
            onChange={(e) => set({ query: e.target.value })}
          />
          {!isTheory && <button type="button" className="btn" onClick={pickRandom}>🎲 Случайный</button>}
          <button
            type="button" className="btn gho"
            onClick={() => { if (confirm('Сбросить все отметки?')) reset() }}
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

      <div className="wrap">
        <aside className="side">
          <div className="side-box">
            <h4>Темы</h4>
            <button
              type="button" className={'tp' + (filters.topic === 'all' ? ' on' : '')}
              onClick={() => set({ topic: 'all' })}
            >
              <span>Все темы</span><b>{source.length}</b>
            </button>
            {topicsInOrder.map((cat) => (
              <div key={cat.name || 'all'}>
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
              </div>
            ))}
          </div>

          {filters.mode === 'questions' && (
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
                {[['all', 'Все'], ['new', 'Не отмечено'], ['repeat', 'Повторить'], ['know', 'Знаю']].map(([v, label]) => (
                  <button
                    key={v} type="button"
                    className={'tp' + (filters.status === v ? ' on' : '')}
                    onClick={() => set({ status: v as string })}
                  >
                    <span>{label}</span>
                  </button>
                ))}
                <div className="stat">
                  знаю: <b>{known}</b><br />повторить: <b>{repeat}</b><br />
                  осталось: <b>{pack.questions.length - known - repeat}</b>
                </div>
              </div>
            </>
          )}
        </aside>

        <main id="list">
          {source.length === 0 && <div className="empty">Ничего не найдено — сбросьте фильтры</div>}
          {grouped.map((group) => (
            <div key={group.topic}>
              <div className="grp">{group.topic}</div>
              {group.items.map((item, i) =>
                isTheory
                  ? <TheoryCard key={item.id} item={item as TheoryArticle} demos={pack.demos} />
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
          {!['questions', 'theory'].includes(filters.mode) && (
            <div className="empty">
              Режим «{MODE_LABEL[filters.mode]}» ещё переносится — пока доступен в старом файле.
            </div>
          )}
        </main>
      </div>
    </>
  )
}
