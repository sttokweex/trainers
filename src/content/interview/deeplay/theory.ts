import { coreChapters, type StudyChapter } from './theory-core'
import { extraChapters } from './theory-extra'
import { platformChapters } from './theory-platform'

export type { StudyChapter } from './theory-core'
export const deeplayChapters: StudyChapter[] = [
  ...coreChapters.slice(0, 2), ...platformChapters.slice(0, 1),
  ...coreChapters.slice(2, 7), ...platformChapters.slice(1),
  ...coreChapters.slice(7), ...extraChapters,
]
