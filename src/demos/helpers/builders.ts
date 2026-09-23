/**
 * Конструкторы интерактивных упражнений:
 * сортировка по корзинам, сопоставление пар, пошаговый разбор, дерево решений.
 */
import { dBtn, dEl, dShell } from './dom'

/* ---------- Классификация: разложить утверждения по корзинам ---------- */

export interface SortBin {
  id: string
  label: string
}

export interface SortItem {
  /** Утверждение, которое нужно отнести к корзине. */
  q: string
  /** id правильной корзины. */
  bin: string
  /** Объяснение, показываемое после проверки. */
  why: string
}

export interface SortConfig {
  intro?: string
  bins: SortBin[]
  items: SortItem[]
}

export function mkSort(root: HTMLElement, title: string, cfg: SortConfig): void {
  const body = dShell(root, title)
  if (cfg.intro) body.appendChild(dEl('div', 'demo-note', cfg.intro))

  const picks: Record<number, string> = {}
  const rows: { box: HTMLDivElement; why: HTMLDivElement; item: SortItem }[] = []

  cfg.items.forEach((item, i) => {
    const box = dEl('div', 'sort-it')
    box.appendChild(dEl('div', 'sort-q', item.q))

    const bar = dEl('div', 'sort-b')
    const buttons: Record<string, HTMLButtonElement> = {}
    for (const bin of cfg.bins) {
      const btn = dEl('button', null, bin.label)
      btn.type = 'button'
      btn.onclick = () => {
        picks[i] = bin.id
        for (const other of Object.values(buttons)) other.classList.remove('pick')
        btn.classList.add('pick')
      }
      buttons[bin.id] = btn
      bar.appendChild(btn)
    }
    box.appendChild(bar)

    const why = dEl('div', 'why')
    why.style.display = 'none'
    box.appendChild(why)

    rows.push({ box, why, item })
    body.appendChild(box)
  })

  const ctl = dEl('div', 'demo-ctl')
  const score = dEl('span', 'demo-note')
  score.style.margin = '0'

  ctl.appendChild(dBtn('Проверить', 'pri', () => {
    let right = 0
    rows.forEach((row, i) => {
      const correct = picks[i] === row.item.bin
      if (correct) right++
      row.box.className = 'sort-it ' + (picks[i] == null ? '' : correct ? 'ok' : 'no')
      const binName = cfg.bins.find((b) => b.id === row.item.bin)?.label ?? ''
      row.why.innerHTML = '<b>' + binName + '</b> — ' + row.item.why
      row.why.style.display = ''
    })
    score.innerHTML = 'Верно <b>' + right + '</b> из ' + rows.length
  }))

  ctl.appendChild(dBtn('Сброс', 'sm', () => {
    rows.forEach((row, i) => {
      delete picks[i]
      row.box.className = 'sort-it'
      row.why.style.display = 'none'
      row.box.querySelectorAll('.sort-b button').forEach((b) => b.classList.remove('pick'))
    })
    score.innerHTML = ''
  }))

  ctl.appendChild(score)
  body.appendChild(ctl)
}

/* ---------- Сопоставление пар: клик слева, затем справа ---------- */

export interface MatchPair {
  l: string
  r: string
  /** Короткая пометка, появляющаяся после верного сопоставления. */
  note?: string
}

export interface MatchConfig {
  intro?: string
  pairs: MatchPair[]
}

export function mkMatch(root: HTMLElement, title: string, cfg: MatchConfig): void {
  const body = dShell(root, title)
  if (cfg.intro) body.appendChild(dEl('div', 'demo-note', cfg.intro))

  const grid = dEl('div', 'mt')
  const colL = dEl('div', 'mt-col')
  const colR = dEl('div', 'mt-col')
  grid.appendChild(colL)
  grid.appendChild(colR)

  // правая колонка перемешана, иначе упражнение решается по позиции
  const shuffled = cfg.pairs.map((_, i) => i).sort(() => Math.random() - 0.5)

  let selected: number | null = null
  let done = 0
  const msg = dEl('div', 'demo-note')
  const leftNodes: Record<number, HTMLDivElement> = {}

  cfg.pairs.forEach((pair, i) => {
    const node = dEl('div', 'mt-i', pair.l)
    node.onclick = () => {
      if (node.classList.contains('ok')) return
      for (const other of Object.values(leftNodes)) other.classList.remove('sel')
      node.classList.add('sel')
      selected = i
    }
    leftNodes[i] = node
    colL.appendChild(node)
  })

  for (const i of shuffled) {
    const pair = cfg.pairs[i] as MatchPair
    const node = dEl('div', 'mt-i', pair.r)
    node.onclick = () => {
      if (node.classList.contains('ok') || selected == null) return
      if (selected === i) {
        node.classList.add('ok')
        leftNodes[selected]?.classList.add('ok')
        leftNodes[selected]?.classList.remove('sel')
        if (pair.note) node.appendChild(dEl('span', 'tag', pair.note))
        done++
        selected = null
        msg.innerHTML = 'Сопоставлено <b>' + done + '</b> из ' + cfg.pairs.length
          + (done === cfg.pairs.length ? ' — готово' : '')
      } else {
        node.classList.add('no')
        setTimeout(() => node.classList.remove('no'), 450)
        msg.innerHTML = 'Не та пара — посмотрите ещё раз на предпосылку, которую закрывает процедура'
      }
    }
    colR.appendChild(node)
  }

  body.appendChild(grid)
  body.appendChild(msg)
}

