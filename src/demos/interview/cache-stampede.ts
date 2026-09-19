/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const cacheStampede: LegacyDemo = root => {
  const body = dShell(root, 'Cache stampede и single-flight')
  const grid = dEl('div', 'arr')
  const info = dEl('div', 'el-step', 'Кеш только что протух, и прилетело 30 запросов одновременно.')
  body.appendChild(grid)
  body.appendChild(info)

  function run(guard) {
    grid.innerHTML = ''
    const N = 30
    for (let i = 0; i < N; i++) {
      const c = dEl('div', 'arr-c')
      c.style.minWidth = '16px'; c.style.padding = '9px 3px'
      c.className = 'arr-c ' + (guard && i > 0 ? 'win' : 'dup')
      grid.appendChild(c)
    }
    info.innerHTML = guard
      ? '<span class="el-phase micro">single-flight</span>В базу идёт <b>1 запрос</b>, остальные 29 подписываются на тот же промис и получают его результат. Нагрузка на БД не меняется в момент протухания.'
      : '<span class="el-phase macro">stampede</span>Все <b>30 запросов</b> промахнулись и пошли в базу одновременно. На популярном ключе это сотни запросов в момент пиковой нагрузки — так базы и ложатся.'
  }
  const ctl = dEl('div', 'demo-ctl')
  ctl.appendChild(dBtn('Без защиты', null, () => run(false)))
  ctl.appendChild(dBtn('С single-flight', 'pri', () => run(true)))
  body.appendChild(ctl)
  body.appendChild(dEl('div', 'demo-note',
    'Другие средства: <b>stale-while-revalidate</b> (отдать протухшее и обновить фоном) и <b>jitter в TTL</b>, чтобы тысячи ключей не протухали в одну секунду.'))
  run(false)
}
