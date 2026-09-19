import { demos } from '@/demos/interview'
import type { ContentPack } from '@/engine/types'
import { questions } from './questions'
import { theory } from './theory'

export const interviewPack: ContentPack = {
  id: 'interview',
  title: 'Собеседование',
  accent: '#58a6ff',
  storagePrefix: 'interview-trainer',
  modes: ['questions', 'theory'],
  defaultMode: 'questions',
  hasLevelFilter: true,
  categories: [
    { name: 'Фронтенд', topics: ['JavaScript', 'TypeScript', 'React', 'Состояние', 'CSS и вёрстка', 'UX и доступность', 'Браузер', 'Архитектура фронта'] },
    { name: 'Бэкенд', topics: ['Node / Nest', 'API и сеть', 'Базы данных', 'Кеш и очереди', 'Безопасность'] },
    { name: 'Информатика', topics: ['Алгоритмы', 'Лайвкодинг', 'ООП и принципы', 'Системный дизайн', 'Тестирование'] },
    { name: 'Процессы', topics: ['DevOps и процессы', 'Софт-скиллы', 'Подготовка'] },
  ],
  questions,
  theory,
  demos,
}
