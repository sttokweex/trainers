import { useEffect, useRef, useState } from 'react'
import { Demo } from '../Demo'
import type { LegacyDemo, Tool } from '@/engine/types'

function ToolCard({
  item, demos, autoOpen = false,
}: {
  item: Tool
  demos: Record<string, LegacyDemo>
  /** Пришли по ссылке из плана: раскрыть и подвести к себе. */
  autoOpen?: boolean
}) {
  const [open, setOpen] = useState(autoOpen)
  const rootRef = useRef<HTMLDivElement>(null)

  /** Раскрытие задано начальным состоянием — здесь только прокрутка к карточке. */
  useEffect(() => {
    if (!autoOpen) return
    const id = requestAnimationFrame(() => {
      rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => cancelAnimationFrame(id)
  }, [autoOpen])

  return (
    <div className={'tool' + (open ? ' open' : '')} ref={rootRef} id={'t-' + item.id}>
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
export function ToolsMode({
  items, demos, openId, context = 'audit',
}: {
  items: Tool[]
  demos: Record<string, LegacyDemo>
  openId?: string
  context?: 'interview' | 'audit'
}) {
  if (!items.length) return <div className="empty">Ничего не найдено</div>

  // Тема может встретиться в разных местах реестра (например, API-инструменты
  // стоят рядом с GraphQL). Собираем её целиком, чтобы заголовок не дублировался.
  const groups: { topic: string; list: Tool[] }[] = []
  const byTopic = new Map<string, { topic: string; list: Tool[] }>()
  for (const t of items) {
    let group = byTopic.get(t.topic)
    if (!group) {
      group = { topic: t.topic, list: [] }
      byTopic.set(t.topic, group)
      groups.push(group)
    }
    group.list.push(t)
  }

  return (
    <>
      <div className="intro">
        <h2>Практикум</h2>
        {context === 'interview' ? (
          <p>{items.length} интерактивных сценариев: тренируйте производительность, сети, кэш, capacity, релизы и ответы вслух. Короткое действие помогает закрепить идею быстрее, чем повторное чтение.</p>
        ) : (
          <p>
            {items.length} калькуляторов и тренажёров: существенность и выборка, амортизация и аренда,
            ПБУ&nbsp;18/02 и НДС, cut-off, старение дебиторки, журнальные проводки, дерево аудиторского
            мнения. Считайте по данным своих клиентов — это быстрее, чем читать про формулы.
          </p>
        )}
      </div>
      {groups.map((g) => (
        <div key={g.topic}>
          <div className="grp">{g.topic}</div>
          {g.list.map((t) => (
            <ToolCard key={t.id} item={t} demos={demos} autoOpen={t.id === openId} />
          ))}
        </div>
      ))}
    </>
  )
}
