import { async } from './th-async'
import { jscore } from './th-jscore'
import { ts } from './th-ts'
import { tsAdvanced } from './th-ts-advanced'
import { lifecycle } from './th-lifecycle'
import { hooks } from './th-hooks'
import { render } from './th-render'
import { state } from './th-state'
import { nest } from './th-nest'
import { sql } from './th-sql'
import { http } from './th-http'
import { browser } from './th-browser'
import { algoPatterns } from './th-algo-patterns'
import { oop } from './th-oop'
import { fsd } from './th-fsd'
import { css } from './th-css'
import { a11y } from './th-a11y'
import { testing } from './th-testing'
import { sysdesign } from './th-sysdesign'
import { git } from './th-git'
import { observability } from './th-observability'
import { realtime } from './th-realtime'
import { interview } from './th-interview'
import { plan } from './th-plan'
import { patterns } from './th-patterns'
import { archPatterns } from './th-arch-patterns'
import { libs } from './th-libs'
import { node } from './th-node'
import { security } from './th-security'
import { cache } from './th-cache'
import { build } from './th-build'
import { performance } from './th-performance'
import { graphql } from './th-graphql'
import { reliability } from './th-reliability'
import { delivery } from './th-delivery'
import { eventDelivery } from './th-event-delivery'
import { authProtocols } from './th-auth-protocols'
import { pwaOffline } from './th-pwa-offline'
import { loadBalancing } from './th-load-balancing'
import { html } from './th-html'
import { jsExecution } from './th-js-execution'
import { glossary } from './th-glossary'
import { basicsVariables } from './th-basics-variables'
import { basicsTypes } from './th-basics-types'
import { basicsControl } from './th-basics-control'
import { basicsFunctions } from './th-basics-functions'
import { basicsCollections } from './th-basics-collections'
import { microservices } from './th-microservices'
import { microfrontends } from './th-microfrontends'
import { postMessageTabs } from './th-postmessage-tabs'
import { ssr } from './th-ssr'
import { browserExtensions } from './th-browser-extensions'
import { telegramBots } from './th-telegram-bots'
import { telegramMiniApps } from './th-telegram-mini-apps'
import { postgresMysql } from './th-postgres-mysql'
import { redisDeep } from './th-redis-deep'
import { kafkaDeep } from './th-kafka-deep'
import type { TheoryArticle } from '@/engine/types'

export const theory: TheoryArticle[] = [
  basicsVariables,
  basicsTypes,
  basicsControl,
  basicsFunctions,
  basicsCollections,
  async,
  jscore,
  jsExecution,
  ts,
  tsAdvanced,
  lifecycle,
  hooks,
  render,
  state,
  nest,
  sql,
  http,
  browser,
  algoPatterns,
  oop,
  fsd,
  css,
  html,
  a11y,
  testing,
  sysdesign,
  git,
  observability,
  realtime,
  interview,
  plan,
  glossary,
  patterns,
  archPatterns,
  libs,
  node,
  security,
  cache,
  build,
  performance,
  graphql,
  reliability,
  loadBalancing,
  delivery,
  eventDelivery,
  authProtocols,
  pwaOffline,
  microservices,
  microfrontends,
  postMessageTabs,
  ssr,
  browserExtensions,
  telegramBots,
  telegramMiniApps,
  postgresMysql,
  redisDeep,
  kafkaDeep,
]
