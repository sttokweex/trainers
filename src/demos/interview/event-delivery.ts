/* eslint-disable */
// @ts-nocheck — императивный интерактивный сценарий доставки сообщений
import type { LegacyDemo } from '@/engine/types'
import { dBtn, dEl, dShell } from '@/demos/helpers'

export const eventDeliveryDemo: LegacyDemo = root => {
  const body = dShell(root, 'Очередь: где поставить подтверждение?')
  let deduplicate = true
  let processed = false
  let attempts = 0
  let externalEffects = 0
  let offsetCommitted = false
  const stats = dEl('div')
  const controls = dEl('div', 'demo-ctl')
  const result = dEl('div', 'pb-res wait')
  const toggle = dBtn('', null, () => { deduplicate = !deduplicate; render() })
  controls.appendChild(toggle)
  controls.appendChild(dBtn('Сбой до побочного эффекта', null, () => {
    attempts++; renderScenario('Consumer получил событие и упал до отправки уведомления. Брокер доставит его снова.')
  }))
  controls.appendChild(dBtn('Сбой после эффекта, до commit', null, () => {
    attempts++
    if (!deduplicate || !processed) externalEffects++
    if (deduplicate) processed = true
    renderScenario('Уведомление уже отправлено, но offset не сохранён. После рестарта то же событие придёт повторно.')
  }))
  controls.appendChild(dBtn('Сохранить offset после эффекта', 'pri', () => {
    attempts++
    if (!deduplicate || !processed) externalEffects++
    processed = true
    offsetCommitted = true
    renderScenario('Эффект выполнен и offset сохранён. Событие больше не читается этой группой.')
  }))
  controls.appendChild(dBtn('Перезапустить consumer', null, () => {
    if (!offsetCommitted) {
      attempts++
      if (!deduplicate || !processed) externalEffects++
      if (deduplicate) processed = true
      renderScenario('Повторная доставка после сбоя. Отправка уведомления уже ' + (deduplicate && externalEffects === 1 ? 'защищена дедупликацией.' : 'повторилась.'))
    } else renderScenario('Offset уже сохранён: consumer продолжит со следующей позиции.')
  }))
  controls.appendChild(dBtn('Сбросить сценарий', null, () => {
    processed = false; attempts = 0; externalEffects = 0; offsetCommitted = false
    renderScenario('Выберите место сбоя и посмотрите, что произойдёт после рестарта.')
  }))
  body.appendChild(controls)
  body.appendChild(result)
  body.appendChild(stats)
  body.appendChild(dEl('div', 'demo-note', 'Подсказка для собеседования: брокер помогает доставить событие, но внешний API и база не входят автоматически в одну общую транзакцию.'))

  function renderScenario(message) {
    result.className = 'pb-res ' + (externalEffects > 1 ? 'err' : externalEffects === 1 ? 'ok' : 'wait')
    result.textContent = message
    render()
  }
  function render() {
    toggle.textContent = 'Дедупликация по eventId: ' + (deduplicate ? 'включена' : 'выключена')
    toggle.className = 'demo-b' + (deduplicate ? ' pri' : '')
    stats.innerHTML = '<div class="dash-kpis" style="margin-top:12px">' +
      '<div class="dash-kpi"><b>' + attempts + '</b><span>доставок</span></div>' +
      '<div class="dash-kpi ' + (externalEffects > 1 ? 'warn' : '') + '"><b>' + externalEffects + '</b><span>уведомлений</span></div>' +
      '<div class="dash-kpi"><b>' + (offsetCommitted ? 'сохранён' : 'не сохранён') + '</b><span>offset</span></div></div>' +
      '<div class="demo-note">' + (externalEffects > 1 ? '⚠ Один eventId вызвал внешний эффект несколько раз.' : deduplicate ? '✓ Inbox/уникальный eventId не даёт повторить уже совершённый эффект.' : 'Без дедупликации повторная доставка может повторить побочный эффект.') + '</div>'
  }
  renderScenario('Выберите место сбоя и посмотрите, что произойдёт после рестарта.')
}
