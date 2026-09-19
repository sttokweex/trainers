import type { TheoryArticle } from '@/engine/types'

export const node: TheoryArticle = { id:'th-node', topic:'Node / Nest', title:'Node.js под капотом',
  lead:'Event loop и его фазы, libuv и пул потоков, стримы и backpressure, worker_threads и cluster, диагностика памяти.',
  body:`
<h5>Из чего состоит Node</h5>
<p>Node.js — это <b>V8</b> (движок JavaScript), <b>libuv</b> (цикл событий и асинхронный ввод-вывод на C) и набор встроенных модулей. Ваш JS выполняется в одном потоке, но libuv под ним использует несколько.</p>

<h5>Фазы event loop</h5>
<p>В браузере модель простая: макрозадача — микрозадачи — кадр. В Node цикл разбит на <b>фазы</b>, и это отдельный вопрос на собеседовании.</p>
<pre class="code">   ┌───────────────────────────┐
┌─→│         timers            │  колбэки setTimeout / setInterval
│  ├───────────────────────────┤
│  │    pending callbacks      │  отложенные системные колбэки (ошибки TCP)
│  ├───────────────────────────┤
│  │      idle, prepare        │  внутреннее
│  ├───────────────────────────┤
│  │          poll             │  ← получение новых I/O-событий,
│  ├───────────────────────────┤     здесь Node может ЗАБЛОКИРОВАТЬСЯ в ожидании
│  │          check            │  setImmediate
│  ├───────────────────────────┤
│  │     close callbacks       │  socket.on('close')
└──┴───────────────────────────┘</pre>
<p><b>Между каждым колбэком</b> (а не только между фазами) Node разгребает две очереди микрозадач по порядку: сначала <code class="i">process.nextTick</code>, затем промисы.</p>
<pre class="code">setTimeout(() =&gt; console.log('timeout'), 0)
setImmediate(() =&gt; console.log('immediate'))
process.nextTick(() =&gt; console.log('nextTick'))
Promise.resolve().then(() =&gt; console.log('promise'))
console.log('sync')</pre>
<p>Вывод: <code class="i">sync</code> → <code class="i">nextTick</code> → <code class="i">promise</code> → дальше <b>timeout и immediate в непредсказуемом порядке</b>. Это не подвох, а честный факт: на старте главного модуля порядок зависит от того, успела ли пройти миллисекунда таймера к моменту входа в цикл.</p>
<div class="key">А вот <b>внутри I/O-колбэка порядок детерминирован</b>: <code class="i">setImmediate</code> всегда сработает раньше <code class="i">setTimeout(fn, 0)</code>, потому что фаза check идёт сразу после poll, а до фазы timers надо пройти целый круг. Это любимый уточняющий вопрос.</p>
<p><code class="i">process.nextTick</code> имеет приоритет выше промисов, и рекурсивный <code class="i">nextTick</code> способен полностью заморозить цикл — I/O никогда не получит управление. В прикладном коде его практически не используют.</p>

<div data-demo="node-phases"></div>
<h5>libuv и пул потоков</h5>
<p>Ключевая деталь, которую редко знают: не всякий асинхронный ввод-вывод работает одинаково.</p>
<ul>
<li><b>Сетевой I/O</b> (TCP, HTTP) использует системные механизмы epoll, kqueue, IOCP — <b>без</b> пула потоков. Поэтому тысячи одновременных соединений Node держит легко.</li>
<li><b>Файловые операции, DNS через <code class="i">dns.lookup</code>, <code class="i">crypto.pbkdf2</code>, zlib</b> выполняются <b>в пуле потоков</b>. По умолчанию в нём <b>4 потока</b> (<code class="i">UV_THREADPOOL_SIZE</code>).</li>
</ul>
<p>Практическое следствие: интенсивное хеширование паролей через bcrypt или активная работа с файлами могут <b>выесть пул</b> и затормозить всё остальное, что от него зависит. Это неочевидная причина «непонятных» просадок.</p>

<h5>Главное ограничение: один поток для вашего JS</h5>
<p>Любая долгая синхронная операция <b>блокирует все запросы</b>: <code class="i">JSON.parse</code> на 50 МБ, сортировка миллиона записей, <code class="i">fs.readFileSync</code>, регулярное выражение с катастрофическим бэктрекингом (ReDoS — отдельный вектор атаки).</p>
<p>Что с этим делают:</p>
<table>
<tr><th>Инструмент</th><th>Когда</th></tr>
<tr><td><code class="i">worker_threads</code></td><td>CPU-нагрузка внутри процесса: обработка изображений, парсинг, расчёты</td></tr>
<tr><td>Очередь (BullMQ)</td><td>долгая фоновая работа, которую не надо делать в цикле запроса</td></tr>
<tr><td><code class="i">cluster</code> / PM2 / реплики</td><td>использовать все ядра: несколько процессов за балансировщиком</td></tr>
<tr><td>Стримы</td><td>большие данные — обрабатывать по кускам, а не целиком в памяти</td></tr>
</table>
<p><b>cluster против worker_threads:</b> cluster создаёт отдельные <b>процессы</b> с собственной памятью (изоляция, но дорогая передача данных), worker_threads — <b>потоки</b> внутри процесса с возможностью разделять память через <code class="i">SharedArrayBuffer</code>. Для масштабирования HTTP берут cluster или несколько контейнеров; для вычислений — воркеры.</p>

<h5>Стримы и backpressure</h5>
<p>Четыре типа: <b>Readable</b> (файл, HTTP-запрос), <b>Writable</b> (файл, HTTP-ответ), <b>Duplex</b> (сокет), <b>Transform</b> (gzip, шифрование, парсер CSV).</p>
<pre class="code">// ❌ весь файл в память: 2 ГБ файл = 2 ГБ RSS = OOM
const data = await fs.promises.readFile(path)
await s3.putObject(bucket, key, data)

// ✅ поток: память ≈ размер буфера, независимо от размера файла
await pipeline(
  fs.createReadStream(path),
  zlib.createGzip(),
  s3UploadStream(bucket, key),
)</pre>
<p><b>Backpressure</b> — ситуация, когда источник отдаёт данные быстрее, чем приёмник успевает их принимать. Без обратного давления буфер растёт бесконечно и память кончается.</p>
<p>Механизм: <code class="i">writable.write()</code> возвращает <code class="i">false</code>, когда внутренний буфер превысил <code class="i">highWaterMark</code> (по умолчанию 64 КБ). Правильная реакция — приостановить чтение и возобновить по событию <code class="i">'drain'</code>. <code class="i">pipe()</code> и <code class="i">pipeline()</code> делают это автоматически.</p>
<div class="warn">Используйте <code class="i">pipeline()</code>, а не <code class="i">pipe()</code>. <code class="i">pipe</code> <b>не пробрасывает ошибки</b> и не закрывает остальные стримы при сбое — получаются висящие файловые дескрипторы и утечки. <code class="i">stream.pipeline</code> корректно разрушает всю цепочку и отдаёт ошибку.</div>
<p>Самый читаемый способ обработки — асинхронный итератор: <code class="i">for await (const chunk of stream)</code>.</p>

<h5>AsyncLocalStorage: контекст запроса</h5>
<p>В Node нет потоков, к которым можно привязать контекст (как ThreadLocal в Java), а асинхронные колбэки теряют связь с «тем самым запросом». Без решения приходится протаскивать <code class="i">traceId</code> параметром через все слои.</p>
<pre class="code">import { AsyncLocalStorage } from 'node:async_hooks'
export const als = new AsyncLocalStorage&lt;{ traceId: string }&gt;()

// middleware
app.use((req, res, next) =&gt; {
  als.run({ traceId: req.headers['x-request-id'] ?? randomUUID() }, () =&gt; next())
})

// где угодно глубоко внутри, без проброса параметров
logger.info({ traceId: als.getStore()?.traceId }, 'создаём заказ')</pre>
<p>Всё, что запущено внутри <code class="i">als.run</code> — включая промисы, таймеры и колбэки БД — видит тот же контекст, а параллельные запросы не мешают друг другу. На этом же механизме работает автоинструментация OpenTelemetry.</p>
<p>В Nest это лучше, чем REQUEST-scope: request-scoped провайдер «заражает» всю цепочку зависимостей и бьёт по производительности, а <code class="i">AsyncLocalStorage</code> (или пакет <code class="i">nestjs-cls</code>) оставляет провайдеры синглтонами.</p>

<h5>Память и утечки</h5>
<p>V8 использует <b>поколенческую</b> сборку мусора: молодые объекты в new space чистятся часто и быстро копирующим алгоритмом, выжившие переезжают в old space, который обрабатывается реже через mark-compact с инкрементальными фазами.</p>
<p>Типичные утечки в Node-приложении:</p>
<ul>
<li>Синглтон-сервис накапливает состояние в <code class="i">Map</code> на каждый запрос — классика.</li>
<li>Кеш без ограничения размера и TTL.</li>
<li>Подписки на глобальный event emitter без <code class="i">removeListener</code>. Предупреждение «MaxListenersExceededWarning» — прямой признак.</li>
<li>Незакрытые соединения, стримы, таймеры.</li>
<li>Замыкание на большой объект внутри долгоживущего колбэка.</li>
</ul>
<p>Диагностика: <code class="i">node --inspect</code> и heap snapshot в Chrome DevTools (три снимка, сравнение), метрики <code class="i">process.memoryUsage()</code> (следите за <code class="i">heapUsed</code> и <code class="i">rss</code>), в проде — алерт на монотонно растущий RSS. Растущая «пила» без спада — утечка.</p>
<p>Флаги, которые стоит знать: <code class="i">--max-old-space-size=2048</code> (лимит кучи, актуально в контейнерах — по умолчанию Node может не видеть лимит памяти cgroup) и <code class="i">--enable-source-maps</code> для читаемых стектрейсов.</p>

<h5>Эксплуатация</h5>
<ul>
<li><b>Graceful shutdown</b>: получили SIGTERM → перестали принимать новые запросы → дали текущим завершиться → закрыли соединения с БД, Redis, очередями → вышли с кодом 0. Без этого каждый деплой рвёт живые запросы и транзакции.</li>
<li><b>PID 1 в Docker</b>: процесс, запущенный как PID 1, не получает сигналы по умолчанию. Лечится <code class="i">--init</code>/<code class="i">tini</code> и exec-формой <code class="i">CMD ["node", "dist/main.js"]</code>.</li>
<li><b>Необработанные отклонения промисов</b> с Node 15+ <b>роняют процесс</b>. Это правильное поведение (лучше упасть, чем работать в неопределённом состоянии), но требует дисциплины в обработке ошибок.</li>
<li><b>Health-пробы</b>: liveness не должен проверять внешние зависимости, иначе лежащая БД вызовет бесконечный рестарт-луп.</li>
</ul>` }
