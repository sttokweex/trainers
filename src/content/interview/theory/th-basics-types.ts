import type { TheoryArticle } from '@/engine/types'

export const basicsTypes: TheoryArticle = {
  id: 'th-basics-types', topic: 'База: типы и операторы',
  title: 'База JavaScript: типы, сравнения и значения «нет»',
  lead: 'Строки, числа, true/false, null и undefined; строгое сравнение и безопасные значения по умолчанию.',
  body: `
<p>Тип подсказывает, с каким значением мы работаем и какие действия имеют смысл. Например, имя — строка, количество — число, переключатель — <code class="i">true</code> или <code class="i">false</code>. JavaScript определяет тип во время выполнения, поэтому переменную можно переназначить значением другого типа, хотя обычно так делать не стоит.</p>

<h5>Типы, которые нужны каждый день</h5>
<ul><li><code class="i">string</code> — текст: <code class="i">'Привет'</code>.</li><li><code class="i">number</code> — числа: <code class="i">3</code>, <code class="i">3.5</code>.</li><li><code class="i">boolean</code> — <code class="i">true</code> или <code class="i">false</code>.</li><li><code class="i">undefined</code> — значение ещё не задано.</li><li><code class="i">null</code> — отсутствие значения указано явно.</li><li>Объекты и массивы хранят составные данные — отдельно разберём их в следующем модуле.</li></ul>
<p>Есть и другие типы, например <code class="i">bigint</code> и <code class="i">symbol</code>, но в начале важнее уверенно различать базовые значения и не полагаться на случайное преобразование.</p>

<h5>Почти всегда сравнивайте через ===</h5>
<pre class="code">5 === 5       // true: значение и тип совпали
5 === '5'     // false: число и строка — разные типы
5 == '5'      // true: == сначала приводит типы</pre>
<p><code class="i">==</code> может неожиданно превратить строку в число, поэтому начинающим проще и безопаснее пользоваться <code class="i">===</code>. Исключения в старом коде встречаются, но это осознанный выбор, а не правило.</p>

<h5>Пустая строка и ноль — тоже значения</h5>
<p>В условии JavaScript считает некоторые значения ложными: <code class="i">false</code>, <code class="i">0</code>, <code class="i">''</code>, <code class="i">null</code>, <code class="i">undefined</code> и <code class="i">NaN</code>. Пустой массив <code class="i">[]</code> и пустой объект <code class="i">{}</code>, наоборот, истинны. Если ноль или пустой текст имеют смысл, не проверяйте их простым <code class="i">if (value)</code>.</p>

<h5>|| и ?? решают разные задачи</h5>
<pre class="code">const retries = 0 || 3         // 3 — ноль считается ложным
const limit = 0 ?? 3           // 0 — значение уже задано
const name = '' ?? 'Гость'     // '' — это не null и не undefined
const other = null ?? 'Гость'  // 'Гость'</pre>
<p><code class="i">||</code> берёт запасное значение, если слева что-то ложное. <code class="i">??</code> берёт запасное только когда слева <code class="i">null</code> или <code class="i">undefined</code>. Для чисел, где ноль допустим, обычно нужен <code class="i">??</code>.</p>

<h5>Не угадывайте тип по виду экрана</h5>
<p>Значение из поля ввода — строка, даже если там написано <code class="i">42</code>. Преобразуйте его явно: <code class="i">Number(input.value)</code>, затем проверьте результат через <code class="i">Number.isFinite</code>. А <code class="i">typeof null</code> исторически возвращает <code class="i">'object'</code>; это особенность языка, а не повод считать <code class="i">null</code> объектом.</p>
<div class="key">На собеседовании объясните не только результат операции, но и типы значений до и после неё.</div>
<div data-demo="js-foundation-lab"></div>`,
}
