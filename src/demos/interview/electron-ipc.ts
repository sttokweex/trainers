import type { LegacyDemo } from '@/engine/types'

export const electronIpcLab: LegacyDemo = root => {
  root.innerHTML = ''
  const shell = document.createElement('div'); shell.className = 'demo-shell'
  shell.innerHTML = '<h4>Поток безопасного IPC</h4><p class="demo-note">Схематическая модель сообщений. Реальный Electron здесь не запускается.</p>'
  const select = document.createElement('select'); select.innerHTML = '<option value="valid">Разрешённая операция: export:saveReport</option><option value="unknown">Неизвестный канал: shell:run</option><option value="bad">Разрешённый канал, но неверные данные</option>'
  const button = document.createElement('button'); button.className = 'sm'; button.textContent = 'Отправить запрос'
  const output = document.createElement('pre'); output.className = 'demo-note'
  button.onclick = () => {
    output.textContent = select.value === 'valid'
      ? 'Renderer → узкий API preload → IPC channel allowlist → main валидирует payload и sender → операция выполнена → структурированный ответ Promise.'
      : select.value === 'unknown'
        ? 'Отклонено: renderer не выбирает произвольные IPC каналы. Preload вообще не публикует универсальный invoke(channel, ...args).'
        : 'Отклонено main: TypeScript тип не гарантирует runtime-форму сообщения. Проверяем схему, размер, путь и полномочия.'
  }
  shell.append(select, button, output); root.appendChild(shell)
}
