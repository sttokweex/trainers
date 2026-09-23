import type { TheoryArticle } from '@/engine/types'

export const basicsFunctions: TheoryArticle = {
  id: 'th-basics-functions', topic: 'База: функции',
  title: 'База JavaScript: функции, параметры и return',
  lead: 'Как дать набору действий имя, передать входные данные и получить понятный результат.',
  body: `
<p>Функция — это <b>именованный или сохранённый набор действий</b>. Ей можно передать данные, она выполняет работу и может вернуть результат. Функции помогают разбить большую задачу на небольшие части и не копировать один и тот же код.</p>

<h5>Объявить, вызвать, вернуть</h5>
<pre class="code">function addTax(price, rate) {
  const tax = price * rate
  return price + tax
}

const total = addTax(100, 0.2) // вызов передаёт два значения
console.log(total)             // 120</pre>
<p><code class="i">price</code> и <code class="i">rate</code> — параметры (имена внутри объявления). <code class="i">100</code> и <code class="i">0.2</code> — аргументы (фактические значения при вызове). <code class="i">return</code> возвращает значение вызывающему коду и завершает эту функцию.</p>

<h5>Два распространённых способа записать функцию</h5>
<pre class="code">function greet(name) {
  return 'Привет, ' + name
}

const shout = function (text) {
  return text.toUpperCase()
}

const double = (n) => n * 2</pre>
<p>Первая форма — function declaration. Вторая сохраняет function expression в переменную. Третья — стрелочная функция; если справа от <code class="i">=&gt;</code> одно выражение, оно возвращается автоматически. Если поставить фигурные скобки, <code class="i">return</code> нужно написать явно.</p>

<h5>Вернуть значение — не то же самое, что напечатать</h5>
<pre class="code">function logAnswer() {
  console.log(42)  // показывает в консоли, наружу не возвращает
}

function getAnswer() {
  return 42        // отдаёт вызывающему коду
}

const first = logAnswer()  // undefined
const second = getAnswer() // 42</pre>
<div class="warn">Забытый <code class="i">return</code> — частая причина, почему функция показывает правильное число, а вызывающий код всё равно получает <code class="i">undefined</code>.</div>

<h5>Значения по умолчанию и ранний выход</h5>
<pre class="code">function formatName(name = 'Гость') {
  if (name.trim() === '') return 'Гость'
  return name.trim()
}
formatName()       // 'Гость'
formatName('Ира')  // 'Ира'</pre>
<p>Ранний <code class="i">return</code> помогает обработать неправильный или пустой вход в начале. Так основной путь функции остаётся простым.</p>

<h5>Функцию можно передать другой функции</h5>
<p>Функция в JavaScript — значение. Её можно сохранить в переменную и передать как аргумент. Функция, переданная для вызова позже, называется <b>callback</b> (колбэк): <code class="i">names.map(name =&gt; name.toUpperCase())</code>. Так работают обработчики клика, сортировка и отложенная работа.</p>

<h5>Одна функция — одна понятная задача</h5>
<p>Хорошую небольшую функцию обычно можно назвать глаголом: <code class="i">calculateTotal</code>, <code class="i">isAllowed</code>, <code class="i">formatDate</code>. Старайтесь передавать ей нужные значения явно, не менять неожиданно внешнее состояние и возвращать один понятный результат.</p>
<div class="note">Следующий шаг после обычных функций — область видимости и замыкания. В этой базе сначала уверенно освойте входы, действия и <code class="i">return</code>.</div>
<div data-demo="js-foundation-lab"></div>`,
}
