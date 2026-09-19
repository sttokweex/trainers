/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const fsdLayers: LegacyDemo = root => {
  const body = dShell(root, 'FSD: кто кого может импортировать')
  const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared']
  const DESC = {
    app: 'инициализация: провайдеры, роутер, глобальные стили',
    pages: 'страницы — композиция виджетов под маршрут',
    widgets: 'самостоятельные блоки UI: Header, TaskBoard',
    features: 'действия пользователя: ToggleTask, Login',
    entities: 'бизнес-сущности: Task, User — типы, карточка, запросы',
    shared: 'без бизнес-смысла: ui-kit, api-клиент, хелперы',
  }
  const row = dEl('div', 'rp')
  row.style.flexDirection = 'column'
  const els = LAYERS.map((l, i) => {
    const e = dEl('div', 'rp-s', '<b>' + l + '</b>' + DESC[l])
    e.style.cursor = 'pointer'
    e.style.textAlign = 'left'
    e.onclick = () => pick(i)
    row.appendChild(e)
    return e
  })
  body.appendChild(row)
  const info = dEl('div', 'el-step', 'Нажмите на слой.')
  body.appendChild(info)

  function pick(i) {
    els.forEach((e, k) => {
      e.className = 'rp-s'
      if (k === i) e.classList.add('on', 'mid')
      else if (k > i) e.classList.add('on', 'cheap')
    })
    const allowed = LAYERS.slice(i + 1)
    info.innerHTML = '<span class="el-phase sync">' + LAYERS[i] + '</span>' +
      (allowed.length
        ? 'Может импортировать только: <b style="color:var(--grn)">' + allowed.join(', ') + '</b>. ' +
          'Всё, что выше — запрещено. Соседние слайсы того же слоя — тоже запрещены.'
        : '<b>shared не знает ни о ком.</b> Здесь не может встречаться слово «task» — иначе это уже entities.')
  }
  body.appendChild(dEl('div', 'demo-note',
    'Циклические зависимости при таком правиле <b>невозможны по конструкции</b>. Проверяется линтером — без автоматики соглашение размывается за пару спринтов.'))
  pick(3)
}
