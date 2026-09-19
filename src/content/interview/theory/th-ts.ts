import type { TheoryArticle } from '@/engine/types'

export const ts: TheoryArticle = { id:'th-ts', topic:'TypeScript', title:'TypeScript: от основ до типового вывода',
  lead:'Синтаксис, утилиты, дженерики и — главное — понимание того, где типы заканчиваются и начинается рантайм.',
  body:`
<h5>Что TypeScript делает и чего не делает</h5>
<p>TypeScript — это <b>статический анализатор</b>, который полностью исчезает при компиляции. В рантайме остаётся обычный JavaScript: ни одной проверки типов, ни одного интерфейса. Из этого вытекает главное практическое правило, о котором забывают удивительно часто.</p>
<div class="key">Типы не защищают от кривых данных извне. Ответ API, <code class="i">JSON.parse</code>, <code class="i">req.body</code>, значение из localStorage — всё это в рантайме может оказаться чем угодно, как бы вы их ни типизировали. На границе системы нужна <b>рантайм-валидация</b>: zod, class-validator. Аннотация типа — это обещание, а не проверка.</p>

<h5>Структурная типизация</h5>
<p>TypeScript сравнивает типы <b>по форме</b>, а не по имени. Объект подходит под тип, если у него есть все требуемые поля нужных типов — происхождение не важно.</p>
<pre class="code">interface Point { x: number; y: number }

const p = { x: 1, y: 2, z: 3 }
const a: Point = p           // ✅ лишние поля из переменной допустимы

const b: Point = { x: 1, y: 2, z: 3 }
// ❌ Object literal may only specify known properties</pre>
<p>Разница объясняется <b>проверкой на избыточные свойства</b>: она срабатывает только для объектных литералов, присваиваемых напрямую. Логика такая: литерал с лишним полем — почти наверняка опечатка, а переменная могла прийти откуда угодно.</p>
<p>Побочный эффект структурности: две разные по смыслу сущности с одинаковой формой взаимозаменяемы. <code class="i">UserId</code> и <code class="i">OrderId</code>, оба <code class="i">string</code>, спокойно подставятся друг вместо друга. Если это опасно, применяют <b>брендирование</b>:</p>
<pre class="code">type UserId = string &amp; { readonly __brand: 'UserId' }
const toUserId = (s: string) =&gt; s as UserId

function getUser(id: UserId) {}
getUser('abc')            // ❌ ошибка — обычная строка не подойдёт
getUser(toUserId('abc'))  // ✅</pre>

<h5>type или interface</h5>
<table>
<tr><th>Только <code class="i">interface</code></th><th>Только <code class="i">type</code></th></tr>
<tr><td>слияние деклараций — расширение чужих типов</td><td>объединения и пересечения</td></tr>
<tr><td>чуть лучше сообщения об ошибках</td><td>примитивы, кортежи, mapped и conditional types</td></tr>
<tr><td>кешируется компилятором по имени</td><td><code class="i">infer</code>, шаблонные литеральные типы</td></tr>
</table>
<p>Слияние деклараций — не косметика, а рабочий инструмент. Именно так добавляют <code class="i">req.user</code> в Express и Nest:</p>
<pre class="code">declare global {
  namespace Express {
    interface Request { user?: User }
  }
}</pre>
<p>Практическое правило: публичный контракт объекта, который могут расширять, — <code class="i">interface</code>; всё остальное (юнионы, утилиты, пропсы компонентов, выводимые типы) — <code class="i">type</code>. Важнее единообразия в проекте ничего нет.</p>

<h5>Дженерики: не «любой тип», а «связь между типами»</h5>
<p>Дженерик — это не синоним <code class="i">any</code>, а способ <b>сохранить связь</b> между входом и выходом.</p>
<pre class="code">function first&lt;T&gt;(arr: T[]): T | undefined {
  return arr[0]
}
first([1, 2, 3])        // number | undefined — тип сохранился</pre>
<p>Ключевое слово <code class="i">extends</code> в дженерике означает <b>ограничение</b>, а не наследование:</p>
<pre class="code">function pick&lt;T extends object, K extends keyof T&gt;(obj: T, keys: K[]): Pick&lt;T, K&gt; {
  const out = {} as Pick&lt;T, K&gt;
  for (const key of keys) out[key] = obj[key]
  return out
}

const user = { id: 1, name: 'Аня', email: 'a@b.ru' }
const short = pick(user, ['id', 'name'])
short.id        // number
short.email     // ❌ ошибка компиляции — поля нет в результате</pre>
<p>Здесь <code class="i">K extends keyof T</code> гарантирует, что ключи существуют у объекта, а <code class="i">Pick&lt;T, K&gt;</code> точно описывает форму результата. Такая сигнатура ловит опечатку в имени поля ещё в редакторе.</p>

<h5>Встроенные утилиты</h5>
<table>
<tr><th>Утилита</th><th>Что делает</th><th>Типичное применение</th></tr>
<tr><td><code class="i">Partial&lt;T&gt;</code></td><td>все поля опциональны</td><td>DTO для PATCH-запроса</td></tr>
<tr><td><code class="i">Required&lt;T&gt;</code></td><td>все обязательны</td><td>после валидации</td></tr>
<tr><td><code class="i">Readonly&lt;T&gt;</code></td><td>только для чтения</td><td>конфиги, состояние</td></tr>
<tr><td><code class="i">Pick&lt;T, K&gt;</code> / <code class="i">Omit&lt;T, K&gt;</code></td><td>выбрать / исключить поля</td><td><code class="i">Omit&lt;User, 'passwordHash'&gt;</code> для ответа API</td></tr>
<tr><td><code class="i">Record&lt;K, V&gt;</code></td><td>словарь</td><td><code class="i">Record&lt;Status, string&gt;</code> для подписей</td></tr>
<tr><td><code class="i">Exclude</code> / <code class="i">Extract</code></td><td>фильтрация юниона</td><td>сузить набор статусов</td></tr>
<tr><td><code class="i">NonNullable&lt;T&gt;</code></td><td>убрать null и undefined</td><td>после проверки</td></tr>
<tr><td><code class="i">Awaited&lt;T&gt;</code></td><td>распаковать промис</td><td>тип результата async-функции</td></tr>
<tr><td><code class="i">ReturnType</code> / <code class="i">Parameters</code></td><td>вытащить из сигнатуры</td><td>типизация обёрток</td></tr>
</table>

<h5>Как они устроены изнутри</h5>
<p>Уметь написать их руками — классическое задание на собеседовании, и оно проверяет понимание трёх конструкций: mapped types, conditional types и <code class="i">infer</code>.</p>
<pre class="code">type MyPartial&lt;T&gt;  = { [K in keyof T]?: T[K] }
type MyRequired&lt;T&gt; = { [K in keyof T]-?: T[K] }      // -? снимает опциональность
type MyReadonly&lt;T&gt; = { readonly [K in keyof T]: T[K] }
type Mutable&lt;T&gt;    = { -readonly [K in keyof T]: T[K] }

type MyPick&lt;T, K extends keyof T&gt; = { [P in K]: T[P] }
type MyExclude&lt;T, U&gt; = T extends U ? never : T
type MyOmit&lt;T, K extends keyof any&gt; = MyPick&lt;T, MyExclude&lt;keyof T, K&gt;&gt;

type MyReturnType&lt;F&gt; = F extends (...args: any[]) =&gt; infer R ? R : never
type MyAwaited&lt;T&gt; = T extends Promise&lt;infer U&gt; ? MyAwaited&lt;U&gt; : T

// рекурсивные — тоже частая просьба
type DeepPartial&lt;T&gt; = T extends object
  ? { [K in keyof T]?: DeepPartial&lt;T[K]&gt; }
  : T</pre>
<p><b>Распределение по юнионам</b>: условный тип с «голым» параметром применяется к каждому члену юниона отдельно. <code class="i">Exclude&lt;'a' | 'b' | 'c', 'a'&gt;</code> проверяет по очереди и собирает <code class="i">'b' | 'c'</code>. Если такое поведение мешает, его отключают обёрткой в кортеж: <code class="i">[T] extends [U] ? ... : ...</code>.</p>

<h5>Дискриминированные юнионы — самый полезный приём</h5>
<p>Вместо набора необязательных полей описывайте <b>взаимоисключающие состояния</b>:</p>
<pre class="code">// ❌ можно собрать бессмыслицу: loading и error одновременно
type State = { loading?: boolean; data?: User[]; error?: Error }

// ✅
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User[] }
  | { status: 'error'; error: Error }

function render(state: State) {
  switch (state.status) {
    case 'idle':    return 'Нажмите загрузить'
    case 'loading': return 'Загрузка…'
    case 'success': return \`Найдено \${state.data.length}\`   // data доступна только здесь
    case 'error':   return state.error.message
    default:        return assertNever(state)
  }
}

function assertNever(x: never): never {
  throw new Error('Необработанный вариант: ' + JSON.stringify(x))
}</pre>
<p>Функция <code class="i">assertNever</code> даёт <b>проверку на полноту</b>: если завтра в юнион добавят <code class="i">'cancelled'</code> и забудут обработать, компилятор подсветит именно это место. Рефакторинг становится безопасным.</p>
<p>Этот паттерн повсюду: <code class="i">status</code> в TanStack Query, <code class="i">type</code> в Redux-экшенах, <code class="i">z.discriminatedUnion</code> в zod.</p>

<div data-demo="type-narrow"></div>
<h5>any, unknown, never</h5>
<table>
<tr><th>Тип</th><th>Смысл</th><th>Что с ним можно</th></tr>
<tr><td><code class="i">any</code></td><td>«не проверяй»</td><td>всё — и это дыра: ошибка всплывёт в рантайме</td></tr>
<tr><td><code class="i">unknown</code></td><td>«тип пока неизвестен»</td><td>ничего, пока не сузишь. Безопасная альтернатива any</td></tr>
<tr><td><code class="i">never</code></td><td>«значения не существует»</td><td>функция всегда бросает; пустой юнион; проверка полноты</td></tr>
</table>
<p>Сужать <code class="i">unknown</code> можно проверками <code class="i">typeof</code>, <code class="i">instanceof</code>, <code class="i">in</code>, сравнением с литералом — или собственными предикатами:</p>
<pre class="code">// type guard
function isUser(v: unknown): v is User {
  return typeof v === 'object' &amp;&amp; v !== null &amp;&amp; 'id' in v
}

// assertion function — сужает тип до конца области видимости
function assertDefined&lt;T&gt;(v: T, msg?: string): asserts v is NonNullable&lt;T&gt; {
  if (v == null) throw new Error(msg ?? 'value is null')
}</pre>

<h5>satisfies, as const и почему уходят от enum</h5>
<pre class="code">const routes = { home: '/', user: '/user/:id' } satisfies Record&lt;string, string&gt;
routes.home       // тип '/' — литерал сохранён
routes.typo       // ❌ ошибка — ключа нет

const roles = ['admin', 'user'] as const
type Role = typeof roles[number]      // 'admin' | 'user'</pre>
<p><b>Аннотация</b> проверяет и расширяет тип (конкретика теряется). <b><code class="i">satisfies</code></b> проверяет, но оставляет выведенный узкий тип — лучший выбор для конфигов и словарей. <b><code class="i">as</code></b> не проверяет почти ничего: это приказ компилятору и красный флаг в ревью.</p>
<p>От <code class="i">enum</code> сегодня чаще отказываются: он генерирует объект в рантайме, числовой вариант принимает любое число, <code class="i">const enum</code> несовместим с <code class="i">isolatedModules</code> (а это режим по умолчанию у Vite, esbuild и SWC — то есть у всех ваших проектов). Связка <code class="i">as const</code> + union решает те же задачи без рантайм-следа.</p>

<h5>Один источник правды: схема → тип</h5>
<pre class="code">import { z } from 'zod'

const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
})

type User = z.infer&lt;typeof UserSchema&gt;     // тип ВЫВЕДЕН из схемы

const user = UserSchema.parse(await res.json())   // бросит при несоответствии
const safe = UserSchema.safeParse(data)           // { success, data | error }</pre>
<p>Это и есть правильный ответ на проблему из начала статьи. Схема одна, из неё получаются и рантайм-проверка, и статический тип — они не могут разойтись. А в монорепе ту же схему использует и клиент, и сервер.</p>

<h5>Настройки, которые стоит включить</h5>
<ul>
<li><code class="i">strict: true</code> — прежде всего ради <code class="i">strictNullChecks</code>. Без него половина пользы TypeScript теряется.</li>
<li><code class="i">noUncheckedIndexedAccess</code> — <code class="i">arr[0]</code> становится <code class="i">T | undefined</code>, что честно отражает реальность.</li>
<li><code class="i">noUnusedLocals</code>, <code class="i">noUnusedParameters</code>, <code class="i">noFallthroughCasesInSwitch</code>.</li>
</ul>
<div class="note">Известная дыра, о которой полезно знать: массивы в TypeScript <b>ковариантны</b>. <code class="i">Dog[]</code> присваивается в <code class="i">Animal[]</code>, после чего туда можно положить кота — и получить ошибку в рантайме. Это осознанный компромисс ради удобства; страхует <code class="i">readonly T[]</code> там, где мутация не нужна.</div>` }
