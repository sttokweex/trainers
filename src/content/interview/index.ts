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
  modes: ['dashboard', 'questions', 'theory', 'tools', 'cards', 'session'],
  defaultMode: 'questions',
  hasLevelFilter: true,
  categories: [
    { name: 'Фронтенд', topics: ['База: переменные и значения', 'База: типы и операторы', 'База: условия и циклы', 'База: функции', 'База: массивы и объекты', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Nuxt', 'Состояние', 'CSS и вёрстка', 'Tailwind и Sass', 'UX и доступность', 'Браузер', 'Архитектура фронта'] },
    { name: 'Бэкенд', topics: ['Node / Nest', 'Express и Fastify', 'API и сеть', 'Базы данных', 'Кеш и очереди', 'Безопасность', 'GraphQL и realtime', 'Надёжность и эксплуатация', 'Контейнеры и облако'] },
    { name: 'Сети и администрирование', topics: ['Сети и системное администрирование'] },
    { name: 'Информатика', topics: ['Алгоритмы', 'Лайвкодинг', 'ООП и принципы', 'Системный дизайн', 'Тестирование'] },
    { name: 'Инфраструктура UI', topics: ['Three.js', 'Electron и desktop'] },
    { name: 'Карта и протоколы', topics: ['Сетевые протоколы', 'Инфраструктура: карта обучения'] },
    { name: 'Процессы', topics: ['DevOps и процессы', 'Git и CI/CD', 'Производительность и Web Vitals', 'Продукт и delivery', 'Софт-скиллы', 'Подготовка'] },
  ],
  questions,
  theory,
  tools,
  cards,
  plan,
  demos,
}
