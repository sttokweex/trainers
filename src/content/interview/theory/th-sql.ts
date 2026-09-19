import type { TheoryArticle } from '@/engine/types'

export const sql: TheoryArticle = { id:'th-sql', topic:'Базы данных', title:'SQL, индексы и производительность запросов',
  lead:'То, что спрашивают у фуллстека — и то, что чаще всего оказывается настоящей причиной медленного приложения.',
  body:`
<h5>Порядок выполнения SQL</h5>
<p>Запрос <b>пишется</b> не в том порядке, в каком <b>выполняется</b>. Понимание этого разом объясняет несколько «странностей»:</p>
<pre class="code">FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT</pre>
<ul>
<li><b>Алиас из SELECT нельзя использовать в WHERE</b> — на момент фильтрации он ещё не вычислен. В <code class="i">ORDER BY</code> уже можно.</li>
<li><b>WHERE фильтрует строки до группировки, HAVING — группы после.</b> Фильтр, который можно применить в WHERE, туда и надо класть: он сократит объём до агрегации.</li>
<li><code class="i">LIMIT</code> применяется в самом конце — он не спасает от тяжёлой сортировки миллиона строк.</li>
</ul>

<h5>JOIN</h5>
<table>
<tr><th>Тип</th><th>Возвращает</th></tr>
<tr><td><code class="i">INNER JOIN</code></td><td>только строки с совпадением в обеих таблицах</td></tr>
<tr><td><code class="i">LEFT JOIN</code></td><td>все строки слева; справа NULL, если пары нет</td></tr>
<tr><td><code class="i">RIGHT JOIN</code></td><td>зеркально (на практике почти не используется)</td></tr>
<tr><td><code class="i">FULL OUTER JOIN</code></td><td>все строки с обеих сторон</td></tr>
<tr><td><code class="i">CROSS JOIN</code></td><td>декартово произведение</td></tr>
</table>
<pre class="code">SELECT u.name, o.id, COUNT(i.id) AS items, SUM(i.price) AS total
FROM orders o
JOIN users u ON u.id = o.user_id
LEFT JOIN order_items i ON i.order_id = o.id
WHERE o.created_at &gt;= NOW() - INTERVAL '30 days'
GROUP BY u.name, o.id
HAVING SUM(i.price) &gt; 1000
ORDER BY total DESC
LIMIT 20;</pre>
<div class="warn">Условие для <code class="i">LEFT JOIN</code>, помещённое в <code class="i">WHERE</code> вместо <code class="i">ON</code>, <b>превращает его в INNER JOIN</b>: строки с NULL справа отфильтруются. Классическая ошибка, из-за которой «почему-то пропали заказы без позиций».</div>

<h5>Как работают индексы</h5>
<p>Индекс — это отдельная структура (обычно B-tree: сбалансированное дерево с отсортированными ключами и связанными листьями), которая позволяет находить строки за O(log n) вместо полного сканирования. Поскольку ключи отсортированы, индекс помогает и в диапазонах (<code class="i">BETWEEN</code>, <code class="i">&gt;</code>), и в <code class="i">ORDER BY</code>.</p>
<h6>Правило левого префикса</h6>
<pre class="code">CREATE INDEX idx_orders ON orders (user_id, status, created_at);

-- работает:
WHERE user_id = 5
WHERE user_id = 5 AND status = 'paid'
WHERE user_id = 5 AND status = 'paid' ORDER BY created_at

-- НЕ работает:
WHERE status = 'paid'           -- пропущен первый столбец</pre>
<p>Составной индекс — это индекс по конкатенации колонок, как алфавитный указатель. Найти всех на «Ива» легко; найти всех, у кого вторая буква «в», — нет.</p>
<p>Отсюда правило порядка колонок: <b>сначала те, что сравниваются на равенство, потом диапазоны и сортировка</b>. Колонка с диапазонным условием «обрывает» использование последующих.</p>
<h6>Когда индекс не сработает</h6>
<ul>
<li><b>Функция или приведение типа</b> поверх колонки: <code class="i">WHERE LOWER(email) = '...'</code>. Нужен функциональный индекс: <code class="i">CREATE INDEX ... ON users (LOWER(email))</code>.</li>
<li><b><code class="i">LIKE '%текст'</code></b> с ведущим процентом. Для поиска по подстроке — GIN с <code class="i">pg_trgm</code> или полнотекстовый поиск.</li>
<li><b>Низкая селективность</b>: индекс по <code class="i">is_active</code> с двумя значениями на большой таблице обычно проигрывает последовательному сканированию, и планировщик сам его отвергнет. Лечится частичным индексом: <code class="i">... WHERE is_active = true</code>.</li>
<li><b>Маленькая таблица</b> — полное сканирование дешевле, и это нормально.</li>
</ul>
<div class="key">Индексы не бесплатны: они ускоряют чтение, но <b>замедляют запись</b> (каждый INSERT/UPDATE/DELETE обновляет все индексы) и занимают место. Неиспользуемые индексы — чистый вред. В Postgres их находят через <code class="i">pg_stat_user_indexes</code> по <code class="i">idx_scan = 0</code>.</div>
<p><b>Covering index</b> (<code class="i">INCLUDE</code>) содержит все нужные запросу колонки, и база вообще не ходит в таблицу — в плане это видно как <code class="i">Index Only Scan</code>.</p>

<div data-demo="db-index"></div>
<h5>Проблема N+1</h5>
<p>Самая частая причина медленного API. Один запрос за списком плюс по запросу на каждый элемент:</p>
<pre class="code">const orders = await repo.find({ take: 50 })          // 1 запрос
for (const o of orders) {
  o.user = await userRepo.findOne({ where: { id: o.userId } })   // ещё 50
}</pre>
<p>51 обращение вместо двух. Каждое стоит сетевой задержки — и вместо 10 мс страница отвечает полсекунды. На 1000 записей она просто умирает.</p>
<p>Три способа лечения:</p>
<pre class="code">// 1. relations — ORM сам решит, JOIN или отдельный запрос по IN
await repo.find({ take: 50, relations: { user: true } })

// 2. QueryBuilder с явным контролем
await repo.createQueryBuilder('o')
  .leftJoinAndSelect('o.user', 'u')
  .take(50)        // take, а не limit — см. ниже
  .getMany()

// 3. батч-загрузка вручную (принцип DataLoader)
const ids = [...new Set(orders.map(o =&gt; o.userId))]
const users = await userRepo.find({ where: { id: In(ids) } })
const byId = new Map(users.map(u =&gt; [u.id, u]))
orders.forEach(o =&gt; { o.user = byId.get(o.userId) })</pre>
<div class="warn">Обратная ловушка — <b>JOIN-взрыв</b>. Несколько <code class="i">leftJoinAndSelect</code> по коллекциям дают декартово произведение: 50 заказов × 10 позиций × 5 тегов = 2500 строк, которые ORM потом схлопывает в памяти. Признак — запрос стал медленнее, чем был с N+1. Тогда лучше 2–3 отдельных запроса с <code class="i">IN</code>.</div>
<p>И отдельно про TypeORM: при JOIN на коллекцию <code class="i">limit</code> ограничит <b>строки результата</b>, а не сущности — вы получите 12 заказов вместо 50. <code class="i">take</code> делает это правильно через подзапрос.</p>

<div data-demo="n-plus-one"></div>
<h5>Транзакции и изоляция</h5>
<p><b>ACID</b>: атомарность (всё или ничего), согласованность (инварианты не нарушаются), изоляция (параллельные транзакции не видят промежуточных состояний), долговечность (после коммита данные переживут падение).</p>
<table>
<tr><th>Уровень</th><th>Dirty read</th><th>Non-repeatable read</th><th>Phantom read</th></tr>
<tr><td>READ UNCOMMITTED</td><td>возможен</td><td>возможен</td><td>возможен</td></tr>
<tr><td>READ COMMITTED <i>(дефолт Postgres)</i></td><td>нет</td><td>возможен</td><td>возможен</td></tr>
<tr><td>REPEATABLE READ <i>(дефолт MySQL)</i></td><td>нет</td><td>нет</td><td>в Postgres нет</td></tr>
<tr><td>SERIALIZABLE</td><td>нет</td><td>нет</td><td>нет</td></tr>
</table>
<p>Но самая частая аномалия в веб-приложениях — <b>lost update</b>: два процесса прочитали баланс, каждый прибавил к своему значению и записал; одно изменение потерялось. Три способа защиты:</p>
<pre class="code">-- 1. атомарная операция на стороне БД — самый простой и надёжный
UPDATE accounts SET balance = balance + 100 WHERE id = 1;

-- 2. пессимистичная блокировка: остальные ждут
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;

-- 3. оптимистичная: колонка version, при конфликте — ошибка и повтор
UPDATE accounts SET balance = ?, version = version + 1
WHERE id = 1 AND version = ?;</pre>
<p>Пессимистичная подходит для денег и складских остатков; оптимистичная — для редактирования профилей и документов, где конфликты редки.</p>
<div class="key">Транзакция должна быть <b>короткой</b>. Никаких HTTP-запросов, отправки писем и ожидания внешних сервисов внутри: длинные транзакции держат блокировки и раздувают журнал. Побочные эффекты — после коммита, а надёжно — через outbox-таблицу в той же транзакции плюс воркер.</div>
<p>И правило против дедлоков: захватывать блокировки <b>всегда в одном и том же порядке</b> (например, по возрастанию id) во всём коде.</p>

<h5>NULL: три ловушки</h5>
<ul>
<li><code class="i">NULL = NULL</code> даёт не true, а <b>NULL</b>. Сравнивать только через <code class="i">IS NULL</code> / <code class="i">IS NOT NULL</code>.</li>
<li><code class="i">COUNT(*)</code> считает все строки, <code class="i">COUNT(col)</code> — только не-NULL.</li>
<li><code class="i">NOT IN (подзапрос, содержащий NULL)</code> вернёт пустой результат. Используйте <code class="i">NOT EXISTS</code>.</li>
</ul>

<h5>Оконные функции</h5>
<pre class="code">SELECT name, department, salary,
       AVG(salary) OVER (PARTITION BY department) AS avg_dept,
       ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rank
FROM employees;</pre>
<p>Агрегат без схлопывания строк. <code class="i">ROW_NUMBER()</code> — стандартное решение задачи «топ-N в каждой категории», которую любят давать на собеседовании. Рядом живут <code class="i">RANK</code>, <code class="i">DENSE_RANK</code>, <code class="i">LAG</code>/<code class="i">LEAD</code> (значение предыдущей/следующей строки — удобно для дельт по времени).</p>

<h5>Диагностика медленного запроса</h5>
<ol>
<li><code class="i">EXPLAIN (ANALYZE, BUFFERS) SELECT ...</code> — реальный план с фактическим временем.</li>
<li><code class="i">Seq Scan</code> на большой таблице — почти всегда нужен индекс. <code class="i">Index Only Scan</code> — идеал.</li>
<li>Сильное расхождение оценочных и фактических строк — устаревшая статистика, помогает <code class="i">ANALYZE</code>.</li>
<li><code class="i">pg_stat_statements</code> — топ запросов по суммарному времени. Часто выясняется, что проблема не в «самом медленном», а в быстром запросе, выполняемом десять тысяч раз.</li>
<li>Со стороны приложения: включить логирование SQL и посчитать, сколько запросов уходит на один HTTP.</li>
</ol>

<h5>Миграции</h5>
<p><code class="i">synchronize: true</code> в продакшене недопустим: он приводит схему к виду сущностей автоматически и <b>может удалить колонку вместе с данными</b> при переименовании поля. Нет истории, нет отката, нет ревью.</p>
<p>Правильный цикл: <code class="i">migration:generate</code> → <b>прочитать сгенерированный SQL глазами</b> → закоммитить → применить на деплое.</p>
<p><b>Выкатка без простоя</b> строится на том, что во время деплоя какое-то время работают одновременно старая и новая версия кода. Значит, схема должна быть совместима с обеими. Переименование колонки делается в три релиза: добавить новую и писать в обе → перелить данные и переключить чтение → убрать старую.</p>
<p>Опасные операции в Postgres: <code class="i">CREATE INDEX</code> без <code class="i">CONCURRENTLY</code> блокирует запись; добавление внешнего ключа на большую таблицу берёт тяжёлую блокировку (лечится <code class="i">NOT VALID</code> + отдельным <code class="i">VALIDATE</code>); смена типа колонки переписывает таблицу. И всегда ставьте <code class="i">lock_timeout</code> — миграция, ждущая блокировку, выстраивает за собой очередь запросов и кладёт сервис.</p>` }
