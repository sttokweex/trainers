/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const gitGraph: LegacyDemo = root => {
  const body = dShell(root, 'Merge против rebase')
  const stage = dEl('div', 'gr')
  stage.style.height = '170px'
  body.appendChild(stage)
  const info = dEl('div', 'el-step')
  body.appendChild(info)

  function node(x, y, label, cls) {
    const n = dEl('div', 'gr-n' + (cls ? ' ' + cls : ''), label)
    n.style.left = x + 'px'; n.style.top = y + 'px'
    n.style.width = '30px'; n.style.height = '30px'; n.style.margin = '-15px 0 0 -15px'
    n.style.fontSize = '11px'
    stage.appendChild(n)
  }
  function edge(x1, y1, x2, y2, act) {
    const e = dEl('div', 'gr-e' + (act ? ' act' : ''))
    e.style.left = x1 + 'px'; e.style.top = y1 + 'px'
    e.style.width = Math.hypot(x2 - x1, y2 - y1) + 'px'
    e.style.transform = 'rotate(' + Math.atan2(y2 - y1, x2 - x1) + 'rad)'
    stage.appendChild(e)
  }
  function draw(kind) {
    stage.innerHTML = ''
    if (kind === 'before') {
      edge(50, 50, 130, 50); edge(130, 50, 210, 50)
      edge(130, 50, 210, 120); edge(210, 120, 290, 120)
      node(50, 50, 'A'); node(130, 50, 'B'); node(210, 50, 'C', 'v')
      node(210, 120, 'X', 'q'); node(290, 120, 'Y', 'q')
      info.innerHTML = '<span class="el-phase sync">исходно</span>main ушёл вперёд (коммит C), пока вы делали X и Y в своей ветке.'
    } else if (kind === 'merge') {
      edge(50, 50, 130, 50); edge(130, 50, 210, 50); edge(210, 50, 370, 50, true)
      edge(130, 50, 210, 120); edge(210, 120, 290, 120); edge(290, 120, 370, 50, true)
      node(50, 50, 'A'); node(130, 50, 'B'); node(210, 50, 'C', 'v')
      node(210, 120, 'X', 'q'); node(290, 120, 'Y', 'q'); node(370, 50, 'M', 'cur')
      info.innerHTML = '<span class="el-phase macro">merge</span>Добавился <b>merge-коммит M</b> с двумя родителями. История ветвистая, но <b>ничего не переписано</b> — безопасно для общих веток.'
    } else {
      edge(50, 50, 130, 50); edge(130, 50, 210, 50); edge(210, 50, 290, 50, true); edge(290, 50, 370, 50, true)
      node(50, 50, 'A'); node(130, 50, 'B'); node(210, 50, 'C', 'v')
      node(290, 50, "X'", 'cur'); node(370, 50, "Y'", 'cur')
      info.innerHTML = '<span class="el-phase micro">rebase</span>Коммиты <b>пересозданы</b> поверх C — обратите внимание на штрихи: X′ и Y′ это <b>новые коммиты с новыми хешами</b>. История линейная, но старые X и Y больше не существуют — поэтому так нельзя делать с ветками, которые уже кто-то забрал.'
    }
  }
  const ctl = dEl('div', 'demo-ctl')
  ctl.appendChild(dBtn('Исходно', 'sm', () => draw('before')))
  ctl.appendChild(dBtn('git merge main', 'pri', () => draw('merge')))
  ctl.appendChild(dBtn('git rebase main', null, () => draw('rebase')))
  body.appendChild(ctl)
  body.appendChild(dEl('div', 'demo-note',
    'Золотое правило: <b>не переписывайте историю, которую уже кто-то мог забрать.</b> Если всё же надо — <code>push --force-with-lease</code>, а не <code>--force</code>.'))
  draw('before')
}
