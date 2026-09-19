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
  modes: ['theory', 'questions', 'tools', 'cards', 'plan'],
  defaultMode: 'theory',
  hasLevelFilter: true,
  questions,
  theory,
  tools,
  cards,
  plan,
  demos,
}
