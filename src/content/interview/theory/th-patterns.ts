import type { TheoryArticle } from '@/engine/types'

export const patterns: TheoryArticle = { id:'th-patterns', topic:'ООП и принципы', title:'Паттерны проектирования на TypeScript',
  lead:'Двенадцать паттернов, которые реально встречаются в веб-разработке — с кодом и указанием, где вы их уже используете, не зная названия.',
  body:`
<p>Паттерн — это не рецепт, который надо внедрить, а <b>имя для решения, которое повторяется</b>. Ценность в общем словаре: сказать «здесь стратегия» быстрее, чем объяснять пять минут. Поэтому на собеседовании плохо звучит перечисление всех 23 паттернов GoF и хорошо — «вот задача, вот паттерн, вот где он у нас в коде».</p>
<p>Паттерны делятся на три группы: <b>порождающие</b> (как создавать объекты), <b>структурные</b> (как их соединять) и <b>поведенческие</b> (как они взаимодействуют).</p>

<h5>Порождающие</h5>
<h6>Фабрика (Factory)</h6>
<p>Создание объекта спрятано за функцией: вызывающий код не знает конкретного класса.</p>
<pre class="code">function createStorage(env: Env): FileStorage {
  if (env.S3_BUCKET) return new S3Storage(env)
  if (env.MINIO_URL) return new MinioStorage(env)
  return new LocalStorage(env.UPLOAD_DIR)
}</pre>
<p><b>Где встречается:</b> <code class="i">useFactory</code>-провайдеры в NestJS, <code class="i">createTRPCClient</code>, <code class="i">configureStore</code>, <code class="i">createBrowserRouter</code>. Почти любая функция с префиксом <code class="i">create</code> — это фабрика.</p>
<h6>Строитель (Builder)</h6>
<p>Пошаговая сборка сложного объекта, когда конструктор с десятью аргументами нечитаем.</p>
<pre class="code">const qb = repo.createQueryBuilder('task')
  .leftJoinAndSelect('task.author', 'author')
  .where('task.status = :status', { status })
  .orderBy('task.createdAt', 'DESC')
  .take(20)                                 // каждый метод возвращает this
const rows = await qb.getMany()             // терминальный метод</pre>
<p><b>Где:</b> QueryBuilder в TypeORM и Knex, цепочки zod (<code class="i">z.string().email().min(5)</code>), <code class="i">supertest</code>. Признак — fluent-интерфейс с возвратом <code class="i">this</code>.</p>
<h6>Синглтон</h6>
<p>Один экземпляр на приложение. В JavaScript отдельный паттерн обычно не нужен: <b>модуль сам по себе синглтон</b>, потому что кешируется при импорте.</p>
<pre class="code">// db.ts — импортируется где угодно, экземпляр один
export const dataSource = new DataSource(config)</pre>
<div class="warn">Синглтон часто называют антипаттерном, и справедливо: он прячет зависимость (её не видно в сигнатуре), мешает тестам (глобальное состояние протекает между кейсами) и затрудняет замену реализации. В Node его почти всегда заменяет DI-контейнер — в Nest все провайдеры и так синглтоны, но при этом подменяемы в тестах.</div>

<div data-demo="strategy"></div>
<h5>Структурные</h5>
<h6>Адаптер</h6>
<p>Приводит чужой интерфейс к тому, который нужен вашему коду.</p>
<pre class="code">interface FileStorage {
  save(key: string, data: Buffer): Promise&lt;string&gt;
}

class S3Adapter implements FileStorage {          // наш контракт
  constructor(private readonly s3: S3Client) {}
  async save(key: string, data: Buffer) {
    await this.s3.send(new PutObjectCommand({ Key: key, Body: data }))
    return \`\${this.baseUrl}/\${key}\`
  }
}</pre>
<p><b>Зачем:</b> смена вендора не трогает бизнес-логику — меняется один класс. <b>Где:</b> обёртки над SDK (MinIO, YooKassa, Telegram), платформенные адаптеры Express и Fastify в Nest, <code class="i">@tanstack/query</code> поверх любого HTTP-клиента.</p>
<h6>Фасад</h6>
<p>Один простой метод вместо десяти вызовов разных подсистем.</p>
<pre class="code">class CheckoutService {
  async placeOrder(userId: number, cart: Cart) {
    const order = await this.orders.create(userId, cart)     // прячем
    await this.inventory.reserve(cart.items)                 // всю
    await this.payments.charge(order)                        // сложность
    await this.queue.add('order-confirmation', { id: order.id })
    return order
  }
}</pre>
<p><b>Где:</b> сервисный слой в Nest — это фасад над репозиториями и внешними API. Контроллер вызывает один метод и не знает про четыре подсистемы.</p>
<h6>Декоратор</h6>
<p>Добавляет поведение, сохраняя интерфейс. Объект-обёртка выглядит снаружи как оригинал.</p>
<pre class="code">function withCache&lt;T&gt;(fn: (key: string) =&gt; Promise&lt;T&gt;, ttlMs = 60_000) {
  const cache = new Map&lt;string, { value: T; expires: number }&gt;()

  return async (key: string): Promise&lt;T&gt; =&gt; {
    const hit = cache.get(key)
    if (hit &amp;&amp; hit.expires &gt; Date.now()) return hit.value

    const value = await fn(key)
    cache.set(key, { value, expires: Date.now() + ttlMs })
    return value
  }
}

const getUser = withCache(fetchUser)   // интерфейс тот же, поведение богаче</pre>
<p><b>Где:</b> интерцепторы Nest, middleware Express, HOC в React, и буквально декораторы TypeScript — <code class="i">@Injectable()</code>, <code class="i">@UseGuards()</code>.</p>
<h6>Прокси</h6>
<p>Подменяет объект, перехватывая доступ к нему. В отличие от декоратора, цель — контроль, а не расширение.</p>
<pre class="code">const state = new Proxy(target, {
  get(obj, prop) { track(prop); return obj[prop] },
  set(obj, prop, value) { obj[prop] = value; notify(prop); return true },
})</pre>
<p><b>Где:</b> Immer в Redux Toolkit (черновик — это Proxy, который записывает изменения), реактивность Vue, ленивая загрузка связей в ORM, моки в тестах.</p>
<h6>Компоновщик (Composite)</h6>
<p>Единообразная работа с деревом: лист и узел имеют один интерфейс.</p>
<pre class="code">type Node = { id: number; name: string; children?: Node[] }

function sum(node: Node): number {
  return node.value + (node.children ?? []).reduce((a, c) =&gt; a + sum(c), 0)
}</pre>
<p><b>Где:</b> дерево React-компонентов, дерево категорий, файловая система, вложенные комментарии.</p>

<h5>Поведенческие</h5>
<h6>Стратегия</h6>
<p>Семейство взаимозаменяемых алгоритмов за общим интерфейсом. Это Open/Closed в чистом виде.</p>
<pre class="code">interface PaymentProvider { pay(amount: number): Promise&lt;Receipt&gt; }

class YooKassa implements PaymentProvider { async pay(a: number) { … } }
class TBank    implements PaymentProvider { async pay(a: number) { … } }

class Checkout {
  constructor(private readonly provider: PaymentProvider) {}
  total(amount: number) { return this.provider.pay(amount) }
}</pre>
<p><b>Признак, что нужна стратегия:</b> в коде растёт <code class="i">switch</code> или цепочка <code class="i">if</code>, куда каждый новый случай добавляет ветку. <b>Где:</b> провайдеры оплаты, способы доставки, алгоритмы сортировки, стратегии кеширования в service worker.</p>
<h6>Наблюдатель (Observer)</h6>
<p>Объект уведомляет подписчиков об изменениях, не зная, кто они.</p>
<pre class="code">class Emitter&lt;E extends Record&lt;string, unknown&gt;&gt; {
  private handlers = new Map&lt;keyof E, Set&lt;Function&gt;&gt;()

  on&lt;K extends keyof E&gt;(ev: K, fn: (p: E[K]) =&gt; void) {
    if (!this.handlers.has(ev)) this.handlers.set(ev, new Set())
    this.handlers.get(ev)!.add(fn)
    return () =&gt; this.handlers.get(ev)!.delete(fn)   // функция отписки
  }

  emit&lt;K extends keyof E&gt;(ev: K, payload: E[K]) {
    for (const fn of [...(this.handlers.get(ev) ?? [])]) fn(payload)
  }
}</pre>
<p><b>Где:</b> DOM-события, <code class="i">@nestjs/event-emitter</code>, socket.io, подписка на стор в Redux, <code class="i">useSyncExternalStore</code>, RxJS.</p>
<h6>Команда</h6>
<p>Действие как объект: его можно передать, залогировать, отложить, отменить.</p>
<pre class="code">{ type: 'tasks/toggled', payload: 42 }    // Redux-экшен — это команда</pre>
<p><b>Зачем:</b> отделение «что сделать» от «кто сделает» даёт undo/redo, очередь команд, логирование действий и time-travel debugging. <b>Где:</b> Redux, очередь задач Bull, паттерн Outbox.</p>
<h6>Цепочка обязанностей</h6>
<p>Запрос последовательно проходит через обработчики, каждый может обработать или передать дальше.</p>
<pre class="code">app.use(logger)          // Express middleware — классическая цепочка
app.use(authenticate)
app.use(rateLimit)</pre>
<p><b>Где:</b> middleware, guards, pipes и интерцепторы в Nest, цепочка обработчиков ошибок, pipeline обработки событий.</p>
<h6>Итератор</h6>
<p>Последовательный доступ к элементам без знания внутреннего устройства. В JS встроен в язык: протокол <code class="i">Symbol.iterator</code>, на котором работают <code class="i">for...of</code>, спред и деструктуризация.</p>
<h6>Шаблонный метод</h6>
<p>Базовый класс задаёт скелет алгоритма, наследники переопределяют шаги. Во фронтенде почти вытеснен композицией и хуками, но встречается в базовых классах сервисов и в жизненном цикле фреймворков.</p>

<h5>Как отвечать на «какие паттерны вы использовали»</h5>
<p>Назовите два-три и покажите <b>задачу</b>, а не определение:</p>
<blockquote>«Стратегию — когда добавляли второго платёжного провайдера: вместо switch по типу оплаты сделали интерфейс, и третий провайдер добавился без правок существующего кода. Адаптер — чтобы обернуть SDK MinIO в свой FileStorage: когда переезжали на S3, бизнес-логику не трогали вообще. И наблюдатель — для событий между модулями, чтобы не связывать их напрямую.»</blockquote>
<div class="key">Обратная сторона медали: паттерн, применённый без задачи, — это оверинжиниринг. Интерфейс с одной реализацией «на будущее» и фабрика, которая всегда возвращает один класс, делают код сложнее без всякой выгоды. Хорошее правило — вводить паттерн, когда появился <b>второй</b> случай, а не первый.</div>` }