/* ---------- Дерево решений ---------- */

export interface TreeQuestion {
  q: string
  opts: { t: string; go: string }[]
}

export interface TreeOutcome {
  /** Заголовок исхода. */
  out: string
  text: string
  /** Класс окраски: ok / q / bad. */
  cls?: string
}

export type TreeNode = TreeQuestion | TreeOutcome

export interface TreeConfig {
  start: string
  nodes: Record<string, TreeNode>
}

const isOutcome = (node: TreeNode): node is TreeOutcome => 'out' in node

export function mkTree(root: HTMLElement, title: string, cfg: TreeConfig): void {
  const body = dShell(root, title)
  const zone = dEl('div', 'tree')
  body.appendChild(zone)

  function ask(key: string): void {
    const node = cfg.nodes[key]
    if (!node) return

    if (isOutcome(node)) {
      zone.appendChild(dEl('div', 'tree-out ' + (node.cls ?? 'ok'), '<b>' + node.out + '</b>' + node.text))
      const ctl = dEl('div', 'demo-ctl')
      ctl.appendChild(dBtn('Пройти заново', 'sm', () => { zone.innerHTML = ''; ask(cfg.start) }))
      zone.appendChild(ctl)
      return
    }

    const q = dEl('div', 'tree-q')
    q.appendChild(dEl('div', 'qq', node.q))
    const bar = dEl('div', 'sort-b')
    for (const opt of node.opts) {
      const btn = dEl('button', null, opt.t)
      btn.type = 'button'
      btn.onclick = () => {
        // пройденную развилку не переигрываем — иначе ветки наложатся
        bar.querySelectorAll('button').forEach((x) => { x.disabled = true; x.style.opacity = '0.5' })
        btn.classList.add('pick')
        btn.style.opacity = '1'
        ask(opt.go)
      }
      bar.appendChild(btn)
    }
    q.appendChild(bar)
    zone.appendChild(q)
  }

  ask(cfg.start)
}

/* ---------- Пошаговый разбор ---------- */

export interface StepsConfig<TStep extends { note?: string }> {
  steps: TStep[]
  /** Наполняет панель содержимым шага; панель очищается перед каждым вызовом. */
  render: (panel: HTMLDivElement, step: TStep, index: number) => void
}

export function mkSteps<TStep extends { note?: string }>(
  root: HTMLElement, title: string, cfg: StepsConfig<TStep>,
): void {
  const body = dShell(root, title)
  const panel = dEl('div')
  const note = dEl('div', 'demo-note')
  const ctl = dEl('div', 'demo-ctl')
  const pos = dEl('span', 'demo-note')
  pos.style.margin = '0'

  let i = 0
  const prev = dBtn('← Назад', 'sm', () => { i = Math.max(0, i - 1); draw() })
  const next = dBtn('Дальше →', 'pri', () => { i = Math.min(cfg.steps.length - 1, i + 1); draw() })

  ctl.appendChild(prev)
  ctl.appendChild(next)
  ctl.appendChild(dBtn('В начало', 'sm', () => { i = 0; draw() }))
  ctl.appendChild(pos)

  function draw(): void {
    panel.innerHTML = ''
    const step = cfg.steps[i]
    if (!step) return
    cfg.render(panel, step, i)
    note.innerHTML = step.note ?? ''
    pos.innerHTML = 'шаг <b>' + (i + 1) + '</b> / ' + cfg.steps.length
    prev.disabled = i === 0
    next.disabled = i === cfg.steps.length - 1
  }

  body.appendChild(panel)
  body.appendChild(ctl)
  body.appendChild(note)
  draw()
}
