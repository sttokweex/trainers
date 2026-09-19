import { accDouble } from './acc-double'
import { accPlan } from './acc-plan'
import { accClose } from './acc-close'
import { repBs } from './rep-bs'
import { repPl } from './rep-pl'
import { repCf } from './rep-cf'
import { repLink } from './rep-link'
import { fsbu66 } from './fsbu-66'
import { fsbu5 } from './fsbu-5'
import { fsbu25 } from './fsbu-25'
import { fsbuOther } from './fsbu-other'
import { taxVat } from './tax-vat'
import { taxPbu18 } from './tax-pbu18'
import { metCycle } from './met-cycle'
import { metMat } from './met-mat'
import { metRisk } from './met-risk'
import { metEvid } from './met-evid'
import { metSampling } from './met-sampling'
import { metIc } from './met-ic'
import { metFraud } from './met-fraud'
import { metDoc } from './met-doc'
import { cycCash } from './cyc-cash'
import { cycRev } from './cyc-rev'
import { cycInv } from './cyc-inv'
import { cycPpe } from './cyc-ppe'
import { cycAp } from './cyc-ap'
import { cycRp } from './cyc-rp'
import { finComplete } from './fin-complete'
import { finOpinion } from './fin-opinion'
import { anaRatios } from './ana-ratios'
import { ifrsDiff } from './ifrs-diff'
import { toolExcel } from './tool-excel'
import type { TheoryArticle } from '@/engine/types'

export const theory: TheoryArticle[] = [
  accDouble,
  accPlan,
  accClose,
  repBs,
  repPl,
  repCf,
  repLink,
  fsbu66,
  fsbu5,
  fsbu25,
  fsbuOther,
  taxVat,
  taxPbu18,
  metCycle,
  metMat,
  metRisk,
  metEvid,
  metSampling,
  metIc,
  metFraud,
  metDoc,
  cycCash,
  cycRev,
  cycInv,
  cycPpe,
  cycAp,
  cycRp,
  finComplete,
  finOpinion,
  anaRatios,
  ifrsDiff,
  toolExcel,
]
