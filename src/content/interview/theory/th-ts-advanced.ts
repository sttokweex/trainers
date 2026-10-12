import type { TheoryArticle } from '@/engine/types'

export const tsAdvanced: TheoryArticle = { id:'th-ts-advanced', topic:'TypeScript', title:'TypeScript: перегрузки, шаблонные типы и декораторы',
  lead:'Разбираем несколько вариантов вызова одной функции, шаблонные типы и декораторы на примерах из TypeScript и NestJS.',
  updates: [
    { id: 'ts-overloads-2026-10-13', sectionTitle: 'Перегрузки: одна функция — несколько вариантов вызова', label: 'Объяснено на примере' },
    { id: 'ts-decorators-2026-10-13-v1', sectionTitle: 'Декораторы в TypeScript и NestJS', label: 'Объяснено по шагам' },
  ],
  body:`
<h5>Перегрузки: одна функция — несколько вариантов вызова</h5>
<p><b>Перегрузка</b> позволяет одной функции принимать несколько точно описанных вариантов входных данных. TypeScript смотрит на аргумент при вызове и заранее показывает соответствующий тип результата. Само слово «перегрузка» здесь означает дополнительные варианты вызова; имя функции остаётся одним.</p>
<p>Например, функция ниже принимает либо одну строку, либо список строк. Если передали одну строку, результат тоже одна строка. Если передали список — результат список. Запишем эти правила до реализации:</p>
<pre class="code">// Варианты вызова: аргумент → тип результата
function clean(value: string): string
function clean(value: string[]): string[]

// Реализация одна. Она должна уметь обработать оба варианта.
function clean(value: string | string[]): string | string[] {
  if (typeof value === 'string') {
    return value.trim()
  }
  return value.map((item) =&gt; item.trim())
}

const name = clean('  Аня  ')       // string: 'Аня'
const names = clean([' Аня ', ' Борис ']) // string[]: ['Аня', 'Борис']

name.toUpperCase()  // ✅ TypeScript знает, что name — строка
names.map(name =&gt; name.toUpperCase()) // ✅ TypeScript знает, что names — список строк</pre>
<p>Записи с точкой с запятой сверху — это <b>сигнатуры перегрузки</b>: они описывают разрешённые вызовы. Функция с телом ниже — <b>реализация</b>: в ней находится обычный JavaScript с проверкой <code class="i">typeof</code>. Для пользователя функции доступны только описанные варианты, а не общий тип из строки реализации.</p>
<p>Без перегрузок пришлось бы написать один широкий контракт <code class="i">(value: string | string[]) =&gt; string | string[]</code>. Тогда после вызова <code class="i">clean('Аня')</code> TypeScript видел бы результат как «строка или список строк» и не разрешил бы сразу вызвать <code class="i">toUpperCase()</code>: он не знал бы, какой именно результат связан с этим аргументом. Перегрузка сохраняет эту связь.</p>
<div class="note"><b>Когда применять:</b> когда разные виды аргументов закономерно дают разные виды результата и эту связь важно показать вызывающему коду. Если результат всегда одного типа, обычно достаточно union-типа и обычной проверки внутри функции.</div>
<p><b>На собеседовании:</b> сигнатура реализации должна уметь принять и вернуть значения для всех объявленных перегрузок. Но вызывающий код сопоставляется с сигнатурами перегрузки; общая сигнатура реализации ему не добавляет ещё один разрешённый вариант.</p>

<h5>keyof, typeof и индексированный доступ</h5>
<p>Три оператора, которые вместе дают безопасный доступ «вглубь» типа без дублирования полей руками.</p>
<table>
<tr><th>Оператор</th><th>Что делает</th><th>Пример</th></tr>
<tr><td><code class="i">keyof T</code></td><td>союз имён ключей объекта</td><td><code class="i">keyof User</code> → <code class="i">'id' | 'name' | 'email'</code></td></tr>
<tr><td><code class="i">typeof value</code></td><td>достаёт тип из уже существующего значения — но только <b>в позиции типа</b></td><td><code class="i">typeof config</code> → тип объекта <code class="i">config</code></td></tr>
<tr><td><code class="i">T[K]</code></td><td>индексированный доступ — тип конкретного поля</td><td><code class="i">User['email']</code> → <code class="i">string</code></td></tr>
</table>
<pre class="code">const config = { retries: 3, timeout: 1000, baseUrl: '/api' }
type Config = typeof config                    // тип выведен из рантайм-объекта

function getConfigValue&lt;K extends keyof Config&gt;(key: K): Config[K] {
  return config[key]
}
getConfigValue('retries')   // number
getConfigValue('typo')      // ❌ ошибка компиляции — такого ключа нет</pre>
<p>Частая путаница на собесе: <code class="i">typeof</code> в позиции типа (как выше) и <code class="i">typeof</code> в рантайме (<code class="i">typeof x === 'string'</code>) — это два разных оператора с одинаковым написанием, компилятор различает их по контексту, где они встречаются.</p>

<h5>Шаблонные литеральные типы</h5>
<p>Строковые типы можно собирать так же, как строки шаблонными литералами в JS — только на уровне типов, с подстановкой юнионов вместо значений.</p>
<pre class="code">type UiEvent = 'click' | 'focus' | 'blur'
type Handler = \`on\${Capitalize&lt;UiEvent&gt;}\`
// 'onClick' | 'onFocus' | 'onBlur' — три варианта сразу, а не одна строка

type Route = '/posts/:id/comments/:commentId'
type ExtractParams&lt;T extends string&gt; =
  T extends \`\${string}:\${infer P}/\${infer Rest}\`
    ? P | ExtractParams&lt;\`/\${Rest}\`&gt;
    : T extends \`\${string}:\${infer P}\`
      ? P
      : never

type Params = ExtractParams&lt;Route&gt;   // 'id' | 'commentId'</pre>
<p>Механизм тот же, что у распределения условных типов по юниону (см. основную статью про TypeScript): подстановка в <code class="i">UiEvent</code> обрабатывается почленно. <code class="i">Capitalize</code>, <code class="i">Uncapitalize</code>, <code class="i">Lowercase</code>, <code class="i">Uppercase</code> — четыре встроенные intrinsic-утилиты именно для таких случаев. На практике так типизируют роуты tRPC, CSS-in-JS свойства и автогенерируемые пропсы вроде <code class="i">onClick</code> из имени события.</p>

<h5>Декораторы в TypeScript и NestJS</h5>
<p>Декоратор — функция, которую прикрепляют к классу или его методу с помощью знака <code class="i">@</code>. Она запускается, когда JavaScript загружает объявление класса, и может записать о нём информацию или заменить его часть. Например, декоратор метода может подменить метод обёрткой: обёртка выполнит дополнительное действие, а затем вызовет исходный метод.</p>
<p>Посмотрим на простой пример. <code class="i">@Log()</code> добавит запись в консоль каждый раз, когда вызывают <code class="i">create</code>:</p>
<pre class="code">function Log() {
  // Log() возвращает функцию-декоратор
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value // сохраняем исходный метод

    // Подменяем метод обёрткой
    descriptor.value = function (...args: any[]) {
      console.log(\`Вызван метод \${key}\`, args)
      return original.apply(this, args) // запускаем исходный метод
    }
  }
}

class OrdersService {
  @Log()
  create(dto: CreateOrderDto) {
    return { id: 1, ...dto }
  }
}

new OrdersService().create({ product: 'Книга' })
// Сначала в консоль попадёт запись о вызове,
// затем выполнится исходный create и вернётся объект.</pre>
<ol>
<li><code class="i">Log()</code> вызывается при объявлении класса. Скобки нужны потому, что <code class="i">Log</code> — функция, которая возвращает декоратор.</li>
<li>Декоратор получает имя метода и его описание. Исходная функция лежит в <code class="i">descriptor.value</code>.</li>
<li>Декоратор сохраняет исходную функцию и записывает в <code class="i">descriptor.value</code> новую — обёртку.</li>
<li>Позже при вызове <code class="i">create</code> выполняется обёртка: она пишет в консоль, вызывает сохранённую функцию и возвращает её результат.</li>
</ol>
<p>Функция, которая настраивает декоратор и возвращает его, называется <b>фабрикой декораторов</b>. Она нужна, когда декоратору требуются настройки. Например, <code class="i">@Roles('admin')</code> передаёт декоратору название роли.</p>
<div class="note"><b>Важно для NestJS:</b> в этом примере показан старый вариант декораторов TypeScript, включаемый настройкой <code class="i">experimentalDecorators</code>. Его используют NestJS и TypeORM. В TypeScript 5.0 добавили поддержку декораторов по новому стандарту JavaScript; у него другие аргументы и правила. Не смешивайте примеры из этих двух вариантов — код ниже относится к старому.</div>
<p>В Nest запись <code class="i">@Injectable()</code> тоже является декоратором, но сама по себе не создаёт зависимость. Она помечает класс как доступный для системы внедрения зависимостей Nest. При запуске Nest анализирует зарегистрированные классы и подставляет нужные объекты в конструкторы.</p>
<h5>Порядок применения декораторов</h5>
<pre class="code">@First()
@Second()
class Foo {}
// фабрики вычисляются СВЕРХУ ВНИЗ: сначала First(), потом Second()
// а сами декораторы применяются СНИЗУ ВВЕРХ: Second оборачивает класс первым, First — последним</pre>
<p>Если на одном объявлении несколько декораторов, фабрики вызываются сверху вниз, а сами декораторы применяются снизу вверх. Тот же порядок важен для методов и свойств.</p>
<h5>Как Nest узнаёт, что инжектить</h5>
<p>Флаг <code class="i">emitDecoratorMetadata</code> заставляет компилятор дополнительно сохранять типы параметров конструктора как метаданные времени выполнения (через библиотеку <code class="i">reflect-metadata</code>). Именно поэтому DI-контейнер Nest способен понять, что подставить в конструктор, просто взглянув на типы — без единой строчки ручной конфигурации:</p>
<pre class="code">@Injectable()
class OrdersService {
  constructor(private readonly repo: OrdersRepository) {}
  // компилятор кладёт [OrdersRepository] в design:paramtypes
  // Nest на старте читает эти метаданные через Reflect.getMetadata
}</pre>
<p>Отсюда практическое следствие, с которым сталкивается почти каждый на Nest: <b>интерфейсы не работают как токены инъекции</b> — они существуют только на уровне типов и стираются в рантайме, метаданные о них сохранить нечего. Для инъекции по интерфейсу нужен явный токен: <code class="i">@Inject('ORDERS_REPO')</code> плюс запись <code class="i">provide: 'ORDERS_REPO'</code> в модуле.</p>

<h5>Вариантность параметров функций — не только массивы</h5>
<p>В основной статье про TypeScript разобрана ковариантность массивов. У функций есть похожая, более тонкая дыра: параметры <b>методов</b> проверяются <b>бивариантно</b> (в обе стороны, что формально небезопасно) ради совместимости с привычными ООП-паттернами переопределения, а параметры <b>самостоятельных функциональных типов</b> — строго <b>контравариантно</b>, если включён <code class="i">strictFunctionTypes</code>.</p>
<pre class="code">type Handler = (e: MouseEvent) =&gt; void
let onAny: (e: Event) =&gt; void = (e) =&gt; {}
let onClick: Handler = onAny   // ✅ можно: обработчик общего события умеет и с более узким

let onMouse: Handler = (e) =&gt; {}
let onEvent: (e: Event) =&gt; void = onMouse   // ❌ под strictFunctionTypes: сузили бы контракт</pre>
<p>Практический вывод: тип функции-параметра — это контракт «что я обязан уметь принять», и подсовывать вместо него функцию с более узкими требованиями небезопасно, даже если сигнатуры выглядят похоже.</p>

<h5>const type parameters (TS 5.0+)</h5>
<p>Раньше, чтобы сохранить литеральные типы аргумента дженерика, вызывающий код должен был сам дописывать <code class="i">as const</code>. Модификатор <code class="i">const</code> перед типовым параметром переносит это поведение внутрь функции — думать об этом на вызове больше не нужно.</p>
<pre class="code">function first&lt;const T extends readonly unknown[]&gt;(arr: T): T[0] {
  return arr[0]
}
first(['a', 'b'])          // тип 'a', а не string — без as const на вызове</pre>
<div class="trap">Все конструкции этой статьи — не самоцель. На собеседовании middle+ гораздо важнее не «написать сложный тип», а понимать, <b>зачем</b> он нужен и когда та же задача честнее решается проще: рантайм-валидацией (zod), простым интерфейсом или отдельной функцией без дженериков вовсе.</div>` }
