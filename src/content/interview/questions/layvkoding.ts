/* eslint-disable */
// @ts-nocheck — тела тестов портированы из JS; ассерты приходят из окружения воркера
import type { Question } from '@/engine/types'

/** Лайвкодинг — 4 вопрос(ов) */
export const layvkodingQuestions: Question[] = [
  { id:'alg-tree', topic:'Лайвкодинг', type:'code', level:'middle',
    q:'Превратите плоский список в дерево: <code class="i">buildTree(items)</code>, где у каждого элемента есть <code class="i">id</code> и <code class="i">parentId</code> (<code class="i">null</code> у корней). Одна из самых частых задач на фронтенд-собесе — меню, категории, комментарии.',
    starter:`function buildTree(items) {
    // вернуть массив корней, у каждого узла — поле children
  }`,
    exports:['buildTree'],
    tests:[
      {name:'плоский список без вложенности', fn:m=>{ const r=m.buildTree([{id:1,parentId:null},{id:2,parentId:null}]); eq(r.length,2); deepEq(r[0].children,[]) }},
      {name:'два уровня', fn:m=>{ const r=m.buildTree([{id:1,parentId:null},{id:2,parentId:1},{id:3,parentId:1}]); eq(r.length,1); eq(r[0].children.length,2); eq(r[0].children[0].id,2) }},
      {name:'три уровня', fn:m=>{ const r=m.buildTree([{id:1,parentId:null},{id:2,parentId:1},{id:3,parentId:2}]); eq(r[0].children[0].children[0].id,3) }},
      {name:'родитель идёт ПОСЛЕ ребёнка в массиве', fn:m=>{ const r=m.buildTree([{id:3,parentId:2},{id:2,parentId:1},{id:1,parentId:null}]); eq(r.length,1); eq(r[0].id,1); eq(r[0].children[0].children[0].id,3) }},
      {name:'сохраняет остальные поля', fn:m=>{ const r=m.buildTree([{id:1,parentId:null,name:'root',extra:42}]); eq(r[0].name,'root'); eq(r[0].extra,42) }},
      {name:'пустой массив', fn:m=>{ deepEq(m.buildTree([]),[]) }},
      {name:'порядок братьев сохраняется', fn:m=>{ const r=m.buildTree([{id:1,parentId:null},{id:5,parentId:1},{id:4,parentId:1},{id:9,parentId:1}]); deepEq(r[0].children.map(c=>c.id),[5,4,9]) }},
    ],
    approach:`<ol>
  <li><b>Не бросайтесь в рекурсию.</b> Наивное решение — для каждого узла фильтровать весь массив в поисках детей. Это O(n²): на 10 000 категориях уже заметно.</li>
  <li><b>Поймите главное ограничение:</b> родитель может встретиться в массиве <b>позже</b> ребёнка. Значит, решение «в один проход со связыванием на лету» сломается — и тест это проверит.</li>
  <li><b>Отсюда два прохода.</b> Первый: создать все узлы и положить в <code class="i">Map</code> по id. Второй: связать — теперь любой родитель гарантированно уже существует.</li>
  <li><b>Не мутируйте вход.</b> Копируйте через <code class="i">{ ...item, children: [] }</code>. Дописывание <code class="i">children</code> прямо в объекты из пропсов — источник трудноуловимых багов в React.</li>
  <li><b>Решите, что делать с «сиротами»</b> — узлами, чей parentId указывает на несуществующий элемент. Молча терять их нельзя: либо в корни, либо в лог.</li>
  <li><b>Назовите сложность:</b> O(n) по времени и памяти против O(n²) у наивного варианта.</li>
  </ol>`,
    solution:`function buildTree(items) {
    const byId = new Map()
    const roots = []
  
    // Проход 1: создаём узлы. Копируем, чтобы не мутировать входные данные.
    for (const item of items) {
      byId.set(item.id, { ...item, children: [] })
    }
  
    // Проход 2: связываем. Оба прохода нужны, потому что родитель
    // может встретиться в массиве ПОЗЖЕ ребёнка.
    for (const item of items) {
      const node = byId.get(item.id)
      const parent = item.parentId == null ? null : byId.get(item.parentId)
  
      if (parent) parent.children.push(node)
      else roots.push(node)     // корень или «сирота» с несуществующим родителем
    }
  
    return roots
  }
  // Сложность: O(n) по времени и памяти.
  // Наивное решение с рекурсивным filter по массиву — O(n²).`,
    answer:`<h5>Что оценивают</h5>
  <ul>
  <li><b>Два прохода и Map</b> вместо рекурсивного <code class="i">filter</code>. Это разница между O(n) и O(n²) — на 10 000 категориях заметно.</li>
  <li><b>Порядок элементов не важен</b> — тест №4 специально даёт ребёнка раньше родителя. Решение «в один проход» на этом падает.</li>
  <li><b>Не мутировать вход</b> (<code class="i">{ ...item }</code>): дописывание <code class="i">children</code> прямо в объекты из props — источник багов в React.</li>
  <li>Обработка «сирот»: ссылка на несуществующего родителя не должна терять узел молча — в проде это либо корень, либо лог-предупреждение.</li>
  </ul>
  <h5>Частые продолжения задачи</h5>
  <pre class="code">// Обратная операция — дерево в плоский список
  function flattenTree(nodes, depth = 0) {
    return nodes.flatMap(({ children = [], ...node }) =&gt; [
      { ...node, depth },
      ...flattenTree(children, depth + 1),
    ])
  }
  
  // Путь до узла (хлебные крошки)
  function findPath(nodes, targetId, path = []) {
    for (const node of nodes) {
      const next = [...path, node.id]
      if (node.id === targetId) return next
      const found = findPath(node.children ?? [], targetId, next)
      if (found) return found
    }
    return null
  }</pre>
  <div class="hint">Про глубокую рекурсию: на деревьях в тысячи уровней возможен stack overflow — тогда обход делают итеративно через явный стек (<code class="i">while (stack.length)</code>). Упомянуть это — плюс.</div>` },
  { id:'alg-deepeq', topic:'Лайвкодинг', type:'code', level:'middle',
    q:'Реализуйте <code class="i">deepEqual(a, b)</code>: примитивы, массивы, вложенные объекты, <code class="i">NaN</code>, <code class="i">Date</code>.',
    starter:`function deepEqual(a, b) {
    // ваш код
  }`,
    exports:['deepEqual'],
    tests:[
      {name:'примитивы', fn:m=>{ ok(m.deepEqual(1,1)); ok(!m.deepEqual(1,'1')); ok(m.deepEqual('a','a')); ok(!m.deepEqual(null,undefined)) }},
      {name:'NaN равен NaN', fn:m=>{ ok(m.deepEqual(NaN,NaN)) }},
      {name:'плоские объекты', fn:m=>{ ok(m.deepEqual({a:1,b:2},{b:2,a:1}),'порядок ключей не важен'); ok(!m.deepEqual({a:1},{a:1,b:2})) }},
      {name:'вложенность', fn:m=>{ ok(m.deepEqual({a:{b:{c:[1,2]}}},{a:{b:{c:[1,2]}}})); ok(!m.deepEqual({a:{b:1}},{a:{b:2}})) }},
      {name:'массивы vs объекты', fn:m=>{ ok(!m.deepEqual([1,2],{0:1,1:2}),'массив и объект не равны'); ok(m.deepEqual([1,[2,[3]]],[1,[2,[3]]])) }},
      {name:'разная длина массива', fn:m=>{ ok(!m.deepEqual([1,2],[1,2,3])) }},
      {name:'Date сравнивается по значению', fn:m=>{ ok(m.deepEqual(new Date(1000),new Date(1000))); ok(!m.deepEqual(new Date(1000),new Date(2000))) }},
      {name:'null не ломает', fn:m=>{ ok(!m.deepEqual(null,{})); ok(!m.deepEqual({},null)); ok(m.deepEqual(null,null)) }},
    ],
    solution:`function deepEqual(a, b) {
    // Object.is покрывает примитивы, ту же ссылку и NaN === NaN
    if (Object.is(a, b)) return true
  
    // дальше сравнивать можно только два объекта
    if (typeof a !== 'object' || a === null ||
        typeof b !== 'object' || b === null) return false
  
    // разные «виды» объектов не равны
    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false
  
    if (a instanceof Date) return a.getTime() === b.getTime()
    if (a instanceof RegExp) return a.source === b.source && a.flags === b.flags
  
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false
      return a.every((v, i) => deepEqual(v, b[i]))
    }
  
    const ka = Object.keys(a)
    const kb = Object.keys(b)
    if (ka.length !== kb.length) return false
  
    return ka.every(k =>
      Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]),
    )
  }`,
    answer:`<h5>Порядок проверок — это и есть решение</h5>
  <ol>
  <li><code class="i">Object.is</code> первым: закрывает примитивы, <code class="i">NaN</code> и случай одной ссылки (быстрый выход).</li>
  <li>Отсев не-объектов и <code class="i">null</code> (<code class="i">typeof null === 'object'</code> — вечная ловушка).</li>
  <li>Сравнение прототипов: иначе <code class="i">[1,2]</code> и <code class="i">{0:1,1:2}</code> окажутся «равны».</li>
  <li>Спецтипы (Date, RegExp) — у них ключей нет, по ключам они всегда «равны».</li>
  <li>Рекурсия по ключам с проверкой количества.</li>
  </ol>
  <h5>Что упомянуть вслух</h5>
  <ul>
  <li><b>Циклические ссылки</b> — эта версия зациклится. Лечится как в deepClone: <code class="i">WeakMap</code>/<code class="i">Set</code> посещённых пар.</li>
  <li><code class="i">Map</code>, <code class="i">Set</code>, <code class="i">TypedArray</code> — нужны отдельные ветки.</li>
  <li>Глубокое сравнение — <b>дорогая операция</b>. В React его почти никогда не используют для мемоизации: дешевле держать иммутабельные данные и сравнивать ссылки.</li>
  <li>В проде: <code class="i">lodash.isEqual</code>, <code class="i">fast-deep-equal</code>, <code class="i">node:util.isDeepStrictEqual</code>.</li>
  </ul>` },
  { id:'alg-groupby', topic:'Лайвкодинг', type:'code', level:'junior',
    q:'Реализуйте три утилиты: <code class="i">groupBy(arr, fn)</code>, <code class="i">chunk(arr, size)</code>, <code class="i">uniqBy(arr, fn)</code>.',
    starter:`function groupBy(arr, fn) {
    // { [ключ]: элементы[] }
  }
  
  function chunk(arr, size) {
    // [[1,2],[3,4],[5]]
  }
  
  function uniqBy(arr, fn) {
    // оставить первый элемент для каждого ключа
  }`,
    exports:['groupBy','chunk','uniqBy'],
    tests:[
      {name:'groupBy по полю', fn:m=>{ const d=[{t:'a',v:1},{t:'b',v:2},{t:'a',v:3}]; deepEq(m.groupBy(d,x=>x.t),{a:[{t:'a',v:1},{t:'a',v:3}],b:[{t:'b',v:2}]}) }},
      {name:'groupBy по вычисляемому ключу', fn:m=>{ deepEq(m.groupBy([1,2,3,4,5],n=>n%2?'odd':'even'),{odd:[1,3,5],even:[2,4]}) }},
      {name:'groupBy пустого массива', fn:m=>{ deepEq(m.groupBy([],x=>x),{}) }},
      {name:'chunk делит ровно', fn:m=>{ deepEq(m.chunk([1,2,3,4],2),[[1,2],[3,4]]) }},
      {name:'chunk с остатком', fn:m=>{ deepEq(m.chunk([1,2,3,4,5],2),[[1,2],[3,4],[5]]) }},
      {name:'chunk size больше длины', fn:m=>{ deepEq(m.chunk([1,2],10),[[1,2]]); deepEq(m.chunk([],3),[]) }},
      {name:'uniqBy оставляет первый', fn:m=>{ const d=[{id:1,n:'a'},{id:2,n:'b'},{id:1,n:'c'}]; deepEq(m.uniqBy(d,x=>x.id),[{id:1,n:'a'},{id:2,n:'b'}]) }},
      {name:'uniqBy по значению', fn:m=>{ deepEq(m.uniqBy([1,2,2,3,1],x=>x),[1,2,3]) }},
    ],
    solution:`function groupBy(arr, fn) {
    return arr.reduce((acc, item) => {
      const key = fn(item)
      // Object.create(null) или ?? [] — чтобы не наткнуться на ключи прототипа
      ;(acc[key] ??= []).push(item)
      return acc
    }, {})
  }
  
  function chunk(arr, size) {
    if (size <= 0) return []
    const out = []
    for (let i = 0; i < arr.length; i += size) {
      out.push(arr.slice(i, i + size))
    }
    return out
  }
  
  function uniqBy(arr, fn) {
    const seen = new Set()
    return arr.filter(item => {
      const key = fn(item)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }`,
    answer:`<h5>Мелочи, которые отличают уверенный ответ</h5>
  <ul>
  <li><code class="i">(acc[key] ??= []).push(item)</code> — компактно и без лишней проверки. Классический вариант: <code class="i">if (!acc[key]) acc[key] = []</code>.</li>
  <li><code class="i">uniqBy</code> через <code class="i">Set</code> — O(n). Вариант с <code class="i">findIndex</code> внутри <code class="i">filter</code> даёт O(n²): на собесе про это спросят обязательно.</li>
  <li><code class="i">chunk</code> с <code class="i">slice</code> не мутирует исходный массив (в отличие от <code class="i">splice</code>) — важная разница, которую тоже любят проверять.</li>
  <li>Граничные случаи: пустой массив, <code class="i">size &lt;= 0</code>, ключ <code class="i">'constructor'</code> или <code class="i">'__proto__'</code> (отсюда совет про <code class="i">Object.create(null)</code>).</li>
  </ul>
  <h5>Что есть нативного</h5>
  <ul>
  <li><code class="i">Object.groupBy(arr, fn)</code> и <code class="i">Map.groupBy</code> — уже в браузерах и Node 21+.</li>
  <li><code class="i">Array.prototype.flat(depth)</code> / <code class="i">flatMap</code> — вместо самописного flatten.</li>
  <li><code class="i">[...new Set(arr)]</code> — уникальные примитивы в одну строку.</li>
  <li><code class="i">structuredClone</code> — глубокая копия.</li>
  </ul>
  <div class="hint">Разница <code class="i">slice</code> / <code class="i">splice</code> — отдельный мини-вопрос: <code class="i">slice</code> возвращает копию и не трогает оригинал, <code class="i">splice</code> мутирует и возвращает удалённое. Иммутабельные аналоги для мутирующих методов: <code class="i">toSorted</code>, <code class="i">toReversed</code>, <code class="i">toSpliced</code>, <code class="i">with</code> — очень удобны в Redux/React.</div>` },
  { id:'alg-query', topic:'Лайвкодинг', type:'code', level:'junior',
    q:'Реализуйте <code class="i">parseQuery(str)</code> и <code class="i">stringifyQuery(obj)</code> без <code class="i">URLSearchParams</code>. Учтите массивы и кодирование.',
    starter:`function parseQuery(str) {
    // '?a=1&b=x%20y&c=1&c=2' => { a: '1', b: 'x y', c: ['1','2'] }
  }
  
  function stringifyQuery(obj) {
    // { a: 1, b: 'x y', c: [1,2] } => 'a=1&b=x%20y&c=1&c=2'
    // undefined и null пропускаем
  }`,
    exports:['parseQuery','stringifyQuery'],
    tests:[
      {name:'простой парсинг', fn:m=>{ deepEq(m.parseQuery('a=1&b=2'),{a:'1',b:'2'}) }},
      {name:'ведущий ? отбрасывается', fn:m=>{ deepEq(m.parseQuery('?a=1'),{a:'1'}) }},
      {name:'декодирование', fn:m=>{ deepEq(m.parseQuery('b=x%20y&c=%D0%B0'),{b:'x y',c:'а'}) }},
      {name:'повторяющийся ключ → массив', fn:m=>{ deepEq(m.parseQuery('c=1&c=2&c=3'),{c:['1','2','3']}) }},
      {name:'пустая строка', fn:m=>{ deepEq(m.parseQuery(''),{}); deepEq(m.parseQuery('?'),{}) }},
      {name:'ключ без значения', fn:m=>{ deepEq(m.parseQuery('flag&a=1'),{flag:'',a:'1'}) }},
      {name:'сериализация', fn:m=>{ eq(m.stringifyQuery({a:1,b:'x y'}),'a=1&b=x%20y') }},
      {name:'массив разворачивается', fn:m=>{ eq(m.stringifyQuery({c:[1,2]}),'c=1&c=2') }},
      {name:'null и undefined пропускаются', fn:m=>{ eq(m.stringifyQuery({a:1,b:null,c:undefined,d:2}),'a=1&d=2') }},
    ],
    solution:`function parseQuery(str) {
    const out = {}
    const clean = str.replace(/^\\?/, '')
    if (!clean) return out
  
    for (const pair of clean.split('&')) {
      if (!pair) continue
      const idx = pair.indexOf('=')                 // не split('='): значение может содержать '='
      const rawKey = idx === -1 ? pair : pair.slice(0, idx)
      const rawVal = idx === -1 ? ''  : pair.slice(idx + 1)
  
      const key = decodeURIComponent(rawKey)
      const val = decodeURIComponent(rawVal.replace(/\\+/g, ' '))  // + это пробел
  
      if (key in out) {
        out[key] = Array.isArray(out[key]) ? [...out[key], val] : [out[key], val]
      } else {
        out[key] = val
      }
    }
    return out
  }
  
  function stringifyQuery(obj) {
    const parts = []
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined || value === null) continue
  
      const k = encodeURIComponent(key)
      if (Array.isArray(value)) {
        for (const v of value) parts.push(\`\${k}=\${encodeURIComponent(v)}\`)
      } else {
        parts.push(\`\${k}=\${encodeURIComponent(value)}\`)
      }
    }
    return parts.join('&')
  }`,
    answer:`<h5>Тонкости, которые проверяют</h5>
  <ul>
  <li><b><code class="i">indexOf('=')</code>, а не <code class="i">split('=')</code></b>: значение вполне может содержать <code class="i">=</code> (например, base64-курсор).</li>
  <li><b><code class="i">+</code> означает пробел</b> в <code class="i">application/x-www-form-urlencoded</code>, и <code class="i">decodeURIComponent</code> сам его не разворачивает.</li>
  <li><b><code class="i">encodeURIComponent</code>, а не <code class="i">encodeURI</code></b>: первый экранирует <code class="i">&amp;</code>, <code class="i">=</code>, <code class="i">?</code>, <code class="i">/</code> — именно то, что нужно для значения параметра. <code class="i">encodeURI</code> предназначен для URL целиком и их не трогает.</li>
  <li>Повторяющийся ключ — легальная ситуация (<code class="i">?tag=a&amp;tag=b</code>), и её обязательно надо обработать.</li>
  </ul>
  <h5>В реальном коде</h5>
  <pre class="code">const params = new URLSearchParams(location.search)
  params.get('a')        // первое значение
  params.getAll('c')     // все значения ключа
  params.set('page', 2)
  history.replaceState(null, '', '?' + params)
  
  // В React Router:
  const [searchParams, setSearchParams] = useSearchParams()</pre>
  <div class="hint">Для вложенных структур (<code class="i">filter[status][]=new</code>) единого стандарта нет — используют <code class="i">qs</code> (он, кстати, есть у вас в зависимостях). Обязательно упомяните, что это не часть спецификации, а соглашение.</div>` },
]
