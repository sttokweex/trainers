import type { TheoryArticle } from '@/engine/types'

export const css: TheoryArticle = { id:'th-css', topic:'CSS и вёрстка', title:'CSS: раскладка, каскад и современные возможности',
  lead:'Flexbox и Grid, специфичность, контексты наложения, переменные и отладка — с ответами на вечные «почему не работает».',
  body:`
<h5>Flexbox или Grid</h5>
<ul>
<li><b>Flexbox одномерный</b>: раскладка вдоль одной оси. Панель кнопок, шапка, поля формы, центрирование.</li>
<li><b>Grid двумерный</b>: строки и колонки одновременно. Макет страницы, галереи, сложные карточки.</li>
</ul>
<p>На практике их комбинируют: Grid задаёт каркас страницы, Flex раскладывает содержимое внутри блоков.</p>
<pre class="code">/* Flexbox */
display: flex;
flex-direction: row | column;
justify-content: ...;   /* вдоль ГЛАВНОЙ оси */
align-items: ...;       /* поперёк главной оси */
gap: 12px;              /* отступы без margin-хаков */

/* на потомке */
flex: 1;                /* = 1 1 0% — равные доли, исходная ширина игнорируется */
flex: 1 1 auto;         /* доли пропорционально содержимому */
flex: 0 0 auto;         /* не растягивать и не сжимать */</pre>
<div class="warn">Две вечные ловушки Flexbox. Первая: <code class="i">justify-content</code> и <code class="i">align-items</code> <b>меняются местами</b> при <code class="i">flex-direction: column</code> — они привязаны к осям, а не к экрану. Вторая: <code class="i">flex: 1</code> задаёт <code class="i">flex-basis: 0</code>, поэтому все элементы станут равными независимо от содержимого.</div>
<pre class="code">/* Grid */
display: grid;
grid-template-columns: 200px 1fr 200px;
grid-template-areas: "aside main ads";
gap: 20px;

/* адаптивная сетка вообще без медиазапросов */
grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));</pre>
<p><code class="i">auto-fill</code> оставляет пустые колонки, <code class="i">auto-fit</code> схлопывает их и растягивает элементы — разницу спрашивают часто.</p>

<div data-demo="flexbox"></div>
<h5>Блочная модель и схлопывание отступов</h5>
<p><code class="i">box-sizing: border-box</code> ставят глобально первым правилом любого проекта: без него <code class="i">width: 100%</code> вместе с <code class="i">padding</code> выезжает за контейнер.</p>
<p><b>Схлопывание margin</b> — источник вечного «почему отступ 20, а не 40»: вертикальные отступы соседних блоков схлопываются в больший из двух. Не происходит внутри flex- и grid-контейнеров, при наличии padding или border, и в новом контексте форматирования. Это, кстати, ещё один аргумент в пользу <code class="i">gap</code> вместо <code class="i">margin</code>.</p>

<h5>Специфичность и каскад</h5>
<p>Конфликт правил разрешается по порядку:</p>
<ol>
<li><b>Важность и происхождение</b>: пользовательские <code class="i">!important</code> → авторские <code class="i">!important</code> → авторские обычные → браузерные.</li>
<li><b>Слои</b> <code class="i">@layer</code> — правила из более позднего слоя выигрывают независимо от специфичности.</li>
<li><b>Специфичность</b> — четвёрка (inline, id, class/attr/pseudo-class, element), сравнивается слева направо.</li>
<li><b>Порядок в исходнике</b> — при равенстве побеждает последнее.</li>
</ol>
<pre class="code">div p              0,0,0,2
.card p            0,0,1,1
#main .card p      0,1,1,1
[data-open] .item  0,0,2,0
:is(.a, #b) .c     берёт МАКСИМАЛЬНУЮ специфичность аргумента
:where(.a, #b) .c  всегда 0 — идеально для базовых стилей
style="..."        1,0,0,0
!important         вне шкалы</pre>
<p>Как держать специфичность под контролем: только классы без вложенности и id (идея <b>БЭМ</b>), <b>CSS Modules</b> с уникальными именами на этапе сборки, <b>Tailwind</b> с одним уровнем утилит, <code class="i">:where()</code> для сбрасываемых базовых стилей. <code class="i">!important</code> в своём коде — признак проигранной борьбы с каскадом.</p>

<div data-demo="specificity"></div>
<h5>Почему не работает z-index</h5>
<p>Самый частый практический вопрос. <code class="i">z-index</code> действует <b>только внутри своего контекста наложения</b> и только на позиционированных элементах. Элемент с <code class="i">z-index: 9999</code> внутри контекста, который сам лежит ниже соседа, всё равно окажется под ним.</p>
<p><b>Новый контекст наложения создают</b>: <code class="i">position</code> (кроме static) вместе с <code class="i">z-index</code> ≠ auto, <code class="i">opacity &lt; 1</code>, <code class="i">transform</code>, <code class="i">filter</code>, <code class="i">will-change</code>, <code class="i">isolation: isolate</code>, <code class="i">contain: paint</code>.</p>
<p>Отсюда классический баг: добавили <code class="i">transform</code> ради анимации — и выпадающее меню ушло под соседний блок. Радикальное решение для модалок, тултипов и дропдаунов — <b>портал в <code class="i">body</code></b> (<code class="i">createPortal</code> в React) или нативные <code class="i">&lt;dialog&gt;</code> и popover API.</p>

<div data-demo="stacking-context"></div>
<h5>Почему не работает position: sticky</h5>
<p>Второй по частоте вопрос. Причины, по убыванию вероятности: не задан <code class="i">top</code> (или <code class="i">bottom</code>); у родителя <code class="i">overflow: hidden/auto/scroll</code>; родитель по высоте не больше самого элемента; элемент выше вьюпорта и <b>у него нет собственной прокрутки</b>.</p>
<p>Последний случай особенно коварен: длинный липкий сайдбар прижимается сверху, а его нижняя часть оказывается за краем экрана и недостижима. Лечится добавлением <code class="i">max-height</code> и <code class="i">overflow-y: auto</code> самому элементу.</p>

<h5>Три способа спрятать элемент</h5>
<table>
<tr><th></th><th>Занимает место</th><th>Кликабелен</th><th>Читает скринридер</th><th>Анимируется</th></tr>
<tr><td><code class="i">display: none</code></td><td>нет</td><td>нет</td><td>нет</td><td>нет</td></tr>
<tr><td><code class="i">visibility: hidden</code></td><td><b>да</b></td><td>нет</td><td>нет</td><td>нет</td></tr>
<tr><td><code class="i">opacity: 0</code></td><td>да</td><td><b>ДА</b></td><td><b>ДА</b></td><td>да</td></tr>
<tr><td><code class="i">.sr-only</code></td><td>визуально нет</td><td>да</td><td><b>да — специально</b></td><td>—</td></tr>
</table>
<p><code class="i">opacity: 0</code> без <code class="i">pointer-events: none</code> — источник «невидимой кнопки, которая перехватывает клики». А <code class="i">.sr-only</code> используют наоборот: скрыть визуально, но оставить для скринридера.</p>

<h5>Переменные и темы</h5>
<pre class="code">:root {
  --accent: #58a6ff;
  --space: 8px;
  --radius: 12px;
}
:root[data-theme='dark'] { --bg: #0a0e14 }

.btn {
  background: var(--accent);
  padding: calc(var(--space) * 1.5) calc(var(--space) * 2);
}</pre>
<p>В отличие от переменных Sass, custom properties живут <b>в рантайме</b>: наследуются по дереву, меняются из JS через <code class="i">setProperty</code>, реагируют на медиазапросы. Это основа тем: переопределили набор переменных — вся страница перекрасилась без перезагрузки стилей.</p>

<h5>Единицы измерения</h5>
<table>
<tr><th>Единица</th><th>Относительно</th><th>Когда</th></tr>
<tr><td><code class="i">px</code></td><td>абсолютная</td><td>границы, тени, мелкие детали</td></tr>
<tr><td><code class="i">rem</code></td><td>шрифт <code class="i">html</code></td><td><b>шрифты и отступы</b> — масштабируются с настройками пользователя</td></tr>
<tr><td><code class="i">em</code></td><td>шрифт элемента</td><td>отступы, зависящие от размера текста компонента</td></tr>
<tr><td><code class="i">vw/vh</code></td><td>окно</td><td>полноэкранные блоки</td></tr>
<tr><td><code class="i">dvh/svh/lvh</code></td><td>динамическая высота окна</td><td>мобильные: решает прыжок адресной строки</td></tr>
<tr><td><code class="i">ch</code></td><td>ширина символа</td><td>ограничение длины строки: <code class="i">max-width: 65ch</code></td></tr>
<tr><td><code class="i">fr</code></td><td>доля свободного места</td><td>только в grid</td></tr>
</table>

<h5>Адаптивность и анимации</h5>
<p><b>Mobile-first</b>: базовые стили для узкого экрана, расширение через <code class="i">min-width</code>. Меньше переопределений и легче читать.</p>
<p><code class="i">clamp(min, preferred, max)</code> даёт плавную типографику без ступенек медиазапросов: <code class="i">font-size: clamp(1.5rem, 4vw, 3rem)</code>.</p>
<p><b>Container queries</b> — переломная возможность: компонент адаптируется под ширину <b>своего контейнера</b>, а не окна. Именно этого не хватало компонентному подходу: один и тот же <code class="i">Card</code> может стоять и в узкой колонке, и на всю ширину.</p>
<pre class="code">.wrap { container-type: inline-size }
@container (min-width: 400px) { .card { grid-template-columns: 1fr 2fr } }</pre>
<p>Про анимации правило одно: дёшево анимируются только <code class="i">transform</code> и <code class="i">opacity</code> — они обрабатываются на GPU в фазе композитинга. Анимация <code class="i">width</code>, <code class="i">top</code> или <code class="i">margin</code> дёргает layout каждый кадр.</p>
<pre class="code">/* ❌ */ transition: left .3s;   /* ✅ */ transition: transform .3s;
/* ❌ */ transition: all .3s;     /* ✅ */ transition: opacity .3s, transform .3s;

@media (prefers-reduced-motion: reduce) { * { animation: none !important } }</pre>

<h5>Что появилось недавно</h5>
<p><b><code class="i">:has()</code> — «родительский» селектор.</b> До него CSS умел выбирать только вниз по дереву: «потомок такого-то». Теперь можно выбрать элемент <b>по содержимому</b>.</p>
<pre class="code">.card:has(img)            карточка, внутри которой есть картинка
label:has(input:checked)  подпись у отмеченного чекбокса
.form:has(:invalid)       форма, где есть хоть одно невалидное поле
article:not(:has(h2))     статья без подзаголовков</pre>
<p>Это закрывает множество мест, где раньше приходилось вешать класс из JavaScript.</p>

<p><b><code class="i">@layer</code> — слои каскада.</b> Позволяет объявить порядок приоритета групп стилей <b>явно</b>, не воюя со специфичностью. Правило из более позднего слоя побеждает, даже если у него специфичность ниже.</p>
<pre class="code">@layer reset, library, components, utilities;   /* порядок задан один раз */

@layer library  { .btn { padding: 8px } }        /* проиграет */
@layer components { .btn { padding: 12px } }     /* победит, хотя специфичность та же */</pre>
<p>Практический смысл: подключили чужую библиотеку в слой <code class="i">library</code> — и ваши стили перекрывают её без единого <code class="i">!important</code>.</p>

<p><b><code class="i">aspect-ratio</code> — фиксированные пропорции.</b> Раньше для блока 16:9 применяли «padding-хак»: пустой элемент с <code class="i">padding-top: 56.25%</code>, потому что проценты в padding считаются от <i>ширины</i>. Теперь просто <code class="i">aspect-ratio: 16 / 9</code>. Заодно это лечит <b>CLS</b> (скачок вёрстки): браузер резервирует место под картинку до её загрузки.</p>

<p><b><code class="i">content-visibility: auto</code> — пропуск отрисовки.</b> Браузер не считает layout и не рисует содержимое блока, пока тот за пределами экрана. Для длинной страницы это может ускорить первую отрисовку в разы. Нужен парный <code class="i">contain-intrinsic-size</code> — предполагаемая высота, иначе полоса прокрутки будет прыгать.</p>

<p><b>Логические свойства.</b> Вместо физических направлений (<code class="i">left</code>, <code class="i">right</code>, <code class="i">top</code>) — направления относительно <b>потока текста</b>: <code class="i">margin-inline-start</code> вместо <code class="i">margin-left</code>, <code class="i">padding-block</code> вместо вертикальных отступов. При переключении на арабский или иврит (<code class="i">dir="rtl"</code>) вёрстка зеркалится сама. Актуально, раз у вас i18n на несколько языков.</p>

<p><b><code class="i">subgrid</code></b> — вложенная сетка наследует линии родительской. Решает старую боль: три карточки рядом, у каждой заголовок, текст и кнопка — и нужно, чтобы кнопки были на одной высоте, хотя текст разной длины.</p>

<p><b><code class="i">color-mix()</code></b> — смешивание цветов прямо в CSS: <code class="i">color-mix(in srgb, var(--accent) 20%, transparent)</code>. Позволяет строить палитру состояний (hover, disabled) от одной переменной, без препроцессора.</p>

<p><b>Вложенность CSS</b> — то, ради чего многие держали Sass, теперь работает нативно:</p>
<pre class="code">.card {
  padding: 16px;
  &amp;:hover { background: var(--panel2) }
  .title { font-weight: 600 }
  @media (min-width: 700px) { padding: 24px }
}</pre>

<h5>Отладка</h5>
<ul>
<li><code class="i">* { outline: 1px solid red }</code> — увидеть все коробки сразу.</li>
<li>Горизонтальный скролл: пробежать по всем элементам и найти тот, чей <code class="i">scrollWidth</code> больше ширины body.</li>
<li>DevTools: вкладка Layout с оверлеями grid и flex; Computed показывает, откуда пришло значение и какие правила проиграли; Rendering подсвечивает перерисовки.</li>
<li>Стиль не применяется — смотрите перечёркнутые правила в Styles: это и есть проигравшая специфичность.</li>
</ul>
<div class="note">Про Tailwind (он в трёх ваших проектах) стоит уметь сказать взвешенно. Плюсы: нет мёртвого CSS, нет проблемы именования, единая шкала отступов и цветов, стили рядом с разметкой. Минусы: «шумный» HTML, порог входа, и без компонентного слоя начинается копипаст длинных строк классов. Поэтому его берут <b>вместе</b> с компонентами, а не вместо них.</div>` }
