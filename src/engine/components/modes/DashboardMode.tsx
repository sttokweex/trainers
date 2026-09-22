import { useRef, useState } from 'react'
import type { ContentPack, Mark, PlanLink, ReviewState } from '@/engine/types'

export function DashboardMode({
  pack, marks, reviews, notes, cardsKnown, planDone, known, repeat,
  onNavigate, onExport, onImport,
}: {
  pack: ContentPack
  marks: Record<string, Mark>
  reviews: Record<string, ReviewState>
  notes: Record<string, string>
  cardsKnown: Record<string, boolean>
  planDone: Record<string, boolean>
  known: number
  repeat: number
  onNavigate: (link: PlanLink) => void
  onExport: () => string
  onImport: (raw: string) => boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [now] = useState(() => Date.now())
  const due = pack.questions.filter((q) => (reviews[q.id]?.next ?? Number.POSITIVE_INFINITY) <= now || marks[q.id] === 'repeat')
  const fresh = pack.questions.filter((q) => !marks[q.id]).length
  const topicStats = [...new Set(pack.questions.map((q) => q.topic))].map((topic) => {
    const list = pack.questions.filter((q) => q.topic === topic)
    const done = list.filter((q) => marks[q.id] === 'know').length
    const weak = list.filter((q) => {
      const review = reviews[q.id]
      return marks[q.id] === 'repeat' || Boolean(review && review.correct < review.attempts / 2)
    }).length
    return { topic, total: list.length, done, weak }
  }).sort((a, b) => b.weak - a.weak || a.done - b.done)
  const planTotal = pack.plan?.reduce((sum, week) => sum + week.items.length, 0) ?? 0
  const planDoneCount = pack.plan?.reduce((sum, week) => sum + week.items.filter((_, i) => planDone[`${week.n}-${i}`]).length, 0) ?? 0
  const noteCount = Object.values(notes).filter(Boolean).length

  const download = () => {
    const blob = new Blob([onExport()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'interview-trainer-progress.json'; a.click()
    URL.revokeObjectURL(url)
  }
  const importFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (!onImport(String(reader.result ?? ''))) window.alert('Не удалось прочитать файл прогресса')
    }
    reader.readAsText(file)
  }

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <div>
          <div className="eyebrow">Личный тренер</div>
          <h2>Прогресс подготовки</h2>
          <p>Здесь собраны следующие действия: что повторить сегодня, какие темы проседают и где продолжить маршрут.</p>
        </div>
        <div className="dashboard-actions">
          <button type="button" className="btn pri" onClick={() => onNavigate({ mode: 'session' })}>▶ Начать пробник</button>
          <button type="button" className="btn" onClick={() => onNavigate({ mode: 'questions', status: 'repeat' })}>↻ Повторить слабое</button>
        </div>
      </div>

      <div className="dash-kpis">
        <div className="dash-kpi"><b>{known}</b><span>знаю</span></div>
        <div className="dash-kpi warn"><b>{repeat}</b><span>повторить</span></div>
        <div className="dash-kpi"><b>{fresh}</b><span>новых</span></div>
        <div className="dash-kpi"><b>{due.length}</b><span>на сегодня</span></div>
      </div>

      <div className="dash-grid">
        <section className="dash-panel dash-today">
          <div className="dash-panel-head"><h3>Сегодня</h3><span>{due.length ? 'есть работа' : 'всё закрыто'}</span></div>
          <p>{due.length ? `В очереди ${due.length} вопросов. Пробник возьмёт до 10 и подстроится под ваши ошибки.` : fresh ? `Очередь повторения пуста. Есть ${fresh} новых вопросов для первого прохода.` : 'Вы прошли очередь на сегодня. Можно открыть новый вопрос или пройти теорию.'}</p>
          <div className="dash-actions">
            <button type="button" className="btn pri" onClick={() => onNavigate({ mode: 'session' })}>{due.length ? '15 минут практики' : 'Новый пробник'}</button>
            <button type="button" className="btn" onClick={() => onNavigate({ mode: 'questions' })}>Открыть весь банк</button>
          </div>
        </section>
        <section className="dash-panel">
          <div className="dash-panel-head"><h3>Маршрут</h3><span>{planDoneCount}/{planTotal}</span></div>
          <div className="dash-progress"><i style={{ width: `${planTotal ? (planDoneCount / planTotal) * 100 : 0}%` }} /></div>
          <p>В плане подготовки отмечены выполненные пункты. Продолжайте с первой незакрытой недели.</p>
          <button type="button" className="btn" onClick={() => onNavigate({ mode: 'plan' })}>Открыть план →</button>
        </section>
      </div>

      <section className="dash-panel">
        <div className="dash-panel-head"><h3>Темы, которым нужен фокус</h3><span>клик открывает вопросы</span></div>
        <div className="topic-bars">
          {topicStats.slice(0, 8).map((item) => (
            <button type="button" className="topic-bar" key={item.topic} onClick={() => onNavigate({ mode: 'questions', topic: item.topic })}>
              <span>{item.topic}</span>
              <i><b style={{ width: `${item.total ? (item.done / item.total) * 100 : 0}%` }} /></i>
              <em>{item.done}/{item.total}{item.weak ? ` · ${item.weak} слаб.` : ''}</em>
            </button>
          ))}
        </div>
      </section>

      <div className="dash-grid">
        <section className="dash-panel">
          <div className="dash-panel-head"><h3>Материалы</h3><span>{noteCount} заметок</span></div>
          <p>Карточки и план сохраняются отдельно от ответов. Личные заметки прикреплены к вопросам и не пропадут после обновления страницы.</p>
          <div className="dash-actions">
            <button type="button" className="btn" onClick={() => onNavigate({ mode: 'cards' })}>Карточки · {Object.keys(cardsKnown).length}</button>
            <button type="button" className="btn" onClick={() => onNavigate({ mode: 'theory' })}>Теория · {pack.theory.length}</button>
          </div>
        </section>
        <section className="dash-panel">
          <div className="dash-panel-head"><h3>Перенос прогресса</h3><span>локально</span></div>
          <p>Скачайте JSON, чтобы перенести отметки, заметки и очередь повторения на другой браузер.</p>
          <div className="dash-actions">
            <button type="button" className="btn" onClick={download}>↓ Экспорт</button>
            <button type="button" className="btn" onClick={() => inputRef.current?.click()}>↑ Импорт</button>
            <input ref={inputRef} type="file" accept="application/json" hidden onChange={(e) => { importFile(e.target.files?.[0]); e.currentTarget.value = '' }} />
          </div>
        </section>
      </div>
    </div>
  )
}
