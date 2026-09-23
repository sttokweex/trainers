import type { TheoryArticle } from '@/engine/types'

export const postMessageTabs: TheoryArticle = { id:'th-postmessage-tabs', topic:'Браузер', title:'Связь между вкладками: postMessage, BroadcastChannel и storage',
  lead:'Как передавать сообщения между окнами и вкладками, безопасно проверять отправителя и выбирать механизм синхронизации состояния.',
  body:`
<h5>Сначала различите окна и вкладки</h5>
<p>Термин <b>postMessage</b> чаще всего означает API <code class="i">Window.postMessage</code>: передача сообщения между объектами window, например родительской страницей и iframe либо окном, открытым через <code class="i">window.open</code>. Для связи между обычными вкладками одного origin есть более удобный <b>BroadcastChannel</b>, а также событие <code class="i">storage</code> при изменении localStorage. Все эти механизмы работают только в подходящих контекстах и не являются серверной синхронизацией.</p>
<p><b>Origin</b> — комбинация схемы, хоста и порта. <code class="i">https://app.example.com</code> и <code class="i">https://admin.example.com</code> — разные origin. Same-origin policy ограничивает прямой доступ окна к DOM/JS другого origin, но целевой канал обмена можно открыть сообщениями и безопасно валидировать их.</p>

<h5>Window.postMessage: отправитель и получатель</h5>
<p>Отправитель вызывает <code class="i">targetWindow.postMessage(data, targetOrigin)</code>. Получатель слушает событие <code class="i">message</code>. У события есть <code class="i">origin</code>, <code class="i">source</code> и <code class="i">data</code>. Получатель обязан проверить origin и форму данных; если сообщение ожидается от конкретного iframe/window, проверьте и <code class="i">source</code>.</p>
<pre class="code">const frame = document.querySelector('iframe')!
const trustedOrigin = 'https://widget.example.com'

frame.contentWindow?.postMessage(
  { type: 'theme:set', version: 1, theme: 'dark' },
  trustedOrigin, // точный origin, не '*'
)

window.addEventListener('message', (event) =&gt; {
  if (event.origin !== trustedOrigin) return
  if (event.source !== frame.contentWindow) return
  if (!isThemeMessage(event.data)) return
  applyTheme(event.data.theme)
})</pre>
<p>В новых типах DOM также доступна опция передачи transferables отдельным аргументом; распространённая совместимая форма принимает список transfer как третий аргумент. Transferable объекты (например ArrayBuffer/MessagePort) могут передаваться с передачей владения, что помогает не копировать большие данные. Поддержку и сигнатуру сверяйте с target browsers.</p>
<div class="warn">Не используйте <code class="i">'*'</code> как targetOrigin, если адресат известен. Иначе окно, которому позднее перенаправят targetWindow, может получить сообщение. Не считайте origin доказательством корректности data: валидируйте схему и допустимые значения.</div>

<h5>Безопасный протокол сообщений</h5>
<p>Думайте о сообщениях как об API-контракте. Введите <code class="i">type</code>, версию и корреляционный id для request/response; валидируйте payload runtime-схемой; ограничьте размер и частоту; обработайте неизвестные типы, повтор, устаревшее сообщение и закрытие окна. Не отправляйте токены/секреты, если адресат в них не нуждается. XSS на доверенном origin может отправить валидные сообщения с полномочиями страницы — проверка origin не защищает от компрометации самого доверенного сайта.</p>
<p><code class="i">postMessage</code> доставляет сообщение в очередь событий получателя. Это не означает, что бизнес-операция завершилась. Если нужен ответ, стройте request/response с уникальным id, timeout, обработкой отказа и проверкой соответствия ответа запросу. Для больших потоков/долгого обмена используйте MessageChannel и передайте один MessagePort участникам.</p>

<h5>Две обычные вкладки: BroadcastChannel</h5>
<p><b>BroadcastChannel</b> связывает browsing contexts одного origin и одного имени канала; отдельные вкладки не нужно заранее открывать друг другу. Каждая вкладка создаёт канал, отправляет структурируемые данные через <code class="i">postMessage</code> и получает сообщения через <code class="i">message</code>. Отправитель не получает собственное событие в свой экземпляр канала. Закрывайте канал, когда компонент/приложение больше не использует его.</p>
<pre class="code">const channel = new BroadcastChannel('app-session-v1')

channel.postMessage({ type: 'session:logout', at: Date.now() })
channel.addEventListener('message', ({ data }) =&gt; {
  if (data?.type === 'session:logout') clearLocalSession()
})

// при завершении владельца
channel.close()</pre>
<p>Подходящие сценарии: уведомить остальные вкладки о logout, обновлении профиля или необходимости перечитать данные. Это best-effort обмен между активными contexts, а не durable queue: закрытая/замороженная вкладка не получает гарантированно всю историю.</p>

<h5>Событие storage: полезная особенность</h5>
<p>Когда одна вкладка меняет <code class="i">localStorage</code>, событие <code class="i">storage</code> приходит другим документам того же storage area, но <b>не вкладке-инициатору</b>. Для <code class="i">sessionStorage</code> события ограничены контекстами того же top-level browsing context, например некоторыми дочерними окнами, и не служат обычным каналом между независимо открытыми вкладками.</p>
<pre class="code">window.addEventListener('storage', (event) =&gt; {
  if (event.key !== 'app:session-version') return
  // перечитать авторитетное состояние и обновить интерфейс
  void refreshSession()
})

// другая вкладка записывает новое значение
localStorage.setItem('app:session-version', String(Date.now()))</pre>
<p>Не кладите в storage большие объекты только ради события: чтение/запись localStorage синхронны и могут блокировать main thread. Храните небольшой сигнал/версию, а данные перечитывайте из подходящего источника.</p>

<h5>Кто лидер? Web Locks и координация работы</h5>
<p>Если все вкладки одновременно запускают polling, refresh токена или фоновую синхронизацию, нагрузка и гонки умножаются. <b>Web Locks API</b> позволяет contexts одного origin координировать эксклюзивную работу: одна вкладка держит named lock, остальные ждут или получают отказ в режиме ifAvailable. После закрытия вкладки браузер освобождает lock. Это удобная координация, но не durable distributed lock для серверных инвариантов и не замена блокировке/идемпотентности на backend.</p>
<pre class="code">await navigator.locks.request('app:refresh-session', { ifAvailable: true }, async (lock) =&gt; {
  if (!lock) return // другую вкладку выбрали лидером
  await refreshSessionOnce()
  channel.postMessage({ type: 'session:refreshed' })
})</pre>
<p>Более сложный вариант — выбрать лидера через heartbeat и BroadcastChannel. Он требует lease timeout и обработки подвисшей вкладки, сна устройства, часов и одновременного старта. Если API Web Locks доступен, обычно безопаснее использовать его вместо самописного алгоритма. Для общего долговечного хранилища подходит SharedWorker, если он поддерживается целевыми браузерами и жизненный цикл приложения это оправдывает.</p>

<h5>Гонки, повторы и порядок</h5>
<p>Два contexts могут одновременно обновить одну запись. Сообщение «данные изменились» не решает lost update: обе вкладки могли прочитать версию N и записать собственную версию N+1. Для важной записи нужен compare-and-swap/версия на сервере, транзакция IndexedDB, конфликтное разрешение или единый владелец состояния. BroadcastChannel не обещает транзакционную сериализацию бизнес-операций.</p>
<p>Добавляйте <code class="i">messageId</code>, <code class="i">senderId</code>, <code class="i">createdAt</code> и version, если нужно дедуплицировать, диагностировать или отбрасывать устаревшие сигналы. Системные часы разных устройств не всегда надёжны; для порядка используйте серверную версию или монотонный sequence, а не только timestamp.</p>

<h5>Выбор канала</h5>
<table><tr><th>Механизм</th><th>Связь</th><th>Лучший случай</th><th>Ограничение</th></tr>
<tr><td>Window.postMessage</td><td>конкретные window/iframe, в том числе между origin</td><td>родитель ↔ iframe, popup ↔ opener</td><td>обязательно проверять origin, source и протокол</td></tr>
<tr><td>BroadcastChannel</td><td>contexts одного origin с общим именем канала</td><td>уведомления и синхронизация активных вкладок</td><td>нет истории/гарантированной доставки закрытым вкладкам</td></tr>
<tr><td>storage event</td><td>другие документы того же localStorage area</td><td>простое уведомление о версии/изменении</td><td>синхронное хранилище, событие не приходит инициатору</td></tr>
<tr><td>SharedWorker</td><td>несколько страниц одного origin через общий worker</td><td>общая долгоживущая логика и соединение</td><td>поддержка браузеров и сложнее жизненный цикл</td></tr>
<tr><td>Web Locks</td><td>координация contexts одного origin</td><td>один лидер выполняет работу</td><td>не хранит данные и не заменяет серверные гарантии</td></tr></table>

<h5>Практический пример: logout во всех вкладках</h5>
<ol><li>Сервер отзывает/закрывает серверную сессию; UI logout не является защитой авторизации.</li><li>Текущая вкладка очищает локальное состояние и публикует минимальное событие <code class="i">session:logout</code>.</li><li>Остальные вкладки валидируют тип/версию события, очищают кэш и переводят UI в состояние входа.</li><li>При возврате из background вкладка дополнительно проверяет сессию сервером: сигнал мог быть пропущен во время сна или lifecycle suspension.</li><li>Сообщения не содержат credential. Сервер проверяет каждую операцию независимо.</li></ol>

<h5>Практические задачи</h5>
<ul><li>Реализуйте синхронизацию logout через BroadcastChannel и запасной storage event; проверьте, что источник тоже обновляет интерфейс.</li><li>Сделайте postMessage протокол iframe с точным targetOrigin, проверкой source, version и валидацией payload.</li><li>Добавьте request/response с id, timeout и MessageChannel; обработайте закрытие popup до ответа.</li><li>Запустите polling в нескольких вкладках и назначьте единственного лидера через Web Locks; измерьте число запросов.</li><li>Смоделируйте две параллельные записи и покажите, почему BroadcastChannel не предотвращает потерянное обновление.</li></ul>

<h5>Что сказать на собеседовании</h5>
<p>Сначала уточните, это popup/iframe или две самостоятельные вкладки. Для конкретного окна — Window.postMessage с точной проверкой origin/source и схемы данных. Для активных вкладок одного origin — BroadcastChannel; для простого сигнала возможен storage event, учитывая что инициатор его не получает. Для одной фоновой задачи — Web Locks. Затем назовите lifecycle, недоставленные события, гонки, дубли, версионирование и правило: важные права и состояние подтверждает сервер.</p>` }
