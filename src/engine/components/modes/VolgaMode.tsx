import { useState } from 'react'
import { hr, stack, tricky, type PrepItem } from '@/content/interview/volga/preparation'
import { theoryChapters } from '@/content/interview/volga/theory'
import { vacancySections } from '@/content/interview/volga/vacancy'

type Section = 'vacancy' | 'stack' | 'theory' | 'hr' | 'tricky' | 'resume'
const sections: { id: Section; label: string }[] = [
  { id: 'vacancy', label: 'Вакансия' },
  { id: 'stack', label: 'Стек вакансии' },
  { id: 'theory', label: 'Теория' },
  { id: 'hr', label: 'HR-ответы' },
  { id: 'tricky', label: 'Каверзные вопросы' },
  { id: 'resume', label: 'Резюме и проекты' },
]
const statusText = { practice: 'Есть опыт', adjacent: 'Смежный опыт', learn: 'Подготовить' }

function AnswerCards({ items }: { items: PrepItem[] }) {
  return <div className="volga-list">{items.map((item) => <details className="volga-card" key={item.title}>
    <summary><span>{item.title}</span><small className={`volga-status ${item.status}`}>{statusText[item.status]}</small></summary>
    <div className="volga-card-body">
      <p><b>Что проверяют:</b> {item.requirement}</p>
      <div className="volga-answer"><strong>Ответ для интервью</strong><p>{item.answer}</p></div>
      <p><b>Пример:</b> {item.example}</p>
      {item.evidence && <p className="volga-evidence">В исходниках: {item.evidence}</p>}
    </div>
  </details>)}</div>
}

