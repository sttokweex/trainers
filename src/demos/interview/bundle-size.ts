/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const bundleSize: LegacyDemo = root => {
  const body = dShell(root, 'Сколько весит зависимость')
  const LIB = [
    ['moment', 72, 'устарел: мутабельный, тянет локали, в режиме поддержки', 'date-fns (модульно, ~2-10 КБ) или Temporal'],
    ['lodash (целиком)', 71, 'import _ from "lodash" тянет всё', 'lodash/debounce — ~2 КБ, или нативные аналоги'],
    ['axios', 13, 'удобно, но почти всё умеет fetch', 'fetch + обёртка на 20 строк'],
    ['date-fns (одна функция)', 3, 'модульная, tree-shakeable', '—'],
    ['clsx', 0.5, 'склейка классов', '—'],
    ['zustand', 1.2, 'менеджер состояния целиком', '—'],
  ]
  const max = 72
  const list = dEl('div')
  body.appendChild(list)
  const info = dEl('div', 'el-step', 'Нажмите на библиотеку.')
  body.appendChild(info)
  LIB.forEach(([name, kb, why, alt]) => {
    const r = dEl('div', 'pb')
    r.style.cursor = 'pointer'
    r.appendChild(dEl('div', 'pb-lbl', name))
    const t = dEl('div', 'pb-track')
    const f = dEl('div', 'pb-fill ' + (kb > 20 ? 'err' : 'ok'))
    f.style.width = Math.max(2, kb / max * 100) + '%'
    t.appendChild(f); r.appendChild(t)
    r.appendChild(dEl('div', 'pb-st', kb + ' КБ'))
    r.onclick = () => {
      info.innerHTML = '<span class="el-phase ' + (kb > 20 ? 'macro' : 'micro') + '">' + name + ' · ' + kb + ' КБ</span>' +
        why + (alt !== '—' ? '<br><b style="color:var(--grn)">Чем заменить:</b> ' + alt : '')
    }
    list.appendChild(r)
  })
  body.appendChild(dEl('div', 'demo-note',
    'Размеры в min+gzip, приблизительно. Проверять — на <b>bundlephobia</b> до установки, а уже собранный бандл — через <code>rollup-plugin-visualizer</code>.'))
}
