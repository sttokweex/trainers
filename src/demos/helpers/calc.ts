import { dEl, dShell } from './dom'

export interface CalcParts {
  body: HTMLDivElement
  /** Куда складывать поля ввода. */
  form: HTMLDivElement
  /** Куда рисовать результат — очищается и наполняется заново при каждом пересчёте. */
  out: HTMLDivElement
}

/** Каркас калькулятора: заголовок, пояснение, форма и область вывода. */
export function calcShell(root: HTMLElement, title: string, intro?: string): CalcParts {
  const body = dShell(root, title)
  if (intro) body.appendChild(dEl('div', 'demo-note', intro))

  const form = dEl('div')
  const out = dEl('div')
  body.appendChild(form)
  body.appendChild(out)
  return { body, form, out }
}

/**
 * Живой пересчёт: любое изменение поля внутри scope вызывает fn.
 * Вызывается сразу, чтобы результат был виден до первого ввода.
 */
export function bindAll(scope: HTMLElement, fn: () => void): void {
  scope.querySelectorAll('input,select').forEach((el) => {
    const node = el as HTMLInputElement | HTMLSelectElement
    node.oninput = fn
    node.onchange = fn
  })
  fn()
}
