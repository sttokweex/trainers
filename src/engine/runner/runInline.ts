import * as assert from './assert'
import type { CodeQuestion } from '@/engine/types'
import type { TestResult } from './types'

/**
 * Запасной путь исполнения, когда Worker недоступен — например, когда сборку
 * в один файл открыли двойным кликом с file://: браузер блокирует загрузку
 * внешнего скрипта воркера по CORS.
 *
 * Важное отличие от воркера: здесь код выполняется в главном потоке, поэтому
 * бесконечный цикл всё-таки подвесит вкладку. Интерфейс об этом предупреждает.
 */
export async function runInline(
  item: CodeQuestion,
  code: string,
  onResult: (r: TestResult) => void,
): Promise<{ error?: string; passed: number }> {
  let mod: Record<string, unknown>
  try {
    const factory = new Function('"use strict";\n' + code + '\n;return {' + item.exports.join(',') + '};')
    mod = factory() as Record<string, unknown>
  } catch (e) {
    return { error: 'Код не выполнился: ' + (e instanceof Error ? e.message : String(e)), passed: 0 }
  }

  for (const name of item.exports) {
    if (typeof mod[name] === 'undefined') {
      return { error: `Функция «${name}» не объявлена — не переименовывайте её.`, passed: 0 }
    }
  }

  // тесты ссылаются на ассерты как на свободные имена — подкладываем их
  const g = globalThis as Record<string, unknown>
  const saved = new Map<string, unknown>()
  for (const [k, v] of Object.entries(assert)) {
    saved.set(k, g[k])
    g[k] = v
  }

  let passed = 0
  try {
    for (const t of item.tests) {
      try {
        await t.fn(mod)
        passed++
        onResult({ name: t.name, ok: true })
      } catch (e) {
        onResult({ name: t.name, ok: false, message: e instanceof Error ? e.message : String(e) })
      }
    }
  } finally {
    for (const [k, v] of saved) {
      if (v === undefined) delete g[k]
      else g[k] = v
    }
  }
  return { passed }
}
