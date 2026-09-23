import type { TheoryArticle } from '@/engine/types'

export const nuxt: TheoryArticle = { id:'th-nuxt', topic:'Nuxt', title:'Nuxt 3/4: Vue-приложение, SSR, маршруты, данные и deployment',
  lead:'Подробная модель Nuxt поверх Vue: файловая маршрутизация, Nitro, server/client границы, универсальный рендер, кеширование, middleware, модули и отладка production.',
  body:`
<h5>Nuxt — приложение и серверный runtime вокруг Vue</h5>
<p>Vue отвечает за компонентную модель и реактивный UI. Nuxt добавляет соглашения по структуре приложения, file-based routing, layouts, server rendering, data fetching, SEO metadata, server endpoints, middleware, module ecosystem и production server engine Nitro. Поэтому Nuxt — meta-framework: он задаёт интеграционный слой и способ собирать web-приложение, а не заменяет знание Vue/HTTP.</p>
<p>Nuxt major-версии меняют детали runtime, конфигурации и defaults. Современный Nuxt 3/4 построен вокруг Vue 3 и Nitro; старые Nuxt 2 примеры могут использовать иной lifecycle, Vue 2, asyncData/fetch semantics и webpack defaults. Всегда связывайте ответ с версией проекта и документацией конкретной major версии.</p>

<h5>Структура проекта и file-based routing</h5>
<p>Файлы в <code class="i">pages/</code> создают маршруты по соглашению: <code class="i">pages/index.vue</code> — корень, <code class="i">pages/products/[id].vue</code> — параметрический маршрут. <code class="i">layouts/</code> задаёт общую рамку, <code class="i">components/</code> и <code class="i">composables/</code> поддерживают автоимпорт по правилам framework. <code class="i">plugins/</code> интегрирует клиентские или универсальные плагины. <code class="i">server/api/</code> объявляет серверные endpoints Nitro.</p>
<pre class="code">pages/products/[id].vue
&lt;script setup lang="ts"&gt;
const route = useRoute()
const { data: product, status, error } = await useFetch(
  '/api/products/' + route.params.id,
)
&lt;/script&gt;</pre>
<p>Автоимпорт — механизм компиляции Nuxt, а не глобальный браузерный API JavaScript. IDE и lint должны понимать Nuxt type generation. Если вручную копировать модуль вне Nuxt контекста, auto-import может оказаться недоступен.</p>

<h5>Rendering modes: SSR, SPA, prerender и гибрид</h5>
<p>Nuxt может рендерить страницы на сервере на каждый запрос, заранее генерировать часть маршрутов, отдавать клиентское приложение или смешивать режимы по route rules. Серверный HTML ускоряет первое содержимое и помогает поисковой индексации; hydration затем подключает Vue взаимодействие. SSR требует вычислительных ресурсов, продуманного CDN cache и корректной обработки персонализированных данных.</p>
<p>Prerender полезен для контента, известного при сборке. Часто меняющаяся цена не должна случайно оставаться статичной после build. Гибридная стратегия выбирается отдельно для каждой группы URL: публичная документация может быть статичной, каталог — кешируемым с revalidation, аккаунт — персональным SSR или клиентским. Точные route rules и их семантика зависят от adapter/deployment preset.</p>

<h5>Universal code и разделение server/client</h5>
<p>Компонент при SSR выполняется в серверной среде, а затем повторно на клиенте. Не обращайтесь к <code class="i">window</code>, <code class="i">document</code>, localStorage или WebGL при top-level module evaluation. Клиентскую работу выполняйте в client-only lifecycle/plugin либо условной ветке, понимая, что серверный HTML всё равно должен быть приемлемым.</p>
<p>Не помещайте секреты в переменные публичной runtime config или в код, который отправится в браузер. Серверные приватные ключи доступны только на серверной стороне. Cookies для SSR передаются запросом; клиентский localStorage серверу не виден. Поэтому авторизационный контекст нужно проектировать с учётом обеих сред.</p>

<h5>useFetch, useAsyncData, $fetch и запросы</h5>
<p><code class="i">$fetch</code> — удобный HTTP helper для запроса в конкретном месте. <code class="i">useFetch</code> и <code class="i">useAsyncData</code> интегрируют данные с реактивным состоянием Nuxt, SSR payload и повторным использованием результата во время hydration. Если на сервере данные уже получены, payload может передать их клиенту и избежать второго запроса. Важно учитывать ключ запроса, сериализуемость результата, ошибки, abort signal и момент реактивного обновления параметров.</p>
<p>Не считайте, что любой вызов $fetch автоматически дедуплицируется или безопасно кешируется. Персональные ответы нельзя разделять между пользователями в CDN кеше. Данные, необходимые для первого HTML, можно запросить до render; вторичные секции иногда лучше подгружать после, чтобы не блокировать навигацию целиком. Всегда моделируйте loading/error/empty/stale.</p>

<h5>Hydration: почему клиентская разметка может не совпасть</h5>
<p>Hydration связывает уже выданный HTML с клиентским Vue приложением. Если сервер и первый client render различаются — например случайный ID, текущее локальное время, недетерминированный порядок, locale из localStorage или случайное значение — появляется hydration mismatch. Исправление начинается с воспроизводимости initial state: передать данные в payload, отложить browser-only значение до mount либо использовать специальные client-only компоненты для действительно клиентского содержимого.</p>
<p>Не подавляйте mismatch предупреждение вслепую: браузер может перестроить DOM, испортить input state и затратить время. Проверяйте production HTML, консоль гидрации и поведение с отключённым JS.</p>

<h5>Server routes и Nitro</h5>
<p>Nitro — серверный слой Nuxt для handlers, plugins, storage и deployment presets. Endpoint в <code class="i">server/api/hello.get.ts</code> экспортирует handler, получает event/context, валидирует вход и возвращает данные. Он может собраться для node server, serverless, edge или статического режима в зависимости от используемого preset и ограничений platform.</p>
<p>Nuxt server API не отменяет дисциплину backend: ограничивайте body и время обработки, проверяйте auth/CSRF, валидируйте schema, используйте parameterized SQL, централизуйте ошибки, логируйте request ID. В serverless окружении локальная файловая система может быть временной, а процесс — завершаться после запроса; важное состояние хранится во внешней БД/object storage.</p>

<h5>Route middleware, server middleware и защита</h5>
<p>Route middleware управляет навигацией Vue Router и может перенаправить пользователя для UX. Он не является полноценной авторизационной границей: endpoint и данные на сервере должны повторно проверять полномочия. Server middleware работает на серверной стороне и имеет другой lifecycle/API. Не путайте их только потому, что оба называются middleware.</p>
<p>Для cookie-auth защищайте mutating endpoints от CSRF; задайте SameSite, Secure, HttpOnly по угрозам и необходимой интеграции. Не размещайте секреты в route payload, HTML, публичной runtimeConfig и sourcemaps. Учитывайте, что SSR HTML может попасть в shared cache: персональный HTML должен быть private/no-store либо ключеваться корректно.</p>

<h5>Кеширование на клиенте, Nitro и CDN</h5>
<p>Есть несколько независимых кешей: браузерный HTTP cache, Vue/Nuxt async data state, кеш Nitro storage, CDN/reverse proxy, база данных. Для каждого определите ключ, срок свежести, инвалидацию и границу пользователя/tenant. Кеширование HTML и кеширование API JSON — разные политики. Ошибка cache key способна выдать одному пользователю данные другого; приватность важнее hit ratio.</p>
<p>Stale-while-revalidate позволяет отдавать прежний ответ и обновлять его в фоне, но пользователь временно видит устаревшее состояние. ETag и conditional requests уменьшают передачу тела. Персональные cookies и Authorization влияют на shared cache semantics. Продумайте purge при обновлении каталога и защиту от cache stampede.</p>

<h5>Plugins, modules, components и server/client suffixes</h5>
<p>Plugin Nuxt подключает общую интеграцию в app context; suffix <code class="i">.client</code> или <code class="i">.server</code> ограничивает среду исполнения. Не создавайте plugin для каждого composable: глобальные зависимости усложняют порядок и тесты. Nuxt modules расширяют build/app lifecycle и могут добавить конфигурацию, компоненты и server handlers; проверяйте совместимость версий и влияние модулей на старт/build.</p>

<h5>SEO и metadata</h5>
<p>SSR/SSG позволяют выдать crawler-у заголовок, description, canonical и structured data в HTML. Заголовки должны быть уникальными и согласованы с canonical URL, pagination и locale. SEO metadata зависит от route data и не должна содержать секреты. Приватные страницы обычно закрывают от индексации, но robots meta не заменяет авторизацию.</p>

<h5>Ошибки production и наблюдаемость</h5>
<p>Собирайте серверные логи с request ID, маршрут, время SSR, статус downstream и deployment version. Клиентский error boundary не ловит все ошибки server handler. Мониторьте cold starts, memory limit, p95/p99, cache hit, JS hydration cost и Web Vitals. Source maps помогают расследованию, но публичная публикация может раскрыть исходники; используйте приватную загрузку в error tracking при необходимости.</p>

<h5>Практика: магазин с разными режимами страниц</h5>
<ol><li>Статически сгенерируйте policy/help pages, задайте обновление при новом контенте.</li><li>Для карточки товара выберите SSR или cacheable route rule, но не шарьте персональную цену/корзину.</li><li>Сделайте account страницу, где SSR получает cookie и сервер проверяет сессию.</li><li>Реализуйте server endpoint с schema validation, едиными ошибками и request ID.</li><li>Смоделируйте hydration mismatch из localStorage и исправьте через стабильный начальный render.</li><li>Разверните на Node и serverless preset; перечислите различия файловой системы, таймаутов, cold start и streaming.</li></ol>
<p><b>Вопросы:</b> что делает Nitro; чем useFetch отличается от $fetch в Nuxt-контексте; где проверять доступ к защищённому ресурсу; почему SSR HTML опасно кешировать без учёта пользователя; какие причины hydration mismatch?</p>
` }
