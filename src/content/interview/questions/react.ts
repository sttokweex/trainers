/* eslint-disable */
// @ts-nocheck — тела тестов портированы из JS; ассерты приходят из окружения воркера
import type { Question } from '@/engine/types'

/** React — 16 вопрос(ов) */
export const reactQuestions: Question[] = [
  { id:'re-recon', topic:'React', type:'theory', level:'junior',
    q:'Как работает реконсиляция (Virtual DOM)? Зачем нужен <code class="i">key</code> и почему индекс массива — плохой ключ?',
    code:`// Было: [Аня, Боря]            Стало: [Вова, Аня, Боря]
  {users.map((u, i) => <Row key={i} user={u} />)}     // ❌
  {users.map(u     => <Row key={u.id} user={u} />)}   // ✅`,
    answer:`<h5>Три фазы</h5>
  <ol>
  <li><b>Render</b> — React вызывает компоненты и строит дерево элементов (лёгкие JS-объекты, не DOM). Фаза чистая и прерываемая.</li>
  <li><b>Reconciliation (diff)</b> — сравнение нового дерева со старым.</li>
  <li><b>Commit</b> — применение минимального набора мутаций к реальному DOM. Синхронная, непрерываемая фаза.</li>
  </ol>
  <h5>Эвристики диффа (в них вся суть)</h5>
  <ul>
  <li>Полноценное сравнение деревьев — O(n³). React использует O(n) за счёт двух допущений.</li>
  <li><b>Разный тип элемента → полное пересоздание поддерева.</b> <code class="i">&lt;div&gt;</code> → <code class="i">&lt;span&gt;</code> или <code class="i">Foo</code> → <code class="i">Bar</code> размонтирует всё внутри вместе с состоянием.</li>
  <li><b>Внутри списка сравнение идёт по key.</b> Одинаковый key + одинаковый тип = тот же компонент, React переиспользует его состояние и DOM-узел.</li>
  </ul>
  <h5>Почему индекс ломается</h5>
  <p>Вставили «Вову» в начало — у элемента с <code class="i">key=0</code> теперь другие данные. React считает, что это <b>тот же самый</b> компонент с изменившимися пропсами: DOM-узлы не переставляются, а перезаписываются. Последствия: <b>состояние прилипает не к тому элементу</b> (введённый текст в инпуте, отмеченный чекбокс, фокус), анимации срываются, производительность падает — вместо одной вставки идёт N обновлений.</p>
  <p>Индекс допустим только если список статичен: не переупорядочивается, не фильтруется, элементы не добавляются в середину.</p>
  <div class="hint">Обратный приём: <b>смена key размонтирует компонент принудительно</b>. <code class="i">&lt;Form key={userId} /&gt;</code> — самый чистый способ сбросить состояние формы при смене пользователя (официально рекомендуется в документации React вместо useEffect-сброса).</div>` },
  { id:'re-hooks-rules', topic:'React', type:'theory', level:'middle',
    q:'Почему нельзя вызывать хуки в условиях и циклах? Как React вообще понимает, какой <code class="i">useState</code> какому состоянию соответствует?',
    code:`function Bad({ show }) {
    if (show) {
      const [a, setA] = useState(0)   // ❌ нарушение правил хуков
    }
    const [b, setB] = useState(0)
  }`,
    answer:`<h5>Как устроено внутри</h5>
  <p>У каждого компонента (точнее — у его fiber-узла) есть <b>связный список хуков</b>. При рендере React идёт по нему строго по порядку и сопоставляет вызовы <b>по индексу</b>, а не по имени переменной. Никаких имён он не знает.</p>
  <pre class="code">// Первый рендер: hooks = [state0, state1, effect2]
  // Второй рендер: React ожидает ровно ту же последовательность
  
  // show = true:  useState(a) → индекс 0, useState(b) → индекс 1
  // show = false: useState(b) → индекс 0  ← b читает состояние от a!</pre>
  <p>Порядок сбился — состояния перепутались, а эффекты получают чужие зависимости. Отсюда единственное правило: <b>хуки вызываются безусловно, на верхнем уровне функции компонента или другого хука</b>, всегда в одинаковом количестве и порядке.</p>
  <h5>Как делать правильно</h5>
  <pre class="code">// хук вызван всегда, а условие — внутри
  const [a, setA] = useState(0)
  useEffect(() =&gt; { if (!show) return; /* ... */ }, [show])
  
  // либо вынести ветку в отдельный компонент
  {show &amp;&amp; &lt;WithOwnState /&gt;}</pre>
  <h5>Второе правило</h5>
  <p>Хуки вызываются <b>только из React-функций</b>: компонентов или кастомных хуков (имя начинается с <code class="i">use</code>). Это соглашение — не косметика: по нему работает <code class="i">eslint-plugin-react-hooks</code>, а сам React в dev-режиме проверяет, что вызов происходит внутри рендера (иначе «Invalid hook call» — что также бывает при двух копиях React в node_modules).</p>` },
  { id:'re-effect', topic:'React', type:'theory', level:'middle',
    q:'<code class="i">useEffect</code> vs <code class="i">useLayoutEffect</code>: когда что? Что происходит при пустом массиве зависимостей, без массива, и почему в StrictMode эффект срабатывает дважды?',
    answer:`<h5>Отличие двух эффектов</h5>
  <table>
  <tr><th></th><th>useEffect</th><th>useLayoutEffect</th></tr>
  <tr><td>Когда</td><td><b>после</b> отрисовки, асинхронно</td><td>после мутаций DOM, но <b>до</b> отрисовки, синхронно</td></tr>
  <tr><td>Блокирует кадр</td><td>нет</td><td>да — браузер ждёт</td></tr>
  <tr><td>Для чего</td><td>запросы, подписки, логи, таймеры — 95% случаев</td><td>измерение DOM (<code class="i">getBoundingClientRect</code>), позиционирование тултипа, синхронный скролл — чтобы не было «мигания»</td></tr>
  <tr><td>SSR</td><td>работает</td><td>предупреждение: на сервере DOM нет</td></tr>
  </table>
  <h5>Массив зависимостей</h5>
  <ul>
  <li><code class="i">[]</code> — один раз при монтировании, cleanup при размонтировании.</li>
  <li><code class="i">[a, b]</code> — при изменении любого из значений (сравнение через <code class="i">Object.is</code>, поверхностное).</li>
  <li><b>Нет массива</b> — после каждого рендера. Почти всегда ошибка: в паре с <code class="i">setState</code> внутри даёт бесконечный цикл.</li>
  </ul>
  <h5>Двойной вызов в StrictMode (React 18+, только dev)</h5>
  <p>React намеренно монтирует компонент, размонтирует и монтирует снова: <b>эффект → cleanup → эффект</b>. Это не баг, а детектор: так вылезают эффекты без корректной очистки. Готовит код к будущим фичам, где React сможет сохранять состояние размонтированного компонента (offscreen). В продакшен-сборке этого нет.</p>
  <p><b>Правильная реакция</b> — не убирать StrictMode, а написать cleanup: отписаться, отменить запрос, очистить таймер. Если двойной вызов что-то ломает — значит, в коде реальная проблема.</p>
  <div class="hint">Современный подход: «эффекты не для всего». Не нужны для вычисляемых значений (считайте прямо в рендере или через useMemo), для обработки событий (делайте в обработчике) и для сброса состояния при смене пропса (используйте <code class="i">key</code>). Эффект нужен для <b>синхронизации с внешней системой</b>.</div>` },
  { id:'re-effect-bug', topic:'React', type:'manual', level:'middle',
    q:'Найдите и исправьте <b>три</b> бага в этом компоненте.',
    starter:`function UserProfile({ userId }) {
    const [user, setUser] = useState(null)
    const [tick, setTick] = useState(0)
  
    useEffect(() => {
      fetch('/api/users/' + userId)
        .then(r => r.json())
        .then(setUser)
    }, [])
  
    useEffect(() => {
      setInterval(() => setTick(t => t + 1), 1000)
    }, [])
  
    useEffect(() => {
      window.addEventListener('resize', () => console.log(user))
    }, [user])
  
    return <div>{user?.name} — {tick}</div>
  }`,
    solution:`function UserProfile({ userId }) {
    const [user, setUser] = useState(null)
    const [tick, setTick] = useState(0)
  
    // Баг 1: userId не в зависимостях → при смене пользователя данные не перезапросятся.
    // Плюс race condition: если userId быстро сменится, ответ старого запроса
    // может прийти последним и перетереть новые данные.
    useEffect(() => {
      const ctrl = new AbortController()
      let alive = true
  
      fetch('/api/users/' + userId, { signal: ctrl.signal })
        .then(r => {
          if (!r.ok) throw new Error('HTTP ' + r.status)   // fetch не бросает на 4xx/5xx!
          return r.json()
        })
        .then(data => { if (alive) setUser(data) })
        .catch(e => { if (e.name !== 'AbortError') console.error(e) })
  
      return () => { alive = false; ctrl.abort() }
    }, [userId])
  
    // Баг 2: интервал не очищается → при каждом ремаунте новый таймер,
    // старые тикают вечно и держат замыкание (утечка памяти).
    useEffect(() => {
      const id = setInterval(() => setTick(t => t + 1), 1000)
      return () => clearInterval(id)
    }, [])
  
    // Баг 3: слушатель добавляется на каждое изменение user и никогда не снимается.
    // Обработчик обязан быть той же ссылкой при removeEventListener.
    useEffect(() => {
      const onResize = () => console.log(user)
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }, [user])
  
    return <div>{user?.name} — {tick}</div>
  }`,
    answer:`<h5>Три класса ошибок, которые тут спрятаны</h5>
  <ol>
  <li><b>Неполные зависимости.</b> Эффект использует <code class="i">userId</code>, но не реагирует на него. Именно это ловит правило <code class="i">react-hooks/exhaustive-deps</code> — его нельзя глушить <code class="i">// eslint-disable</code> «чтобы не перерисовывалось», это лечение симптома.</li>
  <li><b>Нет cleanup.</b> Любая подписка, таймер, соединение, запрос обязаны сниматься в возвращаемой функции. В StrictMode это вылезает сразу — двойной интервал.</li>
  <li><b>Race condition.</b> Флаг <code class="i">alive</code> + <code class="i">AbortController</code>. Без этого быстрая смена <code class="i">userId</code> приведёт к тому, что поздний ответ старого запроса перезапишет свежие данные. Классическая гонка, о которой почти всегда спрашивают.</li>
  </ol>
  <h5>Бонусный баг, который тоже стоит назвать</h5>
  <p><code class="i">fetch</code> <b>не реджектится</b> на 404/500 — только на сетевой ошибке. Проверка <code class="i">r.ok</code> обязательна. Плюс нет состояния загрузки и ошибки — в реальном коде всё это решает <code class="i">useQuery</code> из TanStack Query, и это правильный ответ на «как бы вы написали это в проде».</p>` },
  { id:'re-memo', topic:'React', type:'theory', level:'middle',
    q:'Когда реально нужны <code class="i">useMemo</code>, <code class="i">useCallback</code> и <code class="i">React.memo</code>? Почему мемоизация часто не работает?',
    code:`const Child = React.memo(({ onClick, items }) => { /* ... */ })
  
  function Parent() {
    const [count, setCount] = useState(0)
    return (
      <Child
        onClick={() => {}}        // ❌ новая функция каждый рендер
        items={[1, 2, 3]}         // ❌ новый массив каждый рендер
        style={{ color: 'red' }}  // ❌ новый объект каждый рендер
      />
    )
  }`,
    answer:`<h5>Что делает каждый</h5>
  <ul>
  <li><code class="i">React.memo(Comp)</code> — HOC: пропускает ререндер, если пропсы <b>поверхностно</b> равны (<code class="i">Object.is</code> по каждому ключу).</li>
  <li><code class="i">useMemo(fn, deps)</code> — кеширует <b>результат</b> вычисления.</li>
  <li><code class="i">useCallback(fn, deps)</code> — кеширует <b>саму функцию</b>. Это буквально <code class="i">useMemo(() =&gt; fn, deps)</code>.</li>
  </ul>
  <h5>Почему memo «не работает»</h5>
  <p>Объекты, массивы и функции создаются заново при каждом рендере родителя → ссылки разные → поверхностное сравнение всегда false → <code class="i">React.memo</code> бесполезен. <b>Мемоизация компонента работает только если мемоизированы все его нескалярные пропсы.</b> Это цепная реакция: одно немемоизированное значение обнуляет всю оптимизацию ниже.</p>
  <h5>Когда применять по-настоящему</h5>
  <ul>
  <li>Вычисление реально дорогое (сортировка/фильтрация тысяч элементов, тяжёлые расчёты) — <code class="i">useMemo</code>.</li>
  <li>Значение уходит в зависимости <code class="i">useEffect</code> — иначе эффект будет стрелять каждый рендер.</li>
  <li>Проп передаётся в <code class="i">React.memo</code>-компонент или в контекст.</li>
  <li>Компонент тяжёлый и рендерится часто (большой список, график, карта).</li>
  </ul>
  <h5>Когда НЕ надо</h5>
  <p>Обёртывать всё подряд. <code class="i">useMemo</code>/<code class="i">useCallback</code> сами стоят денег: замыкание, массив зависимостей, сравнение, память. Для дешёвого компонента накладные расходы больше выигрыша. Профилируйте (React DevTools Profiler), а не угадывайте.</p>
  <h5>Что изменилось в React 19</h5>
  <p><b>React Compiler</b> автоматически расставляет мемоизацию на этапе сборки, анализируя код. В проектах с ним ручные <code class="i">useMemo</code>/<code class="i">useCallback</code> становятся почти не нужны. Хороший ответ на собесе — упомянуть это, но добавить, что понимать ссылочное равенство всё равно необходимо.</p>
  <div class="trap">Частая ошибка: считать, что <code class="i">useMemo</code> предотвращает ререндер компонента. Нет — он предотвращает только <b>пересчёт значения</b>. Ререндер останавливает <code class="i">React.memo</code>.</div>` },
  { id:'re-batch', topic:'React', type:'theory', level:'middle',
    q:'Сколько раз отрендерится компонент? Что такое автоматический батчинг в React 18?',
    code:`function App() {
    const [a, setA] = useState(0)
    const [b, setB] = useState(0)
    console.log('render')
  
    const onClick = () => {
      setA(x => x + 1)
      setB(x => x + 1)        // сколько рендеров?
    }
  
    const onFetch = async () => {
      await fetch('/api')
      setA(x => x + 1)
      setB(x => x + 1)        // а здесь?
    }
  }`,
    answer:`<h5>Ответ</h5>
  <p>В React 18+ — <b>по одному рендеру в обоих случаях</b>. В React 17 первый случай дал бы 1 рендер, а второй — <b>2</b>.</p>
  <h5>Что такое батчинг</h5>
  <p>React собирает несколько вызовов <code class="i">setState</code> в одно обновление и рендерит один раз. До 18-й версии это работало только внутри React-обработчиков событий (synthetic events). В промисах, <code class="i">setTimeout</code>, нативных слушателях и колбэках батчинга не было.</p>
  <p>React 18 с <code class="i">createRoot</code> включил <b>автоматический батчинг везде</b>. Отказаться точечно можно через <code class="i">flushSync(() =&gt; setA(1))</code> — но это заставляет React рендерить синхронно и убивает выигрыш.</p>
  <h5>Связанный вопрос: почему setState «асинхронный»</h5>
  <pre class="code">const [count, setCount] = useState(0)
  const onClick = () =&gt; {
    setCount(count + 1)
    setCount(count + 1)
    console.log(count)   // 0 — старое значение!
  }
  // итог: count === 1, а не 2</pre>
  <p>Причина: <code class="i">count</code> — это <b>константа внутри конкретного рендера</b> (замыкание). Оба вызова читают одно и то же старое значение. Лечится функциональной формой, которая получает актуальное состояние из очереди:</p>
  <pre class="code">setCount(c =&gt; c + 1)
  setCount(c =&gt; c + 1)   // итог: 2</pre>
  <div class="hint">Правило: если новое состояние зависит от предыдущего — <b>всегда</b> функциональная форма. Это же спасает от stale closure в таймерах и подписках.</div>` },
  { id:'re-context', topic:'React', type:'theory', level:'senior',
    q:'Почему Context вызывает лишние ререндеры и как это чинить? Когда Context, а когда Redux?',
    code:`// Проблема: любой consumer перерисуется при смене ЛЮБОГО поля
  <AppContext.Provider value={{ user, theme, cart, setCart }}>`,
    answer:`<h5>Механика</h5>
  <ul>
  <li>При изменении <code class="i">value</code> у провайдера React перерисовывает <b>все</b> компоненты, вызвавшие <code class="i">useContext</code> этого контекста. Селективной подписки на часть значения <b>нет</b>.</li>
  <li>Сравнение идёт по <code class="i">Object.is</code> на само <code class="i">value</code>. Литерал <code class="i">value={{ a, b }}</code> создаёт новый объект каждый рендер провайдера → все consumer'ы перерисуются, даже если данные не менялись.</li>
  <li><code class="i">React.memo</code> на промежуточных компонентах <b>не спасает</b>: обновление контекста «телепортируется» напрямую к потребителю, мимо дерева пропсов.</li>
  </ul>
  <h5>Как чинить</h5>
  <ol>
  <li><b>Мемоизировать value</b>: <code class="i">useMemo(() =&gt; ({ user, theme }), [user, theme])</code>. Минимум, который надо делать всегда.</li>
  <li><b>Разделить контексты</b>: отдельный для данных и отдельный для функций-сеттеров. Сеттеры стабильны, поэтому компоненты, которым нужен только <code class="i">setCart</code>, перестанут перерисовываться вовсе.</li>
  <li><b>Разделить по частоте изменений</b>: <code class="i">ThemeContext</code> (меняется редко) отдельно от <code class="i">CartContext</code> (часто).</li>
  <li>Если нужна подписка на срез — брать библиотеку (<code class="i">use-context-selector</code>, zustand, Redux). Именно отсутствие селекторов — главное ограничение Context.</li>
  </ol>
  <h5>Context vs Redux — как отвечать</h5>
  <p><b>Context — это не менеджер состояния, а механизм доставки (DI)</b>. Он решает проблему props drilling и всё. Состояние живёт в <code class="i">useState</code>/<code class="i">useReducer</code> рядом.</p>
  <table>
  <tr><th>Context</th><th>Redux Toolkit</th></tr>
  <tr><td>тема, локаль, текущий юзер, DI-объекты</td><td>сложное клиентское состояние, много связей</td></tr>
  <tr><td>меняется редко</td><td>меняется часто, нужны селекторы</td></tr>
  <tr><td>нет devtools и middleware</td><td>time-travel, логи, middleware</td></tr>
  <tr><td>нет мемоизированных селекторов</td><td>reselect из коробки</td></tr>
  </table>
  <div class="hint">Отдельно проговорите: <b>серверные данные вообще не должны лежать ни там, ни там</b>. Для них TanStack Query / RTK Query — кеш, инвалидация, дедупликация и статусы бесплатно.</div>` },
  { id:'re-shallow', topic:'React', type:'code', level:'middle',
    q:'Реализуйте <code class="i">shallowEqual(a, b)</code> — именно такое сравнение использует <code class="i">React.memo</code> и <code class="i">useSelector</code> из react-redux.',
    starter:`function shallowEqual(a, b) {
    // ваш код
  }`,
    exports:['shallowEqual'],
    tests:[
      {name:'одинаковые объекты', fn:m=>{ ok(m.shallowEqual({a:1,b:2},{a:1,b:2})) }},
      {name:'разные значения', fn:m=>{ ok(!m.shallowEqual({a:1},{a:2})) }},
      {name:'разное количество ключей', fn:m=>{ ok(!m.shallowEqual({a:1},{a:1,b:2})); ok(!m.shallowEqual({a:1,b:2},{a:1})) }},
      {name:'сравнение поверхностное — вложенные объекты по ссылке', fn:m=>{ ok(!m.shallowEqual({a:{x:1}},{a:{x:1}}),'разные ссылки → false'); const sh={x:1}; ok(m.shallowEqual({a:sh},{a:sh}),'одна ссылка → true') }},
      {name:'одна и та же ссылка', fn:m=>{ const o={a:1}; ok(m.shallowEqual(o,o)) }},
      {name:'NaN считается равным NaN (Object.is)', fn:m=>{ ok(m.shallowEqual({a:NaN},{a:NaN})) }},
      {name:'+0 и -0 различаются (Object.is)', fn:m=>{ ok(!m.shallowEqual({a:0},{a:-0})) }},
      {name:'null и примитивы не ломают', fn:m=>{ ok(!m.shallowEqual(null,{})); ok(!m.shallowEqual({},null)); ok(m.shallowEqual(null,null)); ok(!m.shallowEqual(1,{})) }},
    ],
    solution:`function shallowEqual(a, b) {
    if (Object.is(a, b)) return true        // та же ссылка или равные примитивы
  
    if (typeof a !== 'object' || a === null ||
        typeof b !== 'object' || b === null) return false
  
    const ka = Object.keys(a)
    const kb = Object.keys(b)
    if (ka.length !== kb.length) return false
  
    for (const key of ka) {
      // hasOwn защищает от случая, когда у b ключ лежит в прототипе
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false
      if (!Object.is(a[key], b[key])) return false
    }
    return true
  }`,
    answer:`<h5>Почему Object.is, а не <code class="i">===</code></h5>
  <p><code class="i">NaN === NaN</code> даёт false — состояние с <code class="i">NaN</code> вызывало бы бесконечные ререндеры. <code class="i">Object.is</code> считает их равными. Обратная сторона: <code class="i">+0</code> и <code class="i">-0</code> он различает. React использует именно <code class="i">Object.is</code> — и для сравнения состояния, и для массива зависимостей хуков.</p>
  <h5>Где это критично на практике</h5>
  <ul>
  <li><code class="i">React.memo</code> без второго аргумента использует ровно такое сравнение пропсов.</li>
  <li><code class="i">useSelector</code> по умолчанию сравнивает результат через <code class="i">===</code>. Если селектор возвращает <b>новый объект/массив</b> (<code class="i">state =&gt; state.items.filter(...)</code>), компонент будет перерисовываться на <b>любое</b> изменение стора. Лечится <code class="i">createSelector</code> или <code class="i">useSelector(fn, shallowEqual)</code>.</li>
  <li>Тот же принцип в зависимостях <code class="i">useEffect</code>: объект в deps = эффект на каждый рендер.</li>
  </ul>` },
  { id:'re-usedebounce', topic:'React', type:'manual', level:'middle',
    q:'Напишите кастомный хук <code class="i">useDebouncedValue(value, delay)</code> и хук <code class="i">useDebouncedCallback</code>. Объясните, почему нельзя просто позвать <code class="i">debounce()</code> в теле компонента.',
    starter:`// Использование:
  // const query = useDebouncedValue(input, 300)
  // useEffect(() => { search(query) }, [query])
  
  function useDebouncedValue(value, delay) {
    // ваш код
  }`,
    solution:`import { useState, useEffect, useRef, useCallback } from 'react'
  
  // 1. Дебаунс значения — самый частый и самый простой вариант
  function useDebouncedValue(value, delay = 300) {
    const [debounced, setDebounced] = useState(value)
  
    useEffect(() => {
      const id = setTimeout(() => setDebounced(value), delay)
      // cleanup срабатывает перед следующим эффектом —
      // это и есть сброс таймера при новом значении
      return () => clearTimeout(id)
    }, [value, delay])
  
    return debounced
  }
  
  // 2. Дебаунс колбэка — со стабильной ссылкой и свежим замыканием
  function useDebouncedCallback(fn, delay = 300) {
    const fnRef = useRef(fn)
    const timerRef = useRef(null)
  
    // держим актуальную функцию в ref, чтобы не пересоздавать debounced
    useEffect(() => { fnRef.current = fn }, [fn])
  
    // размонтировались — гасим висящий таймер
    useEffect(() => () => clearTimeout(timerRef.current), [])
  
    return useCallback((...args) => {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => fnRef.current(...args), delay)
    }, [delay])
  }`,
    answer:`<h5>Почему нельзя <code class="i">const d = debounce(fn, 300)</code> в теле компонента</h5>
  <p>Каждый рендер создаёт <b>новую</b> debounce-функцию с собственным таймером. Старый таймер никто не отменяет — дебаунс перестаёт работать вообще: каждый вызов ждёт свои 300 мс и все срабатывают. Нужен <code class="i">useMemo</code>/<code class="i">useRef</code> + очистка при размонтировании.</p>
  <h5>Приём с ref — важно понимать</h5>
  <p>Если положить <code class="i">fn</code> в зависимости <code class="i">useCallback</code>, debounced-функция будет пересоздаваться при каждом рендере (ведь <code class="i">fn</code> обычно новая). Если не положить — получим <b>stale closure</b>: функция будет видеть состояние на момент создания. Решение: хранить функцию в <code class="i">ref</code> и обновлять его в эффекте. Ссылка стабильна, а вызывается всегда свежая версия. Это паттерн «latest ref» (в будущем — хук <code class="i">useEffectEvent</code>).</p>
  <h5>Что сказать про альтернативу</h5>
  <p>В реальном проекте поиск лучше делать через TanStack Query: дебаунсим только значение инпута, а запрос, кеш, отмену устаревших ответов и состояние загрузки берёт на себя <code class="i">useQuery</code> с <code class="i">queryKey: ['search', debouncedQuery]</code>.</p>` },
  { id:'re-rerender', topic:'React', type:'manual', level:'middle',
    q:'Компонент уходит в бесконечный цикл ререндеров. Найдите причину и исправьте (здесь их две).',
    starter:`function SearchResults({ filters }) {
    const [items, setItems] = useState([])
  
    const params = { ...filters, limit: 20 }
  
    useEffect(() => {
      api.search(params).then(setItems)
    }, [params])
  
    useEffect(() => {
      setItems([])
    })
  
    return <List items={items} />
  }`,
    solution:`function SearchResults({ filters }) {
    const [items, setItems] = useState([])
  
    // Причина 1: params — новый объект на каждом рендере.
    // Object.is(старый, новый) === false → эффект срабатывает →
    // setItems → рендер → новый params → эффект... бесконечно.
    const params = useMemo(
      () => ({ ...filters, limit: 20 }),
      [filters],              // если filters тоже пересоздаётся у родителя —
    )                         // мемоизировать надо и там, либо разложить на примитивы
  
    useEffect(() => {
      let alive = true
      api.search(params).then(r => { if (alive) setItems(r) })
      return () => { alive = false }
    }, [params])
  
    // Причина 2: эффект без массива зависимостей выполняется после КАЖДОГО
    // рендера, а внутри setItems([]) — новый массив → новый рендер → цикл.
    // Такой эффект здесь просто не нужен: сброс делается вместе с запросом.
  
    return <List items={items} />
  }
  
  // Надёжнее — вообще уйти от объекта в зависимостях, разложив на примитивы:
  // useEffect(() => { ... }, [filters.query, filters.category])
  //
  // А в проде это просто:
  // const { data: items = [] } = useQuery({
  //   queryKey: ['search', filters],        // React Query сериализует ключ —
  //   queryFn: () => api.search(filters),   // проблемы ссылочного равенства нет
  // })`,
    answer:`<h5>Чек-лист «почему бесконечный ререндер»</h5>
  <ol>
  <li><b>Объект/массив/функция в зависимостях эффекта</b>, создаваемые в теле компонента. Сравнение по ссылке → эффект каждый раз.</li>
  <li><b>Эффект без массива зависимостей</b>, вызывающий <code class="i">setState</code>.</li>
  <li><b><code class="i">setState</code> прямо в теле рендера</b> (не в обработчике и не в эффекте).</li>
  <li><b>Вызов функции вместо передачи</b>: <code class="i">onClick={handle()}</code> — выполнится при рендере.</li>
  <li><b>setState с новым объектом при тех же данных</b>: <code class="i">setUser({...user})</code> в эффекте, зависящем от <code class="i">user</code>.</li>
  <li><b>Нестабильный контекст</b>: <code class="i">value={{...}}</code> без useMemo у провайдера, который сам часто рендерится.</li>
  </ol>
  <div class="hint">Практический совет для собеса: скажите, что первым делом открыли бы React DevTools Profiler с «Record why each component rendered» — он прямо показывает, какой проп или хук вызвал ререндер. Это ценится выше, чем угадывание.</div>` },
  { id:'re-19', topic:'React', type:'theory', level:'senior',
    q:'Что нового в React 18 и 19? Suspense, <code class="i">useTransition</code>, <code class="i">useDeferredValue</code>, <code class="i">use()</code>, Server Components — что это и зачем.',
    answer:`<h5>React 18: конкурентный рендеринг</h5>
  <ul>
  <li><b>Прерываемый рендер.</b> React может приостановить работу над низкоприоритетным обновлением, обработать срочное (ввод текста) и вернуться. До 18-й версии рендер был синхронным и неостановимым.</li>
  <li><code class="i">useTransition()</code> → <code class="i">[isPending, startTransition]</code>. Помечает обновление как <b>несрочное</b>. Классика: ввод в поиске остаётся мгновенным, а перерисовка тяжёлого списка идёт фоном и может быть прервана.</li>
  <li><code class="i">useDeferredValue(value)</code> — то же самое, но «снаружи»: отдаёт отложенную копию значения. Удобно, когда обновление не вы инициируете.</li>
  <li><b>Автоматический батчинг</b> везде (см. отдельный вопрос).</li>
  <li><code class="i">useId()</code> — стабильные id для a11y, согласованные между сервером и клиентом.</li>
  <li><b>Suspense</b> для данных + потоковый SSR с <code class="i">renderToPipeableStream</code>: страница отдаётся кусками, не дожидаясь всех данных.</li>
  </ul>
  <h5>React 19</h5>
  <ul>
  <li><b><code class="i">use(promise)</code></b> — читает промис или контекст прямо в рендере; в отличие от хуков, <b>можно вызывать условно</b>. Работает в паре с Suspense и Error Boundary.</li>
  <li><b>Actions</b> — асинхронные функции в <code class="i">&lt;form action={fn}&gt;</code>, плюс <code class="i">useActionState</code> и <code class="i">useFormStatus</code>: pending, ошибки и оптимистичные обновления из коробки.</li>
  <li><b><code class="i">useOptimistic</code></b> — показать результат сразу, откатить при ошибке.</li>
  <li><b>ref как обычный проп</b> — <code class="i">forwardRef</code> больше не нужен. Ref-колбэк теперь может возвращать функцию очистки.</li>
  <li><code class="i">&lt;Context&gt;</code> вместо <code class="i">&lt;Context.Provider&gt;</code>; хостинг <code class="i">&lt;title&gt;</code>/<code class="i">&lt;meta&gt;</code>/<code class="i">&lt;link&gt;</code> прямо в компонентах.</li>
  <li><b>React Compiler</b> (отдельный пакет) — авто-мемоизация на этапе сборки.</li>
  </ul>
  <h5>Server Components одной фразой</h5>
  <p>Компоненты, которые выполняются <b>только на сервере</b> и отдают клиенту готовый результат, а не код. Плюсы: нулевой вклад в бандл, прямой доступ к БД, секреты не утекают. Минусы: нет состояния и эффектов, нужен фреймворк (Next.js/Remix). В ваших Vite-SPA их нет — так и скажите, но покажите, что понимаете модель.</p>
  <div class="hint">Главный вопрос «зачем»: конкурентность решает не скорость рендера, а <b>отзывчивость</b> — приоритизацию. Тяжёлый список больше не блокирует ввод.</div>` },
  { id:'re-forms', topic:'React', type:'theory', level:'junior',
    q:'Контролируемые и неконтролируемые компоненты. Зачем <code class="i">useRef</code> и чем он отличается от <code class="i">useState</code>?',
    answer:`<h5>Контролируемый vs неконтролируемый</h5>
  <table>
  <tr><th></th><th>Контролируемый</th><th>Неконтролируемый</th></tr>
  <tr><td>Код</td><td><code class="i">value={v} onChange={...}</code></td><td><code class="i">defaultValue</code> + <code class="i">ref</code></td></tr>
  <tr><td>Источник правды</td><td>React-состояние</td><td>сам DOM</td></tr>
  <tr><td>Ререндер на ввод</td><td>на каждое нажатие</td><td>нет</td></tr>
  <tr><td>Когда</td><td>валидация на лету, зависимые поля, форматирование</td><td>простые формы, файловый инпут, интеграция со сторонними либами</td></tr>
  </table>
  <p>Файловый инпут <code class="i">&lt;input type="file"&gt;</code> <b>всегда</b> неконтролируемый — его значение нельзя задать программно из соображений безопасности.</p>
  <h5>useRef — две разные роли</h5>
  <ol>
  <li><b>Ссылка на DOM-узел</b>: <code class="i">ref={inputRef}</code>, потом <code class="i">inputRef.current.focus()</code>.</li>
  <li><b>Изменяемая «коробка», переживающая рендеры</b>: таймеры, предыдущее значение, флаг «первый рендер», актуальное значение для замыкания.</li>
  </ol>
  <h5>useRef vs useState — главное отличие</h5>
  <p>Изменение <code class="i">ref.current</code> <b>не вызывает ререндер</b> и происходит синхронно. Правило: если значение влияет на то, что видно на экране — <code class="i">useState</code>. Если это «служебные данные» — <code class="i">useRef</code>.</p>
  <div class="trap">Нельзя читать или писать <code class="i">ref.current</code> во время рендера (кроме ленивой инициализации) — это побочный эффект, и с конкурентным рендерингом он даст неконсистентность. Только в обработчиках и эффектах.</div>
  <h5>Про формы в проде</h5>
  <p>У вас в проектах Formik + Yup. Современный дефолт — <b>react-hook-form</b> (неконтролируемый под капотом → минимум ререндеров) + <b>zod</b> через resolver, потому что zod-схему можно переиспользовать и на бэкенде.</p>` },
  { id:'re-boundary', topic:'React', type:'theory', level:'middle',
    q:'Как ловить ошибки в React? Что такое Error Boundary и что он <b>не</b> ловит?',
    code:`class ErrorBoundary extends React.Component {
    state = { error: null }
  
    static getDerivedStateFromError(error) {
      return { error }                 // обновляем state → рендерим фолбэк
    }
  
    componentDidCatch(error, info) {
      Sentry.captureException(error, { extra: info })   // логируем
    }
  
    render() {
      if (this.state.error) return this.props.fallback
      return this.props.children
    }
  }`,
    answer:`<h5>Что такое</h5>
  <p>Компонент, перехватывающий ошибки рендера у <b>всего поддерева ниже себя</b>. Пока делается только классом (хуковой версии нет — используют готовый <code class="i">react-error-boundary</code>).</p>
  <h5>Что НЕ ловит — это и есть суть вопроса</h5>
  <ul>
  <li><b>Ошибки в обработчиках событий</b> (<code class="i">onClick</code>) — они вне рендера, нужен обычный try/catch.</li>
  <li><b>Асинхронный код</b>: <code class="i">setTimeout</code>, промисы, <code class="i">fetch().then()</code>. Отловленную ошибку можно пробросить в boundary через <code class="i">setState(() =&gt; { throw e })</code>.</li>
  <li><b>Ошибки на сервере при SSR</b>.</li>
  <li><b>Ошибки в самом boundary</b> — их поймает только boundary уровнем выше.</li>
  </ul>
  <h5>Практика</h5>
  <ul>
  <li>Ставьте несколько границ разного уровня: глобальную (белый экран → «что-то пошло не так») и локальные вокруг рискованных виджетов, чтобы падение графика не убивало страницу.</li>
  <li>Обязательна кнопка «Попробовать снова» со сбросом состояния (в <code class="i">react-error-boundary</code> — <code class="i">resetErrorBoundary</code>).</li>
  <li>Связка с TanStack Query: <code class="i">throwOnError: true</code> прокидывает ошибки запросов в ближайший boundary — вместе с Suspense получается декларативная обработка загрузки и ошибок.</li>
  <li>В React 19 добавились <code class="i">onUncaughtError</code>/<code class="i">onCaughtError</code> в <code class="i">createRoot</code> для централизованного логирования.</li>
  </ul>
  <div class="hint">Если в проекте есть Sentry/Highlight (а у вас оба), скажите, что boundary — это точка отправки ошибки с контекстом компонента, а не просто заглушка.</div>` },
  { id:'re-perf', topic:'React', type:'theory', level:'senior',
    q:'Как оптимизировать рендер списка на 10 000 элементов? Какие вообще есть приёмы оптимизации React-приложения?',
    answer:`<h5>Список: только виртуализация</h5>
  <p>Рендерить в DOM исключительно видимые элементы (+ небольшой overscan). Библиотеки: <code class="i">@tanstack/react-virtual</code>, <code class="i">react-window</code>, <code class="i">react-virtuoso</code>. 10 000 DOM-узлов — это сотни мегабайт памяти и заваленный layout; никакая мемоизация этого не спасёт.</p>
  <p>Дополнительно: пагинация/бесконечная подгрузка (<code class="i">useInfiniteQuery</code>), <code class="i">content-visibility: auto</code> в CSS для дешёвого отсечения отрисовки.</p>
  <h5>Уровни оптимизации — отвечайте по порядку</h5>
  <ol>
  <li><b>Измерить.</b> React DevTools Profiler (flame chart, «why did this render»), Performance-вкладка, Lighthouse. Без замеров оптимизация — это гадание.</li>
  <li><b>Меньше рендеров.</b> Поднять/опустить состояние (локальное состояние держать как можно ближе к месту использования), разделить контексты, <code class="i">React.memo</code> + стабильные пропсы, композиция через <code class="i">children</code> (переданный children не пересоздаётся при рендере обёртки).</li>
  <li><b>Дешевле каждый рендер.</b> <code class="i">useMemo</code> на тяжёлых вычислениях, не создавать функции/объекты в JSX без нужды.</li>
  <li><b>Меньше кода.</b> Code splitting по роутам: <code class="i">React.lazy</code> + <code class="i">Suspense</code>, динамический <code class="i">import()</code> тяжёлых библиотек (графики, редакторы, tfjs), анализ бандла (<code class="i">rollup-plugin-visualizer</code>).</li>
  <li><b>Приоритеты.</b> <code class="i">useTransition</code>/<code class="i">useDeferredValue</code> для несрочных обновлений.</li>
  <li><b>Сеть.</b> Кеш и дедупликация запросов (React Query), prefetch по наведению, оптимистичные апдейты.</li>
  <li><b>Ассеты.</b> WebP/AVIF, <code class="i">loading="lazy"</code>, размеры у картинок (иначе CLS), preconnect к API.</li>
  </ol>
  <div class="hint">Сильный ответ на собесе звучит так: «сначала профилировал бы — чаще всего проблема не в React, а в одном компоненте, который перерисовывает всё дерево, или в тяжёлом бандле». Это показывает инженерное мышление, а не заученный список.</div>` },
  { id:'react-portal', topic:'React', type:'theory', level:'middle',
    q:'Что такое порталы и зачем они нужны? Как правильно сделать модальное окно?',
    code:`function Modal({ open, onClose, children }) {
    useEffect(() => {
      if (!open) return
      const onKey = (e) => e.key === 'Escape' && onClose()
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'          // блокируем скролл фона
      return () => {
        document.removeEventListener('keydown', onKey)
        document.body.style.overflow = ''
      }
    }, [open, onClose])
  
    if (!open) return null
    return createPortal(
      <div className="overlay" onClick={onClose}>
        <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>,
      document.body,
    )
  }`,
    answer:`<h5>Что делает портал</h5>
  <p><code class="i">createPortal(children, container)</code> рендерит узлы в <b>другое место DOM</b>, но оставляет компонент на прежнем месте <b>React-дерева</b>. Следствия: контекст доступен как обычно, а <b>события всплывают по React-дереву</b>, а не по DOM — то есть клик внутри модалки «долетит» до родителя, который её отрендерил. Это удивляет и про это спрашивают.</p>
  <h5>Зачем</h5>
  <p>Чтобы вырваться из <code class="i">overflow: hidden</code> и из <b>контекста наложения</b> родителя. Если предок имеет <code class="i">transform</code>, <code class="i">filter</code> или <code class="i">opacity &lt; 1</code>, никакой <code class="i">z-index: 9999</code> не поднимет модалку над остальной страницей — она заперта в своём контексте. Портал в <code class="i">body</code> решает это радикально.</p>
  <h5>Чек-лист правильной модалки</h5>
  <ul>
  <li><code class="i">role="dialog"</code> + <code class="i">aria-modal="true"</code> + <code class="i">aria-labelledby</code> на заголовок.</li>
  <li>Закрытие по Esc и по клику на оверлей; <code class="i">stopPropagation</code> на содержимом, чтобы клик внутри не закрывал.</li>
  <li><b>Focus trap</b>: фокус переводится внутрь при открытии, Tab не выходит наружу, при закрытии возвращается на кнопку-открыватель.</li>
  <li>Блокировка прокрутки фона (и учтите компенсацию ширины скроллбара, иначе страница дёргается).</li>
  <li>Фон недоступен для скринридера (<code class="i">aria-hidden</code> на основном контенте или <code class="i">inert</code>).</li>
  </ul>
  <p>Всё это — причина, по которой в проде берут готовое: Radix UI (<code class="i">@radix-ui</code> у вас уже есть), Headless UI или нативный <code class="i">&lt;dialog&gt;</code> с <code class="i">showModal()</code>, который даёт focus trap и backdrop из коробки.</p>
  <div class="hint">Где ещё нужны порталы: тултипы, выпадающие списки, тосты, контекстные меню, drag-preview. Общий признак — элемент должен визуально вырваться за границы родителя.</div>` },
  { id:'react-router', topic:'React', type:'theory', level:'middle',
    q:'Как работает клиентский роутинг? Разберите React Router: вложенные маршруты, защищённые роуты, ленивая загрузка, состояние в URL.',
    code:`const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <Home /> },
        { path: 'tasks', element: <Suspense fallback={<Skeleton/>}><TaskList /></Suspense> },
        { path: 'tasks/:id', element: <TaskDetails /> },
        {
          element: <RequireAuth />,          // layout-route без пути
          children: [{ path: 'settings', element: <Settings /> }],
        },
        { path: '*', element: <NotFound /> },
      ],
    },
  ])`,
    answer:`<h5>Механика SPA-роутинга</h5>
  <p>Никаких запросов к серверу при переходе не происходит. Роутер использует <b>History API</b> (<code class="i">pushState</code>/<code class="i">replaceState</code>), слушает <code class="i">popstate</code> (кнопки «назад/вперёд») и сопоставляет текущий <code class="i">location.pathname</code> с описанием маршрутов, рендеря соответствующий компонент.</p>
  <div class="trap">Обязательное серверное условие: при прямом заходе на <code class="i">/tasks/42</code> сервер должен отдать <code class="i">index.html</code>, а не 404. В nginx — <code class="i">try_files $uri $uri/ /index.html;</code>. Забытый fallback = «работает при переходах, ломается при F5» — классический баг деплоя SPA.</p>
  <h5>Основные инструменты</h5>
  <pre class="code">const { id } = useParams()                       // /tasks/:id
  const [searchParams, setSearchParams] = useSearchParams()  // ?page=2
  const navigate = useNavigate()
  navigate('/tasks', { replace: true, state: { from } })
  const location = useLocation()
  &lt;Outlet /&gt;                                       // куда рендерятся дети
  &lt;NavLink className={({isActive}) =&gt; ...}&gt;         // активная ссылка</pre>
  <h5>Защищённый маршрут</h5>
  <pre class="code">function RequireAuth() {
    const { user, isLoading } = useAuth()
    const location = useLocation()
  
    if (isLoading) return &lt;Spinner /&gt;                  // ВАЖНО: не редиректить,
    if (!user) return &lt;Navigate to="/login" replace state={{ from: location }} /&gt;
    return &lt;Outlet /&gt;                                  // пока не знаем, кто это
  }</pre>
  <p>Две частые ошибки: редирект во время загрузки данных о пользователе (выкидывает залогиненного при перезагрузке) и <code class="i">replace</code> без сохранения <code class="i">from</code> (после логина некуда вернуть).</p>
  <h5>Состояние в URL — недооценённый приём</h5>
  <p>Фильтры, страница, активная вкладка, поисковый запрос должны жить в query-параметрах. Тогда бесплатно работают: кнопка «назад», перезагрузка без потери контекста, отправка ссылки коллеге, открытие в новой вкладке. Это ещё и снимает нагрузку с глобального стора.</p>
  <h5>Ленивая загрузка</h5>
  <p><code class="i">React.lazy(() =&gt; import('./Page'))</code> + <code class="i">Suspense</code> — разбиение бандла по маршрутам, главный способ уменьшить первоначальную загрузку SPA. Улучшение: <b>префетч по наведению</b> на ссылку — к моменту клика чанк уже скачан.</p>` },
]
