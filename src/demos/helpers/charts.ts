/**
 * Самописный SVG-движок графиков. Палитра --s1..--s4 провалидирована для
 * тёмной поверхности #0d141d (полоса светлоты, насыщенность, различимость при
 * дальтонизме, контраст ≥3:1) — менять её значения без повторной проверки нельзя.
 */
import { dEl } from './dom'
import { fmt, pct } from './format'

export const SVGNS = 'http://www.w3.org/2000/svg'
export const PAL = ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)'] as const

type Attrs = Record<string, string | number | null | undefined>

export function sv<K extends keyof SVGElementTagNameMap>(tag: K, attrs?: Attrs): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVGNS, tag) as SVGElementTagNameMap[K]
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v != null) node.setAttribute(k, String(v))
    }
  }
  return node
}

/** Прямоугольник со скруглением только на «конце данных». */
export function barPath(
  x: number, y: number, w: number, h: number, radius: number, dir: 'h' | 'v',
): string {
  const r = Math.max(0, Math.min(radius, dir === 'h' ? w : h))
  if (w <= 0 || h <= 0) return ''
  if (dir === 'h') {
    return `M${x},${y} H${x + w - r} a${r},${r} 0 0 1 ${r},${r} V${y + h - r} a${r},${r} 0 0 1 ${-r},${r} H${x} Z`
  }
  return `M${x},${y + r} a${r},${r} 0 0 1 ${r},${-r} H${x + w - r} a${r},${r} 0 0 1 ${r},${r} V${y + h} H${x} Z`
}

export interface ChartBox {
  box: HTMLDivElement
  show(html: string, x: number, y: number): void
  hide(): void
}

/** Контейнер графика с тултипом, который не вылезает за края. */
export function chartBox(parent: HTMLElement): ChartBox {
  const box = dEl('div', 'chart')
  const tip = dEl('div', 'ct')
  parent.appendChild(box)
  box.appendChild(tip)

  const show = (html: string, x: number, y: number) => {
    tip.innerHTML = html
    tip.classList.add('on')
    const boxWidth = box.clientWidth
    const tipWidth = tip.offsetWidth
    tip.style.left = Math.max(0, Math.min(x - tipWidth / 2, boxWidth - tipWidth)) + 'px'
    tip.style.top = Math.max(0, y - tip.offsetHeight - 10) + 'px'
  }
  const hide = () => tip.classList.remove('on')

  return { box, show, hide }
}

export function legend(parent: HTMLElement, items: { name: string; color: string }[]): HTMLDivElement {
  const node = dEl('div', 'lgd')
  for (const item of items) {
    node.appendChild(dEl('span', null, `<i style="background:${item.color}"></i>${item.name}`))
  }
  parent.appendChild(node)
  return node
}

type Formatter = (v: number) => string

/* ---------- Горизонтальные полосы: одна серия, значения справа ---------- */

export interface BarsHDatum {
  label: string
  value: number
  color?: string
  /** Уточнение в тултипе. */
  note?: string
}

export interface BarsHOptions {
  data: BarsHDatum[]
  fmt?: Formatter
  rowH?: number
  padL?: number
}

