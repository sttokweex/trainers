import type { TheoryArticle } from '@/engine/types'

export const ts: TheoryArticle = { id:'th-ts', topic:'TypeScript', title:'TypeScript: от основ до типового вывода',
  lead:'Пошаговый вход для базового разработчика, а затем углубление в типы и границы рантайма.',
  updates: [
    { id: 'ts-strict-2026-10', sectionTitle: 'Что strict проверяет — и чего от него не ждать', label: 'Обновлено' },
    { id: 'ts-variance-2026-10', sectionTitle: 'Вариантность: совместимость контейнеров', label: 'Обновлено' },
    { id: 'ts-contravariance-2026-10', sectionTitle: 'Когда появляется контравариантность', label: 'Обновлено' },
  ],
  body:`
<h5>Сначала простая дорожка: читаем TypeScript в коде</h5>
<p>Если слова «аннотация», «вывод типа» или «сужение» пока незнакомы — начни отсюда. Ниже сначала показаны базовые конструкции, затем статья переходит к более продвинутым возможностям. Не нужно учить сложные типы наизусть, чтобы писать повседневный TypeScript.</p>

<h5>1. Тип функции: что она принимает и что возвращает</h5>
<pre class="code">function greet(name: string): string {
  return "Привет, " + name
}

greet('Аня') // ✅ name — строка
greet(42)    // ❌ число вместо строки</pre>
<p><code class="i">name: string</code> — <b>аннотация параметра</b>: мы явно написали компилятору, что ожидаем строку. <code class="i">): string</code> — <b>тип результата</b>: функция обещает вернуть строку. Внутри функции — обычный JavaScript. Компилятор проверит вызовы до запуска приложения.</p>

<h5>2. Вывод типа: можно не повторять очевидное</h5>
<pre class="code">const age = 28       // TypeScript сам вывел number
const city = 'Томск' // TypeScript сам вывел string

let count: number = 0
count = 'много'      // ❌ переменная должна оставаться числом</pre>
<p><b>Вывод типов</b> — когда TypeScript определяет тип по присвоенному значению. Поэтому <code class="i">const age = 28</code> уже имеет тип <code class="i">number</code>; дописывать его обычно не требуется. Явная аннотация полезнее для параметров функций, контрактов и сложных состояний.</p>

<h5>3. Форма объекта и необязательное поле</h5>
<pre class="code">interface User {
  id: number
  name: string
  email?: string
}

function welcome(user: User): string {
  return "Привет, " + user.name
}</pre>
<p><code class="i">interface User</code> задаёт <b>форму объекта</b>: здесь обязательны <code class="i">id</code> и <code class="i">name</code>. Знак <code class="i">?</code> делает <code class="i">email</code> необязательным — оно может отсутствовать. Поэтому перед чтением <code class="i">user.email</code> нужно предусмотреть случай, когда значения нет.</p>
<p><code class="i">type</code> тоже может описывать объект. Для начала удобно помнить так: и <code class="i">interface</code>, и объектный <code class="i">type</code> задают форму; <code class="i">type</code> вдобавок легко создаёт объединения вариантов и псевдонимы для других типов. В обычном проекте следуй стилю команды.</p>

<h5>4. Union: значение может быть одним из нескольких вариантов</h5>
<pre class="code">type LoadState =
  | { status: 'loading' }
  | { status: 'success'; users: User[] }
  | { status: 'error'; message: string }

function show(state: LoadState) {
  if (state.status === 'success') return state.users.length
  if (state.status === 'error') return state.message
  return 'Загрузка…'
}</pre>
<p><b>Union</b> записывается через <code class="i">|</code>: <code class="i">LoadState</code> — это один из трёх объектов. Поле <code class="i">status</code> показывает, какой именно вариант сейчас есть. После проверки <code class="i">status === 'success'</code> TypeScript разрешает читать <code class="i">users</code>; в ветке ошибки доступно <code class="i">message</code>.</p>
<p>Такую проверку называют <b>сужением типа</b>: из нескольких возможных вариантов мы оставили один. Благодаря этому UI не пытается показать список пользователей до завершения запроса.</p>

<h5>5. Дженерик сохраняет тип, а не выключает проверки</h5>
<pre class="code">function first&lt;T&gt;(items: T[]): T | undefined {
  return items[0]
}

const firstNumber = first([10, 20]) // number | undefined
const firstName = first(['Аня'])   // string | undefined</pre>
<p><b>Дженерик</b> — параметр типа. Буква <code class="i">T</code> здесь означает: «тип станет известен, когда функцию вызовут». Массив принимает элементы этого типа (<code class="i">T[]</code>), результат возвращает элемент того же типа. Дополнение <code class="i">| undefined</code> нужно потому, что массив может быть пустым. Это безопаснее, чем <code class="i">any</code>, который отключил бы проверки.</p>

<h5>6. API: типы в редакторе не проверяют данные сервера</h5>
<pre class="code">const userSchema = z.object({
  id: z.number(),
  name: z.string(),
})

const raw: unknown = await response.json()
const result = userSchema.safeParse(raw)

if (result.success) {
  console.log(result.data.name) // схема подтвердила, что name — строка
} else {
  console.log('Сервер прислал данные другой формы')
}</pre>
<p><code class="i">unknown</code> значит «пока не знаем, что это за значение». Это хорошая стартовая точка для ответа API. <code class="i">safeParse</code> из zod действительно проверяет значение во время выполнения и возвращает два варианта: успех с проверенными <code class="i">data</code> или ошибку. Запись <code class="i">raw as User</code> такой проверки не делает — это лишь просьба поверить компилятору.</p>

<div class="key"><b>Короткий словарь</b><ul><li><b>Тип</b> — описание допустимых значений и операций над ними.</li><li><b>Компилятор</b> — инструмент, который проверяет код и готовит JavaScript.</li><li><b>Рантайм</b> — время, когда приложение уже выполняется в браузере или на сервере.</li><li><b>Аннотация</b> — тип, который разработчик написал явно.</li><li><b>Сужение</b> — проверка, после которой из union остаётся конкретный вариант.</li><li><b>Runtime-валидация</b> — реальная проверка значения во время работы программы.</li></ul></div>

<div class="note"><b>Где заканчивается база:</b> если понятны аннотации, форма объекта, union, дженерики и проверка ответа API — этого уже хватает для большинства повседневных задач. Следующие разделы про типовую систему глубже: читай их как материал для роста и собеседований, а не как обязательный набор заклинаний.</div>

<h5>Углубление: что TypeScript делает и чего не делает</h5>
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
<tr><th><code class="i">interface</code></th><th><code class="i">type</code></th></tr>
<tr><td>удобен для формы объектов и её расширения через <code class="i">extends</code></td><td>задаёт форму объекта и объединяет варианты через <code class="i">|</code> или поля через <code class="i">&amp;</code></td></tr>
<tr><td>может дополняться одноимённым объявлением — это называется слиянием деклараций</td><td>может быть псевдонимом примитивного, литерального или кортежного типа</td></tr>
<tr><td>пример: <code class="i">interface Admin extends User { role: string }</code></td><td>пример: <code class="i">type Id = string | number</code></td></tr>
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

<h5>Разбираем утилиты на одном типе User</h5>
<p>Встроенная утилита — это готовое преобразование <b>типа</b>. Она работает во время проверки TypeScript, а не меняет объект в браузере. Будем использовать один исходный тип:</p>
<pre class="code">interface User {
  id: number
  name: string
  email?: string
  role: 'admin' | 'editor' | 'viewer'
}</pre>
<p>Представь, что <code class="i">User</code> описывает пользователя, который уже хранится в приложении. Для формы редактирования, публичного ответа API или словаря подписей нужны другие формы данных. Утилиты позволяют получить их из исходного типа и не дублировать поля вручную.</p>

<h5>Partial&lt;T&gt; — сделать поля необязательными</h5>
<pre class="code">type UserPatch = Partial&lt;Pick&lt;User, 'name' | 'email'&gt;&gt;

const patch: UserPatch = { name: 'Аня' } // ✅ можно передать только изменённое поле
const emptyPatch: UserPatch = {}        // ✅ все поля стали необязательными</pre>
<p><b>Как читать тип:</b> сначала <code class="i">Pick</code> оставляет только разрешённые для редактирования name и email; затем <code class="i">Partial</code> делает оба поля необязательными. Поэтому нельзя случайно отправить изменение <code class="i">id</code> или <code class="i">role</code>. <code class="i">name</code> остаётся строкой, просто его теперь можно не передавать.</p>
<p><b>Где применяют:</b> объект изменений для PATCH или локальное частичное обновление. <b>Важно:</b> Partial не отправляет запрос и не удаляет поля в рантайме — это только правило для TypeScript. API всё равно должно определить, что означают отсутствующее поле и <code class="i">null</code>.</p>

<h5>Required&lt;T&gt; — сделать поля обязательными</h5>
<pre class="code">type UserWithEmail = Required&lt;Pick&lt;User, 'email'&gt;&gt;

const contact: UserWithEmail = { email: 'anya@example.com' } // ✅
const noContact: UserWithEmail = {}                         // ❌ email обязателен</pre>
<p>Здесь сначала <code class="i">Pick&lt;User, 'email'&gt;</code> оставляет только поле email. Затем <code class="i">Required&lt;...&gt;</code> снимает с него знак <code class="i">?</code>. Это полезно после шага, на котором поле уже гарантированно заполнено. Но Required не проводит проверку: если данные пришли из формы или API, наличие email сначала проверяет код или runtime-схема.</p>

<h5>Readonly&lt;T&gt; — запретить переназначать поля в TypeScript</h5>
<pre class="code">type UserSnapshot = Readonly&lt;User&gt;
declare const snapshot: UserSnapshot

snapshot.name = 'Ира' // ❌ поле только для чтения
console.log(snapshot.name) // ✅ читать можно</pre>
<p><code class="i">Readonly</code> помогает обозначить входные данные или снимок состояния, который функция не должна менять. Ограничение действует при проверке TypeScript; оно не замораживает объект в JavaScript. По умолчанию это также <b>поверхностная</b> неизменяемость: если поле содержит вложенный объект, его внутренние свойства требуют отдельной защиты.</p>

<h5>Pick&lt;T, K&gt; и Omit&lt;T, K&gt; — выбрать поля или убрать их</h5>
<pre class="code">type UserCard = Pick&lt;User, 'id' | 'name'&gt;
// { id: number; name: string }

interface UserWithSecret extends User {
  passwordHash: string
}
type PublicUser = Omit&lt;UserWithSecret, 'passwordHash'&gt;
// все поля UserWithSecret, кроме passwordHash</pre>
<p><code class="i">Pick&lt;T, K&gt;</code> оставляет перечисленные поля. <code class="i">K</code> ограничен ключами объекта, поэтому опечатка вроде <code class="i">'naem'</code> будет ошибкой. <code class="i">Omit&lt;T, K&gt;</code> делает обратное: оставляет всё, кроме перечисленных ключей.</p>
<p><b>Практика:</b> Pick создаёт компактную модель для карточки; Omit удобно использовать для производного типа без внутреннего поля. <b>Безопасность:</b> Omit сам не удаляет passwordHash из объекта. Перед отправкой ответа нужно реально собрать публичный объект или явно выбрать поля — тип не является фильтром данных.</p>

<h5>Record&lt;K, V&gt; — словарь с заданными ключами и значениями</h5>
<pre class="code">type Status = 'loading' | 'success' | 'error'
const statusLabel: Record&lt;Status, string&gt; = {
  loading: 'Загрузка',
  success: 'Готово',
  error: 'Ошибка',
}

statusLabel.success // тип значения — string
// если забыть ключ error, TypeScript сообщит об этом</pre>
<p><code class="i">Record&lt;K, V&gt;</code> строит объект-словарь: ключи берутся из <code class="i">K</code>, а значения имеют тип <code class="i">V</code>. Здесь <code class="i">Status</code> — три допустимых строки, поэтому словарь обязан описать все три подписи. Это хорошо подходит для маппинга статуса на label, иконку или цвет.</p>
<p>Если написать <code class="i">Record&lt;string, string&gt;</code>, получится открытый словарь со строковыми ключами; TypeScript уже не требует конкретного заранее известного набора статусов.</p>

<h5>Exclude&lt;T, U&gt; и Extract&lt;T, U&gt; — отфильтровать варианты union</h5>
<pre class="code">type Role = 'admin' | 'editor' | 'viewer'

type StaffRole = Exclude&lt;Role, 'viewer'&gt;
// 'admin' | 'editor' — исключили viewer

type CanEditRole = Extract&lt;Role, 'admin' | 'editor'&gt;
// 'admin' | 'editor' — оставили совпавшие варианты</pre>
<p><code class="i">Exclude</code> удаляет из union те варианты, которые подходят под второй тип. <code class="i">Extract</code> оставляет только подходящие варианты. Здесь ими фильтруют набор строковых ролей, но так же можно работать с union объектных событий или состояний.</p>
<p>Удобная аналогия: <code class="i">Exclude&lt;A, B&gt;</code> — «A без B», а <code class="i">Extract&lt;A, B&gt;</code> — «только общая часть A и B». Они не фильтруют массив во время выполнения.</p>

<h5>NonNullable&lt;T&gt; — убрать null и undefined из типа</h5>
<pre class="code">type MaybeUser = User | null | undefined
type ExistingUser = NonNullable&lt;MaybeUser&gt;
// ExistingUser равен User

function showName(user: MaybeUser) {
  if (user == null) return 'Пользователь не найден'
  return user.name // после проверки user уже User
}</pre>
<p><code class="i">NonNullable&lt;T&gt;</code> убирает из описания типа два значения: <code class="i">null</code> и <code class="i">undefined</code>. Само значение он не проверяет и не исправляет. Поэтому сначала нужна реальная проверка <code class="i">if (user == null)</code>; после неё TypeScript сужает тип в оставшейся части функции.</p>

<h5>ReturnType&lt;T&gt;, Parameters&lt;T&gt; и typeof</h5>
<pre class="code">async function loadUser(id: string, includePosts = false) {
  return { id, name: 'Аня', includePosts }
}

type LoadUserArgs = Parameters&lt;typeof loadUser&gt;
// [id: string, includePosts?: boolean]

type LoadUserPromise = ReturnType&lt;typeof loadUser&gt;
// Promise&lt;{ id: string; name: string; includePosts: boolean }&gt;</pre>
<p><code class="i">typeof loadUser</code> в позиции типа берёт тип существующей функции. Это не запускает функцию и не является обычной проверкой JavaScript. <code class="i">Parameters&lt;...&gt;</code> превращает список параметров в кортеж — массив фиксированной длины, где у каждой позиции свой тип. <code class="i">ReturnType&lt;...&gt;</code> извлекает тип результата функции.</p>
<p><b>Зачем:</b> эти утилиты помогают типизировать обёртку вокруг уже существующей функции. Если параметры или результат изменятся, зависимый тип обновится автоматически, а не останется устаревшей копией.</p>

<h5>Awaited&lt;T&gt; — достать значение из Promise</h5>
<pre class="code">type LoadedUser = Awaited&lt;ReturnType&lt;typeof loadUser&gt;&gt;
// { id: string; name: string; includePosts: boolean }</pre>
<p>ReturnType для <code class="i">async</code>-функции даёт Promise. <code class="i">Awaited</code> снимает Promise-обёртку и получает тип значения, которое окажется после <code class="i">await</code>. Вложенные Promise он раскрывает рекурсивно.</p>
<p>В обычной функции можно написать <code class="i">const user = await loadUser('7')</code> и позволить TypeScript вывести тип. Awaited особенно полезен, когда нужен этот тип отдельно: например, для кеша, тестового fixture или пропса компонента.</p>

<h5>Как они устроены изнутри</h5>
<p>На интервью могут попросить объяснить или набросать упрощённую версию утилиты. Цель — проверить, понимаешь ли ты, как преобразуются типы. Это учебная реализация, не код для копирования в приложение: встроенные утилиты уже проверены и лучше читаются.</p>
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
<p><b>Mapped type</b> — «создай новый объектный тип, пройдя по ключам старого». <code class="i">keyof T</code> получает имена полей в виде union: для User это примерно <code class="i">'id' | 'name' | 'email' | 'role'</code>. Конструкция <code class="i">[K in keyof T]</code> перебирает их по одному, а <code class="i">T[K]</code> берёт тип значения текущего поля. Поэтому <code class="i">MyPartial</code> сохраняет каждое поле, но добавляет <code class="i">?</code>.</p>
<p>Модификаторы слева от ключа меняют правило поля: <code class="i">?</code> делает поле необязательным, <code class="i">-?</code> снимает необязательность; <code class="i">readonly</code> запрещает переназначение, <code class="i">-readonly</code> убирает это ограничение. Минус здесь буквально означает «удали этот модификатор».</p>
<p><code class="i">MyPick</code> перебирает только ключи из K и копирует их типы через <code class="i">T[P]</code>. <code class="i">MyOmit</code> сначала вычисляет оставшиеся имена полей с помощью <code class="i">MyExclude&lt;keyof T, K&gt;</code>, а затем передаёт эти имена в MyPick.</p>
<p><b>Conditional type</b> — типовое условие вида <code class="i">A extends B ? X : Y</code>: если A совместим с B, результат X, иначе Y. В <code class="i">MyExclude</code> подходящий вариант превращается в <code class="i">never</code>. <code class="i">never</code> — пустой набор вариантов; в union он исчезает, поэтому остаются только не исключённые значения.</p>
<p><code class="i">infer</code> значит «выведи часть типа и назови её». В <code class="i">F extends (...args: any[]) =&gt; infer R</code> TypeScript проверяет, похож ли F на функцию, и записывает её результат в R. В <code class="i">Promise&lt;infer U&gt;</code> он достаёт тип значения внутри Promise и называет его U.</p>
<p><code class="i">MyAwaited</code> применяет это рекурсивно: если значение — Promise, достаёт внутренний тип и проверяет его снова; если Promise больше нет, возвращает тип как есть. <code class="i">DeepPartial</code> тоже рекурсивен: он проходит во вложенные объекты. Этот короткий вариант учебный: массивы, функции, Date, Map и Set требуют специальных случаев, поэтому не следует бездумно использовать такую реализацию как универсальную.</p>
<p><b>Распределение по union:</b> когда слева от <code class="i">extends</code> стоит отдельный параметр типа T, условие применяется к каждому члену union. Для <code class="i">Exclude&lt;'a' | 'b' | 'c', 'a'&gt;</code> это значит: проверить 'a', 'b', 'c' по очереди; первый превратится в never и исчезнет, останутся 'b' | 'c'. Если нужно проверить весь union целиком, оберни стороны в кортеж: <code class="i">[T] extends [U] ? ... : ...</code>.</p>

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
<p>Эти три записи решают разные задачи. Возьмём объект маршрутов: нужно проверить, что все значения — строки, и при этом работать только с реально объявленными ключами.</p>
<pre class="code">type RouteName = 'home' | 'user'

const routes = {
  home: '/',
  user: '/user/:id',
} satisfies Record&lt;RouteName, string&gt;

routes.home       // string
routes.typo       // ошибка: такого свойства нет
routes.settings   // ошибка: обязательный маршрут не добавлен</pre>
<p><code class="i">Record&lt;RouteName, string&gt;</code> здесь — проверочное требование: объект должен иметь ключи <code class="i">home</code> и <code class="i">user</code>, а значения у них должны быть строками. <code class="i">satisfies</code> проверяет, что объект подходит под это требование, но не заменяет его тип на общий <code class="i">Record</code>. Поэтому TypeScript помнит конкретные имена свойств: <code class="i">routes.home</code> существует, а <code class="i">routes.typo</code> — нет.</p>
<p>В этом примере <code class="i">routes.home</code> имеет тип <code class="i">string</code>, а не обязательно литеральный тип <code class="i">'/'</code>: свойство обычного объекта можно переназначить, поэтому строка расширяется до <code class="i">string</code>. Если нужно сохранить точные значения и запретить переназначение свойств, добавь <code class="i">as const</code>:</p>
<pre class="code">const routes = {
  home: '/',
  user: '/user/:id',
} as const satisfies Record&lt;RouteName, string&gt;

routes.home       // тип '/' — конкретное значение сохранено
routes.home = '/start' // ошибка: свойство readonly</pre>
<p>Здесь <code class="i">as const</code> просит вывести максимально конкретные типы и сделать поля readonly. <code class="i">satisfies ...</code> отдельно проверяет, что результат подходит под контракт маршрутов. <code class="i">as const</code> не замораживает объект в JavaScript — это ограничение TypeScript во время проверки.</p>
<p><b>Чем отличается аннотация?</b> Запись <code class="i">const routes: Record&lt;string, string&gt; = ...</code> сразу объявляет переменную общим словарём: TypeScript знает, что у него строковые ключи и значения, но не знает конкретный список ключей. Поэтому <code class="i">routes.typo</code> будет допустимым обращением; результатом будет <code class="i">string</code> (либо <code class="i">string | undefined</code> с <code class="i">noUncheckedIndexedAccess</code>). С <code class="i">satisfies</code> сохраняется форма конкретного объекта, поэтому опечатка в имени свойства ловится.</p>
<p><b><code class="i">as</code> — другое.</b> Запись <code class="i">value as SomeType</code> — утверждение компилятору: «считай это значение типом <code class="i">SomeType</code>». Оно не проверяет реальные данные и не меняет их в браузере. TypeScript иногда запрещает явно невозможное приведение; обход через <code class="i">unknown</code> возможен, но ответственность тогда на разработчике. Для проверки объекта используй <code class="i">satisfies</code>, а приведение оставляй для случаев, где можешь обосновать безопасность.</p>
<p><b><code class="i">as const</code></b> — специальный вариант утверждения для сохранения литералов. Без него массив расширяется до <code class="i">string[]</code>; с ним получается readonly-кортеж из двух конкретных строк:</p>
<pre class="code">const roles = ['admin', 'user'] as const
// тип: readonly ['admin', 'user']

type Role = typeof roles[number]
// 'admin' | 'user'

const role: Role = 'admin' // ✅
const badRole: Role = 'owner' // ❌ такого варианта нет</pre>
<p><code class="i">typeof roles</code> берёт тип переменной <code class="i">roles</code>. <code class="i">[number]</code> здесь — типовой доступ к элементу массива: «какой тип может быть у элемента с числовым индексом?». У readonly-кортежа это объединение типов его элементов: <code class="i">'admin' | 'user'</code>. Так список значений становится источником правды для типа.</p>
<p><b>Почему часто обходятся без <code class="i">enum</code>?</b> Обычный <code class="i">enum</code> создаёт JavaScript-объект во время выполнения. Объект с <code class="i">as const</code> и выведенный из него union обычно не требуют отдельного enum-объекта:</p>
<pre class="code">enum RoleEnum {
  Admin = 'admin',
  User = 'user',
}
const fromEnum: RoleEnum = RoleEnum.Admin

const RoleValue = {
  Admin: 'admin',
  User: 'user',
} as const
type Role = typeof RoleValue[keyof typeof RoleValue]
// 'admin' | 'user'

const fromObject: Role = RoleValue.Admin</pre>
<p>Оба варианта дают типобезопасный выбор ролей. Объект + union часто проще для сериализации, API-значений и сборщиков, потому что в JavaScript остаётся обычный объект. У <code class="i">enum</code> есть особенности: числовые enum создают обратное отображение с числа на имя; строковые enum такого отображения не имеют. Числовые enum также допускают присваивание произвольного числа в некоторых сценариях, что может ослабить проверку.</p>
<p>Фраза «<code class="i">const enum</code> всегда несовместим с <code class="i">isolatedModules</code>» слишком категорична. Поведение зависит от объявления enum и инструмента компиляции; особенно сложны ambient <code class="i">const enum</code> из внешних пакетов и сборка отдельных файлов. Vite и похожие инструменты обычно преобразуют TypeScript в JavaScript, но не выполняют полную проверку типов. Поэтому для переносимых конфигов часто выбирают <code class="i">as const</code> + union, но <code class="i">enum</code> не является автоматически неправильным выбором.</p>

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
<h5>Что strict проверяет — и чего от него не ждать</h5>
<p><code class="i">strict: true</code> в <code class="i">tsconfig</code> — общий переключатель строгих проверок. В частности, <code class="i">strictNullChecks</code> заставляет учитывать <code class="i">null</code> и <code class="i">undefined</code>, а <code class="i">noImplicitAny</code> запрещает незаметно подставлять <code class="i">any</code>, когда тип не удалось вывести. Также строже проверяются функции, <code class="i">this</code>, поля классов и обработка ошибок в <code class="i">catch</code>.</p>
<p>Это не включает вообще все полезные проверки. Например, <code class="i">noUncheckedIndexedAccess</code> — отдельный флаг: без него TypeScript считает, что у <code class="i">users[100]</code> есть тип <code class="i">User</code>, хотя в массиве может не быть сотого элемента. С этим флагом тип становится <code class="i">User | undefined</code>.</p>

<h5>Вариантность: совместимость контейнеров</h5>
<p><b>Вариантность</b> — правило, которое объясняет, как совместимость внешних типов зависит от совместимости типов внутри них. Сначала отношение простое: если <code class="i">Dog</code> расширяет <code class="i">Animal</code>, то собаку безопасно передать туда, где требуется животное: у собаки есть всё, что обещает <code class="i">Animal</code>.</p>
<pre class="code">class Animal { eat() {} }
class Dog extends Animal { bark() {} }
class Cat extends Animal { meow() {} }

const dogs: Dog[] = [new Dog()]
const animals: Animal[] = dogs // разрешено: каждый Dog — Animal</pre>
<p>Это <b>ковариантность</b>: направление сохраняется. Если <code class="i">Dog</code> подходит под <code class="i">Animal</code>, то и <code class="i">Dog[]</code> TypeScript разрешает использовать как <code class="i">Animal[]</code>. С чтением всё нормально: из <code class="i">animals</code> мы получим животное, а собака действительно животное.</p>
<p>Но массив можно менять. Переменная <code class="i">animals</code> и <code class="i">dogs</code> ссылаются на один массив. Через широкую ссылку можно положить кота, а через узкую — попробовать обращаться к нему как к собаке:</p>
<pre class="code">animals.push(new Cat()) // допустимо: Cat является Animal
dogs[1].bark()          // рантайм-ошибка: элемент dogs[1] — кот</pre>
<p>Так TypeScript допускает потенциально небезопасную запись ради удобства работы с массивами и совместимости существующего кода. Это не ошибка в твоём рассуждении: тут действительно есть компромисс в системе типов.</p>
<h5>Когда появляется контравариантность</h5>
<p>Для функций с параметрами направление наоборот. Функция, способная принять любое животное, подходит туда, где ей будут передавать только собак. А функция, принимающая только собак, не подходит туда, где ей могут передать кота:</p>
<pre class="code">type AnimalHandler = (value: Animal) =&gt; void
type DogHandler = (value: Dog) =&gt; void

const handleAnyAnimal: AnimalHandler = (animal) =&gt; animal.eat()
const handleDog: DogHandler = handleAnyAnimal // безопасно

const onlyDog: DogHandler = (dog) =&gt; dog.bark()
const handleAny: AnimalHandler = onlyDog // небезопасно: сюда может прийти Cat</pre>
<p>Это называется <b>контравариантностью параметров</b>: более общий обработчик можно поставить на место более узкого, но не наоборот. За строгую проверку таких присваиваний отвечает <code class="i">strictFunctionTypes</code>, который включается через <code class="i">strict: true</code>. У методов классов и объектов есть историческое исключение для совместимости: их параметры могут проверяться менее строго.</p>
<div class="note"><b>Практический вывод:</b> не отдавай кодам, которым нужно только читать коллекцию, изменяемый тип без необходимости. Используй <code class="i">readonly T[]</code> или <code class="i">ReadonlyArray&lt;T&gt;</code>: получатель сможет читать элементы, но не сможет вызвать <code class="i">push</code> и создать описанную дыру через эту ссылку. Это compile-time ограничение, а не заморозка объекта в рантайме.</div>` }
