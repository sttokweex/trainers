import { useEffect, useState } from 'react'
import { hr, stack, tricky, type PrepItem } from '@/content/interview/volga/preparation'
import { realQuestions } from '@/content/interview/volga/real-questions'
import { theoryChapters } from '@/content/interview/volga/theory'
import { vacancySections } from '@/content/interview/volga/vacancy'

type Section = 'vacancy' | 'fit' | 'theory' | 'system' | 'interview' | 'real' | 'resume'
const sections: { id: Section; label: string }[] = [
  { id: 'vacancy', label: 'Вакансия' },
  { id: 'fit', label: 'Требования и опыт' },
  { id: 'theory', label: 'Подробная теория' },
  { id: 'system', label: 'Системный дизайн' },
  { id: 'interview', label: 'Вопросы и ответы' },
  { id: 'real', label: 'Реальные вопросы' },
  { id: 'resume', label: 'Резюме и проекты' },
]
function AnswerCards({ items }: { items: PrepItem[] }) {
  return <div className="volga-list">{items.map((item) => <details className="volga-card" key={item.title}>
    <summary><span>{item.title}</span></summary>
    <div className="volga-card-body">
      <p><b>Что проверяют:</b> {item.requirement}</p>
      <div className="volga-answer"><strong>Ответ для интервью</strong><p>{item.answer}</p></div>
      <p><b>Пример:</b> {item.example}</p>
      {item.evidence && <p className="volga-evidence">В исходниках: {item.evidence}</p>}
    </div>
  </details>)}</div>
}

