/* eslint-disable */
// @ts-nocheck — тела тестов портированы из JS; ассерты приходят из окружения воркера
import type { Question } from '@/engine/types'

/** API и сеть — 4 вопрос(ов) */
export const apiISetyQuestions: Question[] = [
  { id:'api-rest', topic:'API и сеть', type:'theory', level:'junior',
    q:'Что такое REST? Какие методы идемпотентны? Разберите коды ответов и подходы к пагинации.',
    answer:`<h5>REST по существу</h5>
  <p>Архитектурный стиль: ресурсы адресуются URL, действия выражаются HTTP-методами, сервер <b>stateless</b> (каждый запрос самодостаточен — отсюда JWT вместо серверных сессий при горизонтальном масштабировании), ответы кешируемы.</p>
  <h5>Методы</h5>
  <table>
  <tr><th>Метод</th><th>Идемпотентный</th><th>Безопасный</th><th>Смысл</th></tr>
  <tr><td>GET</td><td>да</td><td>да</td><td>чтение, кешируется</td></tr>
  <tr><td>POST</td><td><b>нет</b></td><td>нет</td><td>создание / произвольное действие</td></tr>
  <tr><td>PUT</td><td>да</td><td>нет</td><td>замена ресурса целиком</td></tr>
  <tr><td>PATCH</td><td>обычно нет</td><td>нет</td><td>частичное изменение</td></tr>
  <tr><td>DELETE</td><td>да</td><td>нет</td><td>удаление</td></tr>
  </table>
  <p><b>Идемпотентность</b> = повторный одинаковый запрос не меняет результат. Практический смысл: идемпотентные запросы <b>можно безопасно ретраить</b> при таймауте. Неидемпотентный POST ретраить опасно — можно создать два заказа. Решение: <b>Idempotency-Key</b> в заголовке, сервер запоминает ключ и при повторе возвращает прежний результат.</p>
  <h5>Коды, которые надо знать назубок</h5>
  <ul>
  <li><b>200</b> OK · <b>201</b> Created (+ заголовок <code class="i">Location</code>) · <b>202</b> Accepted (взяли в обработку асинхронно) · <b>204</b> No Content</li>
  <li><b>301</b> навсегда · <b>302/307</b> временно · <b>304</b> Not Modified (кеш по ETag)</li>
  <li><b>400</b> некорректный запрос · <b>401</b> не аутентифицирован (кто ты?) · <b>403</b> нет прав (знаю кто, но нельзя) · <b>404</b> нет ресурса · <b>409</b> конфликт (дубликат, гонка версий) · <b>422</b> синтаксис ок, но бизнес-валидация не прошла · <b>429</b> превышен лимит (+ <code class="i">Retry-After</code>)</li>
  <li><b>500</b> наша ошибка · <b>502</b> плохой ответ от апстрима · <b>503</b> сервис недоступен · <b>504</b> таймаут апстрима</li>
  </ul>
  <h5>Пагинация: offset vs cursor</h5>
  <table>
  <tr><th>Offset (<code class="i">?page=5&amp;limit=20</code>)</th><th>Cursor (<code class="i">?after=eyJpZCI6MTAwfQ</code>)</th></tr>
  <tr><td>простая, можно прыгнуть на страницу N</td><td>прыгать нельзя, только вперёд/назад</td></tr>
  <tr><td><code class="i">OFFSET 100000</code> заставляет БД пролистать 100k строк — медленно</td><td><code class="i">WHERE id &lt; :cursor LIMIT 20</code> — по индексу, скорость постоянна</td></tr>
  <tr><td><b>дубли и пропуски</b>, если данные меняются между страницами</td><td>стабильна при вставках</td></tr>
  <tr><td>админки, где нужны номера страниц</td><td>ленты, бесконечный скролл, большие объёмы</td></tr>
  </table>
  <div class="hint">Курсор обязательно строить по <b>уникальному, монотонному</b> полю. Если сортировка по <code class="i">createdAt</code>, который не уникален, в курсор кладут пару <code class="i">(createdAt, id)</code> — иначе записи с одинаковым временем будут теряться.</div>` },
  { id:'api-cursor', topic:'API и сеть', type:'code', level:'middle',
    q:'Реализуйте курсорную пагинацию: <code class="i">paginate(items, { after, limit })</code>. Массив отсортирован по <code class="i">id</code> по возрастанию, курсор — это id последнего элемента предыдущей страницы.',
    starter:`function paginate(items, { after = null, limit = 2 } = {}) {
    // вернуть { items: [...], nextCursor: id | null, hasMore: boolean }
  }`,
    exports:['paginate'],
    tests:[
      {name:'первая страница', fn:m=>{ const d=[{id:1},{id:2},{id:3},{id:4},{id:5}]; const r=m.paginate(d,{limit:2}); deepEq(r.items,[{id:1},{id:2}]); eq(r.nextCursor,2); eq(r.hasMore,true) }},
      {name:'следующая страница по курсору', fn:m=>{ const d=[{id:1},{id:2},{id:3},{id:4},{id:5}]; const r=m.paginate(d,{after:2,limit:2}); deepEq(r.items,[{id:3},{id:4}]); eq(r.nextCursor,4) }},
      {name:'последняя страница: hasMore=false, nextCursor=null', fn:m=>{ const d=[{id:1},{id:2},{id:3}]; const r=m.paginate(d,{after:2,limit:2}); deepEq(r.items,[{id:3}]); eq(r.hasMore,false); eq(r.nextCursor,null) }},
      {name:'курсор указывает за конец', fn:m=>{ const d=[{id:1},{id:2}]; const r=m.paginate(d,{after:99,limit:2}); deepEq(r.items,[]); eq(r.hasMore,false) }},
      {name:'не мутирует исходный массив', fn:m=>{ const d=[{id:1},{id:2},{id:3}]; m.paginate(d,{limit:2}); eq(d.length,3) }},
      {name:'limit больше остатка', fn:m=>{ const d=[{id:1},{id:2}]; const r=m.paginate(d,{limit:10}); eq(r.items.length,2); eq(r.hasMore,false) }},
    ],
    solution:`function paginate(items, { after = null, limit = 2 } = {}) {
    // в SQL это WHERE id > :after ORDER BY id LIMIT :limit + 1
    const rest = after == null ? items : items.filter(x => x.id > after)
  
    // берём на один больше, чтобы узнать, есть ли ещё страница,
    // не делая второй запрос COUNT(*)
    const page = rest.slice(0, limit + 1)
    const hasMore = page.length > limit
    const result = hasMore ? page.slice(0, limit) : page
  
    return {
      items: result,
      nextCursor: hasMore ? result[result.length - 1].id : null,
      hasMore,
    }
  }`,
    answer:`<h5>Приём «limit + 1»</h5>
  <p>Запрашиваем на одну запись больше лимита. Если она пришла — значит, дальше что-то есть. Это <b>дешевле</b>, чем отдельный <code class="i">SELECT COUNT(*)</code>, который на большой таблице заставляет БД сканировать всё.</p>
  <h5>Как это выглядит в TypeORM</h5>
  <pre class="code">const rows = await repo.createQueryBuilder('t')
    .where(after ? 't.id &gt; :after' : '1=1', { after })
    .orderBy('t.id', 'ASC')
    .take(limit + 1)
    .getMany()</pre>
  <h5>Что ещё спросят</h5>
  <ul>
  <li><b>Курсор надо кодировать</b> (base64 от JSON) — чтобы клиент считал его непрозрачным токеном и вы могли поменять внутреннюю структуру без ломки API.</li>
  <li>Для сортировки не по id используют составной курсор: <code class="i">WHERE (created_at, id) &lt; (:ts, :id)</code> — кортежное сравнение в Postgres работает и ложится на составной индекс.</li>
  <li>На фронте это <code class="i">useInfiniteQuery</code> с <code class="i">getNextPageParam: last =&gt; last.nextCursor</code>.</li>
  </ul>` },
  { id:'api-ws', topic:'API и сеть', type:'theory', level:'middle',
    q:'WebSocket vs SSE vs long polling. Как масштабировать socket.io на несколько инстансов?',
    answer:`<h5>Сравнение</h5>
  <table>
  <tr><th></th><th>Polling</th><th>SSE</th><th>WebSocket</th></tr>
  <tr><td>Направление</td><td>клиент → сервер</td><td>сервер → клиент</td><td>двунаправленный</td></tr>
  <tr><td>Протокол</td><td>HTTP</td><td>HTTP (text/event-stream)</td><td>ws:// после Upgrade</td></tr>
  <tr><td>Переподключение</td><td>—</td><td><b>автоматическое</b>, встроено (Last-Event-ID)</td><td>руками / библиотекой</td></tr>
  <tr><td>Бинарные данные</td><td>да</td><td>нет, только текст</td><td>да</td></tr>
  <tr><td>Прокси/файрволы</td><td>без проблем</td><td>без проблем</td><td>иногда режут</td></tr>
  <tr><td>Когда</td><td>редкие обновления, простота</td><td>уведомления, прогресс, стриминг токенов LLM</td><td>чат, игры, коллаборация, тикеры</td></tr>
  </table>
  <p>Практика: если поток данных <b>односторонний</b> — SSE проще и надёжнее (это обычный HTTP, работает с любыми балансировщиками и не требует отдельного протокола). WebSocket берут, когда клиент тоже активно шлёт.</p>
  <h5>Масштабирование socket.io — главный вопрос</h5>
  <p>Проблема: соединение «прилипает» к одному инстансу. Юзер A на поде 1, юзер B на поде 2 — <code class="i">io.to(room).emit()</code> с пода 1 не дойдёт до B.</p>
  <ol>
  <li><b>Redis adapter</b> (<code class="i">@socket.io/redis-adapter</code> — он у вас в зависимостях). Инстансы обмениваются событиями через Redis pub/sub, эмит становится глобальным.</li>
  <li><b>Sticky sessions</b> на балансировщике (<code class="i">ip_hash</code> в nginx). Нужны, потому что socket.io начинает с HTTP-polling и делает несколько запросов до апгрейда — они обязаны попасть на тот же инстанс. Если сразу форсировать <code class="i">transports: ['websocket']</code>, sticky не обязателен.</li>
  <li>Аутентификация в <code class="i">handshake</code>, а не после (в Nest — <code class="i">WsJwtGuard</code>).</li>
  </ol>
  <h5>Что ещё стоит упомянуть</h5>
  <ul>
  <li><b>Rooms</b> — логическая группировка сокетов; персональная комната по <code class="i">userId</code> — стандартный приём для адресных уведомлений при нескольких вкладках.</li>
  <li><b>Heartbeat</b> (ping/pong) — обнаружение мёртвых соединений; без него «полуоткрытые» сокеты копятся.</li>
  <li>WebSocket не проходит через обычный HTTP-кеш и не имеет статус-кодов — обработку ошибок и переподключение пишете сами (или берёте socket.io, где это есть).</li>
  </ul>` },
  { id:'api-fetchtimeout', topic:'API и сеть', type:'code', level:'middle',
    q:'Реализуйте <code class="i">fetchWithTimeout(fetchFn, url, ms)</code> — запрос с таймаутом через <code class="i">AbortController</code>. Должен реджектиться ошибкой с <code class="i">name === "TimeoutError"</code> и обязательно чистить таймер.',
    starter:`function fetchWithTimeout(fetchFn, url, ms) {
    // fetchFn(url, { signal }) — вернёт промис
  }`,
    exports:['fetchWithTimeout'],
    tests:[
      {name:'быстрый ответ проходит', fn:async m=>{ const f=async()=>{ await sleep(10); return 'ok' }; eq(await m.fetchWithTimeout(f,'/x',100),'ok') }},
      {name:'медленный ответ даёт TimeoutError', fn:async m=>{ const f=(u,{signal})=>new Promise((res,rej)=>{ const t=setTimeout(()=>res('late'),200); signal?.addEventListener('abort',()=>{clearTimeout(t); const e=new Error('aborted'); e.name='AbortError'; rej(e)}) }); const e=await throwsAsync(()=>m.fetchWithTimeout(f,'/x',40)); eq(e.name,'TimeoutError') }},
      {name:'передаёт signal в fetch', fn:async m=>{ let got=null; const f=(u,opts)=>{ got=opts&&opts.signal; return Promise.resolve('ok') }; await m.fetchWithTimeout(f,'/x',50); ok(got && typeof got.aborted==='boolean','в fetch должен уйти AbortSignal') }},
      {name:'реально прерывает запрос (signal.aborted)', fn:async m=>{ let sig=null; const f=(u,{signal})=>{ sig=signal; return new Promise(()=>{}) }; m.fetchWithTimeout(f,'/x',20).catch(()=>{}); await sleep(60); ok(sig && sig.aborted,'signal должен перейти в aborted') }},
      {name:'ошибка сети пробрасывается как есть', fn:async m=>{ const f=()=>Promise.reject(new Error('network down')); const e=await throwsAsync(()=>m.fetchWithTimeout(f,'/x',100)); eq(e.message,'network down') }},
    ],
    solution:`function fetchWithTimeout(fetchFn, url, ms) {
    const controller = new AbortController()
    let timedOut = false
  
    const timer = setTimeout(() => {
      timedOut = true
      controller.abort()          // реально рвём соединение, а не просто игнорируем ответ
    }, ms)
  
    return fetchFn(url, { signal: controller.signal })
      .catch(err => {
        // отличаем «мы сами отменили по таймауту» от отмены снаружи
        if (timedOut) {
          const e = new Error(\`Request timed out after \${ms}ms\`)
          e.name = 'TimeoutError'
          throw e
        }
        throw err
      })
      .finally(() => clearTimeout(timer))   // иначе таймер держит процесс/замыкание
  }
  
  // В современной среде то же самое из коробки:
  // fetch(url, { signal: AbortSignal.timeout(ms) })`,
    answer:`<h5>Почему AbortController, а не <code class="i">Promise.race</code></h5>
  <p><code class="i">Promise.race([fetch(...), timeout])</code> только <b>перестаёт ждать</b> ответ — сам запрос продолжает висеть, занимать соединение и грузить сервер. <code class="i">AbortController</code> действительно разрывает его.</p>
  <h5>Обязательные детали</h5>
  <ul>
  <li><code class="i">clearTimeout</code> в <code class="i">finally</code> — иначе таймер живёт до срабатывания и держит замыкание (в Node — ещё и не даёт процессу завершиться).</li>
  <li>Различать свой таймаут и внешнюю отмену: иначе пользователь, ушедший со страницы, увидит в логах «таймаут».</li>
  <li><code class="i">AbortSignal</code> — общий механизм отмены: его принимают <code class="i">fetch</code>, <code class="i">addEventListener</code> (<code class="i">{ signal }</code> — элегантная отписка), стримы Node, axios, TanStack Query (передаёт <code class="i">signal</code> в <code class="i">queryFn</code> и отменяет устаревшие запросы автоматически).</li>
  <li><code class="i">AbortSignal.any([a, b])</code> — объединить несколько причин отмены.</li>
  </ul>
  <div class="hint">Связанный вопрос: «таймаут на клиенте или на сервере?» — нужны оба. Клиентский спасает UI, серверный (<code class="i">timeout()</code> в RxJS-интерцепторе Nest, <code class="i">statement_timeout</code> в Postgres) спасает инфраструктуру от зависших запросов.</div>` },
]
