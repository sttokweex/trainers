/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const queryCache: LegacyDemo = root => {
  const body = dShell(root, 'staleTime и gcTime: что когда происходит')
  const info = dEl('div', 'pb-res wait', 'Нажмите «Открыть страницу».')
  const track = dEl('div', 'tl')
  body.appendChild(track)
  body.appendChild(info)
  let t = 0, mounted = false, data = null, fresh = false, timer = null
  const STALE = 5, GC = 10
  const row = dEl('div', 'tl-row')
  row.appendChild(dEl('div', 'tl-lbl', 'состояние'))
  const bar = dEl('div', 'tl-track')
  row.appendChild(bar)
  const clock = dEl('div', 'tl-cnt', '0с')
  row.appendChild(clock)
  track.appendChild(row)

  function tick() {
    t++
    clock.textContent = t + 'с'
    if (data && fresh && t - data.at >= STALE) { fresh = false; paint() }
    if (data && !mounted && t - data.left >= GC) { data = null; paint(); }
    paint()
  }
  function paint() {
    let label, color
    if (!data) { label = 'кеша нет'; color = '#3d4754' }
    else if (fresh) { label = 'fresh — запросов не будет'; color = 'var(--grn)' }
    else if (mounted) { label = 'stale — обновится при фокусе/монтировании'; color = 'var(--yel)' }
    else { label = 'inactive, ждёт сборки мусора'; color = 'var(--mut2)' }
    bar.style.background = 'linear-gradient(90deg, ' + color + '22, transparent)'
    bar.innerHTML = '<div style="padding:4px 9px;font:11px var(--mono);color:' + color + '">' + label + '</div>'
    info.className = 'pb-res ' + (fresh ? 'ok' : data ? 'wait' : 'err')
    info.innerHTML = !data
      ? 'Данных нет. Открытие страницы вызовет <b>сетевой запрос</b>.'
      : fresh
        ? 'Данные <b>свежие</b> (staleTime ' + STALE + 'с). Повторное открытие страницы возьмёт их из кеша — <b>без запроса</b>.'
        : mounted
          ? 'Данные <b>устарели</b>. Компонент на экране, поэтому React Query обновит их при следующем триггере (фокус окна, монтирование).'
          : 'Компонент размонтирован. Через gcTime (' + GC + 'с) запись будет <b>удалена из памяти</b>.'
  }
  const ctl = dEl('div', 'demo-ctl')
  ctl.appendChild(dBtn('Открыть страницу', 'pri', () => {
    mounted = true
    if (!data || !fresh) { data = { at: t }; fresh = true }
    paint()
  }))
  ctl.appendChild(dBtn('Уйти со страницы', null, () => { mounted = false; if (data) data.left = t; paint() }))
  ctl.appendChild(dBtn('⏵ Пустить время', 'sm', function () {
    if (timer) { clearInterval(timer); timer = null; this.textContent = '⏵ Пустить время' }
    else { timer = setInterval(tick, 700); this.textContent = '⏸ Остановить' }
  }))
  ctl.appendChild(dBtn('⟲', 'sm', () => { t = 0; data = null; fresh = false; mounted = false; clock.textContent = '0с'; paint() }))
  body.appendChild(ctl)
  body.appendChild(dEl('div', 'demo-note',
    '<b>staleTime отвечает за сеть</b> (когда идти на сервер), <b>gcTime — за память</b> (когда выбросить неиспользуемые данные). По умолчанию staleTime = 0, то есть данные устаревают мгновенно.'))
  paint()
}
