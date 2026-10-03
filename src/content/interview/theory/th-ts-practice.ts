import type { TheoryArticle } from '@/engine/types'

export const tsPractice: TheoryArticle = {
  id: 'th-ts-practice',
  topic: 'TypeScript',
  title: 'TypeScript на практике: от UI до API',
  lead: 'Пошагово типизируем состояние интерфейса, обработчики и ответ сервера. Главное правило: тип помогает писать код, но не проверяет реальные данные сам по себе.',
  body: `
<h5>1. Аннотация и вывод типа</h5>
<p>Аннотация — это явно указанное ожидание. Вывод типа — когда TypeScript сам его определяет по начальному значению.</p>
<pre class="code">let attempts: number = 0  // аннотация
let title = 'Мои карты'    // TS вывел string
title = 'Операции'         // допустимо
title = 42                 // ошибка: number не подходит к string</pre>
<p>Не нужно подписывать каждую переменную, если тип очевиден. Явные типы особенно полезны для границ модулей: параметров функций, возвращаемых значений и API-контрактов.</p>

<h5>2. Примитивный тип и тип-литерал — не одно и то же</h5>
<pre class="code">let status = 'pending'       // string: значение можно поменять на другую строку
const fixedStatus = 'pending' // литеральный тип 'pending'

type CardStatus = 'active' | 'frozen' | 'pending'
let cardStatus: CardStatus = 'active'
cardStatus = 'frozen' // допустимо
cardStatus = 'deleted' // ошибка: такого варианта нет</pre>
<p>Union — это список разрешённых вариантов. Он полезен для статусов, вкладок, ролей и результатов операций: вместо любого <code class="i">string</code> остаётся только набор допустимых значений.</p>

<h5>3. Объект, необязательное поле и поле со значением undefined</h5>
<pre class="code">type User = {
  id: string
  name: string
  nickname?: string
  avatarUrl: string | undefined
}

const a: User = { id: 'u1', name: 'Аня', avatarUrl: undefined }
// nickname можно вообще не передать
// avatarUrl обязателен, но его значение может быть undefined</pre>
<p><code class="i">nickname?</code> означает «свойство можно не передавать». <code class="i">avatarUrl: string | undefined</code> означает «свойство обязательно присутствует, но значение может быть undefined». При чтении необязательного свойства результат тоже может быть undefined.</p>
<p><code class="i">readonly</code> запрещает присваивать новое значение этому полю через данный тип, но сам по себе не делает вложенный объект глубоко неизменяемым и не замораживает его в runtime.</p>

<h5>4. Массив, кортеж и небезопасный индекс</h5>
<pre class="code">const ids: string[] = ['c1', 'c2']
const point: [number, number] = [10, 20] // ровно две позиции заданных типов

const first = ids[0]
// без noUncheckedIndexedAccess TS считает first строкой
// с этой настройкой тип честнее: string | undefined</pre>
<p>Даже если тип говорит <code class="i">string[]</code>, в массиве может не быть элемента по выбранному индексу. Проверяй наличие элемента, если индекс вычисляется или данные могут быть пустыми.</p>
<pre class="code">const id = ids.at(0)
if (id !== undefined) {
  id.toUpperCase() // внутри проверки id — string
}</pre>

<h5>5. Функции: вход, выход, optional и default</h5>
<pre class="code">function formatMoney(amount: number, currency = 'USD'): string {
  return \`\${amount} \${currency}\`
}

formatMoney(12)       // currency берётся из default
formatMoney(12, 'EUR')
formatMoney('12')      // ошибка: amount должен быть number

type OnSelect = (id: string) =&gt; void</pre>
<p>Значение параметра по умолчанию делает параметр необязательным для вызова. Тип возвращаемого значения часто выводится автоматически, но у публичной функции его удобно указать: контракт легче читать и ошибка реализации обнаруживается рядом.</p>
<p><code class="i">void</code> в callback означает, что вызывающая сторона не использует результат обработчика. Функция, которая что-то возвращает, всё равно часто может быть передана туда, где ожидается <code class="i">void</code>.</p>

<h5>6. Сужение типа — сначала проверяем, потом используем</h5>
<pre class="code">function showName(value: string | null) {
  if (value === null) return 'Имя не задано'
  return value.toUpperCase() // здесь TS знает, что value — string
}</pre>
<p>Проверка внутри ветки сужает широкий тип до конкретного. Для объектов удобен дискриминирующий ключ, например <code class="i">status</code>:</p>
<pre class="code">type Result =
  | { status: 'ok'; data: string[] }
  | { status: 'error'; message: string }

function render(result: Result) {
  if (result.status === 'ok') return result.data.join(', ')
  return result.message
}</pre>
<p>В ветке <code class="i">ok</code> доступно <code class="i">data</code>, в ветке ошибки — <code class="i">message</code>. Эти поля нельзя случайно перепутать.</p>

<h5>7. Дженерик сохраняет связь между входом и выходом</h5>
<pre class="code">function first&lt;T&gt;(items: T[]): T | undefined {
  return items[0]
}

const numberResult = first([10, 20]) // number | undefined
const nameResult = first(['Аня'])    // string | undefined</pre>
<p>Один и тот же алгоритм работает с разными типами, а <code class="i">T</code> сохраняет связь между типом массива и результатом. Если написать <code class="i">any</code>, эта связь пропадёт и компилятор перестанет помогать.</p>
<p>Ограничение <code class="i">extends</code> говорит, какие операции разрешены внутри функции:</p>
<pre class="code">function getProperty&lt;T, K extends keyof T&gt;(obj: T, key: K): T[K] {
  return obj[key]
}

const user = { id: 7, name: 'Аня' }
const id = getProperty(user, 'id')     // number
getProperty(user, 'email')             // ошибка: такого ключа нет</pre>

<h5>8. Типизируем React-компонент и событие</h5>
<pre class="code">type CardProps = {
  title: string
  disabled?: boolean
  onOpen: (cardId: string) =&gt; void
}

function Card({ title, disabled = false, onOpen }: CardProps) {
  return (
    &lt;button disabled={disabled} onClick={() =&gt; onOpen('card-1')}&gt;
      {title}
    &lt;/button&gt;
  )
}</pre>
<p>Для стандартных DOM-событий React обычно сам выводит тип обработчика из элемента. Если тип нужен отдельно, используют, например, <code class="i">React.ChangeEvent&lt;HTMLInputElement&gt;</code>. Не подменяй его на <code class="i">any</code>: тогда пропадут типы <code class="i">currentTarget</code> и его свойств.</p>

<h5>9. Данные API: unknown до runtime-проверки</h5>
<p>TypeScript не смотрит на ответ сервера во время выполнения. Запись <code class="i">const user: User = await response.json()</code> лишь заставляет компилятор поверить автору. Безопаснее считать данные неизвестными, проверить их схемой и только после этого использовать:</p>
<pre class="code">import { z } from 'zod'

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(['user', 'admin']),
})

const raw: unknown = await response.json()
const parsed = UserSchema.safeParse(raw)

if (!parsed.success) {
  throw new Error('Сервер вернул данные неожиданной формы')
}

parsed.data.role // 'user' | 'admin'</pre>
<p><code class="i">unknown</code> заставляет сначала проверить значение. <code class="i">any</code> разрешил бы обратиться к <code class="i">raw.role.toUpperCase()</code>, даже если там массив или null.</p>

<h5>10. Асинхронная функция и Promise</h5>
<pre class="code">async function loadUser(id: string): Promise&lt;User&gt; {
  const response = await fetch(\`/api/users/\${id}\`)
  if (!response.ok) throw new Error('Не удалось загрузить пользователя')
  const raw: unknown = await response.json()
  return UserSchema.parse(raw)
}</pre>
<p><code class="i">async</code>-функция всегда возвращает Promise. Тип <code class="i">Promise&lt;User&gt;</code> описывает, чем он разрешится. Сеть может завершиться ошибкой, поэтому вызывающий код отдельно обрабатывает rejection через <code class="i">try/catch</code> или состояние ошибки запроса.</p>

<h5>Частые ошибки и как о них рассуждать</h5>
<ul>
  <li><code class="i">as User</code> — это не валидация. Спроси: кто проверил данные в runtime?</li>
  <li><code class="i">value!</code> отключает предупреждение о null, но не меняет значение. Спроси: почему здесь гарантировано наличие?</li>
  <li><code class="i">any</code> распространяет отсутствие проверки. Предпочитай <code class="i">unknown</code> на границе и сужай тип.</li>
  <li>Типы не заменяют обработку loading/error/empty состояний в интерфейсе.</li>
  <li>Не усложняй сигнатуру дженериками, если обычный тип решает задачу понятнее.</li>
</ul>

<h5>Как проговорить это на собеседовании</h5>
<p>«Я использую вывод типов для локальных значений, явные контракты для границ компонентов и функций, union для состояний. Внешние данные начинаю как unknown и валидирую во время выполнения. Так TypeScript помогает внутри приложения, а схема защищает переход через границу API».</p>
<div class="key">Порядок мышления: <b>откуда значение пришло → что о нём известно → чем это проверено → какие операции после проверки безопасны</b>.</div>`,
}
