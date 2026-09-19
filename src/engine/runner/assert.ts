/**
 * Ассерты для тестов кодовых задач.
 *
 * В браузере тесты исполняются не здесь: они сериализуются через fn.toString()
 * и выполняются в воркере рядом с такими же реализациями. Этот модуль нужен,
 * чтобы контент компилировался и чтобы те же тесты можно было прогнать в vitest.
 */

export function J(v: unknown): string {
  try {
    if (typeof v === 'function') return 'function ' + (v.name || '')
    return JSON.stringify(v) ?? String(v)
  } catch {
    return String(v)
  }
}

export function dEq(a: any, b: any): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const ka = Object.keys(a)
  const kb = Object.keys(b)
  if (ka.length !== kb.length) return false
  return ka.every((k) => dEq(a[k], b[k]))
}

export function ok(c: unknown, m?: string): void {
  if (!c) throw new Error(m || 'ожидалось истинное значение')
}

export function eq(a: unknown, b: unknown, m?: string): void {
  if (!Object.is(a, b)) throw new Error((m ? m + ': ' : '') + 'получено ' + J(a) + ', ожидалось ' + J(b))
}

export function deepEq(a: unknown, b: unknown, m?: string): void {
  if (!dEq(a, b)) throw new Error((m ? m + ': ' : '') + 'получено ' + J(a) + ', ожидалось ' + J(b))
}

export async function throwsAsync(fn: () => unknown, m?: string): Promise<any> {
  try { await fn() } catch (e) { return e }
  throw new Error(m || 'ожидалась ошибка, но её не было')
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
