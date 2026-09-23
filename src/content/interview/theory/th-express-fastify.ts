import type { TheoryArticle } from '@/engine/types'

export const expressFastify: TheoryArticle = { id:'th-express-fastify', topic:'Node / Nest', title:'Express и Fastify: Node.js HTTP серверы, middleware и production',
  lead:'Как запрос проходит от socket до ответа, как выбирать framework, валидировать вход, формировать plugins, держать latency под контролем и эксплуатировать API.',
  body:`
<h5>Что дают Express и Fastify</h5>
<p>Node.js предоставляет низкоуровневый HTTP API поверх event loop и sockets. Express и Fastify добавляют routing и соглашения для построения HTTP-приложения. Express — зрелый минималистичный framework с огромной middleware экосистемой и широким историческим использованием. Fastify делает акцент на plugin encapsulation, schema-based validation/serialization и высокопроизводительном HTTP lifecycle. Они решают похожую задачу, но имеют разные extension APIs и несовместимые middleware детали.</p>
<p>«Fastify быстрее» не означает автоматически, что вся система будет быстрее: база, внешние API, JSON размер, сериализация, connection pool и алгоритмы могут доминировать. Benchmark зависит от версий Node/framework, маршрута, payload, hardware и способа измерения. Выбирайте по экосистеме, поддержке, контрактам, observability, команде и измеренной нагрузке.</p>

<h5>Путь запроса через Node сервер</h5>
<p>Клиент устанавливает TCP/TLS соединение с reverse proxy или Node процессом. ОС принимает данные socket; Node runtime разбирает HTTP framing и ставит callback работы в event loop. Framework определяет route, вызывает middleware/hooks, handler и сериализует ответ. Асинхронный I/O позволяет одному Node процессу обслуживать много ожидающих операций без потока ОС на каждый запрос, но CPU-bound JS блокирует event loop.</p>
<pre class="code">socket → HTTP parser/runtime → router
  → request hooks/middleware → auth → validation
  → handler/service → DB/API → serialization
  → response hooks → socket → proxy → client</pre>
<p>Нельзя делать синхронный тяжёлый CPU расчёт внутри request handler: пока он исполняется на main thread, другие callbacks задерживаются. Используйте worker threads/process pool для подходящих вычислений, ограничивайте размер входа и защищайтесь от алгоритмического DoS.</p>

<h5>Минимальный Express route и middleware</h5>
<pre class="code">const app = express()
app.use(express.json({ limit: '256kb' }))
app.use(requestId())
app.use('/api', apiRouter)
app.use(notFoundHandler)
app.use(errorHandler)

app.get('/users/:id', async (req, res, next) =&gt; {
  try { res.json(await users.find(req.params.id)) }
  catch (error) { next(error) }
})</pre>
<p>Middleware обычно принимает req, res, next и должен либо завершить ответ, либо передать управление дальше. Если не вызвать ни одно, запрос зависнет. Порядок регистрации важен: parser до handler, error handler после маршрутов. В Express 4 async rejection требовал wrapper/next(error), Express 5 меняет обработку Promise rejection; проверьте major version и типы конкретного проекта.</p>
<p>Middleware может быть глобальным, router-level или route-level. Не парсите body unlimited size. Raw body нужен только для сценариев вроде проверки подписи webhook; сохраняйте исходные байты отдельно, не отключая парсер глобально.</p>

<h5>Fastify lifecycle и encapsulated plugins</h5>
<p>Fastify route handler получает request/reply; lifecycle включает onRequest, preParsing, preValidation, preHandler, handler, preSerialization, onSend и onResponse. Hooks предназначены для конкретной стадии: authentication до handler, логирование после ответа, изменение сериализации там, где это оправдано. Порядок и допустимость ответа зависят от hook stage.</p>
<pre class="code">fastify.register(async function usersPlugin(app) {
  app.addHook('preHandler', authenticate)
  app.get('/users/:id', {
    schema: { params: userIdParams, response: { 200: userResponse } },
  }, async request =&gt; users.find(request.params.id))
})</pre>
<p>Fastify plugin encapsulation создаёт область, где декораторы/hooks/routes видны этому plugin и вложенным областям, но не автоматически соседям/родителям. Это помогает модульным границам, но новичок может удивиться, почему decorator отсутствует. Регистрация plugins и готовность сервера асинхронны; используйте lifecycle APIs и не слушайте порт до завершения обязательной конфигурации.</p>

<h5>Схемы, validation и serialization</h5>
<p>Schema — исполняемый контракт для входа/выхода. Fastify использует JSON Schema путь и умеет компилировать validators/serializers. Валидация ограничивает типы, длину, enum, массивы и дополнительные поля; schema response помогает не отправить внутренние поля сущности. Не доверяйте только TypeScript: типы исчезают после сборки, а данные поступают из сети.</p>
<p>Схема должна иметь ограничения на длину/глубину и согласовываться с API contract/OpenAPI. Ошибки следует нормализовать в стабильный формат, не раскрывая внутренний stack. Для сложной доменной проверки можно вызвать сервис после структурной schema validation — не пытайтесь закодировать бизнес-инвариант только JSON Schema.</p>

<h5>Ошибка, статус и контракт API</h5>
<p>Различайте ошибка входа (400/422 по контракту), отсутствие авторизации (401), недостаток прав (403), несуществующий ресурс (404), конфликт состояния (409), ограничение частоты (429) и временную недоступность (503). Один формат ошибки содержит machine-readable code, безопасное сообщение, request ID и field issues. Stack trace сохраняется в серверной телеметрии, но не уходит клиенту.</p>
<p>Не отправляйте успешный HTTP 200 с полем <code class="i">success:false</code> для всех неуспешных случаев, если API клиенты ожидают семантику статусов. Не меняйте контракт ответа случайно: добавление обязательного поля или смена типа может сломать старые приложения.</p>

<h5>Hooks, logging и observability</h5>
<p>Структурированный лог содержит timestamp, severity, request ID, route template, статус, latency и безопасные контекстные поля. Не логируйте access token, пароль, полный payment body и персональные данные без строгой необходимости. Correlation ID связывает запрос в gateway, API, очередь и downstream сервисе. Входящий request ID от клиента нельзя считать уникальным/доверенным без нормализации.</p>
<p>Измеряйте latency на границе и внутри: event-loop lag, время DB pool acquire, запрос БД, внешние зависимости, serialization, error rate и p95/p99. Средняя задержка скрывает хвост. Health endpoint, readiness и liveness отвечают на разные вопросы: процесс жив; готов принимать трафик; критические зависимости доступны — это не всегда один бинарный endpoint.</p>

<h5>Connection keep-alive и таймауты</h5>
<p>Keep-alive повторно использует TCP соединение для нескольких HTTP запросов и уменьшает handshake/latency. Есть server request timeout, headers timeout, keep-alive timeout, proxy idle timeout, DB pool acquire timeout и outbound request deadline. Они должны образовывать разумную иерархию: downstream должен закончить раньше внешнего deadline, а приложение — успеть вернуть ответ до gateway timeout с запасом для обработки.</p>
<p>Не устанавливайте длинные таймауты везде: медленный клиент может держать socket и память. Ограничивайте число sockets, заголовков, тела, concurrency и время чтения тела. При перегрузке короткий 503 лучше бесконечной очереди и последующего каскадного отказа.</p>

<h5>Пул БД, backpressure и ограничение concurrency</h5>
<p>Каждый серверный процесс обычно держит пул соединений к БД. Если есть 20 replicas по 30 соединений, верхняя нагрузка — до 600 connections; она может превысить возможности БД. Считайте общий бюджет по autoscaling и worker replicas. Ограничивайте очередь ожидания пула и возвращайте перегрузку контролируемо.</p>
<p>Backpressure — ограничение скорости производителя, когда потребитель не успевает. Для HTTP это может быть concurrency limit, bounded queue, потоковая передача, отказ 429/503 и ограничение response size. Без bounded queue очередь растёт в памяти и усиливает outage.</p>

<h5>Безопасность API</h5>
<ul><li>Ставьте body/header/url limits; защищайтесь от запросов с экстремальной глубиной и огромными массивами.</li><li>Rate limit по IP и/или identity с учётом NAT, gateway и доверенных proxy IP.</li><li>Для cookie auth учитывайте CSRF; CORS управляет браузерным доступом к ответу и не заменяет authentication.</li><li>Проверяйте подпись webhook по raw body, timestamp и replay protection.</li><li>Не используйте пользовательский input как filesystem path, SQL fragment, shell command или произвольный URL для backend fetch.</li><li>Устанавливайте security headers осознанно; TLS чаще завершается в proxy, но внутренние границы тоже могут требовать шифрования.</li></ul>

<h5>Express, Fastify и Nest: позиционирование</h5>
<p>Express подходит простым и существующим приложениям, где важны привычные middleware и минимум framework conventions. Fastify полезен, если важны schema contract, encapsulated plugins, hooks и измеренная эффективность. Nest добавляет modules, DI, controllers/guards/pipes/interceptors и может использовать Express или Fastify adapter. Nest не делает автоматически приложение быстрее/безопаснее: результат зависит от конфигурации и того, соблюдают ли команды его границы.</p>
<p>Миграция Express → Fastify — не замена одного import: надо переписать middleware, request/reply access, lifecycle, error handling, decorators и plugins, проверить streaming/upload/WebSocket и наблюдаемость. Сначала инвентаризируйте контракты и compatibility plugins, затем мигрируйте route group и сравните latency/error behavior под репрезентативной нагрузкой.</p>

<h5>Практика: API создания заказа</h5>
<ol><li>Создайте POST /orders с ограниченной schema входа и запретом неизвестных полей.</li><li>Определите idempotency key и поведение повтора после таймаута.</li><li>Разделите auth, validation, доменную проверку остатка и transaction в БД.</li><li>Покройте ошибки 400, 401, 403, 409, 429, 503 единым DTO.</li><li>Добавьте request ID, latency breakdown и redaction логов.</li><li>Ограничьте DB pool и нагрузку; смоделируйте зависшую БД и истёкший общий deadline.</li><li>Сравните Express и Fastify на одном маршруте с одинаковым payload, схемой, логированием и нагрузкой.</li></ol>
<p><b>Вопросы:</b> почему async handler может оставить запрос незавершённым; что даёт Fastify encapsulation; почему TS interface не валидирует сеть; как размер pool умножается на число replicas; почему benchmark hello-world нельзя переносить на production API?</p>
` }
