import { demos } from '@/demos/interview'
import type { ContentPack } from '@/engine/types'
import { questions } from './questions'
import { theory } from './theory'
import { tools } from './tools'
import { cards } from './cards'
import { plan } from './plan'

export const interviewPack: ContentPack = {
  id: 'interview',
  title: 'Собеседование',
  accent: '#58a6ff',
  storagePrefix: 'interview-trainer',
  modes: ['dashboard', 'questions', 'theory', 'tools', 'cards', 'plan', 'session'],
  defaultMode: 'questions',
  hasLevelFilter: true,
  categories: [
    { name: 'Фронтенд', topics: ['JavaScript', 'TypeScript', 'React', 'Состояние', 'CSS и вёрстка', 'UX и доступность', 'Браузер', 'Архитектура фронта'] },
    { name: 'Бэкенд', topics: ['Node / Nest', 'API и сеть', 'Базы данных', 'Кеш и очереди', 'Безопасность', 'GraphQL и realtime', 'Надёжность и эксплуатация', 'Контейнеры и облако'] },
    { name: 'Информатика', topics: ['Алгоритмы', 'Лайвкодинг', 'ООП и принципы', 'Системный дизайн', 'Тестирование'] },
    { name: 'Процессы', topics: ['DevOps и процессы', 'Git и CI/CD', 'Производительность и Web Vitals', 'Продукт и delivery', 'Софт-скиллы', 'Подготовка'] },
  ],
  questions,
  theory,
  tools,
  cards,
  plan,
  demos,
}
