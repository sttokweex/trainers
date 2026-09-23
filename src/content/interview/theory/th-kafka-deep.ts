import type { TheoryArticle } from '@/engine/types'

export const kafkaDeep: TheoryArticle = { id:'th-kafka-deep', topic:'Кеш и очереди', title:'Kafka подробно: топики, партиции, offsets и гарантии доставки',
  lead:'Как устроен распределённый commit log, выбирать partition key, масштабировать consumer groups, управлять offset, retention, схемой и повторной обработкой.',
  body:`
<h5>Kafka — распределённый журнал событий</h5>
<p>Kafka хранит записи в <b>topics</b> как append-only log и позволяет независимым приложениям читать поток со своей позиции. В отличие от простой очереди «получил и удалил», запись обычно сохраняется по политике retention даже после чтения. Consumer group хранит свои offsets; новый consumer group может прочитать те же события самостоятельно.</p>
<p>Топик состоит из <b>partitions</b>. Каждая партиция — упорядоченный log с offset-ами, размещённый на брокере и реплицируемый. Порядок гарантируется только внутри одной партиции, не всего топика. Партиционирование задаёт параллелизм, locality состояния и границу порядка.</p>

<h5>Ключ партиционирования</h5>
<p>Producer обычно выбирает partition по ключу (часто hash), чтобы связанные события попадали в одну партицию. Для заказа используйте orderId, если события одного заказа должны быть упорядочены; для остатка — SKU/warehouse, если именно там инвариант. Без ключа события могут распределяться round-robin/sticky стратегией, что даст более равномерную нагрузку, но не гарантирует порядок одной сущности.</p>
<p>Слишком мало partitions ограничивает consumer параллелизм; слишком много увеличивает метаданные, файлы, recovery и нагрузку контроллеров. Слишком популярный key создаёт hot partition: один consumer не успевает, хотя остальные простаивают. Изменение числа partitions может поменять hash mapping будущих событий и усложнить порядок относительно уже записанных данных.</p>

<h5>Replication, leader и ISR</h5>
<p>У каждой partition есть leader replica, к которой обычно пишет и с которой читает клиент; follower replicas копируют log. <b>ISR</b> (in-sync replicas) — реплики, достаточно успевающие за лидером по текущим критериям. При отказе leader controller выбирает нового из допустимых replicas согласно конфигурации.</p>
<p>Producer <code class="i">acks=0</code> не ждёт подтверждения broker; <code class="i">acks=1</code> ждёт leader; <code class="i">acks=all</code> ждёт требуемое множество in-sync replicas согласно min.insync.replicas. <code class="i">acks=all</code> плюс replication factor и min ISR обычно дают более надёжную запись, но добавляют latency и могут отклонять запись, если ISR слишком мал. Разрешение unclean leader election может повысить доступность ценой потери подтверждённых данных.</p>

<h5>Producer: повторы, порядок и сериализация</h5>
<p>Producer batches records, сжимает batches и отправляет брокеру. Настройки <code class="i">linger.ms</code>, batch size, compression и buffer влияют на latency/throughput. Временный сетевой timeout создаёт неопределённость: брокер мог принять запись, а ack потерялся. Без idempotence повтор может создать дубликат.</p>
<p>Idempotent producer использует producer id и sequence number для дедупликации повторной записи в рамках поддерживаемых границ и конфигурации. Он не делает автоматически exactly-once всю цепочку БД→Kafka→внешний API. Параметры idempotence и retries должны быть согласованы с порядком; актуальные defaults зависят от версии клиента.</p>
<p>Schema/serializer — часть контракта. JSON прост, но требует контроля размера/версии; Avro/Protobuf/JSON Schema часто используют с Schema Registry и правилами совместимости. Эволюционируйте схему additive: старые consumers должны пережить новые optional fields/enum варианты или релизы должны быть согласованы.</p>

<h5>Consumer groups и ребалансировка</h5>
<p>Внутри consumer group каждая partition в один момент назначается одному consumer, поэтому параллелизм ограничен числом partitions. Разные groups читают записи независимо. При запуске/остановке consumer или изменении partitions происходит <b>rebalance</b>: assignment перераспределяется, обработчики могут приостанавливаться, а обработка долгих задач усложняет heartbeat/session timeout.</p>
<p>Cooperative/incremental rebalancing и static membership могут уменьшить полную остановку и churn, но не отменяют правильную работу при revoke/assign. При отзыве partition consumer должен завершить или безопасно передать текущую работу и commit-нуть только действительно обработанный offset.</p>

<h5>Offsets: где commit и почему появляются повторы</h5>
<p>Offset — позиция следующей записи, которую group должна читать. При <b>auto commit</b> offset может зафиксироваться до завершения бизнес-обработки: падение после commit приведёт к потере эффекта. Если commit делать после эффекта, падение между ними приведёт к повторной доставке. Поэтому стандартная модель — at-least-once + идемпотентный обработчик.</p>
<p>Для записи в ту же Kafka можно использовать producer transaction: consume records, produce output, commit offsets в одной Kafka transaction; downstream читает с isolation.level=read_committed. Это обеспечивает exactly-once semantics в границах Kafka pipeline при правильной настройке и transactional id. Запись в PostgreSQL/Redis/email/платёжный API не становится атомарной вместе с offset commit: там всё ещё нужны outbox/inbox, idempotency и reconciliation.</p>
<p>Commit-те самую раннюю позицию, после которой все предыдущие записи данной партиции обработаны. При параллельной async обработке нельзя commit-нуть max завершённый offset, если предыдущая запись ещё выполняется: после рестарта она будет пропущена.</p>

<h5>Retention, compaction и replay</h5>
<p><b>Time/size retention</b> удаляет старые сегменты по возрасту/объёму, независимо от того, прочитал ли их конкретный consumer. Consumer с большим lag может потерять возможность читать старый offset. <b>Log compaction</b> оставляет последнюю запись для каждого key (плюс tombstone на ограниченное время) и полезен для changelog/state reconstruction, но не сохраняет полную историю каждого изменения.</p>
<p>Replay — сильная возможность Kafka, но повтор события повторяет бизнес-код. Перед reset offsets проверьте side effects, idempotency, внешний API и объём будущей нагрузки. Используйте отдельную группу для новой аналитики/проекции и задайте retention, достаточный под согласованный сценарий восстановления.</p>

<h5>Гарантии доставки без магического exactly-once</h5>
<table><tr><th>Модель</th><th>Эффект при сбое</th><th>Типичное применение</th></tr>
<tr><td>At-most-once</td><td>потеря возможна, дубликат маловероятен</td><td>потеря редкого telemetry допустима</td></tr>
<tr><td>At-least-once</td><td>повтор возможен, потеря минимизируется</td><td>стандартный consumer с idempotency</td></tr>
<tr><td>Exactly-once</td><td>определён только внутри оговорённой транзакционной границы</td><td>Kafka consume-transform-produce при поддержке transaction</td></tr></table>
<p>Уточняйте, что именно означает «один раз»: запись в лог, обработка consumer-ом, обновление БД или реальный внешний эффект? Как только в цепочке появляется независимая система, общей атомарной транзакции обычно нет.</p>

<h5>Ошибки, retry topic и DLQ</h5>
<p>Бесконечный retry одной poison record блокирует partition и не даёт обработать последующие события. Варианты: bounded retry с задержкой, retry topics, отдельная parking/DLQ тема и алерт. Перенос в retry topic может изменить порядок относительно исходной партиции, поэтому если порядок важен для ключа, архитектуру ошибок надо продумать отдельно.</p>
<p>DLQ хранит причину, source topic/partition/offset, event id и ограниченно исходное событие. Защитите персональные данные и задайте срок хранения; replay должен быть контролируемым, с изменённым consumer version и дедупликацией. Не «лечите» любой 4xx повтором, а временную сетевую ошибку — немедленным бесконечным циклом.</p>

<h5>Kafka и transactional outbox</h5>
<p>Если приложение пишет заказ в PostgreSQL и отправляет событие в Kafka двумя независимыми командами, падение между ними оставляет несогласованное состояние. Outbox записывает заказ и событие в одной DB-транзакции, а publisher переносит событие в Kafka. Публикация может повториться, поэтому consumer дедуплицирует event id. Debezium/CDC может читать outbox из transaction log, снижая необходимость в опросе таблицы; это добавляет connector-ы и эксплуатацию.</p>

<h5>Kafka против Redis Streams и job queue</h5>
<table><tr><th>Нужда</th><th>Частый выбор</th><th>Почему</th></tr>
<tr><td>Фоновая задача, retry, delay, приоритет и статус</td><td>BullMQ/специализированная job queue</td><td>модель task удобна приложению</td></tr>
<tr><td>Простой сигнал online consumer-у</td><td>Redis Pub/Sub</td><td>минимум инфраструктуры, но нет истории/ack</td></tr>
<tr><td>Небольшой persistent stream в уже используемом Redis</td><td>Redis Streams</td><td>consumer groups и pending, но нужно управлять retention</td></tr>
<tr><td>Высокий throughput, много независимых групп, retention и replay</td><td>Kafka</td><td>распределённый журнал и партиции, выше операционная стоимость</td></tr></table>
<p>Kafka — не универсально «надёжнее любой очереди». Выбирайте по fan-out, объёму, retention, replay, порядку, latency и способности сопровождать кластер.</p>

<h5>Наблюдаемость Kafka</h5>
<ul><li>Consumer lag по группам и возраст самой старой необработанной записи.</li><li>Under-replicated partitions, ISR shrink, offline partitions, leader election.</li><li>Producer error/retry rate, request latency, throttling, batch/compression.</li><li>Ребалансировки, heartbeat timeout, длительность обработки и commit latency.</li><li>Размер топиков, retention, дисковая ёмкость, network throughput и перекос нагрузки партиций.</li><li>Размер/возраст DLQ и контролируемый replay; алерт должен иметь runbook и владельца.</li></ul>

<h5>Как спроектировать ответ на собеседовании</h5>
<ol><li>Определите событие, требуемый порядок и ключ агрегата.</li><li>Выберите число партиций по требуемому параллелизму и росту, не «на глаз».</li><li>Назовите replication factor, acks/min ISR и допустимые latency/RPO.</li><li>Опишите consumer group, offset commit и что произойдёт при падении в каждой точке.</li><li>Добавьте идемпотентность, outbox/inbox, ограниченные retry и DLQ.</li><li>Обсудите schema evolution, retention, replay и метрики lag.</li></ol>` }
