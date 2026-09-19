import type { TheoryArticle } from '@/engine/types'

export const http: TheoryArticle = { id:'th-http', topic:'API и сеть', title:'HTTP и проектирование API',
  lead:'Протокол, коды, заголовки, кеширование и принципы REST — с акцентом на то, что действительно спрашивают.',
  body:`
<h5>Анатомия обмена</h5>
<pre class="code">POST /api/v1/tasks HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer eyJhbGci...
Accept: application/json

{"title":"Задача","projectId":7}

───────────────────────────────

HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/v1/tasks/42
Cache-Control: no-store

{"id":42,"title":"Задача"}</pre>
<p>HTTP <b>stateless</b>: сервер не обязан помнить предыдущие запросы. Каждый запрос несёт всё необходимое, включая аутентификацию. Именно поэтому при горизонтальном масштабировании токен или идентификатор сессии летит с каждым запросом — любой инстанс должен уметь его обработать.</p>

<h5>Методы и идемпотентность</h5>
<table>
<tr><th>Метод</th><th>Идемпотентный</th><th>Безопасный</th><th>Смысл</th></tr>
<tr><td>GET</td><td>да</td><td>да</td><td>чтение, кешируется</td></tr>
<tr><td>POST</td><td><b>нет</b></td><td>нет</td><td>создание или произвольное действие</td></tr>
<tr><td>PUT</td><td>да</td><td>нет</td><td>полная замена ресурса</td></tr>
<tr><td>PATCH</td><td>обычно нет</td><td>нет</td><td>частичное изменение</td></tr>
<tr><td>DELETE</td><td>да</td><td>нет</td><td>удаление</td></tr>
</table>
<p><b>Идемпотентность</b> — повторный одинаковый запрос не меняет результат. Это не теория: от неё зависит, <b>можно ли безопасно повторить запрос при таймауте</b>. Клиент не знает, дошёл ли запрос — ответа-то нет. GET и PUT повторить можно, POST «создать заказ» — нельзя: появятся два заказа.</p>
<p>Решение — <b>ключ идемпотентности</b>: клиент генерирует UUID и шлёт его в заголовке, сервер запоминает и при повторе возвращает <b>тот же самый результат</b>, не выполняя операцию заново. Так работают все платёжные шлюзы.</p>
<pre class="code">POST /api/payments
Idempotency-Key: 7f3e9a21-...</pre>

<h5>Коды ответов</h5>
<ul>
<li><b>200</b> OK · <b>201</b> Created (плюс заголовок <code class="i">Location</code>) · <b>202</b> Accepted (взяли в асинхронную обработку) · <b>204</b> No Content</li>
<li><b>301</b> перемещено навсегда (кешируется браузером!) · <b>302/307</b> временно · <b>304</b> Not Modified</li>
<li><b>400</b> некорректный запрос · <b>401</b> не аутентифицирован («кто ты?») · <b>403</b> нет прав («знаю кто, но нельзя») · <b>404</b> не найдено · <b>409</b> конфликт (дубликат, гонка версий) · <b>422</b> синтаксис верный, но бизнес-валидация не прошла · <b>429</b> превышен лимит (плюс <code class="i">Retry-After</code>)</li>
<li><b>500</b> наша ошибка · <b>502</b> плохой ответ апстрима · <b>503</b> сервис недоступен · <b>504</b> таймаут апстрима</li>
</ul>
<p>Разницу <b>401 и 403</b> спрашивают почти всегда: первое про аутентификацию (не знаем, кто вы — покажите токен), второе про авторизацию (знаем, но этого вам нельзя — повторная попытка не поможет).</p>
<div class="note">Ещё один нюанс: <b>404 против 403 для чужих ресурсов</b>. Если на запрос чужого заказа отвечать 403, вы подтверждаете, что такой заказ существует. Для приватных данных обычно отвечают 404 — так вы не раскрываете сам факт существования.</div>

<h5>Заголовки, которые надо знать</h5>
<table>
<tr><th>Заголовок</th><th>Кто шлёт</th><th>Что означает</th></tr>
<tr><td><code class="i">Content-Type</code></td><td>оба</td><td>формат тела: <code class="i">application/json</code>, <code class="i">multipart/form-data</code> для файлов, <code class="i">text/html</code>. Сервер по нему решает, как парсить запрос</td></tr>
<tr><td><code class="i">Accept</code></td><td>клиент</td><td>какие форматы клиент готов принять в ответе</td></tr>
<tr><td><code class="i">Content-Encoding</code></td><td>сервер</td><td>каким алгоритмом сжато тело: <code class="i">gzip</code>, <code class="i">br</code> (brotli). Браузер распаковывает сам</td></tr>
<tr><td><code class="i">Content-Disposition</code></td><td>сервер</td><td><code class="i">attachment; filename="report.csv"</code> — «не показывай в окне, а скачай файл под этим именем»</td></tr>
<tr><td><code class="i">Cache-Control</code></td><td>оба</td><td>правила кеширования — см. раздел ниже</td></tr>
<tr><td><code class="i">ETag</code> / <code class="i">If-None-Match</code></td><td>сервер / клиент</td><td>хеш содержимого; клиент присылает его обратно, сервер отвечает 304, если ничего не изменилось</td></tr>
<tr><td><code class="i">Last-Modified</code></td><td>сервер</td><td>то же, но по времени изменения — точность до секунды, поэтому ETag надёжнее</td></tr>
<tr><td><code class="i">Vary</code></td><td>сервер</td><td>«ответ зависит от этих заголовков запроса» — иначе CDN отдаст gzip-версию клиенту без gzip или чужую локаль</td></tr>
<tr><td><code class="i">Authorization</code></td><td>клиент</td><td><code class="i">Bearer &lt;токен&gt;</code> — в отличие от куки, не прикладывается автоматически, поэтому не подвержен CSRF</td></tr>
<tr><td><code class="i">Set-Cookie</code></td><td>сервер</td><td>установить куку с флагами (HttpOnly, Secure, SameSite)</td></tr>
<tr><td><code class="i">Origin</code></td><td>клиент</td><td>откуда пришёл кросс-доменный запрос; на него отвечают заголовками CORS</td></tr>
<tr><td><code class="i">Retry-After</code></td><td>сервер</td><td>при 429 или 503 — через сколько секунд имеет смысл повторить</td></tr>
<tr><td><code class="i">X-Request-Id</code></td><td>оба</td><td>сквозной идентификатор запроса: по нему находят его историю в логах всех сервисов</td></tr>
<tr><td><code class="i">User-Agent</code></td><td>клиент</td><td>браузер и платформа; полагаться на него для логики ненадёжно — легко подделывается</td></tr>
<tr><td><code class="i">Referer</code></td><td>клиент</td><td>страница, с которой пришли. Содержит путь и query, поэтому регулируется <code class="i">Referrer-Policy</code>, чтобы не утекали токены</td></tr>
</table>
<p>Отдельно группа безопасности (<code class="i">Content-Security-Policy</code>, <code class="i">Strict-Transport-Security</code>, <code class="i">X-Content-Type-Options</code>) разобрана в статье про безопасность, а заголовки CORS — ниже в этой.</p>

<h5>Кеширование: два разных механизма</h5>
<p><b>Свежесть</b> — запроса нет вообще: <code class="i">Cache-Control: max-age=31536000</code>, браузер берёт из кеша. Самый быстрый запрос — тот, которого не было.</p>
<p><b>Валидация</b> — условный запрос: срок истёк, браузер шлёт <code class="i">If-None-Match: "хеш"</code>, сервер отвечает <b>304</b> без тела. Экономится трафик, но не время на round-trip.</p>
<p>Директивы, которые путают чаще всего:</p>
<ul>
<li><code class="i">no-cache</code> — <b>кешировать можно, но перед использованием обязательно провалидировать</b>. Это не «не кешировать».</li>
<li><code class="i">no-store</code> — вот это «не сохранять вообще». Для персональных данных.</li>
<li><code class="i">private</code> / <code class="i">public</code> — можно ли кешировать на CDN и прокси.</li>
<li><code class="i">immutable</code> — «файл никогда не изменится, не проверяй даже при обновлении страницы».</li>
<li><code class="i">stale-while-revalidate=N</code> — отдать устаревшее и обновить фоном.</li>
</ul>
<h6>Почему бандлы называются app.a3f9c1.js</h6>
<p>Это стратегия «двух скоростей». <code class="i">index.html</code> отдаётся с <code class="i">no-cache</code> — он маленький, его не жалко валидировать. Ассеты с хешем в имени — с <code class="i">max-age=31536000, immutable</code>: при изменении содержимого меняется имя файла, поэтому протухание не нужно. Новый деплой = новые имена в свежем HTML. Vite делает это автоматически.</p>
<div class="warn">Заголовок <code class="i">Vary: Accept-Encoding, Accept-Language</code> обязателен, если ответ зависит от этих заголовков. Без него CDN может отдать gzip-версию клиенту без поддержки gzip или чужую локаль.</div>

<div data-demo="http-cache"></div>
<h5>Версии протокола</h5>
<table>
<tr><th></th><th>HTTP/1.1</th><th>HTTP/2</th><th>HTTP/3</th></tr>
<tr><td>Транспорт</td><td>TCP</td><td>TCP</td><td>QUIC поверх UDP</td></tr>
<tr><td>Параллелизм</td><td>6 соединений на домен</td><td>мультиплексирование в одном</td><td>то же, без блокировки на уровне TCP</td></tr>
<tr><td>Заголовки</td><td>текстом, целиком</td><td>бинарно, сжатие HPACK</td><td>QPACK</td></tr>
<tr><td>Head-of-line</td><td>на уровне запросов</td><td>на уровне TCP-пакетов</td><td>решено</td></tr>
</table>
<p>Практический вывод: в HTTP/1.1 имело смысл склеивать файлы и использовать спрайты. В HTTP/2 и выше много мелких файлов дешевле — и лучше для кеширования, потому что изменение одного не инвалидирует остальные. А «шардинг доменов» из антипаттерна превратился во вред: лишние DNS-резолвы и TLS-рукопожатия.</p>

<h5>CORS — и главное заблуждение о нём</h5>
<div class="key">CORS не защищает ваш сервер. Это механизм <b>браузера</b>, который защищает пользователя, ограничивая чтение ответа кросс-доменным скриптом. Запрос при этом вполне может дойти до сервера и выполниться. curl и Postman про CORS вообще не знают — поэтому «в Postman работает» ничего не доказывает.</div>
<ul>
<li><b>Простой запрос</b> (GET/HEAD/POST с простыми заголовками) уходит сразу; браузер лишь скроет ответ, если нет <code class="i">Access-Control-Allow-Origin</code>.</li>
<li><b>Preflight</b>: при PUT/DELETE, кастомных заголовках или <code class="i">Content-Type: application/json</code> браузер сначала шлёт <code class="i">OPTIONS</code>. Ответ кешируется по <code class="i">Access-Control-Max-Age</code>.</li>
<li>С <code class="i">credentials: 'include'</code> нельзя отвечать <code class="i">Allow-Origin: *</code> — нужен конкретный origin плюс <code class="i">Allow-Credentials: true</code>.</li>
</ul>
<p>Ошибка CORS в консоли — это <b>отсутствие нужного заголовка в ответе сервера</b>. Чинится на бэкенде, никаких «обходов» на фронте не существует (кроме прокси в дев-режиме).</p>

<h5>Проектирование эндпоинтов</h5>
<pre class="code">GET    /api/tasks?status=open&amp;page=2   список с фильтрами
POST   /api/tasks                      создать
GET    /api/tasks/42                   получить
PATCH  /api/tasks/42                   изменить частично
DELETE /api/tasks/42                   удалить
GET    /api/projects/7/tasks           вложенная коллекция
POST   /api/tasks/42/archive           действие, не укладывающееся в CRUD</pre>
<p>Существительные во множественном числе, глаголы — в HTTP-методе, версия в пути или заголовке. Вложенность не глубже двух уровней.</p>
<h6>Пагинация: offset или cursor</h6>
<table>
<tr><th>Offset (<code class="i">?page=5&amp;limit=20</code>)</th><th>Cursor (<code class="i">?after=eyJpZCI6MTAwfQ</code>)</th></tr>
<tr><td>можно прыгнуть на страницу N</td><td>только вперёд и назад</td></tr>
<tr><td><code class="i">OFFSET 100000</code> заставляет БД пролистать 100 000 строк</td><td><code class="i">WHERE id &lt; :cursor LIMIT 20</code> — по индексу, скорость постоянна</td></tr>
<tr><td><b>дубли и пропуски</b> при изменении данных между страницами</td><td>стабильна при вставках</td></tr>
<tr><td>админки с номерами страниц</td><td>ленты, бесконечный скролл, большие объёмы</td></tr>
</table>
<p>Курсор обязательно строится по <b>уникальному монотонному</b> полю. Если сортировка по <code class="i">createdAt</code>, который не уникален, в курсор кладут пару <code class="i">(createdAt, id)</code> — иначе записи с одинаковым временем будут теряться. И курсор стоит кодировать в base64, чтобы клиент считал его непрозрачным токеном.</p>

<h5>Формат ошибок</h5>
<pre class="code">{
  "statusCode": 422,
  "message": "Валидация не пройдена",
  "errors": [{ "field": "email", "code": "invalid_format" }],
  "requestId": "7f3e9a21"
}</pre>
<p>Единый формат для всего API, машиночитаемые коды ошибок (фронт не должен парсить русский текст), <code class="i">requestId</code> для связи с логами. И никаких стектрейсов и текстов SQL-ошибок в ответе — это и подсказка атакующему, и утечка деталей реализации.</p>` }
