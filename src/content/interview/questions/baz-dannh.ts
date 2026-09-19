import type { Question } from '@/engine/types'

/** Базы данных — 6 вопрос(ов) */
export const bazDannhQuestions: Question[] = [
  { id:'db-index', topic:'Базы данных', type:'theory', level:'middle',
    q:'Как работают индексы (B-tree)? Почему порядок колонок в составном индексе важен и когда индекс не используется?',
    code:`CREATE INDEX idx_orders ON orders (user_id, status, created_at);
  
  -- использует индекс:
  WHERE user_id = 5
  WHERE user_id = 5 AND status = 'paid'
  WHERE user_id = 5 AND status = 'paid' ORDER BY created_at
  
  -- НЕ использует (или использует плохо):
  WHERE status = 'paid'                    -- пропущен первый столбец
  WHERE LOWER(email) = 'a@b.ru'            -- функция от колонки
  WHERE created_at::text LIKE '2024%'      -- приведение типа
  WHERE name LIKE '%шка'                   -- шаблон начинается с %`,
    answer:`<h5>B-tree на пальцах</h5>
  <p>Сбалансированное дерево, где ключи отсортированы, а листья связаны в список. Поиск — O(log n) вместо O(n) при полном сканировании. Диапазоны (<code class="i">BETWEEN</code>, <code class="i">&gt;</code>) и <code class="i">ORDER BY</code> работают, потому что данные уже отсортированы.</p>
  <h5>Правило «левого префикса»</h5>
  <p>Составной индекс <code class="i">(a, b, c)</code> — это индекс по <b>конкатенации</b>. Он пригоден для условий по <code class="i">a</code>, <code class="i">(a,b)</code>, <code class="i">(a,b,c)</code>, но не по <code class="i">b</code> или <code class="i">c</code> отдельно — как алфавитный указатель: найти всех на «Ива» легко, а всех, у кого вторая буква «в», — нет.</p>
  <p>Отсюда порядок: <b>сначала колонки для точного сравнения (=), потом для диапазонов и сортировки</b>. Колонка с диапазоном «обрывает» использование следующих.</p>
  <h5>Когда индекс не сработает</h5>
  <ul>
  <li>Функция или приведение типа поверх колонки → нужен <b>функциональный индекс</b>: <code class="i">CREATE INDEX ... ON users (LOWER(email))</code>.</li>
  <li><code class="i">LIKE '%...'</code> с ведущим процентом. Для поиска по подстроке — GIN + pg_trgm или полнотекстовый поиск.</li>
  <li><b>Низкая селективность</b>: индекс по полю с двумя значениями (<code class="i">is_active</code>) на большой таблице чаще всего проигрывает seq scan — планировщик сам его отвергнет. Лечится <b>частичным индексом</b>: <code class="i">WHERE is_active = true</code>.</li>
  <li>Таблица маленькая — полное сканирование дешевле, и это нормально.</li>
  </ul>
  <h5>Цена индексов</h5>
  <p>Ускоряют чтение, <b>замедляют запись</b> (каждый INSERT/UPDATE/DELETE обновляет все индексы) и занимают место. Неиспользуемые индексы — чистый вред; в Postgres их находят через <code class="i">pg_stat_user_indexes</code> (<code class="i">idx_scan = 0</code>).</p>
  <h5>Как доказать на собесе</h5>
  <p><code class="i">EXPLAIN (ANALYZE, BUFFERS) SELECT ...</code>. Смотрим: <code class="i">Seq Scan</code> на большой таблице — плохо; <code class="i">Index Scan</code>/<code class="i">Index Only Scan</code> — хорошо; расхождение <code class="i">rows</code> оценочных и фактических — устаревшая статистика (<code class="i">ANALYZE</code>).</p>
  <div class="hint"><b>Covering index</b> (<code class="i">INCLUDE</code>) — индекс содержит все нужные колонки, и БД вообще не ходит в таблицу: <code class="i">Index Only Scan</code>. Отличный ответ на вопрос «как ещё ускорить».</div>` },
  { id:'db-n1', topic:'Базы данных', type:'manual', level:'middle',
    q:'Что такое проблема N+1? Найдите её в коде и исправьте тремя способами.',
    starter:`// Отдаём список заказов с именем пользователя и позициями
  const orders = await orderRepo.find({ take: 50 })
  
  for (const order of orders) {
    order.user = await userRepo.findOne({ where: { id: order.userId } })
    order.items = await itemRepo.find({ where: { orderId: order.id } })
  }
  // Сколько запросов уйдёт в БД?`,
    solution:`// Запросов: 1 (заказы) + 50 (юзеры) + 50 (позиции) = 101. Это и есть N+1.
  
  // --- Способ 1: JOIN через relations (TypeORM) ---
  const orders = await orderRepo.find({
    take: 50,
    relations: { user: true, items: true },
  })
  // TypeORM сам решит: LEFT JOIN или отдельные запросы по IN
  
  // --- Способ 2: QueryBuilder с явным контролем ---
  const orders = await orderRepo
    .createQueryBuilder('o')
    .leftJoinAndSelect('o.user', 'u')
    .leftJoinAndSelect('o.items', 'i')
    .where('o.status = :status', { status: 'paid' })
    .take(50)                      // take/skip, а не limit/offset — иначе JOIN
    .getMany()                     // размножит строки и лимит сломается
  
  // --- Способ 3: батч-загрузка (когда JOIN не подходит) ---
  const orders = await orderRepo.find({ take: 50 })
  const userIds = [...new Set(orders.map(o => o.userId))]
  
  const users = await userRepo.find({ where: { id: In(userIds) } })   // 1 запрос
  const usersById = new Map(users.map(u => [u.id, u]))
  
  orders.forEach(o => { o.user = usersById.get(o.userId) })
  // Всего 2 запроса вместо 51. Это принцип DataLoader из GraphQL.`,
    answer:`<h5>Суть проблемы</h5>
  <p>Один запрос за списком + по запросу на каждый элемент. На 50 записях это 101 round-trip. Каждый стоит сетевой задержки (1–5 мс) — итого сотни миллисекунд там, где нужно 10. На 1000 записях страница просто умирает.</p>
  <h5>Как ловить</h5>
  <ul>
  <li>Включить <code class="i">logging: true</code> в TypeORM / <code class="i">logging: console.log</code> в Sequelize и посмотреть, сколько SQL улетает на один HTTP-запрос.</li>
  <li>APM/трейсинг: в OpenTelemetry (он у вас подключён) на спане запроса будет видна «гребёнка» из десятков одинаковых SQL.</li>
  </ul>
  <h5>Обратная ловушка: JOIN-взрыв</h5>
  <p>Несколько <code class="i">leftJoinAndSelect</code> по коллекциям дают декартово произведение: 50 заказов × 10 позиций × 5 тегов = 2500 строк, которые ORM потом схлопывает в памяти. Признак — запрос стал медленнее, чем был N+1. Тогда лучше 2–3 отдельных запроса с <code class="i">IN</code> (способ 3).</p>
  <div class="trap">Отдельная ловушка TypeORM: <code class="i">take</code>/<code class="i">skip</code> vs <code class="i">limit</code>/<code class="i">offset</code>. При JOIN на коллекцию <code class="i">limit 50</code> ограничит <b>строки результата</b>, а не сущности — вы получите 12 заказов вместо 50. <code class="i">take</code> делает это правильно (через подзапрос с DISTINCT id).</div>
  <h5>Eager vs lazy relations</h5>
  <p><code class="i">eager: true</code> в сущности удобно, но подтягивает связь <b>всегда</b> — включая места, где она не нужна. Лучше явные <code class="i">relations</code> в конкретных запросах.</p>` },
  { id:'db-tx', topic:'Базы данных', type:'theory', level:'senior',
    q:'Транзакции и ACID. Какие бывают уровни изоляции и какие аномалии они решают? Что такое оптимистичная и пессимистичная блокировка?',
    code:`await dataSource.transaction(async (manager) => {
    const from = await manager.findOne(Account, {
      where: { id: fromId },
      lock: { mode: 'pessimistic_write' },     // SELECT ... FOR UPDATE
    })
    if (from.balance < amount) throw new BadRequestException('Недостаточно средств')
  
    await manager.decrement(Account, { id: fromId }, 'balance', amount)
    await manager.increment(Account, { id: toId }, 'balance', amount)
  })`,
    answer:`<h5>ACID</h5>
  <ul>
  <li><b>Atomicity</b> — всё или ничего.</li>
  <li><b>Consistency</b> — инварианты БД (ограничения, внешние ключи) не нарушаются.</li>
  <li><b>Isolation</b> — параллельные транзакции не видят промежуточных состояний друг друга.</li>
  <li><b>Durability</b> — после коммита данные переживут падение (WAL / журнал).</li>
  </ul>
  <h5>Аномалии и уровни</h5>
  <table>
  <tr><th>Уровень</th><th>Dirty read</th><th>Non-repeatable read</th><th>Phantom read</th></tr>
  <tr><td>READ UNCOMMITTED</td><td>возможен</td><td>возможен</td><td>возможен</td></tr>
  <tr><td>READ COMMITTED <i>(дефолт Postgres)</i></td><td>нет</td><td>возможен</td><td>возможен</td></tr>
  <tr><td>REPEATABLE READ <i>(дефолт MySQL/InnoDB)</i></td><td>нет</td><td>нет</td><td>в Postgres нет, в стандарте возможен</td></tr>
  <tr><td>SERIALIZABLE</td><td>нет</td><td>нет</td><td>нет</td></tr>
  </table>
  <ul>
  <li><b>Dirty read</b> — увидеть незакоммиченные чужие данные.</li>
  <li><b>Non-repeatable read</b> — перечитали строку внутри транзакции и получили другое значение.</li>
  <li><b>Phantom read</b> — повторный запрос по условию вернул новые строки.</li>
  <li><b>Lost update</b> — два «прочитал–изменил–записал» затирают друг друга. Именно эта аномалия чаще всего встречается в вебе.</li>
  </ul>
  <h5>Две стратегии блокировок</h5>
  <table>
  <tr><th>Пессимистичная</th><th>Оптимистичная</th></tr>
  <tr><td><code class="i">SELECT ... FOR UPDATE</code>: заблокировали строку, остальные ждут</td><td>колонка <code class="i">@VersionColumn</code>; при UPDATE проверяем <code class="i">WHERE version = :v</code></td></tr>
  <tr><td>гарантия, но снижает параллелизм, риск дедлоков</td><td>ничего не блокирует; при конфликте — ошибка и повтор</td></tr>
  <tr><td>деньги, склад, бронирование мест</td><td>редактирование профиля, документов, CMS</td></tr>
  </table>
  <h5>Практические правила</h5>
  <ul>
  <li>Транзакция должна быть <b>короткой</b>. Никаких HTTP-запросов и отправки писем внутри — длинные транзакции держат блокировки и раздувают WAL.</li>
  <li>Порядок захвата блокировок должен быть <b>одинаковым</b> во всём коде (например, всегда по возрастанию id) — иначе дедлок.</li>
  <li>Побочные эффекты (письмо, вебхук, пуш) — <b>после</b> коммита; надёжно — через outbox-таблицу в той же транзакции + воркер.</li>
  <li>Простой инкремент лучше делать атомарно на стороне БД: <code class="i">UPDATE ... SET count = count + 1</code> — это вообще исключает lost update без блокировок.</li>
  </ul>` },
  { id:'db-migrations', topic:'Базы данных', type:'theory', level:'middle',
    q:'Зачем миграции и почему <code class="i">synchronize: true</code> нельзя в проде? Как выкатить изменение схемы без простоя?',
    answer:`<h5>Почему не synchronize</h5>
  <p><code class="i">synchronize: true</code> приводит схему БД к виду сущностей автоматически — и <b>может удалить колонку вместе с данными</b>, если вы переименовали поле. Нет истории, нет отката, нет ревью. Допустимо только в локальной разработке.</p>
  <p>Правильный цикл: <code class="i">migration:generate</code> → <b>прочитать сгенерированный SQL глазами</b> → закоммитить → <code class="i">migration:run</code> на деплое (в ваших проектах для этого есть <code class="i">predeploy</code>).</p>
  <h5>Миграции без простоя — expand / contract</h5>
  <p>Ключевая мысль: во время деплоя <b>какое-то время работают одновременно старая и новая версия кода</b>. Значит, схема обязана быть совместима с обеими.</p>
  <p><b>Переименование колонки</b> нельзя делать одним шагом. Правильно в три релиза:</p>
  <ol>
  <li><b>Expand</b>: добавить новую колонку (nullable), писать в обе, читать из старой.</li>
  <li><b>Migrate</b>: бэкфилл данных батчами, переключить чтение на новую.</li>
  <li><b>Contract</b>: убрать запись в старую, следующим релизом удалить её.</li>
  </ol>
  <h5>Опасные операции в Postgres</h5>
  <ul>
  <li><code class="i">ADD COLUMN NOT NULL DEFAULT ...</code> — на старых версиях переписывал всю таблицу под блокировкой (в PG 11+ уже безопасно для константных дефолтов).</li>
  <li><code class="i">CREATE INDEX</code> блокирует запись → всегда <code class="i">CREATE INDEX CONCURRENTLY</code> на живой таблице.</li>
  <li>Смена типа колонки, добавление FK на большую таблицу — долгие блокировки. Лучше <code class="i">NOT VALID</code> + отдельный <code class="i">VALIDATE CONSTRAINT</code>.</li>
  <li>Всегда ставьте <code class="i">lock_timeout</code>: миграция, ждущая блокировку, выстраивает за собой очередь запросов и кладёт сервис.</li>
  </ul>
  <h5>Что ещё спросят</h5>
  <ul>
  <li><b>Откат</b>: метод <code class="i">down()</code> обязателен, но откат данных часто невозможен — поэтому предпочитают «только вперёд» и feature flags.</li>
  <li><b>Сиды</b> — отдельно от миграций: справочники можно идемпотентно (<code class="i">ON CONFLICT DO NOTHING</code>), тестовые данные в прод не попадают.</li>
  <li>Миграции нельзя запускать параллельно с нескольких реплик — обычно это отдельный job перед стартом подов.</li>
  </ul>` },
  { id:'db-nosql', topic:'Базы данных', type:'theory', level:'middle',
    q:'SQL vs NoSQL: когда что выбирать? Зачем в вашем стеке Redis рядом с Postgres?',
    answer:`<h5>Когда реляционная БД</h5>
  <p>Дефолт для 90% веб-приложений. Причины: связи между сущностями, транзакции и гарантии ACID, произвольные запросы и агрегаты (<code class="i">JOIN</code>, <code class="i">GROUP BY</code>), ограничения целостности на уровне БД, зрелая экосистема. Postgres вдобавок умеет JSONB, полнотекстовый поиск, массивы и расширения — он закрывает многие сценарии, ради которых раньше брали отдельную NoSQL.</p>
  <h5>Типы NoSQL</h5>
  <table>
  <tr><th>Тип</th><th>Пример</th><th>Когда</th></tr>
  <tr><td>Ключ-значение</td><td>Redis</td><td>кеш, сессии, счётчики, очереди, rate limit</td></tr>
  <tr><td>Документная</td><td>MongoDB</td><td>гибкая схема, данные читаются целым документом</td></tr>
  <tr><td>Колоночная</td><td>ClickHouse, Cassandra</td><td>аналитика, огромные объёмы, агрегаты по колонкам</td></tr>
  <tr><td>Поисковая</td><td>Elasticsearch</td><td>полнотекстовый поиск, фасеты, релевантность</td></tr>
  <tr><td>Графовая</td><td>Neo4j</td><td>глубокие связи: соцсети, рекомендации</td></tr>
  <tr><td>Временные ряды</td><td>TimescaleDB, Prometheus</td><td>метрики, события по времени</td></tr>
  </table>
  <h5>Про «schemaless» — важное уточнение</h5>
  <p>Отсутствие схемы в БД не означает отсутствия схемы: она просто <b>переезжает в код приложения</b>, причём в нескольких версиях одновременно. «Гибкость» оборачивается кучей <code class="i">if (doc.field ?? doc.oldField)</code> и отсутствием гарантий целостности. Сильный ответ: «начинаю с Postgres, перехожу на специализированное хранилище, когда появилась конкретная задача, которую он решает плохо».</p>
  <h5>Почему Redis рядом с основной БД</h5>
  <ul>
  <li><b>Скорость</b>: данные в памяти, отклик — доли миллисекунды против единиц миллисекунд у диска.</li>
  <li><b>Структуры данных</b>: не только строки, но и <code class="i">Hash</code>, <code class="i">List</code>, <code class="i">Set</code>, <code class="i">Sorted Set</code> (готовый лидерборд!), <code class="i">Stream</code>, HyperLogLog.</li>
  <li><b>Атомарность и TTL</b>: <code class="i">INCR</code>, <code class="i">SET NX EX</code> — то, на чём строятся rate limiting и распределённые локи.</li>
  <li><b>Pub/Sub</b> — межпроцессные события, тот самый redis-adapter для socket.io.</li>
  <li>Он же — брокер для Bull.</li>
  </ul>
  <p>Важно понимать: Redis <b>однопоточный</b> для выполнения команд (поэтому операции атомарны без блокировок), и именно поэтому одна тяжёлая команда вроде <code class="i">KEYS *</code> останавливает весь сервер. Персистентность есть (RDB-снимки и AOF-журнал), но Redis не заменяет основную БД — на него смотрят как на быстрый, но теряемый слой.</p>` },
  { id:'db-typeorm-q', topic:'Базы данных', type:'manual', level:'middle',
    q:'Напишите запрос с фильтрами, сортировкой, пагинацией и подсчётом на TypeORM. Учтите SQL-инъекции и N+1.',
    starter:`// GET /tasks?status=open&search=отчёт&page=2&limit=20&sort=createdAt:desc`,
    solution:`async function findTasks(userId: number, query: TaskQueryDto) {
    const { status, search, page = 1, limit = 20, sort = 'createdAt:desc' } = query
  
    const qb = this.repo.createQueryBuilder('task')
      .leftJoinAndSelect('task.author', 'author')     // против N+1
      .where('task.userId = :userId', { userId })     // ВСЕГДА параметры, не конкатенация
  
    if (status) {
      qb.andWhere('task.status = :status', { status })
    }
  
    if (search) {
      // ILIKE — регистронезависимо в Postgres. %search% не использует обычный
      // индекс: на больших объёмах нужен GIN + pg_trgm или full-text search
      qb.andWhere('task.title ILIKE :search', { search: \`%\${search}%\` })
    }
  
    // белый список полей сортировки — иначе SQL-инъекция:
    // имя колонки НЕЛЬЗЯ передать параметром, оно попадает в SQL как есть
    const [field, dir] = sort.split(':')
    const allowed = { createdAt: 'task.created_at', title: 'task.title' } as const
    const column = allowed[field as keyof typeof allowed] ?? 'task.created_at'
    const direction = dir?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
  
    qb.orderBy(column, direction)
      .addOrderBy('task.id', 'DESC')      // тай-брейкер: без него порядок
                                          // одинаковых дат нестабилен между страницами
      .skip((page - 1) * limit)           // skip/take, а не offset/limit —
      .take(limit)                        // корректно работают с JOIN
  
    const [items, total] = await qb.getManyAndCount()
  
    return { items, total, page, pages: Math.ceil(total / limit) }
  }`,
    answer:`<h5>Четыре вещи, которые тут проверяют</h5>
  <ol>
  <li><b>Параметризация.</b> <code class="i">:userId</code>, а не шаблонная строка. Драйвер отправляет значение отдельно от текста запроса — инъекция становится невозможной в принципе.</li>
  <li><b>Белый список для сортировки.</b> Единственное место, где параметр не спасает: <b>имя колонки и направление подставляются в текст SQL</b>. Только словарь допустимых значений. Это любимая ловушка интервьюеров.</li>
  <li><b>Тай-брейкер в ORDER BY.</b> Без уникального второго поля строки с одинаковым <code class="i">createdAt</code> могут приходить в разном порядке на разных страницах — пользователь увидит дубли или пропуски.</li>
  <li><b>skip/take против offset/limit.</b> При <code class="i">leftJoinAndSelect</code> на коллекцию <code class="i">limit</code> обрежет строки результата, а не сущности. <code class="i">take</code> делает это правильно через подзапрос.</li>
  </ol>
  <h5>Что сказать про производительность</h5>
  <ul>
  <li><code class="i">getManyAndCount()</code> делает <b>два</b> запроса, второй — <code class="i">COUNT(*)</code> по всем условиям. На больших таблицах он и есть узкое место. Варианты: приблизительный счёт из статистики, кеширование total, или отказ от общего количества в пользу курсорной пагинации.</li>
  <li><code class="i">ILIKE '%...%'</code> не использует B-tree индекс. Для реального поиска — <code class="i">pg_trgm</code> с GIN или <code class="i">tsvector</code>.</li>
  <li>Нужен составной индекс под самый частый фильтр: <code class="i">(user_id, status, created_at DESC)</code>.</li>
  </ul>` },
]
