import { demos } from '@/demos/audit'
import type { ContentPack } from '@/engine/types'
import { cards } from './cards'
import { examPrepArticles, examPrepQuestions } from './exam-prep'
import { examPrepCards } from './exam-cards'
import { questions } from './questions'
import { theory } from './theory'
import { tools } from './tools'

export const auditPack: ContentPack = {
  id: 'audit',
  title: 'Аудит',
  accent: '#3fb950',
  storagePrefix: 'audit-trainer',
  modes: ['theory', 'theory-game', 'questions', 'tools', 'cards'],
  defaultMode: 'theory',
  hasLevelFilter: true,
  categories: [
    { name:'Учёт', topics:['Бухучёт', 'Статьи баланса', 'ФСБУ', 'Налоги'] },
    { name:'Отчётность', topics:['Отчётность', 'Анализ', 'МСФО'] },
    { name:'Аудит', topics:['Методология', 'Участки', 'Завершение'] },
    { name:'Практика', topics:['Инструменты'] },
  ],
  questions,
  theory,
  tools,
  cards,
  examPrep: {
    categories: [
      { name:'I этап', topics: examPrepArticles.slice(0, 5).map((article) => article.topic) },
      { name:'II этап', topics: examPrepArticles.slice(5).map((article) => article.topic) },
    ],
    theory: examPrepArticles,
    questions: examPrepQuestions,
    cards: examPrepCards,
  },
  demos,
}
