import type { LegacyDemo } from '@/engine/types'

export const vpsRunbookLab: LegacyDemo = root => {
  root.innerHTML = ''
  const shell = document.createElement('div'); shell.className = 'demo-shell'
  shell.innerHTML = '<h4>VPS runbook: выбери симптом</h4><p class="demo-note">Только учебная шпаргалка. Команды не исполняются на компьютере и не подключаются к серверу.</p>'
  const select = document.createElement('select')
  select.innerHTML = '<option value="ssh">SSH перестал пускать</option><option value="502">Сайт отдаёт 502</option><option value="disk">Сервер жалуется на заполненный диск</option><option value="tls">TLS сертификат истекает</option><option value="restart">Сервис уходит в restart loop</option>'
  const btn = document.createElement('button'); btn.className = 'sm'; btn.textContent = 'Показать безопасный порядок'
  const out = document.createElement('pre'); out.className = 'demo-note'
  const hints: Record<string,string> = {
    ssh:'Не закрывай активную сессию. Используй консоль провайдера; проверь sshd -t, systemctl status ssh, journalctl -u ssh, ss -lntp, UFW и firewall провайдера. Измени одну причину и проверь новую сессию до выхода.',
    '502':'Проверь nginx -t/status и error.log; затем ss -lntp, systemctl status myapp, journalctl -u myapp. Убедись, что upstream address/port совпадает с listener и что сервис готов. Не открывай backend port наружу как обход.',
    disk:'Сначала df -hT и df -ih (байты и inode), затем du -xhd1 /var, lsof +L1 и journalctl. Найди владельца роста и безопасную retention policy; не удаляй случайные файлы из /var/lib.',
    tls:'Проверь dig A/AAAA, certbot certificates, renewal timer и certbot renew --dry-run; проверь chain/hostname через openssl s_client. Убедись, что порты challenge доступны. Не отключай проверку TLS клиентам.',
    restart:'systemctl status + journalctl -u NAME; проверь ExecStart, user, WorkingDirectory, EnvironmentFile permissions, binary path и зависимость. Исправь первопричину; бесконечные restart не лечат невалидную конфигурацию.'
  }
  btn.onclick = () => { out.textContent = hints[select.value] ?? 'Выбери симптом.' }
  shell.append(select, btn, out); root.appendChild(shell)
}
