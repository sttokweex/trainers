import { buhuchetQuestions } from './buhuchet'
import { statyBalansaQuestions } from './staty-balansa'
import { otchetnostyQuestions } from './otchetnosty'
import { fsbuQuestions } from './fsbu'
import { nalogiQuestions } from './nalogi'
import { metodologiyuQuestions } from './metodologiyu'
import { uchastkiQuestions } from './uchastki'
import { zavershenieQuestions } from './zavershenie'
import { analizQuestions } from './analiz'
import { msfoQuestions } from './msfo'
import { instrumentQuestions } from './instrument'
import { examPrepQuestions } from '../exam-prep'
import type { Question } from '@/engine/types'

export const questions: Question[] = [
  ...buhuchetQuestions,
  ...statyBalansaQuestions,
  ...otchetnostyQuestions,
  ...fsbuQuestions,
  ...nalogiQuestions,
  ...metodologiyuQuestions,
  ...uchastkiQuestions,
  ...zavershenieQuestions,
  ...analizQuestions,
  ...msfoQuestions,
  ...instrumentQuestions,
  ...examPrepQuestions,
]
