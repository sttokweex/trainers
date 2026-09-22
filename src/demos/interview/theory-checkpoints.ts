/* eslint-disable */
// @ts-nocheck — короткие decision checkpoints для теоретических статей
import type { LegacyDemo } from '@/engine/types'
import { dBtn, dEl, dShell } from '@/demos/helpers'

type Check = { q: string; options: string[]; answer: number; why: string }

function checkpoint(root: HTMLElement, title: string, checks: Check[]): void {
  const body = dShell(root, title)
  const progress = dEl('div', 'demo-note')
  body.appendChild(progress)
  const host = dEl('div')
  body.appendChild(host)
  let index = 0
  let score = 0

  const render = () => {
    const item = checks[index]
    host.innerHTML = ''
    const question = dEl('div', 'pb-res wait', item.q)
    question.style.fontSize = '13px'
    host.appendChild(question)
    const choices = dEl('div', 'demo-ctl')
    item.options.forEach((label, i) => {
      choices.appendChild(dBtn(label, null, () => {
        choices.querySelectorAll('button').forEach((b) => { b.disabled = true })
        const ok = i === item.answer
        if (ok) score++
        const result = dEl('div', 'demo-note', (ok ? '✓ Верно. ' : '→ Разберите ход мысли. ') + item.why)
        result.style.color = ok ? 'var(--grn)' : 'var(--yel)'
        host.appendChild(result)
        const next = dBtn(index === checks.length - 1 ? 'Завершить' : 'Следующий checkpoint', 'pri', () => {
          if (index === checks.length - 1) {
            index = 0; score = 0
          } else index++
          render()
        })
        host.appendChild(next)
      }))
    })
    host.appendChild(choices)
    progress.innerHTML = 'Checkpoint <b>' + (index + 1) + '</b> из ' + checks.length + ' · счёт ' + score
  }
  render()
}

export const performanceDiagnosis: LegacyDemo = root => checkpoint(root, 'Performance: выберите первое измерение', [
  { q: 'Пользователь жалуется: кнопка поиска зависает на 800 мс. Что проверите первым?', options: ['Performance trace и Long Tasks на main thread', 'Сразу добавлю useMemo во все компоненты', 'Поменяю базу данных'], answer: 0, why: 'Сначала нужно локализовать длинную задачу: обработчик, расчёт или каскад рендера. Оптимизация без trace — догадка.' },
  { q: 'LCP плохой только на мобильной сети. Какая гипотеза наиболее приоритетна?', options: ['TTFB и вес/приоритет крупнейшего ресурса', 'Количество unit-тестов', 'Число CSS-классов в исходниках'], answer: 0, why: 'Разрез по сети указывает на критический путь загрузки: сервер, hero-изображение, шрифт или блокирующий CSS.' },
  { q: 'CLS вырос после добавления рекламного блока. Какой фикс самый прямой?', options: ['Зарезервировать размер слота до загрузки рекламы', 'Увеличить timeout API', 'Отключить gzip'], answer: 0, why: 'Макет не должен менять геометрию, когда поздний ресурс появляется.' },
])

export const consistencyTradeoff: LegacyDemo = root => checkpoint(root, 'System design: выберите компромисс', [
  { q: 'Сервис переводов денег. Что важнее для чтения баланса сразу после записи?', options: ['Read-after-write consistency', 'Максимально старые данные допустимы', 'Случайный ответ из любой реплики'], answer: 0, why: 'Для денег stale read неприемлем. Цена — маршрутизация на primary или session stickiness и более сложная репликация.' },
  { q: 'Лента лайков допускает задержку в несколько секунд. Что можно выбрать?', options: ['Eventual consistency с асинхронным обновлением', 'Синхронный quorum на каждый пиксель UI', 'Отключить мониторинг'], answer: 0, why: 'Бизнес допускает небольшой lag, поэтому eventual consistency снижает latency и стоимость.' },
  { q: 'Кэш внезапно истёк у тысяч клиентов. Какая защита уместна?', options: ['Jitter/lock и stale-while-revalidate', 'Бесконечный retry без задержки', 'Увеличить TTL до 100 лет'], answer: 0, why: 'Нужно разнести обновления и не пустить весь трафик одновременно в базу.' },
])

export const securityThreatModel: LegacyDemo = root => checkpoint(root, 'Security: найдите границу угрозы', [
  { q: 'Сервер принимает URL картинки и сам скачивает ресурс. Какую угрозу проверяете?', options: ['SSRF и доступ к внутренней сети/metadata endpoint', 'CLS', 'Race condition в React'], answer: 0, why: 'Сервер становится proxy. Нужны allowlist схем/хостов, запрет private ranges и egress-контроль.' },
  { q: 'Cookie авторизации отправляется автоматически браузером. Как снизить CSRF-риск?', options: ['SameSite, CSRF token и проверка Origin/Referer', 'Только minify JavaScript', 'Положить пароль в localStorage'], answer: 0, why: 'CSRF использует автоматическую отправку cookie; защита должна проверять намеренность запроса.' },
  { q: 'В шаблон попадает пользовательский HTML. Какая первая линия защиты?', options: ['Контекстное экранирование/sanitize и CSP как дополнительный слой', 'Проверка только длины строки', 'Разрешить innerHTML везде'], answer: 0, why: 'XSS лечится на границе вывода и политикой источников; длина строки не определяет безопасность.' },
])

export const testingStrategy: LegacyDemo = root => checkpoint(root, 'Testing: выберите правильный уровень', [
  { q: 'Нужно проверить, что два сервиса одинаково понимают JSON-контракт. Что выбрать?', options: ['Contract test', 'Скриншот страницы', 'Тест цвета кнопки'], answer: 0, why: 'Контрактный тест быстрый и проверяет договор между consumer и provider без полного production-like графа.' },
  { q: 'Алгоритм должен сохранять инвариант для тысяч разных входов. Что добавит уверенности?', options: ['Property-based testing', 'Один happy-path пример', 'Ручное чтение кода без запуска'], answer: 0, why: 'Генератор находит граничные и неожиданные входы, а свойство фиксирует бизнес-инвариант.' },
  { q: 'E2E тест периодически падает из-за внешнего платежного sandbox. Что сделать?', options: ['Изолировать зависимость через contract/mock и оставить небольшой smoke', 'Увеличить retries до бесконечности', 'Удалить все тесты'], answer: 0, why: 'Flaky-тест скрывает сигнал. Стабилизируйте границу, а критический happy path оставьте в ограниченном smoke.' },
])
