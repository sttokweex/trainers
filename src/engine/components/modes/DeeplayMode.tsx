import { useEffect, useState } from 'react'
import { interviewPrompts, requirements, systemCases, technicalInterviewQuestions } from '@/content/interview/deeplay/guide'
import { deeplayChapters } from '@/content/interview/deeplay/theory'

type Section = 'vacancy' | 'fit' | 'theory' | 'cases' | 'interview'
const sections: { id: Section; label: string }[] = [
  { id: 'vacancy', label: 'Вакансия' },
  { id: 'fit', label: 'Требования и опыт' },
  { id: 'theory', label: 'Подробная теория' },
  { id: 'cases', label: 'Системный дизайн' },
  { id: 'interview', label: 'Вопросы и ответы' },
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
    chapter.title, chapter.lead, chapter.simpleIntro ?? '', chapter.visual ?? '', chapter.priority, chapter.exercise,
    ...chapter.sections.flatMap((item) => [item.title, item.body, item.example, item.pitfall, item.application, item.code ?? '']),
    ...chapter.check.flatMap((item) => [item.question, item.answer]),
  ]))
  const filteredCases = systemCases.filter((item) => matches(needle, [item.title, item.task, item.outline, item.checklist]))
  const filteredPrompts = interviewPrompts.filter((item) => matches(needle, [item.title, item.question, item.answer, item.followUp]))
  const filteredTechnical = technicalInterviewQuestions.filter((item) => matches(needle, [item.title, item.question, item.answer, item.followUp]))

  return <div className="volga deeplay">
    <section className="volga-hero deeplay-hero">
      <div className="volga-eyebrow">Подготовка к вакансии · Fullstack разработчик Middle</div>
      <h1>deeplay</h1>
      <p>Самостоятельный курс по вакансии: сначала разбираем пользовательскую задачу простыми словами и рисуем путь данных, затем изучаем нужные технологии и тренируем ответы на вопросы. Термины объясняются внутри этого раздела — переходить в другую вкладку не нужно.</p>
      <div className="volga-hero-meta"><span>{deeplayChapters.length} подробных глав</span><span>{systemCases.length} системных кейса</span><span>{interviewPrompts.length + technicalInterviewQuestions.length} вопросов</span><span>{done.filter((id) => deeplayChapters.some((chapter) => chapter.id === id)).length} / {deeplayChapters.length} глав пройдено</span></div>
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
      <p className="volga-note"><b>Путь с нуля:</b> начни с первой главы. Она простыми словами разбирает запрос, handler, очередь, брокер и worker на одном примере и показывает их связь. Потом иди по главам сверху вниз: в каждой сначала прочитай объяснение и схему, затем разберись в терминах и выполни упражнение. Курс учит темам этой вакансии, но не заменяет базовый курс программирования.</p>
      <p className="volga-note"><b>Если база уже есть:</b> прочитай первую главу, чтобы сверить модель системы. Затем проверь себя вопросами в конце каждой главы; возвращайся к разделу, если не можешь объяснить решение простыми словами, разобрать пример и назвать поведение при сбое.</p>
      <p className="volga-note">Материал охватывает требования объявления, но одного чтения недостаточно. Интервьюер может выбрать неожиданный угол темы, поэтому цель — понимать причины и уметь рассуждать на новом примере. «Основа» означает основной стек и инженерные ожидания; «Плюс» — технологии, которые в объявлении названы дополнительными.</p>
      <div className="volga-list">{filteredChapters.map((chapter, index) => <details className={`volga-card deeplay-chapter${done.includes(chapter.id) ? ' is-complete' : ''}`} key={chapter.id}>
        <summary><span><span className="deeplay-chapter-number">{String(index + 1).padStart(2, '0')} · {chapter.priority}{done.includes(chapter.id) && <span className="deeplay-done-badge">Пройдено ✓</span>}</span>{chapter.title}<small>{chapter.lead}</small></span></summary>
        <div className="volga-card-body">
          {chapter.simpleIntro && <div className="deeplay-simple"><strong>Сначала простыми словами</strong><p>{chapter.simpleIntro}</p></div>}
          {chapter.visual && <figure className="deeplay-diagram"><figcaption>Карта темы</figcaption><pre>{chapter.visual}</pre></figure>}
          {chapter.sections.map((item) => <section className="deeplay-point" key={item.title}>
            <h3>{item.title}</h3>{item.body.split(/\n\s*\n/).map((paragraph, paragraphIndex) => <p key={`${item.title}-${paragraphIndex}`}>{paragraph}</p>)}
            {item.visual && <figure className="deeplay-diagram"><figcaption>Схема</figcaption><pre>{item.visual}</pre></figure>}
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
      <p className="volga-note">Системный дизайн — это объяснение, как части продукта вместе решают задачу и что происходит при нагрузке, повторе или сбое. Это не соревнование в количестве технологий. Для каждого кейса сначала уточни цель и ограничения, затем нарисуй путь данных, выбери хранение и контракты, разберись с отказами, безопасностью и наблюдаемостью.</p>
      <div className="deeplay-design-guide"><h3>Удобный порядок ответа на интервью</h3><ol><li><b>Пользователь и результат:</b> кто нажимает кнопку и что считает успешным исходом.</li><li><b>Нагрузка и свежесть:</b> сколько пользователей/событий и как быстро результат должен обновиться.</li><li><b>Путь запроса:</b> интерфейс → API handler (принимает запрос) → бизнес-логика → база/внешний сервис → ответ.</li><li><b>Данные и границы:</b> кто владеет записью, как проверяются tenant и права, где нужна транзакция.</li><li><b>Сбой и повтор:</b> timeout, дубли, частичный успех, очередь задач и восстановление.</li><li><b>Проверка и эксплуатация:</b> тесты, метрики, логи, трассировка и безопасный выпуск.</li></ol><p><b>Пример:</b> для отчёта партнёра сначала выясняем допустимую задержку цифр. Если допустимы минуты, события можно собирать асинхронно в аналитическое хранилище; если нужен немедленный ответ по одной операции — читаем транзакционную базу. Решение зависит от свежести и характера запросов.</p></div>
      <div className="volga-list">{filteredCases.map((item) => <details className="volga-card" key={item.title}><summary><span>{item.title}<small>{item.task}</small></span></summary><div className="volga-card-body"><p><b>Что раскрыть:</b> {item.checklist}</p>{item.visual && <figure className="deeplay-diagram"><figcaption>Схема решения</figcaption><pre>{item.visual}</pre></figure>}<div className="volga-answer"><strong>Ориентир разбора</strong><p>{item.outline}</p></div></div></details>)}</div>
      {!filteredCases.length && <p className="empty">По запросу ничего не найдено.</p>}
    </section>}

    {section === 'interview' && <section className="volga-content">
      <div className="volga-section-head"><div><div className="volga-eyebrow">Мок-собеседование</div><h2>Вопросы и ответы</h2></div><span>{filteredPrompts.length} / {interviewPrompts.length}</span></div>
      <p className="volga-note">Это вероятные вопросы по вакансии, а не вопросы, подтверждённые deeplay. Отвечай своими словами и не выдавай изученную технологию за рабочий опыт.</p>
      <div className="volga-list">{filteredPrompts.map((item) => <details className="volga-card" key={item.title}><summary><span>{item.question}<small>{item.title}</small></span></summary><div className="volga-card-body"><div className="volga-answer"><strong>Опорные мысли</strong><p>{item.answer}</p></div><p><b>Уточняющий вопрос:</b> {item.followUp}</p></div></details>)}</div>
      {!filteredPrompts.length && <p className="empty">По запросу ничего не найдено.</p>}
      <div className="volga-section-head deeplay-subhead"><div><div className="volga-eyebrow">Технические вопросы по требованиям вакансии</div><h3>Проверь, можешь ли объяснить своими словами</h3></div><span>{filteredTechnical.length} / {technicalInterviewQuestions.length}</span></div>
      <p className="volga-note">Сначала ответь сам, затем раскрой пример. Хороший ответ объясняет причину решения, его ограничение и что произойдёт при сбое.</p>
      <div className="volga-list">{filteredTechnical.map((item) => <details className="volga-card" key={item.title}><summary><span>{item.question}<small>{item.title}</small></span></summary><div className="volga-card-body"><div className="volga-answer"><strong>Пример понятного ответа</strong><p>{item.answer}</p></div><p><b>Уточняющий вопрос:</b> {item.followUp}</p></div></details>)}</div>
      {!filteredTechnical.length && <p className="empty">По запросу ничего не найдено.</p>}
    </section>}

  </div>
}
