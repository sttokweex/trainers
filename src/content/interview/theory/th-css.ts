import type { TheoryArticle } from '@/engine/types'

export const css: TheoryArticle = {
  id: 'th-css',
  topic: 'CSS и вёрстка',
  title: 'CSS без каши: каскад, раскладка и современная вёрстка',
  lead: 'Последовательное руководство: как браузер выбирает стили, рассчитывает размеры и раскладывает элементы. С примерами и вопросами для собеседования.',
  updates: [
    { id: 'css-learning-path-2026-10-v2', sectionTitle: 'Как читать эту главу', label: 'Новый маршрут' },
    { id: 'css-specificity-2026-10-v2', sectionTitle: '3. Специфичность: три колонки', label: 'Разобрано подробнее' },
    { id: 'css-layout-2026-10-v2', sectionTitle: '7. Flexbox: одна ось', label: 'Разобрано подробнее' },
    { id: 'css-modern-2026-10-v2', sectionTitle: '12. Современные возможности', label: 'Новые возможности' },
  ],
  body: `
<h5>Как читать эту главу</h5>
<p>CSS проще понять как несколько задач браузера. Сначала он решает, <b>какие правила относятся к элементу</b>. Затем выбирает значение при конфликте правил. После этого рассчитывает размеры и положение коробок, рисует их и размещает друг над другом.</p>
<ol><li><b>Каскад:</b> почему цвет именно такой?</li><li><b>Модель коробки и раскладка:</b> почему элемент такого размера и почему он здесь?</li><li><b>Позиционирование:</b> почему меню оказалось под соседним блоком?</li><li><b>Адаптивность:</b> как интерфейс меняется на разных экранах?</li></ol>
<p>Если CSS «не работает», не переписывайте селектор наугад. Сначала определите, какая задача дала неожиданный результат.</p>

<h5>1. Правило и наследование</h5>
<pre class="code">.notice {              /* селектор выбирает элементы */
  color: navy;         /* свойство задаёт стиль */
  padding: 12px;
}</pre>
<p>Некоторые значения переходят от родителя к дочерним элементам. Обычно это текст: <code class="i">color</code>, <code class="i">font-family</code>, <code class="i">line-height</code>. Отступы, рамки, фон и ширина обычно не наследуются.</p>
<pre class="code">body { color: #222; font-family: sans-serif; }
/* p унаследует цвет и шрифт */
p { margin-block: 1em; } /* отступ не наследуется детьми */</pre>
<p><code class="i">inherit</code> — взять значение родителя; <code class="i">initial</code> — начальное значение свойства; <code class="i">unset</code> ведёт себя как inherit для наследуемого свойства и как initial для остальных; <code class="i">revert</code> откатывает каскад к предыдущему источнику.</p>

<h5>2. Каскад: какое правило победит</h5>
<p>Если к одному элементу подходит несколько правил, браузер выбирает победителя по порядку. Как только один кандидат выигрывает на текущем шаге, специфичность следующих правил уже не важна.</p>
<ol>
<li><b>Источник и важность:</b> браузерные, пользовательские или авторские стили; обычная декларация или <code class="i">!important</code>. Среди обычных правил автора сильнее браузерных. У важных правил порядок источников разворачивается: пользовательский и браузерный <code class="i">!important</code> сильнее авторского. CSS-анимации и активные переходы имеют отдельные уровни приоритета.</li>
<li><b>Слой:</b> порядок <code class="i">@layer</code>. У обычных правил более поздний слой сильнее; обычное правило без слоя сильнее правил внутри слоя. Для важных правил порядок слоёв обратный.</li>
<li><b>Специфичность:</b> сравнивается только после предыдущих шагов.</li>
<li><b>Близость области:</b> внутри <code class="i">@scope</code> более близкая область может выиграть при равных предыдущих критериях.</li>
<li><b>Порядок в файле:</b> при полном равенстве побеждает правило, написанное позже.</li>
</ol>
<p>Пример: правило из слоя библиотеки не победит правило без слоя только потому, что в его селекторе есть ID. До сравнения селекторов каскад уже выбрал правило без слоя.</p>
<pre class="code">@layer reset, library, components;
@layer library { #app .button { color: red } }
@layer components { .button { color: blue } }
.button { color: green } /* обычное правило без слоя победит */</pre>
<p><b>Запомните:</b> специфичность — один из этапов каскада, а не абсолютный рейтинг правил.</p>

<h5>3. Специфичность: три колонки</h5>
<p>Записывайте специфичность как <b>ID — классы — элементы</b>. Классы, атрибуты и псевдоклассы входят во вторую колонку. Элементы и псевдоэлементы — в третью.</p>
<pre class="code">p                       0–0–1
.card                   0–1–0
#main                   1–0–0
.card p                 0–1–1
#main .card p           1–1–1
button:hover             0–1–1
[aria-pressed="true"]    0–1–0
::before                 0–0–1</pre>
<p>Сравнение слева направо: <code class="i">1–0–0</code> сильнее <code class="i">0–99–99</code>, потому что ID — первая колонка. Это не сумма баллов, и классы не могут «набрать» один ID.</p>
<p><code class="i">:is()</code>, <code class="i">:not()</code> и <code class="i">:has()</code> сами баллов не добавляют, но учитывают самый специфичный аргумент. <code class="i">:where()</code> и его аргументы всегда дают ноль.</p>
<pre class="code">:is(.button, #submit)     1–0–0 — самый сильный аргумент
:not(.disabled)           0–1–0 — считается аргумент
:where(#app) .button      0–1–0 — :where даёт ноль
*                          0–0–0</pre>
<p><b>Минимальная специфичность</b> — ноль: например, <code class="i">*</code> или <code class="i">:where(...)</code>. <b>Максимальной конечной нет:</b> ID можно добавлять сколько угодно. Но в обычном коде не нужно стремиться к максимуму: длинные селекторы хрупкие, а простые классы проще поддерживать.</p>
<p>Inline-стиль имеет отдельное положение в каскаде, он не входит в три колонки. <code class="i">!important</code> — это важность, а не балл специфичности.</p>
<div data-demo="specificity"></div>

<h5>4. Как избежать войны специфичности</h5>
<ul><li>Используйте простые классы компонентов, избегайте ID и длинных цепочек тегов.</li><li>Задайте порядок слоёв: например, <code class="i">reset, vendor, components, utilities</code>.</li><li>Пишите базовые стили через <code class="i">:where()</code>, если их должно быть легко переопределить.</li><li>CSS Modules изолируют имена классов, но не отменяют наследование и каскад.</li><li>Частый <code class="i">!important</code> обычно указывает на конфликт, который лучше устранить у источника.</li></ul>

<h5>5. Модель коробки</h5>
<p>Представьте элемент как коробку: <b>содержимое → padding → border → margin</b>. Padding — внутренний отступ, border — рамка, margin — расстояние снаружи.</p>
<p>При значении по умолчанию <code class="i">content-box</code> заданная ширина относится только к содержимому. Блок шириной 300px с padding по 20px займёт 340px. При <code class="i">border-box</code> padding и border входят в заданные 300px.</p>
<pre class="code">*, *::before, *::after { box-sizing: border-box; }
.panel { width: 300px; padding: 20px; border: 2px solid; }</pre>
<p>Вертикальные margin соседних блочных элементов иногда схлопываются: 20px и 30px дают промежуток 30px. Во Flexbox/Grid этого схлопывания нет; для промежутков между элементами обычно используйте <code class="i">gap</code>. Для изоляции потока можно задать <code class="i">display: flow-root</code>.</p>

<h5>6. Поток документа и display</h5>
<p>В обычном потоке блоки идут друг за другом, а строчные элементы располагаются внутри строки текста.</p>
<ul><li><code class="i">block</code>: с новой строки; размеры width/height работают.</li><li><code class="i">inline</code>: внутри строки; ширина, высота и вертикальные margin не работают как у блока.</li><li><code class="i">inline-block</code>: остаётся в строке, но имеет блочную модель размеров.</li><li><code class="i">flex</code>/<code class="i">grid</code>: дети раскладываются по правилам Flexbox/Grid.</li><li><code class="i">none</code>: элемент убран из раскладки.</li></ul>
<p>Скрытие тоже различается:</p>
<table><tr><th>Способ</th><th>Место</th><th>Интерактивность</th></tr>
<tr><td><code class="i">display: none</code></td><td>не занимает</td><td>скрыт и не фокусируется</td></tr>
<tr><td><code class="i">visibility: hidden</code></td><td>сохраняет</td><td>не кликается, скрыт от скринридера</td></tr>
<tr><td><code class="i">opacity: 0</code></td><td>сохраняет</td><td>может ловить клики и фокус</td></tr></table>
<p>Поэтому прозрачная кнопка иногда незаметно перехватывает клик. Для неё надо отдельно управлять кликами и фокусом.</p>

<h5>7. Flexbox: одна ось</h5>
<p>Flexbox удобен, когда надо разложить элементы вдоль одной оси: ряд кнопок, шапку или колонку формы.</p>
<pre class="code">.toolbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between; /* главная ось */
  align-items: center;            /* поперечная ось */
  gap: 12px;
}
.item { flex: 1 1 0; }</pre>
<p>Главная ось задаётся <code class="i">flex-direction</code>. При <code class="i">row</code> она горизонтальная, при <code class="i">column</code> — вертикальная. Поэтому <code class="i">justify-content</code> всегда отвечает за главную ось, а не всегда за горизонталь.</p>
<p><code class="i">flex-grow</code> распределяет свободное место, <code class="i">flex-shrink</code> — нехватку, <code class="i">flex-basis</code> задаёт исходный размер. Распространённое сокращение <code class="i">flex: 1</code> ведёт себя как равное распределение с нулевой базой; точные defaults shorthand и проценты basis стоит учитывать в сложных случаях. Элементы могут упираться в минимальный размер содержимого. Для сжимаемого flex-потомка часто помогает <code class="i">min-width: 0</code>.</p>
<div data-demo="flexbox"></div>

<h5>8. Grid: строки и колонки</h5>
<p>Grid подходит для двумерной раскладки: одновременно задаёт строки и колонки. Часто Grid строит каркас страницы, а Flexbox раскладывает содержимое внутри карточек.</p>
<pre class="code">.layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 20px;
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}</pre>
<p><code class="i">fr</code> — доля свободного места. <code class="i">minmax(0, 1fr)</code> позволяет колонке сжаться уже минимальной ширины содержимого. <code class="i">auto-fit</code> схлопывает пустые колонки и растягивает занятые; <code class="i">auto-fill</code> сохраняет место под пустые колонки.</p>
<p>Короткий выбор: Flexbox — одна ось и естественное распределение элементов; Grid — когда важны сразу строки и колонки. Оба инструмента можно сочетать.</p>

<h5>9. Position и точка отсчёта</h5>
<table><tr><th>Значение</th><th>Поведение</th></tr>
<tr><td><code class="i">static</code></td><td>обычный поток; смещение top/left не действует</td></tr>
<tr><td><code class="i">relative</code></td><td>место сохраняется; можно сдвинуть и задать опору для absolute</td></tr>
<tr><td><code class="i">absolute</code></td><td>выпадает из потока; позиция считается от подходящего предка</td></tr>
<tr><td><code class="i">fixed</code></td><td>обычно относительно окна; transform/contain предка могут изменить опору</td></tr>
<tr><td><code class="i">sticky</code></td><td>сначала в потоке, затем прилипает в пределах контейнера прокрутки</td></tr></table>
<p><b>Containing block</b> — прямоугольник, от которого браузер рассчитывает координаты. Частый шаблон: сделать карточку <code class="i">relative</code>, а бейдж внутри — <code class="i">absolute</code>.</p>
<pre class="code">.card { position: relative; }
.badge { position: absolute; inset-block-start: 8px; inset-inline-end: 8px; }</pre>
<p>Если <code class="i">sticky</code> не работает, проверьте, задан ли <code class="i">top</code>, какой предок прокручивается и хватает ли высоты родителя.</p>

<h5>10. z-index: почему большое число не помогает</h5>
<p><code class="i">z-index</code> работает внутри <b>контекста наложения</b> — отдельной стопки слоёв. Браузер сначала размещает стопку целиком, потом её детей. Если родительская стопка ниже соседней, вложенное меню не выпрыгнет наверх даже с <code class="i">z-index: 9999</code>.</p>
<p>Контекст наложения создают, например, позиционированный элемент с z-index, <code class="i">opacity</code> меньше 1, <code class="i">transform</code>, <code class="i">isolation: isolate</code> и <code class="i">contain: paint</code>. Для глобальных попапов могут подойти нативные <code class="i">&lt;dialog&gt;</code>, Popover API или портал в верхнюю часть DOM.</p>
<div data-demo="stacking-context"></div>

<h5>11. Адаптивность: окно или контейнер</h5>
<p>Пишите базовые стили для узкого экрана, расширяйте их через media queries. Точку перелома выбирайте, когда содержимое перестаёт помещаться, а не по названию конкретного телефона.</p>
<pre class="code">.page { padding: 16px; }
@media (min-width: 800px) { .page { padding: 32px; } }
h1 { font-size: clamp(1.8rem, 4vw, 3.2rem); }</pre>
<p><code class="i">clamp(min, preferred, max)</code> плавно меняет значение в заданных границах. Container queries позволяют компоненту реагировать на ширину своего контейнера, а не окна:</p>
<pre class="code">.card-list { container-type: inline-size; }
.card { display: grid; }
@container (min-width: 420px) {
  .card { grid-template-columns: 120px 1fr; }
}</pre>
<p><code class="i">rem</code> зависит от размера шрифта корня, <code class="i">em</code> — от контекста самого элемента. <code class="i">dvh</code>/<code class="i">svh</code> помогают с мобильной высотой окна. Логические свойства <code class="i">margin-inline</code> и <code class="i">padding-block</code> учитывают направление письма, в том числе RTL.</p>

<h5>12. Современные возможности</h5>
<table><tr><th>Возможность</th><th>Для чего</th></tr>
<tr><td>CSS custom properties <code class="i">--token</code></td><td>Темы: наследуются, участвуют в каскаде и могут меняться во время работы страницы.</td></tr>
<tr><td><code class="i">:has()</code></td><td>Выбрать элемент по содержимому, например <code class="i">.card:has(img)</code>.</td></tr>
<tr><td><code class="i">@layer</code></td><td>Заранее определить порядок приоритета групп CSS.</td></tr>
<tr><td><code class="i">subgrid</code></td><td>Согласовать линии вложенных сеток.</td></tr>
<tr><td><code class="i">aspect-ratio</code></td><td>Задать пропорции и зарезервировать место для медиа.</td></tr>
<tr><td>Nesting, <code class="i">color-mix()</code></td><td>Вложенные правила и вычисление цвета.</td></tr>
<tr><td>Anchor positioning, View Transitions, scroll-driven animations</td><td>Попапы у якоря, переходы и анимации от прокрутки; поддержку нужно сверить с целевыми браузерами.</td></tr></table>
<p>Проверяйте поддержку для браузеров и WebView проекта. Новую функцию лучше добавлять как улучшение, сохраняя рабочий базовый вариант; <code class="i">@supports</code> проверяет конкретное свойство.</p>
<pre class="code">:root { --accent: #568cff; }
[data-theme="dark"] { --accent: #9b8cff; }
.button { background: var(--accent); }

/* Условие по содержимому и низкая специфичность основы */
.field:has(input:invalid) { border-color: crimson; }
:where(article, section) h2 { margin-block-start: 0; }

/* Новый CSS nesting: & относится к внешнему селектору */
.button {
  color: white;
  &:hover { filter: brightness(1.1); }
}</pre>
<p>Custom properties наследуются, поэтому тема часто меняет значение переменной на корневом элементе, а компоненты используют её без знания выбранной темы. <code class="i">:has()</code> смотрит на потомка и позволяет оформить родителя по состоянию содержимого. Для простых условий используйте понятный селектор; если состояние сложное и является бизнес-логикой, класс из приложения может быть яснее.</p>
<p><code class="i">@scope</code> ограничивает, где применяется группа селекторов. Это помогает стилям компонента не протекать в соседние части страницы; он не отменяет каскад, наследование и глобальные стили.</p>
<pre class="code">@scope (.card) to (.nested-card) {
  h2 { margin-block: 0 12px; }
}
/* Внутренние .nested-card образуют границу области */</pre>
<p>Для всплывающих интерфейсов различайте позицию и поведение: Popover API предоставляет нативный способ показать немодальную панель, <code class="i">&lt;dialog&gt;</code> — диалог, который может быть модальным. CSS Anchor Positioning позволяет позиционировать popup относительно триггера. Доступность всё равно нужно проверить: имя, фокус, клавиатурное открытие и закрытие.</p>
<pre class="code">&lt;button popovertarget="help"&gt;Помощь&lt;/button&gt;
&lt;div id="help" popover&gt;Подсказка&lt;/div&gt;</pre>
<pre class="code">@supports (animation-timeline: view()) {
  .item { animation: reveal linear both; animation-timeline: view(); }
}</pre>
<p><code class="i">content-visibility: auto</code> позволяет пропустить часть отрисовки содержимого за экраном. Задайте предполагаемый размер через <code class="i">contain-intrinsic-size</code> и проверьте поведение поиска по странице.</p>

<h5>13. Анимация, производительность и доступность</h5>
<p>Изменение <code class="i">width</code> или <code class="i">top</code> может потребовать пересчитать раскладку. <code class="i">transform</code> и <code class="i">opacity</code> часто анимируются дешевле, но это не гарантия бесплатной GPU-анимации — измеряйте в DevTools. Не назначайте <code class="i">will-change</code> всем элементам подряд.</p>
<pre class="code">@media (prefers-reduced-motion: reduce) {
  .panel { transition-duration: 0.01ms; }
}
:focus-visible { outline: 3px solid #58a6ff; outline-offset: 3px; }</pre>
<p>Не убирайте видимую индикацию клавиатурного фокуса. Проверяйте контраст, увеличение страницы, длинные переводы и reduced motion. CSS меняет вид, но не превращает <code class="i">&lt;div&gt;</code> в доступную кнопку — для действия нужен семантический <code class="i">&lt;button&gt;</code>.</p>

<h5>14. Как отлаживать стили</h5>
<ol><li>В DevTools выберите элемент и проверьте, совпал ли нужный селектор.</li><li>Для неверного цвета/шрифта смотрите зачёркнутые правила, каскад и наследование.</li><li>Для размера смотрите box model, min-width/min-height и Flex/Grid overlay.</li><li>Для перекрытого элемента проверьте stacking context, overflow и containing block.</li><li>Меняйте одно правило за раз и исправляйте источник проблемы, а не добавляйте случайные overrides.</li></ol>
<div class="warn">Переполнение во Flex/Grid часто вызывают длинный URL, код, таблица или картинка. Проверьте автоматический минимум содержимого. Возможные решения: <code class="i">min-width: 0</code>, <code class="i">minmax(0, 1fr)</code>, перенос строки или прокрутка внутри блока.</div>

<h5>Вопросы для самопроверки</h5>
<ol><li>Что учитывается раньше: слой каскада или специфичность?</li><li>Почему ID сильнее десятков классов?</li><li>Как задать селектор с нулевой специфичностью?</li><li>Почему margin 20px и 30px иногда дают промежуток 30px?</li><li>Какая главная ось у <code class="i">flex-direction: column</code>?</li><li>Почему <code class="i">z-index: 9999</code> может проиграть?</li><li>Чем media query отличается от container query?</li></ol>
<div class="key"><b>Ответы:</b> слой; колонка ID; <code class="i">:where()</code> или <code class="i">*</code>; margin схлопнулись; вертикальная; родительский контекст ниже; media смотрит на окно, container — на контейнер.</div>
<p><b>На собеседовании:</b> отвечайте в порядке «задача → выбранный инструмент → почему → ограничение → как проверил». Например: «Для адаптивного списка выбрал Grid с auto-fit/minmax; проверил длинные строки и добавил min-width: 0 колонке, которая должна сжиматься».</p>
<div class="note">Tailwind, CSS Modules и Sass организуют стили, но браузер всё равно применяет обычные правила CSS. Важно уметь объяснить результат через каскад, layout, доступность и отладку.</div>
`,
}
