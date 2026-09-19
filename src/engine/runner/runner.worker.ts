/// <reference lib="webworker" />
/**
 * Исполняет код пользователя и прогоняет тесты в отдельном потоке.
 * Главный поток может убить воркер по таймауту, поэтому бесконечный цикл
 * в решении больше не вешает вкладку — в старом тренажёре вешал.
 */

export interface RunRequest {
  code: string
  exports: string[]
  /** Исходники тестов: fn.toString() с главного потока. */
  tests: { name: string; src: string }[]
}

export type RunMessage =
  | { kind: 'compile-error'; message: string }
  | { kind: 'missing-export'; name: string }
  | { kind: 'result'; name: string; ok: true }
  | { kind: 'result'; name: string; ok: false; message: string }
  | { kind: 'done'; passed: number; total: number }

/* ---- ассерты, те же, что в старом тренажёре ---- */
function J(v: unknown): string {
  try {
    if (typeof v === 'function') return 'function ' + (v.name || '')
    return JSON.stringify(v) ?? String(v)
  } catch { return String(v) }
}
function dEq(a: any, b: any): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const ka = Object.keys(a)
  const kb = Object.keys(b)
  if (ka.length !== kb.length) return false
  return ka.every((k) => dEq(a[k], b[k]))
}
function ok(c: unknown, m?: string): void {
  if (!c) throw new Error(m || 'ожидалось истинное значение')
}
function eq(a: unknown, b: unknown, m?: string): void {
  if (!Object.is(a, b)) throw new Error((m ? m + ': ' : '') + 'получено ' + J(a) + ', ожидалось ' + J(b))
}
function deepEq(a: unknown, b: unknown, m?: string): void {
  if (!dEq(a, b)) throw new Error((m ? m + ': ' : '') + 'получено ' + J(a) + ', ожидалось ' + J(b))
}
async function throwsAsync(fn: () => unknown, m?: string): Promise<any> {
  try { await fn() } catch (e) { return e }
  throw new Error(m || 'ожидалась ошибка, но её не было')
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const post = (msg: RunMessage) => (self as unknown as Worker).postMessage(msg)

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const { code, exports, tests } = event.data

  let mod: Record<string, unknown>
  try {
    // eslint-disable-next-line no-new-func
    const factory = new Function('"use strict";\n' + code + '\n;return {' + exports.join(',') + '};')
    mod = factory() as Record<string, unknown>
  } catch (e) {
    post({ kind: 'compile-error', message: e instanceof Error ? e.message : String(e) })
    return
  }

  for (const name of exports) {
    if (typeof mod[name] === 'undefined') {
      post({ kind: 'missing-export', name })
      return
    }
  }

  let passed = 0
  for (const t of tests) {
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function('ok', 'eq', 'deepEq', 'throwsAsync', 'sleep', 'J', 'dEq',
        'return (' + t.src + ')')(ok, eq, deepEq, throwsAsync, sleep, J, dEq)
      await fn(mod)
      passed++
      post({ kind: 'result', name: t.name, ok: true })
    } catch (e) {
      post({ kind: 'result', name: t.name, ok: false, message: e instanceof Error ? e.message : String(e) })
    }
  }
  post({ kind: 'done', passed, total: tests.length })
}
