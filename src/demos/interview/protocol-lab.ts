import type { LegacyDemo } from '@/engine/types'

export const protocolLab: LegacyDemo = root => {
  root.innerHTML = ''
  const shell = document.createElement('div'); shell.className = 'demo-shell'
  shell.innerHTML = '<h4>Протоколы: подберите транспорт по требованиям</h4><p class="demo-note">Учебная модель выбора, не packet-level симулятор и не реальное подключение.</p>'
  const select = document.createElement('select')
  select.innerHTML = '<option value="feed">Живые обновления: server → browser</option><option value="rpc">Typed service-to-service streaming</option><option value="sensor">Датчик на нестабильной мобильной сети</option><option value="payment">Критичный платёж с повтором при timeout</option>'
  const button = document.createElement('button'); button.className = 'sm'; button.textContent = 'Сравнить варианты'
  const out = document.createElement('pre'); out.className = 'demo-note'
  const models: Record<string,string> = {
    feed:'SSE часто достаточно: однонаправленный поток по HTTP, reconnect модель; команды — обычный POST. Если нужны частые двусторонние события, сравнить WebSocket. Обязательно heartbeat, proxy idle timeout, replay cursor и backpressure.',
    rpc:'gRPC/Protobuf даёт typed schema и unary/streaming RPC поверх HTTP/2; проверить browser boundary, gateway, schema evolution, deadline propagation и retry semantics. REST/JSON проще для внешних клиентов.',
    sensor:'MQTT подходит для pub/sub и нестабильной связи; QoS выбирают по цене потери/дубликата, persistent session и broker limits. QoS 1 допускает повтор, поэтому обработчик должен быть идемпотентным.',
    payment:'TCP/TLS/HTTP надёжно доставляют байты, но timeout не раскрывает outcome операции. Нужны стабильный idempotency key, атомарный результат, ограниченный retry budget и сверка статуса.'
  }
  button.onclick = () => { out.textContent = models[select.value] ?? 'Выберите сценарий.' }
  shell.append(select, button, out); root.appendChild(shell)
}
