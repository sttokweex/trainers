import { useState } from 'react'
import { Demo } from '../Demo'
import type { LegacyDemo, Tool } from '@/engine/types'

function ToolCard({ item, demos }: { item: Tool; demos: Record<string, LegacyDemo> }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={'tool' + (open ? ' open' : '')}>
      <div className="tool-h" onClick={() => setOpen((v) => !v)}>
        <div>
          <h3>{item.t}</h3>
          <p>{item.d}</p>
        </div>
        <span className="chip t">{item.topic}</span>
      </div>
      {open && (
        <div className="tool-b">
          <Demo name={item.demo} mount={demos[item.demo]} />
        </div>
      )}
    </div>
  )
}

/** Практикум: калькуляторы и тренажёры — каждая карточка это одно демо. */
export function ToolsMode({ items, demos }: { items: Tool[]; demos: Record<string, LegacyDemo> }) {
  if (!items.length) return <div className="empty">Ничего не найдено</div>

  const groups: { topic: string; list: Tool[] }[] = []
  for (const t of items) {
    const last = groups[groups.length - 1]
    if (last && last.topic === t.topic) last.list.push(t)
    else groups.push({ topic: t.topic, list: [t] })
  }

  return (
    <>
      <div className="intro">
        <h2>Практикум</h2>
        <p>
          {items.length} калькуляторов и тренажёров: существенность и выборка, амортизация и аренда,
          ПБУ&nbsp;18/02 и НДС, cut-off, старение дебиторки, журнальные проводки, дерево аудиторского
          мнения. Считайте по данным своих клиентов — это быстрее, чем читать про формулы.
        </p>
      </div>
      {groups.map((g) => (
        <div key={g.topic}>
          <div className="grp">{g.topic}</div>
          {g.list.map((t) => <ToolCard key={t.id} item={t} demos={demos} />)}
        </div>
      ))}
    </>
  )
}
