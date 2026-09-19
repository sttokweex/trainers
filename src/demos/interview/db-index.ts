/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const dbIndex: LegacyDemo = root => {
  const body = dShell(root, 'Seq Scan против Index Scan')
  const info = dEl('div', 'el-step', 'Таблица на 1 000 000 строк, ищем одну запись по email.')
  const bar = dEl('div')
  body.appendChild(bar)
  body.appendChild(info)

  function run(kind) {
    const rows = 1000000
    const reads = kind === 'seq' ? rows : Math.ceil(Math.log2(rows))
    const ms = kind === 'seq' ? 480 : 1
    bar.innerHTML = ''
    const tracks = [['Seq Scan', kind === 'seq'], ['Index Scan', kind !== 'seq']]
    tracks.forEach(([label, active]) => {
      const r = dEl('div', 'pb')
      r.appendChild(dEl('div', 'pb-lbl', label))
      const t = dEl('div', 'pb-track')
      const f = dEl('div', 'pb-fill ' + (label === 'Seq Scan' ? 'err' : 'ok'))
      t.appendChild(f); r.appendChild(t)
      const st = dEl('div', 'pb-st', '')
      r.appendChild(st); bar.appendChild(r)
      if (!active) { f.style.width = '0'; st.textContent = '—'; return }
      const dur = label === 'Seq Scan' ? 2000 : 220
      f.style.transition = 'none'; f.style.width = '0'
      requestAnimationFrame(() => { f.style.transition = 'width ' + dur + 'ms linear'; f.style.width = '100%' })
      setTimeout(() => { st.textContent = ms + 'мс'; st.style.color = label === 'Seq Scan' ? 'var(--red)' : 'var(--grn)' }, dur)
    })
    info.innerHTML = kind === 'seq'
      ? '<span class="el-phase macro">без индекса</span>База читает <b>все ' + rows.toLocaleString('ru') + ' строк</b> и сравнивает каждую. Сложность O(n), время растёт вместе с таблицей.'
      : '<span class="el-phase micro">по индексу</span>B-tree: спускаемся по дереву, <b>' + reads + ' сравнений</b> вместо миллиона. O(log n) — при росте таблицы вдесятеро добавится всего 3 шага.'
  }
  const ctl = dEl('div', 'demo-ctl')
  ctl.appendChild(dBtn('WHERE email = … без индекса', null, () => run('seq')))
  ctl.appendChild(dBtn('… с индексом', 'pri', () => run('idx')))
  body.appendChild(ctl)
  body.appendChild(dEl('div', 'demo-note',
    'Но индекс не бесплатен: он <b>замедляет запись</b> (каждый INSERT обновляет все индексы) и занимает место. ' +
    'И он не сработает при <code>LOWER(email) = …</code> или <code>LIKE &#39;%текст&#39;</code>.'))
  run('idx')
}
