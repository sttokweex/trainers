import { useEffect, useRef, useState } from 'react'
import type { PlanLink, PlanWeek } from '@/engine/types'

/** Подпись к ссылке — чтобы было понятно, куда уведёт клик. */
const LINK_HINT: Record<string, string> = {
  theory: 'Открыть статью',
  tools: 'Открыть тренажёр в практикуме',
  questions: 'Перейти к вопросам темы',
  cards: 'Открыть карточки',
  plan: 'План',
}

/** Ключ отметки привязан к номеру недели и позиции пункта — как в старом файле. */
const keyOf = (week: PlanWeek, i: number) => `${week.n}-${i}`

/** Русское склонение после числа: 1 задача, 2 задачи, 5 задач. */
const plural = (n: number, one: string, few: string, many: string): string => {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

function Week({
  week, done, onToggle, defaultOpen, onNavigate,
}: {
  week: PlanWeek
  done: Record<string, boolean>
  onToggle: (key: string, value: boolean) => void
  defaultOpen: boolean
  onNavigate: (link: PlanLink) => void
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
                  {it.link
                    ? (
                      // ссылка внутри label: клик по ней не должен ставить галочку
                      <button
                        type="button"
                        className="chk-go"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onNavigate(it.link as PlanLink) }}
                        title={LINK_HINT[it.link.mode]}
                      >
                        {it.t}
                        <span className="chk-arrow">→</span>
                      </button>
                    )
                    : it.t}
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
        data: weeks.map((w) => {
          const doneCount = w.items.filter((_, i) => done[keyOf(w, i)]).length
          return {
            label: 'Неделя ' + w.n,
            value: doneCount,
            color: 'var(--s1)',
            // в подписи полосы помещается только число, поэтому знаменатель
            // и название недели уходят в тултип
            note: `${w.t} · выполнено ${doneCount} из ${w.items.length}`,
          }
        }),
        fmt: (v: number) => fmt(v) + ' ' + plural(v, 'задача', 'задачи', 'задач'),
      })
    })
    return () => { cancelled = true; node.innerHTML = '' }
  }, [weeks, done])

  return <div ref={ref} />
}

export function PlanMode({
  weeks, done, onToggle, onNavigate,
}: {
  weeks: PlanWeek[]
  done: Record<string, boolean>
  onToggle: (key: string, value: boolean) => void
  onNavigate: (link: PlanLink) => void
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
          Маршрут идёт от диагностики и фундаментальных тем к производительности, системному дизайну,
          доставке и финальной симуляции. Отметки сохраняются в браузере. Выполнено <b>{completed}</b> из {total} пунктов.
        </p>
      </div>
      <ProgressChart weeks={weeks} done={done} />
      {weeks.map((w) => (
        <Week
          key={w.n} week={w} done={done} onToggle={onToggle}
          defaultOpen={w.n === 1} onNavigate={onNavigate}
        />
      ))}
    </>
  )
}
