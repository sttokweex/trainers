export interface TestResult {
  name: string
  ok: boolean
  message?: string
}

export interface RunState {
  status: 'idle' | 'running' | 'done' | 'error'
  results: TestResult[]
  error?: string
  passed: number
  total: number
  /** true, когда код исполнялся в главном потоке: защиты от зацикливания нет. */
  inline: boolean
}
