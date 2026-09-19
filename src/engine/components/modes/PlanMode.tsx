import { useEffect, useRef, useState } from 'react'
import type { PlanWeek } from '@/engine/types'

/** Ключ отметки привязан к номеру недели и позиции пункта — как в старом файле. */
const keyOf = (week: PlanWeek, i: number) => `${week.n}-${i}`

function Week({
  week, done, onToggle, defaultOpen,
}: {
  week: PlanWeek
  done: Record<string, boolean>
  onToggle: (key: string, value: boolean) => void
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const count = week.items.filter((_, i) => done[keyOf(week, i)]).length

  return (
    <div className={'wk' + (open ? ' open' : '')}>
      <div className="wk-h" onClick={() => setOpen((v) => !v)}>
        <div className="wk-n">НЕД {week.n}</div>
        <div className="wk-t">{week.t}</div>
        <div className="wk-p">{count}/{week.items.length}</div>
      </div>
      {open && (
        <div className="wk-b">
          <div className="demo-note"><b>Цель недели.</b> {week.goal}</div>
          {week.items.map((it, i) => {
            const key = keyOf(week, i)
            return (
              <label key={key} className={'chk' + (done[key] ? ' done' : '')}>
                <input
                  type="checkbox"
                  checked={Boolean(done[key])}
                  onChange={(e) => onToggle(key, e.target.checked)}
                />
                <span>
                  {it.t}
                  {it.s && <small>{it.s}</small>}
                </span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** Горизонтальные полосы прогресса рисует перенесённый SVG-движок графиков. */
function ProgressChart({ weeks, done }: { weeks: PlanWeek[]; done: Record<string, boolean> }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    let cancelled = false
    node.innerHTML = ''
    // помощники живут в общем слое демо и грузятся лениво — график не нужен до открытия режима
    import('@/demos/helpers').then((H) => {
      if (cancelled || !node.isConnected) return
      const barsH = (H as Record<string, any>).barsH
      const fmt = (H as Record<string, any>).fmt
      if (typeof barsH !== 'function') return
      barsH(node, {
        padL: 96,
        rowH: 26,
        data: weeks.map((w) => ({
          label: 'Неделя ' + w.n,
          value: w.items.filter((_, i) => done[keyOf(w, i)]).length,
          color: 'var(--s1)',
          note: w.t,
        })),
        fmt: (v: number) => fmt(v) + ' из задач',
      })
    })
    return () => { cancelled = true; node.innerHTML = '' }
  }, [weeks, done])

  return <div ref={ref} />
}

export function PlanMode({
  weeks, done, onToggle,
}: {
  weeks: PlanWeek[]
  done: Record<string, boolean>
  onToggle: (key: string, value: boolean) => void
}) {
  const total = weeks.reduce((sum, w) => sum + w.items.length, 0)
  const completed = weeks.reduce(
    (sum, w) => sum + w.items.filter((_, i) => done[keyOf(w, i)]).length, 0,
  )

  return (
    <>
      <div className="intro">
        <h2>План на {weeks.length} недель</h2>
        <p>
          Порядок выбран так, чтобы каждая следующая неделя опиралась на предыдущую: сначала учёт и
          отчётность (иначе аудиторские процедуры не к чему привязать), затем стандарты и методология,
          затем участки и завершение. Отметки сохраняются в браузере. Выполнено <b>{completed}</b> из {total} пунктов.
        </p>
      </div>
      <ProgressChart weeks={weeks} done={done} />
      {weeks.map((w) => (
        <Week key={w.n} week={w} done={done} onToggle={onToggle} defaultOpen={w.n === 1} />
      ))}
    </>
  )
}
