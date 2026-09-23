import { demos } from '@/demos/audit'
import type { ContentPack } from '@/engine/types'
import { cards } from './cards'
import { plan } from './plan'
import { questions } from './questions'
import { theory } from './theory'
import { tools } from './tools'

export const auditPack: ContentPack = {
  id: 'audit',
  title: 'Аудит',
  accent: '#3fb950',
  storagePrefix: 'audit-trainer',
  modes: ['theory', 'theory-game', 'questions', 'tools', 'cards', 'plan'],
  defaultMode: 'theory',
  hasLevelFilter: true,
  categories: [
    { name:'Учёт', topics:['Бухучёт', 'Статьи баланса', 'ФСБУ', 'Налоги'] },
    { name:'Отчётность', topics:['Отчётность', 'Анализ', 'МСФО'] },
    { name:'Аудит', topics:['Методология', 'Участки', 'Завершение'] },
    { name:'Практика', topics:['Инструменты'] },
    { name:'Экзамен аудитора', topics:[
      'Экзамен · Этика и независимость',
      'Экзамен · Налоговое администрирование',
      'Экзамен · Правовое регулирование',
      'Экзамен · Риски и внутренний контроль',
      'Экзамен · Управленческий учёт',
      'Экзамен · Финансовый анализ',
      'Экзамен · ПОД/ФТ и антикоррупция',
      'Экзамен · Финансовый рынок и ВЭД',
    ] },
  ],
  questions,
  theory,
  tools,
  cards,
  plan,
  demos,
}
