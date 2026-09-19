import type { TheoryArticle } from '@/engine/types'

export const tsAdvanced: TheoryArticle = { id:'th-ts-advanced', topic:'TypeScript', title:'TypeScript: перегрузки, шаблонные типы и декораторы',
  lead:'То, что не входит в «основы», но регулярно спрашивают на middle+: перегрузка функций, keyof/typeof, шаблонные литеральные типы и декораторы — без них NestJS и TypeORM выглядят магией.',
  body:`
<h5>Перегрузка функций (overloads)</h5>
<p>Когда функция ведёт себя по-разному в зависимости от типа аргумента, а обычный union на входе размывает тип на выходе, объявляют несколько <b>сигнатур перегрузки</b> и одну <b>сигнатуру реализации</b>. Вызывающий код видит только перегрузки — сигнатура реализации для него не существует.</p>
<pre class="code">function parse(value: string): { ok: true; data: unknown } | { ok: false }
function parse(value: string, strict: true): unknown        // бросает, а не возвращает false
function parse(value: string, strict = false) {
  try {
    const data = JSON.parse(value)
    return strict ? data : { ok: true, data }
  } catch (e) {
    if (strict) throw e
    return { ok: false }
  }
}

parse('{}')            // { ok: true; data: unknown } | { ok: false }
parse('{}', true)      // unknown — другая форма результата из-за второго аргумента</pre>
<p>Ловушка, которую проверяют на собеседовании: сигнатура реализации должна быть <b>совместима</b> со всеми перегрузками, но сама по себе <b>не участвует</b> в подборе типа для вызывающего кода — если сделать её видимой (например, экспортировать функцию без перегрузок отдельно), типизация станет менее точной, а не более гибкой.</p>

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

<h5>Декораторы: на них держатся NestJS и TypeORM</h5>
<p>Декоратор — функция, которая оборачивает объявление (класс, метод, свойство, параметр) и может дополнить его метаданными или заменить целиком. Именно декораторы дают Nest и TypeORM их декларативный вид: <code class="i">@Controller()</code>, <code class="i">@Injectable()</code>, <code class="i">@Get()</code>, <code class="i">@Entity()</code>, <code class="i">@Column()</code> — всё это обычные функции, вызванные в позиции декоратора.</p>
<div class="note">У TypeScript сейчас фактически два разных декоратора под одним синтаксисом: «легаси» экспериментальные (флаг <code class="i">experimentalDecorators</code> — ровно то, на чём построены Nest и TypeORM) и новый стандарт TC39 (stage 3, доступен без флага начиная с TS 5.0). Сигнатуры у них разные и несовместимые между собой. Если проект на Nest — вы почти наверняка работаете со старыми декораторами, и это не «устаревший» код: Nest на новый стандарт ещё не мигрировал.</div>
<pre class="code">// простой декоратор метода — логирует вызов
function Log() {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value
    descriptor.value = function (...args: any[]) {
      console.log(\`→ \${key}(\${JSON.stringify(args)})\`)
      return original.apply(this, args)
    }
  }
}

class OrdersService {
  @Log()
  create(dto: CreateOrderDto) { /* ... */ }
}</pre>
<p><code class="i">Log()</code> — это <b>декоратор-фабрика</b>: сам декоратор — то, что она возвращает, а вызов с круглыми скобками нужен, чтобы передать параметры (ровно как <code class="i">@Roles('admin')</code> в гардах Nest, куда нужно передать список ролей).</p>
<h5>Порядок применения — классическая ловушка на собесе</h5>
<pre class="code">@First()
@Second()
class Foo {}
// фабрики вычисляются СВЕРХУ ВНИЗ: сначала First(), потом Second()
// а сами декораторы применяются СНИЗУ ВВЕРХ: Second оборачивает класс первым, First — последним</pre>
<p>Для декораторов методов и свойств на одном объявлении действует тот же порядок — снизу вверх. Это регулярно дают как задачу «угадайте порядок строк в консоли».</p>
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
