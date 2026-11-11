import { async } from './th-async'
import { jscore } from './th-jscore'
import { ts } from './th-ts'
import { tsAdvanced } from './th-ts-advanced'
import { tsPractice } from './th-ts-practice'
import { zod } from './th-zod'
import { render } from './th-render'
import { hooks } from './th-hooks'
import { lifecycle } from './th-lifecycle'
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
import { angular } from './th-angular'
import { vue } from './th-vue'
import { styleSystems } from './th-stylesystems'
import { scss } from './th-scss'
import { threejs } from './th-threejs'
import { electron } from './th-electron'
import { nuxt } from './th-nuxt'
import { expressFastify } from './th-express-fastify'
import { networkingAdmin } from './th-networking-admin'
import { networkProtocols } from './th-network-protocols'
import { infraRoadmap } from './th-infra-roadmap'
import { linuxVps } from './th-linux-vps'
import { containersKubernetes } from './th-containers-kubernetes'
import { backendArchitecture } from './th-backend-architecture'
import type { TheoryArticle } from '@/engine/types'

export const theory: TheoryArticle[] = [
  // 1. Основы языка: последующие главы предполагают чтение простых примеров кода.
  basicsVariables,
  basicsTypes,
  basicsControl,
  basicsFunctions,
  basicsCollections,
  jscore,
  jsExecution,
  async,
  // 2. TypeScript и проверка данных: сначала типы, затем их применение на границе приложения.
  ts,
  tsPractice,
  zod,
  tsAdvanced,
  // 3. Основа веб-страницы и браузера: разметка/стили → сборка → сеть → работа браузера.
  html,
  css,
  styleSystems,
  scss,
  a11y,
  build,
  networkingAdmin,
  networkProtocols,
  http,
  browser,
  pwaOffline,
  postMessageTabs,
  browserExtensions,
  // 4. UI-фреймворки: сначала модель React, затем состояние и другие экосистемы.
  render,
  hooks,
  lifecycle,
  state,
  vue,
  angular,
  ssr,
  nuxt,
  // 5. Сервер и данные: Node → HTTP-серверы/API → SQL → Nest и хранилища.
  node,
  expressFastify,
  sql,
  nest,
  postgresMysql,
  backendArchitecture,
  cache,
  redisDeep,
  kafkaDeep,
  eventDelivery,
  graphql,
  realtime,
  security,
  authProtocols,
  telegramBots,
  telegramMiniApps,
  // 6. Качество, архитектура и масштабирование: после основ приложения.
  testing,
  algoPatterns,
  oop,
  patterns,
  archPatterns,
  fsd,
  microfrontends,
  libs,
  sysdesign,
  microservices,
  // 7. Эксплуатация: наблюдаемость и надёжность перед контейнерами и деплоем.
  observability,
  reliability,
  loadBalancing,
  containersKubernetes,
  linuxVps,
  git,
  delivery,
  performance,
  threejs,
  electron,
  infraRoadmap,
  // Справочные главы и подготовка не являются prerequisite для остальных тем.
  glossary,
  plan,
  interview,
]
