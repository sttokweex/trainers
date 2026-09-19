import { useCallback, useEffect, useRef, useState } from 'react'
import type { CodeQuestion } from '@/engine/types'
import type { RunMessage, RunRequest } from './runner.worker'

export interface TestResult { name: string; ok: boolean; message?: string }
export interface RunState {
  status: 'idle' | 'running' | 'done' | 'error'
  results: TestResult[]
  error?: string
  passed: number
  total: number
}

const IDLE: RunState = { status: 'idle', results: [], passed: 0, total: 0 }

/** Сколько ждём воркер, прежде чем считать, что решение зациклилось. */
const TIMEOUT_MS = 5000

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
    setState({ status: 'running', results: [], passed: 0, total: item.tests.length })

    const worker = new Worker(new URL('./runner.worker.ts', import.meta.url), { type: 'module' })
    workerRef.current = worker

    timerRef.current = window.setTimeout(() => {
      cleanup()
      setState({
        status: 'error', results: [], passed: 0, total: item.tests.length,
        error: `Выполнение прервано через ${TIMEOUT_MS / 1000}с — похоже на бесконечный цикл. ` +
               'Вкладка при этом не зависла: код исполняется в отдельном потоке.',
      })
    }, TIMEOUT_MS)

    worker.onmessage = (e: MessageEvent<RunMessage>) => {
      const msg = e.data
      if (msg.kind === 'compile-error') {
        cleanup()
        setState((s) => ({ ...s, status: 'error', error: 'Код не выполнился: ' + msg.message }))
      } else if (msg.kind === 'missing-export') {
        cleanup()
        setState((s) => ({
          ...s, status: 'error',
          error: `Функция «${msg.name}» не объявлена — не переименовывайте её.`,
        }))
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
    worker.onerror = (e) => {
      cleanup()
      setState((s) => ({ ...s, status: 'error', error: e.message || 'ошибка воркера' }))
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
