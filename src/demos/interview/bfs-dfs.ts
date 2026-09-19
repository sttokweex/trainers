/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const bfsDfs: LegacyDemo = root => {
  const body = dShell(root, 'BFS против DFS на одном графе')
  const NODES = { A: [60, 40], B: [180, 30], C: [180, 110], D: [300, 25], E: [300, 90], F: [420, 60] }
  const EDGES = { A: ['B', 'C'], B: ['D', 'E'], C: ['E'], D: ['F'], E: ['F'], F: [] }

  const stage = dEl('div', 'gr')
  body.appendChild(stage)
  const nodeEls = {}
  Object.entries(EDGES).forEach(([from, tos]) => tos.forEach(to => {
    const [x1, y1] = NODES[from], [x2, y2] = NODES[to]
    const e = dEl('div', 'gr-e')
    const len = Math.hypot(x2 - x1, y2 - y1)
    e.style.left = x1 + 'px'; e.style.top = y1 + 'px'; e.style.width = len + 'px'
    e.style.transform = 'rotate(' + Math.atan2(y2 - y1, x2 - x1) + 'rad)'
    stage.appendChild(e)
  }))
  Object.entries(NODES).forEach(([name, [x, y]]) => {
    const n = dEl('div', 'gr-n', name)
    n.style.left = x + 'px'; n.style.top = y + 'px'
    stage.appendChild(n)
    nodeEls[name] = n
  })

  const info = dEl('div', 'el-step')
  body.appendChild(info)
  let timer = null

  function reset() {
    clearInterval(timer); timer = null
    Object.values(nodeEls).forEach(n => n.className = 'gr-n')
    info.innerHTML = 'Выберите обход. Цель — дойти до <b>F</b>.'
  }
  function run(kind) {
    reset()
    const coll = ['A']                       // очередь для BFS, стек для DFS
    const visited = new Set(['A'])
    const order = []
    timer = setInterval(() => {
      if (!coll.length) {
        clearInterval(timer); timer = null
        info.innerHTML = '<span class="el-phase end">готово</span>Порядок ' + kind.toUpperCase() + ': ' + order.join(' → ')
        return
      }
      const cur = kind === 'bfs' ? coll.shift() : coll.pop()
      order.push(cur)
      Object.values(nodeEls).forEach(n => n.classList.remove('cur'))
      nodeEls[cur].className = 'gr-n v cur'
      for (const nx of EDGES[cur]) {
        if (visited.has(nx)) continue
        visited.add(nx)
        coll.push(nx)
        if (!nodeEls[nx].classList.contains('v')) nodeEls[nx].className = 'gr-n q'
      }
      info.innerHTML = '<span class="el-phase ' + (kind === 'bfs' ? 'micro' : 'macro') + '">' +
        (kind === 'bfs' ? 'очередь FIFO' : 'стек LIFO') + '</span>' +
        'Обрабатываем <b>' + cur + '</b>. Ожидают: [' + coll.join(', ') + ']. Пройдено: ' + order.join(' → ')
    }, 900)
  }
  const ctl = dEl('div', 'demo-ctl')
  ctl.appendChild(dBtn('BFS (по слоям)', 'pri', () => run('bfs')))
  ctl.appendChild(dBtn('DFS (вглубь)', null, () => run('dfs')))
  ctl.appendChild(dBtn('⟲', 'sm', reset))
  body.appendChild(ctl)
  body.appendChild(dEl('div', 'demo-note',
    'Разница только в том, с какого конца берут элемент: <b>shift</b> даёт обход по слоям и кратчайший путь, <b>pop</b> — уход вглубь.'))
  reset()
}
