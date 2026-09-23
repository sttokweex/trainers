import type { ContentPack } from '@/engine/types'
import { interviewPack } from './interview'

/**
 * Все паки разом. Используется тестами: приложение грузит контент лениво
 * через loadPack, поэтому этот модуль в бандл не попадает.
 */
export const PACKS: ContentPack[] = [interviewPack]
