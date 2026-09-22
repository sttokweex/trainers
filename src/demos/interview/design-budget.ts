/* eslint-disable */
// @ts-nocheck — мини-планировщик системного дизайна
import type { LegacyDemo } from '@/engine/types'
import { dBtn, dEl, dField, dShell } from '@/demos/helpers'

export const designBudget: LegacyDemo = root => {
  const body = dShell(root, 'System design: нагрузка и запас')
  const intro = dEl('div', 'demo-note', 'Меняйте допущения и объясняйте, почему запас и отказ одного узла входят в расчёт.')
  body.appendChild(intro)
  const grid = dEl('div', 'fx-ctl')
  const rps = dField(grid, 'Пиковый RPS', 1200, { min: 1, step: 50, unit: 'req/s' })
  const cap = dField(grid, 'Ёмкость экземпляра', 250, { min: 1, step: 10, unit: 'req/s' })
  const reserve = dField(grid, 'Запас', 30, { min: 0, max: 200, step: 5, unit: '%' })
  body.appendChild(grid)
  const out = dEl('div', 'sp-out')
  body.appendChild(out)
  const note = dEl('div', 'demo-note')
  body.appendChild(note)
  const draw = () => {
    const target = +rps.value * (1 + +reserve.value / 100)
    const instances = Math.ceil(target / Math.max(1, +cap.value))
    const k = Math.max(2, instances + 1)
    out.innerHTML = '<div class="sp-cell"><div class="n">' + Math.round(target) + '</div><div class="l">RPS с запасом</div></div>' +
      '<div class="sp-cell"><div class="n">' + instances + '</div><div class="l">экземпляров</div></div>' +
      '<div class="sp-cell"><div class="n">' + k + '</div><div class="l">с отказом одного</div></div>'
    note.innerHTML = 'Формула: <code class="i">ceil(RPS × (1 + запас) / capacity)</code>. Назовите, где ещё появятся bottleneck: база, очередь, сеть и лимиты внешнего API.'
  }
  ;[rps, cap, reserve].forEach(x => x.oninput = draw)
  body.appendChild(dBtn('↺ Вернуть пример', 'sm', () => { rps.value = '1200'; cap.value = '250'; reserve.value = '30'; draw() }))
  draw()
}
