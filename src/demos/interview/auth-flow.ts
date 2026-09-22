/* eslint-disable */
// @ts-nocheck — короткий threat-model OAuth/OIDC
import type { LegacyDemo } from '@/engine/types'
import { dBtn, dEl, dShell, dSelect } from '@/demos/helpers'

export const authFlow: LegacyDemo = root => {
  const body = dShell(root, 'OAuth callback: найдите недостающую защиту')
  const attack = dSelect(body, 'Сценарий', [
    { v: 'callback', t: 'Подменить ответ в callback (CSRF)' },
    { v: 'code', t: 'Перехватить authorization code' },
    { v: 'replay', t: 'Повторно предъявить старый ID token' },
  ], 'callback')
  const flags = dEl('div', 'demo-ctl')
  const stateBtn = dBtn('state: включён', 'pri', () => { stateOn = !stateOn; update() })
  const pkceBtn = dBtn('PKCE: включён', 'pri', () => { pkceOn = !pkceOn; update() })
  const nonceBtn = dBtn('nonce: включён', 'pri', () => { nonceOn = !nonceOn; update() })
  flags.append(stateBtn, pkceBtn, nonceBtn)
  body.appendChild(flags)
  let stateOn = true, pkceOn = true, nonceOn = true
  const result = dEl('div', 'pb-res wait', 'Выберите угрозу и проверьте поток.')
  const sequence = dEl('div')
  body.appendChild(result)
  body.appendChild(dBtn('Проверить поток', 'pri', run))
  body.appendChild(sequence)
  body.appendChild(dEl('div', 'demo-note', 'Это учебная модель: в реальном приложении дополнительно валидируйте подпись ID token, issuer, audience, срок и точный redirect URI.'))

  function update() {
    stateBtn.textContent = 'state: ' + (stateOn ? 'включён' : 'выключен')
    pkceBtn.textContent = 'PKCE: ' + (pkceOn ? 'включён' : 'выключен')
    nonceBtn.textContent = 'nonce: ' + (nonceOn ? 'включён' : 'выключен')
    stateBtn.className = 'demo-b' + (stateOn ? ' pri' : '')
    pkceBtn.className = 'demo-b' + (pkceOn ? ' pri' : '')
    nonceBtn.className = 'demo-b' + (nonceOn ? ' pri' : '')
  }
  function run() {
    const value = attack.value
    const safe = value === 'callback' ? stateOn : value === 'code' ? pkceOn : nonceOn
    const names = { callback: 'state связывает callback с начатой вкладкой', code: 'PKCE требует исходный verifier для обмена code', replay: 'nonce связывает ID token с текущей попыткой входа' }
    result.className = 'pb-res ' + (safe ? 'ok' : 'err')
    result.textContent = safe ? '✓ Атака остановлена: ' + names[value] + '.' : '⚠ Защиты не хватает. Добавьте: ' + names[value] + '.'
    sequence.innerHTML = '<ol class="demo-note"><li>Клиент создаёт случайный контекст входа.</li><li>Браузер проходит проверку у провайдера.</li><li>Провайдер возвращает короткий authorization code.</li><li>Клиент сверяет привязки и обменивает code на токены.</li></ol>'
  }
  update()
}
