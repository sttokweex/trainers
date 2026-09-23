import type { LegacyDemo } from '@/engine/types'

export const networkPathLab: LegacyDemo = root => {
  root.innerHTML = ''
  const shell = document.createElement('div'); shell.className = 'demo-shell'
  shell.innerHTML = '<h4>Путь HTTPS запроса — модель диагностики</h4><p class="demo-note">Симуляция не отправляет сетевой трафик. Выберите шаг и определите, какой факт подтверждает конкретный слой.</p>'
  const select = document.createElement('select')
  select.innerHTML = '<option value="dns">DNS: имя не разрешается</option><option value="route">Маршрут: DNS работает, TCP timeout</option><option value="port">Transport: connection refused</option><option value="tls">TLS: сертификат не совпадает с hostname</option><option value="http">HTTP: получен 503</option>'
  const button = document.createElement('button'); button.className = 'sm'; button.textContent = 'Показать проверку'
  const output = document.createElement('pre'); output.className = 'demo-note'
  const answers: Record<string,string> = {
    dns:'dig/getent → проверить resolver, A/AAAA, authoritative ответ и TTL. Успешный DNS подтверждает только получение адреса.',
    route:'ip route get + nc/curl из того же namespace → проверить gateway, egress ACL, security group, NAT, обратный маршрут и packet capture. Ping может быть запрещён отдельно.',
    port:'ss -lntp на сервере → проверить listener и bind address; затем container port mapping, service targetPort и firewall reject.',
    tls:'openssl s_client с правильным -servername → проверить SAN, цепочку CA, срок, системное время, SNI и TLS termination proxy.',
    http:'HTTP соединение установлено. Проверить gateway и application logs по request ID, readiness/upstream health, лимиты и зависимости; 503 сам по себе не указывает точную причину.'
  }
  button.onclick = () => { output.textContent = answers[select.value] ?? 'Выберите диагностический этап.' }
  shell.append(select, button, output); root.appendChild(shell)
}
