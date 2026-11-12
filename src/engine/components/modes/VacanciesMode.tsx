import { useState } from 'react'
import { DeeplayMode } from './DeeplayMode'
import { VolgaMode } from './VolgaMode'

const vacancies = [
  { id: 'volga', title: 'Волга-Волга', role: 'Frontend-разработчик', description: 'React, TypeScript, Mini Apps, клиентская архитектура и опыт проектов.', tags: ['Frontend', 'React', 'TypeScript', 'Mini Apps'] },
  { id: 'deeplay', title: 'deeplay', role: 'Fullstack-разработчик · Middle', description: 'TypeScript, Node.js, React, API, надёжность и системный дизайн.', tags: ['Fullstack', 'Node.js', 'React', 'ClickHouse', 'gRPC', 'System design'] },
]

export function VacanciesMode({ query }: { query: string }) {
  const [selected, setSelected] = useState<string | null>(null)
  if (selected === 'deeplay') return <div><button className="vacancies-back" onClick={() => setSelected(null)}>← Все вакансии</button><DeeplayMode query={query} /></div>
  if (selected === 'volga') return <div><button className="vacancies-back" onClick={() => setSelected(null)}>← Все вакансии</button><VolgaMode query={query} /></div>
  const needle = query.trim().toLocaleLowerCase('ru')
  const filtered = vacancies.filter((item) => [item.title, item.role, item.description, ...item.tags].join(' ').toLocaleLowerCase('ru').includes(needle))
  return <main className="vacancies-index">
    <header className="vacancies-heading"><div className="volga-eyebrow">Подготовка к собеседованиям</div><h1>Вакансии</h1><p>Выбери позицию. Внутри каждой — отдельная теория, примеры и вопросы по конкретной вакансии. Используй общий поиск сверху, чтобы отфильтровать список.</p></header>
    <div className="vacancies-grid">{filtered.map((item) => <article className="vacancy-tile" key={item.id}><div className="volga-eyebrow">{item.role}</div><h2>{item.title}</h2><p>{item.description}</p><div className="vacancy-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><button onClick={() => setSelected(item.id)}>Открыть подготовку <span aria-hidden="true">→</span></button></article>)}</div>
    {!filtered.length && <p className="empty">По запросу вакансий не найдено.</p>}
  </main>
}
