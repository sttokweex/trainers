import type { Question } from '@/engine/types'

/** Браузер — 14 вопрос(ов) */
export const brauzerQuestions: Question[] = [
  { id:'br-url', topic:'Браузер', type:'theory', level:'middle',
    q:'Что происходит, когда вы вводите URL и нажимаете Enter? (классический вопрос «на всю глубину»)',
    answer:`<h5>Цепочка</h5>
  <ol>
  <li><b>Разбор URL</b>, проверка HSTS-списка (возможен принудительный переход на https).</li>
  <li><b>DNS</b>: кеш браузера → кеш ОС → hosts → резолвер провайдера → рекурсивный обход (root → TLD → авторитетный NS). Результат — IP.</li>
  <li><b>TCP handshake</b> (SYN, SYN-ACK, ACK) — 1 RTT. В HTTP/3 транспорт QUIC поверх UDP, рукопожатие совмещено с TLS.</li>
  <li><b>TLS handshake</b>: обмен сертификатами, проверка цепочки доверия, согласование ключей. TLS 1.3 — 1 RTT, при возобновлении сессии 0-RTT.</li>
  <li><b>HTTP-запрос</b> → сервер (через балансировщик, возможно CDN) → ответ.</li>
  <li><b>Рендеринг</b> (см. ниже).</li>
  </ol>
  <h5>Критический путь рендеринга</h5>
  <ol>
  <li><b>HTML → DOM</b>, парсинг потоковый.</li>
  <li><b>CSS → CSSOM</b>. CSS <b>блокирует рендеринг</b>: браузер не покажет страницу, пока не построит CSSOM.</li>
  <li><b>Style</b> — сопоставление правил с узлами.</li>
  <li><b>Layout (reflow)</b> — вычисление геометрии: размеры и позиции.</li>
  <li><b>Paint</b> — растеризация в слои.</li>
  <li><b>Composite</b> — сборка слоёв на GPU.</li>
  </ol>
  <p><b>Скрипты блокируют парсинг HTML</b>, потому что могут менять DOM. Отсюда <code class="i">defer</code> (скачивается параллельно, выполняется после парсинга, порядок сохраняется — дефолт для бандлов) и <code class="i">async</code> (выполняется сразу по загрузке, порядок не гарантирован — для независимой аналитики).</p>
  <h5>Reflow vs repaint — практический вывод</h5>
  <ul>
  <li>Изменение геометрии (<code class="i">width</code>, <code class="i">top</code>, <code class="i">font-size</code>) → <b>reflow</b> + repaint + composite. Дорого.</li>
  <li>Изменение <code class="i">color</code>, <code class="i">background</code> → <b>repaint</b> + composite.</li>
  <li>Изменение <code class="i">transform</code> и <code class="i">opacity</code> → <b>только composite</b>, на GPU, без участия главного потока. <b>Поэтому анимируют именно их</b>, а не <code class="i">left</code>/<code class="i">width</code>.</li>
  </ul>
  <div class="trap">Layout thrashing: в цикле читаем <code class="i">el.offsetHeight</code> и тут же пишем стиль — браузер вынужден пересчитывать layout синхронно на каждой итерации. Лечится группировкой: сначала все чтения, потом все записи (паттерн read/write batching).</div>` },
  { id:'br-cache', topic:'Браузер', type:'theory', level:'middle',
    q:'Как работает HTTP-кеширование? Cache-Control, ETag, 304. Почему бандлы называют <code class="i">app.a3f9c1.js</code>?',
    answer:`<h5>Два режима</h5>
  <ul>
  <li><b>Freshness</b> (без запроса вообще): <code class="i">Cache-Control: max-age=31536000</code> — браузер берёт из кеша, сеть не трогает. Самый быстрый запрос — тот, которого не было.</li>
  <li><b>Validation</b> (условный запрос): истёк срок → браузер шлёт <code class="i">If-None-Match: "хеш"</code> или <code class="i">If-Modified-Since</code>. Сервер отвечает <b>304 Not Modified</b> без тела — экономится трафик, но не RTT.</li>
  </ul>
  <h5>Директивы Cache-Control</h5>
  <ul>
  <li><code class="i">max-age=N</code> — свежесть в секундах.</li>
  <li><code class="i">no-cache</code> — <b>кешировать можно, но перед использованием обязательно провалидировать</b> (частая путаница!).</li>
  <li><code class="i">no-store</code> — не сохранять вообще (для персональных данных, банковских страниц).</li>
  <li><code class="i">private</code> / <code class="i">public</code> — можно ли кешировать на CDN/прокси или только в браузере.</li>
  <li><code class="i">immutable</code> — «файл никогда не изменится, не проверяй даже при F5».</li>
  <li><code class="i">stale-while-revalidate=N</code> — отдать протухшее и обновить фоном.</li>
  </ul>
  <h5>Зачем хеш в имени файла</h5>
  <p>Это и есть <b>cache busting</b>. Стратегия «две скорости»:</p>
  <ul>
  <li><code class="i">index.html</code> — <code class="i">Cache-Control: no-cache</code>: всегда проверяем, он маленький.</li>
  <li><code class="i">app.a3f9c1.js</code>, картинки, шрифты — <code class="i">max-age=31536000, immutable</code>: имя меняется при любом изменении содержимого, поэтому «протухание» не нужно. Новый деплой = новое имя в свежем HTML.</li>
  </ul>
  <p>Именно это Vite делает автоматически при <code class="i">build</code>, раскладывая файлы с хешами в <code class="i">assets/</code>.</p>
  <h5>Что ещё спросят</h5>
  <ul>
  <li><b>ETag</b> — хеш содержимого; <code class="i">Last-Modified</code> — точность до секунды и проблемы при пересборке. ETag надёжнее.</li>
  <li><code class="i">Vary: Accept-Encoding, Accept-Language</code> — иначе CDN отдаст gzip-версию клиенту без поддержки gzip или чужую локаль.</li>
  <li>Hard reload (Ctrl+Shift+R) шлёт <code class="i">Cache-Control: no-cache</code> и игнорирует кеш; обычный F5 — валидирует.</li>
  <li>API по умолчанию не кешируют, но для справочников <code class="i">max-age</code> + ETag дают ощутимый выигрыш.</li>
  </ul>` },
  { id:'br-vitals', topic:'Браузер', type:'theory', level:'middle',
    q:'Core Web Vitals: LCP, INP, CLS — что это и как чинить? Как вообще ускорить загрузку SPA?',
    answer:`<h5>Три метрики</h5>
  <table>
  <tr><th>Метрика</th><th>Что измеряет</th><th>Хорошо</th></tr>
  <tr><td><b>LCP</b> Largest Contentful Paint</td><td>когда отрисован самый большой видимый элемент</td><td>≤ 2.5 с</td></tr>
  <tr><td><b>INP</b> Interaction to Next Paint</td><td>отзывчивость: от клика до отрисовки реакции (заменил FID в 2024)</td><td>≤ 200 мс</td></tr>
  <tr><td><b>CLS</b> Cumulative Layout Shift</td><td>насколько «прыгает» вёрстка</td><td>≤ 0.1</td></tr>
  </table>
  <h5>Как чинить</h5>
  <ul>
  <li><b>LCP</b>: <code class="i">preconnect</code> к API/CDN, <code class="i">fetchpriority="high"</code> и <code class="i">preload</code> для главной картинки, современные форматы (AVIF/WebP), SSR/предрендер, устранение блокирующего CSS/JS, сжатие (brotli).</li>
  <li><b>INP</b>: разбивать длинные задачи (&gt;50 мс) — <code class="i">scheduler.yield()</code>, <code class="i">useTransition</code>, виртуализация списков, вынос тяжёлых вычислений в Web Worker (у вас это прямо актуально: tfjs/mediapipe обязаны жить в воркере).</li>
  <li><b>CLS</b>: явные <code class="i">width</code>/<code class="i">height</code> или <code class="i">aspect-ratio</code> у картинок, резервирование места под баннеры и рекламу, <code class="i">font-display: optional/swap</code> + preload шрифта, не вставлять контент над уже видимым.</li>
  </ul>
  <h5>Ускорение SPA — по шагам</h5>
  <ol>
  <li><b>Меньше JS</b>: code splitting по роутам (<code class="i">React.lazy</code> + <code class="i">Suspense</code>), динамический импорт тяжёлых библиотек, анализ бандла (<code class="i">rollup-plugin-visualizer</code>), проверка дублей в <code class="i">pnpm why</code>.</li>
  <li><b>Правильные импорты</b>: <code class="i">import debounce from 'lodash/debounce'</code>, а не весь lodash; проверить, что библиотека вообще tree-shakeable (ESM).</li>
  <li><b>Сеть</b>: HTTP/2, brotli, кеш-заголовки, CDN для статики, prefetch следующей вероятной страницы.</li>
  <li><b>Данные</b>: кеш и дедупликация (React Query), пагинация, не тянуть лишние поля.</li>
  <li><b>Восприятие</b>: скелетоны вместо спиннеров, оптимистичные апдейты, <code class="i">content-visibility: auto</code>.</li>
  </ol>
  <div class="hint">Отдельно назовите <b>инструменты</b>: Lighthouse и вкладка Performance для лабораторных замеров, но реальные Core Web Vitals собираются с <b>живых пользователей</b> (RUM) — PostHog и Sentry/Highlight у вас это умеют. Лабораторные цифры на быстром ноутбуке врут.</div>` },
  { id:'br-dns', topic:'Браузер', type:'theory', level:'middle',
    q:'Как работает DNS? Опишите путь от домена до IP, типы записей, кеширование и TTL. Почему DNS важен для производительности?',
    code:`# что реально происходит при резолве example.com
  dig +trace example.com
  
  # цепочка:
  .                    → корневые серверы (13 логических, anycast)
  com.                 → серверы зоны TLD
  example.com.         → авторитетный NS домена
                       → A 93.184.216.34`,
    answer:`<h5>Что такое DNS</h5>
  <p>Распределённая иерархическая база, переводящая понятные имена в IP-адреса. Работает поверх UDP на порту 53 (TCP — когда ответ не влезает в пакет или при zone transfer).</p>
  <h5>Путь запроса по шагам</h5>
  <ol>
  <li><b>Кеш браузера</b> — Chrome держит свой (<code class="i">chrome://net-internals/#dns</code>).</li>
  <li><b>Кеш ОС</b> + файл <code class="i">/etc/hosts</code> (он выигрывает у всего).</li>
  <li><b>Рекурсивный резолвер</b> — провайдера, или публичный (8.8.8.8, 1.1.1.1). Если у него в кеше есть ответ — всё заканчивается здесь, за единицы миллисекунд.</li>
  <li>Резолвер идёт <b>итеративно</b>: спрашивает <b>корневой</b> сервер → тот отвечает «иди к серверам <code class="i">.com</code>» → <b>TLD-сервер</b> отвечает «иди к <code class="i">ns1.example.com</code>» → <b>авторитетный</b> сервер отдаёт запись.</li>
  </ol>
  <p>Ключевое различие, которое любят спрашивать: <b>клиент делает рекурсивный запрос</b> (один вопрос — один готовый ответ), а <b>резолвер выполняет итеративные</b> запросы по цепочке. Работу делает резолвер, не ваш браузер.</p>
  <h5>Типы записей</h5>
  <table>
  <tr><th>Запись</th><th>Смысл</th></tr>
  <tr><td><b>A</b> / <b>AAAA</b></td><td>IPv4 / IPv6 адрес</td></tr>
  <tr><td><b>CNAME</b></td><td>алиас на другое имя. Нельзя на «голом» домене (apex) — отсюда ALIAS/ANAME у провайдеров</td></tr>
  <tr><td><b>MX</b></td><td>почтовые серверы</td></tr>
  <tr><td><b>TXT</b></td><td>произвольный текст: SPF, DKIM, подтверждение владения доменом</td></tr>
  <tr><td><b>NS</b></td><td>авторитетные серверы зоны</td></tr>
  <tr><td><b>SOA</b></td><td>параметры зоны</td></tr>
  <tr><td><b>CAA</b></td><td>кто может выпускать TLS-сертификаты для домена</td></tr>
  </table>
  <h5>TTL — почему смена IP «доходит» не сразу</h5>
  <p>Каждая запись имеет время жизни в кеше. Пока TTL не истёк, резолверы по всему миру отдают <b>старый</b> ответ, и повлиять на это вы не можете. Практическое правило: <b>за сутки до переезда снизьте TTL до 60–300 секунд</b>, переключите, убедитесь, что всё работает, затем верните обратно. Иначе часть пользователей будет ходить на старый сервер часами.</p>
  <h5>Почему это важно для скорости</h5>
  <ul>
  <li>Холодный резолв — это 20–120 мс <b>до того</b>, как уйдёт первый байт запроса. Если страница тянет ресурсы с пяти разных доменов, вы платите эту цену пять раз.</li>
  <li><code class="i">&lt;link rel="dns-prefetch" href="//api.example.com"&gt;</code> — заранее резолвить.</li>
  <li><code class="i">&lt;link rel="preconnect"&gt;</code> — сильнее: DNS + TCP + TLS заранее. Ставьте на домен API и CDN, но не больше 2–4 штук: каждое соединение стоит ресурсов.</li>
  <li><b>CDN работает через DNS</b>: авторитетный сервер отдаёт <b>разный IP в зависимости от географии</b> клиента, направляя его на ближайшую точку присутствия. Это же механизм балансировки и failover.</li>
  </ul>
  <div class="hint">Отладка: <code class="i">dig example.com +short</code>, <code class="i">dig +trace</code> (вся цепочка), <code class="i">nslookup</code>, <code class="i">host</code>. Если «у меня работает, а у коллеги нет» — почти всегда разный кеш DNS или разные резолверы. Плюс современное: <b>DoH/DoT</b> (DNS over HTTPS/TLS) шифруют запросы, поэтому провайдер больше не видит, какие домены вы запрашиваете — и корпоративные блокировки по DNS перестают работать.</div>` },
  { id:'br-tls', topic:'Браузер', type:'theory', level:'middle',
    q:'Как устроен HTTPS? Опишите TLS-рукопожатие, цепочку доверия сертификатов, HSTS и mixed content.',
    answer:`<h5>Что даёт TLS — три вещи</h5>
  <ul>
  <li><b>Конфиденциальность</b> — трафик зашифрован, провайдер и Wi-Fi в кафе не видят содержимое.</li>
  <li><b>Целостность</b> — данные нельзя незаметно подменить по пути.</li>
  <li><b>Аутентичность</b> — вы говорите именно с тем сервером, чьё имя в адресной строке.</li>
  </ul>
  <h5>Рукопожатие (TLS 1.3)</h5>
  <ol>
  <li><b>ClientHello</b>: поддерживаемые шифры, версии, SNI (имя хоста — нужно, чтобы один IP обслуживал много доменов), и сразу — свой материал для обмена ключами.</li>
  <li><b>ServerHello</b>: выбранный шифр, сертификат, свой ключевой материал.</li>
  <li>Обе стороны независимо вычисляют общий сеансовый ключ (Diffie-Hellman) — <b>сам ключ по сети не передаётся</b>.</li>
  <li>Дальше — симметричное шифрование (AES/ChaCha20), оно быстрое.</li>
  </ol>
  <p>TLS 1.3 укладывается в <b>1 RTT</b> (было 2 в TLS 1.2), а при возобновлении сессии — <b>0-RTT</b>, когда данные летят прямо с первым пакетом. Оборотная сторона 0-RTT — уязвимость к replay-атаке, поэтому для неидемпотентных запросов его не используют.</p>
  <h5>Цепочка доверия</h5>
  <p>Сертификат сервера подписан промежуточным УЦ, тот — корневым, а корневые лежат <b>в хранилище ОС и браузера</b>. Браузер проверяет: подпись по цепочке, срок действия, совпадение имени домена (SAN), не отозван ли (OCSP stapling), соответствие CAA-записи.</p>
  <p>Ошибка «сертификат не доверен» обычно означает одно из трёх: истёк срок, сервер не отдал <b>промежуточный</b> сертификат (у вас работает, потому что он закеширован, а у чистого клиента — нет), или имя домена не совпадает.</p>
  <h5>Что ещё спросят</h5>
  <ul>
  <li><b>HSTS</b> (<code class="i">Strict-Transport-Security</code>) — заставляет браузер ходить только по HTTPS, даже если пользователь набрал http. Убирает окно для атаки на первом редиректе. Есть preload-список, вшитый в браузеры, — но выйти из него потом сложно.</li>
  <li><b>Mixed content</b> — HTTPS-страница тянет ресурс по HTTP. Активный контент (скрипты, стили, iframe) браузер <b>блокирует</b>, пассивный (картинки) помечает как небезопасный. Лечится протокол-относительными URL или, лучше, явным https.</li>
  <li><b>Let's Encrypt</b> — бесплатные сертификаты на 90 дней с автопродлением (certbot, встроено в Caddy и Traefik). Сегодня «дорогой сертификат» почти никогда не нужен.</li>
  <li><b>TLS-терминация</b> обычно происходит на балансировщике/nginx, а не в Node — так проще управлять сертификатами и дешевле по CPU.</li>
  </ul>
  <div class="trap">Частый вопрос с подвохом: «шифрует ли HTTPS URL?». Путь и query-параметры — <b>да</b> (они внутри зашифрованного тела запроса). А вот <b>доменное имя видно</b>: в DNS-запросе и в поле SNI открытым текстом. Плюс размер и тайминги трафика утекают. Поэтому токен в query-параметре — всё равно плохая идея: он попадёт в логи сервера, в Referer и в историю браузера.</div>` },
  { id:'br-http-conn', topic:'Браузер', type:'theory', level:'middle',
    q:'Что происходит с сетевым соединением при загрузке страницы? Разберите waterfall в DevTools: TTFB, очередь, keep-alive, приоритеты.',
    answer:`<h5>Фазы одного запроса в DevTools → Timing</h5>
  <table>
  <tr><th>Фаза</th><th>Что это</th><th>Если она большая</th></tr>
  <tr><td><b>Queueing / Stalled</b></td><td>ждём свободное соединение или приоритет</td><td>много параллельных запросов, лимит 6 на домен в HTTP/1.1</td></tr>
  <tr><td><b>DNS Lookup</b></td><td>резолв имени</td><td>холодный кеш → preconnect</td></tr>
  <tr><td><b>Initial connection / SSL</b></td><td>TCP + TLS</td><td>нет keep-alive, далёкий сервер</td></tr>
  <tr><td><b>TTFB</b></td><td>от отправки до первого байта ответа</td><td><b>тормозит бэкенд</b>: медленный SQL, N+1, холодный старт</td></tr>
  <tr><td><b>Content Download</b></td><td>скачивание тела</td><td>большой ответ, нет сжатия, узкий канал</td></tr>
  </table>
  <p>Это первое, что нужно смотреть при жалобе «сайт тормозит»: большой <b>TTFB</b> — проблема на сервере, большой <b>Content Download</b> — проблема с размером и сжатием, большой <b>Stalled</b> — проблема с конкуренцией запросов.</p>
  <h5>Переиспользование соединений</h5>
  <p>Устанавливать TCP+TLS на каждый запрос дорого (2–3 RTT). <code class="i">Connection: keep-alive</code> — дефолт с HTTP/1.1: соединение остаётся открытым и переиспользуется. В HTTP/2 идёт дальше: <b>одно соединение на домен</b> с мультиплексированием множества потоков.</p>
  <p><b>Лимит 6 параллельных соединений на домен</b> в HTTP/1.1 — причина, по которой раньше применяли «шардинг доменов» (static1.site.com, static2...). В HTTP/2 это <b>антипаттерн</b>: лишние домены = лишние DNS+TLS и потеря общего сжатия заголовков.</p>
  <h5>Приоритеты и блокировка</h5>
  <ul>
  <li>Браузер сам расставляет приоритеты: HTML и CSS — высокий, шрифты — высокий, картинки ниже экрана — низкий.</li>
  <li><b>CSS блокирует рендеринг</b>, синхронный <code class="i">&lt;script&gt;</code> блокирует <b>парсинг</b> HTML. Отсюда <code class="i">defer</code> для бандлов и <code class="i">async</code> для независимой аналитики.</li>
  <li><b>Preload scanner</b>: пока основной парсер заблокирован скриптом, браузер отдельным проходом ищет впереди ссылки на ресурсы и начинает их качать. Поэтому ресурсы, вставляемые через JS, загружаются позже — их preload scanner не видит.</li>
  </ul>
  <h5>Подсказки браузеру</h5>
  <pre class="code">&lt;link rel="preconnect" href="https://api.example.com"&gt;     DNS+TCP+TLS заранее
  &lt;link rel="preload" as="font" href="/f.woff2" crossorigin&gt; нужно прямо сейчас
  &lt;link rel="prefetch" href="/next-page.js"&gt;                 вероятно понадобится потом
  &lt;link rel="modulepreload" href="/chunk.js"&gt;                для ES-модулей
  &lt;img loading="lazy" decoding="async" fetchpriority="low"&gt;</pre>
  <div class="hint">Практический совет для собеса: «первым делом открыл бы Network, отсортировал по времени и посмотрел, где именно уходит время — TTFB или загрузка. Это сразу говорит, чинить бэкенд или фронт». Такой ответ ценится выше, чем список оптимизаций наизусть.</div>` },
  { id:'br-storage', topic:'Браузер', type:'theory', level:'middle',
    q:'Какие есть хранилища в браузере? Сравните cookie, localStorage, sessionStorage, IndexedDB и Cache API — лимиты, синхронность, когда что.',
    answer:`<h5>Сравнение</h5>
  <table>
  <tr><th></th><th>Объём</th><th>Уходит на сервер</th><th>Доступ из JS</th><th>Живёт</th></tr>
  <tr><td><b>Cookie</b></td><td>~4 КБ на куку</td><td><b>да, с каждым запросом</b></td><td>нет, если HttpOnly</td><td>до Expires/Max-Age</td></tr>
  <tr><td><b>localStorage</b></td><td>~5–10 МБ</td><td>нет</td><td>да, <b>синхронно</b></td><td>пока не удалят</td></tr>
  <tr><td><b>sessionStorage</b></td><td>~5–10 МБ</td><td>нет</td><td>да, синхронно</td><td>до закрытия вкладки</td></tr>
  <tr><td><b>IndexedDB</b></td><td>сотни МБ и больше</td><td>нет</td><td>да, <b>асинхронно</b></td><td>пока не удалят</td></tr>
  <tr><td><b>Cache API</b></td><td>та же квота</td><td>нет</td><td>да, асинхронно</td><td>пока не удалят</td></tr>
  </table>
  <h5>Ключевые различия, которые проверяют</h5>
  <ul>
  <li><b>localStorage синхронный</b> — он блокирует главный поток. Запись килобайта незаметна, но сериализация большого объекта в <code class="i">JSON.stringify</code> при каждом изменении стора вполне способна дать заметный лаг. Для объёмов — IndexedDB.</li>
  <li><b>Хранит только строки.</b> Отсюда вечный <code class="i">JSON.parse(localStorage.getItem(...))</code> — и обязательный <code class="i">try/catch</code>: в приватном режиме или при запрещённых site data обращение может <b>бросить исключение</b>, а не просто вернуть null.</li>
  <li><b>sessionStorage — на вкладку.</b> Две вкладки одного сайта не видят данные друг друга. localStorage общий для всех вкладок одного origin, и синхронизировать их можно через событие <code class="i">storage</code> (оно приходит в <i>другие</i> вкладки, не в текущую).</li>
  <li><b>Привязка к origin</b>: схема + домен + порт. <code class="i">http://</code> и <code class="i">https://</code> — разные хранилища.</li>
  <li><b>Cookie летит с каждым запросом</b> на домен — поэтому туда кладут только идентификаторы, а не данные. Килобайт кук на каждый запрос к API — это заметный оверхед.</li>
  </ul>
  <h5>Что где хранить</h5>
  <ul>
  <li><b>Токен сессии / refresh</b> → <code class="i">HttpOnly; Secure; SameSite</code> cookie. Не localStorage: его читает любой скрипт при XSS.</li>
  <li><b>Настройки UI</b> (тема, свёрнутые панели, язык) → localStorage.</li>
  <li><b>Состояние конкретной вкладки</b> (шаг визарда, черновик) → sessionStorage.</li>
  <li><b>Офлайн-данные, большие наборы, файлы</b> → IndexedDB (удобнее через <code class="i">idb</code> или Dexie — нативный API многословный).</li>
  <li><b>Ответы сети для офлайна</b> → Cache API в service worker.</li>
  </ul>
  <div class="trap">Важно: <b>это не безопасное хранилище</b>. Всё, что лежит в браузере, пользователь может прочитать и изменить. Никаких секретов, никаких «isAdmin: true» в localStorage — права всегда проверяются на сервере. И помните про квоты: браузер может <b>вытеснить</b> данные при нехватке места (кроме случая, когда вы запросили <code class="i">navigator.storage.persist()</code>).</div>` },
  { id:'br-cookie', topic:'Браузер', type:'theory', level:'middle',
    q:'Как работают cookie? Разберите атрибуты, SameSite, сторонние куки и их отмену. Как устроена сессия на куках?',
    code:`Set-Cookie: sid=abc123; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=1209600
  Set-Cookie: theme=dark; SameSite=Lax; Path=/; Max-Age=31536000`,
    answer:`<h5>Атрибуты</h5>
  <ul>
  <li><b>HttpOnly</b> — недоступна из JS. Главная защита токена от кражи при XSS.</li>
  <li><b>Secure</b> — отправляется только по HTTPS.</li>
  <li><b>SameSite</b> — отправлять ли при переходах с других сайтов:
  <ul>
  <li><code class="i">Strict</code> — никогда при кросс-сайтовых переходах (даже по обычной ссылке — пользователь придёт «разлогиненным»).</li>
  <li><code class="i">Lax</code> — <b>дефолт</b> в современных браузерах: отправляется при навигации верхнего уровня методом GET, но не при POST и не в подзапросах. Хороший баланс, закрывает большинство CSRF.</li>
  <li><code class="i">None</code> — отправляется всегда, но <b>обязателен Secure</b>. Нужен для встраивания и кросс-доменных сценариев.</li>
  </ul></li>
  <li><b>Domain</b> — по умолчанию только текущий хост; указание <code class="i">Domain=example.com</code> распространяет куку на все поддомены.</li>
  <li><b>Path</b> — ограничение по пути. Полезно: refresh-токен с <code class="i">Path=/auth/refresh</code> не летит в каждый запрос к API.</li>
  <li><b>Max-Age / Expires</b> — без них кука сессионная и умирает с браузером.</li>
  <li>Префиксы <code class="i">__Host-</code> и <code class="i">__Secure-</code> — браузер сам следит за соблюдением условий (Secure, Path=/, без Domain).</li>
  </ul>
  <h5>Сессия на куках vs JWT</h5>
  <p>Сервер кладёт в куку только <b>идентификатор сессии</b>, сами данные лежат в Redis. Плюсы: мгновенный отзыв (удалили ключ — пользователь разлогинен), маленькая кука, данные не утекают. Минус — нужно общее хранилище при нескольких инстансах (что решается тем же Redis). Это часто более здравый выбор, чем JWT, и умение это сказать отличает вас от тех, кто ставит JWT по привычке.</p>
  <h5>Кросс-доменная авторизация — практика</h5>
  <p>Если фронт на <code class="i">app.site.ru</code>, а API на <code class="i">api.site.ru</code>, нужно: <code class="i">SameSite=None; Secure</code> (или <code class="i">Domain=.site.ru</code>, если это поддомены одного сайта), на клиенте <code class="i">credentials: 'include'</code>, на сервере <b>конкретный</b> <code class="i">Access-Control-Allow-Origin</code> (не <code class="i">*</code>) и <code class="i">Access-Control-Allow-Credentials: true</code>. Это очень частый источник «в Postman работает, в браузере нет».</p>
  <h5>Отмена сторонних кук</h5>
  <p>Куки третьих сторон (реклама, трекеры) блокируются Safari (ITP) и Firefox давно, Chrome идёт тем же путём. Последствия для разработчика: перестают работать сценарии с iframe на чужом домене, SSO через сторонние куки, аналитика через third-party. Замены: собственный домен для аналитики (first-party), Storage Access API, серверная агрегация событий. Для Telegram Mini Apps это особенно актуально — приложение живёт во встроенном WebView с ограничениями по хранилищу, поэтому авторизацию там строят на initData, а не на куках.</p>` },
  { id:'br-sw', topic:'Браузер', type:'theory', level:'senior',
    q:'Что такое Service Worker? Жизненный цикл, стратегии кеширования, типичные грабли. Что делает сайт PWA?',
    code:`// регистрация
  navigator.serviceWorker.register('/sw.js')
  
  // внутри sw.js — перехват всех запросов страницы
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((cached) => cached ?? fetch(event.request))
    )
  })`,
    answer:`<h5>Что это</h5>
  <p>Скрипт, работающий <b>в отдельном потоке, вне страницы</b>, и выступающий сетевым прокси между приложением и сервером. Он живёт даже после закрытия вкладки, поэтому умеет фоновую синхронизацию и push-уведомления. Требует HTTPS (кроме localhost) — иначе это идеальный инструмент для атаки.</p>
  <h5>Жизненный цикл</h5>
  <ol>
  <li><b>install</b> — обычно здесь кешируют оболочку приложения (app shell).</li>
  <li><b>waiting</b> — новый SW ждёт, пока закроются все вкладки со старым. Это самая частая причина «я задеплоил, а у пользователей старая версия». Обход — <code class="i">self.skipWaiting()</code> + <code class="i">clients.claim()</code>, но тогда нужно аккуратно обработать смену версии в открытой вкладке.</li>
  <li><b>activate</b> — здесь удаляют устаревшие кеши по версии.</li>
  <li><b>fetch</b> — перехват запросов.</li>
  </ol>
  <h5>Стратегии кеширования</h5>
  <table>
  <tr><th>Стратегия</th><th>Логика</th><th>Для чего</th></tr>
  <tr><td>Cache first</td><td>кеш, сеть только при промахе</td><td>шрифты, версионированная статика</td></tr>
  <tr><td>Network first</td><td>сеть, кеш как запасной вариант</td><td>API, где важна свежесть</td></tr>
  <tr><td>Stale-while-revalidate</td><td>отдать кеш, обновить фоном</td><td>аватары, редко меняющиеся данные</td></tr>
  <tr><td>Network only</td><td>всегда сеть</td><td>платежи, аналитика</td></tr>
  </table>
  <h5>Грабли</h5>
  <ul>
  <li><b>Закешировать <code class="i">index.html</code> стратегией cache-first</b> — и пользователи навсегда останутся на старой версии. Для HTML только network-first или stale-while-revalidate.</li>
  <li><b>Сам <code class="i">sw.js</code></b> должен отдаваться с <code class="i">Cache-Control: no-cache</code>, иначе обновление SW не доедет.</li>
  <li>Нужен <b>план отката</b>: механизм «сбросить SW и кеши» на случай, если выкатили сломанный воркер. Иначе чинить придётся у каждого пользователя.</li>
  <li>Отладка: <code class="i">Application → Service Workers</code>, флажки <code class="i">Update on reload</code> и <code class="i">Bypass for network</code>.</li>
  <li>В проде почти всегда берут <b>Workbox</b>, а не пишут руками — слишком много краевых случаев.</li>
  </ul>
  <h5>PWA — из чего состоит</h5>
  <p>Манифест (<code class="i">manifest.json</code>: имя, иконки, <code class="i">display: standalone</code>, цвета), Service Worker с офлайн-режимом, HTTPS. Даёт: установку на домашний экран, запуск без адресной строки, офлайн, push-уведомления (в iOS — с ограничениями). Хорошая альтернатива нативному приложению, когда не нужен глубокий доступ к системе.</p>` },
  { id:'br-worker', topic:'Браузер', type:'theory', level:'middle',
    q:'Что такое Web Worker и когда он нужен? Чем отличается от Service Worker? Как передавать данные без копирования?',
    code:`// main.js
  const worker = new Worker(new URL('./heavy.worker.js', import.meta.url), { type: 'module' })
  worker.postMessage({ type: 'process', payload: bigArray })
  worker.onmessage = (e) => setResult(e.data)
  
  // heavy.worker.js
  self.onmessage = (e) => {
    const result = veryHeavyComputation(e.data.payload)   // не блокирует UI
    self.postMessage(result)
  }`,
    answer:`<h5>Зачем</h5>
  <p>JS в браузере однопоточный: любое длительное вычисление <b>замораживает интерфейс</b> — не работают клики, скролл, анимации. Worker выполняет код в отдельном потоке, главный поток остаётся отзывчивым.</p>
  <p>Когда применять: парсинг больших JSON/CSV, обработка изображений, криптография, сжатие, <b>ML-инференс</b> — у вас в service-core это прямо актуально, потому что TensorFlow.js и MediaPipe обязаны жить в воркере, иначе каждый кадр распознавания будет ронять FPS интерфейса.</p>
  <h5>Ограничения воркера</h5>
  <ul>
  <li><b>Нет доступа к DOM</b>, <code class="i">window</code>, <code class="i">document</code>, <code class="i">localStorage</code>.</li>
  <li>Есть: <code class="i">fetch</code>, <code class="i">WebSocket</code>, IndexedDB, <code class="i">postMessage</code>, таймеры, WASM, <code class="i">OffscreenCanvas</code>.</li>
  <li>Общение только сообщениями — общей памяти по умолчанию нет.</li>
  </ul>
  <h5>Передача данных: копирование vs передача владения</h5>
  <p><code class="i">postMessage</code> по умолчанию делает <b>структурное клонирование</b> — то есть копию. Для мегабайтных массивов копирование само по себе становится узким местом.</p>
  <pre class="code">// передача владения: буфер «переезжает», копирования нет (околонулевая цена)
  worker.postMessage(buffer, [buffer])
  // после этого buffer в главном потоке становится пустым — им владеет воркер
  
  // либо общая память для настоящей параллельной работы
  const shared = new SharedArrayBuffer(1024)   // требует COOP/COEP-заголовков</pre>
  <h5>Web Worker vs Service Worker</h5>
  <table>
  <tr><th></th><th>Web Worker</th><th>Service Worker</th></tr>
  <tr><td>Задача</td><td>вычисления вне главного потока</td><td>сетевой прокси, кеш, офлайн</td></tr>
  <tr><td>Жизнь</td><td>пока жива страница</td><td>переживает закрытие вкладки</td></tr>
  <tr><td>Экземпляров</td><td>сколько создадите</td><td>один на scope</td></tr>
  <tr><td>Перехват запросов</td><td>нет</td><td>да</td></tr>
  </table>
  <p>Есть ещё <b>SharedWorker</b> — один воркер на несколько вкладок одного origin (удобно для общего WebSocket-соединения, но поддержка неравномерная) и <b>Worklets</b> — узкоспециализированные (аудио, paint).</p>
  <div class="hint">Практическая оговорка: создание воркера стоит ~10–40 мс и памяти, поэтому на мелких задачах он проигрывает. Для задач в диапазоне «долго, но не катастрофа» часто достаточно разбить работу на куски и отдавать управление браузеру между ними — <code class="i">scheduler.yield()</code>, <code class="i">setTimeout(0)</code> или <code class="i">startTransition</code> в React.</div>` },
  { id:'br-engine', topic:'Браузер', type:'theory', level:'senior',
    q:'Как устроен браузер изнутри? Процессы и потоки, движок рендеринга, V8, песочница. Почему одна зависшая вкладка не роняет остальные?',
    answer:`<h5>Многопроцессная архитектура (Chrome)</h5>
  <ul>
  <li><b>Browser process</b> — главный: UI, адресная строка, работа с сетью и диском, управление остальными процессами.</li>
  <li><b>Renderer process</b> — <b>по процессу на сайт</b> (Site Isolation): парсинг, стили, layout, JS. Запущен в <b>песочнице</b> — без прямого доступа к файловой системе и сети.</li>
  <li><b>GPU process</b> — растеризация и композитинг.</li>
  <li><b>Network / Storage / Utility</b> — отдельные сервисы.</li>
  <li><b>Plugin / Extension</b> — процессы расширений.</li>
  </ul>
  <p>Отсюда ответ на вопрос: зависший JS блокирует <b>только свой renderer-процесс</b>, остальные вкладки живут. А <b>Site Isolation</b> — это ещё и защита от Spectre: данные чужого сайта физически не лежат в адресном пространстве вашего процесса.</p>
  <h5>Потоки внутри renderer-процесса</h5>
  <ul>
  <li><b>Main thread</b> — парсинг HTML/CSS, выполнение JS, style, layout, paint. Здесь всё и тормозит.</li>
  <li><b>Compositor thread</b> — собирает слои и обрабатывает скролл. <b>Поэтому страница со «зависшим» JS всё равно скроллится</b> — пока скролл не требует главного потока.</li>
  <li><b>Raster threads</b> — растеризация тайлов.</li>
  <li><b>Worker threads</b> — ваши Web Workers.</li>
  </ul>
  <p>Практический вывод: анимация <code class="i">transform</code>/<code class="i">opacity</code> живёт на compositor-потоке и продолжает работать плавно даже при загруженном JS. Анимация <code class="i">width</code>/<code class="i">top</code> требует layout на главном потоке — и умирает вместе с ним.</p>
  <h5>V8: как выполняется JS</h5>
  <ol>
  <li><b>Парсер</b> → AST (с ленивым разбором функций, которые пока не вызваны).</li>
  <li><b>Ignition</b> — интерпретатор, сразу генерирует байткод и начинает исполнять.</li>
  <li><b>TurboFan</b> — оптимизирующий JIT: «горячие» функции компилируются в машинный код на основе собранных типов.</li>
  <li><b>Деоптимизация</b> — если предположение о типах нарушилось (в функцию, всегда получавшую числа, пришла строка), код откатывается к байткоду.</li>
  </ol>
  <p>Отсюда практическое следствие, о котором любят спрашивать: <b>мономорфный код быстрее</b>. Объекты со стабильной формой (одинаковый набор полей в одном и том же порядке) позволяют V8 использовать hidden classes и inline caches. Добавление свойств на лету и массивы с разнотипными элементами ломают оптимизацию.</p>
  <h5>Сборка мусора</h5>
  <p>Поколенческий GC: молодые объекты в new space чистятся часто и быстро (Scavenger, копирующий), выжившие переезжают в old space, который чистится реже (mark-compact, с инкрементальными и параллельными фазами, чтобы не делать длинных пауз).</p>
  <div class="hint">Что смотреть в DevTools: <b>Performance</b> — длинные задачи на main thread (всё, что дольше 50 мс, помечается как Long Task и бьёт по INP); <b>Layers</b> — сколько создано композитных слоёв (каждый ест видеопамять); <b>Memory</b> — heap snapshot для поиска утечек.</div>` },
  { id:'br-dom-perf', topic:'Браузер', type:'theory', level:'middle',
    q:'Как работать с DOM эффективно? Что такое layout thrashing и какие есть Observer API?',
    code:`// ❌ layout thrashing: чтение и запись вперемешку → пересчёт на каждой итерации
  items.forEach((el) => {
    el.style.height = el.offsetHeight * 2 + 'px'   // читаем, потом пишем, потом снова читаем
  })
  
  // ✅ сначала все чтения, потом все записи — один пересчёт
  const heights = items.map((el) => el.offsetHeight)      // read
  items.forEach((el, i) => { el.style.height = heights[i] * 2 + 'px' })  // write`,
    answer:`<h5>Layout thrashing (forced synchronous layout)</h5>
  <p>Браузер старается откладывать пересчёт геометрии и делать его пачкой. Но если вы <b>читаете</b> свойство, зависящее от layout, он обязан пересчитать всё <b>немедленно</b>, чтобы вернуть актуальное значение. Чтение-запись в цикле превращает O(1) пересчёт в O(n).</p>
  <p>Свойства, вызывающие принудительный layout: <code class="i">offsetTop/Left/Width/Height</code>, <code class="i">clientWidth/Height</code>, <code class="i">scrollTop/Height</code>, <code class="i">getBoundingClientRect()</code>, <code class="i">getComputedStyle()</code>, <code class="i">focus()</code>.</p>
  <p>Лечение: группировать чтения и записи (паттерн read → write), кешировать измерения, использовать <code class="i">requestAnimationFrame</code> для записи. В DevTools такие места видны в Performance как <b>розовые «Recalculate Style / Layout»</b> с предупреждением.</p>
  <h5>Другие приёмы</h5>
  <ul>
  <li><b>DocumentFragment</b> или сборка строки — чтобы вставить 1000 узлов за одну операцию, а не за 1000.</li>
  <li><b>Делегирование событий</b> вместо слушателя на каждом элементе.</li>
  <li><code class="i">content-visibility: auto</code> — браузер пропускает рендеринг того, что вне экрана.</li>
  <li>Менять класс, а не набор inline-стилей — один пересчёт вместо нескольких.</li>
  <li><b>Виртуализация</b> длинных списков — единственное настоящее решение для тысяч элементов.</li>
  </ul>
  <h5>Observer API — вместо опроса в цикле</h5>
  <table>
  <tr><th>API</th><th>Следит за</th><th>Типичное применение</th></tr>
  <tr><td><b>IntersectionObserver</b></td><td>пересечение элемента с вьюпортом</td><td>ленивая загрузка, бесконечный скролл, аналитика показов, анимация при появлении</td></tr>
  <tr><td><b>ResizeObserver</b></td><td>изменение размера элемента</td><td>адаптивные компоненты, перерисовка графиков</td></tr>
  <tr><td><b>MutationObserver</b></td><td>изменения в DOM</td><td>интеграция со сторонними виджетами, которые правят DOM мимо вас</td></tr>
  <tr><td><b>PerformanceObserver</b></td><td>метрики производительности</td><td>сбор LCP, INP, CLS с реальных пользователей</td></tr>
  </table>
  <pre class="code">const io = new IntersectionObserver(
    (entries) =&gt; entries.forEach(e =&gt; { if (e.isIntersecting) load(e.target) }),
    { rootMargin: '200px' },      // начать грузить за 200px ДО появления
  )
  io.observe(el)
  // не забыть io.disconnect() в cleanup useEffect</pre>
  <p>Главное преимущество: браузер вычисляет пересечения сам, вне главного потока, и не заставляет вас дёргать <code class="i">getBoundingClientRect()</code> в обработчике скролла — что как раз и есть классический layout thrashing.</p>
  <div class="trap">В React прямая работа с DOM — исключение, а не правило. Но если она нужна (измерения, интеграция с не-React библиотекой), делайте это в <code class="i">useLayoutEffect</code> через <code class="i">ref</code> и обязательно отписывайтесь в cleanup: неотключённый Observer держит ссылку на узел и течёт.</div>` },
  { id:'br-csp', topic:'Браузер', type:'theory', level:'senior',
    q:'Что такое CSP и какие ещё есть security-заголовки? Как CSP защищает от XSS и почему его сложно внедрить?',
    code:`Content-Security-Policy:
    default-src 'self';
    script-src 'self' 'nonce-r4nd0m' https://cdn.example.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' https://api.example.com wss://ws.example.com;
    frame-ancestors 'none';
    base-uri 'self';
    report-uri /csp-report`,
    answer:`<h5>Идея CSP</h5>
  <p>Белый список источников, откуда странице разрешено грузить и выполнять ресурсы. Это <b>второй рубеж обороны</b>: даже если XSS уже произошёл и злоумышленник внедрил <code class="i">&lt;script&gt;</code>, браузер откажется его выполнять, потому что источник не разрешён.</p>
  <h5>Основные директивы</h5>
  <ul>
  <li><code class="i">default-src</code> — значение по умолчанию для остальных.</li>
  <li><code class="i">script-src</code> — самая важная. <code class="i">'self'</code>, конкретные домены, <code class="i">'nonce-...'</code> или <code class="i">'sha256-...'</code>.</li>
  <li><code class="i">connect-src</code> — куда можно слать fetch/XHR/WebSocket. Ограничивает утечку данных.</li>
  <li><code class="i">frame-ancestors 'none'</code> — запрет встраивания в iframe. Современная замена <code class="i">X-Frame-Options</code>, защита от clickjacking.</li>
  <li><code class="i">base-uri</code> — запрет подмены <code class="i">&lt;base&gt;</code>, иначе относительные пути можно перенаправить на чужой домен.</li>
  </ul>
  <h5>Почему это трудно внедрить</h5>
  <p><code class="i">'unsafe-inline'</code> обесценивает всю защиту, но без него ломаются инлайновые скрипты, стили и сторонняя аналитика. Правильный путь — <b>nonce</b>: сервер генерирует случайное значение на каждый ответ и проставляет его и в заголовок, и в атрибут разрешённых тегов. Для SPA на Vite это требует серверного рендеринга заголовка, что в чисто статическом деплое непросто.</p>
  <p>Практическая стратегия внедрения: сначала <code class="i">Content-Security-Policy-Report-Only</code> с <code class="i">report-uri</code> — политика не блокирует, но присылает отчёты о нарушениях. Собираете статистику неделю, чините находки, затем включаете в боевом режиме.</p>
  <h5>Остальные заголовки, которые надо знать</h5>
  <table>
  <tr><th>Заголовок</th><th>От чего защищает</th></tr>
  <tr><td><code class="i">Strict-Transport-Security</code></td><td>понижение до HTTP, перехват на первом переходе</td></tr>
  <tr><td><code class="i">X-Content-Type-Options: nosniff</code></td><td>угадывание типа: загруженный «текст» не исполнится как скрипт</td></tr>
  <tr><td><code class="i">Referrer-Policy: strict-origin-when-cross-origin</code></td><td>утечка пути и query в Referer на чужие сайты</td></tr>
  <tr><td><code class="i">Permissions-Policy</code></td><td>доступ к камере, микрофону, геолокации (в том числе у встроенных iframe)</td></tr>
  <tr><td><code class="i">Cross-Origin-Opener-Policy</code> / <code class="i">-Embedder-Policy</code></td><td>изоляция процесса; нужны для <code class="i">SharedArrayBuffer</code></td></tr>
  </table>
  <div class="hint">В Nest это ставится одной строкой через <code class="i">helmet</code>, но дефолтная политика почти наверняка сломает ваш фронт — настраивать придётся руками. Проверить результат: <code class="i">securityheaders.com</code> или вкладка Network → Headers. Упомянуть, что CSP не заменяет экранирование вывода, а дополняет его — обязательно.</div>` },
  { id:'br-debug', topic:'Браузер', type:'theory', level:'middle',
    q:'Как вы отлаживаете проблемы в браузере? Разберите инструменты DevTools под конкретные задачи: тормозит, течёт память, не работает запрос.',
    answer:`<h5>«Страница долго грузится»</h5>
  <ol>
  <li><b>Network</b>, галочка Disable cache, throttling «Fast 3G» для честности.</li>
  <li>Смотрим на самый долгий запрос и его Timing: большой <b>TTFB</b> → чинить бэкенд; большой <b>Content Download</b> → размер и сжатие; много <b>Stalled</b> → слишком много параллельных запросов.</li>
  <li>Сортируем по размеру: что весит больше всего? Часто это несжатые картинки или бандл с случайно попавшей библиотекой.</li>
  <li><b>Coverage</b> (в Command Menu) — сколько процентов загруженного CSS/JS реально используется. Обычно шокирует.</li>
  <li><b>Lighthouse</b> — общий отчёт с приоритетами.</li>
  </ol>
  <h5>«Интерфейс тормозит и дёргается»</h5>
  <ol>
  <li><b>Performance</b> → запись взаимодействия. Ищем <b>Long Tasks</b> (жёлтые блоки длиннее 50 мс) на главном потоке.</li>
  <li>Раскрываем: что внутри — ваш JS, Recalculate Style, Layout? Розовые блоки Layout сразу после чтения геометрии = layout thrashing.</li>
  <li><b>Rendering</b> → Paint flashing (что перерисовывается), FPS meter, Layout Shift Regions (что прыгает).</li>
  <li><b>React DevTools → Profiler</b> с включённым «Record why each component rendered» — показывает, какой именно проп или хук вызвал ререндер.</li>
  <li>CPU throttling ×4 или ×6 — на вашем ноутбуке всё быстро, у пользователя нет.</li>
  </ol>
  <h5>«Течёт память»</h5>
  <ol>
  <li><b>Memory</b> → Heap snapshot. Сделать снимок, выполнить подозрительный сценарий 5–10 раз, сделать второй снимок.</li>
  <li>Режим <b>Comparison</b>: что выросло и не освободилось? Ищем Detached DOM-узлы — верный признак того, что на удалённые элементы кто-то держит ссылку.</li>
  <li>Типичные причины: не снятые слушатели и подписки, не очищенные <code class="i">setInterval</code>, бесконечно растущий кеш, замыкание на большой объект в живом колбэке.</li>
  <li>Performance monitor показывает динамику JS heap и количества DOM-узлов в реальном времени — растущая пила без спада означает утечку.</li>
  </ol>
  <h5>«Запрос не работает»</h5>
  <ul>
  <li><b>CORS-ошибка</b> в консоли: смотреть <b>ответ сервера</b> — нужного заголовка нет. Чинится на бэкенде. Проверьте, не отвечает ли сервер ошибкой на preflight <code class="i">OPTIONS</code>.</li>
  <li><b>Кука не уходит</b>: вкладка Application → Cookies, проверить <code class="i">SameSite</code>, <code class="i">Secure</code>, <code class="i">Domain</code>, и передан ли <code class="i">credentials: 'include'</code>.</li>
  <li><b>401/403</b>: посмотреть, ушёл ли заголовок <code class="i">Authorization</code>, не протух ли токен.</li>
  <li><b>Copy as cURL</b> на запросе — воспроизвести вне браузера и понять, проблема в сервере или в клиенте. Очень недооценённая кнопка.</li>
  <li><b>Overrides</b> — подменить ответ локально и проверить гипотезу без правок бэкенда.</li>
  </ul>
  <div class="hint">Приёмы, которые экономят время: <code class="i">debugger</code> прямо в коде; условная точка останова (правый клик по номеру строки) вместо десяти <code class="i">console.log</code>; <b>breakpoint на изменение DOM</b> (правый клик по узлу → Break on → attribute modifications) — когда непонятно, какой код меняет элемент; <code class="i">console.table()</code> для массивов объектов; <code class="i">monitorEvents(el)</code> в консоли, чтобы увидеть все события элемента.</div>` },
]
