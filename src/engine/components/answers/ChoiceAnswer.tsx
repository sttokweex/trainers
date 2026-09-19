import { useState } from 'react'
import type { ChoiceQuestion } from '@/engine/types'

/** Выбор варианта: одиночный или множественный, проверка одноразовая. */
export function ChoiceAnswer({ item, onChecked }: { item: ChoiceQuestion; onChecked: () => void }) {
  const [picks, setPicks] = useState<Set<number>>(new Set())
  const [checked, setChecked] = useState(false)

  const toggle = (i: number) => {
    if (checked) return
    setPicks((prev) => {
      if (item.multi) {
        const next = new Set(prev)
        if (next.has(i)) next.delete(i); else next.add(i)
        return next
      }
      return new Set([i])
    })
  }

  const right = item.options.every((o, i) => o.ok === picks.has(i))

  return (
    <>
      {item.multi && <div className="demo-note">Верных вариантов несколько.</div>}
      <div className="opts">
        {item.options.map((o, i) => {
          let cls = 'opt'
          if (picks.has(i) && !checked) cls += ' on'
          if (checked) {
            if (o.ok && picks.has(i)) cls += ' ok'
            else if (o.ok) cls += ' miss'
            else if (picks.has(i)) cls += ' no'
          }
          return (
            <button key={i} type="button" className={cls} onClick={() => toggle(i)}>
              <b>{String.fromCharCode(65 + i)}</b>
              <span dangerouslySetInnerHTML={{ __html: o.t }} />
            </button>
          )
        })}
      </div>
      {!checked && (
        <div className="ed-bar">
          <button
            type="button" className="btn pri" disabled={picks.size === 0}
            onClick={() => { setChecked(true); onChecked() }}
          >
            Проверить
          </button>
        </div>
      )}
      {checked && (
        <div className="res show">
          <div className={'res-h ' + (right ? 'ok' : 'no')}>
            {right ? '✓ Верно' : '✕ Не совсем — верные подсвечены зелёным'}
          </div>
        </div>
      )}
    </>
  )
}