export function VolgaMode({ query }: { query: string }) {
  const [section, setSection] = useState<Section>('stack')
  const source = section === 'hr' ? hr : section === 'tricky' ? tricky : stack
  const needle = query.trim().toLocaleLowerCase('ru')
  const items = source.filter((item) => !needle || [item.title, item.requirement, item.answer, item.example].join(' ').toLocaleLowerCase('ru').includes(needle))
  const chapters = theoryChapters.filter((chapter) => !needle || [chapter.title, chapter.lead, ...chapter.points.flatMap((point) => [point.title, point.body]), ...chapter.check.flatMap((item) => [item.question, item.answer])].join(' ').toLocaleLowerCase('ru').includes(needle))
  const matchingVacancySections = vacancySections.map((group) => ({
    ...group,
    requirements: group.requirements.filter((requirement) => !needle || `${group.title} ${requirement}`.toLocaleLowerCase('ru').includes(needle)),
  })).filter((group) => group.requirements.length > 0)
  const vacancyRequirementCount = vacancySections.reduce((sum, group) => sum + group.requirements.length, 0)

  return <div className="volga">
    <section className="volga-hero">
      <div className="volga-eyebrow">Подготовка к собеседованию · Frontend-разработчик</div>
      <h1>Волга-Волга</h1>
      <p>Требования вакансии, теория, подтверждённые примеры из Jumpster и Themost и ответы, которые можно проговорить на HR и техническом интервью.</p>
      <div className="volga-hero-meta"><span>{stack.length} тем стека</span><span>{theoryChapters.length} глав теории</span><span>{hr.length} HR-вопросов</span><span>{tricky.length} каверзных вопросов</span></div>
    </section>

    <nav className="volga-nav" aria-label="Разделы подготовки">
      {sections.map(({ id, label }) => <button key={id} type="button" className={section === id ? 'on' : ''} aria-current={section === id ? 'page' : undefined} onClick={() => setSection(id)}>{label}</button>)}
    </nav>

    {section === 'vacancy' ? <section className="volga-content volga-vacancy">
      <div className="volga-section-head"><div><div className="volga-eyebrow">Описание позиции</div><h2>Frontend-разработчик</h2></div><span>{matchingVacancySections.reduce((sum, group) => sum + group.requirements.length, 0)} / {vacancyRequirementCount} требований</span></div>
      <p className="volga-note">Текст вакансии для ориентира во время подготовки и мок-собеседования.</p>
      {matchingVacancySections.length ? <div className="volga-vacancy-grid">{matchingVacancySections.map((group) => <article className="volga-vacancy-card" key={group.title}>
        <h3>{group.title}</h3>
        <ul>{group.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
      </article>)}</div> : <p className="empty">В вакансии нет совпадений по запросу.</p>}
    </section> : section === 'theory' ? <section className="volga-content">
      <div className="volga-section-head"><div><div className="volga-eyebrow">Разбор тем вакансии</div><h2>Теория</h2></div><span>{chapters.length} / {theoryChapters.length}</span></div>
      <p className="volga-note">Прочитайте главу и ответьте на вопросы в конце своими словами. Затем раскройте ответы для сверки.</p>
      <div className="volga-list">{chapters.map((chapter) => <details className="volga-card volga-theory" key={chapter.id}>
        <summary><span>{chapter.title}<small>{chapter.lead}</small></span></summary>
        <div className="volga-card-body">
          {chapter.points.map((point) => <div className="volga-theory-point" key={point.title}><h3>{point.title}</h3><p>{point.body}</p></div>)}
          <div className="volga-check"><strong>Проверь себя</strong><ol>{chapter.check.map((item) => <li key={item.question}><details><summary>{item.question}</summary><p>{item.answer}</p></details></li>)}</ol></div>
        </div>
      </details>)}</div>
      {!chapters.length && <p className="empty">По запросу ничего не найдено.</p>}
    </section> : section === 'resume' ? <section className="volga-resume">
      <h2>Опыт и источники</h2>
      <p>Краткая карта проектов для интервью. Используйте её вместе со своим резюме, чтобы выбирать примеры под вопрос собеседующего.</p>
      <div className="volga-projects">
        <article><h3>Jumpster · service-core</h3><p>Telegram Mini App для тренировок: React 18, TypeScript, Vite, Redux Toolkit, tRPC, камера, TensorFlow.js / MediaPipe, Telegram WebApp API, платежи и адаптация под WebView.</p><p>Источники: <code>service-core/client/package.json</code>, <code>src/hooks/useTelegramViewport.ts</code>, <code>src/hooks/useTelegramBackButton.ts</code>, <code>src/trpc/client.ts</code>.</p></article>
        <article><h3>Themost · themost-core</h3><p>Карточный Telegram Mini App: React 19, TypeScript, Vite, Tailwind 4, React Query, zod, Telegram Apps SDK, tRPC, роутинг и lazy loading, Vitest / React Testing Library.</p><p>Источники: <code>themost-core/tma-template/client/package.json</code>, <code>src/features/funding/api/funding-hooks.ts</code>, <code>src/navigation/routes.tsx</code>, <code>src/components/Page.tsx</code>.</p></article>
        <article><h3>Task Tracker · из резюме</h3><p>React, TypeScript, Vite, MobX, SCSS, RBAC, lazy loading, аналитические графики и диаграмма Ганта. Этот проект описан в резюме; локальные исходники здесь не проверялись.</p></article>
      </div>
      <p className="volga-note">Формулировки ответов — заготовки для репетиции. Сверьте цифры и личный вклад с тем, что сможете подробно объяснить на встрече.</p>
    </section> : <section className="volga-content">
      <div className="volga-section-head"><div><div className="volga-eyebrow">{section === 'stack' ? 'Техническое интервью' : section === 'hr' ? 'Разговор с рекрутером' : 'Уточняющие вопросы'}</div><h2>{sections.find((entry) => entry.id === section)?.label}</h2></div><span>{items.length} / {source.length}</span></div>
      {section === 'stack' && <p className="volga-note">Метки показывают, что подтверждено в проектах, где опыт смежный и что стоит отдельно повторить. Открывайте карточки и проговаривайте ответы вслух.</p>}
      {items.length ? <AnswerCards items={items} /> : <p className="empty">По запросу ничего не найдено.</p>}
    </section>}
  </div>
}
