import type { TheoryArticle } from '@/engine/types'

export const hooks: TheoryArticle = { id:'th-hooks', topic:'React', title:'Хуки: полный разбор с примерами',
  lead:'Как они устроены внутри, зачем нужен каждый, и почему одни и те же ошибки повторяются у всех.',
  body:`
<h5>Почему хуки вообще появились</h5>
<p>До 2019 года состояние жило в классовых компонентах, а переиспользовать логику можно было только через HOC и render props — оба подхода создавали «ад обёрток» в дереве компонентов. Вдобавок связанная логика оказывалась размазанной по методам жизненного цикла: подписка в <code class="i">componentDidMount</code>, обновление в <code class="i">componentDidUpdate</code>, отписка в <code class="i">componentWillUnmount</code>.</p>
<p>Хуки решают обе проблемы: логика группируется <b>по смыслу</b>, а не по моменту жизненного цикла, и переиспользуется обычным вызовом функции.</p>

<h5>Как React понимает, какой useState чей</h5>
<p>Это ключ к пониманию правил хуков. У каждого компонента есть <b>связный список хуков</b>, привязанный к его fiber-узлу. При рендере React идёт по списку и сопоставляет вызовы <b>строго по порядку</b>. Имён переменных он не знает и знать не может — это обычная деструктуризация массива.</p>
<pre class="code">function Component() {
  const [a, setA] = useState(0)   // хук №0
  const [b, setB] = useState('')  // хук №1
  useEffect(() =&gt; {}, [])         // хук №2
}
// React запоминает: [state0, state1, effect2]
// При следующем рендере он ОЖИДАЕТ ровно такую же последовательность</pre>
<p>Теперь понятно, почему нельзя вызывать хуки условно:</p>
<pre class="code">if (show) {
  const [a] = useState(0)   // ❌ при show === false порядок сдвинется
}
const [b] = useState('')    // и b начнёт читать состояние от a</pre>
<div class="key">Правила хуков — не стилистическое соглашение, а следствие реализации. Хуки вызываются безусловно, на верхнем уровне функции, всегда в одинаковом количестве и порядке, и только из компонентов или других хуков. Всё это проверяет <code class="i">eslint-plugin-react-hooks</code>.</div>
<p>Правильный способ — вызвать хук всегда, а условие поместить <b>внутрь</b>, либо вынести ветку в отдельный компонент.</p>

<div data-demo="hooks-order"></div>
<h5>useState</h5>
<pre class="code">const [value, setValue] = useState(initial)
const [value, setValue] = useState(() =&gt; expensiveInit())   // ленивая инициализация
setValue(prev =&gt; prev + 1)                                   // функциональная форма</pre>
<p>Две детали, которые часто упускают.</p>
<p><b>Ленивая инициализация.</b> Аргумент <code class="i">useState(expensiveInit())</code> вычисляется <b>на каждом рендере</b>, даже если результат потом отбрасывается. Передача функции откладывает вычисление до первого рендера.</p>
<p><b>Функциональная форма обязательна</b>, когда новое состояние зависит от старого:</p>
<pre class="code">const onClick = () =&gt; {
  setCount(count + 1)
  setCount(count + 1)
  console.log(count)   // старое значение — count константа В ЭТОМ рендере
}
// итог: count увеличился на 1, а не на 2

const onClick = () =&gt; {
  setCount(c =&gt; c + 1)
  setCount(c =&gt; c + 1)   // итог: +2, каждая функция получает актуальное значение
}</pre>
<p>Причина в том, что <code class="i">count</code> — это <b>константа внутри конкретного рендера</b>, захваченная замыканием. Осознав это, вы разом перестанете писать целый класс багов, включая устаревшие значения в таймерах и подписках.</p>
<p>Ещё: React пропускает ререндер, если новое значение равно старому по <code class="i">Object.is</code>. Поэтому <code class="i">setItems(items)</code> после <code class="i">items.push(x)</code> не вызовет обновления — ссылка не изменилась.</p>

<h5>useEffect и его семейство</h5>
<table>
<tr><th>Хук</th><th>Когда выполняется</th><th>Для чего</th></tr>
<tr><td><code class="i">useEffect</code></td><td>после отрисовки, асинхронно</td><td>подписки, запросы, таймеры, логи — 95% случаев</td></tr>
<tr><td><code class="i">useLayoutEffect</code></td><td>после мутаций DOM, <b>до</b> отрисовки, синхронно</td><td>измерение DOM, позиционирование тултипа — чтобы не было мигания</td></tr>
<tr><td><code class="i">useInsertionEffect</code></td><td>до мутаций DOM</td><td>только для CSS-in-JS библиотек, вставляющих стили</td></tr>
</table>
<p>Массив зависимостей: <code class="i">[]</code> — один раз при монтировании; <code class="i">[a, b]</code> — при изменении любого (сравнение через <code class="i">Object.is</code>, поверхностное); <b>без массива</b> — после каждого рендера, что в паре с <code class="i">setState</code> внутри даёт бесконечный цикл.</p>
<p><b>Cleanup обязателен</b> для всего, что «включается»: подписки, таймеры, соединения, запросы. Возвращаемая функция вызывается перед следующим запуском эффекта и при размонтировании.</p>
<pre class="code">useEffect(() =&gt; {
  const ctrl = new AbortController()
  let alive = true

  fetch(\`/api/users/\${userId}\`, { signal: ctrl.signal })
    .then(r =&gt; {
      if (!r.ok) throw new Error('HTTP ' + r.status)   // fetch не бросает на 4xx/5xx!
      return r.json()
    })
    .then(data =&gt; { if (alive) setUser(data) })
    .catch(e =&gt; { if (e.name !== 'AbortError') setError(e) })

  return () =&gt; { alive = false; ctrl.abort() }
}, [userId])</pre>
<p>Здесь закрыты сразу три типовые проблемы: зависимость от <code class="i">userId</code> (иначе при смене пользователя данные не обновятся), <b>гонка</b> (быстрая смена id — и поздний ответ старого запроса перетрёт свежие данные), и отмена при размонтировании.</p>

<h5>StrictMode и двойной вызов</h5>
<p>В режиме разработки React 18+ монтирует компонент, размонтирует и монтирует снова: <b>эффект → cleanup → эффект</b>. Это не баг, а детектор: так вылезают эффекты без корректной очистки.</p>
<p>Правильная реакция — <b>не отключать StrictMode</b>, а написать cleanup. Если двойной вызов что-то ломает, значит, в коде реальная проблема, которая проявилась бы при быстрой навигации туда-обратно. В продакшен-сборке двойного вызова нет.</p>

<h5>Когда эффект не нужен</h5>
<p>Современная документация React прямо говорит: эффектов в коде должно быть мало. Эффект нужен для <b>синхронизации с внешней системой</b> — не для всего подряд.</p>
<table>
<tr><th>Задача</th><th>❌ Через эффект</th><th>✅ Правильно</th></tr>
<tr><td>Вычислить значение из пропсов</td><td><code class="i">useEffect</code> + <code class="i">setState</code></td><td>считать прямо в рендере или <code class="i">useMemo</code></td></tr>
<tr><td>Отреагировать на клик</td><td>эффект на изменение состояния</td><td>код в обработчике события</td></tr>
<tr><td>Сбросить состояние при смене пропса</td><td>эффект со сбросом</td><td><code class="i">key</code> на компоненте</td></tr>
<tr><td>Загрузить данные</td><td>эффект + три useState</td><td><code class="i">useQuery</code></td></tr>
</table>
<p>Приём с <code class="i">key</code> заслуживает отдельного упоминания: <code class="i">&lt;Form key={userId} /&gt;</code> полностью пересоздаёт компонент при смене пользователя. Это самый чистый способ сбросить состояние формы — короче любого эффекта и без промежуточных некорректных состояний.</p>

<h5>useMemo, useCallback, React.memo</h5>
<pre class="code">const value = useMemo(() =&gt; expensive(a, b), [a, b])   // кеширует РЕЗУЛЬТАТ
const cb = useCallback(() =&gt; doSomething(id), [id])     // кеширует ФУНКЦИЮ
const Memo = React.memo(Component)                       // пропускает ререндер</pre>
<p><code class="i">useCallback(fn, deps)</code> — это буквально <code class="i">useMemo(() =&gt; fn, deps)</code>.</p>
<p>Главное, что нужно понимать: <b><code class="i">React.memo</code> работает, только если мемоизированы все нескалярные пропсы</b>. Объекты, массивы и функции создаются заново при каждом рендере родителя, поверхностное сравнение даёт false, и оптимизация обнуляется.</p>
<pre class="code">&lt;Child
  onClick={() =&gt; {}}         // ❌ новая функция каждый рендер
  items={[1, 2, 3]}          // ❌ новый массив
  style={{ color: 'red' }}   // ❌ новый объект
/&gt;</pre>
<p>Когда мемоизация действительно нужна: дорогое вычисление (сортировка тысяч элементов), значение уходит в зависимости эффекта, проп передаётся в memo-компонент или в контекст. Когда не нужна: везде остальное — сама мемоизация стоит замыкания, массива зависимостей и сравнения.</p>
<div class="note">React Compiler (React 19) расставляет мемоизацию автоматически на этапе сборки. В проектах с ним ручные <code class="i">useMemo</code> почти не нужны — но понимать ссылочное равенство всё равно необходимо, иначе вы не поймёте, почему компилятор чего-то не смог.</div>

<h5>useRef: две разные роли</h5>
<p><b>Ссылка на DOM</b>: <code class="i">ref={inputRef}</code>, затем <code class="i">inputRef.current.focus()</code>.</p>
<p><b>Изменяемая коробка между рендерами</b>: id таймера, предыдущее значение, флаг «первый рендер», актуальная версия колбэка.</p>
<p>Отличие от состояния принципиальное: <b>изменение <code class="i">ref.current</code> не вызывает ререндер</b> и происходит синхронно. Правило: влияет на отображение — <code class="i">useState</code>; служебные данные — <code class="i">useRef</code>.</p>
<pre class="code">// паттерн «latest ref»: стабильная ссылка + всегда свежее замыкание
function useEvent(fn) {
  const ref = useRef(fn)
  useEffect(() =&gt; { ref.current = fn })
  return useCallback((...args) =&gt; ref.current(...args), [])
}</pre>
<p>Этот приём решает дилемму: положить функцию в зависимости — она будет пересоздаваться каждый рендер; не положить — получим устаревшее замыкание. Ref даёт стабильность снаружи и свежесть внутри.</p>

<h5>Остальные хуки</h5>
<p><b><code class="i">useReducer(reducer, initialState)</code></b> — альтернатива <code class="i">useState</code>, когда переходов много и они связаны. Вместо десятка сеттеров — одна чистая функция «текущее состояние + действие → новое состояние». Её можно протестировать вообще без React.</p>
<pre class="code">function reducer(state, action) {
  switch (action.type) {
    case 'submit':  return { ...state, status: 'loading', error: null }
    case 'success': return { status: 'ok', data: action.payload, error: null }
    case 'fail':    return { ...state, status: 'error', error: action.error }
  }
}
const [state, dispatch] = useReducer(reducer, { status: 'idle' })
dispatch({ type: 'submit' })</pre>
<p>Признак, что пора переходить на reducer: несколько <code class="i">useState</code>, которые всегда меняются вместе, или состояние, где легко собрать невозможную комбинацию (<code class="i">loading</code> и <code class="i">error</code> одновременно).</p>

<p><b><code class="i">useContext(Context)</code></b> — прочитать значение ближайшего провайдера выше по дереву. Решает <b>props drilling</b> — ситуацию, когда проп прокидывают через пять уровней компонентов, которым он не нужен. Важно помнить: при изменении значения перерисуются <b>все</b> потребители этого контекста.</p>

<p><b><code class="i">useId()</code></b> — генерирует уникальный стабильный идентификатор. Нужен там, где HTML требует связи по id: <code class="i">&lt;label for&gt;</code>, <code class="i">aria-describedby</code>. Почему не <code class="i">Math.random()</code>: при серверном рендеринге разметка генерируется дважды (на сервере и на клиенте), и случайные значения не совпадут — React выдаст ошибку гидратации. <code class="i">useId</code> даёт одинаковый результат в обоих местах.</p>
<pre class="code">const id = useId()
&lt;label htmlFor={id}&gt;Email&lt;/label&gt;
&lt;input id={id} /&gt;</pre>

<p><b><code class="i">useTransition()</code></b> → <code class="i">[isPending, startTransition]</code>. Помечает обновление как <b>несрочное</b>: React может прервать его рендер, чтобы обработать что-то важное (ввод текста), и начать заново. <code class="i">isPending</code> — флаг «фоновое обновление ещё идёт», удобен для деликатного индикатора.</p>

<p><b><code class="i">useDeferredValue(value)</code></b> — то же самое, но «снаружи»: возвращает <b>отложенную копию</b> значения, которая догоняет оригинал с низким приоритетом. Разница в том, кто инициирует: <code class="i">useTransition</code> оборачивает <i>ваш</i> вызов setState, а <code class="i">useDeferredValue</code> применяют, когда значение приходит извне (из пропсов) и обернуть нечего.</p>

<p><b><code class="i">useSyncExternalStore(subscribe, getSnapshot)</code></b> — официальный способ подписаться на <b>состояние вне React</b>: Redux-стор, zustand, <code class="i">localStorage</code>, <code class="i">window.matchMedia</code>, статус онлайн. Он существует потому, что при конкурентном рендеринге наивная подписка через <code class="i">useEffect</code> может показать «порванное» состояние — часть дерева со старым значением, часть с новым. Этот хук такую рассинхронизацию исключает.</p>
<pre class="code">const isOnline = useSyncExternalStore(
  (cb) =&gt; {                                   // подписка
    window.addEventListener('online', cb)
    window.addEventListener('offline', cb)
    return () =&gt; { /* отписка */ }
  },
  () =&gt; navigator.onLine,                     // снимок значения
)</pre>

<p><b><code class="i">useImperativeHandle(ref, factory)</code></b> — позволяет компоненту отдать родителю не DOM-узел, а <b>собственный набор методов</b>. Применяют редко и осознанно: React декларативен, и императивные команды сверху вниз — исключение (сфокусировать поле, перемотать плеер, проиграть анимацию).</p>
<pre class="code">useImperativeHandle(ref, () =&gt; ({
  focus: () =&gt; inputRef.current.focus(),
  clear: () =&gt; setValue(''),
}))
// родитель: formRef.current.clear()</pre>

<p><b><code class="i">use(promise)</code></b> (React 19) — читает значение промиса или контекста <b>прямо в рендере</b>. Главное отличие от хуков: его <b>можно вызывать условно</b> и в циклах, потому что он не хранит состояние в списке хуков. Работает в паре с <code class="i">Suspense</code> (показать фолбэк, пока промис не разрешился) и Error Boundary (поймать ошибку).</p>

<p><b><code class="i">useOptimistic(state, updateFn)</code></b> (React 19) — показывает предполагаемый результат действия <b>до</b> ответа сервера и откатывает автоматически, если действие провалилось. Ручная реализация того же требует снимка состояния и отката в обработчике ошибки.</p>

<h5>Полезные кастомные хуки</h5>
<pre class="code">// предыдущее значение
function usePrevious(value) {
  const ref = useRef()
  useEffect(() =&gt; { ref.current = value }, [value])
  return ref.current
}

// дебаунс значения
function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() =&gt; {
    const id = setTimeout(() =&gt; setDebounced(value), delay)
    return () =&gt; clearTimeout(id)   // cleanup = сброс таймера
  }, [value, delay])
  return debounced
}

// localStorage, устойчивый к исключениям
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() =&gt; {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial }
    catch { return initial }
  })
  useEffect(() =&gt; {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  }, [key, value])
  return [value, setValue]
}</pre>

<h5>Семь ошибок, которые встречаются чаще всего</h5>
<ol>
<li>Хук в условии или цикле — перепутанное состояние.</li>
<li>Неполные зависимости — устаревшее замыкание. Не глушите <code class="i">exhaustive-deps</code>, это лечение симптома.</li>
<li>Объект или массив в зависимостях без мемоизации — эффект на каждом рендере.</li>
<li>Нет cleanup — утечка памяти и двойные обработчики.</li>
<li>Дублирование пропса в состояние — рассинхронизация.</li>
<li>Мутация состояния вместо создания новой ссылки — ререндера не будет.</li>
<li><code class="i">debounce()</code> прямо в теле компонента — новая функция со своим таймером на каждом рендере, дебаунс не работает вовсе.</li>
</ol>` }
