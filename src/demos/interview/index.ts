import { eventLoop } from './event-loop'
import { promiseCombinators } from './promise-combinators'
import { refsVsCopy } from './refs-vs-copy'
import { reactKeys } from './react-keys'
import { debounceThrottle } from './debounce-throttle'
import { bigo } from './bigo'
import { binarySearch } from './binary-search'
import { slidingWindow } from './sliding-window'
import { bfsDfs } from './bfs-dfs'
import { renderPipeline } from './render-pipeline'
import { specificity } from './specificity'
import { stackingContext } from './stacking-context'
import { flexbox } from './flexbox'
import { nestLifecycle } from './nest-lifecycle'
import { dbIndex } from './db-index'
import { nPlusOne } from './n-plus-one'
import { httpCache } from './http-cache'
import { fsdLayers } from './fsd-layers'
import { strategy } from './strategy'
import { capacity } from './capacity'
import { typeNarrow } from './type-narrow'
import { hooksOrder } from './hooks-order'
import { queryCache } from './query-cache'
import { cacheStampede } from './cache-stampede'
import { jwt } from './jwt'
import { testSelectors } from './test-selectors'
import { uiStates } from './ui-states'
import { contrast } from './contrast'
import { gitGraph } from './git-graph'
import { answerTimer } from './answer-timer'
import { fluxFlow } from './flux-flow'
import { bundleSize } from './bundle-size'
import { nodePhases } from './node-phases'
import { mockInterview } from './mock-interview'
import { designBudget } from './design-budget'
import { performanceDiagnosis, consistencyTradeoff, securityThreatModel, testingStrategy } from './theory-checkpoints'
import { eventDeliveryDemo } from './event-delivery'
import { authFlow } from './auth-flow'
import { pwaOffline } from './pwa-offline'
import { adaptiveInterview } from './adaptive-interview'
import { jsFoundationLab } from './js-foundation-lab'
import type { LegacyDemo } from '@/engine/types'
import { frameworkReactivityLab } from './framework-reactivity'
import { electronIpcLab } from './electron-ipc'

export const demos: Record<string, LegacyDemo> = {
  'event-loop': eventLoop,
  'promise-combinators': promiseCombinators,
  'refs-vs-copy': refsVsCopy,
  'react-keys': reactKeys,
  'debounce-throttle': debounceThrottle,
  'bigo': bigo,
  'binary-search': binarySearch,
  'sliding-window': slidingWindow,
  'bfs-dfs': bfsDfs,
  'render-pipeline': renderPipeline,
  'specificity': specificity,
  'stacking-context': stackingContext,
  'flexbox': flexbox,
  'nest-lifecycle': nestLifecycle,
  'db-index': dbIndex,
  'n-plus-one': nPlusOne,
  'http-cache': httpCache,
  'fsd-layers': fsdLayers,
  'strategy': strategy,
  'capacity': capacity,
  'type-narrow': typeNarrow,
  'hooks-order': hooksOrder,
  'query-cache': queryCache,
  'cache-stampede': cacheStampede,
  'jwt': jwt,
  'test-selectors': testSelectors,
  'ui-states': uiStates,
  'contrast': contrast,
  'git-graph': gitGraph,
  'answer-timer': answerTimer,
  'flux-flow': fluxFlow,
  'bundle-size': bundleSize,
  'node-phases': nodePhases,
  'mock-interview': mockInterview,
  'design-budget': designBudget,
  'performance-diagnosis': performanceDiagnosis,
  'consistency-tradeoff': consistencyTradeoff,
  'security-threat-model': securityThreatModel,
  'testing-strategy': testingStrategy,
  'event-delivery': eventDeliveryDemo,
  'auth-flow': authFlow,
  'pwa-offline': pwaOffline,
  'adaptive-interview': adaptiveInterview,
  'js-foundation-lab': jsFoundationLab,
  'framework-reactivity-lab': frameworkReactivityLab,
  'electron-ipc-lab': electronIpcLab,
}
