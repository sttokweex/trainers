/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const nestLifecycle: LegacyDemo = root => {
  const body = dShell(root, 'Путь запроса через NestJS')
  const CHAIN = [
    ['Middleware', 'уровень Express/Fastify: есть req, res, next. Логирование, cookie-parser, raw body'],
    ['Guard', 'можно ли выполнять? Знает контроллер и метод, читает @Roles через Reflector'],
    ['Interceptor ↓', 'код ДО обработчика: замер времени, проверка кеша'],
    ['Pipe', 'валидация и преобразование аргументов: ValidationPipe, ParseIntPipe'],
    ['Handler', 'метод контроллера → сервис → репозиторий'],
    ['Interceptor ↑', 'код ПОСЛЕ: формат ответа, timeout, сериализация'],
    ['Filter', 'исключение → HTTP-ответ единого формата'],
  ]
  const row = dEl('div', 'rp')
  const els = CHAIN.map(([n]) => { const e = dEl('div', 'rp-s', '<b>' + n + '</b>'); row.appendChild(e); return e })
  body.appendChild(row)
  const info = dEl('div', 'el-step', 'Запустите проход или нажмите на этап.')
  body.appendChild(info)

  let timer = null
  function highlight(i, extra) {
    els.forEach((e, k) => e.className = 'rp-s' + (k === i ? ' on cheap' : k < i ? ' on mid' : ''))
    info.innerHTML = '<span class="el-phase sync">' + CHAIN[i][0] + '</span>' + CHAIN[i][1] + (extra || '')
  }
  els.forEach((e, i) => { e.style.cursor = 'pointer'; e.onclick = () => { stop(); highlight(i) } })

  function stop() { clearInterval(timer); timer = null; play.textContent = '▶ Провести запрос' }
  const ctl = dEl('div', 'demo-ctl')
  const play = dBtn('▶ Провести запрос', 'pri', () => {
    if (timer) return stop()
    let i = 0
    play.textContent = '⏸ Пауза'
    highlight(0)
    timer = setInterval(() => {
      i++
      if (i >= CHAIN.length) { stop(); return }
      highlight(i)
    }, 1100)
  })
  ctl.appendChild(play)
  ctl.appendChild(dBtn('Ошибка в сервисе', null, () => {
    stop()
    els.forEach((e, k) => e.className = 'rp-s' + (k === 6 ? ' on' : k < 5 ? ' on mid' : ''))
    info.innerHTML = '<span class="el-phase macro">исключение</span>Обработчик бросил ошибку → интерцепторы «после» пропускаются, управление сразу уходит в <b>Exception filter</b>, который превращает исключение в ответ.'
  }))
  body.appendChild(ctl)
  body.appendChild(dEl('div', 'demo-note',
    'На каждом уровне порядок применения: <b>глобальные → контроллера → метода</b>. Pipes идут ПОСЛЕ guards — незачем валидировать тело от того, кому сюда нельзя.'))
  highlight(0)
}
