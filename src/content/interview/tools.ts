import type { Tool } from '@/engine/types'

/** Практические сценарии: каждый открывает живое демо из interview-реестра. */
export const tools: Tool[] = [
  { id: 'tool-performance', topic: 'Производительность и Web Vitals', t: 'Бюджет страницы и bundle', d: 'Поиграйте с размером чанков и увидьте, как растёт initial payload. Сформулируйте лимит, который поставите в CI.', demo: 'bundle-size' },
  { id: 'tool-network', topic: 'API и сеть', t: 'HTTP-кэш и revalidation', d: 'Сравните cache hit, ETag и устаревший ответ. Тренируйте объяснение trade-off для CDN и браузера.', demo: 'http-cache' },
  { id: 'tool-graphql', topic: 'GraphQL и realtime', t: 'Кэширование запросов', d: 'Разберите cache key, stale time и инвалидацию после мутации — то, что часто спрашивают на frontend/backend границе.', demo: 'query-cache' },
  { id: 'tool-capacity', topic: 'Системный дизайн', t: 'Capacity planner', d: 'Оцените RPS, количество экземпляров, хранение и запас. Проговорите допущения и точки отказа.', demo: 'design-budget' },
  { id: 'tool-incident', topic: 'Надёжность и эксплуатация', t: 'Incident drill', d: 'За 90 секунд сформулируйте первые действия, коммуникацию и критерий rollback после неудачного релиза.', demo: 'answer-timer' },
  { id: 'tool-cache-stampede', topic: 'Надёжность и эксплуатация', t: 'Cache stampede', d: 'Поймите, почему одновременное истечение ключа перегружает базу и где поставить lock, jitter или stale-while-revalidate.', demo: 'cache-stampede' },
  { id: 'tool-react-render', topic: 'React', t: 'Render pipeline', d: 'Разберите render/commit/paint и найдите, на каком этапе появляется лишняя работа.', demo: 'render-pipeline' },
  { id: 'tool-git-release', topic: 'Git и CI/CD', t: 'Граф релиза', d: 'Потренируйте rebase, merge, hotfix и откат, объясняя, как история помогает в инциденте.', demo: 'git-graph' },
  { id: 'tool-rate-limit', topic: 'API и сеть', t: 'Backoff и ограничение нагрузки', d: 'Сравните повторные запросы и ограничение параллелизма, затем назовите защиту от thundering herd.', demo: 'cache-stampede' },
  { id: 'tool-mock', topic: 'Подготовка', t: 'Симуляция ответа', d: 'Случайный вопрос, таймер и рубрика самооценки: структура, глубина, цифры.', demo: 'mock-interview' },
  { id: 'tool-event-delivery', topic: 'Кеш и очереди', t: 'Сбой и повторная доставка', d: 'Проверьте, что случится при падении consumer между побочным эффектом и сохранением offset. Включите дедупликацию и сравните результат.', demo: 'event-delivery' },
  { id: 'tool-auth-flow', topic: 'Безопасность', t: 'Защита OAuth callback', d: 'Выберите угрозу и выключайте state, PKCE или nonce, чтобы увидеть, какой шаг остановит атаку.', demo: 'auth-flow' },
  { id: 'tool-pwa-offline', topic: 'Браузер', t: 'План офлайн-режима', d: 'Подберите стратегию для файла, статьи и критичных данных, затем проверьте очередь действий без сети.', demo: 'pwa-offline' },
  { id: 'tool-adaptive-interview', topic: 'Системный дизайн', t: 'Интервьюер меняет вводные', d: 'Предложите архитектуру, получите уточнение именно по своему решению и разберите инцидент, который меняет ограничения.', demo: 'adaptive-interview' },
  { id: 'tool-js-foundation-lab', topic: 'База: типы и операторы', t: 'Разминка по базе JavaScript', d: 'Двенадцать коротких заданий на переменные, типы, функции, условия и массивы. Получайте разбор сразу после каждого ответа.', demo: 'js-foundation-lab' },
]
