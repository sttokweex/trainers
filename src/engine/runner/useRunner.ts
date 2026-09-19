import { useCallback, useEffect, useRef, useState } from 'react'
import type { CodeQuestion } from '@/engine/types'
import { runInline } from './runInline'
import type { RunState, TestResult } from './types'
import type { RunMessage, RunRequest } from './runner.worker'

const IDLE: RunState = { status: 'idle', results: [], passed: 0, total: 0, inline: false }

/** Сколько ждём воркер, прежде чем считать, что решение зациклилось. */
const TIMEOUT_MS = 5000

export type { RunState, TestResult }

export function useRunner(item: CodeQuestion) {
  const [state, setState] = useState<RunState>(IDLE)
  const workerRef = useRef<Worker | null>(null)
  const timerRef = useRef<number | null>(null)

  const cleanup = useCallback(() => {
    workerRef.current?.terminate()
    workerRef.current = null
    if (timerRef.current !== null) { clearTimeout(timerRef.current); timerRef.current = null }
  }, [])

  useEffect(() => cleanup, [cleanup])

  const run = useCallback((code: string) => {
    cleanup()
    setState({ status: 'running', results: [], passed: 0, total: item.tests.length, inline: false })

    let worker: Worker
    try {
      worker = new Worker(new URL('./runner.worker.ts', import.meta.url), { type: 'module' })
    } catch {
      // Worker недоступен (например, сборка в один файл открыта с file://) —
      // исполняем в главном потоке, честно предупредив об отсутствии таймаута.
      void runFallback(item, code, setState)
      return
    }
    workerRef.current = worker

    timerRef.current = window.setTimeout(() => {
      cleanup()
      setState((s) => ({
        ...s, status: 'error',
        error: `Выполнение прервано через ${TIMEOUT_MS / 1000}с — похоже на бесконечный цикл. `
          + 'Вкладка при этом не зависла: код исполняется в отдельном потоке.',
      }))
    }, TIMEOUT_MS)

    worker.onmessage = (e: MessageEvent<RunMessage>) => {
      const msg = e.data
      if (msg.kind === 'compile-error') {
        cleanup()
        setState((s) => ({ ...s, status: 'error', error: 'Код не выполнился: ' + msg.message }))
      } else if (msg.kind === 'missing-export') {
        cleanup()
        setState((s) => ({ ...s, status: 'error', error: `Функция «${msg.name}» не объявлена — не переименовывайте её.` }))
      } else if (msg.kind === 'result') {
        setState((s) => ({
          ...s,
          results: [...s.results, { name: msg.name, ok: msg.ok, message: msg.ok ? undefined : msg.message }],
        }))
      } else {
        cleanup()
        setState((s) => ({ ...s, status: 'done', passed: msg.passed, total: msg.total }))
      }
    }

    // воркер может не загрузиться уже после конструирования — тогда тоже откат
    worker.onerror = () => {
      cleanup()
      void runFallback(item, code, setState)
    }

    const request: RunRequest = {
      code,
      exports: item.exports,
      tests: item.tests.map((t) => ({ name: t.name, src: t.fn.toString() })),
    }
    worker.postMessage(request)
  }, [cleanup, item])

  const reset = useCallback(() => { cleanup(); setState(IDLE) }, [cleanup])

  return { state, run, reset }
}

async function runFallback(
  item: CodeQuestion,
  code: string,
  setState: React.Dispatch<React.SetStateAction<RunState>>,
) {
  setState({ status: 'running', results: [], passed: 0, total: item.tests.length, inline: true })
  const { error, passed } = await runInline(item, code, (r) => {
    setState((s) => ({ ...s, results: [...s.results, r] }))
  })
  setState((s) => ({
    ...s,
    status: error ? 'error' : 'done',
    error,
    passed,
    inline: true,
  }))
}
