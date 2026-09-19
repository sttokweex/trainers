/**
 * Императивные DOM-хелперы, на которых построены перенесённые демо.
 * Пока демо не переписаны в React, это их единственный способ строить разметку.
 */

export function dEl<K extends keyof HTMLElementTagNameMap>(
  tag: K, cls?: string | null, html?: string | null,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (cls) node.className = cls
  if (html != null) node.innerHTML = html
  return node
}

export function dBtn(label: string, cls?: string | null, onClick?: () => void): HTMLButtonElement {
  const b = dEl('button', 'demo-b' + (cls ? ' ' + cls : ''), label)
  b.type = 'button'
  if (onClick) b.onclick = onClick
  return b
}

/** Оборачивает контейнер в карточку демо и возвращает узел для содержимого. */
export function dShell(root: HTMLElement, title: string): HTMLDivElement {
  root.classList.add('demo')
  root.appendChild(dEl('div', 'demo-t', title))
  const body = dEl('div')
  root.appendChild(body)
  return body
}

export interface FieldOptions {
  type?: string
  step?: string | number
  min?: string | number
  max?: string | number
  unit?: string
}

/** Поле ввода: возвращает сам input, чтобы дальше читать значение. */
export function dField(
  parent: HTMLElement, label: string, value: string | number, opts: FieldOptions = {},
): HTMLInputElement {
  const row = dEl('div', 'fld')
  row.appendChild(dEl('label', null, label))

  const inp = document.createElement('input')
  inp.type = opts.type ?? 'number'
  inp.value = String(value)
  if (opts.step != null) inp.step = String(opts.step)
  if (opts.min != null) inp.min = String(opts.min)
  if (opts.max != null) inp.max = String(opts.max)
  row.appendChild(inp)

  if (opts.unit) row.appendChild(dEl('span', 'u', opts.unit))
  parent.appendChild(row)
  return inp
}

/** Вариант списка: либо готовая пара, либо просто строка. */
export type SelectOption = { v: string | number; t: string } | string

export function dSelect(
  parent: HTMLElement, label: string, options: SelectOption[], value?: string | number | null,
): HTMLSelectElement {
  const row = dEl('div', 'fld')
  row.appendChild(dEl('label', null, label))

  const sel = document.createElement('select')
  for (const o of options) {
    const op = document.createElement('option')
    op.value = String(typeof o === 'string' ? o : o.v)
    op.textContent = String(typeof o === 'string' ? o : o.t)
    sel.appendChild(op)
  }
  if (value != null) sel.value = String(value)

  row.appendChild(sel)
  parent.appendChild(row)
  return sel
}

export function dRange(
  parent: HTMLElement, label: string,
  value: number, min: number, max: number, step: number,
  render?: (v: number) => string,
): HTMLInputElement {
  const row = dEl('div', 'fld')
  row.appendChild(dEl('label', null, label))

  const inp = document.createElement('input')
  inp.type = 'range'
  inp.min = String(min)
  inp.max = String(max)
  inp.step = String(step)
  inp.value = String(value)

  const out = dEl('span', 'rv', render ? render(value) : String(value))
  inp.addEventListener('input', () => {
    out.textContent = render ? render(+inp.value) : inp.value
  })

  row.appendChild(inp)
  row.appendChild(out)
  parent.appendChild(row)
  return inp
}

export interface KpiHandle {
  /** Обновляет значение плитки; cls меняет цветовую пометку. */
  set(value: string, hint?: string | null, cls?: string): void
  node: HTMLDivElement
}

/** Плитка-метрика: крупное число с подписью и пояснением. */
export function kpi(
  parent: HTMLElement, label: string, value: string, hint?: string, cls?: string,
): KpiHandle {
  const box = dEl('div', 'kpi' + (cls ? ' ' + cls : ''))
  box.appendChild(dEl('div', 'l', label))
  const valueNode = dEl('div', 'v', value)
  box.appendChild(valueNode)
  const hintNode = dEl('div', 'h', hint ?? '')
  box.appendChild(hintNode)
  parent.appendChild(box)

  return {
    set(val, hnt, c) {
      valueNode.innerHTML = val
      if (hnt != null) hintNode.innerHTML = hnt
      if (c) box.className = 'kpi ' + c
    },
    node: box,
  }
}