export function VolgaMode({ query }: { query: string }) {
  const [section, setSection] = useState<Section>('theory')
  const [done, setDone] = useState<string[]>(() => { try { const value: unknown = JSON.parse(localStorage.getItem('volga-study-complete-v1') ?? '[]'); return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [] } catch { return [] } })
  useEffect(() => { try { localStorage.setItem('volga-study-complete-v1', JSON.stringify(done)) } catch { /* private storage */ } }, [done])
  const toggleDone = (id: string) => setDone((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const source = section === 'interview' ? [...hr, ...tricky] : stack
  const needle = query.trim().toLocaleLowerCase('ru')
  const items = source.filter((item) => !needle || [item.title, item.requirement, item.answer, item.example].join(' ').toLocaleLowerCase('ru').includes(needle))
  const chapters = theoryChapters.filter((chapter) => !needle || [chapter.title, chapter.lead, ...chapter.points.flatMap((point) => [point.title, point.body, point.code, point.explanation]), ...chapter.check.flatMap((item) => [item.question, item.answer])].join(' ').toLocaleLowerCase('ru').includes(needle))
  const matchingRealQuestions = realQuestions.filter((item) => !needle || [item.topic, item.question, item.feedback, item.answer, item.practice].join(' ').toLocaleLowerCase('ru').includes(needle))
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
      <div className="volga-hero-meta"><span>{theoryChapters.length} подробных глав</span><span>{stack.length + hr.length + tricky.length} вопросов</span><span>{realQuestions.length} тем из фидбека</span><span>{done.filter((id) => theoryChapters.some((chapter) => chapter.id === id)).length} / {theoryChapters.length} глав пройдено</span></div>
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
      <div className="volga-section-head"><div><div className="volga-eyebrow">Самостоятельная теория по вакансии</div><h2>Подробная теория</h2></div><span>{chapters.length} / {theoryChapters.length} · пройдено {done.filter((id) => theoryChapters.some((chapter) => chapter.id === id)).length}</span></div>
      <p className="volga-note"><b>С нуля:</b> иди по порядку. В главах объясняются термины, их назначение и применение во frontend. <b>С базой:</b> сначала ответь на вопросы в конце, затем открой материал там, где не получается объяснить пример или ограничение. Теория дублируется внутри вакансии для самостоятельной подготовки.</p>
      <div className="volga-list">{chapters.map((chapter, index) => <details className={`volga-card volga-theory${done.includes(chapter.id) ? ' is-complete' : ''}`} key={chapter.id}>
        <summary><span><span className="volga-chapter-number">{String(index + 1).padStart(2, '0')}{done.includes(chapter.id) && <span className="volga-done-badge">Пройдено ✓</span>}</span>{chapter.title}{chapter.updated && <span className="theory-update-badge">Обновлено</span>}<small>{chapter.lead}</small></span></summary>
        <div className="volga-card-body">
          {chapter.points.map((point) => <div className="volga-theory-point" key={point.title}><h3>{point.title}</h3><p>{point.body}</p>{point.code && <pre className="volga-code"><code>{point.code}</code></pre>}{point.explanation && <p className="volga-code-explanation"><b>Как читать этот код:</b> {point.explanation}</p>}</div>)}
          <div className="volga-check"><strong>Проверь себя</strong><ol>{chapter.check.map((item) => <li key={item.question}><details><summary>{item.question}</summary><p>{item.answer}</p></details></li>)}</ol></div>
          <button className="deeplay-complete" type="button" aria-pressed={done.includes(chapter.id)} onClick={() => toggleDone(chapter.id)}>{done.includes(chapter.id) ? 'Пройдено ✓ · отметить снова непройденным' : 'Отметить пройденным'}</button>
        </div>
      </details>)}</div>
      {!chapters.length && <p className="empty">По запросу ничего не найдено.</p>}
    </section> : section === 'system' ? <section className="volga-content">
      <div className="volga-section-head"><div><div className="volga-eyebrow">Архитектура клиентского приложения</div><h2>Системный дизайн</h2></div></div>
      <p className="volga-note">Для frontend-собеседования системный дизайн — проектирование приложения и его границ: как пользовательский сценарий разделяется на экраны, данные, API и платформенные адаптеры; как UI переживает загрузку, ошибки, медленную сеть и возврат в приложение.</p>
      <div className="deeplay-design-guide"><h3>Порядок разбора задачи</h3><ol><li>Назови пользователя и сценарий, например пополнение баланса в Mini App.</li><li>Уточни WebView, качество сети, авторизацию хоста, объём данных и требование к свежести.</li><li>Нарисуй слои: экран → feature hook → API client → backend; события платформы идут через адаптер.</li><li>Опиши состояния UI: загрузка, пусто, ошибка, успех, повтор и потеря сети.</li><li>Раздели локальное состояние интерфейса и серверное состояние операции.</li><li>Закрой безопасность, доступность, тесты и измерение производительности.</li></ol><p><b>Пример:</b> платежная форма создаёт операцию на сервере и показывает статус по operationId. После возврата из платёжного окна экран перечитывает состояние, а не объявляет успех только по callback WebView.</p></div>
      <div className="volga-list">
        <details className="volga-card"><summary><span>Mini App: вход и экран профиля<small>Платформенный сценарий, граница доверия и восстановление после перезапуска</small></span></summary><div className="volga-card-body"><figure className="deeplay-diagram"><figcaption>Путь данных</figcaption><pre>{'Telegram WebView → initData → сервер проверяет подпись и срок\n                                      ↓\n                              сессия приложения\n                                      ↓\nЭкран профиля ← API ← проверка пользователя и его прав'}</pre></figure><p><b>Решение:</b> клиент передаёт данные запуска серверу. Сервер проверяет подпись и срок, устанавливает пользователя и выдаёт сессию. UI использует SDK через адаптер, а бизнес-компоненты не обращаются к глобальному объекту Telegram напрямую.</p><p><b>Сбой:</b> неверная подпись закрывает доступ; временный отказ API показывает повторяемую ошибку; после перезапуска сценарий восстанавливается по серверной сессии.</p><p><b>Проверки:</b> неподписанные данные, состояния загрузки/ошибки, адаптер SDK и smoke-тест в WebView.</p></div></details>
        <details className="volga-card"><summary><span>Лента с фильтрами при медленной сети<small>Кеш, пагинация и защита от устаревшего ответа</small></span></summary><div className="volga-card-body"><figure className="deeplay-diagram"><figcaption>Путь запроса</figcaption><pre>{'Экран → ключ запроса (фильтры + страница) → API\n  ↑                                      ↓\nкеш / загрузка / ошибка ← ответ сервера'}</pre></figure><p>Фильтры входят в ключ запроса, поэтому данные одного набора не показываются под другим. Список загружается страницами. При смене фильтра старый запрос отменяется или его ответ игнорируется. Пустой список отличается от ошибки.</p><p><b>Пример:</b> пользователь выбирает «все», затем «завершённые». Поздний ответ первого запроса не должен перезаписать второй. Уточни допустимость устаревшего кеша и требование к свежести.</p></div></details>
        <details className="volga-card"><summary><span>Общий интерфейс для Telegram и Web<small>Переиспользование продукта и платформенные адаптеры</small></span></summary><div className="volga-card-body"><p>Правила платежа и форматирование относятся к продуктовой логике. Авторизация, Back, safe area, тактильный отклик и внешние ссылки относятся к платформенным адаптерам. Компонент получает адаптер через явную зависимость, а веб-реализация позволяет разрабатывать без Telegram.</p><p><b>Ограничение:</b> абстракция полезна, если скрывает реальное различие платформ. Не следует обещать одинаковое поведение SDK с разными гарантиями.</p></div></details>
      </div>
    </section> : section === 'real' ? <section className="volga-content">
      <div className="volga-section-head"><div><div className="volga-eyebrow">После собеседования</div><h2>Реальные вопросы</h2></div><span>{matchingRealQuestions.length} / {realQuestions.length}</span></div>
      <p className="volga-note">Темы взяты из фидбека команды. Точные формулировки вопросов не сохранились, поэтому ниже — восстановленные вопросы для повторной подготовки.</p>
      <div className="volga-list">{matchingRealQuestions.map((item) => <details className="volga-card volga-real-question" key={item.topic}>
        <summary><span>{item.question}<small>{item.topic} · {item.kind === 'strength' ? 'Сильная сторона' : 'Подтянуть'}</small></span></summary>
        <div className="volga-card-body">
          <p><b>Что сказали в фидбеке:</b> {item.feedback}</p>
          <div className="volga-answer"><strong>Ориентир для ответа</strong><p>{item.answer}</p></div>
          <p><b>Для практики:</b> {item.practice}</p>
        </div>
      </details>)}</div>
      {!matchingRealQuestions.length && <p className="empty">По запросу ничего не найдено.</p>}
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
      <div className="volga-section-head"><div><div className="volga-eyebrow">{section === 'fit' ? 'Сопоставление требований и опыта' : 'Подготовка ответов и репетиция'}</div><h2>{sections.find((entry) => entry.id === section)?.label}</h2></div><span>{items.length} / {source.length}</span></div>
      {section === 'fit' ? <><p className="volga-note">Сверь требования роли с проверяемыми примерами из опыта и подготовь рассказ о личном вкладе.</p>{items.length ? <AnswerCards items={items} /> : <p className="empty">По запросу ничего не найдено.</p>}</> : <><p className="volga-note">Сначала ответь самостоятельно, затем сравни с ориентиром. Это вопросы для репетиции по вакансии и резюме; не выдавай учебный опыт за коммерческий.</p>{items.length ? <AnswerCards items={items} /> : <p className="empty">По запросу ничего не найдено.</p>}</>}
    </section>}
  </div>
}
