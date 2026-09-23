import type { TheoryArticle } from '@/engine/types'

export const jscore: TheoryArticle = { id:'th-jscore', topic:'JavaScript', title:'Типы, ссылки, копирование и массивы',
  lead:'Фундамент, который спрашивают в первые десять минут почти любого собеседования — и на котором чаще всего плывут.',
  body:`
<h5>Два вида значений и почему это важнее, чем кажется</h5>
<p>В JavaScript есть <b>примитивы</b> и <b>объекты</b>, и разница между ними объясняет добрую половину «необъяснимых» багов.</p>
<p>Примитивных типов семь: <code class="i">string</code>, <code class="i">number</code>, <code class="i">boolean</code>, <code class="i">null</code>, <code class="i">undefined</code>, <code class="i">symbol</code>, <code class="i">bigint</code>. Они <b>иммутабельны</b>: присваивание значения не даёт двум переменным общий изменяемый объект. Объекты, массивы и функции — отдельные объекты; переменная содержит ссылочное значение, указывающее на объект.</p>
<pre class="code">let a = 1, b = a
b++                      // a === 1, b === 2 — независимые копии

const o1 = { n: 1 }
const o2 = o1
o2.n = 2                 // o1.n тоже стал 2 — это ОДИН объект

const arr = [1, 2, 3]
function addItem(list) { list.push(4) }
addItem(arr)             // параметр получил копию ссылки и изменил общий объект

function replace(list) { list = [] }
replace(arr)             // не заменяет переменную arr у вызывающего кода</pre>
<div class="key">JavaScript передаёт <b>все аргументы по значению</b>. Для объекта этим значением является ссылка: параметр получает её копию. Поэтому изменение самого объекта видно снаружи, а присваивание параметру другой ссылки — нет. В React нельзя делать <code class="i">items.push(x); setItems(items)</code>: идентичность массива остаётся прежней, и обновление может не произойти.</div>

<h5>typeof и его исторические странности</h5>
<pre class="code">typeof 42              // 'number'
typeof 'str'           // 'string'
typeof undefined       // 'undefined'
typeof null            // 'object'   ← баг из 1995 года, не исправят из-за обратной совместимости
typeof []              // 'object'   → Array.isArray([])
typeof {}              // 'object'
typeof function(){}    // 'function'
typeof NaN             // 'number'   → Number.isNaN(x)
typeof Symbol()        // 'symbol'
typeof 10n             // 'bigint'</pre>
<p>Для надёжной проверки типа объекта используют <code class="i">Object.prototype.toString.call(v)</code> — он даёт <code class="i">'[object Date]'</code>, <code class="i">'[object Map]'</code> и так далее. Для проверки на «пустое значение» — <code class="i">v == null</code> (единственный оправданный случай нестрогого равенства: покрывает и <code class="i">null</code>, и <code class="i">undefined</code>).</p>

<h5>Четыре типа, которые упоминают, но редко объясняют</h5>
<p><b><code class="i">Symbol</code></b> — примитив, чьё единственное свойство — <b>уникальность</b>. Два символа никогда не равны, даже с одинаковым описанием.</p>
<pre class="code">const a = Symbol('id')
const b = Symbol('id')
a === b            // false — описание нужно только для отладки

// зачем: ключ, который точно ни с чем не столкнётся
const SECRET = Symbol('internal')
obj[SECRET] = 'служебные данные'
Object.keys(obj)   // символа здесь НЕТ — он скрыт от обычного перебора</pre>
<p>Где вы с ними уже сталкивались: <b>well-known symbols</b> — встроенные символы, через которые язык объявляет «протоколы». <code class="i">Symbol.iterator</code> делает объект перебираемым в <code class="i">for...of</code>, <code class="i">Symbol.asyncIterator</code> — в <code class="i">for await</code>, <code class="i">Symbol.toPrimitive</code> задаёт правила приведения к числу или строке. В прикладном коде символы чаще всего встречаются как токены внедрения зависимостей в Nest.</p>

<p><b><code class="i">BigInt</code></b> — целые числа <b>произвольной длины</b>, появившиеся потому, что обычный <code class="i">number</code> теряет точность выше 2⁵³.</p>
<pre class="code">const big = 9007199254740993n        // суффикс n
BigInt('9007199254740993')

big + 1n                              // ок
big + 1                               // ❌ TypeError: нельзя смешивать с number
Number(big)                           // явное приведение, с потерей точности
JSON.stringify({ big })               // ❌ TypeError — BigInt не сериализуется</pre>
<p>Где нужен: идентификаторы из базы, превышающие безопасный предел (например, снежинки Twitter или id Telegram), криптография, точные вычисления с большими суммами. Деньги на нём считать можно, но неудобно — дробей нет, придётся работать в копейках.</p>

<p><b><code class="i">WeakMap</code> и <code class="i">WeakSet</code></b> — коллекции, которые держат ключи <b>слабо</b>: если на объект-ключ больше никто не ссылается, запись исчезает автоматически и не мешает сборщику мусора.</p>
<pre class="code">const cache = new WeakMap()

function getMetadata(node) {
  if (!cache.has(node)) cache.set(node, expensiveCompute(node))
  return cache.get(node)
}
// когда DOM-узел удалят со страницы, запись в кеше исчезнет сама</pre>
<p>Ограничения вытекают из самой идеи: ключами могут быть <b>только объекты</b>, нет <code class="i">size</code> и нельзя итерировать — иначе работа сборщика мусора стала бы наблюдаемой из кода.</p>
<p>Где применяются: кеш метаданных по объекту, приватные данные экземпляра, пометки «этот узел уже обработан» (ровно так работает защита от циклических ссылок в глубоком клонировании). Обычный <code class="i">Map</code> в такой роли — готовая утечка памяти: он удерживает объекты вечно.</p>

<p><b>Сборка мусора</b>, раз уж речь зашла. Алгоритм — <b>mark and sweep</b>: от корней (глобальный объект, стек вызовов, замыкания живых функций) движок обходит все достижимые объекты, помечает их, остальное освобождает. Ключевое понятие — <b>достижимость</b>, а не счётчик ссылок; поэтому циклические ссылки сами по себе не текут. Течёт другое: незакрытые подписки, таймеры, растущие кеши и ссылки на удалённые DOM-узлы.</p>

<h5>Числа: почему 0.1 + 0.2 не равно 0.3</h5>
<p>Все значения типа <code class="i">number</code> в JS — 64-битные числа с плавающей точкой по стандарту IEEE-754, даже «целые». Дробь <code class="i">0.1</code> в двоичной системе бесконечна, как <code class="i">1/3</code> в десятичной, поэтому хранится приближённо.</p>
<pre class="code">0.1 + 0.2             // 0.30000000000000004
0.1 + 0.2 === 0.3     // false
Math.abs(0.1 + 0.2 - 0.3) &lt; 1e-10  // выбранный для этой задачи допуск

Number.MAX_SAFE_INTEGER   // 9007199254740991 (2^53 - 1)
9007199254740993 === 9007199254740992   // true — целые выше предела теряют точность</pre>
<p><code class="i">Number.EPSILON</code> — расстояние между 1 и следующим представимым числом. Это не универсальный допуск для сравнения любых чисел: допустимое отклонение зависит от масштаба и требований задачи. Для денег задают единицу хранения и правила округления, а не сравнивают дроби по EPSILON.</p>
<div class="warn">Для денег <b>никогда</b> не используйте <code class="i">number</code>. Варианты: хранить целые копейки, брать <code class="i">BigInt</code>, или библиотеку произвольной точности. Именно поэтому в ваших проектах есть <code class="i">bignumber.js</code> — в работе с балансами и криптовалютой ошибка в пятнадцатом знаке превращается в реальные расхождения.</div>
<p>Отдельная ловушка — <code class="i">JSON.parse</code> для больших id: число из базы, превышающее 2⁵³, молча потеряет точность. Решение — отдавать такие id строкой или использовать <code class="i">lossless-json</code> (он, кстати, есть в зависимостях themost-core — видимо, ровно по этой причине).</p>

<h5>Приведение типов и восемь falsy-значений</h5>
<p>Запомнить нужно именно <b>полный список ложных значений</b>, всё остальное истинно: <code class="i">false</code>, <code class="i">0</code>, <code class="i">-0</code>, <code class="i">0n</code>, <code class="i">''</code>, <code class="i">null</code>, <code class="i">undefined</code>, <code class="i">NaN</code>.</p>
<p>Из этого следует, что <code class="i">[]</code>, <code class="i">{}</code>, <code class="i">'0'</code>, <code class="i">'false'</code> и функция — истинны. И отсюда же самая частая ошибка в реальном коде:</p>
<pre class="code">if (count) { ... }        // ❌ сломается при count === 0
if (name) { ... }         // ❌ сломается при name === ''
if (count !== undefined)  // ✅ явная проверка

const limit = input || 20   // ❌ при input === 0 подставит 20
const limit = input ?? 20   // ✅ ?? срабатывает только на null/undefined</pre>
<p>Оператор <code class="i">??</code> (nullish coalescing) и появился для того, чтобы отличать «значение не передано» от «передан ноль или пустая строка».</p>

<div data-demo="refs-vs-copy"></div>
<h5>Копирование: поверхностное и глубокое</h5>
<pre class="code">// ПОВЕРХНОСТНОЕ: новый верхний уровень, вложенное — общие ссылки
const copy = { ...obj }
const copy = Object.assign({}, obj)
const copy = [...arr]

const user = { name: 'Аня', address: { city: 'Москва' } }
const clone = { ...user }
clone.address.city = 'Питер'
user.address.city              // 'Питер' — вложенный объект общий!

// ГЛУБОКОЕ
const deep = structuredClone(user)   // нативно, умеет циклы, Date, Map, Set</pre>
<p><code class="i">structuredClone</code> доступен в браузерах и Node 17+. Его ограничения: не копирует функции, DOM-узлы и прототипы классов (экземпляр класса станет обычным объектом), бросает ошибку на несериализуемых значениях.</p>
<p>Старый трюк <code class="i">JSON.parse(JSON.stringify(obj))</code> лучше не использовать: он падает на циклических ссылках, теряет <code class="i">undefined</code>, функции и символы, превращает <code class="i">Date</code> в строку, <code class="i">Map</code> и <code class="i">Set</code> — в пустые объекты, а <code class="i">NaN</code> и <code class="i">Infinity</code> — в <code class="i">null</code>.</p>

<h5>Методы массивов: что мутирует, а что нет</h5>
<table>
<tr><th>Мутируют исходный массив</th><th>Возвращают новый</th></tr>
<tr><td><code class="i">push</code>, <code class="i">pop</code>, <code class="i">shift</code>, <code class="i">unshift</code></td><td><code class="i">concat</code>, <code class="i">slice</code>, <code class="i">map</code>, <code class="i">filter</code>, <code class="i">flat</code></td></tr>
<tr><td><code class="i">splice</code>, <code class="i">sort</code>, <code class="i">reverse</code>, <code class="i">fill</code>, <code class="i">copyWithin</code></td><td><code class="i">toSpliced</code>, <code class="i">toSorted</code>, <code class="i">toReversed</code>, <code class="i">with</code></td></tr>
</table>
<p>Правая колонка нижней строки — относительно новые иммутабельные близнецы мутирующих методов. Они идеальны для React и Redux: <code class="i">arr.sort()</code> прямо в рендере молча испортит массив, пришедший в пропсах, а <code class="i">arr.toSorted()</code> вернёт копию.</p>
<pre class="code">// ❌ мутация пропса — источник трудноуловимых багов
const sorted = items.sort((a, b) =&gt; a.date - b.date)

// ✅
const sorted = items.toSorted((a, b) =&gt; a.date - b.date)
const sorted = [...items].sort((a, b) =&gt; a.date - b.date)   // если toSorted недоступен</pre>
<div class="warn">Сортировка по умолчанию — <b>строковая</b>: <code class="i">[1, 10, 9].sort()</code> даёт <code class="i">[1, 10, 9]</code>, потому что <code class="i">'10' &lt; '9'</code> лексикографически. Для чисел обязателен компаратор <code class="i">(a, b) =&gt; a - b</code>, для строк на русском — <code class="i">localeCompare</code>, иначе <code class="i">'Я'</code> окажется раньше <code class="i">'а'</code> (сравнение идёт по кодам символов).</div>

<h5>Шпаргалка по перебору</h5>
<pre class="code">arr.map(fn)             преобразовать каждый элемент
arr.filter(fn)          отобрать подходящие
arr.reduce(fn, init)    свернуть в одно значение
arr.find(fn)            первый подходящий элемент (или undefined)
arr.findIndex(fn)       его индекс (или -1)
arr.findLast(fn)        то же, но с конца
arr.some(fn)            хотя бы один подходит
arr.every(fn)           все подходят
arr.flat(depth)         развернуть вложенность
arr.flatMap(fn)         map + flat(1)
arr.at(-1)              последний элемент
arr.includes(v)         есть ли значение (в отличие от indexOf, видит NaN)
Object.groupBy(arr, fn) сгруппировать в объект</pre>
<p>О производительности: <code class="i">includes</code>, <code class="i">indexOf</code>, <code class="i">find</code> работают за O(n). Вызов любого из них <b>внутри цикла</b> превращает код в O(n²) — самая частая причина неожиданно медленного кода. Лечится построением <code class="i">Set</code> или <code class="i">Map</code> заранее.</p>

<h5>Современный синтаксис, который должен быть в пальцах</h5>
<pre class="code">// деструктуризация
const { a, b: renamed, c = 10, ...rest } = obj
const [first, , third = 0] = arr
const { user: { name } = {} } = data        // вложенная + защита от undefined
function f({ id, limit = 20 } = {}) {}      // деструктуризация аргументов

// безопасный доступ
obj?.deep?.value
arr?.[0]
callback?.()

// логические присваивания
count ||= 1          // если falsy
count ??= 1          // если null/undefined
flag &&= false

// объекты
const key = 'dynamic'
const obj = { [key]: 1, shorthand, ...spread }
Object.entries(obj).map(([k, v]) =&gt; ...)
Object.fromEntries(pairs)</pre>

<h5>Три ловушки напоследок</h5>
<ul>
<li><code class="i">arr.length = 0</code> очищает массив на месте — и это увидят все, кто держит на него ссылку.</li>
<li><code class="i">delete obj.key</code> работает как ожидается, а <code class="i">delete arr[1]</code> оставляет «дырку»: <code class="i">length</code> не меняется, а <code class="i">map</code> и <code class="i">forEach</code> такую позицию пропускают.</li>
<li>Строки иммутабельны: <code class="i">s[0] = 'x'</code> молча не сработает. А <code class="i">'👍'.length === 2</code>, потому что эмодзи занимает два code unit — для посимвольной работы нужен <code class="i">[...str]</code> или <code class="i">for...of</code>.</li>
</ul>` }
