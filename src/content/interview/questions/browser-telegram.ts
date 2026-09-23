import type { Question } from '@/engine/types'

export const browserTelegramQuestions: Question[] = [
  {
    id: 'extension-mv3-lifecycle', theoryId: 'th-browser-extensions', topic: 'Браузер', type: 'theory', level: 'middle',
    q: 'Почему background service worker браузерного расширения не должен хранить важное состояние только в памяти?',
    answer: `<p>В Manifest V3 браузер может остановить extension service worker, когда он не нужен, а затем запустить его заново для нового события. Переменные процесса будут потеряны; worker не является постоянно живущим сервером. Важное состояние следует сохранять через подходящий storage/IndexedDB или восстанавливать из авторитетного источника. Обработчики событий регистрируют на верхнем уровне, обработку делают идемпотентной, а расписание не строят на долгом setTimeout. Нужно тестировать сценарий остановки и холодного повторного запуска.</p>`,
  },
  {
    id: 'extension-isolated-world', theoryId: 'th-browser-extensions', topic: 'Браузер', type: 'choice', level: 'middle',
    q: 'Что лучше всего описывает isolated world для content script?',
    options: [
      { t: 'JS-переменные content script изолированы от JS сайта, но DOM общий и любое сообщение/DOM-значение нужно считать недоверенным', ok: true },
      { t: 'Content script полностью изолирован от страницы, включая её DOM и все визуальные изменения', ok: false },
      { t: 'Изолированный мир делает безопасным выполнение кода, полученного с сайта', ok: false },
    ],
    answer: `<p>Content script обычно исполняется в отдельном JavaScript world: его глобальные переменные не являются переменными страницы. Но обе стороны работают с общим DOM, поэтому сайт может менять узлы и наблюдать добавленные элементы. Если нужен мост к MAIN world, он должен передавать узкий сериализованный контракт; данные валидируются, а privileged код не выполняет произвольную команду страницы. Изоляция контекста не означает полную песочницу DOM.</p>`,
  },
  {
    id: 'extension-permissions-practice', theoryId: 'th-browser-extensions', topic: 'Браузер', type: 'manual', level: 'middle',
    q: 'Расширению нужно раз в день обновлять информацию на одном сайте и показывать её в popup. Как минимизировать permissions и учесть жизненный цикл MV3?',
    solution: 'Запросить точный host permission только для нужного домена, по возможности optional permission во время понятного действия; использовать browser alarms/event API вместо вечного worker/timer, хранить результат в storage, обрабатывать отказ permission/offline/quota и обновлять popup из сохранённого состояния. Проверить правила host access конкретного браузера.',
    answer: `<p>Не запрашивать &lt;all_urls&gt;. Указать только нужный origin в host_permissions либо сделать optional_host_permissions и запросить доступ при объяснённом пользовательском действии. В MV3 background worker может быть остановлен, поэтому ежедневную работу планировать через подходящий alarms API, а не бесконечный таймер. Сохранять результат в storage, ограничить срок и объём данных, обработать отсутствие permission, сетевую ошибку и quota. Проверить поведение на целевых браузерах и сделать UI, который сообщает время последнего обновления.</p>`,
  },
  {
    id: 'extension-message-security', theoryId: 'th-browser-extensions', topic: 'Безопасность', type: 'manual', level: 'senior',
    q: 'Content script отправляет background сообщение `{type: "fetch", url: ...}`, а background выполняет fetch. Какие риски и как переработать контракт?',
    solution: 'Это превращает privileged worker в confused deputy/SSRF-like network proxy. Ограничить типы команд конкретными операциями и allowlist origin/path/method, валидировать sender/frame и схему; не принимать arbitrary URL/headers/body, применять лимиты и проверять редиректы. Background должен минимально использовать привилегии.',
    answer: `<p>Произвольный URL превращает background с более широкими host permissions в proxy, которым может управлять страница через content script. Возможны утечка данных, доступ к внутренним endpoint или запросы от имени пользователя. Замените общий fetch на узкие операции: например, обновить статус конкретного resource id у заранее заданного API. Проверяйте sender.id/tab/frame/URL, тип и размер payload, origin/path/method по allowlist, заголовки и redirects. Минимизируйте permissions и не возвращайте в страницу лишний ответ. Серверная авторизация остаётся обязательной.</p>`,
  },
  {
    id: 'telegram-polling-webhook-choice', theoryId: 'th-telegram-bots', topic: 'API и сеть', type: 'choice', level: 'middle',
    q: 'Какое утверждение о получении Telegram updates верно?',
    options: [
      { t: 'Webhook и getUpdates обычно взаимоисключаются на bot token; webhook требует доступный HTTPS endpoint и надёжного приёма update', ok: true },
      { t: 'Можно безопасно запустить несколько независимых getUpdates poller-ов с одинаковым токеном и offset', ok: false },
      { t: 'Если webhook endpoint вернул 200, приложение может не сохранять update, Telegram всё равно повторит его до обработки', ok: false },
    ],
    answer: `<p>В стандартной модели Bot API webhook и getUpdates не используются параллельно для одного токена; перед polling удаляют webhook. Webhook удобен на управляемой публичной инфраструктуре, но endpoint должен проверить secret header и надёжно принять update до успешного ответа. Если вернуть 200 до сохранения, а процесс упадёт, Telegram считает доставку успешной и внутренняя потеря уже возможна. Несколько конкурирующих poller-ов создают гонки offset и обработку updates не тем экземпляром.</p>`,
  },
  {
    id: 'telegram-update-dedup', theoryId: 'th-telegram-bots', topic: 'API и сеть', type: 'manual', level: 'senior',
    q: 'Webhook доставил один Update дважды, а обработчик выдаёт пользователю купленный предмет. Как защититься от двойной выдачи при нескольких инстансах?',
    solution: 'Использовать durable inbox/processed_updates с unique update_id или бизнес-idempotency key; вставку ключа и выдачу предмета выполнить одной DB transaction, либо уникальное ограничение на transaction/order. Shared DB/queue нужна для нескольких инстансов, локальная память не подходит. Добавить replay и reconciliation.',
    answer: `<p>Дедупликация должна быть общей для всех инстансов и атомарной с бизнес-эффектом. Например, в одной БД-транзакции создать processed_update с unique update_id и выдать предмет; при conflict повтор ничего не делает. Если один update содержит бизнес-операцию с отдельным ключом (например, transaction id), уникальность стоит обеспечить и на этом уровне. Set в памяти не переживает restart и не разделяется между репликами. Задайте retention, обработку ошибок, аудит и безопасный replay; доставка события не гарантирует exactly-once выполнение.</p>`,
  },
  {
    id: 'telegram-callback-practice', theoryId: 'th-telegram-bots', topic: 'API и сеть', type: 'manual', level: 'middle',
    q: 'Inline-кнопка содержит `callback_data: "buy:42"`. Опишите обработку callback так, чтобы пользователь не мог купить чужой товар или заплатить повторно.',
    solution: 'Немедленно answerCallbackQuery; распарсить и валидировать короткий action/id, загрузить товар и заказ на backend, проверить пользователя/чат/цену/доступность и статус; создать заказ атомарно с уникальным idempotency key, цена берётся из каталога, а не callback. Повторная кнопка возвращает текущий статус/результат.',
    answer: `<p>callback_data — только подсказка о намерении, а не доверенное состояние. Сначала быстро ответьте answerCallbackQuery, чтобы убрать индикатор в клиенте. Разберите ограниченную строку, проверьте пользователя и чат, загрузите товар из каталога и убедитесь, что заказ доступен. Цена и право на покупку берутся с сервера. Создание заказа/списание должно быть идемпотентным и атомарно запрещать повторное завершение. Если callback устарел или повторился, верните понятный текущий статус и отредактируйте сообщение, не создавая новый эффект.</p>`,
  },
  {
    id: 'telegram-limits-practice', theoryId: 'th-telegram-bots', topic: 'Надёжность и эксплуатация', type: 'manual', level: 'middle',
    q: 'Рассылка тысячам чатов начала получать 429/flood control. Как переработать отправку и обработку ошибок?',
    solution: 'Поставить рассылку в durable очередь, ограничивать скорость глобально и по chat, учитывать retry_after, откладывать, применять backoff+jitter и пределы, разделить временные и постоянные ошибки, иметь pause/resume и прогресс. Мониторить backlog/429; не повторять массово немедленно и не блокировать webhook handler.',
    answer: `<p>Не делать массовую рассылку синхронным циклом в обработчике запроса. Создайте durable jobs, глобальный/per-chat rate limiter и worker с ограниченным concurrency. На flood control соблюдайте retry_after и паузу, на временные ошибки используйте backoff+jitter; постоянный 400/невалидный chat id отправьте в отдельное состояние, а не повторяйте бесконечно. Дайте оператору pause/resume, идемпотентность задания и метрики прогресса, 429, backlog и возраста задачи. Лимиты Telegram меняются, поэтому не основывайте систему на одной вечной цифре.</p>`,
  },
  {
    id: 'telegram-token-leak-choice', theoryId: 'th-telegram-bots', topic: 'Безопасность', type: 'choice', level: 'middle',
    q: 'Bot token случайно попал в публичный GitHub-коммит. Какое первое действие правильное?',
    options: [
      { t: 'Немедленно отозвать/перевыпустить token, обновить secret store и проверить действия; удаление строки из HEAD само по себе недостаточно', ok: true },
      { t: 'Удалить файл и сделать force push — после этого token снова безопасен', ok: false },
      { t: 'Оставить token, если бот пока не прислал подозрительное сообщение', ok: false },
    ],
    answer: `<p>Секрет следует считать скомпрометированным сразу после публикации: старые commits, forks, кеши и боты-сканеры могли его сохранить. Отзовите или перевыпустите token у Telegram, обновите secret manager и все deployment environments, убедитесь, что старый credential больше не работает, проверьте логи/действия бота и устраните источник утечки. Переписывание Git history уменьшает дальнейшую экспозицию, но не отменяет ротацию. Добавьте secret scanning и не включайте token в URL логов.</p>`,
  },
  {
    id: 'miniapp-initdata-unsafe', theoryId: 'th-telegram-mini-apps', topic: 'Безопасность', type: 'theory', level: 'middle',
    q: 'Почему `initDataUnsafe.user.id` нельзя использовать как доказательство личности пользователя?',
    answer: `<p>Это поле разобрано на клиенте и находится в контексте, который пользователь контролирует через DevTools или изменённый клиент. Его можно подменить. Для идентификации backend получает исходную initData, проверяет HMAC по token соответствующего бота, допустимый auth_date и только потом читает user id. Даже валидная подпись подтверждает происхождение параметров, но бизнес-доступ и права всё равно проверяются на сервере при каждом действии.</p>`,
  },
  {
    id: 'miniapp-payment-practice', theoryId: 'th-telegram-mini-apps', topic: 'API и сеть', type: 'manual', level: 'senior',
    q: 'Mini App отправляет на backend `{productId, price, paid: true}` после возврата из платежного окна. Спроектируйте безопасный процесс покупки.',
    solution: 'Клиент отправляет только productId и intent; сервер валидирует Mini App session/initData, сам получает цену и создаёт pending order с уникальным idempotency key. Использует документированный Telegram invoice/payment flow, проверяет pre-checkout и только авторитетный successful_payment/update, дедуплицирует transaction id, затем выдаёт товар транзакционно. Client redirect не подтверждает платеж.',
    answer: `<p>Клиент отправляет productId/намерение, но не цену и не paid. Backend проверяет сессию, загружает цену из доверенного каталога, создаёт pending order и инициирует предусмотренный invoice flow. На pre-checkout сервер проверяет заказ, сумму и валюту и отвечает в срок; факт оплаты фиксирует только проверенное серверное событие успешного платежа. Уникальный transaction id и order id дедуплицируются, выдача товара атомарна и идемпотентна. Возврат UI из Telegram не является подтверждением денег: пользователь может подделать запрос или закрыть WebView.</p>`,
  },
  {
    id: 'miniapp-platform-practice', theoryId: 'th-telegram-mini-apps', topic: 'Браузер', type: 'manual', level: 'middle',
    q: 'Mini App выглядит нормально в Android, но кнопка перекрывает поле ввода на iOS, а Back закрывает всё приложение. Составьте план диагностики.',
    solution: 'Проверить доступность bridge/version и entry point, viewport/safe-area/keyboard resize, Telegram events, визуальные viewport variables, CSS dvh/100vh assumptions; реализовать Telegram BackButton синхронно с app history и fallback; тестировать реальные iOS/Android/Desktop клиенты, версии, ориентацию и клавиатуру; логировать платформу/sdk version без персональных данных.',
    answer: `<p>Сначала собрать client/platform/SDK version и тип entry point. Проверить viewport и safe area API, поведение клавиатуры и CSS 100vh/dvh: WebView и мобильная клавиатура меняют видимую область иначе. Подписаться на события viewport и корректно обновлять layout, не полагаться на фиксированную высоту. BackButton Telegram связать с историей приложения: если есть внутренний маршрут — вернуться назад, если нет — ожидаемо закрыть Mini App; не использовать только системный browser history. Воспроизвести на реальных iOS/Android/Desktop клиентах, ориентации и при открытой клавиатуре, добавить адаптивные тестовые состояния.</p>`,
  },
]
