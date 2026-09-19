import type { ContentPack } from '@/engine/types'
import { auditPack } from './audit'
import { interviewPack } from './interview'

export const PACKS: ContentPack[] = [interviewPack, auditPack]

export const getPack = (id: string): ContentPack =>
  PACKS.find((p) => p.id === id) ?? (PACKS[0] as ContentPack)
