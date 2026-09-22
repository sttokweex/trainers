/* eslint-disable */
// @ts-nocheck — интерактивная модель офлайн-чтения и синхронизации
import type { LegacyDemo } from '@/engine/types'
import { dBtn, dEl, dShell, dSelect } from '@/demos/helpers'

export const pwaOffline: LegacyDemo = root => {
  const body = dShell(root, 'Офлайн-режим: что кешировать и когда синхронизировать?')
  const resource = dSelect(body, 'Что пытаемся открыть?', [
    { v: 'asset', t: 'Хешированный файл приложения' },
    { v: 'article', t: 'Статья для чтения' },
    { v: 'balance', t: 'Текущий баланс/остаток' },
  ], 'article')
  const strategy = dSelect(body, 'Правило получения', [
    { v: 'cache-first', t: 'Сначала кеш' },
    { v: 'network-first', t: 'Сначала сеть' },
    { v: 'stale', t: 'Показать кеш и обновить в фоне' },
  ], 'stale')
  const result = dEl('div', 'pb-res wait', 'Проверьте, подходит ли правило для выбранного ресурса.')
  body.appendChild(dBtn('Проверить при потере сети', 'pri', check))
  body.appendChild(result)
  let queued = false
  let sent = false
  let idempotent = true
  const sync = dEl('div')
  const ctl = dEl('div', 'demo-ctl')
  ctl.appendChild(dBtn('✎ Сохранить действие офлайн', null, queueAction))
  ctl.appendChild(dBtn('idempotency key: включён', null, () => { idempotent = !idempotent; renderSync() }))
  ctl.appendChild(dBtn('Вернулась сеть · синхронизировать', 'pri', flush))
  ctl.appendChild(dBtn('Сбросить', null, () => { queued = false; sent = false; renderSync() }))
  body.appendChild(ctl)
  body.appendChild(sync)
  body.appendChild(dEl('div', 'demo-note', 'Сохранено на устройстве ≠ принято сервером. Статус отправки меняется только после подтверждённого ответа сервера.'))

  function check() {
    const r = resource.value, s = strategy.value
    const good = r === 'asset' ? s === 'cache-first' : r === 'article' ? (s === 'stale' || s === 'network-first') : s === 'network-first'
    result.className = 'pb-res ' + (good ? 'ok' : 'wait')
    const explanation = r === 'asset' ? 'Файл с хешем в URL не меняется по этому адресу и хорошо подходит для долгого кеша.' :
      r === 'article' ? 'Для чтения можно сразу показать сохранённый текст и затем получить обновление.' :
      'Для значения, влияющего на покупку, проверьте сервер и явно покажите, когда данные не удалось обновить.'
    result.textContent = (good ? '✓ Подходящий выбор. ' : 'Подумайте о свежести и последствиях устаревшего ответа. ') + explanation
  }
  function queueAction() {
    queued = true; sent = false; renderSync()
  }
  function flush() {
    if (queued) sent = true
    renderSync()
  }
  function renderSync() {
    sync.innerHTML = '<div class="demo-note">Очередь: <b>' + (queued ? '1 действие' : 'пусто') + '</b> · Статус: <b>' +
      (sent ? 'отправлено сервером' : queued ? 'сохранено на устройстве, ждёт сети' : 'нет изменений') + '</b></div>' +
      '<div class="demo-note">Повтор отправки: ' + (idempotent ? 'один idempotency key — дубль безопасно распознается' : 'новый запрос может создать дубль после таймаута') + '</div>'
    ctl.querySelectorAll('button')[1].textContent = 'idempotency key: ' + (idempotent ? 'включён' : 'выключен')
    ctl.querySelectorAll('button')[1].className = 'demo-b' + (idempotent ? ' pri' : '')
  }
  renderSync()
}
