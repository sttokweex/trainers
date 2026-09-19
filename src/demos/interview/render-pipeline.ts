/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const renderPipeline: LegacyDemo = root => {
  const body = dShell(root, 'Что запускает свойство CSS')
  const PROPS = [
    ['width / height', 3, 'меняет геометрию → пересчёт раскладки всей страницы'],
    ['top / left / margin', 3, 'позиция в потоке → полный reflow'],
    ['font-size', 3, 'меняет размеры текста → reflow'],
    ['background-color', 2, 'геометрия та же, нужна лишь перерисовка пикселей'],
    ['box-shadow', 2, 'только перерисовка'],
    ['color', 2, 'только перерисовка'],
    ['transform', 1, 'обрабатывается на GPU при композитинге — главный поток свободен'],
    ['opacity', 1, 'то же самое — идеально для анимации'],
  ]
  const stages = [['Style', 'пересчёт стилей'], ['Layout', 'геометрия'], ['Paint', 'пиксели'], ['Composite', 'слои на GPU']]
  const row = dEl('div', 'rp')
  const stEls = stages.map(([n, d]) => {
    const e = dEl('div', 'rp-s', '<b>' + n + '</b>' + d)
    row.appendChild(e); return e
  })
  body.appendChild(row)
  const info = dEl('div', 'el-step', 'Выберите свойство.')
  body.appendChild(info)

  function show(level, note, name) {
    // level: 3 = layout+paint+composite, 2 = paint+composite, 1 = только composite
    stEls.forEach((e, i) => {
      e.className = 'rp-s'
      if (i === 0) e.classList.add('on', 'mid')
      if (i === 1 && level >= 3) e.classList.add('on')
      if (i === 2 && level >= 2) e.classList.add('on', level >= 3 ? '' : 'mid')
      if (i === 3) e.classList.add('on', 'cheap')
    })
    const cost = level === 3 ? ['дорого', 'var(--red)'] : level === 2 ? ['средне', 'var(--yel)'] : ['дёшево', 'var(--grn)']
    info.innerHTML = '<b style="color:' + cost[1] + '">' + name + ' — ' + cost[0] + '.</b> ' + note
  }
  const ctl = dEl('div', 'demo-ctl')
  PROPS.forEach(([name, lvl, note]) =>
    ctl.appendChild(dBtn(name, lvl === 1 ? 'pri' : null, () => show(lvl, note, name))))
  body.appendChild(ctl)
  body.appendChild(dEl('div', 'demo-note',
    'На 60 fps у браузера <b>16.6 мс на кадр</b>. Анимация через transform и opacity не трогает главный поток и остаётся плавной даже при загруженном JS.'))
  show(1, PROPS[6][2], 'transform')
}
