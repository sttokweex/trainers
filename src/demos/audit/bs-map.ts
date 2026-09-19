import { BALANCE_LINES, SECTION_NAME, type BalanceLine } from '@/demos/helpers'
import { dEl, dShell } from '@/demos/helpers'
import type { LegacyDemo } from '@/engine/types'

/**
 * Карта баланса: клик по строке раскрывает, из каких счетов она собирается,
 * какими проводками наполняется и что по ней проверяет аудитор.
 */
export const bsMap: LegacyDemo = (root) => {
  const body = dShell(root, 'Карта баланса: что стоит за каждой строкой')
  body.appendChild(dEl('div', 'demo-note',
    'Кликните строку — увидите счета, типовые проводки, процедуры аудитора и частые ошибки. ' +
    'Это тот самый разбор «по каждой штуке баланса», который нужен, чтобы читать отчётность, а не смотреть на неё.'))

  const grid = dEl('div', 'bs-wrap')
  const nav = dEl('div', 'bs-nav')
  const panel = dEl('div', 'bs-panel')
  grid.appendChild(nav)
  grid.appendChild(panel)
  body.appendChild(grid)

  const sections = ['I', 'II', 'III', 'IV', 'V'] as const
  const buttons: Record<string, HTMLButtonElement> = {}

  for (const s of sections) {
    const lines = BALANCE_LINES.filter((l) => l.section === s)
    if (!lines.length) continue
    nav.appendChild(dEl('div', 'bs-sec', SECTION_NAME[s]))
    for (const line of lines) {
      const b = dEl('button', 'bs-line', '<b>' + line.code + '</b><span>' + line.name + '</span>')
      b.type = 'button'
      b.onclick = () => show(line)
      buttons[line.code] = b
      nav.appendChild(b)
    }
  }

  function show(line: BalanceLine): void {
    for (const b of Object.values(buttons)) b.classList.remove('on')
    buttons[line.code]?.classList.add('on')

    panel.innerHTML = ''
    panel.appendChild(dEl('div', 'bs-head',
      '<span class="bs-code">' + line.code + '</span>' +
      '<span class="bs-name">' + line.name + '</span>' +
      '<span class="chip ' + (line.side === 'A' ? 'num' : 'choice') + '">' +
      (line.side === 'A' ? 'актив' : 'пассив') + '</span>' +
      (line.std ? '<span class="chip lv">' + line.std + '</span>' : '')))

    panel.appendChild(dEl('p', 'bs-what', line.what))

    panel.appendChild(dEl('h6', null, 'Как собирается строка'))
    panel.appendChild(dEl('pre', null, line.formula))

    panel.appendChild(dEl('h6', null, 'Типовые проводки'))
    const tb = dEl('table', 'tbl')
    tb.innerHTML = '<tr><th>Дебет</th><th>Кредит</th><th>Операция</th></tr>' +
      line.entries.map((e) =>
        '<tr><td>' + (e.d || '—') + '</td><td>' + (e.k || '—') + '</td><td>' + e.t + '</td></tr>').join('')
    panel.appendChild(tb)

    panel.appendChild(dEl('h6', null, 'Что проверяет аудитор'))
    panel.appendChild(dEl('ul', null, line.checks.map((c) => '<li>' + c + '</li>').join('')))

    panel.appendChild(dEl('h6', null, 'Частые ошибки'))
    panel.appendChild(dEl('ul', 'bs-err', line.errors.map((c) => '<li>' + c + '</li>').join('')))
  }

  const first = BALANCE_LINES[0]
  if (first) show(first)
}
