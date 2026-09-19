/* eslint-disable */
// @ts-nocheck — тела тестов портированы из JS; ассерты приходят из окружения воркера
import type { Question } from '@/engine/types'

/** JavaScript — 24 вопрос(ов) */
export const javascriptQuestions: Question[] = [
  { id:'js-loop-1', topic:'JavaScript', type:'output', level:'middle',
    q:'Что выведет код? (event loop: синхронный код → микротаски → макротаски)',
    code:`console.log('1')
  setTimeout(() => console.log('2'), 0)
  Promise.resolve().then(() => console.log('3'))
  queueMicrotask(() => console.log('4'))
  ;(async () => {
    console.log('5')
    await null
    console.log('6')
  })()
  console.log('7')`,
    expected:'1\n5\n7\n3\n4\n6\n2',
    answer:`<h5>Разбор по шагам</h5>
  <ol>
  <li><b>Синхронная фаза</b> (текущая макрозадача выполняется до конца, её нельзя прервать):
  <code class="i">1</code> → <code class="i">setTimeout</code> кладёт колбэк в очередь таймеров →
  <code class="i">.then</code> кладёт в очередь микрозадач → <code class="i">queueMicrotask</code> туда же →
  async-IIFE <b>вызывается синхронно</b> и печатает <code class="i">5</code>, на <code class="i">await null</code>
  функция ставит продолжение в микрозадачи и возвращает управление → <code class="i">7</code>.</li>
  <li><b>Очередь микрозадач</b> (выгребается полностью, в порядке добавления): <code class="i">3</code>, <code class="i">4</code>, <code class="i">6</code>.</li>
  <li><b>Следующая макрозадача</b>: <code class="i">2</code>.</li>
  </ol>
  <h5>Что здесь важно проговорить на собесе</h5>
  <ul>
  <li><code class="i">await</code> — это синтаксический сахар над <code class="i">.then()</code>: код <i>до</i> первого await выполняется синхронно, всё после — микрозадача. Даже <code class="i">await null</code> (не-промис) откладывает продолжение.</li>
  <li>Микрозадачи разгребаются <b>полностью</b> после каждой макрозадачи, и микрозадача, породившая микрозадачу, выполнится в этом же цикле → бесконечная генерация микрозадач <b>заблокирует рендер</b> (starvation).</li>
  <li>Рендер браузера происходит между макрозадачами, после микрозадач; <code class="i">requestAnimationFrame</code> — прямо перед отрисовкой.</li>
  <li><code class="i">setTimeout(fn, 0)</code> ≠ мгновенно: минимум ~4 мс при вложенности &gt;5 и всегда после текущих микрозадач.</li>
  </ul>` },
  { id:'js-loop-2', topic:'JavaScript', type:'output', level:'junior',
    q:'Классика про замыкания: что выведет код?',
    code:`for (var i = 0; i < 3; i++) setTimeout(() => console.log('var', i), 0)
  for (let j = 0; j < 3; j++) setTimeout(() => console.log('let', j), 0)`,
    expected:'var 3\nvar 3\nvar 3\nlet 0\nlet 1\nlet 2',
    answer:`<h5>Почему</h5>
  <ul>
  <li><code class="i">var</code> имеет <b>функциональную</b> область видимости — переменная одна на весь цикл. К моменту, когда таймеры выполнятся (после синхронного кода), <code class="i">i</code> уже равна 3. Все три замыкания ссылаются на <b>одну и ту же</b> ячейку памяти.</li>
  <li><code class="i">let</code> имеет <b>блочную</b> область. Спецификация создаёт <b>новую привязку на каждой итерации</b> и копирует в неё значение — поэтому каждое замыкание держит свою <code class="i">j</code>.</li>
  </ul>
  <h5>Как чинить на var (спрашивают часто)</h5>
  <pre class="code">for (var i = 0; i &lt; 3; i++) {
    (function (i) { setTimeout(() =&gt; console.log(i), 0) })(i)   // IIFE создаёт новый скоуп
  }</pre>
  <h5>Определение замыкания одной фразой</h5>
  <p>Замыкание — это функция вместе со ссылкой на лексическое окружение, в котором она была <b>создана</b> (не вызвана). Благодаря этому функция «помнит» внешние переменные даже после выхода из внешней функции.</p>` },
  { id:'js-hoist', topic:'JavaScript', type:'output', level:'junior',
    q:'Что выведет код? Учитывайте hoisting и TDZ.',
    code:`console.log(typeof a)
  console.log(typeof fn)
  var a = 1
  function fn() {}
  try { console.log(b) } catch (e) { console.log(e.constructor.name) }
  let b = 2`,
    expected:'undefined\nfunction\nReferenceError',
    answer:`<h5>Разбор</h5>
  <ul>
  <li><code class="i">var a</code> поднимается и инициализируется <code class="i">undefined</code> → <code class="i">typeof a === 'undefined'</code>.</li>
  <li><b>Function declaration</b> поднимается целиком (вместе с телом) → уже <code class="i">'function'</code>. Function expression (<code class="i">const fn = () =&gt; {}</code>) — нет.</li>
  <li><code class="i">let</code>/<code class="i">const</code>/<code class="i">class</code> тоже поднимаются, но попадают в <b>TDZ</b> (temporal dead zone) — обращение до строки объявления бросает <code class="i">ReferenceError</code>. Именно поэтому <code class="i">typeof b</code> для let тоже упадёт (в отличие от необъявленной переменной).</li>
  </ul>
  <div class="hint">Формулировка для собеса: «Hoisting — это не перенос кода вверх, а то, что все объявления создаются в лексическом окружении на этапе входа в скоуп. Разница между var и let — в моменте <i>инициализации</i> привязки».</div>` },
  { id:'js-this', topic:'JavaScript', type:'theory', level:'middle',
    q:'Как определяется <code class="i">this</code>? Почему падает код ниже и три способа починить.',
    code:`class Counter {
    count = 0
    inc() { this.count++ }
  }
  const c = new Counter()
  const inc = c.inc
  inc()          // TypeError: Cannot read properties of undefined`,
    answer:`<h5>Правила привязки <code class="i">this</code> (по убыванию приоритета)</h5>
  <ol>
  <li><b>new</b> — <code class="i">new Foo()</code> → this = новый объект.</li>
  <li><b>Явная</b> — <code class="i">fn.call(obj)</code> / <code class="i">.apply(obj)</code> / <code class="i">.bind(obj)</code>.</li>
  <li><b>Неявная (контекст вызова)</b> — <code class="i">obj.fn()</code> → this = obj. <b>Важно: this определяется точкой вызова, а не местом объявления.</b></li>
  <li><b>Дефолтная</b> — просто <code class="i">fn()</code> → <code class="i">undefined</code> в strict mode / модулях (тела классов всегда strict), <code class="i">globalThis</code> в нестрогом.</li>
  <li><b>Стрелочные функции</b> вне этих правил: у них нет своего this, они берут его лексически из места объявления. Поэтому им нельзя переназначить this через bind/call.</li>
  </ol>
  <h5>Почему падает</h5>
  <p>При <code class="i">const inc = c.inc</code> мы отрываем метод от объекта. Вызов <code class="i">inc()</code> — дефолтная привязка, this = undefined (strict), и <code class="i">undefined.count</code> бросает TypeError.</p>
  <h5>Три способа починить</h5>
  <pre class="code">// 1. bind
  const inc = c.inc.bind(c)
  
  // 2. поле-стрелка (this лексический, «привязан» на этапе создания инстанса)
  class Counter { count = 0; inc = () =&gt; { this.count++ } }
  
  // 3. обёртка на месте вызова
  button.onclick = () =&gt; c.inc()</pre>
  <div class="trap">Где ловят в React: <code class="i">onClick={this.handle}</code> в классовых компонентах, <code class="i">arr.map(obj.method)</code>, передача метода сервиса в колбэк в Nest. Во всех случаях метод отрывается от контекста.</div>` },
  { id:'js-bind', topic:'JavaScript', type:'code', level:'middle',
    q:'Реализуйте <code class="i">myBind</code> — аналог <code class="i">Function.prototype.bind</code>: частичное применение аргументов + корректная работа с <code class="i">new</code>.',
    starter:`Function.prototype.myBind = function (ctx, ...bound) {
    // ваш код
  }
  
  // вернём сам прототипный метод, чтобы тесты смогли его дёрнуть
  const myBind = Function.prototype.myBind`,
    exports:['myBind'],
    tests:[
      {name:'привязывает контекст', fn:m=>{ const o={v:42}; function f(){return this.v}; eq(f.myBind(o)(), 42) }},
      {name:'частичное применение', fn:m=>{ function add(a,b,c){return a+b+c}; eq(add.myBind(null,1,2)(3), 6) }},
      {name:'аргументы склеиваются в правильном порядке', fn:m=>{ function f(...a){return a.join('-')}; eq(f.myBind(null,'a')('b','c'), 'a-b-c') }},
      {name:'работает с new (контекст игнорируется)', fn:m=>{ function P(n){ this.n = n }; P.prototype.hi=function(){return 'hi '+this.n}; const B=P.myBind({fake:1}); const i=new B('bob'); eq(i.n,'bob'); eq(i.hi(),'hi bob'); ok(i instanceof P, 'instanceof должен сохраняться') }},
    ],
    solution:`Function.prototype.myBind = function (ctx, ...bound) {
    const fn = this
    if (typeof fn !== 'function') throw new TypeError('not a function')
  
    function bounded(...args) {
      // если вызвали через new — this уже новый объект, ctx игнорируем
      return fn.apply(this instanceof bounded ? this : ctx, [...bound, ...args])
    }
    // наследуем прототип, чтобы работал instanceof
    bounded.prototype = Object.create(fn.prototype || null)
    return bounded
  }
  
  const myBind = Function.prototype.myBind`,
    answer:`<h5>Ключевые моменты</h5>
  <ul>
  <li><code class="i">this</code> внутри <code class="i">myBind</code> — это сама функция, у которой вызвали метод.</li>
  <li>Нельзя писать стрелку: стрелочная функция не получит собственный this при вызове через <code class="i">new</code>.</li>
  <li><code class="i">this instanceof bounded</code> — стандартный трюк определения «вызвали ли через new». В современном коде можно <code class="i">new.target</code>.</li>
  <li>Копирование прототипа нужно, чтобы <code class="i">new Bound() instanceof Original</code> было true.</li>
  </ul>
  <div class="hint">Часто просят следом: «а чем bind отличается от call/apply?» — bind <b>возвращает новую функцию</b> (вызов отложен), call/apply <b>вызывают сразу</b>; apply принимает массив аргументов.</div>` },
  { id:'js-promiseall', topic:'JavaScript', type:'code', level:'middle',
    q:'Реализуйте <code class="i">promiseAll(items)</code> — аналог <code class="i">Promise.all</code>. Порядок результатов = порядок входа, запуск параллельный, реджект при первой ошибке.',
    starter:`function promiseAll(items) {
    // ваш код
  }`,
    exports:['promiseAll'],
    tests:[
      {name:'сохраняет порядок результатов', fn:async m=>{ const r = await m.promiseAll([sleep(20).then(()=>1), Promise.resolve(2), 3]); deepEq(r,[1,2,3]) }},
      {name:'пустой массив → []', fn:async m=>{ deepEq(await m.promiseAll([]), []) }},
      {name:'реджектится первой ошибкой', fn:async m=>{ const e = await throwsAsync(()=>m.promiseAll([sleep(30).then(()=>1), Promise.reject(new Error('boom'))])); eq(e.message,'boom') }},
      {name:'работает параллельно, а не последовательно', fn:async m=>{ const t=Date.now(); await m.promiseAll([sleep(40),sleep(40),sleep(40)]); const d=Date.now()-t; ok(d < 110, 'заняло '+d+'мс — похоже на последовательный await в цикле') }},
    ],
    approach:`<ol>
  <li><b>Начните с каркаса.</b> Функция возвращает новый промис — значит, <code class="i">new Promise((resolve, reject) =&gt; ...)</code>.</li>
  <li><b>Подумайте, как сохранить порядок.</b> Если делать <code class="i">res.push(v)</code>, порядок будет по времени завершения, а не по входу. Пишите <b>по индексу</b>: <code class="i">res[i] = v</code>.</li>
  <li><b>Придумайте, как понять «все готовы».</b> Проверять <code class="i">res.length</code> нельзя — в разреженном массиве длина обманет. Заведите счётчик оставшихся и декрементируйте.</li>
  <li><b>Обработайте пустой массив ПЕРВЫМ делом.</b> Иначе счётчик никогда не дойдёт до нуля и промис зависнет навсегда — классическая ошибка.</li>
  <li><b>Нормализуйте элементы.</b> В массив могут прийти не только промисы, но и обычные значения и thenable-объекты. <code class="i">Promise.resolve(item)</code> приводит всё к промису.</li>
  <li><b>Ошибка — это просто reject.</b> Передайте <code class="i">reject</code> вторым аргументом в <code class="i">.then</code>: первая же ошибка отклонит общий промис. Остальные при этом продолжат выполняться — скажите об этом вслух, это важная деталь поведения.</li>
  <li><b>Про параллельность:</b> отдельных усилий она не требует — промисы уже «в полёте» к моменту передачи в функцию.</li>
  </ol>`,
    solution:`function promiseAll(items) {
    return new Promise((resolve, reject) => {
      const res = new Array(items.length)
      let left = items.length
      if (left === 0) return resolve([])
  
      items.forEach((item, i) => {
        // Promise.resolve нормализует не-промисы и thenable
        Promise.resolve(item).then(
          v => {
            res[i] = v              // пишем по индексу — порядок гарантирован
            if (--left === 0) resolve(res)
          },
          reject                    // первая же ошибка реджектит общий промис
        )
      })
    })
  }`,
    answer:`<h5>На что смотрит интервьюер</h5>
  <ul>
  <li><b>Индекс, а не push</b> — иначе порядок будет по времени завершения.</li>
  <li><b>Счётчик</b>, а не <code class="i">res.length</code> — дырки в разреженном массиве не считаются.</li>
  <li><b>Пустой массив</b> — резолв сразу, иначе промис зависнет навсегда.</li>
  <li><b>Promise.resolve(item)</b> — в массив могут прийти обычные значения и thenable-объекты.</li>
  <li>Итерация запускает <b>все</b> промисы сразу — параллельность бесплатна, потому что промисы уже «в полёте» к моменту передачи в функцию.</li>
  </ul>
  <h5>Соседние методы — надо знать разницу</h5>
  <table>
  <tr><th>Метод</th><th>Когда резолвится</th><th>Результат</th></tr>
  <tr><td>all</td><td>все успешны / первая ошибка</td><td>массив значений</td></tr>
  <tr><td>allSettled</td><td>всегда, когда все завершились</td><td>[{status:'fulfilled',value} | {status:'rejected',reason}]</td></tr>
  <tr><td>race</td><td>первый <i>завершившийся</i> (успех или ошибка)</td><td>его результат</td></tr>
  <tr><td>any</td><td>первый <i>успешный</i>; если все упали — AggregateError</td><td>его значение</td></tr>
  </table>` },
  { id:'js-plimit', topic:'JavaScript', type:'code', level:'senior',
    q:'Реализуйте <code class="i">pLimit(tasks, limit)</code>: массив функций-задач, выполнять не более <code class="i">limit</code> одновременно, вернуть результаты в исходном порядке. Практическая задача — так шлют батчи запросов, чтобы не убить API.',
    starter:`function pLimit(tasks, limit) {
    // tasks: Array<() => Promise<any>>
    // ваш код
  }`,
    exports:['pLimit'],
    tests:[
      {name:'результаты в исходном порядке', fn:async m=>{ const t=[()=>sleep(30).then(()=>'a'), ()=>sleep(5).then(()=>'b'), ()=>sleep(15).then(()=>'c')]; deepEq(await m.pLimit(t,2), ['a','b','c']) }},
      {name:'не превышает лимит параллельности', fn:async m=>{ let cur=0, max=0; const mk=()=>async()=>{ cur++; max=Math.max(max,cur); await sleep(20); cur--; return 1 }; await m.pLimit([mk(),mk(),mk(),mk(),mk(),mk()], 2); eq(max,2,'максимум одновременных') }},
      {name:'реально параллелит (быстрее последовательного)', fn:async m=>{ const t=Array.from({length:6},()=>()=>sleep(25)); const s=Date.now(); await m.pLimit(t,3); const d=Date.now()-s; ok(d<130,'заняло '+d+'мс') }},
      {name:'пустой список', fn:async m=>{ deepEq(await m.pLimit([],3), []) }},
    ],
    approach:`<ol>
  <li><b>Отбросьте очевидный неверный путь.</b> Соблазн — считать активные задачи и запускать новые по завершении. Это работает, но код получается с гонками и сложным учётом.</li>
  <li><b>Переверните задачу:</b> вместо «ограничить количество» — <b>запустить ровно limit исполнителей</b>, каждый из которых в цикле берёт следующую задачу из общей очереди. Пул физически не может дать больше limit одновременных.</li>
  <li><b>Это тот же паттерн, что thread pool</b> — так и скажите на собеседовании.</li>
  <li><b>Захват индекса:</b> <code class="i">const i = next++</code>. В однопоточном JS это безопасно: переключение возможно только на <code class="i">await</code>, а между чтением и инкрементом его нет.</li>
  <li><b>Результаты пишите по индексу</b> — порядок должен соответствовать входу, а не времени завершения.</li>
  <li><b>Дождитесь всех воркеров</b> через <code class="i">Promise.all</code> и верните массив результатов.</li>
  <li><b>Назовите, чего не хватает для прода:</b> сейчас первая ошибка схлопнет <code class="i">Promise.all</code>, а воркеры продолжат работать вхолостую. Часто нужен режим allSettled.</li>
  </ol>`,
    solution:`function pLimit(tasks, limit) {
    const results = new Array(tasks.length)
    let next = 0
  
    async function worker() {
      while (next < tasks.length) {
        const i = next++          // атомарно в однопоточном JS: захватываем индекс
        results[i] = await tasks[i]()
      }
    }
  
    // запускаем ровно limit «воркеров», каждый тянет задачи из общей очереди
    const workers = Array.from({ length: Math.min(limit, tasks.length) }, worker)
    return Promise.all(workers).then(() => results)
  }`,
    answer:`<h5>Идея</h5>
  <p>Вместо того чтобы «считать активные», запускаем <b>фиксированный пул воркеров</b>. Каждый воркер в цикле берёт следующий индекс и ждёт задачу. Пул из <code class="i">limit</code> воркеров физически не может дать больше <code class="i">limit</code> одновременных задач. Это тот же паттерн, что thread pool.</p>
  <h5>Почему <code class="i">next++</code> безопасен</h5>
  <p>JS однопоточный: между чтением и инкрементом не может вклиниться другой воркер, переключение контекста возможно только на <code class="i">await</code>.</p>
  <h5>Что добавить в проде</h5>
  <ul>
  <li>Обработка ошибок: сейчас первая ошибка «схлопнет» Promise.all, а остальные воркеры продолжат работать вхолостую. Часто нужен режим allSettled.</li>
  <li>Готовые решения: <code class="i">p-limit</code>, <code class="i">p-map</code> (Sindre Sorhus), в Nest — Bull с <code class="i">concurrency</code>.</li>
  </ul>
  <div class="hint">Связанный вопрос: «в чём разница <code class="i">for (const x of arr) await f(x)</code> и <code class="i">await Promise.all(arr.map(f))</code>?» — первый последовательный (N×задержка), второй параллельный (1×задержка, но N одновременных соединений). pLimit — золотая середина.</div>` },
  { id:'js-retry', topic:'JavaScript', type:'code', level:'middle',
    q:'Реализуйте <code class="i">retry(fn, { retries, delay })</code> с экспоненциальной задержкой: пытаемся выполнить <code class="i">fn</code>, при ошибке ждём <code class="i">delay</code>, потом <code class="i">delay*2</code>, <code class="i">delay*4</code>…',
    starter:`async function retry(fn, { retries = 3, delay = 100 } = {}) {
    // ваш код
  }`,
    exports:['retry'],
    tests:[
      {name:'успех с первого раза — без задержек', fn:async m=>{ let n=0; eq(await m.retry(async()=>{n++; return 'ok'},{retries:3,delay:1}), 'ok'); eq(n,1,'вызовов') }},
      {name:'повторяет до успеха', fn:async m=>{ let n=0; const r = await m.retry(async()=>{ n++; if(n<3) throw new Error('fail'); return n },{retries:5,delay:1}); eq(r,3); eq(n,3) }},
      {name:'выбрасывает последнюю ошибку после исчерпания попыток', fn:async m=>{ let n=0; const e=await throwsAsync(()=>m.retry(async()=>{n++; throw new Error('err'+n)},{retries:2,delay:1})); eq(n,3,'1 основная + 2 ретрая'); eq(e.message,'err3') }},
      {name:'задержка растёт экспоненциально', fn:async m=>{ const s=Date.now(); await throwsAsync(()=>m.retry(async()=>{throw new Error('x')},{retries:2,delay:25})); const d=Date.now()-s; ok(d>=70,'ожидали >=75мс (25+50), прошло '+d+'мс') }},
    ],
    solution:`async function retry(fn, { retries = 3, delay = 100 } = {}) {
    let lastErr
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn(attempt)
      } catch (err) {
        lastErr = err
        if (attempt === retries) break            // попытки кончились
        const wait = delay * 2 ** attempt         // 100, 200, 400...
        await new Promise(r => setTimeout(r, wait))
      }
    }
    throw lastErr
  }`,
    answer:`<h5>Что обязательно проговорить</h5>
  <ul>
  <li><b>retries = количество повторов</b>, всего вызовов <code class="i">retries + 1</code>. Уточните это у интервьюера — двусмысленность намеренная.</li>
  <li><b>Не спать после последней попытки</b> — частая ошибка, лишняя секунда простоя.</li>
  <li><b>Jitter</b> (случайный разброс): <code class="i">wait * (0.5 + Math.random())</code>. Без него все клиенты после падения сервиса ретраятся синхронно и добивают его — «thundering herd».</li>
  <li><b>Ретраить можно не всё</b>: только идемпотентные операции (GET, PUT, DELETE) и «временные» ошибки — 429, 502/503/504, сетевые таймауты. Ретраить 400/401/422 бессмысленно, а ретрай неидемпотентного POST может списать деньги дважды.</li>
  <li>Рядом обычно живёт <b>Circuit Breaker</b>: после N подряд ошибок перестать долбить сервис на T секунд.</li>
  </ul>` },
  { id:'js-debounce', topic:'JavaScript', type:'code', level:'junior',
    q:'Реализуйте <code class="i">debounce(fn, ms)</code> — вызов только после паузы в <code class="i">ms</code>; плюс метод <code class="i">.cancel()</code>. Классика для поиска и ресайза.',
    starter:`function debounce(fn, ms) {
    // ваш код
  }`,
    exports:['debounce'],
    tests:[
      {name:'серия вызовов схлопывается в один', fn:async m=>{ let n=0; const d=m.debounce(()=>n++,30); d();d();d(); eq(n,0,'сразу не должен вызываться'); await sleep(60); eq(n,1) }},
      {name:'передаёт последние аргументы', fn:async m=>{ let got; const d=m.debounce(v=>got=v,20); d('a'); d('b'); d('c'); await sleep(50); eq(got,'c') }},
      {name:'таймер сбрасывается новым вызовом', fn:async m=>{ let n=0; const d=m.debounce(()=>n++,40); d(); await sleep(25); d(); await sleep(25); eq(n,0,'второй вызов должен был сбросить таймер'); await sleep(30); eq(n,1) }},
      {name:'cancel отменяет отложенный вызов', fn:async m=>{ let n=0; const d=m.debounce(()=>n++,20); d(); d.cancel(); await sleep(50); eq(n,0) }},
      {name:'сохраняет this', fn:async m=>{ let got; const o={v:7, f:m.debounce(function(){got=this.v},10)}; o.f(); await sleep(30); eq(got,7) }},
    ],
    approach:`<ol>
  <li><b>Сформулируйте поведение одной фразой:</b> «выполнить, когда вызовы прекратились на ms». Значит, каждый новый вызов должен <b>отменять</b> запланированный.</li>
  <li><b>Отсюда сразу конструкция:</b> переменная с id таймера в замыкании, <code class="i">clearTimeout</code> в начале и <code class="i">setTimeout</code> в конце.</li>
  <li><b>Не теряйте аргументы.</b> Внутрь таймера должны попасть аргументы <b>последнего</b> вызова — соберите их через rest-параметр.</li>
  <li><b>Возьмите обычную функцию, а не стрелку.</b> Стрелка не получит собственный <code class="i">this</code>, и дебаунс сломается при использовании как метода объекта. Прокидывайте контекст через <code class="i">fn.apply(this, args)</code>.</li>
  <li><b>Добавьте <code class="i">cancel</code>.</b> Это свойство на возвращаемой функции: <code class="i">debounced.cancel = () =&gt; clearTimeout(timer)</code>. В React оно понадобится в cleanup эффекта.</li>
  <li><b>Проверьте сценарий сброса таймера:</b> вызов, пауза меньше ms, ещё вызов — функция должна сработать один раз и позже, чем если бы второго вызова не было.</li>
  </ol>
  <p><b>Ловушка в React:</b> создавать debounce в теле компонента нельзя — каждый рендер даст новую функцию со своим таймером, и дебаунс перестанет работать вовсе.</p>`,
    solution:`function debounce(fn, ms) {
    let timer = null
  
    function debounced(...args) {
      clearTimeout(timer)
      // обычная функция + сохранение this, чтобы работало как метод объекта
      timer = setTimeout(() => { timer = null; fn.apply(this, args) }, ms)
    }
  
    debounced.cancel = () => { clearTimeout(timer); timer = null }
    return debounced
  }`,
    answer:`<h5>debounce vs throttle — обязательный вопрос</h5>
  <div data-demo="debounce-throttle"></div>
  <table>
  <tr><th></th><th>debounce</th><th>throttle</th></tr>
  <tr><td>Логика</td><td>выполнить, когда события <b>прекратились</b> на ms</td><td>выполнять <b>не чаще</b> раза в ms</td></tr>
  <tr><td>При непрерывном потоке</td><td>не вызовется ни разу</td><td>вызывается регулярно</td></tr>
  <tr><td>Где применять</td><td>автокомплит, валидация формы, автосохранение, resize</td><td>scroll, mousemove, drag, прогресс аплоада</td></tr>
  </table>
  <h5>Подводные камни</h5>
  <ul>
  <li><b>Стрелка вместо function</b> сломает <code class="i">this</code>, если дебаунс используют как метод объекта.</li>
  <li>В React <code class="i">debounce</code> нельзя создавать в теле компонента — при каждом рендере получится новая функция со своим таймером. Нужен <code class="i">useMemo</code>/<code class="i">useRef</code> + очистка в <code class="i">useEffect</code>: <code class="i">return () =&gt; d.cancel()</code>.</li>
  <li>Опции <code class="i">leading</code> (вызвать сразу на первом событии) и <code class="i">trailing</code> — про них любят спросить «а как добавить?».</li>
  </ul>` },
  { id:'js-throttle', topic:'JavaScript', type:'code', level:'junior',
    q:'Реализуйте <code class="i">throttle(fn, ms)</code> (leading edge): первый вызов проходит сразу, следующие игнорируются, пока не пройдёт <code class="i">ms</code>.',
    starter:`function throttle(fn, ms) {
    // ваш код
  }`,
    exports:['throttle'],
    tests:[
      {name:'первый вызов проходит сразу', fn:async m=>{ let n=0; const t=m.throttle(()=>n++,50); t(); eq(n,1) }},
      {name:'вызовы внутри окна игнорируются', fn:async m=>{ let n=0; const t=m.throttle(()=>n++,50); t();t();t();t(); eq(n,1) }},
      {name:'после окна снова пропускает', fn:async m=>{ let n=0; const t=m.throttle(()=>n++,30); t(); await sleep(50); t(); eq(n,2) }},
      {name:'передаёт аргументы', fn:async m=>{ let got; const t=m.throttle(v=>got=v,20); t('x'); eq(got,'x') }},
    ],
    solution:`function throttle(fn, ms) {
    let last = 0
    return function (...args) {
      const now = Date.now()
      if (now - last >= ms) {
        last = now
        return fn.apply(this, args)
      }
    }
  }
  
  /* Вариант через флаг + таймер (эквивалентен, но не зависит от часов):
  function throttle(fn, ms) {
    let blocked = false
    return function (...args) {
      if (blocked) return
      blocked = true
      setTimeout(() => { blocked = false }, ms)
      return fn.apply(this, args)
    }
  } */`,
    answer:`<h5>Нюансы</h5>
  <ul>
  <li>Реализация «на времени» (<code class="i">Date.now()</code>) не создаёт таймеров — дешевле, но чувствительна к переводу часов. Реализация «на флаге» не зависит от часов, но плодит таймеры.</li>
  <li>Этот вариант — <b>только leading</b>: последнее событие в серии теряется. Для скролла это часто некритично, для «сохранить позицию скролла» — критично, там нужен trailing.</li>
  <li>Полный throttle (leading + trailing) = сохранить последние аргументы и вызвать их по истечении окна. Умейте описать словами.</li>
  </ul>
  <div class="hint">Для скролла/ресайза в реальном проекте лучше <code class="i">requestAnimationFrame</code>-throttle: вызов максимум раз на кадр, синхронно с отрисовкой.</div>` },
  { id:'js-deepclone', topic:'JavaScript', type:'code', level:'middle',
    q:'Реализуйте <code class="i">deepClone(value)</code>: вложенные объекты/массивы, Date, Map/Set и <b>циклические ссылки</b>. Без <code class="i">structuredClone</code>.',
    starter:`function deepClone(value, seen = new WeakMap()) {
    // ваш код
  }`,
    exports:['deepClone'],
    tests:[
      {name:'примитивы возвращаются как есть', fn:m=>{ eq(m.deepClone(5),5); eq(m.deepClone('s'),'s'); eq(m.deepClone(null),null); eq(m.deepClone(undefined),undefined) }},
      {name:'глубокая копия объекта', fn:m=>{ const s={a:{b:{c:1}}}; const c=m.deepClone(s); c.a.b.c=2; eq(s.a.b.c,1,'оригинал не должен меняться'); ok(c.a !== s.a,'вложенный объект должен быть новым') }},
      {name:'массивы', fn:m=>{ const s=[1,[2,[3]]]; const c=m.deepClone(s); ok(Array.isArray(c)); ok(c[1] !== s[1]); deepEq(c,s) }},
      {name:'Date копируется как Date', fn:m=>{ const d=new Date(1700000000000); const c=m.deepClone({d}); ok(c.d instanceof Date,'должен остаться Date'); eq(c.d.getTime(), d.getTime()); ok(c.d !== d) }},
      {name:'Map и Set', fn:m=>{ const s={m:new Map([['k',{v:1}]]), s:new Set([1,2])}; const c=m.deepClone(s); ok(c.m instanceof Map); ok(c.s instanceof Set); eq(c.m.get('k').v,1); ok(c.m.get('k') !== s.m.get('k'),'значения Map тоже клонируются') }},
      {name:'циклическая ссылка не уходит в бесконечность', fn:m=>{ const a={n:1}; a.self=a; a.arr=[a]; const c=m.deepClone(a); eq(c.n,1); ok(c.self === c,'ссылка должна указывать на клон'); ok(c.arr[0] === c) }},
    ],
    approach:`<ol>
  <li><b>Начните с базового случая.</b> Примитивы и функции возвращаются как есть — копировать нечего.</li>
  <li><b>Подумайте про циклы ДО написания рекурсии.</b> Объект <code class="i">a.self = a</code> уведёт наивное решение в бесконечность. Нужна карта «оригинал → клон».</li>
  <li><b>Берите WeakMap, а не Map.</b> Она не удерживает объекты от сборки мусора.</li>
  <li><b>Ключевой момент — порядок:</b> записывайте клон в карту <b>до</b> обхода потомков. Иначе к моменту, когда рекурсия вернётся к циклической ссылке, записи ещё не будет.</li>
  <li><b>Разберите спецтипы отдельно:</b> <code class="i">Date</code> (по времени), <code class="i">RegExp</code>, <code class="i">Map</code> и <code class="i">Set</code> — у них нет обычных ключей, и обход по ключам даст пустой объект.</li>
  <li><b>Сохраните прототип:</b> <code class="i">Object.create(Object.getPrototypeOf(value))</code>, иначе экземпляр класса превратится в обычный объект.</li>
  <li><b>Скажите про альтернативы:</b> <code class="i">structuredClone</code> умеет почти всё это нативно, а <code class="i">JSON.parse(JSON.stringify())</code> ломается на циклах, Date, Map, undefined и функциях.</li>
  </ol>`,
    solution:`function deepClone(value, seen = new WeakMap()) {
    // примитивы и функции — возвращаем как есть
    if (value === null || typeof value !== 'object') return value
  
    // уже клонировали этот объект — вернём тот же клон (обрабатывает циклы)
    if (seen.has(value)) return seen.get(value)
  
    if (value instanceof Date) return new Date(value.getTime())
    if (value instanceof RegExp) return new RegExp(value.source, value.flags)
  
    if (value instanceof Map) {
      const out = new Map(); seen.set(value, out)
      for (const [k, v] of value) out.set(deepClone(k, seen), deepClone(v, seen))
      return out
    }
    if (value instanceof Set) {
      const out = new Set(); seen.set(value, out)
      for (const v of value) out.add(deepClone(v, seen))
      return out
    }
  
    const out = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value))
    seen.set(value, out)                       // регистрируем ДО обхода детей
    for (const key of Reflect.ownKeys(value)) out[key] = deepClone(value[key], seen)
    return out
  }`,
    answer:`<h5>Главная идея</h5>
  <p><code class="i">WeakMap</code> «оригинал → клон» и запись в него <b>до</b> обхода потомков. Иначе на <code class="i">a.self = a</code> рекурсия уйдёт в бесконечность. WeakMap (а не Map), чтобы не держать ссылки и не мешать сборщику мусора.</p>
  <h5>Почему не JSON.parse(JSON.stringify(x))</h5>
  <ul>
  <li>Падает на циклах (<code class="i">TypeError: Converting circular structure</code>).</li>
  <li>Теряет <code class="i">undefined</code>, функции, <code class="i">Symbol</code>; <code class="i">Date</code> превращается в строку; <code class="i">Map</code>/<code class="i">Set</code> → <code class="i">{}</code>; <code class="i">NaN</code>/<code class="i">Infinity</code> → <code class="i">null</code>; <code class="i">BigInt</code> бросает ошибку.</li>
  <li>Медленно на больших структурах.</li>
  </ul>
  <h5>Что есть из коробки</h5>
  <p><code class="i">structuredClone(obj)</code> — нативный, поддерживает циклы, Date, Map, Set, ArrayBuffer, Blob. <b>Не копирует функции, DOM-ноды, прототипы классов</b> (объект станет plain). Доступен в браузерах и Node 17+.</p>
  <div class="hint">Shallow vs deep: <code class="i">{...obj}</code>, <code class="i">Object.assign</code>, <code class="i">arr.slice()</code> — поверхностные, вложенные объекты остаются общими по ссылке. Именно поэтому в Redux без Immer приходилось разворачивать спреды на каждом уровне.</div>` },
  { id:'js-eventemitter', topic:'JavaScript', type:'code', level:'middle',
    q:'Реализуйте <code class="i">createEmitter()</code>: <code class="i">on(ev, fn)</code>, <code class="i">off(ev, fn)</code>, <code class="i">once(ev, fn)</code>, <code class="i">emit(ev, ...args)</code>. <code class="i">on</code> возвращает функцию-отписку.',
    starter:`function createEmitter() {
    // ваш код
  }`,
    exports:['createEmitter'],
    tests:[
      {name:'on + emit с аргументами', fn:m=>{ const e=m.createEmitter(); let got; e.on('x',(a,b)=>got=a+b); e.emit('x',1,2); eq(got,3) }},
      {name:'несколько подписчиков, порядок сохраняется', fn:m=>{ const e=m.createEmitter(); const log=[]; e.on('x',()=>log.push(1)); e.on('x',()=>log.push(2)); e.emit('x'); deepEq(log,[1,2]) }},
      {name:'off отписывает', fn:m=>{ const e=m.createEmitter(); let n=0; const f=()=>n++; e.on('x',f); e.off('x',f); e.emit('x'); eq(n,0) }},
      {name:'on возвращает функцию отписки', fn:m=>{ const e=m.createEmitter(); let n=0; const un=e.on('x',()=>n++); un(); e.emit('x'); eq(n,0) }},
      {name:'once срабатывает ровно один раз', fn:m=>{ const e=m.createEmitter(); let n=0; e.once('x',()=>n++); e.emit('x'); e.emit('x'); e.emit('x'); eq(n,1) }},
      {name:'emit несуществующего события не падает', fn:m=>{ const e=m.createEmitter(); e.emit('nope', 1) }},
      {name:'отписка внутри обработчика: текущий emit идёт по снимку (как в Node)', fn:m=>{ const e=m.createEmitter(); const log=[]; const a=()=>{ log.push('a'); e.off('x',b) }; const b=()=>log.push('b'); e.on('x',a); e.on('x',b); e.emit('x'); deepEq(log,['a','b'],'в текущем emit b ещё вызывается — итерация идёт по копии'); e.emit('x'); deepEq(log,['a','b','a'],'а вот в следующем emit b уже не должен вызваться') }},
    ],
    approach:`<ol>
  <li><b>Выберите структуру:</b> <code class="i">Map&lt;событие, Set&lt;обработчик&gt;&gt;</code>. Set даёт O(1) удаление и защиту от дублей, Map — произвольные имена событий.</li>
  <li><b>on возвращает функцию отписки</b> — это современное соглашение (так же устроены подписки в React и RxJS). Удобнее, чем помнить ссылку для off.</li>
  <li><b>once реализуйте через обёртку:</b> внутри обёртки сначала отписываемся, потом вызываем оригинал. Важно: отписываться нужно <b>по обёртке</b>, а не по исходной функции.</li>
  <li><b>Главная ловушка — мутация во время итерации.</b> Обработчик может отписаться или подписаться прямо в момент emit. Итерируйте по <b>копии</b>: <code class="i">[...set]</code>.</li>
  <li><b>Поймите следствие копии:</b> обработчик, отписанный во время emit, в этом круге <b>всё равно вызовется</b> — emit идёт по снимку. В Node работает точно так же. Не вызовется он уже со следующего emit.</li>
  <li><b>Удаляйте пустые Set</b> — иначе они копятся и это утечка.</li>
  <li><b>emit несуществующего события не должен падать</b> — проверьте наличие перед итерацией.</li>
  </ol>`,
    solution:`function createEmitter() {
    const map = new Map()   // event -> Set<handler>
  
    function on(ev, fn) {
      if (!map.has(ev)) map.set(ev, new Set())
      map.get(ev).add(fn)
      return () => off(ev, fn)
    }
  
    function off(ev, fn) {
      const set = map.get(ev)
      if (!set) return
      set.delete(fn)
      if (set.size === 0) map.delete(ev)   // не копим пустые Set
    }
  
    function once(ev, fn) {
      const wrapper = (...args) => { off(ev, wrapper); fn(...args) }
      return on(ev, wrapper)
    }
  
    function emit(ev, ...args) {
      const set = map.get(ev)
      if (!set) return false
      // копия: обработчик может отписаться/подписаться прямо во время emit
      for (const fn of [...set]) fn(...args)
      return true
    }
  
    return { on, off, once, emit }
  }`,
    answer:`<h5>Что здесь проверяют</h5>
  <ul>
  <li><b>Копия перед итерацией</b> (<code class="i">[...set]</code>) — самый частый баг: без неё мутация коллекции во время обхода даёт непредсказуемое поведение (в массиве — пропуск соседнего элемента). Важно понимать следствие: <b>текущий <code class="i">emit</code> идёт по снимку</b>, поэтому обработчик, отписанный прямо во время эмита, в этом круге всё равно вызовется — и в Node это работает ровно так же. Не вызовется он уже со следующего <code class="i">emit</code>.</li>
  <li><b>once через обёртку</b>: отписываться надо по <i>обёртке</i>, а не по исходной функции, поэтому <code class="i">off(ev, wrapper)</code> внутри самой обёртки.</li>
  <li><b>Set вместо массива</b>: O(1) удаление и защита от дублей (правда, поведение при двойной подписке стоит уточнить у интервьюера).</li>
  <li><b>Утечки памяти</b>: если не удалять пустые Set и не отписываться при размонтировании — классический memory leak. В React отписка идёт в cleanup <code class="i">useEffect</code>.</li>
  </ul>
  <div class="hint">Где встречается в реальном коде: <code class="i">EventEmitter</code> в Node, <code class="i">@nestjs/event-emitter</code>, socket.io-клиент, шина событий между несвязанными модулями фронта.</div>` },
  { id:'js-lru', topic:'JavaScript', type:'code', level:'senior',
    q:'Реализуйте LRU-кеш: <code class="i">createLRU(capacity)</code> с <code class="i">get(k)</code> и <code class="i">set(k,v)</code>. При переполнении вытесняется <b>давно не используемый</b> элемент. Обращение через get делает элемент «свежим».',
    starter:`function createLRU(capacity) {
    // ваш код
  }`,
    exports:['createLRU'],
    tests:[
      {name:'get/set работают', fn:m=>{ const c=m.createLRU(2); c.set('a',1); eq(c.get('a'),1) }},
      {name:'отсутствующий ключ → undefined', fn:m=>{ const c=m.createLRU(2); eq(c.get('nope'), undefined) }},
      {name:'вытесняет самый старый', fn:m=>{ const c=m.createLRU(2); c.set('a',1); c.set('b',2); c.set('c',3); eq(c.get('a'),undefined,'a должен быть вытеснен'); eq(c.get('b'),2); eq(c.get('c'),3) }},
      {name:'get обновляет свежесть', fn:m=>{ const c=m.createLRU(2); c.set('a',1); c.set('b',2); c.get('a'); c.set('c',3); eq(c.get('a'),1,'a использовали — он должен выжить'); eq(c.get('b'),undefined,'b должен быть вытеснен') }},
      {name:'повторный set обновляет значение и свежесть', fn:m=>{ const c=m.createLRU(2); c.set('a',1); c.set('b',2); c.set('a',10); c.set('c',3); eq(c.get('a'),10); eq(c.get('b'),undefined) }},
      {name:'размер не превышает capacity', fn:m=>{ const c=m.createLRU(3); for(let i=0;i<10;i++) c.set('k'+i,i); let alive=0; for(let i=0;i<10;i++) if(c.get('k'+i)!==undefined) alive++; eq(alive,3) }},
    ],
    approach:`<ol>
  <li><b>Вспомните каноническое решение</b> из алгоритмических задач: двусвязный список (O(1) на перемещение и удаление с хвоста) плюс хеш-таблица (O(1) на поиск ноды).</li>
  <li><b>Заметьте, что в JS это уже есть.</b> <code class="i">Map</code> сохраняет <b>порядок вставки</b> — то есть готовый «список свежести»: первый ключ самый старый, последний самый свежий.</li>
  <li><b>Отсюда трюк «переместить в конец»:</b> <code class="i">map.delete(key)</code> + <code class="i">map.set(key, value)</code>. Это и есть обновление свежести за O(1).</li>
  <li><b>get обязан обновлять свежесть</b> — иначе это не LRU, а просто очередь по времени вставки. Тест на это есть.</li>
  <li><b>set по существующему ключу тоже обновляет свежесть</b> — не забудьте про delete перед set.</li>
  <li><b>Вытеснение:</b> самый старый ключ — <code class="i">map.keys().next().value</code>, первый элемент итератора.</li>
  <li><b>Скажите вслух, что понимаете сложность:</b> решение через Map — это тот же список плюс хеш-таблица, просто список уже реализован внутри движка.</li>
  </ol>`,
    solution:`function createLRU(capacity) {
    // Map в JS сохраняет порядок вставки — это и есть готовый «список свежести»:
    // первый ключ = самый старый, последний = самый свежий.
    const map = new Map()
  
    function get(key) {
      if (!map.has(key)) return undefined
      const value = map.get(key)
      map.delete(key)          // удалить + вставить = переместить в конец
      map.set(key, value)
      return value
    }
  
    function set(key, value) {
      if (map.has(key)) map.delete(key)
      map.set(key, value)
      if (map.size > capacity) {
        const oldest = map.keys().next().value   // первый ключ итератора
        map.delete(oldest)
      }
    }
  
    return { get, set, get size() { return map.size } }
  }`,
    answer:`<h5>Почему Map, а не объект</h5>
  <p><code class="i">Map</code> гарантирует <b>порядок вставки</b> и даёт O(1) на delete/set, плюс ключом может быть что угодно. У обычного объекта целочисленные ключи всплывают наверх — порядок ломается.</p>
  <h5>«Каноническое» решение из алгоритмических собесов</h5>
  <p>Двусвязный список (для O(1) перемещения и удаления с хвоста) + HashMap (для O(1) поиска ноды). Решение через Map — это ровно то же самое, просто список уже реализован внутри движка. Скажите об этом вслух — покажете, что понимаете сложность, а не просто знаете трюк.</p>
  <h5>Где применяется в вашем стеке</h5>
  <ul>
  <li>In-memory кеш в NestJS-сервисе перед походом в БД (или <code class="i">cache-manager</code> с Redis-стором).</li>
  <li>TanStack Query держит кеш по queryKey и выкидывает неиспользуемые через <code class="i">gcTime</code> — идея та же.</li>
  <li>Redis: политика вытеснения <code class="i">allkeys-lru</code> / <code class="i">volatile-lru</code> в <code class="i">maxmemory-policy</code>.</li>
  </ul>` },
  { id:'js-memoize', topic:'JavaScript', type:'code', level:'middle',
    q:'Реализуйте <code class="i">memoize(fn, keyFn)</code>: кешировать результат по ключу (по умолчанию — JSON аргументов), не вызывать <code class="i">fn</code> повторно для тех же аргументов.',
    starter:`function memoize(fn, keyFn = (...args) => JSON.stringify(args)) {
    // ваш код
  }`,
    exports:['memoize'],
    tests:[
      {name:'возвращает правильный результат', fn:m=>{ const f=m.memoize((a,b)=>a+b); eq(f(2,3),5) }},
      {name:'не вызывает функцию дважды для тех же аргументов', fn:m=>{ let n=0; const f=m.memoize(a=>{n++; return a*2}); f(5);f(5);f(5); eq(n,1,'вызовов исходной функции') }},
      {name:'разные аргументы → разные вызовы', fn:m=>{ let n=0; const f=m.memoize(a=>{n++; return a}); f(1);f(2);f(1); eq(n,2) }},
      {name:'кеширует undefined-результат', fn:m=>{ let n=0; const f=m.memoize(()=>{n++; return undefined}); f();f(); eq(n,1,'undefined — валидный результат, его тоже надо кешировать') }},
      {name:'кастомный keyFn', fn:m=>{ let n=0; const f=m.memoize(u=>{n++; return u.name}, u=>u.id); eq(f({id:1,name:'a'}),'a'); eq(f({id:1,name:'b'}),'a','ключ тот же → старый результат'); eq(n,1) }},
    ],
    solution:`function memoize(fn, keyFn = (...args) => JSON.stringify(args)) {
    const cache = new Map()
  
    return function (...args) {
      const key = keyFn(...args)
      // has, а не cache.get(key) !== undefined — иначе undefined-результат
      // будет пересчитываться каждый раз
      if (cache.has(key)) return cache.get(key)
  
      const result = fn.apply(this, args)
      cache.set(key, result)
      return result
    }
  }`,
    answer:`<h5>Ловушки, которые тут проверяют</h5>
  <ul>
  <li><code class="i">cache.has(key)</code> вместо проверки на <code class="i">undefined</code> — иначе функция, легально возвращающая <code class="i">undefined</code>/<code class="i">null</code>, никогда не закешируется.</li>
  <li><b>JSON.stringify как ключ ненадёжен</b>: порядок ключей объекта влияет на строку (<code class="i">{a,b}</code> ≠ <code class="i">{b,a}</code>), функции и undefined теряются, циклы бросают ошибку.</li>
  <li><b>Неограниченный рост</b> — это утечка памяти. В проде нужен лимит (LRU) или TTL.</li>
  <li>Для одного объектного аргумента идеален <code class="i">WeakMap</code>: ключ-объект не удерживается от сборки мусора.</li>
  <li>Мемоизировать можно только <b>чистые</b> функции. Функция с побочными эффектами или зависящая от времени/внешнего состояния сломается.</li>
  </ul>
  <div class="hint">Прямая параллель: <code class="i">useMemo</code>/<code class="i">React.memo</code> — та же идея, но кеш на <b>один</b> последний результат; <code class="i">createSelector</code> из reselect — тоже, но в v5 по умолчанию weakMapMemoize с кешем на несколько записей.</div>` },
  { id:'js-proto', topic:'JavaScript', type:'theory', level:'middle',
    q:'Как работает прототипное наследование? Разница <code class="i">__proto__</code> и <code class="i">prototype</code>. Что делает <code class="i">new</code> под капотом?',
    answer:`<h5>Две разные сущности</h5>
  <ul>
  <li><code class="i">obj.__proto__</code> (правильно: <code class="i">Object.getPrototypeOf(obj)</code>) — <b>ссылка на прототип самого объекта</b>. Есть у всех объектов.</li>
  <li><code class="i">Fn.prototype</code> — <b>свойство функции-конструктора</b>. Это объект, который станет <code class="i">__proto__</code> у инстансов, созданных через <code class="i">new Fn()</code>.</li>
  </ul>
  <pre class="code">function Dog(){}
  const d = new Dog()
  d.__proto__ === Dog.prototype      // true
  Dog.prototype.constructor === Dog  // true
  d.__proto__.__proto__ === Object.prototype  // цепочка идёт вверх
  Object.prototype.__proto__ === null         // конец цепочки</pre>
  <h5>Поиск свойства</h5>
  <p>Движок ищет свойство в самом объекте; не нашёл — идёт по <code class="i">__proto__</code> вверх до <code class="i">null</code>. Отсюда: методы живут в прототипе (одна копия на все инстансы), а поля — в инстансе.</p>
  <h5>Что делает <code class="i">new Fn(args)</code></h5>
  <ol>
  <li>Создаёт пустой объект <code class="i">obj = {}</code>.</li>
  <li>Ставит <code class="i">obj.__proto__ = Fn.prototype</code>.</li>
  <li>Вызывает <code class="i">Fn.apply(obj, args)</code>.</li>
  <li>Возвращает <code class="i">obj</code>, <b>если конструктор не вернул свой объект</b> (возврат примитива игнорируется).</li>
  </ol>
  <h5>class — синтаксический сахар?</h5>
  <p>В основном да: методы класса кладутся в <code class="i">prototype</code>, <code class="i">extends</code> настраивает цепочку. Но есть реальные отличия: класс нельзя вызвать без <code class="i">new</code>, тело класса всегда в strict mode, объявление класса не всплывает (TDZ), приватные поля <code class="i">#x</code> невозможно повторить функциями, а <code class="i">super</code> работает через <code class="i">[[HomeObject]]</code>.</p>
  <div class="hint">Практический хвост вопроса: «почему <code class="i">instanceof</code> ломается между разными реалмами (iframe, разные копии пакета в node_modules)?» — потому что он сравнивает <b>ссылку</b> на prototype, а у второй копии библиотеки объект прототипа другой.</div>` },
  { id:'js-keys', topic:'JavaScript', type:'output', level:'middle',
    q:'Что выведет? Про приведение ключей объекта.',
    code:`const o = {}
  o[1] = 'a'
  o['1'] = 'b'
  o[true] = 'c'
  console.log(Object.keys(o))
  console.log(o[1])
  const m = new Map()
  m.set(1, 'a').set('1', 'b')
  console.log(m.size)`,
    expected:"[ '1', 'true' ]\nb\n2",
    answer:`<h5>Разбор</h5>
  <ul>
  <li>Ключи обычного объекта — <b>всегда строки</b> (или Symbol). <code class="i">o[1]</code> и <code class="i">o['1']</code> — один и тот же ключ, второе присваивание перезаписало первое.</li>
  <li><code class="i">o[true]</code> превращается в строку <code class="i">'true'</code>.</li>
  <li><code class="i">Map</code> сравнивает ключи по <code class="i">SameValueZero</code> — <code class="i">1</code> и <code class="i">'1'</code> разные, размер 2.</li>
  </ul>
  <h5>Порядок ключей в объекте (спрашивают!)</h5>
  <ol>
  <li>Целочисленные индексы — по возрастанию (<code class="i">'1'</code> раньше <code class="i">'true'</code> независимо от порядка вставки).</li>
  <li>Строковые ключи — в порядке вставки.</li>
  <li>Symbol-ключи — в порядке вставки.</li>
  </ol>
  <h5>Когда брать Map вместо объекта</h5>
  <ul>
  <li>Ключи не строки (объекты, числа), нужен гарантированный порядок вставки, часто добавляем/удаляем, нужен <code class="i">.size</code>.</li>
  <li>Объект — когда нужна сериализация в JSON и работа с записями как со структурой.</li>
  </ul>
  <div class="trap">Формат ответа в тесте — как печатает Node (<code class="i">[ '1', 'true' ]</code>). Проверка нормализует пробелы и кавычки, так что <code class="i">["1","true"]</code> тоже засчитается.</div>` },
  { id:'js-eq', topic:'JavaScript', type:'theory', level:'junior',
    q:'<code class="i">==</code> vs <code class="i">===</code> vs <code class="i">Object.is</code>. Что такое truthy/falsy и приведение типов?',
    answer:`<h5>Три сравнения</h5>
  <ul>
  <li><code class="i">===</code> — строгое: типы должны совпадать. Исключения: <code class="i">NaN !== NaN</code>, <code class="i">+0 === -0</code>.</li>
  <li><code class="i">==</code> — с приведением типов по алгоритму спецификации.</li>
  <li><code class="i">Object.is</code> — как <code class="i">===</code>, но <code class="i">Object.is(NaN, NaN) === true</code> и <code class="i">Object.is(0, -0) === false</code>. Именно его использует React для сравнения состояния и зависимостей хуков.</li>
  </ul>
  <h5>Правила <code class="i">==</code>, которые надо помнить</h5>
  <ul>
  <li><code class="i">null == undefined</code> → <b>true</b>, но <code class="i">null == 0</code> → false, <code class="i">null == false</code> → false. null/undefined не равны ничему другому.</li>
  <li>число и строка → строка приводится к числу: <code class="i">'2' == 2</code> → true.</li>
  <li>boolean всегда сначала к числу: <code class="i">'' == false</code> → true, <code class="i">'0' == false</code> → true.</li>
  <li>объект и примитив → объект через <code class="i">valueOf</code>/<code class="i">toString</code>: <code class="i">[] == false</code> → true (<code class="i">[]</code> → <code class="i">''</code> → <code class="i">0</code>).</li>
  <li><code class="i">NaN == NaN</code> → false.</li>
  </ul>
  <h5>8 falsy-значений — весь список</h5>
  <p><code class="i">false</code>, <code class="i">0</code>, <code class="i">-0</code>, <code class="i">0n</code>, <code class="i">''</code>, <code class="i">null</code>, <code class="i">undefined</code>, <code class="i">NaN</code>. Всё остальное truthy — включая <code class="i">[]</code>, <code class="i">{}</code>, <code class="i">'0'</code>, <code class="i">'false'</code>, <code class="i">function(){}</code>.</p>
  <h5>Практический вывод</h5>
  <p>Всегда <code class="i">===</code>. Единственное оправданное исключение — <code class="i">x == null</code> как краткая проверка «null или undefined».</p>
  <div class="trap">Рабочая ловушка: <code class="i">if (count)</code> сломается при <code class="i">count === 0</code>, <code class="i">if (name)</code> — при пустой строке. Отсюда <code class="i">??</code> (nullish coalescing) вместо <code class="i">||</code>: <code class="i">limit ?? 20</code> не съест переданный 0, а <code class="i">limit || 20</code> съест.</div>` },
  { id:'js-gen', topic:'JavaScript', type:'theory', level:'middle',
    q:'Итераторы и генераторы: как работает <code class="i">for...of</code>, что такое итерируемый объект? Где это реально применяют?',
    code:`function* range(from, to, step = 1) {
    for (let i = from; i < to; i += step) yield i
  }
  console.log([...range(0, 5)])   // [0,1,2,3,4]
  
  const obj = {
    from: 1, to: 3,
    *[Symbol.iterator]() { for (let i = this.from; i <= this.to; i++) yield i }
  }
  console.log([...obj])           // [1,2,3]`,
    answer:`<h5>Протокол итерации</h5>
  <ul>
  <li><b>Iterable</b> — объект с методом <code class="i">[Symbol.iterator]()</code>, который возвращает итератор.</li>
  <li><b>Iterator</b> — объект с методом <code class="i">next()</code>, возвращающим <code class="i">{ value, done }</code>.</li>
  <li><code class="i">for...of</code>, спред <code class="i">[...x]</code>, деструктуризация, <code class="i">Array.from</code>, <code class="i">Promise.all</code> — все работают через этот протокол.</li>
  </ul>
  <h5>Генераторы</h5>
  <ul>
  <li><code class="i">function*</code> возвращает объект, который одновременно iterable и iterator.</li>
  <li><code class="i">yield</code> <b>приостанавливает</b> функцию и отдаёт значение; состояние (локальные переменные, позиция) сохраняется до следующего <code class="i">next()</code>.</li>
  <li>Значение можно передать <b>обратно</b>: <code class="i">const x = yield 1</code> получит аргумент следующего <code class="i">next(val)</code>. На этом построен redux-saga.</li>
  <li><b>Ленивость</b>: бесконечная последовательность занимает O(1) памяти, значения считаются по требованию.</li>
  </ul>
  <h5>for...in vs for...of — классический вопрос</h5>
  <table>
  <tr><th>for...in</th><th>for...of</th></tr>
  <tr><td>перебирает <b>ключи</b> (строки)</td><td>перебирает <b>значения</b></td></tr>
  <tr><td>идёт по цепочке прототипов (нужен hasOwnProperty)</td><td>только собственные элементы</td></tr>
  <tr><td>для объектов</td><td>для iterable: Array, String, Map, Set, NodeList, arguments</td></tr>
  <tr><td>порядок для массива не гарантирован спецификацией</td><td>порядок гарантирован</td></tr>
  </table>
  <h5>Где встречается в реальной работе</h5>
  <ul>
  <li><code class="i">for await (const chunk of stream)</code> — чтение потоков в Node (загрузка файлов, S3/MinIO).</li>
  <li>Постраничный обход API: генератор отдаёт записи, сам подтягивая следующую страницу.</li>
  <li>redux-saga целиком построена на генераторах.</li>
  </ul>` },
  { id:'js-weak', topic:'JavaScript', type:'theory', level:'senior',
    q:'Как работает сборщик мусора в JS? Что такое WeakMap/WeakSet и какие бывают утечки памяти в вебе?',
    answer:`<h5>Сборка мусора</h5>
  <p>Алгоритм — <b>mark and sweep</b>: от корней (глобальный объект, стек вызовов, замыкания в живых функциях) движок обходит все достижимые объекты и помечает их; всё непомеченное освобождается. Ключевое слово — <b>достижимость</b>, а не счётчик ссылок (поэтому циклические ссылки сами по себе не текут).</p>
  <p>V8 использует поколенческий GC: молодые объекты в new space (частая быстрая чистка через Scavenger), выжившие переезжают в old space (более редкий mark-compact).</p>
  <h5>WeakMap / WeakSet</h5>
  <ul>
  <li>Держат ключи <b>слабо</b>: если на объект-ключ больше никто не ссылается, запись удаляется автоматически.</li>
  <li>Только объекты в качестве ключей, нет <code class="i">size</code>, нельзя итерировать (иначе GC был бы наблюдаемым).</li>
  <li>Применение: приватные данные объекта, кеш метаданных, пометки «этот узел уже обработан» (как в deepClone выше).</li>
  </ul>
  <h5>Типовые утечки на фронте</h5>
  <ul>
  <li><b>Не снятые подписки</b>: addEventListener, socket.on, setInterval, ResizeObserver без отписки в cleanup <code class="i">useEffect</code>.</li>
  <li><b>Замыкание на большой объект</b>: колбэк живёт в таймере/подписке и держит весь скоуп.</li>
  <li><b>Ссылки на удалённые DOM-узлы</b> в массиве/Map — detached DOM.</li>
  <li><b>Бесконечно растущий кеш</b> (memoize без лимита), логи в глобальном массиве.</li>
  </ul>
  <h5>На бэке (Nest)</h5>
  <ul>
  <li>Синглтон-сервис накапливает состояние в <code class="i">Map</code> на каждый запрос.</li>
  <li>Не закрытые соединения/стримы, глобальные подписки на event emitter без remove.</li>
  <li>Диагностика: heap snapshot в Chrome DevTools (три снимка, сравнение), <code class="i">node --inspect</code>, метрики <code class="i">process.memoryUsage()</code>, в проде — алерт на растущий RSS.</li>
  </ul>` },
  { id:'js-chain', topic:'JavaScript', type:'output', level:'junior',
    q:'Что выведет цепочка промисов?',
    code:`Promise.resolve(1)
    .then(v => { console.log(v); return v + 1 })
    .then(v => { console.log(v); throw new Error('boom') })
    .then(v => console.log('skip', v))
    .catch(e => { console.log('catch', e.message); return 'ok' })
    .then(v => console.log('after', v))
    .finally(() => console.log('finally'))`,
    expected:'1\n2\ncatch boom\nafter ok\nfinally',
    answer:`<h5>Правила цепочки</h5>
  <ul>
  <li>Каждый <code class="i">.then</code> возвращает <b>новый промис</b>; значение из колбэка становится результатом следующего звена.</li>
  <li>Брошенная ошибка «проваливается» вниз мимо всех <code class="i">.then</code> до первого <code class="i">.catch</code> — поэтому <code class="i">'skip'</code> не печатается.</li>
  <li><code class="i">.catch</code> «лечит» цепочку: если из него вернуть значение, дальше идёт <b>успешная</b> ветка (<code class="i">after ok</code>).</li>
  <li><code class="i">.finally</code> выполняется всегда и <b>прозрачен</b>: не меняет значение и не глотает ошибку (если только сам не бросит).</li>
  </ul>
  <h5>Частые ловушки</h5>
  <ul>
  <li><code class="i">.then(fn)</code> vs <code class="i">.then(fn())</code> — второе вызывает функцию сразу и передаёт её результат.</li>
  <li>Забыть <code class="i">return</code> внутри <code class="i">.then</code> → следующее звено получит <code class="i">undefined</code> и не дождётся вложенного промиса.</li>
  <li><code class="i">.catch(...).then(...)</code> ≠ <code class="i">.then(onOk, onErr)</code>: второй аргумент <code class="i">then</code> <b>не ловит</b> ошибку, брошенную в первом аргументе того же then.</li>
  <li>Промис без <code class="i">catch</code> → <code class="i">unhandledRejection</code>. В Node это крешит процесс (с Node 15+), в браузере — ошибка в консоли.</li>
  </ul>` },
  { id:'js-seq', topic:'JavaScript', type:'theory', level:'middle',
    q:'В чём разница между последовательным <code class="i">await</code> в цикле и <code class="i">Promise.all</code>? Когда какой вариант правильный?',
    code:`// Вариант A — последовательно: 3 запроса по 200мс = 600мс
  for (const id of ids) {
    results.push(await api.get(id))
  }
  
  // Вариант B — параллельно: 200мс
  const results = await Promise.all(ids.map(id => api.get(id)))
  
  // Вариант C — а это ловушка, работает ли?
  const results = []
  ids.forEach(async id => { results.push(await api.get(id)) })
  console.log(results)   // []`,
    answer:`<h5>Разбор</h5>
  <ul>
  <li><b>A</b> — суммарное время = сумма всех задержек. Оправдан, когда запросы зависят друг от друга, нужен порядок записи в БД, или когда нельзя долбить API параллельно.</li>
  <li><b>B</b> — время = самый долгий запрос. Дефолт для независимых запросов. Минус: N одновременных соединений и <b>всё падает от одной ошибки</b> → если нужны частичные результаты, берите <code class="i">Promise.allSettled</code>.</li>
  <li><b>C</b> — классическая ловушка. <code class="i">forEach</code> не умеет ждать async-колбэки: он их просто запустит и пойдёт дальше, <code class="i">results</code> на момент <code class="i">console.log</code> пуст. То же верно для <code class="i">map</code> без <code class="i">Promise.all</code>, <code class="i">filter</code>, <code class="i">reduce</code> без аккуратности.</li>
  </ul>
  <h5>Важная деталь про Promise.all</h5>
  <p>Промисы стартуют <b>в момент создания</b>, а не в момент <code class="i">await</code>. Поэтому это тоже параллельно:</p>
  <pre class="code">const p1 = api.a()   // запрос ушёл
  const p2 = api.b()   // и этот тоже
  const a = await p1
  const b = await p2</pre>
  <h5>Золотая середина</h5>
  <p>Для больших списков — ограничение параллельности (p-limit / пул воркеров): 500 одновременных запросов положат и ваш сервер, и чужой API (и упрутся в лимит соединений браузера — 6 на домен для HTTP/1.1).</p>
  <div class="hint">На собесе почти всегда просят «оптимизируй» кусок кода с последовательными await — узнавайте этот паттерн сразу.</div>` },
  { id:'js-modules', topic:'JavaScript', type:'theory', level:'middle',
    q:'ESM vs CommonJS: в чём разница? Почему в ваших проектах клиент <code class="i">"type":"module"</code>, а сервер <code class="i">"type":"commonjs"</code>?',
    answer:`<h5>Сравнение</h5>
  <table>
  <tr><th></th><th>CommonJS (require)</th><th>ESM (import)</th></tr>
  <tr><td>Момент разрешения</td><td>в рантайме, динамически</td><td>статически, на этапе парсинга</td></tr>
  <tr><td>Загрузка</td><td>синхронная</td><td>асинхронная</td></tr>
  <tr><td>Экспорт</td><td>копия значения (снимок)</td><td>живая привязка (live binding)</td></tr>
  <tr><td>Tree-shaking</td><td>практически невозможен</td><td>да — импорты статически анализируемы</td></tr>
  <tr><td>Top-level await</td><td>нет</td><td>да</td></tr>
  <tr><td>Циклические зависимости</td><td>частично инициализированный объект</td><td>hoisting объявлений, TDZ на значения</td></tr>
  </table>
  <h5>Почему на сервере CJS</h5>
  <p>NestJS + TypeORM опираются на декораторы и <code class="i">reflect-metadata</code>, а экосистема исторически собирается в CommonJS (<code class="i">nest build</code> по умолчанию даёт CJS). Это упрощает интероп со старыми пакетами и работу <code class="i">tsconfig-paths</code>. На клиенте Vite нужен ESM — иначе нет tree-shaking и нативных модулей в dev-режиме.</p>
  <h5>Что спрашивают дальше</h5>
  <ul>
  <li>Из ESM можно <code class="i">import</code> CJS-пакет (получите default), из CJS ESM-пакет — только через динамический <code class="i">await import()</code>.</li>
  <li>В ESM нет <code class="i">__dirname</code>/<code class="i">require</code> — используют <code class="i">import.meta.url</code> + <code class="i">fileURLToPath</code>.</li>
  <li><code class="i">import()</code> возвращает промис — это и есть механизм code splitting и <code class="i">React.lazy</code>.</li>
  </ul>` },
  { id:'js-compose', topic:'JavaScript', type:'code', level:'middle',
    q:'Реализуйте <code class="i">pipe(...fns)</code> и <code class="i">compose(...fns)</code>, а также <code class="i">curry(fn)</code>.',
    starter:`function pipe(...fns) {
    // pipe(a,b,c)(x) === c(b(a(x)))
  }
  
  function compose(...fns) {
    // compose(a,b,c)(x) === a(b(c(x)))
  }
  
  function curry(fn) {
    // curry(f)(1)(2)(3) === curry(f)(1,2)(3) === f(1,2,3)
  }`,
    exports:['pipe','compose','curry'],
    tests:[
      {name:'pipe применяет слева направо', fn:m=>{ const f=m.pipe(x=>x+1, x=>x*2); eq(f(3),8) }},
      {name:'compose применяет справа налево', fn:m=>{ const f=m.compose(x=>x+1, x=>x*2); eq(f(3),7) }},
      {name:'pipe без функций — тождество', fn:m=>{ eq(m.pipe()(5),5) }},
      {name:'pipe со строками', fn:m=>{ const f=m.pipe(s=>s.trim(), s=>s.toLowerCase(), s=>s.replace(/\s+/g,'-')); eq(f('  Привет Мир '),'привет-мир') }},
      {name:'curry по одному аргументу', fn:m=>{ const add=(a,b,c)=>a+b+c; eq(m.curry(add)(1)(2)(3),6) }},
      {name:'curry группами', fn:m=>{ const add=(a,b,c)=>a+b+c; eq(m.curry(add)(1,2)(3),6); eq(m.curry(add)(1)(2,3),6) }},
      {name:'curry всеми сразу', fn:m=>{ const add=(a,b,c)=>a+b+c; eq(m.curry(add)(1,2,3),6) }},
      {name:'curry переиспользуем', fn:m=>{ const add=(a,b,c)=>a+b+c; const c=m.curry(add); const a1=c(1); eq(a1(2,3),6); eq(a1(10,20),31,'частично применённая функция не должна накапливать состояние') }},
    ],
    solution:`function pipe(...fns) {
    return x => fns.reduce((acc, fn) => fn(acc), x)
  }
  
  function compose(...fns) {
    return x => fns.reduceRight((acc, fn) => fn(acc), x)
  }
  
  function curry(fn) {
    return function curried(...args) {
      // аргументов достаточно — вызываем
      if (args.length >= fn.length) return fn.apply(this, args)
  
      // иначе возвращаем функцию, ждущую остальные.
      // [...args, ...next] создаёт НОВЫЙ массив — поэтому частично
      // применённую функцию можно переиспользовать многократно
      return (...next) => curried.apply(this, [...args, ...next])
    }
  }`,
    answer:`<h5>pipe vs compose</h5>
  <p>Одно и то же, но в разном порядке. <code class="i">pipe</code> читается естественнее (сверху вниз, как конвейер) и чаще используется в JS; <code class="i">compose</code> пришёл из математики (<code class="i">f(g(x))</code>) и привычен в функциональных библиотеках. Отличие в реализации — одна буква: <code class="i">reduce</code> против <code class="i">reduceRight</code>.</p>
  <p>Знакомое место: <code class="i">applyMiddleware</code> в Redux построен на <code class="i">compose</code>, а <code class="i">pipe</code> из RxJS — та же идея для потоков (и именно он используется в интерцепторах Nest).</p>
  <h5>Ключ к curry — <code class="i">fn.length</code></h5>
  <p>Это <b>арность</b> функции: количество объявленных параметров. Именно по ней мы понимаем, хватает ли аргументов. Важно: параметры с дефолтными значениями и rest-параметры в <code class="i">length</code> <b>не считаются</b> — <code class="i">((a, b = 1) =&gt; {}).length === 1</code>. Поэтому каррировать функции с дефолтами нельзя, и об этом стоит сказать вслух.</p>
  <h5>Тест №8 — самая частая ошибка</h5>
  <p>Если накапливать аргументы мутацией общего массива (<code class="i">args.push(...next)</code>), частично применённая функция «запомнит» аргументы прошлого вызова: <code class="i">a1(2,3)</code> сработает, а следующий <code class="i">a1(10,20)</code> даст мусор. Спред создаёт новый массив и решает проблему.</p>` },
  { id:'js-observer', topic:'JavaScript', type:'theory', level:'middle',
    q:'Расскажите про делегирование событий, всплытие и погружение. Как остановить событие и в чём разница <code class="i">stopPropagation</code> и <code class="i">preventDefault</code>?',
    code:`// Делегирование: один обработчик вместо тысячи
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-id]')
    if (!btn || !list.contains(btn)) return
    remove(btn.dataset.id)
  })`,
    answer:`<h5>Три фазы события</h5>
  <ol>
  <li><b>Погружение (capturing)</b> — от <code class="i">window</code> вниз к цели.</li>
  <li><b>Цель (target)</b>.</li>
  <li><b>Всплытие (bubbling)</b> — от цели вверх к <code class="i">window</code>.</li>
  </ol>
  <p>По умолчанию обработчик срабатывает на всплытии. Чтобы поймать на погружении: <code class="i">addEventListener(type, fn, { capture: true })</code>.</p>
  <p>Не всплывают: <code class="i">focus</code>/<code class="i">blur</code> (но всплывают их аналоги <code class="i">focusin</code>/<code class="i">focusout</code>), <code class="i">load</code>, <code class="i">mouseenter</code>/<code class="i">mouseleave</code> (в отличие от <code class="i">mouseover</code>/<code class="i">mouseout</code>).</p>
  <h5>Делегирование</h5>
  <p>Вешаем один обработчик на контейнер и определяем реальную цель через <code class="i">e.target.closest(...)</code>. Выгода: один слушатель вместо тысячи (меньше памяти), <b>работает для элементов, добавленных позже</b>, не нужно снимать обработчики при удалении элементов.</p>
  <p><code class="i">e.target</code> — где событие произошло. <code class="i">e.currentTarget</code> — где висит обработчик. Путать их — классическая ошибка.</p>
  <h5>stopPropagation vs preventDefault</h5>
  <table>
  <tr><th><code class="i">e.preventDefault()</code></th><th><code class="i">e.stopPropagation()</code></th></tr>
  <tr><td>отменяет <b>действие браузера по умолчанию</b>: переход по ссылке, отправку формы, контекстное меню</td><td>останавливает <b>дальнейшее распространение</b> по дереву</td></tr>
  <tr><td>событие продолжает всплывать</td><td>действие по умолчанию всё равно произойдёт</td></tr>
  </table>
  <p><code class="i">stopImmediatePropagation()</code> — дополнительно не даст сработать другим обработчикам <b>на этом же элементе</b>.</p>
  <div class="trap"><code class="i">stopPropagation</code> — часто вредная привычка: он ломает делегирование и аналитику где-то выше по дереву, а причину такого бага ищут часами. Прежде чем звать его, подумайте, нельзя ли проверить условие в самом обработчике.</div>
  <h5>Специфика React</h5>
  <ul>
  <li>React использует <b>синтетические события</b> — единый слушатель на корне приложения (с 17-й версии на контейнере <code class="i">root</code>, а не на <code class="i">document</code>).</li>
  <li>Поэтому смешивать <code class="i">e.stopPropagation()</code> React-события и нативные слушатели на <code class="i">document</code> опасно: нативный сработает раньше, чем React-обработчик. Отсюда баг «клик вне блока закрывает дропдаун сразу после открытия».</li>
  <li><code class="i">onChange</code> в React ведёт себя как нативный <code class="i">input</code> (срабатывает на каждый символ), а не как нативный <code class="i">change</code>.</li>
  </ul>` },
]
