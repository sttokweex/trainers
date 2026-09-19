import type { Question } from '@/engine/types'

/** CSS и вёрстка — 4 вопрос(ов) */
export const cssIVerstkaQuestions: Question[] = [
  { id:'css-layout', topic:'CSS и вёрстка', type:'theory', level:'junior',
    q:'Flexbox vs Grid: когда что? Разберите ключевые свойства и типовые задачи вёрстки.',
    code:`/* Центрирование — три способа */
  .a { display: grid; place-items: center }
  .b { display: flex; align-items: center; justify-content: center }
  .c { position: absolute; inset: 0; margin: auto; width: 200px; height: 100px }
  
  /* Адаптивная сетка карточек без медиазапросов */
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
  }
  
  /* Шапка: логотип слева, меню справа */
  .header { display: flex; justify-content: space-between; align-items: center }
  .header .spacer { margin-left: auto }`,
    answer:`<h5>Правило выбора</h5>
  <ul>
  <li><b>Flexbox — одномерный</b>: раскладка по одной оси (строка ИЛИ колонка). Панель кнопок, шапка, элементы формы, центрирование.</li>
  <li><b>Grid — двумерный</b>: строки И колонки одновременно. Макет страницы, галереи, сложные карточки, таблицы-сетки.</li>
  </ul>
  <p>Их часто комбинируют: Grid задаёт крупный каркас страницы, Flex раскладывает содержимое внутри блоков.</p>
  <h5>Flexbox: что надо помнить</h5>
  <pre class="code">display: flex;
  flex-direction: row | column;
  justify-content: ...;   /* вдоль ГЛАВНОЙ оси */
  align-items: ...;       /* поперёк главной оси */
  gap: 12px;              /* отступы между элементами, без margin-хаков */
  flex-wrap: wrap;
  
  /* на потомке */
  flex: 1;                /* = flex: 1 1 0% — равные доли */
  flex: 0 0 auto;         /* не растягивать, не сжимать */</pre>
  <p>Ключевая ловушка: <code class="i">justify-content</code> и <code class="i">align-items</code> <b>меняются местами</b> при <code class="i">flex-direction: column</code>. Ещё одна: <code class="i">flex: 1</code> задаёт <code class="i">flex-basis: 0</code>, поэтому исходная ширина элементов игнорируется — если нужна пропорциональность содержимому, берут <code class="i">flex: 1 1 auto</code>.</p>
  <h5>Grid: что надо помнить</h5>
  <pre class="code">display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-areas: "aside main ads";
  gap: 20px;
  
  repeat(auto-fill, minmax(260px, 1fr))   /* адаптив без медиазапросов */
  minmax(min-content, 1fr)
  grid-column: span 2;</pre>
  <p><code class="i">auto-fill</code> vs <code class="i">auto-fit</code>: <code class="i">auto-fill</code> оставляет пустые колонки, <code class="i">auto-fit</code> схлопывает их и растягивает элементы. Частый вопрос.</p>
  <h5>Блочная модель</h5>
  <p><code class="i">box-sizing: border-box</code> (padding и border входят в ширину) — то, что ставят глобально первым правилом в любом проекте. Без него <code class="i">width: 100%</code> + <code class="i">padding</code> выезжает за контейнер.</p>
  <h5>Схлопывание отступов</h5>
  <p>Вертикальные <code class="i">margin</code> соседних блоков <b>схлопываются</b> в больший из двух — источник вечного «почему отступ 20, а не 40». Не происходит во flex- и grid-контейнерах, при наличии padding/border или в новом контексте форматирования. Ещё одна причина, почему <code class="i">gap</code> лучше <code class="i">margin</code>.</p>` },
  { id:'css-specificity', topic:'CSS и вёрстка', type:'theory', level:'middle',
    q:'Как считается специфичность? Что такое каскад, наследование и контекст наложения (z-index не работает — почему)?',
    code:`/* Специфичность: (inline, id, class/attr/pseudo-class, element) */
  div p                     /* 0,0,0,2 */
  .card p                   /* 0,0,1,1 */
  #main .card p             /* 0,1,1,1 */
  [data-open] .item         /* 0,0,2,0 */
  :is(.a, #b) .c            /* :is берёт МАКСИМАЛЬНУЮ специфичность аргумента */
  :where(.a, #b) .c         /* :where всегда 0 — идеально для сбрасывания */
  .btn:hover                /* 0,0,2,0 */
  style="..."               /* 1,0,0,0 */
  !important                /* вне шкалы — последнее средство */`,
    answer:`<h5>Порядок разрешения конфликтов</h5>
  <ol>
  <li><b>Origin и важность</b>: пользовательские <code class="i">!important</code> → авторские <code class="i">!important</code> → авторские обычные → браузерные.</li>
  <li><b>Слои</b> (<code class="i">@layer</code>) — новый механизм: правила из более позднего слоя выигрывают независимо от специфичности.</li>
  <li><b>Специфичность</b> — четвёрка выше, сравнивается слева направо.</li>
  <li><b>Порядок в исходнике</b> — при равной специфичности побеждает последнее правило.</li>
  </ol>
  <h5>Наследование</h5>
  <p>Наследуются в основном текстовые свойства: <code class="i">color</code>, <code class="i">font-*</code>, <code class="i">line-height</code>, <code class="i">text-align</code>, <code class="i">visibility</code>, <code class="i">cursor</code>. Не наследуются <code class="i">display</code>, <code class="i">margin</code>, <code class="i">padding</code>, <code class="i">border</code>, <code class="i">background</code>, <code class="i">width</code>. Принудительно: <code class="i">inherit</code>, <code class="i">initial</code>, <code class="i">unset</code>, <code class="i">revert</code>.</p>
  <h5>Почему не работает z-index — самый частый вопрос</h5>
  <p><code class="i">z-index</code> действует <b>только внутри своего контекста наложения</b> (stacking context) и только на позиционированных элементах. Элемент с <code class="i">z-index: 9999</code> внутри контекста, который сам лежит ниже, всё равно окажется под соседом.</p>
  <p><b>Новый контекст создают</b>: <code class="i">position</code> (кроме static) + <code class="i">z-index</code> ≠ auto, <code class="i">opacity &lt; 1</code>, <code class="i">transform</code>, <code class="i">filter</code>, <code class="i">will-change</code>, <code class="i">isolation: isolate</code>, <code class="i">contain: paint</code>, элементы flex/grid с z-index.</p>
  <p>Отсюда классический баг: добавили <code class="i">transform</code> для анимации — и выпадающее меню внезапно ушло под соседний блок. Решение для модалок и тултипов — <b>портал в <code class="i">body</code></b> (<code class="i">createPortal</code> в React) или новый <code class="i">popover</code> API.</p>
  <h5>Как держать специфичность под контролем</h5>
  <ul>
  <li>Один уровень: только классы, без вложенности и id. Это идея <b>БЭМ</b>: <code class="i">.card__title--active</code> — плоско и предсказуемо.</li>
  <li><b>CSS Modules</b> (<code class="i">*.module.scss</code>) — уникальные имена на этапе сборки, конфликтов нет в принципе.</li>
  <li><b>Tailwind</b> — утилитарные классы одного уровня специфичности; каскад практически перестаёт быть проблемой.</li>
  <li><code class="i">:where()</code> для сброса и базовых стилей — нулевая специфичность легко перекрывается.</li>
  <li><code class="i">!important</code> — только в двух случаях: перекрыть сторонний виджет или утилитарный класс. В своём коде это признак проигранной борьбы с каскадом.</li>
  </ul>` },
  { id:'css-modern', topic:'CSS и вёрстка', type:'theory', level:'middle',
    q:'Современный CSS: переменные, адаптивность, анимации. Что использовать в 2026 вместо старых приёмов?',
    code:`:root {
    --accent: #58a6ff;
    --space: 8px;
    --radius: 12px;
  }
  :root[data-theme='dark'] { --bg: #0a0e14 }
  
  .btn {
    background: var(--accent);
    padding: calc(var(--space) * 1.5) calc(var(--space) * 2);
    border-radius: var(--radius);
  }
  
  /* адаптивная типографика без медиазапросов */
  h1 { font-size: clamp(1.5rem, 4vw, 3rem) }
  
  /* container queries — по размеру КОНТЕЙНЕРА, а не окна */
  .card-wrap { container-type: inline-size }
  @container (min-width: 400px) { .card { grid-template-columns: 1fr 2fr } }
  
  /* уважение к настройкам пользователя */
  @media (prefers-reduced-motion: reduce) { * { animation: none !important } }`,
    answer:`<h5>Custom properties (переменные CSS)</h5>
  <p>В отличие от переменных Sass, они живут <b>в рантайме</b>: наследуются, меняются через JS (<code class="i">el.style.setProperty('--accent', '#f00')</code>) и реагируют на медиазапросы. Это основа тем оформления: переопределяем набор переменных в <code class="i">[data-theme="dark"]</code> — и вся страница перекрашивается без перезагрузки стилей.</p>
  <h5>Адаптивность</h5>
  <ul>
  <li><b>Mobile-first</b>: базовые стили для узкого экрана, расширение через <code class="i">min-width</code>. Меньше переопределений и легче читать.</li>
  <li><code class="i">clamp(min, preferred, max)</code> — плавная типографика и отступы без ступенек медиазапросов.</li>
  <li><b>Container queries</b> — переломная фича: компонент адаптируется под ширину <b>своего контейнера</b>. Именно то, чего не хватало компонентному подходу, ведь один и тот же <code class="i">Card</code> может стоять и в узкой колонке, и на всю ширину.</li>
  <li>Логические свойства (<code class="i">margin-inline</code>, <code class="i">padding-block</code>) — корректно работают при RTL. Актуально, раз у вас i18n на несколько языков.</li>
  <li>Единицы: <code class="i">dvh</code>/<code class="i">svh</code> вместо <code class="i">vh</code> — решают проблему «прыгающей» адресной строки на мобильных.</li>
  </ul>
  <h5>Анимации: что можно анимировать дёшево</h5>
  <p>Только <code class="i">transform</code> и <code class="i">opacity</code> обрабатываются на GPU в фазе composite, не вызывая reflow. Анимация <code class="i">width</code>, <code class="i">top</code>, <code class="i">margin</code> дёргает layout на каждом кадре и роняет FPS.</p>
  <pre class="code">/* ❌ */ transition: left .3s;      /* ✅ */ transition: transform .3s;
  /* ❌ */ transition: all .3s;        /* ✅ */ transition: opacity .3s, transform .3s;</pre>
  <p><code class="i">will-change</code> — подсказка браузеру создать отдельный слой, но <b>не ставьте её на всё подряд</b>: каждый слой ест память видеокарты.</p>
  <h5>Новое, о чём стоит знать</h5>
  <ul>
  <li><code class="i">:has()</code> — «родительский» селектор: <code class="i">.card:has(img)</code>. Долгожданная фича.</li>
  <li><code class="i">@layer</code> — управление каскадом без гонки специфичности.</li>
  <li><code class="i">aspect-ratio</code> — вместо padding-hack, заодно лечит CLS.</li>
  <li><code class="i">content-visibility: auto</code> — браузер не рендерит то, что за экраном.</li>
  <li><code class="i">subgrid</code>, <code class="i">popover</code>, <code class="i">dialog</code>, <code class="i">color-mix()</code>, вложенность CSS.</li>
  </ul>
  <div class="hint">Про Tailwind (он у вас в трёх проектах) стоит уметь сказать взвешенно: плюсы — нет мёртвого CSS, нет проблемы именования, единая шкала отступов и цветов, стили рядом с разметкой. Минусы — «грязный» HTML, кривая обучения, и без компонентов начинается копипаст классов. Поэтому его берут <b>вместе</b> с компонентным подходом, а не вместо него.</div>` },
  { id:'css-position', topic:'CSS и вёрстка', type:'theory', level:'junior',
    q:'Разберите <code class="i">position</code>, <code class="i">display</code> и как работает поток документа. Чем отличается <code class="i">display: none</code> от <code class="i">visibility: hidden</code> и <code class="i">opacity: 0</code>?',
    answer:`<h5>position</h5>
  <table>
  <tr><th>Значение</th><th>Поведение</th></tr>
  <tr><td><code class="i">static</code></td><td>по умолчанию, в потоке, <code class="i">top/left</code> игнорируются</td></tr>
  <tr><td><code class="i">relative</code></td><td>смещается относительно себя, <b>место в потоке сохраняется</b>; становится точкой отсчёта для absolute-потомков</td></tr>
  <tr><td><code class="i">absolute</code></td><td>выпадает из потока, позиционируется относительно ближайшего <b>позиционированного</b> предка</td></tr>
  <tr><td><code class="i">fixed</code></td><td>относительно окна; но <b>любой <code class="i">transform</code>/<code class="i">filter</code> у предка делает его точкой отсчёта</b> — классический баг</td></tr>
  <tr><td><code class="i">sticky</code></td><td>relative, пока не достигнет порога, потом ведёт себя как fixed в пределах родителя</td></tr>
  </table>
  <p><b>Почему не работает sticky</b> — топовый практический вопрос. Причины: не задан <code class="i">top</code>/<code class="i">bottom</code>; у родителя <code class="i">overflow: hidden/auto/scroll</code>; родитель ниже по высоте, чем элемент; родитель — flex-контейнер с <code class="i">align-items: stretch</code> в некоторых случаях.</p>
  <h5>display</h5>
  <ul>
  <li><code class="i">block</code> — занимает всю ширину, слушается width/height и вертикальных margin.</li>
  <li><code class="i">inline</code> — по содержимому, <b>игнорирует</b> width/height и вертикальные margin.</li>
  <li><code class="i">inline-block</code> — в строке, но с полноценной блочной моделью.</li>
  <li><code class="i">flex</code> / <code class="i">grid</code> — контейнеры раскладки; <code class="i">inline-flex</code>/<code class="i">inline-grid</code> — то же, но в строке.</li>
  <li><code class="i">contents</code> — элемент исчезает как коробка, а его дети попадают в раскладку родителя. Полезно с flex/grid, но ломает доступность для интерактивных элементов.</li>
  </ul>
  <h5>Три способа «спрятать» — разница принципиальна</h5>
  <table>
  <tr><th></th><th>Занимает место</th><th>Кликабелен</th><th>Виден скринридеру</th><th>Анимируется</th></tr>
  <tr><td><code class="i">display: none</code></td><td>нет</td><td>нет</td><td>нет</td><td>нет</td></tr>
  <tr><td><code class="i">visibility: hidden</code></td><td><b>да</b></td><td>нет</td><td>нет</td><td>нет</td></tr>
  <tr><td><code class="i">opacity: 0</code></td><td>да</td><td><b>ДА</b> — ловит клики!</td><td><b>ДА</b> — читается!</td><td>да</td></tr>
  <tr><td><code class="i">.sr-only</code> (clip)</td><td>нет визуально</td><td>да</td><td><b>да — специально</b></td><td>—</td></tr>
  </table>
  <p><code class="i">opacity: 0</code> без <code class="i">pointer-events: none</code> — источник «невидимой кнопки, которая перехватывает клики». А <code class="i">.sr-only</code> используют наоборот: скрыть визуально, но оставить для скринридера (подписи к иконкам).</p>` },
]
