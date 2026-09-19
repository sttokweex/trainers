/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const stackingContext: LegacyDemo = root => {
  const body = dShell(root, 'Почему z-index: 9999 не помогает')
  const stage = dEl('div', 'zi-stage')
  const parent = dEl('div', 'zi-p', 'родитель<br>.parent')
  const child = dEl('div', 'zi-c', 'потомок<br>z-index: 9999')
  parent.appendChild(child)
  const sib = dEl('div', 'zi-sib', 'сосед<br>z-index: 1')
  stage.appendChild(parent)
  stage.appendChild(sib)
  body.appendChild(stage)
  const info = dEl('div', 'el-step')
  body.appendChild(info)

  let on = false
  function apply() {
    parent.style.transform = on ? 'translateZ(0)' : ''
    info.innerHTML = on
      ? '<span class="el-phase macro">transform включён</span>Родитель создал <b>новый контекст наложения</b>. Теперь z-index потомка действует только ВНУТРИ родителя, и весь родитель целиком уходит под соседа — хотя у потомка 9999, а у соседа 1.'
      : '<span class="el-phase sync">transform выключен</span>Родитель не создаёт контекста, потомок сравнивается с соседом напрямую и с z-index 9999 лежит сверху.'
    btn.textContent = on ? 'Убрать transform у родителя' : 'Добавить transform родителю'
  }
  const ctl = dEl('div', 'demo-ctl')
  const btn = dBtn('', 'pri', () => { on = !on; apply() })
  ctl.appendChild(btn)
  body.appendChild(ctl)
  body.appendChild(dEl('div', 'demo-note',
    'Новый контекст создают также <b>opacity &lt; 1</b>, filter, will-change, isolation: isolate и position + z-index. ' +
    'Радикальное лечение для модалок и тултипов — портал в body.'))
  apply()
}
