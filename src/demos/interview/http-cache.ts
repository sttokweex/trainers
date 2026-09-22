/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const httpCache: LegacyDemo = root => {
  const body = dShell(root, 'Кеш браузера: 200, 304 или вообще без запроса')
  const info = dEl('div', 'pb-res wait', 'Нажмите «Загрузить страницу».')
  const log = dEl('div')
  body.appendChild(log)
  body.appendChild(info)
  let mode = 'nocache', visits = 0

  function visit() {
    visits++
    let line, cls
    if (mode === 'immutable') {
      if (visits === 1) { line = 'GET /app.a3f9.js → 200 OK · 180 КБ · 240мс'; cls = 'err' }
      else { line = '(из кеша) app.a3f9.js · 0 КБ · 0мс — запроса не было вообще'; cls = 'ok' }
    } else if (mode === 'etag') {
      if (visits === 1) { line = 'GET /api/config → 200 OK · 12 КБ · 90мс · ETag: "v7"'; cls = 'err' }
      else { line = 'GET /api/config (If-None-Match: "v7") → 304 Not Modified · 0 КБ · 60мс'; cls = 'ok' }
    } else {
      line = 'GET /index.html → 200 OK · 3 КБ · 80мс'; cls = 'err'
    }
    const row = dEl('div', 'demo-note', 'Заход ' + visits + ': ' + line)
    row.style.color = cls === 'ok' ? 'var(--grn)' : 'var(--mut)'
    log.appendChild(row)
    info.className = 'pb-res ' + (cls === 'ok' ? 'ok' : 'wait')
    info.innerHTML = mode === 'immutable'
      ? (visits === 1 ? 'Первый заход — качаем. Дальше файл считается вечно свежим.' : '<b>Свежесть:</b> браузер даже не спрашивает сервер. Это самый быстрый вариант — запроса нет. Работает, потому что при изменении файла меняется хеш в имени.')
      : mode === 'etag'
      ? (visits === 1 ? 'Первый заход — получили тело и ETag.' : '<b>Валидация:</b> запрос ушёл, но сервер ответил 304 без тела. Трафик сэкономлен, время round-trip — нет.')
      : 'Без кеширования каждый заход — полная загрузка.'
  }
  const ctl = dEl('div', 'demo-ctl')
  const modes = [['nocache', 'no-store'], ['etag', 'ETag + валидация'], ['immutable', 'max-age + immutable']]
  const btns = modes.map(([m, label]) => dBtn(label, m === 'nocache' ? 'pri' : null, () => {
    mode = m; visits = 0; log.innerHTML = ''
    btns.forEach((b, i) => b.className = 'demo-b' + (modes[i][0] === m ? ' pri' : ''))
    info.className = 'pb-res wait'; info.textContent = 'Режим выбран. Загрузите страницу несколько раз.'
  }))
  btns.forEach(b => ctl.appendChild(b))
  ctl.appendChild(dBtn('↻ Загрузить страницу', 'pri main-action', visit))
  body.appendChild(ctl)
  body.appendChild(dEl('div', 'demo-note',
    'Отсюда стратегия «двух скоростей»: <b>index.html</b> с no-cache (маленький, его не жалко проверять), <b>app.хеш.js</b> с immutable на год.'))
}
