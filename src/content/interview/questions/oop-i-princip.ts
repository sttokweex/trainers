import type { Question } from '@/engine/types'

/** ООП и принципы — 5 вопрос(ов) */
export const oopIPrincipQuestions: Question[] = [
  { id:'oop-base', topic:'ООП и принципы', type:'theory', level:'junior',
    q:'Четыре принципа ООП: инкапсуляция, наследование, полиморфизм, абстракция. Объясните каждый на примере из реального кода.',
    code:`class PaymentProvider {
    protected readonly apiKey: string          // инкапсуляция
    constructor(apiKey: string) { this.apiKey = apiKey }
  
    async pay(amount: number): Promise<Receipt> {   // абстракция: контракт
      throw new Error('not implemented')
    }
  }
  
  class YooKassa extends PaymentProvider {          // наследование
    async pay(amount: number) { /* ... */ }         // полиморфизм
  }
  class TBank extends PaymentProvider {
    async pay(amount: number) { /* ... */ }
  }
  
  // вызывающий код не знает, какой именно провайдер
  async function checkout(provider: PaymentProvider, amount: number) {
    return provider.pay(amount)
  }`,
    answer:`<h5>Четыре принципа</h5>
  <ul>
  <li><b>Инкапсуляция</b> — сокрытие внутреннего состояния за интерфейсом. В TS: <code class="i">private</code>/<code class="i">protected</code> (только на этапе компиляции) и приватные поля <code class="i">#field</code> (настоящие, на уровне рантайма). Смысл: менять внутренности можно свободно, пока публичный контракт тот же.</li>
  <li><b>Наследование</b> — переиспользование через отношение «является». <code class="i">YooKassa</code> <i>является</i> платёжным провайдером.</li>
  <li><b>Полиморфизм</b> — один интерфейс, разные реализации. <code class="i">checkout</code> работает с любым провайдером и не знает, с каким именно.</li>
  <li><b>Абстракция</b> — выделение существенного и сокрытие деталей. Клиент знает «можно оплатить», а не «как формируется подпись запроса к банку».</li>
  </ul>
  <h5>Композиция вместо наследования — главный современный тезис</h5>
  <p>Наследование создаёт <b>жёсткую связь</b>: изменение родителя ломает всех потомков (проблема хрупкого базового класса), а иерархия глубже 2–3 уровней становится нечитаемой. Классический контрпример — «квадрат наследует прямоугольник», который ломает подстановку.</p>
  <pre class="code">// ❌ наследование ради переиспользования
  class Service extends BaseServiceWithLoggerAndCache {}
  
  // ✅ композиция: собрали из независимых частей
  class OrderService {
    constructor(
      private readonly repo: OrderRepository,
      private readonly logger: Logger,
      private readonly cache: CacheService,
    ) {}
  }</pre>
  <p>Ровно это делает <b>DI в NestJS</b>: зависимости внедряются, а не наследуются. И это же во фронтенде: React отказался от классовых миксинов и HOC-наследования в пользу <b>хуков</b> — композиции поведения.</p>
  <h5>Как отвечать</h5>
  <p>Не пересказывайте определения — покажите <b>зачем</b>: «инкапсуляция нужна, чтобы я мог переписать внутренности сервиса, не сломав десять мест вызова». И обязательно добавьте про «композиция предпочтительнее наследования» — это признак зрелости.</p>` },
  { id:'oop-solid', topic:'ООП и принципы', type:'theory', level:'middle',
    q:'Расшифруйте SOLID. Приведите по примеру нарушения и исправления для каждого принципа.',
    answer:`<h5>S — Single Responsibility</h5>
  <p>У класса должна быть <b>одна причина для изменения</b>. Не «делает одну вещь», а именно «отвечает перед одним заинтересованным лицом».</p>
  <pre class="code">// ❌ три причины меняться: бизнес-правила, формат письма, схема БД
  class UserService {
    register(dto) { /* валидация + SQL + HTML письма */ }
  }
  // ✅
  class UserService { constructor(repo, mailer, validator) {} }</pre>
  <h5>O — Open/Closed</h5>
  <p>Открыт для расширения, закрыт для изменения. Добавление нового поведения не должно требовать правки существующего кода.</p>
  <pre class="code">// ❌ каждый новый провайдер — правка switch
  function pay(type, amount) {
    switch (type) { case 'yookassa': ...; case 'tbank': ... }
  }
  // ✅ новый провайдер = новый класс, старый код не трогаем
  interface PaymentProvider { pay(amount: number): Promise&lt;Receipt&gt; }</pre>
  <h5>L — Liskov Substitution</h5>
  <p>Потомка должно быть можно подставить вместо родителя, не сломав программу. Нельзя усиливать предусловия и ослаблять постусловия.</p>
  <pre class="code">// ❌ нарушение: наследник запрещает то, что родитель разрешал
  class ReadOnlyRepo extends Repo {
    save() { throw new Error('не поддерживается') }
  }
  // ✅ разделить интерфейсы: Readable и Writable</pre>
  <h5>I — Interface Segregation</h5>
  <p>Лучше несколько узких интерфейсов, чем один толстый. Клиент не должен зависеть от методов, которые не использует.</p>
  <pre class="code">// ❌ interface Storage { read; write; delete; archive; encrypt }
  // ✅ interface Readable { read }  interface Writable { write; delete }</pre>
  <h5>D — Dependency Inversion</h5>
  <p>Модули верхнего уровня не зависят от нижнего — оба зависят от <b>абстракций</b>. Это буквально то, ради чего существует DI-контейнер в Nest.</p>
  <pre class="code">// ❌ сервис намертво привязан к конкретной реализации
  class OrderService { private mailer = new SmtpMailer() }
  
  // ✅ зависит от интерфейса, конкретика приходит извне
  class OrderService { constructor(@Inject(MAILER) private mailer: Mailer) {} }
  // в тестах подставляем FakeMailer, в проде — SmtpMailer</pre>
  <h5>Как отвечать на собесе</h5>
  <p>Слабый ответ — расшифровка аббревиатуры. Сильный — <b>назвать симптом</b>: «SRP нарушен, если при изменении шаблона письма приходится править сервис пользователей»; «DIP соблюдён, если сервис можно протестировать без сети и БД». И честная оговорка: SOLID — это ориентиры, а не догма; слепое дробление на десятки классов-обёрток вредит читаемости не меньше, чем god object.</p>` },
  { id:'oop-dry', topic:'ООП и принципы', type:'theory', level:'junior',
    q:'DRY, KISS, YAGNI, связность и связанность. Когда DRY вредит?',
    answer:`<h5>Принципы</h5>
  <ul>
  <li><b>DRY</b> (Don't Repeat Yourself) — каждое <b>знание</b> должно иметь единственное представление в системе. Обратите внимание: речь о знании, а не о совпадающих строчках кода.</li>
  <li><b>KISS</b> (Keep It Simple) — простое решение предпочтительнее умного. Код читают в 10 раз чаще, чем пишут.</li>
  <li><b>YAGNI</b> (You Aren't Gonna Need It) — не пишите «на будущее». Абстракция «на вырост» обычно не подходит под реальное требование, когда оно приходит, но мешает уже сейчас.</li>
  <li><b>Least Astonishment</b> — код должен вести себя так, как ожидает читатель. Функция <code class="i">getUser</code> не должна ничего удалять.</li>
  <li><b>Закон Деметры</b> — «не разговаривай с незнакомцами»: <code class="i">order.customer.address.city</code> — цепочка, которая ломается от любого изменения в глубине.</li>
  </ul>
  <h5>Связность и связанность — важнее, чем SOLID</h5>
  <table>
  <tr><th>Cohesion (связность) — внутри модуля</th><th>Coupling (связанность) — между модулями</th></tr>
  <tr><td>нужна <b>высокая</b>: всё в модуле работает на одну задачу</td><td>нужна <b>низкая</b>: модули знают друг о друге минимум</td></tr>
  <tr><td>плохо: папка <code class="i">utils</code> со 100 несвязанными функциями</td><td>плохо: изменение в одном модуле ломает пять других</td></tr>
  </table>
  <p>Если из всего разговора об архитектуре запомнить одну вещь — запомните эту пару. Именно на ней строятся и FSD, и модули Nest.</p>
  <h5>Когда DRY вредит — обязательно скажите это</h5>
  <p>Ошибка — устранять <b>случайное</b> совпадение кода. Две функции могут выглядеть одинаково сегодня, но меняться по разным причинам завтра. Объединив их, вы связали два несвязанных требования: правка для одного клиента ломает другого. Появляются флаги <code class="i">if (isAdmin)</code> внутри «общей» функции — верный признак ошибочного DRY.</p>
  <p>Контрформулировки, которые ценят: <b>WET</b> («write everything twice» — дублируй, пока не увидел третий случай) и <b>«преждевременная абстракция хуже дублирования»</b> (Sandi Metz: «duplication is far cheaper than the wrong abstraction»).</p>
  <div class="hint">Практическое правило: дублирование <b>данных и бизнес-правил</b> — почти всегда плохо (одна ставка НДС в двух местах = баг). Дублирование <b>формы кода</b> — часто нормально.</div>` },
  { id:'oop-patterns', topic:'ООП и принципы', type:'manual', level:'senior',
    q:'Какие паттерны проектирования вы реально использовали? Напишите по короткому примеру: Стратегия, Наблюдатель, Фабрика, Адаптер, Декоратор, Синглтон.',
    starter:`// Напишите минимальные примеры на TS и назовите,
  // где каждый встречается в вашем стеке`,
    solution:`// ─── СТРАТЕГИЯ: подменяем алгоритм, не трогая клиента ───
  interface PricingStrategy { calc(base: number): number }
  class Regular  implements PricingStrategy { calc(b: number) { return b } }
  class Premium  implements PricingStrategy { calc(b: number) { return b * 0.8 } }
  
  class Checkout {
    constructor(private strategy: PricingStrategy) {}
    total(base: number) { return this.strategy.calc(base) }
  }
  // Где: провайдеры оплаты, способы доставки, разные алгоритмы сортировки.
  // Это же — Open/Closed на практике.
  
  // ─── НАБЛЮДАТЕЛЬ: подписка на события ───
  class Emitter {
    private handlers = new Map<string, Set<Function>>()
    on(ev: string, fn: Function) {
      (this.handlers.get(ev) ?? this.handlers.set(ev, new Set()).get(ev)!).add(fn)
      return () => this.handlers.get(ev)?.delete(fn)
    }
    emit(ev: string, payload?: unknown) {
      for (const fn of [...(this.handlers.get(ev) ?? [])]) fn(payload)
    }
  }
  // Где: DOM-события, @nestjs/event-emitter, socket.io, подписка стора в Redux,
  // RxJS в Angular/Nest-интерцепторах.
  
  // ─── ФАБРИКА: создание объекта спрятано за функцией ───
  function createLogger(env: string): Logger {
    return env === 'production' ? new JsonLogger() : new PrettyLogger()
  }
  // Где: useFactory-провайдеры Nest, createStore, createTRPCClient.
  
  // ─── АДАПТЕР: приводим чужой интерфейс к нужному ───
  class S3Adapter implements FileStorage {
    constructor(private s3: S3Client) {}
    async save(key: string, data: Buffer) {            // наш контракт
      await this.s3.send(new PutObjectCommand({ Key: key, Body: data }))
    }
  }
  // Где: обёртки над внешними SDK (MinIO, YooKassa), platform-адаптеры
  // Express/Fastify в Nest. Позволяет заменить вендора, не трогая бизнес-логику.
  
  // ─── ДЕКОРАТОР: добавляем поведение, сохраняя интерфейс ───
  function withCache<T>(fn: (key: string) => Promise<T>) {
    const cache = new Map<string, T>()
    return async (key: string): Promise<T> => {
      if (cache.has(key)) return cache.get(key)!
      const value = await fn(key)
      cache.set(key, value)
      return value
    }
  }
  // Где: интерцепторы Nest, middleware Express, HOC в React,
  // @Injectable()/@UseGuards() — буквально декораторы.
  
  // ─── СИНГЛТОН: один экземпляр на приложение ───
  // В JS обычно не нужен отдельный паттерн: модуль сам по себе синглтон
  export const db = new DataSource(config)
  // В Nest все провайдеры — синглтоны по умолчанию (scope: DEFAULT).`,
    answer:`<h5>Как отвечать, чтобы не звучать заученно</h5>
  <p>Худший ответ — перечисление 23 паттернов GoF. Лучший — <b>назвать задачу, которую паттерн решает, и место в вашем коде</b>. Интервьюер проверяет, узнаёте ли вы паттерны в уже написанном коде, а не помните ли UML-диаграммы.</p>
  <h5>Паттерны, которые вы применяете, даже не называя</h5>
  <ul>
  <li><b>Модуль</b> — каждый ES-модуль с приватным состоянием и публичным экспортом.</li>
  <li><b>Фасад</b> — сервисный слой, прячущий за одним методом три репозитория и внешний API.</li>
  <li><b>Репозиторий</b> — доступ к данным за интерфейсом, бизнес-логика не знает про SQL.</li>
  <li><b>Цепочка обязанностей</b> — middleware/pipes/guards в Nest и Express.</li>
  <li><b>Компоновщик</b> — дерево React-компонентов, дерево категорий.</li>
  <li><b>Прокси</b> — Immer в Redux Toolkit, реактивность во Vue, Proxy-обёртки для логирования.</li>
  <li><b>Команда</b> — Redux-экшены: объект, описывающий действие, отделён от исполнителя (редьюсера).</li>
  </ul>
  <h5>Про антипаттерны — тоже спросят</h5>
  <p>God object (класс на 2000 строк), spaghetti code, magic numbers (<code class="i">if (status === 3)</code> вместо enum), copy-paste программирование, преждевременная оптимизация, «утечка абстракции» (репозиторий возвращает объект TypeORM с методами БД прямо в контроллер), callback hell.</p>
  <div class="trap">Синглтон часто называют антипаттерном: он прячет зависимость (её не видно в сигнатуре), мешает тестам (глобальное состояние протекает между кейсами) и плохо живёт в многопоточной среде. В Node-приложениях его почти всегда заменяет DI-контейнер или обычный экспорт из модуля.</div>` },
  { id:'oop-fp', topic:'ООП и принципы', type:'theory', level:'middle',
    q:'Функциональное программирование: чистые функции, иммутабельность, каррирование, композиция. Почему React и Redux построены на этих идеях?',
    code:`// Чистая функция: тот же вход → тот же выход, без побочных эффектов
  const add = (a, b) => a + b
  
  // Нечистая: зависит от внешнего состояния и меняет его
  let total = 0
  const addToTotal = (n) => { total += n; return total }
  
  // Композиция
  const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x)
  const slugify = pipe(
    (s) => s.trim(),
    (s) => s.toLowerCase(),
    (s) => s.replace(/\s+/g, '-'),
  )
  slugify('  Привет Мир  ')   // 'привет-мир'`,
    answer:`<h5>Чистая функция</h5>
  <p>Два условия: (1) результат зависит только от аргументов, (2) нет побочных эффектов — не меняет внешнее состояние, не пишет в БД, не логирует, не мутирует аргументы.</p>
  <p>Практическая выгода: такую функцию <b>легко тестировать</b> (не нужны моки), <b>можно кешировать</b> (мемоизация), <b>безопасно вызывать параллельно и повторно</b>. Именно поэтому React требует, чтобы рендер был чистым — иначе конкурентный рендеринг, который может прервать и перезапустить компонент, давал бы разный результат.</p>
  <h5>Иммутабельность</h5>
  <p>Не меняем данные, а создаём новые версии. Даёт сравнение по ссылке за O(1) (на этом стоит вся оптимизация React и Redux), предсказуемость и time-travel debugging.</p>
  <pre class="code">// ❌ мутация — React не увидит изменения, ссылка та же
  items.push(newItem); setItems(items)
  
  // ✅ новая ссылка
  setItems([...items, newItem])
  setItems(items.map(i =&gt; i.id === id ? { ...i, done: true } : i))
  setItems(items.filter(i =&gt; i.id !== id))</pre>
  <h5>Каррирование и частичное применение</h5>
  <pre class="code">const log = (level) =&gt; (module) =&gt; (msg) =&gt; console.log(\`[\${level}][\${module}] \${msg}\`)
  const errorLog = log('error')('payments')
  errorLog('таймаут провайдера')</pre>
  <p>Смысл — зафиксировать часть аргументов заранее и получить специализированную функцию. Отсюда же <code class="i">connect(mapState)(Component)</code> в старом Redux и множество HOC.</p>
  <h5>Другие полезные понятия</h5>
  <ul>
  <li><b>Функция высшего порядка</b> — принимает или возвращает функцию: <code class="i">map</code>, <code class="i">filter</code>, <code class="i">debounce</code>, HOC.</li>
  <li><b>Ссылочная прозрачность</b> — вызов можно заменить его результатом, ничего не изменится.</li>
  <li><b>Декларативность vs императивность</b>: «что нужно получить» против «как это сделать по шагам». React декларативен, работа с DOM руками — императивна.</li>
  </ul>
  <h5>Честная оговорка</h5>
  <p>Побочные эффекты неизбежны — без них программа бесполезна. Идея ФП не в том, чтобы их запретить, а в том, чтобы <b>вытеснить их на края</b>: чистое ядро с бизнес-логикой, эффекты по краям (useEffect, репозитории, обработчики). Это же — <b>functional core, imperative shell</b>. Сказать это на собесе — сильный ход.</p>` },
]
