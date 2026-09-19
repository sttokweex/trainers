import { useState } from 'react'
import { CodeEditor } from '../CodeEditor'
import { useRunner } from '@/engine/runner/useRunner'
import type { CodeQuestion, ManualQuestion } from '@/engine/types'

/** Задача с авто-проверкой: код уходит в воркер, поэтому цикл не вешает вкладку. */
export function CodeAnswer({ item, onSolved }: { item: CodeQuestion; onSolved: () => void }) {
  const [code, setCode] = useState(item.starter)
  const [solutionShown, setSolutionShown] = useState(false)
  const { state, run, reset } = useRunner(item)

  const done = state.status === 'done'
  const allPassed = done && state.passed === state.total

  return (
    <>
      <div className="sec-t">Ваш код</div>
      <CodeEditor value={code} onChange={setCode} onRun={() => run(code)} />

      <div className="ed-bar">
        <button
          type="button" className="btn pri"
          disabled={state.status === 'running'}
          onClick={() => run(code)}
        >
          {state.status === 'running' ? 'Выполняю…' : 'Запустить тесты'}
        </button>
        <button
          type="button" className="btn"
          onClick={() => { setSolutionShown(true); onSolved() }}
        >
          Показать решение
        </button>
        <button
          type="button" className="btn gho sm"
          onClick={() => { setCode(item.starter); reset() }}
        >
          Сброс
        </button>
        <div className="ed-hint">⌘/Ctrl + Enter</div>
      </div>

      {(state.results.length > 0 || state.error) && (
        <div className="res show">
          <div className={'res-h ' + (state.error ? 'no' : allPassed ? 'ok' : done ? 'no' : '')}>
            {state.error
              ? state.error
              : done
                ? (allPassed
                  ? `✓ Все тесты пройдены (${state.passed}/${state.total})`
                  : `Пройдено ${state.passed} из ${state.total}`)
                : `Выполняю… ${state.results.length}/${state.total}`}
          </div>
          {state.results.map((r, i) => (
            <div key={i} className={'res-i ' + (r.ok ? 'p' : 'f')}>
              <span className="s">{r.ok ? '✓' : '✕'}</span>
              <span className="m">{r.name}{r.message ? '\n   → ' + r.message : ''}</span>
            </div>
          ))}
          {state.inline && (
            <div className="res-i">
              <span className="s">!</span>
              <span className="m">
                Отдельный поток недоступен (файл открыт напрямую с диска), код выполнен в главном
                потоке. Всё работает, но бесконечный цикл здесь подвесит вкладку — перезагрузите страницу.
              </span>
            </div>
          )}
        </div>
      )}

      {solutionShown && <Solution item={item} />}
    </>
  )
}

/** Задача без авто-проверки: пишем код и сверяемся с эталоном. */
export function ManualAnswer({ item, onSolved }: { item: ManualQuestion; onSolved: () => void }) {
  const [code, setCode] = useState(item.starter ?? '')
  const [shown, setShown] = useState(false)
  const reveal = () => { setShown(true); onSolved() }

  return (
    <>
      <div className="sec-t">Ваш код</div>
      <CodeEditor value={code} onChange={setCode} onRun={reveal} />
      <div className="ed-bar">
        <button type="button" className="btn pri" onClick={reveal}>Показать эталон</button>
        <div className="ed-hint">⌘/Ctrl + Enter</div>
      </div>
      {shown && <Solution item={item} />}
    </>
  )
}

function Solution({ item }: { item: CodeQuestion | ManualQuestion }) {
  return (
    <>
      {item.approach && (
        <>
          <div className="sec-t">Ход решения — как до этого додуматься</div>
          <div className="appr" dangerouslySetInnerHTML={{ __html: item.approach }} />
        </>
      )}
      <div className="sec-t">Эталонное решение</div>
      <pre className="code">{item.solution}</pre>
    </>
  )
}