export function barsH(parent: HTMLElement, opts: BarsHOptions): { box: HTMLDivElement } {
  const { data } = opts
  const fmtV: Formatter = opts.fmt ?? ((v) => fmt(v))
  const w = 640
  const rowH = opts.rowH ?? 30
  const padL = opts.padL ?? 150
  const padR = 96
  const top = 6
  const h = top + data.length * rowH + 8

  const { box, show, hide } = chartBox(parent)
  const svg = sv('svg', { viewBox: `0 0 ${w} ${h}`, role: 'img' })
  const max = Math.max(1, ...data.map((d) => Math.abs(d.value)))
  const plot = w - padL - padR

  data.forEach((d, i) => {
    const y = top + i * rowH
    const barH = Math.min(20, rowH - 10)
    const barW = Math.max(2, (Math.abs(d.value) / max) * plot)

    const axisLabel = sv('text', { x: padL - 10, y: y + barH / 2 + 4, 'text-anchor': 'end', class: 'axl' })
    axisLabel.textContent = d.label
    svg.appendChild(axisLabel)

    svg.appendChild(sv('path', { d: barPath(padL, y, barW, barH, 4, 'h'), fill: d.color ?? PAL[0] }))

    const valueLabel = sv('text', { x: padL + barW + 8, y: y + barH / 2 + 4, class: 'vl' })
    valueLabel.textContent = fmtV(d.value)
    svg.appendChild(valueLabel)

    const hit = sv('rect', { x: 0, y: y - 3, width: w, height: rowH, fill: 'transparent' })
    hit.addEventListener('mousemove', (ev) => {
      const r = box.getBoundingClientRect()
      show(
        `<b>${d.label}</b><br>${fmtV(d.value)}` + (d.note ? `<br><span class="k">${d.note}</span>` : ''),
        ev.clientX - r.left, ev.clientY - r.top,
      )
    })
    hit.addEventListener('mouseleave', hide)
    svg.appendChild(hit)
  })

  box.appendChild(svg)
  return { box }
}

/* ---------- Вертикальные столбцы ---------- */

export interface Series {
  name: string
  values: (number | null)[]
  color?: string
  /** Пунктирная линия — для плановых и справочных значений. */
  dash?: boolean
}

export interface BarsVOptions {
  series: Series[]
  xLabels: string[]
  fmt?: Formatter
  tick?: Formatter
  max?: number
  h?: number
}

export function barsV(parent: HTMLElement, opts: BarsVOptions): { box: HTMLDivElement } {
  const { series, xLabels: xs } = opts
  const fmtV: Formatter = opts.fmt ?? ((v) => fmt(v))

  if (series.length > 1) {
    legend(parent, series.map((s, i) => ({ name: s.name, color: s.color ?? (PAL[i % 4] as string) })))
  }

  const w = 640
  const h = opts.h ?? 230
  const padL = 58
  const padB = 34
  const padT = 14
  const padR = 10

  const { box, show, hide } = chartBox(parent)
  const svg = sv('svg', { viewBox: `0 0 ${w} ${h}` })

  const all = series.flatMap((s) => s.values).filter((v): v is number => v != null)
  const max = opts.max ?? Math.max(1, ...all.map(Math.abs)) * 1.12
  const plotH = h - padB - padT
  const plotW = w - padL - padR
  const yOf = (v: number) => padT + plotH - (v / max) * plotH

  for (let t = 0; t <= 4; t++) {
    const v = (max / 4) * t
    const y = yOf(v)
    svg.appendChild(sv('line', { x1: padL, x2: w - padR, y1: y, y2: y, stroke: 'var(--grid)', 'stroke-width': 1 }))
    const label = sv('text', { x: padL - 8, y: y + 3.5, 'text-anchor': 'end', class: 'ax' })
    label.textContent = opts.tick ? opts.tick(v) : fmt(v)
    svg.appendChild(label)
  }

  const band = plotW / xs.length
  const gap = 2
  const barW = Math.min(24, (band - 14) / series.length - gap)

  xs.forEach((xLabel, i) => {
    const x0 = padL + band * i + (band - (barW + gap) * series.length + gap) / 2
    series.forEach((se, j) => {
      const v = se.values[i] ?? 0
      const x = x0 + j * (barW + gap)
      const y = yOf(Math.max(0, v))
      const barH = Math.abs(yOf(v) - yOf(0))

      svg.appendChild(sv('path', {
        d: barPath(x, y, barW, Math.max(2, barH), 4, 'v'),
        fill: se.color ?? (PAL[j % 4] as string),
      }))

      const hit = sv('rect', { x: x - 3, y: padT, width: barW + 6, height: plotH, fill: 'transparent' })
      hit.addEventListener('mousemove', (ev) => {
        const r = box.getBoundingClientRect()
        show(`<b>${xLabel}</b><br><span class="k">${se.name}:</span> ${fmtV(v)}`,
          ev.clientX - r.left, ev.clientY - r.top)
      })
      hit.addEventListener('mouseleave', hide)
      svg.appendChild(hit)
    })

    const label = sv('text', { x: padL + band * i + band / 2, y: h - padB + 16, 'text-anchor': 'middle', class: 'ax' })
    label.textContent = xLabel
    svg.appendChild(label)
  })

  svg.appendChild(sv('line', {
    x1: padL, x2: w - padR, y1: yOf(0), y2: yOf(0), stroke: 'var(--bd2)', 'stroke-width': 1,
  }))
  box.appendChild(svg)
  return { box }
}

