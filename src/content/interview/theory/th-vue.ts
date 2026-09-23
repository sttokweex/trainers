import type { TheoryArticle } from '@/engine/types'

export const vue: TheoryArticle = { id:'th-vue', topic:'Vue', title:'Vue 3 с нуля: реактивность, компоненты, Router, Pinia и Nuxt',
  lead:'Разбираем Vue до уровня уверенного чтения реального проекта: SFC, Composition API, proxy-based reactivity, шаблоны, формы, маршруты, состояние и SSR.',
  body:`
<h5>Vue как framework и его место рядом с React/Angular</h5>
<p><b>Vue</b> — прогрессивный JavaScript framework для интерфейсов. Его можно подключить к отдельному виджету или использовать с официальными Router, Pinia и Vite-based tooling как основу крупного SPA. В отличие от Angular, Vue не требует такого объёма framework-specific архитектуры; в отличие от React, в Vue встроены собственный реактивный runtime и шаблонный язык. Ни один из вариантов не делает архитектуру за команду.</p>
<p>Vue 3 — актуальная major-линия с Composition API и Proxy-based reactivity. Vue 2 использовал другую систему наблюдения с особенностями добавления свойств и индексов массивов. Изучая статью/код, сначала выясните major-версию, потому что Vue 2 и Vue 3 отличаются и API, и экосистемой.</p>

<h5>Single-File Component и сборка</h5>
<p><b>Single-File Component (SFC)</b> — файл <code class="i">.vue</code>, который обычно содержит template, script и style блоки. Компилятор преобразует template в render code, script setup/macros — в module, а scoped styles — в CSS с селекторной обработкой. Браузер не исполняет SFC напрямую: нужен Vue SFC compiler и build/dev tooling, обычно Vite.</p>
<pre class="code">&lt;script setup lang="ts"&gt;
import { computed, ref } from 'vue'

const count = ref(0)
const double = computed(() =&gt; count.value * 2)
function increment() { count.value++ }
&lt;/script&gt;

&lt;template&gt;
  &lt;button @click="increment"&gt;{{ count }} · {{ double }}&lt;/button&gt;
&lt;/template&gt;

&lt;style scoped&gt;
button { border-radius: .5rem; }
&lt;/style&gt;</pre>
<p><code class="i">&lt;script setup&gt;</code> — compile-time синтаксический сахар Composition API. Объявленные верхнеуровневые bindings доступны в template. Макросы вроде <code class="i">defineProps</code>/<code class="i">defineEmits</code> обрабатывает compiler; это не обычные runtime-функции и их не импортируют.</p>

<h5>Реактивность: ref, reactive и Proxy</h5>
<p><b>Reactivity system</b> отслеживает чтение реактивных свойств и повторно запускает зависящий render/effect после записи. В Vue 3 <code class="i">reactive(object)</code> создаёт Proxy: getter фиксирует зависимость, setter уведомляет подписчиков. Примитивное значение нельзя перехватить Proxy как свойство объекта, поэтому для скаляра используют <code class="i">ref</code> — объект-контейнер с полем <code class="i">value</code>.</p>
<p>В шаблоне top-level ref обычно автоматически разворачивается: пишут <code class="i">{{ count }}</code>, в script — <code class="i">count.value</code>. Вложенные refs, массивы refs и деструктуризация reactive объектов имеют отдельные правила: наивная деструктуризация теряет реактивную связь. Используйте <code class="i">toRef</code>/<code class="i">toRefs</code>, если нужно вынести свойства с сохранением реактивности; помните, что это создаёт ref-представление того же источника, а не глубокую копию.</p>
<pre class="code">const state = reactive({ user: { name: 'Ada' }, count: 0 })
const { count } = state // обычное значение/деструктуризация теряет proxy-доступ
const countRef = toRef(state, 'count') // реактивная связь сохранена</pre>
<p>Не объявляйте весь мир через <code class="i">reactive</code> «чтобы обновлялось»: выбирайте ref для заменяемого значения и reactive для объектной структуры, учитывая unwrap. Реактивность отслеживает операции над proxy/ref, а не произвольную мутацию глубокого объекта, который не был подключён к этой системе.</p>

<h5>computed, watch и watchEffect</h5>
<p><code class="i">computed</code> — ленивое кешируемое производное значение. Оно пересчитывается, когда меняются фактически прочитанные dependencies; пока никто не читает computed, пересчёт может быть отложен. Используйте его для derived state, а не дублируйте результат в другом ref через watch без необходимости.</p>
<p><code class="i">watch(source, callback)</code> запускает side effect при изменении явно заданного источника. Источником может быть ref, getter, несколько источников; глубокое наблюдение обходится дороже и в новых версиях допускает ограничения глубины. Callback получает new/old value, а опции flush контролируют момент относительно обновления DOM.</p>
<p><code class="i">watchEffect</code> автоматически собирает зависимости, прочитанные во время синхронного выполнения callback. Это удобно для компактных side effects, но зависимость менее явная; при async-функции чтения после первого await не всегда собираются как dependencies. Для запросов учитывайте отмену устаревшей операции через cleanup/AbortController и гонки ответов.</p>

<h5>Template syntax, директивы и ключи</h5>
<p><code class="i">{{ expression }}</code> интерполирует текст и экранирует HTML по умолчанию. <code class="i">v-bind</code>/<code class="i">:</code> связывает DOM property/attribute, <code class="i">v-on</code>/<code class="i">@</code> слушает событие. Модификаторы вроде <code class="i">.prevent</code>, <code class="i">.stop</code>, <code class="i">.once</code> декларативно задают стандартную обработку, но не должны скрывать неочевидные эффекты.</p>
<p><code class="i">v-if</code> условно создаёт/удаляет subtree; <code class="i">v-show</code> оставляет его в DOM и переключает CSS display. Если блок часто переключается и дорог в монтировании, это может склонить к v-show; если компонент имеет тяжёлые побочные эффекты и редко нужен — v-if. <code class="i">v-for</code> рендерит список; добавляйте стабильный <code class="i">:key</code>, который идентифицирует сущность, а не позицию.</p>
<p><code class="i">v-model</code> — соглашение синхронизации значения и события. На native input оно обычно связывает value/input, на компоненте использует model prop/event контракт (в Vue 3 стандартно modelValue/update:modelValue, с именованными моделями). Это не двустороннее изменение любой переменной без события: child сообщает новое значение, родитель обновляет источник.</p>

<h5>Компоненты: props, emits, slots и события</h5>
<p>Компонент — изолированный UI unit. Props идут от родителя вниз; компонент не должен менять prop напрямую. Чтобы сообщить изменение вверх, он emit-ит событие. Это однонаправленный поток: parent владеет состоянием, child получает входы и отправляет намерения. Для повторно используемых частей задавайте типы, defaults, validator и явно объявляйте emits.</p>
<p><b>Slots</b> позволяют родителю передать содержимое в точку композиции child. Named slots задают несколько зон; scoped slot позволяет child передать данные для построения markup у родителя. Slots часто дают гибкость композиции без огромного количества boolean props.</p>
<p>Provide/inject передаёт значение через глубину дерева и полезен для контекста компонента/плагина. Он скрывает зависимость от промежуточных компонентов, поэтому используйте понятные typed keys и не делайте неявную глобальную шину.</p>

<h5>Lifecycle, nextTick и очистка</h5>
<p>Lifecycle hooks выполняются на стадиях создания, монтирования, обновления и размонтирования компонента. <code class="i">onMounted</code> подходит для доступа к реально созданному DOM, <code class="i">onUnmounted</code> — для удаления event listeners, таймеров, observers и подписок. Не обращайтесь к DOM напрямую до mount, если элемент ещё не существует.</p>
<p>Vue batch-ит обновления DOM. Изменение ref не означает, что DOM поменялся синхронно в этой строке кода. <code class="i">nextTick()</code> ждёт завершения следующего DOM flush, если нужно измерить только что обновлённый элемент. Это не задержка API и не способ дождаться любой асинхронной операции.</p>

<h5>Composition API, composables и Options API</h5>
<p><b>Options API</b> группирует код по секциям data/computed/methods/watch/lifecycle; новичку проще сопоставить жизненный цикл. <b>Composition API</b> группирует по функциональности внутри setup и позволяет переиспользовать логику в <b>composable</b> — функции вида <code class="i">useFeature()</code>, возвращающей refs/functions.</p>
<p>Composition API лучше масштабируется для логики, которая пересекает разные concerns, но можно создать composable на каждую строку и потерять читаемость. Composable должен ясно описывать владельца и время жизни состояния: вызов useCart может создавать отдельную корзину в каждом компоненте или возвращать общий singleton — это разные архитектуры.</p>

<h5>Vue Router и Pinia</h5>
<p><b>Vue Router</b> связывает URL с route components, nested routes, params, query, guards и lazy chunks. URL — часть состояния приложения: фильтр или открытый объект часто следует кодировать в query/path, чтобы ссылка копировалась, обновлялась и работала назад/вперёд. Guard помогает навигации и UX, но права проверяются на сервере.</p>
<p><b>Pinia</b> — официальный store ecosystem Vue. Store задаёт state/getters/actions, может использоваться компонентами и расширениями. Для локального состояния компонента достаточно ref; общий store нужен при shared state между distant screens, persistence, devtools или явной модели domain. Не храните derived data без нужды и не превращайте store в любое состояние UI.</p>

<h5>Nuxt: мета-framework на Vue</h5>
<p><b>Nuxt</b> добавляет поверх Vue conventions маршрутов, серверный runtime, SSR/SSG, data fetching, middleware, автоимпорты и server API handlers. SSR создаёт HTML на сервере; hydration связывает HTML с клиентским Vue runtime. Данные первого render должны совпадать, а browser-only API нельзя без проверки читать в серверном модуле. Server code и browser code имеют разные возможности и границы секретов.</p>
<p>Nuxt composables data-fetching может иметь deduplication/cache semantics, отличающиеся от простого вызова fetch в setup. Понимайте request-scoped состояние: нельзя хранить user-specific mutable данные в process-wide singleton при SSR — иначе есть риск утечки между запросами. Серверная переменная окружения не должна сериализоваться в payload страницы.</p>

<h5>Стили, TypeScript и тестирование</h5>
<p><code class="i">&lt;style scoped&gt;</code> компилятор помечает атрибутами и переписывает селекторы; это уменьшает случайные конфликты, но не создаёт полную изоляцию CSS: наследование, глобальные правила и deep selectors остаются. CSS Modules, utility CSS или design tokens выбирают по соглашению команды.</p>
<p>Vue SFC поддерживает TypeScript в script; шаблоны тоже проверяются инструментами Vue Language Tools/Volar. Unit/component тесты проверяют composables и взаимодействия, e2e — путь пользователя. Для async DOM используйте ожидания обновления, не фиксированные sleep; мокайте границы, а не внутренности framework.</p>

<h5>Типичные ошибки и план обучения</h5>
<ul><li>Не распознают потерю реактивности после destructuring reactive object.</li><li>Используют watch для всего производного состояния вместо computed.</li><li>Меняют prop ребёнка напрямую вместо emit/update model.</li><li>Забывают key у v-for или ставят нестабильный индекс при сортировке.</li><li>Не очищают timers/event listeners при unmount.</li><li>Смешивают SSR и browser globals или кладут секрет в payload.</li><li>Используют Pinia для каждой локальной переменной, создавая глобальную связанность.</li><li>Полагаются на клиентский router guard как на backend security.</li></ul>
<div data-demo="framework-reactivity-lab"></div>

<h5>Практика от нуля до собеседования</h5>
<ol><li>Сделайте SFC счётчик с ref/computed, затем замените производный ref на computed и объясните отличие.</li><li>Напишите поиск с v-model, debounce, отменой старого запроса и состояниями idle/loading/empty/error/result.</li><li>Сделайте parent/child контракт через props/emits, затем вторую версию через named v-model.</li><li>Соберите динамический список, сортируйте и удаляйте записи; проверьте стабильные keys по локальному input state.</li><li>Разложите повторно используемую логику на composable и докажите, где его state отдельный, а где общий.</li><li>Создайте nested routes, lazy-load экран и сохраните фильтр в query string.</li><li>Перенесите данные между страницами через Pinia, а затем оцените, можно ли заменить store server cache/router state.</li><li>Сделайте Nuxt SSR страницу с приватным server env и проверьте, что secret отсутствует в HTML/payload.</li></ol>` }
