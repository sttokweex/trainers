/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const capacity: LegacyDemo = root => {
  const body = dShell(root, 'Прикидка на салфетке')
  const out = dEl('div', 'pb-res wait')
  body.appendChild(out)
  let users = 1000000, actions = 10, peak = 5

  function draw() {
    const perDay = users * actions
    const avg = perDay / 86400
    const peakRps = avg * peak
    const instances = Math.max(1, Math.ceil(peakRps / 800))
    out.innerHTML =
      users.toLocaleString('ru') + ' пользователей × ' + actions + ' действий = <b>' + perDay.toLocaleString('ru') + '</b> запросов в сутки<br>' +
      '÷ 86 400 секунд = <b>' + Math.round(avg) + ' RPS</b> в среднем<br>' +
      '× ' + peak + ' на пике = <b>' + Math.round(peakRps) + ' RPS</b><br>' +
      '÷ ~800 RPS на инстанс = <b style="color:' + (instances > 20 ? 'var(--yel)' : 'var(--grn)') + '">' + instances + ' инстанс(ов)</b> + запас' +
      (instances <= 4 ? '<br><span style="color:var(--grn)">Обычная БД и пара контейнеров. Kafka и шардирование здесь — оверинжиниринг.</span>'
                      : '<br><span style="color:var(--yel)">Уже стоит думать про реплики чтения и кеш.</span>')
  }
  function slider(label, min, max, val, step, cb) {
    const g = dEl('div', 'fx-g')
    const lab = dEl('label', null, label + ': ' + val.toLocaleString('ru'))
    g.appendChild(lab)
    const sl = document.createElement('input')
    sl.type = 'range'; sl.min = min; sl.max = max; sl.value = val; sl.step = step; sl.style.width = '100%'
    sl.oninput = () => { cb(+sl.value); lab.textContent = label + ': ' + (+sl.value).toLocaleString('ru'); draw() }
    g.appendChild(sl)
    return g
  }
  const ctl = dEl('div', 'fx-ctl')
  ctl.appendChild(slider('Пользователей', 1000, 10000000, users, 1000, v => users = v))
  ctl.appendChild(slider('Действий в день', 1, 100, actions, 1, v => actions = v))
  ctl.appendChild(slider('Коэффициент пика', 2, 20, peak, 1, v => peak = v))
  body.appendChild(ctl)
  body.appendChild(dEl('div', 'demo-note',
    'Такая оценка за минуту ценится на собеседовании выше перечисления технологий — она показывает, что вы не проектируете под миллиард, когда пользователей тысяча.'))
  draw()
}
