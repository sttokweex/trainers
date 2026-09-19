import { evidenceRank } from './evidence-rank'
import { direction } from './direction'
import { capexVsOpex } from './capex-vs-opex'
import { subsequent } from './subsequent'
import { inventoryDir } from './inventory-dir'
import { stockCount } from './stock-count'
import { kamPick } from './kam-pick'
import { fraudTriangle } from './fraud-triangle'
import { assertions } from './assertions'
import { rsbuIfrs } from './rsbu-ifrs'
import { cutoff } from './cutoff'
import { tAccounts } from './t-accounts'
import { entryDrill } from './entry-drill'
import { auditCycle } from './audit-cycle'
import { closeCycle } from './close-cycle'
import { cfIndirect } from './cf-indirect'
import { ifrs15 } from './ifrs15'
import { p2pWalk } from './p2p-walk'
import { wpBuilder } from './wp-builder'
import { tickmarks } from './tickmarks'
import { materiality } from './materiality'
import { riskModel } from './risk-model'
import { sampling } from './sampling'
import { musPick } from './mus-pick'
import { vat } from './vat'
import { pbu18 } from './pbu18'
import { depr } from './depr'
import { lease } from './lease'
import { invCost } from './inv-cost'
import { nrv } from './nrv'
import { arAging } from './ar-aging'
import { goingConcern } from './going-concern'
import { threeForms } from './three-forms'
import { balanceBuild } from './balance-build'
import { balanceStruct } from './balance-struct'
import { plBuild } from './pl-build'
import { ratios } from './ratios'
import { flux } from './flux'
import { tbCheck } from './tb-check'
import { excelRecon } from './excel-recon'
import { misstatements } from './misstatements'
import { jeTesting } from './je-testing'
import { opinionTree } from './opinion-tree'
import type { LegacyDemo } from '@/engine/types'

export const demos: Record<string, LegacyDemo> = {
  'evidence-rank': evidenceRank,
  'direction': direction,
  'capex-vs-opex': capexVsOpex,
  'subsequent': subsequent,
  'inventory-dir': inventoryDir,
  'stock-count': stockCount,
  'kam-pick': kamPick,
  'fraud-triangle': fraudTriangle,
  'assertions': assertions,
  'rsbu-ifrs': rsbuIfrs,
  'cutoff': cutoff,
  't-accounts': tAccounts,
  'entry-drill': entryDrill,
  'audit-cycle': auditCycle,
  'close-cycle': closeCycle,
  'cf-indirect': cfIndirect,
  'ifrs15': ifrs15,
  'p2p-walk': p2pWalk,
  'wp-builder': wpBuilder,
  'tickmarks': tickmarks,
  'materiality': materiality,
  'risk-model': riskModel,
  'sampling': sampling,
  'mus-pick': musPick,
  'vat': vat,
  'pbu18': pbu18,
  'depr': depr,
  'lease': lease,
  'inv-cost': invCost,
  'nrv': nrv,
  'ar-aging': arAging,
  'going-concern': goingConcern,
  'three-forms': threeForms,
  'balance-build': balanceBuild,
  'balance-struct': balanceStruct,
  'pl-build': plBuild,
  'ratios': ratios,
  'flux': flux,
  'tb-check': tbCheck,
  'excel-recon': excelRecon,
  'misstatements': misstatements,
  'je-testing': jeTesting,
  'opinion-tree': opinionTree,
}
