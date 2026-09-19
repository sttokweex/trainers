import type { Question } from '@/engine/types'

/** TypeScript — 8 вопрос(ов) */
export const typescriptQuestions: Question[] = [
  { id:'ts-type-iface', topic:'TypeScript', type:'theory', level:'junior',
    q:'<code class="i">type</code> vs <code class="i">interface</code>: что выбрать и почему? Что такое структурная типизация?',
    answer:`<h5>Что умеет только interface</h5>
  <ul>
  <li><b>Declaration merging</b> — два одноимённых интерфейса сливаются. Так расширяют типы чужих библиотек (<code class="i">declare module 'express' { interface Request { user: User } }</code> — именно так типизируют <code class="i">req.user</code> в Nest/Express).</li>
  <li>Чуть лучше сообщения об ошибках и производительность компилятора на больших иерархиях (интерфейс кешируется по имени, type-алиас часто разворачивается).</li>
  </ul>
  <h5>Что умеет только type</h5>
  <ul>
  <li>Union и intersection: <code class="i">type Status = 'a' | 'b'</code>.</li>
  <li>Примитивы, кортежи, mapped types, conditional types, <code class="i">infer</code>, template literal types.</li>
  <li>Алиасы для функций и утилит: <code class="i">type Handler = (e: Event) =&gt; void</code>.</li>
  </ul>
  <h5>Практическое правило</h5>
  <p>Публичный контракт объекта/класса, который может расширяться — <code class="i">interface</code>. Всё остальное (юнионы, утилиты, выводимые типы, пропсы компонента) — <code class="i">type</code>. Главное — единообразие в проекте.</p>
  <h5>Структурная типизация («утиная»)</h5>
  <p>TS сравнивает типы <b>по форме</b>, а не по имени: объект подойдёт под тип, если у него есть все нужные поля. Отсюда два следствия:</p>
  <pre class="code">interface Point { x: number; y: number }
  const p = { x: 1, y: 2, z: 3 }
  const a: Point = p          // OK — лишние поля из переменной разрешены
  
  const b: Point = { x: 1, y: 2, z: 3 }
  // Ошибка! Excess property check срабатывает только
  // на объектных литералах, присваиваемых напрямую</pre>
  <div class="hint">Именно поэтому две разные сущности с одинаковыми полями взаимозаменяемы. Если это опасно (например, <code class="i">UserId</code> и <code class="i">OrderId</code> — оба string), делают <b>branded types</b>: <code class="i">type UserId = string &amp; { __brand: 'UserId' }</code>.</div>` },
  { id:'ts-generics', topic:'TypeScript', type:'manual', level:'middle',
    q:'Напишите типобезопасную функцию <code class="i">pick(obj, keys)</code>, которая возвращает объект только с указанными ключами. Тип результата должен выводиться точно.',
    starter:`// Должно работать так:
  // const user = { id: 1, name: 'Bob', email: 'b@x.ru' }
  // const short = pick(user, ['id', 'name'])
  // short.id     → number
  // short.email  → ошибка компиляции
  
  function pick(obj, keys) {
    // ваша сигнатура + реализация
  }`,
    solution:`function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const out = {} as Pick<T, K>
    for (const key of keys) {
      if (key in obj) out[key] = obj[key]
    }
    return out
  }
  
  // Разбор дженериков:
  // T extends object  — что угодно объектное; T выведется из аргумента
  // K extends keyof T — ключи ТОЛЬКО из этого объекта; K выведется
  //                     как union литералов 'id' | 'name'
  // Pick<T, K>        — результат: те же типы полей, но только выбранные
  
  // Своя реализация Pick — частый доп-вопрос:
  type MyPick<T, K extends keyof T> = { [P in K]: T[P] }
  
  // И соседние утилиты «руками»:
  type MyPartial<T>  = { [P in keyof T]?: T[P] }
  type MyRequired<T> = { [P in keyof T]-?: T[P] }
  type MyReadonly<T> = { readonly [P in keyof T]: T[P] }
  type MyOmit<T, K extends keyof any> = MyPick<T, Exclude<keyof T, K>>
  type MyExclude<T, U> = T extends U ? never : T   // distributive conditional
  type MyRecord<K extends keyof any, V> = { [P in K]: V }
  type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T
  type MyReturnType<T> = T extends (...a: any[]) => infer R ? R : never`,
    answer:`<h5>Ключевые конструкции</h5>
  <ul>
  <li><code class="i">keyof T</code> — union строковых литералов ключей.</li>
  <li><code class="i">T[K]</code> — indexed access, тип значения по ключу.</li>
  <li><code class="i">extends</code> в дженерике — это <b>ограничение</b>, а не наследование: «K должен быть одним из ключей T».</li>
  <li><code class="i">[P in K]</code> — mapped type, перебор ключей.</li>
  <li><code class="i">infer R</code> — «вытащить» тип из позиции внутри условного типа.</li>
  </ul>
  <h5>Про distributive conditional types</h5>
  <p>Условный тип с голым параметром-дженериком <b>распределяется по юнионам</b>: <code class="i">Exclude&lt;'a'|'b'|'c', 'a'&gt;</code> проверяет каждый член отдельно и даёт <code class="i">'b'|'c'</code>. Отключается обёрткой в кортеж: <code class="i">[T] extends [U] ? ... : ...</code>.</p>
  <h5>Что ещё попросят вывести</h5>
  <pre class="code">type DeepPartial&lt;T&gt; = T extends object
    ? { [P in keyof T]?: DeepPartial&lt;T[P]&gt; }
    : T
  
  type DeepReadonly&lt;T&gt; = T extends object
    ? { readonly [P in keyof T]: DeepReadonly&lt;T[P]&gt; }
    : T</pre>` },
  { id:'ts-union', topic:'TypeScript', type:'manual', level:'middle',
    q:'Что такое дискриминированный union? Типизируйте состояние загрузки так, чтобы нельзя было прочитать <code class="i">data</code>, пока идёт загрузка, и добавьте проверку на полноту через <code class="i">never</code>.',
    starter:`// Плохо — все поля опциональны, компилятор ничего не гарантирует:
  type State = {
    loading?: boolean
    data?: User[]
    error?: Error
  }
  
  // Сделайте хорошо + напишите функцию render(state), которая
  // обрабатывает все варианты и падает на этапе компиляции,
  // если добавить новый вариант и забыть его обработать.`,
    solution:`type State =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: User[] }
    | { status: 'error'; error: Error }
  
  function render(state: State): string {
    switch (state.status) {
      case 'idle':    return 'Нажмите загрузить'
      case 'loading': return 'Загрузка…'
      case 'success': return \`Найдено \${state.data.length}\`   // data доступна ТОЛЬКО здесь
      case 'error':   return state.error.message
      default:
        // exhaustiveness check: если добавить новый вариант в State
        // и не обработать — здесь будет ошибка компиляции
        return assertNever(state)
    }
  }
  
  function assertNever(value: never): never {
    throw new Error('Необработанный вариант: ' + JSON.stringify(value))
  }`,
    answer:`<h5>Почему это лучше набора опциональных полей</h5>
  <ul>
  <li>Невозможно собрать бессмысленное состояние (<code class="i">loading: true</code> + <code class="i">data</code> + <code class="i">error</code> одновременно).</li>
  <li><b>Narrowing</b>: проверка <code class="i">state.status === 'success'</code> сужает тип, и TS сам разрешает доступ к <code class="i">data</code> без <code class="i">!</code> и <code class="i">?.</code>.</li>
  <li>Добавление нового статуса подсветит <b>все</b> места, где его забыли обработать — рефакторинг становится безопасным.</li>
  </ul>
  <h5>Про never</h5>
  <p><code class="i">never</code> — тип, у которого нет значений («такого не бывает»). Присвоить в него можно только <code class="i">never</code>. Если все варианты union разобраны, в <code class="i">default</code> остаётся <code class="i">never</code> — код компилируется. Если появился необработанный вариант, туда попадёт реальный тип и компилятор ругнётся.</p>
  <h5>Где это прямо в вашем стеке</h5>
  <ul>
  <li>TanStack Query: <code class="i">status: 'pending' | 'error' | 'success'</code> — ровно этот паттерн, поэтому после <code class="i">if (query.isSuccess)</code> <code class="i">data</code> уже не <code class="i">undefined</code>.</li>
  <li>Redux-экшены: <code class="i">type</code> — дискриминатор, поэтому в <code class="i">extraReducers</code> payload типизирован по конкретному экшену.</li>
  <li>Zod: <code class="i">z.discriminatedUnion('type', [...])</code>.</li>
  </ul>` },
  { id:'ts-unknown', topic:'TypeScript', type:'theory', level:'middle',
    q:'<code class="i">any</code> vs <code class="i">unknown</code> vs <code class="i">never</code>. Что такое type guard и assertion function?',
    answer:`<h5>Три «особых» типа</h5>
  <table>
  <tr><th>Тип</th><th>Смысл</th><th>Что можно</th></tr>
  <tr><td><code class="i">any</code></td><td>«отключи проверки»</td><td>всё — и это дыра: ошибка всплывёт в рантайме</td></tr>
  <tr><td><code class="i">unknown</code></td><td>«значение есть, тип неизвестен»</td><td>ничего, пока не сузишь проверкой. Безопасный верх иерархии</td></tr>
  <tr><td><code class="i">never</code></td><td>«значения не существует»</td><td>тип функции, которая всегда бросает или зацикливается; пустой union</td></tr>
  </table>
  <p>Правило: всё, что приходит извне (<code class="i">JSON.parse</code>, <code class="i">catch (e)</code>, ответ сети, <code class="i">req.body</code>) — это <code class="i">unknown</code>, и его надо валидировать, а не кастовать.</p>
  <h5>Type guard (предикат)</h5>
  <pre class="code">function isUser(v: unknown): v is User {
    return typeof v === 'object' &amp;&amp; v !== null &amp;&amp; 'id' in v
  }
  if (isUser(data)) data.id     // здесь TS уже знает тип</pre>
  <h5>Assertion function</h5>
  <pre class="code">function assertDefined&lt;T&gt;(v: T, msg?: string): asserts v is NonNullable&lt;T&gt; {
    if (v == null) throw new Error(msg ?? 'value is null')
  }
  assertDefined(user)
  user.name                      // после вызова тип сужен на весь остаток скоупа</pre>
  <h5>Встроенные способы сужения</h5>
  <p><code class="i">typeof</code>, <code class="i">instanceof</code>, <code class="i">in</code>, проверка на <code class="i">null</code>, сравнение с литералом (дискриминант), <code class="i">Array.isArray</code>.</p>
  <div class="trap">Главная мысль для собеса: <b>TypeScript исчезает при компиляции</b>. Типы не защищают от кривого ответа бэкенда — на границе нужен рантайм-валидатор (zod, class-validator), а из него уже выводить тип через <code class="i">z.infer</code>. Именно поэтому zod есть во всех трёх ваших проектах.</div>` },
  { id:'ts-satisfies', topic:'TypeScript', type:'theory', level:'middle',
    q:'Чем <code class="i">satisfies</code> отличается от аннотации типа и от <code class="i">as</code>? Зачем <code class="i">as const</code>?',
    code:`const routes1: Record<string, string> = { home: '/', user: '/user' }
  routes1.home            // string — конкретика потеряна
  routes1.typo            // не ошибка! ключ любой
  
  const routes2 = { home: '/', user: '/user' } satisfies Record<string, string>
  routes2.home            // '/' — литеральный тип сохранён
  routes2.typo            // ошибка компиляции
  
  const routes3 = { home: '/', user: '/user' } as Record<string, string>
  // as ничего не проверяет по-настоящему — это приказ компилятору`,
    answer:`<h5>Три инструмента</h5>
  <ul>
  <li><b>Аннотация</b> <code class="i">: T</code> — проверяет соответствие и <b>расширяет</b> тип переменной до T. Конкретика теряется.</li>
  <li><b><code class="i">satisfies</code> T</b> (TS 4.9+) — проверяет соответствие, но <b>оставляет выведенный узкий тип</b>. Лучший вариант для конфигов, словарей, палитр, карт роутов.</li>
  <li><b><code class="i">as</code> T</b> — type assertion, «поверь мне». Проверок почти нет, безопасность ложная. Использовать только там, где вы знаете больше компилятора (и лучше рядом оставить комментарий почему).</li>
  </ul>
  <h5><code class="i">as const</code></h5>
  <pre class="code">const roles = ['admin', 'user'] as const
  type Role = typeof roles[number]      // 'admin' | 'user'
  
  const config = { retries: 3 } as const // все поля readonly + литеральные типы</pre>
  <p>Делает литералы <b>readonly и максимально узкими</b>. Это современная замена <code class="i">enum</code>: нет рантайм-кода, значения — обычные строки, отлично сериализуются и дружат с union.</p>
  <h5>Почему сейчас не любят enum</h5>
  <ul>
  <li>Числовой <code class="i">enum</code> генерирует объект в рантайме и допускает присваивание любого числа.</li>
  <li><code class="i">const enum</code> ломается при <code class="i">isolatedModules</code> (а это дефолт у Vite/esbuild/SWC — то есть у всех ваших проектов).</li>
  <li>Enum — номинальный островок в структурной системе, плохо стыкуется со строками из API.</li>
  </ul>
  <div class="hint">Если в проекте включён <code class="i">erasableSyntaxOnly</code> / используется type stripping в Node 22+, enum и параметры-свойства конструктора вообще недоступны.</div>` },
  { id:'ts-strict', topic:'TypeScript', type:'theory', level:'senior',
    q:'Что включает <code class="i">strict: true</code>? Почему массивы в TS небезопасны, и что такое вариантность?',
    answer:`<h5>Флаги внутри strict</h5>
  <ul>
  <li><code class="i">strictNullChecks</code> — <code class="i">null</code>/<code class="i">undefined</code> перестают входить во все типы. Самый ценный флаг.</li>
  <li><code class="i">noImplicitAny</code> — запрет неявного any.</li>
  <li><code class="i">strictFunctionTypes</code> — контравариантная проверка параметров функций.</li>
  <li><code class="i">strictBindCallApply</code>, <code class="i">strictPropertyInitialization</code>, <code class="i">noImplicitThis</code>, <code class="i">useUnknownInCatchVariables</code> (<code class="i">catch (e: unknown)</code>), <code class="i">alwaysStrict</code>.</li>
  </ul>
  <p>Отдельно (не входят в strict, но стоит включить): <code class="i">noUncheckedIndexedAccess</code> — <code class="i">arr[0]</code> становится <code class="i">T | undefined</code>, что честно; <code class="i">exactOptionalPropertyTypes</code>.</p>
  <h5>Вариантность — на пальцах</h5>
  <ul>
  <li><b>Ковариантность</b>: <code class="i">Dog</code> ⊂ <code class="i">Animal</code> ⟹ <code class="i">Dog[]</code> ⊂ <code class="i">Animal[]</code>. Так работают массивы и возвращаемые значения функций.</li>
  <li><b>Контравариантность</b>: параметры функций — наоборот. Функция, принимающая <code class="i">Animal</code>, годится там, где ждут функцию на <code class="i">Dog</code> (она умеет больше). Это и включает <code class="i">strictFunctionTypes</code>.</li>
  </ul>
  <h5>Почему массивы дырявые</h5>
  <pre class="code">const dogs: Dog[] = [new Dog()]
  const animals: Animal[] = dogs      // TS разрешает — массивы ковариантны
  animals.push(new Cat())             // тоже разрешает!
  dogs[1].bark()                      // 💥 рантайм-ошибка: там кот</pre>
  <p>Это <b>осознанная дыра</b> в системе типов TS ради удобства. Лечится <code class="i">readonly T[]</code> там, где мутация не нужна.</p>
  <h5>Другие известные дыры</h5>
  <ul>
  <li><code class="i">as</code> и <code class="i">any</code>.</li>
  <li>Индексный доступ без <code class="i">noUncheckedIndexedAccess</code>: <code class="i">arr[999]</code> имеет тип <code class="i">T</code>, а в рантайме <code class="i">undefined</code>.</li>
  <li>Отсутствие проверки на границе рантайма (ответ API типизирован «на веру»).</li>
  <li>Опциональные методы и bivariance для методов, объявленных сокращённым синтаксисом.</li>
  </ul>` },
  { id:'ts-infer-api', topic:'TypeScript', type:'manual', level:'senior',
    q:'Объясните, как tRPC добивается end-to-end типобезопасности без кодогенерации. Набросайте мини-версию этой идеи.',
    starter:`// На сервере есть роутер. На клиенте — ноль генерации кода,
  // но client.getUser.query() знает точные типы входа и выхода.
  // Как это работает? Набросайте механизм.`,
    solution:`// 1. Сервер описывает роутер и ЭКСПОРТИРУЕТ ТОЛЬКО ТИП
  export const appRouter = router({
    getUser: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => userService.find(input.id)),   // возвращает User
  })
  export type AppRouter = typeof appRouter        // ← только type, не значение
  
  // 2. Клиент импортирует ТИП из workspace-пакета (у вас это "server": "workspace:*")
  import type { AppRouter } from 'server/trpc'
  const client = createTRPCClient<AppRouter>({ links: [httpBatchLink({ url })] })
  
  // 3. Дальше всё делает вывод типов:
  //    - input выводится из zod-схемы через z.infer
  //    - output — через ReturnType резолвера
  //    Никакой кодогенерации: это один TypeScript-проект, типы «просто видны».
  
  // Упрощённая суть механизма:
  type Procedure<I, O> = { input: I; handler: (i: I) => O }
  type Router = Record<string, Procedure<any, any>>
  
  type Client<R extends Router> = {
    [K in keyof R]: {
      query: (input: R[K]['input']) => Promise<ReturnType<R[K]['handler']>>
    }
  }
  // mapped type пробегает по ключам роутера и строит клиентский тип`,
    answer:`<h5>Что важно сказать</h5>
  <ul>
  <li>Типы существуют <b>только на этапе компиляции</b> — в рантайме летит обычный HTTP (JSON, батчинг нескольких вызовов в один запрос через <code class="i">httpBatchLink</code>).</li>
  <li>Обязателен <code class="i">import type</code> — иначе бандлер утащит серверный код в клиентский бандл.</li>
  <li>Работает только в <b>монорепе с общим tsconfig</b> — отсюда pnpm workspaces в ваших проектах. Для внешних потребителей tRPC не подходит, там REST/OpenAPI или GraphQL.</li>
  <li>Валидация входа реальная, рантаймовая — её делает zod, а тип выводится из схемы (<code class="i">z.infer</code>). Один источник правды для типа и валидации.</li>
  </ul>
  <h5>Сравнение подходов</h5>
  <table>
  <tr><th></th><th>tRPC</th><th>REST + OpenAPI</th><th>GraphQL</th></tr>
  <tr><td>Типы</td><td>из кода, мгновенно</td><td>кодогенерация из схемы</td><td>кодогенерация из SDL</td></tr>
  <tr><td>Внешние клиенты</td><td>плохо (нужен TS + монорепа)</td><td>отлично</td><td>отлично</td></tr>
  <tr><td>Гибкость выборки</td><td>фиксированная</td><td>фиксированная</td><td>клиент выбирает поля</td></tr>
  <tr><td>Кеш HTTP/CDN</td><td>ограниченно (POST-батчи)</td><td>из коробки</td><td>сложно</td></tr>
  </table>` },
  { id:'ts-decorators', topic:'TypeScript', type:'theory', level:'middle',
    q:'Как работают декораторы в NestJS и TypeORM? Что такое <code class="i">reflect-metadata</code> и <code class="i">emitDecoratorMetadata</code>?',
    code:`@Injectable()
  export class UserService {
    constructor(
      @InjectRepository(User) private readonly repo: Repository<User>,
      private readonly config: ConfigService,   // ← как Nest узнал тип?
    ) {}
  }`,
    answer:`<h5>Что такое декоратор</h5>
  <p>Функция, которая выполняется <b>во время объявления класса</b> и получает ссылку на класс/метод/свойство/параметр. Она ничего не «магичит» — обычно просто <b>записывает метаданные</b> рядом с классом.</p>
  <h5>reflect-metadata</h5>
  <ul>
  <li>Полифил Reflect Metadata API: <code class="i">Reflect.defineMetadata(key, value, target)</code> / <code class="i">getMetadata</code>. Метаданные хранятся в WeakMap рядом с классом.</li>
  <li>Поэтому <code class="i">import 'reflect-metadata'</code> обязателен <b>первой строкой</b> в <code class="i">main.ts</code>.</li>
  </ul>
  <h5>emitDecoratorMetadata — ответ на вопрос из кода</h5>
  <p>С этим флагом компилятор TS дополнительно эмитит в метаданные <b>типы</b>: <code class="i">design:type</code>, <code class="i">design:paramtypes</code>, <code class="i">design:returntype</code>. Nest читает <code class="i">design:paramtypes</code> конструктора, получает массив классов-токенов <code class="i">[Repository, ConfigService]</code> и понимает, что инжектить. Это единственный случай, когда типы TS «доживают» до рантайма — и то только для классов.</p>
  <div class="trap">Отсюда правило: интерфейс инжектить нельзя (после компиляции его нет), нужен строковый/Symbol-токен: <code class="i">@Inject('MAILER')</code>. И отсюда же ломается circular dependency между модулями — лечится <code class="i">forwardRef(() =&gt; OtherModule)</code>.</div>
  <h5>Порядок выполнения</h5>
  <p>Декораторы параметров → методов/свойств → класса. Фабрика декоратора (<code class="i">@Get('/x')</code>) вызывается сразу при объявлении, а возвращаемая ей функция — при применении.</p>
  <h5>Важно про версии</h5>
  <p>В Nest/TypeORM используются <b>legacy-декораторы</b> (<code class="i">experimentalDecorators: true</code>). В TS 5.0 появились стандартные декораторы из stage-3 ECMAScript — у них другая сигнатура и <b>нет</b> <code class="i">emitDecoratorMetadata</code>. Смешивать нельзя, экосистема Nest пока на legacy.</p>` },
]
