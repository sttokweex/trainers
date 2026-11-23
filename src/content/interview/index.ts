import { demos } from '@/demos/interview'
import type { ContentPack } from '@/engine/types'
import { questions } from './questions'
import { theory } from './theory'
import { cards } from './cards'
import { plan } from './plan'

export const interviewPack: ContentPack = {
  id: 'interview',
  title: 'Собеседование',
  accent: '#58a6ff',
  storagePrefix: 'interview-trainer',
  modes: ['dashboard', 'questions', 'theory', 'cards', 'session', 'vacancies'],
  defaultMode: 'questions',
  hasLevelFilter: true,
  categories: [
    { name: 'Карта обучения', topics: ['Инфраструктура: карта обучения'] },
    { name: 'Фронтенд', topics: ['База: переменные и значения', 'База: типы и операторы', 'База: условия и циклы', 'База: функции', 'База: массивы и объекты', 'JavaScript', 'TypeScript', 'CSS и вёрстка', 'Tailwind и Sass', 'Браузер', 'UX и доступность', 'SEO', 'React, Vue и Angular', 'React', 'Состояние', 'Vue', 'Angular', 'Nuxt', 'Next.js', 'Архитектура фронта'] },
    { name: 'Бэкенд', topics: ['Node / Nest', 'Express и Fastify', 'API и сеть', 'Безопасность', 'Базы данных', 'Архитектура backend', 'Кеш и очереди', 'GraphQL и realtime', 'Надёжность и эксплуатация', 'Docker и Kubernetes', 'Контейнеры и облако'] },
    { name: 'Сети и администрирование', topics: ['Сети и системное администрирование', 'Сетевые протоколы', 'Linux и VPS'] },
    { name: 'Информатика и качество', topics: ['Алгоритмы', 'Лайвкодинг', 'ООП и принципы', 'Тестирование', 'Системный дизайн'] },
    { name: 'Инфраструктура UI', topics: ['Three.js', 'Electron и desktop'] },
    { name: 'Процессы и подготовка', topics: ['DevOps и процессы', 'Git и CI/CD', 'Производительность и Web Vitals', 'Продукт и delivery', 'Софт-скиллы', 'Подготовка'] },
  ],
  questions,
  theory,
  cards,
  plan,
  demos,
}
