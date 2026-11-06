import { useEffect, useState } from 'react'
import { interviewPrompts, requirements, studyPlan, systemCases } from '@/content/interview/deeplay/guide'
import { deeplayChapters } from '@/content/interview/deeplay/theory'

type Section = 'vacancy' | 'fit' | 'theory' | 'cases' | 'interview' | 'plan'
const sections: { id: Section; label: string }[] = [
  { id: 'vacancy', label: 'Вакансия' },
  { id: 'fit', label: 'Требования и опыт' },
  { id: 'theory', label: 'Подробная теория' },
  { id: 'cases', label: 'Системный дизайн' },
  { id: 'interview', label: 'Вопросы и ответы' },
  { id: 'plan', label: 'План подготовки' },
]
const progressKey = 'deeplay-study-complete-v1'
const matches = (query: string, values: string[]) => !query || values.join(' ').toLocaleLowerCase('ru').includes(query)

export function DeeplayMode({ query }: { query: string }) {
  const [section, setSection] = useState<Section>('theory')
  const [done, setDone] = useState<string[]>(() => {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(progressKey) ?? '[]')
      return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
    } catch { return [] }
  })
  useEffect(() => {
    try { localStorage.setItem(progressKey, JSON.stringify(done)) } catch { /* private storage can be unavailable */ }
  }, [done])
  const toggleDone = (id: string) => setDone((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const needle = query.trim().toLocaleLowerCase('ru')
  const filteredRequirements = requirements.filter((item) => matches(needle, [item.title, item.expectation, item.evidence, item.focus]))
  const filteredChapters = deeplayChapters.filter((chapter) => matches(needle, [
    chapter.title, chapter.lead, chapter.priority, chapter.exercise,
    ...chapter.sections.flatMap((item) => [item.title, item.body, item.example, item.pitfall, item.application, item.code ?? '']),
    ...chapter.check.flatMap((item) => [item.question, item.answer]),
  ]))
  const filteredCases = systemCases.filter((item) => matches(needle, [item.title, item.task, item.outline, item.checklist]))
  const filteredPrompts = interviewPrompts.filter((item) => matches(needle, [item.title, item.question, item.answer, item.followUp]))

  return <div className="volga deeplay">
    <section className="volga-hero deeplay-hero">
      <div className="volga-eyebrow">Подготовка к вакансии · Fullstack разработчик Middle</div>
      <h1>deeplay</h1>
      <p>Полный цикл фичи: TypeScript и Node.js, React, контракты сервисов, конкурентные данные, аналитика, тесты и эксплуатация. Теория идёт от базовых моделей к распределённым сценариям.</p>
      <div className="volga-hero-meta"><span>{deeplayChapters.length} подробных глав</span><span>{systemCases.length} системных кейса</span><span>{interviewPrompts.length} вопросов</span><span>{done.length} / {deeplayChapters.length} глав пройдено</span></div>
    </section>

    <nav className="volga-nav" aria-label="Разделы подготовки deeplay">
      {sections.map((item) => <button key={item.id} type="button" className={section === item.id ? 'on' : ''} aria-current={section === item.id ? 'page' : undefined} onClick={() => setSection(item.id)}>{item.label}</button>)}
    </nav>

    {section === 'vacancy' && <section className="volga-content">
      <div className="volga-section-head"><div><div className="volga-eyebrow">Присланный текст вакансии</div><h2>Роль и условия</h2></div></div>
      <div className="deeplay-grid">
        <article className="deeplay-panel"><h3>Задачи</h3><ul>
          <li>Вести крупные fullstack-фичи: требования, проектирование, реализация, продакшен и анализ результата.</li>
          <li>Писать backend на TypeScript/Node.js, в том числе сервисы с gRPC; развивать React-кабинет партнёра и админку.</li>
          <li>Проектировать API и интеграции с учётом повторов и конкурентной записи.</li>
          <li>Работать с партнёрской аналитикой и ClickHouse, тестами, документацией и Kubernetes.</li>
          <li>Использовать AI-инструменты и развивать инженерные практики.</li>
        </ul></article>
        <article className="deeplay-panel"><h3>Формат и ожидания</h3><ul>
          <li>Middle fullstack. Уверенный TypeScript и более двух лет backend-разработки на Node.js, опыт React и самостоятельных фич.</li>
          <li>Работа удалённо или из офиса в Омске, Новосибирске или Санкт-Петербурге.</li>
          <li>Важны самостоятельность, продуктовый подход, общение со смежными командами и быстрое освоение чужого кода.</li>
          <li>gRPC, ClickHouse, Kubernetes/Helm, OAuth/OIDC, B2B, LLM/MCP и отдельные библиотеки перечислены как плюсы.</li>
        </ul></article>
      </div>
      <p className="volga-note">Это конспект присланного объявления. Конкретные этапы интервью, зарплата и внутренний стек команды в нём не указаны — их стоит уточнить у рекрутера.</p>
    </section>}

    {section === 'fit' && <section className="volga-content">
      <div className="volga-section-head"><div><div className="volga-eyebrow">Сопоставление с резюме</div><h2>Требования и опыт</h2></div><span>{filteredRequirements.length} / {requirements.length}</span></div>
      <p className="volga-note">Примеры из резюме — отправная точка. Перед интервью уточни свой личный вклад и измерение результатов. Пробелы в технологиях лучше называть прямо.</p>
      <div className="deeplay-grid">{filteredRequirements.map((item) => <article className="deeplay-panel" key={item.title}>
        <div className="deeplay-tag">{item.priority}</div><h3>{item.title}</h3>
        <p><b>Что ожидают:</b> {item.expectation}</p><p><b>Что есть в опыте:</b> {item.evidence}</p><p><b>Что подготовить:</b> {item.focus}</p>
      </article>)}</div>
      {!filteredRequirements.length && <p className="empty">По запросу ничего не найдено.</p>}
    </section>}

    {section === 'theory' && <section className="volga-content">
      <div className="volga-section-head"><div><div className="volga-eyebrow">Учебный маршрут</div><h2>Подробная теория</h2></div><span>{filteredChapters.length} / {deeplayChapters.length}</span></div>
      <p className="volga-note">Читайте главы по порядку. Каждая часть объясняет механизм, пример, частую ошибку и применение к вакансии. После главы ответьте на вопросы без подсказки и выполните задание.</p>
      <div className="volga-list">{filteredChapters.map((chapter, index) => <details className="volga-card deeplay-chapter" key={chapter.id}>
        <summary><span><span className="deeplay-chapter-number">{String(index + 1).padStart(2, '0')} · {chapter.priority}</span>{chapter.title}<small>{chapter.lead}</small></span></summary>
        <div className="volga-card-body">
          {chapter.sections.map((item) => <section className="deeplay-point" key={item.title}>
            <h3>{item.title}</h3><p>{item.body}</p>
            {item.code && <pre className="volga-code"><code>{item.code}</code></pre>}
            <p><b>Пример:</b> {item.example}</p>
            <p><b>Частая ошибка:</b> {item.pitfall}</p>
            <p><b>На собеседовании:</b> {item.application}</p>
          </section>)}
          <div className="volga-check"><strong>Проверь себя</strong><ol>{chapter.check.map((item) => <li key={item.question}><details><summary>{item.question}</summary><p>{item.answer}</p></details></li>)}</ol></div>
          <div className="deeplay-exercise"><strong>Практика</strong><p>{chapter.exercise}</p></div>
          <button className="deeplay-complete" type="button" aria-pressed={done.includes(chapter.id)} onClick={() => toggleDone(chapter.id)}>{done.includes(chapter.id) ? 'Пройдено ✓' : 'Отметить пройденным'}</button>
        </div>
      </details>)}</div>
      {!filteredChapters.length && <p className="empty">По запросу ничего не найдено.</p>}
    </section>}

    {section === 'cases' && <section className="volga-content">
      <div className="volga-section-head"><div><div className="volga-eyebrow">Практика системного дизайна</div><h2>Кейсы</h2></div><span>{filteredCases.length} / {systemCases.length}</span></div>
      <p className="volga-note">Сначала проговори собственное решение: требования → границы → данные → отказ и повтор → тесты → эксплуатация. Затем раскрой ориентир.</p>
      <div className="volga-list">{filteredCases.map((item) => <details className="volga-card" key={item.title}><summary><span>{item.title}<small>{item.task}</small></span></summary><div className="volga-card-body"><p><b>Что раскрыть:</b> {item.checklist}</p><div className="volga-answer"><strong>Ориентир разбора</strong><p>{item.outline}</p></div></div></details>)}</div>
      {!filteredCases.length && <p className="empty">По запросу ничего не найдено.</p>}
    </section>}

    {section === 'interview' && <section className="volga-content">
      <div className="volga-section-head"><div><div className="volga-eyebrow">Мок-собеседование</div><h2>Вопросы и ответы</h2></div><span>{filteredPrompts.length} / {interviewPrompts.length}</span></div>
      <p className="volga-note">Это вероятные вопросы по вакансии, а не вопросы, подтверждённые deeplay. Отвечай своими словами и не выдавай изученную технологию за рабочий опыт.</p>
      <div className="volga-list">{filteredPrompts.map((item) => <details className="volga-card" key={item.title}><summary><span>{item.question}<small>{item.title}</small></span></summary><div className="volga-card-body"><div className="volga-answer"><strong>Опорные мысли</strong><p>{item.answer}</p></div><p><b>Уточняющий вопрос:</b> {item.followUp}</p></div></details>)}</div>
      {!filteredPrompts.length && <p className="empty">По запросу ничего не найдено.</p>}
    </section>}

    {section === 'plan' && <section className="volga-content">
      <div className="volga-section-head"><div><div className="volga-eyebrow">Последовательность подготовки</div><h2>План на семь блоков</h2></div></div>
      <p className="volga-note">Блоки можно проходить в любом темпе. При ограниченном времени сначала пройди главы с пометкой «Основа» и подготовь одну реальную fullstack-историю.</p>
      <div className="deeplay-plan">{studyPlan.map((item) => <article className="deeplay-panel" key={item.day}><div className="deeplay-tag">{item.day}</div><h3>{item.focus}</h3><p>{item.result}</p></article>)}</div>
    </section>}
  </div>
}
