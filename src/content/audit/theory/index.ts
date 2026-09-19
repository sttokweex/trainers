import { accDouble } from './acc-double'
import { accEntries } from './acc-entries'
import { accTypical } from './acc-typical'
import { accPlan } from './acc-plan'
import { accClose } from './acc-close'
import { accCosts } from './acc-costs'
import { accPolicy } from './acc-policy'
import { accFx } from './acc-fx'
import { bsHowto } from './bs-howto'
import { bsVa1 } from './bs-va1'
import { bsVa2 } from './bs-va2'
import { bsStock } from './bs-stock'
import { bsAr } from './bs-ar'
import { bsCash } from './bs-cash'
import { bsCap } from './bs-cap'
import { bsDebt } from './bs-debt'
import { bsAp } from './bs-ap'
import { bsProv } from './bs-prov'
import { repBs } from './rep-bs'
import { repPl } from './rep-pl'
import { repPlLines } from './rep-pl-lines'
import { repCf } from './rep-cf'
import { repLink } from './rep-link'
import { fsbuMap } from './fsbu-map'
import { fsbu66 } from './fsbu-66'
import { fsbu5 } from './fsbu-5'
import { fsbu25 } from './fsbu-25'
import { fsbuOther } from './fsbu-other'
import { taxVat } from './tax-vat'
import { taxPbu18 } from './tax-pbu18'
import { taxOther } from './tax-other'
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
import { cycPayroll } from './cyc-payroll'
import { cycRp } from './cyc-rp'
import { finComplete } from './fin-complete'
import { finOpinion } from './fin-opinion'
import { anaRatios } from './ana-ratios'
import { ifrsDiff } from './ifrs-diff'
import { toolExcel } from './tool-excel'
import { toolDocs } from './tool-docs'
import type { TheoryArticle } from '@/engine/types'

/**
 * Порядок важен: статьи одной темы идут подряд, потому что список
 * разбивается на группы по смене темы.
 */
export const theory: TheoryArticle[] = [
  /* Бухучёт: от двойной записи к проводкам, затратам и учётной политике */
  accDouble,
  accEntries,
  accTypical,
  accPlan,
  accClose,
  accCosts,
  accPolicy,
  accFx,

  /* Статьи баланса: разбор каждой строки */
  bsHowto,
  bsVa1,
  bsVa2,
  bsStock,
  bsAr,
  bsCash,
  bsCap,
  bsDebt,
  bsAp,
  bsProv,

  /* Отчётность */
  repBs,
  repPl,
  repPlLines,
  repCf,
  repLink,

  /* ФСБУ */
  fsbuMap,
  fsbu66,
  fsbu5,
  fsbu25,
  fsbuOther,

  /* Налоги */
  taxVat,
  taxPbu18,
  taxOther,

  /* Методология аудита */
  metCycle,
  metMat,
  metRisk,
  metEvid,
  metSampling,
  metIc,
  metFraud,
  metDoc,

  /* Участки */
  cycCash,
  cycRev,
  cycInv,
  cycPpe,
  cycAp,
  cycPayroll,
  cycRp,

  /* Завершение, анализ, МСФО, инструменты */
  finComplete,
  finOpinion,
  anaRatios,
  ifrsDiff,
  toolExcel,
  toolDocs,
]