/* ---------- Линии с маркерами ---------- */

export interface LineOptions {
  series: Series[]
  xLabels: string[]
  fmt?: Formatter
  tick?: Formatter
  max?: number
  min?: number
  h?: number
}

export function lineC(parent: HTMLElement, opts: LineOptions): { box: HTMLDivElement } {
  const { series, xLabels: xs } = opts
  const fmtV: Formatter = opts.fmt ?? ((v) => fmt(v))

  if (series.length > 1) {
    legend(parent, series.map((s, i) => ({ name: s.name, color: s.color ?? (PAL[i % 4] as string) })))
  }

  const w = 640
  const h = opts.h ?? 220
  const padL = 60
  const padB = 30
  const padT = 14
  const padR = 64

  const { box, show, hide } = chartBox(parent)
  const svg = sv('svg', { viewBox: `0 0 ${w} ${h}` })

  const all = series.flatMap((s) => s.values).filter((v): v is number => v != null)
  const rawMax = Math.max(...all)
  const rawMin = Math.min(0, ...all)
  const max = opts.max ?? (rawMax * 1.1 || 1)
  const min = opts.min ?? rawMin

  const plotH = h - padB - padT
  const plotW = w - padL - padR
  const yOf = (v: number) => padT + plotH - ((v - min) / (max - min)) * plotH
  const xOf = (i: number) => padL + (xs.length === 1 ? plotW / 2 : (plotW / (xs.length - 1)) * i)

  for (let t = 0; t <= 4; t++) {
    const v = min + ((max - min) / 4) * t
    const y = yOf(v)
    svg.appendChild(sv('line', { x1: padL, x2: w - padR, y1: y, y2: y, stroke: 'var(--grid)', 'stroke-width': 1 }))
    const label = sv('text', { x: padL - 8, y: y + 3.5, 'text-anchor': 'end', class: 'ax' })
    label.textContent = opts.tick ? opts.tick(v) : fmt(v)
    svg.appendChild(label)
  }

  xs.forEach((xLabel, i) => {
    const label = sv('text', { x: xOf(i), y: h - padB + 16, 'text-anchor': 'middle', class: 'ax' })
    label.textContent = xLabel
    svg.appendChild(label)
  })

  /* Подписи у конца линий: пропускаем те, что налезли бы друг на друга —
     идентичность всё равно несёт легенда. */
  const usedLabelY: number[] = []

  series.forEach((se, j) => {
    const color = se.color ?? (PAL[j % 4] as string)
    const points: [number, number][] = []
    se.values.forEach((v, i) => { if (v != null) points.push([xOf(i), yOf(v)]) })
    if (!points.length) return

    const d = 'M' + points.map((p) => p.join(',')).join(' L')
    svg.appendChild(sv('path', {
      d,
      fill: 'none',
      stroke: color,
      'stroke-width': 2,
      'stroke-dasharray': se.dash ? '5 4' : null,
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round',
    }))

    const last = points[points.length - 1] as [number, number]
    if (series.length <= 4 && !usedLabelY.some((y) => Math.abs(y - last[1]) < 13)) {
      usedLabelY.push(last[1])
      const label = sv('text', { x: last[0] + 10, y: last[1] + 4, class: 'vl' })
      label.textContent = se.name
      svg.appendChild(label)
    }

    se.values.forEach((v, i) => {
      if (v == null) return
      svg.appendChild(sv('circle', {
        cx: xOf(i), cy: yOf(v), r: 4.5, fill: color, stroke: 'var(--panel2)', 'stroke-width': 2,
      }))
    })
  })

  /* Перекрестие: одна вертикаль на все серии. */
  const cross = sv('line', {
    x1: 0, x2: 0, y1: padT, y2: padT + plotH, stroke: 'var(--bd2)', 'stroke-width': 1, opacity: 0,
  })
  svg.appendChild(cross)

  const hit = sv('rect', { x: padL, y: padT, width: plotW, height: plotH, fill: 'transparent' })
  hit.addEventListener('mousemove', (ev) => {
    const r = box.getBoundingClientRect()
    const rel = ((ev.clientX - r.left) / r.width) * w
    let i = Math.round((rel - padL) / (plotW / Math.max(1, xs.length - 1)))
    i = Math.max(0, Math.min(xs.length - 1, i))

    cross.setAttribute('x1', String(xOf(i)))
    cross.setAttribute('x2', String(xOf(i)))
    cross.setAttribute('opacity', '1')

    const rows = series
      .map((se) => {
        const v = se.values[i]
        return `<span class="k">${se.name}:</span> ` + (v == null ? '—' : fmtV(v))
      })
      .join('<br>')
    show(`<b>${xs[i]}</b><br>${rows}`, ev.clientX - r.left, ev.clientY - r.top)
  })
  hit.addEventListener('mouseleave', () => { hide(); cross.setAttribute('opacity', '0') })
  svg.appendChild(hit)

  box.appendChild(svg)
  return { box }
}

