import type { TheoryArticle } from '@/engine/types'

export const redisDeep: TheoryArticle = { id:'th-redis-deep', topic:'Кеш и очереди', title:'Redis подробно: структуры данных, кеш, persistence и отказоустойчивость',
  lead:'Когда Redis — cache, когда datastore или broker; как устроены TTL, eviction, атомарные операции, репликация, Sentinel и Cluster.',
  body:`
<h5>Redis — in-memory data structure server</h5>
<p>Redis — сервер структур данных, который хранит значения в памяти и предоставляет атомарные команды по ключу. Он часто используется для кеша, счётчиков, rate limiting, временных сессий, Pub/Sub и очередей/stream-ов. «В памяти» не означает «данные гарантированно не потеряются» или «всегда быстрее правильной SQL-операции»: сеть, сериализация, большие команды, конкуренция и persistence тоже стоят времени.</p>
<p>Ключи — глобальное пространство внутри выбранного logical DB/namespace. Имена вроде <code class="i">prod:user:42:profile</code> помогают группировать ключи, но Redis Cluster ограничивает cross-key операции одним hash slot, если ключи не попали в один slot через hash tag.</p>

<h5>Структуры данных и выбор</h5>
<table><tr><th>Тип</th><th>Модель/команды</th><th>Применение</th></tr>
<tr><td>String</td><td>SET/GET, INCR, SET EX</td><td>кеш blob, счётчик, короткий token</td></tr>
<tr><td>Hash</td><td>HSET/HGET/HINCRBY</td><td>поля небольшой записи без сериализации всего объекта</td></tr>
<tr><td>List</td><td>LPUSH/RPOP, blocking pop</td><td>простая очередь, стек/лента</td></tr>
<tr><td>Set</td><td>SADD/SISMEMBER</td><td>уникальные участники, множества</td></tr>
<tr><td>Sorted Set</td><td>ZADD/ZRANGE</td><td>ранжирование, очередь с приоритетом/временем</td></tr>
<tr><td>Stream</td><td>XADD/XREADGROUP/XACK</td><td>лог событий, consumer groups, подтверждение обработки</td></tr>
<tr><td>Pub/Sub</td><td>PUBLISH/SUBSCRIBE</td><td>живые сигналы без истории и подтверждения</td></tr></table>
<p>Выбирайте тип, исходя из операций и гарантий. Не сериализуйте любой объект в JSON string без измерения: вы теряете операции по отдельному полю и каждый раз копируете/парсите весь объект. Но и hash не всегда лучше — число ключей/элементов, память и atomicity конкретной операции важны.</p>

<h5>Атомарность команд, pipeline, MULTI и Lua</h5>
<p>Одна Redis-команда выполняется атомарно относительно других команд. Но последовательность <code class="i">GET</code> → вычисление в приложении → <code class="i">SET</code> не атомарна: параллельные клиенты могут затереть друг друга. Используйте <code class="i">INCR</code>, <code class="i">SET NX EX</code>, optimistic <code class="i">WATCH/MULTI/EXEC</code> или Lua/Redis Functions для небольшой атомарной логики.</p>
<p><b>Pipeline</b> уменьшает число round-trip, отправляя команды пачкой, но сам по себе не является транзакцией. <b>MULTI/EXEC</b> группирует команды в очередь и выполняет без перемежения другими командами во время EXEC, но не откатывает уже выполненные команды как SQL transaction при ошибке одной команды. Lua скрипт атомарен в смысле неделимого выполнения на сервере, но долгий скрипт блокирует обработку других команд — держите его коротким.</p>

<h5>TTL и кеширование</h5>
<p>Назначайте TTL сразу при записи (<code class="i">SET key value EX 60</code>), чтобы при падении приложения не остались вечные данные. TTL — верхняя граница допустимой устарелости, не гарантия точного удаления в миллисекунду. Добавляйте случайный jitter, иначе тысячи одинаковых ключей истекут одновременно.</p>
<p><b>Cache-aside</b>: прочитать Redis, при miss загрузить БД и записать с TTL. При изменении данных удалять/обновлять cache после commit. Между DB commit и cache invalidation возможны race и stale value; для строгих инвариантов кеш не источник истины. Используйте versioned keys, outbox/event invalidation или короткий TTL там, где это соответствует допустимой устарелости.</p>
<p><b>Cache stampede</b> — много запросов одновременно обновляют один истёкший популярный ключ. Single-flight, короткий lock, stale-while-revalidate, заранее обновляемый ключ и jitter уменьшают всплеск. Distributed lock требует lease, уникального owner token и безопасного release; Redis lock не заменяет транзакционную гарантию на деньги/остаток.</p>

<h5>Память, eviction и большие ключи</h5>
<p>Установите ожидаемый maxmemory и понятную политику вытеснения. Для кеша часто подходят allkeys-lru/lfu-подобные политики; для ключей с TTL — volatile варианты; noeviction заставляет новые записи завершаться ошибкой вместо удаления данных. Точное название и детали зависят от версии. Не смешивайте критичные данные и вытесняемый кеш в одном instance без оценки общей политики.</p>
<p>Крупный ключ или команда с большим объёмом может заблокировать event loop Redis и вызвать latency для несвязанных клиентов. Избегайте огромных MGET/SMEMBERS/KEYS, больших payload, unbounded list/hash и неограниченного хранения истории. Используйте pagination, SCAN с cursor и порциями; SCAN может возвращать дубликаты и меняющуюся картину при параллельной модификации, поэтому обработчик идемпотентен.</p>

<h5>Persistence: RDB и AOF</h5>
<p><b>RDB</b> делает snapshot на диск через заданные интервалы/условия: компактный файл и быстрый старт, но возможна потеря изменений после последнего snapshot; fork/copy-on-write может временно увеличить память и I/O. <b>AOF</b> записывает команды изменения и может fsync-ить по выбранной политике: меньший RPO при более высокой цене диска/латентности; файл периодически переписывается/компактизируется. Конкретная надёжность определяется конфигурацией, файловой системой и облачной инфраструктурой.</p>
<p>Если Redis содержит единственную копию бизнес-данных, осознанно задайте RPO/RTO, persistence, backup и тест восстановления. Для cache допустима потеря и пересоздание; тогда persistence может не окупаться. Реплика без независимого backup не защищает от случайного удаления, которое реплицируется.</p>

<h5>Репликация, Sentinel и Cluster</h5>
<p>Replication обычно асинхронна: replica может отставать, поэтому чтение с неё даёт stale data, а при аварийном failover последние записи могут потеряться. Реплики помогают читать/пережить отказ, но сами не гарантируют strong consistency.</p>
<p><b>Sentinel</b> следит за primary/replicas и координирует failover для топологии с primary и репликами; это не шардирование. <b>Redis Cluster</b> распределяет keyspace по hash slots между shards и имеет replicas для failover. Multi-key команды/транзакции требуют совместного slot; hash tag <code class="i">{user:42}</code> заставляет related keys попасть на один shard, но может создать hotspot.</p>
<p>Клиент должен понимать topology, обновлять маршрутизацию после MOVED/ASK/failover и повторять только безопасные команды. Не путайте cluster availability с транзакцией между всеми shards.</p>

<h5>Pub/Sub, Streams и очереди</h5>
<p>Redis Pub/Sub доставляет только активным подписчикам: если consumer отключён, истории для него нет, ack/replay отсутствуют. Подходит для best-effort уведомлений и fan-out сигнала, не для критичного заказа или финансового события.</p>
<p>Redis Streams хранит append-only записи, поддерживает consumer groups и pending entries. Consumer читает, обрабатывает и подтверждает <code class="i">XACK</code>; после падения pending можно claim/replay. Обработка обычно at-least-once, поэтому идемпотентность нужна. Нужно настроить trimming/retention, мониторить pending/lag и не удалять данные, нужные медленному consumer.</p>
<p>BullMQ добавляет job semantics: delay, retries, concurrency и state. Это удобная очередь задач приложения, но детали хранения/lock/повторов необходимо мониторить. Kafka — распределённый долговечный event log для независимых consumer-ов и replay; выбор зависит от fan-out, throughput, retention, порядка и стоимости эксплуатации.</p>

<h5>Rate limiting и distributed locks</h5>
<p>Для простого rate limit можно использовать атомарный INCR с TTL, token bucket/leaky bucket в Lua или отслеживание sliding window. Все ключи одного пользователя должны обновляться атомарно; учтите race на первом создании TTL, multi-region latency, clock и отказ Redis. Fail-open или fail-closed — продуктовый/security trade-off.</p>
<p>Lock обычно получают атомарно через <code class="i">SET lock:value unique-token NX PX lease</code>. Освобождать нужно Lua-сценарием «удали, только если токен совпадает», иначе медленный владелец может удалить lock следующей операции. Lease может истечь во время долгой работы; fencing token/версия нужна, если старый владелец может позже записать результат. Для критичных инвариантов предпочтительны DB constraint/transaction или специализированный консенсусный lock.</p>

<h5>Наблюдаемость и production-чеклист</h5>
<ul><li>Memory used, fragmentation, evictions, keyspace hits/misses, connected clients, blocked clients.</li><li>Latency p95/p99 команд, slowlog, CPU, network, persistence fork/AOF rewrite.</li><li>Replica lag/link status, failover events, cluster slot health.</li><li>Streams pending/consumer lag, размер очереди и возраст oldest job, retry/DLQ.</li><li>Ключи с TTL, размер крупнейших ключей, рост cardinality; не запускать диагностические тяжёлые команды без оценки.</li><li>ACL users, TLS/private network, rotation secrets, резервные копии и drill восстановления.</li></ul>

<h5>Как отвечать на собеседовании</h5>
<p>Сначала определите роль Redis: кеш, временное состояние, очередь или источник данных. Затем назовите допустимую потерю/устаревание, TTL/eviction, persistence, репликацию и восстановление. Уточните атомарность операции, конкуренцию, размер данных и наблюдаемость. «Redis быстрый» недостаточно: интервьюер ждёт, как система ведёт себя при падении, повторе и заполнении памяти.</p>` }
