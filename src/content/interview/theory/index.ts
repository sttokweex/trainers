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
import type { TheoryArticle } from '@/engine/types'

export const theory: TheoryArticle[] = [
  async,
  jscore,
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
  a11y,
  testing,
  sysdesign,
  git,
  observability,
  realtime,
  interview,
  plan,
  patterns,
  archPatterns,
  libs,
  node,
  security,
  cache,
  build,
]
