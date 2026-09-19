/* eslint-disable */
// @ts-nocheck — тела тестов портированы из JS; ассерты приходят из окружения воркера
import type { Question } from '@/engine/types'

/** Кеш и очереди — 4 вопрос(ов) */
export const keshIOcherediQuestions: Question[] = [
  { id:'cache-strat', topic:'Кеш и очереди', type:'theory', level:'middle',
    q:'Стратегии кеширования, инвалидация и cache stampede. Что и как кешировать в вашем Nest-приложении?',
    answer:`<h5>Стратегии</h5>
  <ul>
  <li><b>Cache-aside (lazy loading)</b> — самая частая. Читаем из кеша; промах → идём в БД → кладём в кеш с TTL. Приложение управляет кешем само.</li>
  <li><b>Write-through</b> — пишем в кеш и в БД одновременно. Кеш всегда свежий, запись медленнее.</li>
  <li><b>Write-behind</b> — пишем в кеш, в БД асинхронно. Быстро, но можно потерять данные.</li>
  <li><b>Read-through</b> — кеш сам умеет ходить в источник (так работает <code class="i">cache-manager</code> с фабрикой).</li>
  </ul>
  <h5>Инвалидация — «одна из двух сложных задач»</h5>
  <ol>
  <li><b>TTL</b> — проще всего, данные устаревают максимум на TTL. Дефолт, если бизнес терпит небольшую задержку.</li>
  <li><b>Явное удаление</b> при записи (<code class="i">del user:42</code> в момент обновления профиля). Точно, но легко забыть место.</li>
  <li><b>Версионирование ключа</b>: <code class="i">user:42:v7</code> — инкремент версии «инвалидирует» всё разом, старое отвалится по TTL. Спасает от необходимости искать все ключи.</li>
  </ol>
  <div class="trap">Никогда не делайте <code class="i">KEYS *</code> на проде — команда блокирующая и на большой базе остановит Redis на секунды. Только <code class="i">SCAN</code> с курсором.</div>
  <h5>Cache stampede (dog-pile)</h5>
  <p>Популярный ключ протух → сотня параллельных запросов одновременно промахивается и все идут в БД → БД ложится. Решения:</p>
  <ul>
  <li><b>Single-flight / lock</b>: первый запрос ставит блокировку (<code class="i">SET key NX EX 10</code>) и идёт в БД, остальные ждут или отдают старое значение.</li>
  <li><b>Stale-while-revalidate</b>: отдаём протухшее значение и обновляем фоном.</li>
  <li><b>Jitter в TTL</b>: <code class="i">ttl + random(0..60)</code>, чтобы тысячи ключей не протухали одновременно.</li>
  </ul>
  <h5>Что кешировать</h5>
  <p>Хорошо: справочники, настройки, тяжёлые агрегаты, лидерборды, результаты внешних API, сессии/refresh-токены. Плохо: то, что меняется чаще, чем читается; данные, где недопустима даже секундная рассинхронизация (баланс).</p>
  <h5>Слои кеша в вебе</h5>
  <p>Браузер (Cache-Control) → CDN → Nginx → кеш приложения (in-memory/LRU) → Redis → кеш планов и буферов самой БД. На собесе полезно уточнить, <b>на каком слое</b> решается задача: часто самый дешёвый выигрыш — HTTP-заголовки, а не Redis.</p>` },
  { id:'cache-singleflight', topic:'Кеш и очереди', type:'code', level:'senior',
    q:'Реализуйте <code class="i">singleFlight(fn)</code>: если несколько вызовов с одинаковым ключом идут одновременно, запрос выполняется <b>один раз</b>, а результат получают все. Это лекарство от cache stampede и дублей запросов на фронте.',
    starter:`function singleFlight(fn) {
    // fn: (key) => Promise
    // вернуть функцию с тем же интерфейсом
  }`,
    exports:['singleFlight'],
    tests:[
      {name:'возвращает результат', fn:async m=>{ const f=m.singleFlight(async k=>k+'!'); eq(await f('a'),'a!') }},
      {name:'схлопывает параллельные вызовы с одним ключом', fn:async m=>{ let n=0; const f=m.singleFlight(async k=>{ n++; await sleep(30); return k }); const r=await Promise.all([f('a'),f('a'),f('a')]); deepEq(r,['a','a','a']); eq(n,1,'исходная функция должна вызваться один раз') }},
      {name:'разные ключи выполняются независимо', fn:async m=>{ let n=0; const f=m.singleFlight(async k=>{ n++; await sleep(20); return k }); await Promise.all([f('a'),f('b')]); eq(n,2) }},
      {name:'после завершения кеш сбрасывается', fn:async m=>{ let n=0; const f=m.singleFlight(async k=>{ n++; return k }); await f('a'); await f('a'); eq(n,2,'это дедупликация «в полёте», а не постоянный кеш') }},
      {name:'ошибка приходит всем ждущим и не залипает', fn:async m=>{ let n=0; const f=m.singleFlight(async()=>{ n++; await sleep(10); throw new Error('boom') }); const rs=await Promise.allSettled([f('a'),f('a')]); eq(rs.filter(r=>r.status==='rejected').length,2); eq(n,1); const e=await throwsAsync(()=>f('a')); eq(e.message,'boom'); eq(n,2,'после ошибки запись должна очиститься') }},
    ],
    solution:`function singleFlight(fn) {
    const inFlight = new Map()      // key -> Promise
  
    return function (key, ...rest) {
      // уже летит такой же запрос — отдаём тот же промис
      if (inFlight.has(key)) return inFlight.get(key)
  
      const promise = Promise.resolve()
        .then(() => fn(key, ...rest))       // ловим и синхронные исключения
        .finally(() => inFlight.delete(key))// чистим И при успехе, И при ошибке
  
      inFlight.set(key, promise)
      return promise
    }
  }`,
    answer:`<h5>Ключевые детали</h5>
  <ul>
  <li>Хранится <b>промис</b>, а не результат: подписаться на него может кто угодно и сколько угодно раз.</li>
  <li><code class="i">finally</code>, а не <code class="i">then</code>: иначе после ошибки запись останется и все последующие вызовы будут получать <b>ту же самую ошибку навсегда</b>. Тест №5 проверяет ровно это.</li>
  <li><code class="i">Promise.resolve().then(...)</code> — чтобы синхронный throw внутри <code class="i">fn</code> тоже превратился в отклонённый промис, а не улетел наружу.</li>
  </ul>
  <h5>Где это уже сделано за вас</h5>
  <ul>
  <li><b>TanStack Query</b> дедуплицирует одинаковые <code class="i">queryKey</code> ровно так же — десять компонентов с одним <code class="i">useQuery</code> дадут один сетевой запрос.</li>
  <li><b>DataLoader</b> из GraphQL — дедупликация + батчинг за один тик event loop.</li>
  <li>В распределённой системе (несколько подов Nest) локального Map мало — нужен <b>распределённый лок в Redis</b>: <code class="i">SET lock:key token NX PX 5000</code>, снятие только своим токеном через Lua-скрипт (иначе снимете чужой лок).</li>
  </ul>` },
  { id:'queue-bull', topic:'Кеш и очереди', type:'theory', level:'middle',
    q:'Зачем нужны очереди (Bull/BullMQ)? Что такое at-least-once, идемпотентность обработчика и dead letter queue?',
    code:`@Processor('emails')
  export class EmailProcessor {
    @Process({ name: 'welcome', concurrency: 5 })
    async handle(job: Job<{ userId: number }>) {
      await this.mail.sendWelcome(job.data.userId)
    }
  }
  
  await this.queue.add('welcome', { userId }, {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 100,
    jobId: \`welcome:\${userId}\`,   // ← дедупликация
  })`,
    answer:`<h5>Зачем очередь</h5>
  <ul>
  <li><b>Убрать долгое из HTTP-запроса</b>: письмо, обработка видео, генерация отчёта, вызов внешнего API. Пользователь получает 202 сразу.</li>
  <li><b>Сгладить пики</b>: очередь работает буфером, воркеры разгребают в своём темпе.</li>
  <li><b>Ретраи и надёжность</b>: упало — повторим с backoff, а не потеряем.</li>
  <li><b>Расписание</b>: отложенные и повторяющиеся задачи (напоминания, ночные пересчёты).</li>
  </ul>
  <h5>Гарантии доставки</h5>
  <table>
  <tr><th>at-most-once</th><th>at-least-once</th><th>exactly-once</th></tr>
  <tr><td>может потеряться</td><td>может выполниться дважды</td><td>практически недостижимо в распределённой системе</td></tr>
  </table>
  <p>Bull даёт <b>at-least-once</b>: если воркер упал после отправки письма, но до подтверждения, задача вернётся в очередь. Значит, <b>обработчик обязан быть идемпотентным</b>.</p>
  <h5>Как делать идемпотентность</h5>
  <ul>
  <li>Стабильный <code class="i">jobId</code> — Bull не добавит дубль с тем же id.</li>
  <li>Ключ операции в БД: <code class="i">INSERT ... ON CONFLICT DO NOTHING</code> по <code class="i">(userId, type, date)</code>. Проверка «уже отправляли?» должна быть <b>атомарной</b>, а не «select, потом insert».</li>
  <li>Для внешних API — передавать <code class="i">Idempotency-Key</code> (так делают платёжные шлюзы, у вас YooKassa и T-Bank).</li>
  </ul>
  <h5>Dead letter queue</h5>
  <p>Задача исчерпала <code class="i">attempts</code> → уходит в failed. Это нужно <b>мониторить</b>: алерт на рост failed, ручной разбор и повтор. Молча теряющаяся очередь — источник «мы не отправили 3000 писем и узнали через неделю».</p>
  <h5>Подводные камни</h5>
  <ul>
  <li><b>Не класть большие данные в payload</b> — только id. Объект в Redis устареет к моменту обработки и займёт память.</li>
  <li><code class="i">removeOnComplete</code>/<code class="i">removeOnFail</code> обязательны, иначе Redis распухает.</li>
  <li>Порядок выполнения <b>не гарантирован</b> при concurrency &gt; 1.</li>
  <li><code class="i">concurrency</code> подбирают по природе задач: I/O-bound можно много, CPU-bound — по числу ядер.</li>
  </ul>` },
  { id:'cache-ratelimit', topic:'Кеш и очереди', type:'code', level:'senior',
    q:'Реализуйте token bucket rate limiter: <code class="i">createLimiter({ capacity, refillPerMs })</code> с методом <code class="i">tryTake(now)</code>. Время передаём явно — так оно тестируется детерминированно.',
    starter:`function createLimiter({ capacity, refillPerMs }) {
    // refillPerMs — сколько токенов добавляется за 1 мс
    // tryTake(now) => true (пропустить) | false (отказать 429)
  }`,
    exports:['createLimiter'],
    tests:[
      {name:'первые запросы в пределах ёмкости проходят', fn:m=>{ const l=m.createLimiter({capacity:3,refillPerMs:0.001}); ok(l.tryTake(0)); ok(l.tryTake(0)); ok(l.tryTake(0)) }},
      {name:'сверх ёмкости — отказ', fn:m=>{ const l=m.createLimiter({capacity:3,refillPerMs:0.001}); l.tryTake(0);l.tryTake(0);l.tryTake(0); ok(!l.tryTake(0),'четвёртый должен получить false') }},
      {name:'токены восстанавливаются со временем', fn:m=>{ const l=m.createLimiter({capacity:2,refillPerMs:0.001}); l.tryTake(0); l.tryTake(0); ok(!l.tryTake(0)); ok(l.tryTake(1000),'за 1000мс должен накопиться 1 токен') }},
      {name:'не накапливает больше capacity', fn:m=>{ const l=m.createLimiter({capacity:2,refillPerMs:0.001}); ok(l.tryTake(1000000)); ok(l.tryTake(1000000)); ok(!l.tryTake(1000000),'бак не должен переполняться') }},
      {name:'частичное восстановление не даёт лишнего токена', fn:m=>{ const l=m.createLimiter({capacity:1,refillPerMs:0.001}); ok(l.tryTake(0)); ok(!l.tryTake(500),'прошло только полтокена') ; ok(l.tryTake(1000)) }},
    ],
    solution:`function createLimiter({ capacity, refillPerMs }) {
    let tokens = capacity
    let last = null
  
    return {
      tryTake(now) {
        if (last === null) last = now
  
        // доливаем пропорционально прошедшему времени, но не выше ёмкости
        const elapsed = Math.max(0, now - last)
        tokens = Math.min(capacity, tokens + elapsed * refillPerMs)
        last = now
  
        if (tokens >= 1) { tokens -= 1; return true }
        return false
      },
    }
  }`,
    answer:`<h5>Почему token bucket</h5>
  <p>Он допускает <b>всплески</b> (burst) до размера бака, но держит среднюю скорость. Это ближе к реальному поведению пользователей, чем жёсткое «10 запросов в секунду».</p>
  <h5>Алгоритмы лимитирования — надо различать</h5>
  <table>
  <tr><th>Алгоритм</th><th>Суть</th><th>Минус</th></tr>
  <tr><td>Fixed window</td><td>счётчик на минуту</td><td>всплеск ×2 на стыке окон</td></tr>
  <tr><td>Sliding window log</td><td>хранить таймстемпы</td><td>память</td></tr>
  <tr><td>Sliding window counter</td><td>взвешенная сумма двух окон</td><td>приближение</td></tr>
  <tr><td>Token bucket</td><td>бак с доливом</td><td>нужно хранить состояние</td></tr>
  <tr><td>Leaky bucket</td><td>равномерный отток</td><td>не допускает всплесков</td></tr>
  </table>
  <h5>Важно про «ленивый долив»</h5>
  <p>Мы не крутим таймер, а пересчитываем токены <b>в момент обращения</b> по прошедшему времени. Это O(1) по памяти и не требует фоновых задач — именно так делают в проде.</p>
  <h5>В распределённой среде</h5>
  <p>Локальная переменная не годится: 3 пода = 3× лимит. Состояние кладут в <b>Redis</b>, а инкремент+проверку делают <b>атомарно Lua-скриптом</b> (иначе гонка между GET и SET). В Nest готовое решение — <code class="i">@nestjs/throttler</code> со storage-адаптером на Redis; в Nginx — <code class="i">limit_req</code>.</p>
  <div class="hint">При отказе отдавайте <b>429</b> + заголовки <code class="i">Retry-After</code> и <code class="i">X-RateLimit-Remaining</code>, чтобы клиент мог корректно подождать, а не долбить дальше.</div>` },
]