/* ---------- Одна составная полоса: part-to-whole ---------- */

export interface StackSegment {
  name: string
  value: number
  color?: string
}

export interface StackRowOptions {
  segments: StackSegment[]
  fmt?: Formatter
  h?: number
}

export function stackRow(parent: HTMLElement, opts: StackRowOptions): { box: HTMLDivElement } {
  const segs = opts.segments
  const total = segs.reduce((sum, s) => sum + Math.abs(s.value), 0) || 1
  const fmtV: Formatter = opts.fmt ?? ((v) => fmt(v))

  const { box, show, hide } = chartBox(parent)
  const w = 640
  const h = opts.h ?? 34
  const svg = sv('svg', { viewBox: `0 0 ${w} ${h}` })

  let x = 0
  segs.forEach((seg, i) => {
    const segW = Math.max(2, (Math.abs(seg.value) / total) * w - 2)
    const rect = sv('rect', {
      x, y: 0, width: segW, height: h - 12, rx: 3, fill: seg.color ?? (PAL[i % 4] as string),
    })
    svg.appendChild(rect)

    // подпись помещается не всегда — рисуем только там, где не сольётся
    if (segW > 46) {
      const label = sv('text', { x: x + segW / 2, y: h - 2, 'text-anchor': 'middle', class: 'ax' })
      label.textContent = pct((Math.abs(seg.value) / total) * 100, 0)
      svg.appendChild(label)
    }

    rect.addEventListener('mousemove', (ev) => {
      const r = box.getBoundingClientRect()
      show(
        `<b>${seg.name}</b><br>${fmtV(seg.value)}`
        + `<br><span class="k">доля ${pct((Math.abs(seg.value) / total) * 100, 1)}</span>`,
        ev.clientX - r.left, ev.clientY - r.top,
      )
    })
    rect.addEventListener('mouseleave', hide)
    x += segW + 2
  })

  box.appendChild(svg)
  legend(parent, segs.map((seg, i) => ({ name: seg.name, color: seg.color ?? (PAL[i % 4] as string) })))
  return { box }
}
