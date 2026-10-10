import type { TheoryArticle } from '@/engine/types'

export const zod: TheoryArticle = {
  id: 'th-zod',
  topic: 'TypeScript',
  title: 'Zod: проверка данных и типы на границах приложения',
  lead: 'Разбираемся, зачем схема нужна рядом с TypeScript, как работают parse и safeParse, и как получать статические типы из runtime-проверки.',
  body: `
<h5>1. Главная идея: тип TypeScript не проверяет данные в браузере</h5>
<p>TypeScript проверяет исходный код до запуска приложения. После сборки типы стираются: по сети передаются обычные JSON-байты, а не тип <code class="i">User</code>. Поэтому такая запись не проверяет настоящий ответ сервера:</p>
<pre class="code">type User = { id: number; name: string }

const user = await response.json() as User
// Компилятор поверит нам.
// Но если сервер прислал { id: 'не число' }, проверка этого не заметит.</pre>
<p><b>Zod</b> — библиотека для описания схем и проверки значений во время выполнения. Схема — это объект, который знает, какие данные допустимы. Проверка получает реальное значение и либо подтверждает, что оно соответствует схеме, либо сообщает об ошибках.</p>
<div class="key">TypeScript помогает разработчику правильно использовать данные в коде. Zod проверяет сами данные в запущенном приложении. Это разные уровни защиты.</div>

<h5>2. Первая схема: строка, число и объект</h5>
<pre class="code">import { z } from 'zod'

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
})</pre>
<p><code class="i">z.string()</code> задаёт схему строки, <code class="i">z.number()</code> — числа, а <code class="i">z.object(...)</code> собирает из схем полей схему объекта. <code class="i">z.string().email()</code> проверяет не только тип «строка», но и формат адреса электронной почты.</p>
<p>Важно: суффикс <code class="i">Schema</code> в имени — просто соглашение. Это не пользовательский тип данных, а значение JavaScript, которое можно вызвать при проверке.</p>

<h5>3. parse: проверить и получить данные или получить исключение</h5>
<pre class="code">const user = UserSchema.parse({
  id: 7,
  name: 'Аня',
  email: 'anya@example.com',
})

user.name // string — проверенные данные</pre>
<p><code class="i">parse(value)</code> проверяет значение сразу. Если всё подходит, возвращает проверенные данные с выведенным типом. Если нет — выбрасывает исключение ZodError с описанием проблем.</p>
<pre class="code">UserSchema.parse({ id: '7', name: 'Аня', email: 'не email' })
// бросит ZodError: id не число и email не прошёл проверку</pre>
<p>Используй <code class="i">parse</code>, когда ошибка должна перейти в обычную обработку исключений: например, её поймает общий обработчик запроса или граница приложения.</p>

<h5>4. safeParse: проверить без исключения</h5>
<pre class="code">const result = UserSchema.safeParse(raw)

if (result.success) {
  result.data.name       // здесь тип уже проверен
} else {
  result.error.issues    // список ошибок проверки
}</pre>
<p><code class="i">safeParse(value)</code> тоже выполняет настоящую проверку, но не выбрасывает ошибку при обычном несовпадении. Он возвращает один из двух вариантов: успех с <code class="i">data</code> или неудачу с <code class="i">error</code>. Проверка <code class="i">result.success</code> сужает union, поэтому в каждой ветке доступны только подходящие поля.</p>
<p>Это удобно, когда несовпадение — ожидаемая ситуация и интерфейс должен показать своё состояние ошибки, а не падать.</p>

<h5>5. Откуда берётся TypeScript-тип</h5>
<pre class="code">const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  role: z.enum(['user', 'admin']),
})

type User = z.infer&lt;typeof UserSchema&gt;
// { id: number; name: string; role: 'user' | 'admin' }</pre>
<p>Здесь схема и тип связаны:</p>
<ul>
  <li><code class="i">UserSchema</code> — значение JavaScript, которое проверяет данные в рантайме.</li>
  <li><code class="i">typeof UserSchema</code> — тип этого значения-схемы.</li>
  <li><code class="i">z.infer&lt;...&gt;</code> — утилитный тип Zod, который извлекает из схемы тип проверенных данных.</li>
</ul>
<p>Мы не пишем отдельно схему и <code class="i">type User = ...</code> вручную. Если поменять правило в схеме, выведенный тип обновится вместе с ним. Это снижает риск, что runtime-проверка и TypeScript-контракт разойдутся.</p>

<h5>6. Проверяем недоверенный ответ API</h5>
<pre class="code">async function loadUser(id: number) {
  const response = await fetch('/api/users/' + id)
  if (!response.ok) throw new Error('Не удалось загрузить пользователя')

  const raw: unknown = await response.json()
  return UserSchema.parse(raw)
}

const user = await loadUser(7)
user.role // 'user' | 'admin'</pre>
<p>Ответ сначала имеет тип <code class="i">unknown</code>: мы ещё не доказали, что внутри. <code class="i">parse</code> проверяет реальные данные и только после успеха возвращает значение типа, полученного из схемы. Не подменяй этот шаг на <code class="i">as User</code>: приведение говорит компилятору поверить, но не проверяет ответ.</p>
<p>Такая граница есть не только у HTTP: также проверяй содержимое <code class="i">localStorage</code>, сообщения из WebView/платформенного SDK, данные из файлов и значения из внешних библиотек, если их форма не гарантирована.</p>

<h5>7. Необязательные поля, null и значения по умолчанию</h5>
<pre class="code">const ProfileSchema = z.object({
  nickname: z.string().optional(), // поле может отсутствовать
  bio: z.string().nullable(),      // поле есть, значение может быть null
  pageSize: z.number().default(20),
})</pre>
<p><code class="i">optional()</code> разрешает отсутствие поля или значение <code class="i">undefined</code>. <code class="i">nullable()</code> разрешает именно <code class="i">null</code>, но поле при этом ожидается. Это разные случаи: API может не прислать поле совсем или явно прислать пустое значение.</p>
<p><code class="i">default(20)</code> подставляет значение по умолчанию, если входное значение отсутствует. Проверенный результат может поэтому отличаться от исходного объекта.</p>

<h5>8. Массивы, объединения и вложенные объекты</h5>
<pre class="code">const TeamSchema = z.object({
  name: z.string(),
  members: z.array(UserSchema),
  visibility: z.enum(['private', 'public']),
})

const SearchResultSchema = z.union([
  z.object({ status: z.literal('success'), users: z.array(UserSchema) }),
  z.object({ status: z.literal('error'), message: z.string() }),
])</pre>
<p><code class="i">z.array(UserSchema)</code> проверяет, что пришёл массив и каждый его элемент соответствует схеме пользователя. <code class="i">z.union([...])</code> принимает данные, подходящие хотя бы под один из вариантов. Для union-а с общим полем-дискриминантом можно использовать <code class="i">z.discriminatedUnion</code>: она выбирает вариант по значению, например <code class="i">status</code>.</p>

<h5>9. Дополнительные правила: refine</h5>
<pre class="code">const PasswordSchema = z.string().min(12)

const RegistrationSchema = z.object({
  password: PasswordSchema,
  confirmPassword: z.string(),
}).refine(
  (value) =&gt; value.password === value.confirmPassword,
  { message: 'Пароли должны совпадать', path: ['confirmPassword'] },
)</pre>
<p>Базовые схемы проверяют типы и стандартные условия: строка, число, минимальная длина. <code class="i">refine</code> добавляет собственное правило для значения. Здесь проверка зависит от двух полей сразу, поэтому её добавили на схему всего объекта.</p>
<p>Сообщение и <code class="i">path</code> позволяют связать ошибку с нужным полем формы. Валидация помогает UX на клиенте, но критические бизнес-правила сервер всё равно обязан проверять сам.</p>

<h5>10. Преобразование данных и input/output-типы</h5>
<pre class="code">const PageSchema = z.string().transform((value) =&gt; Number(value))

type PageInput = z.input&lt;typeof PageSchema&gt;   // string
type PageOutput = z.output&lt;typeof PageSchema&gt; // number
type Page = z.infer&lt;typeof PageSchema&gt;        // number</pre>
<p><code class="i">transform</code> сначала проверяет вход по схеме, затем преобразует его. Поэтому тип до преобразования и тип результата могут различаться: <code class="i">z.input</code> — что схема принимает, <code class="i">z.output</code> — что выдаёт после проверки и преобразований. <code class="i">z.infer</code> обычно означает именно выходной тип.</p>
<p>Не преобразуй данные автоматически без причины. Например, строку из query-параметра можно преобразовать в число, но нужно также определить, что делать со значениями <code class="i">'abc'</code>, пустой строкой и отрицательным числом.</p>

<h5>11. Зачем Zod в монорепозитории и tRPC</h5>
<pre class="code">const CreateUserInput = z.object({
  email: z.string().email(),
  name: z.string().min(1),
})

const appRouter = t.router({
  createUser: publicProcedure
    .input(CreateUserInput)
    .mutation(({ input }) =&gt; userService.create(input)),
})

export type AppRouter = typeof appRouter</pre>
<p>В монорепозитории типизированный клиент получает типы процедур через <code class="i">AppRouter</code>. Это не отменяет Zod: TypeScript-типы исчезают при сборке, а сервер принимает реальные HTTP-данные. В tRPC схема <code class="i">.input(...)</code> проверяет запрос в рантайме на сервере и из той же схемы выводится тип входа для клиента.</p>
<p>Даже если штатный клиент не позволяет отправить неверный объект, запрос всё ещё может прийти от старой открытой вкладки, вручную написанного HTTP-клиента, другого приложения или кода с небезопасным <code class="i">any</code>. Серверная схема ставит проверку у границы доверия.</p>
<p>Сам tRPC не требует именно Zod: ему нужен валидатор, интегрированный с адаптером. Zod — распространённый вариант, потому что он одновременно удобен для runtime-проверок и вывода TypeScript-типов.</p>

<h5>12. Что Zod не делает</h5>
<ul>
  <li>Не заменяет TypeScript: типизация исходников всё ещё помогает при разработке.</li>
  <li>Не гарантирует корректность бизнес-логики. Например, схема может проверить, что email — строка, но право пользователя менять чужой профиль проверяет серверная логика.</li>
  <li>Не заставляет валидировать каждое значение в приложении. Проверяй границы, где данные поступают извне, а внутри передавай уже проверенные типы.</li>
  <li>Не делает запросы успешными: отдельно обрабатывай сетевые ошибки, HTTP-статусы и ошибки самой валидации.</li>
</ul>
<div class="key">Короткий ответ для собеседования: TypeScript проверяет отношения типов в исходном коде, а Zod валидирует реальные значения в рантайме. Схема может быть общим источником и для проверки данных, и для вывода TS-типа.</div>
`,
}
