import type { TheoryArticle } from '@/engine/types'

export const state: TheoryArticle = { id:'th-state', topic:'Состояние', title:'Управление состоянием: что, где и почему',
  lead:'Сначала определяем, кому принадлежат данные, затем выбираем локальное состояние, Redux Toolkit, MobX, Zustand или query-кеш для сервера.',
  updates: [
    { id: 'state-ecosystem-2026-10-v2', sectionTitle: 'RTK Query, TanStack Query и Redux-Saga', label: 'Добавлено сравнение' },
    { id: 'state-mobx-2026-10-v2', sectionTitle: 'MobX: реактивные модели', label: 'Добавлен разбор' },
    { id: 'state-zustand-2026-10-v2', sectionTitle: 'Zustand и другие store', label: 'Добавлен разбор' },
  ],
  body:`
<h5>Главный вопрос: чьё это состояние</h5>
<p>Большинство проблем с состоянием начинается с того, что данные кладут не туда. Вот схема, которой достаточно в 95% случаев:</p>
<pre class="code">Данные пришли с сервера и могут устареть?
  └─ ДА  → TanStack Query / RTK Query
  └─ НЕТ → чьё это состояние?
        ├─ одного компонента              → useState
        ├─ двух-трёх соседних             → поднять в общего родителя
        ├─ сложные связанные переходы     → useReducer
        ├─ всего приложения, редко меняется → Context
        └─ всего приложения, часто меняется → Redux Toolkit / Zustand
Это состояние экрана (фильтры, страница, вкладка)? → URL</pre>
<div class="key">Ключевое разделение — <b>серверное состояние против клиентского</b>. Серверное вам не принадлежит: оно живёт в базе, устаревает, может измениться без вашего участия и разделяется между пользователями. Клиентское принадлежит целиком: открыта ли модалка, какой шаг визарда, какая тема.</div>
<p>Осознание этого разделения убирает из типичного приложения большую часть кода: значительная доля Redux-слайсов в проектах — это самописное кеширование ответов API, которое библиотека делает лучше.</p>

<h5>Состояние в URL — недооценённый инструмент</h5>
<p>Фильтры, номер страницы, активная вкладка, поисковый запрос должны жить в query-параметрах.</p>
<pre class="code">const [searchParams, setSearchParams] = useSearchParams()
const status = searchParams.get('status') ?? 'all'
setSearchParams({ status: 'open', page: '2' })</pre>
<p>Что вы получаете бесплатно: работающую кнопку «назад», перезагрузку без потери контекста, возможность отправить ссылку коллеге и открыть в новой вкладке. И ни строчки в глобальном сторе.</p>

<h5>Redux Toolkit: минимальный рабочий набор</h5>
<pre class="code">// store.ts
export const store = configureStore({ reducer: { tasks: tasksReducer } })
export type RootState = ReturnType&lt;typeof store.getState&gt;
export type AppDispatch = typeof store.dispatch

// типизированные хуки — пишутся один раз на проект
export const useAppDispatch = () =&gt; useDispatch&lt;AppDispatch&gt;()
export const useAppSelector: TypedUseSelectorHook&lt;RootState&gt; = useSelector</pre>
<p><code class="i">configureStore</code> из коробки подключает redux-thunk, DevTools и dev-проверки на случайные мутации и несериализуемые значения в сторе.</p>
<pre class="code">const tasksSlice = createSlice({
  name: 'tasks',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {
    taskToggled(state, action) {
      const task = state.items.find(t =&gt; t.id === action.payload)
      if (task) task.completed = !task.completed     // «мутация» — см. ниже
    },
  },
  extraReducers: builder =&gt; {
    builder
      .addCase(fetchTasks.pending,   s =&gt; { s.status = 'loading' })
      .addCase(fetchTasks.fulfilled, (s, a) =&gt; { s.status = 'ok'; s.items = a.payload })
      .addCase(fetchTasks.rejected,  (s, a) =&gt; { s.status = 'fail'; s.error = a.error.message })
  },
})</pre>

<h5>Почему мутация внутри редьюсера легальна</h5>
<p>RTK оборачивает редьюсеры в <b>Immer</b>. В функцию приходит не сам state, а <b>Proxy-черновик</b>: все «мутации» записываются как список изменений, а на выходе Immer собирает новый неизменяемый объект, переиспользуя нетронутые ветки (structural sharing). Иммутабельность не нарушена — нарушена только её многословность.</p>
<div class="warn">Два правила Immer. Первое: <b>либо</b> мутируйте черновик, <b>либо</b> возвращайте новое значение — не оба сразу в одном редьюсере. Второе: «мутировать» можно только <code class="i">state</code>. Строка <code class="i">const t = action.payload; t.done = true</code> изменит реальный объект за пределами черновика.</div>
<p>Зачем вообще иммутабельность: сравнение по ссылке за O(1) (на этом стоит вся оптимизация React), предсказуемость, возможность time-travel debugging.</p>

<h5>Селекторы и reselect</h5>
<p><code class="i">useSelector</code> сравнивает результат селектора со старым через <code class="i">===</code>. Если селектор возвращает <b>новый</b> объект или массив, компонент будет перерисовываться на <b>любое</b> изменение стора:</p>
<pre class="code">// ❌ новый массив на каждом вызове
const done = useSelector(s =&gt; s.tasks.items.filter(t =&gt; t.done))

// ✅ мемоизированный селектор возвращает ту же ссылку,
//    пока входные срезы не изменились
export const selectDone = createSelector(
  [(s: RootState) =&gt; s.tasks.items],
  items =&gt; items.filter(t =&gt; t.done),
)</pre>
<p>У reselect два уровня: дешёвые входные селекторы вызываются всегда, а тяжёлая функция результата — только при реальном изменении входов.</p>
<p><b>Историческая ловушка</b>, которую любят спрашивать: мемоизация «на один последний вызов» ломалась, если один селектор с аргументами использовали несколько компонентов — <code class="i">selectById(state, 1)</code> и <code class="i">selectById(state, 2)</code> по очереди сбрасывали кеш друг друга. Лечилось фабрикой селектора на компонент. В <b>reselect v5</b> (в составе RTK 2.x) по умолчанию используется <code class="i">weakMapMemoize</code>, и проблема по большей части ушла.</p>

<h5>TanStack Query: модель кеша</h5>
<pre class="code">const { data, isPending, isFetching, isError, error } = useQuery({
  queryKey: ['tasks', projectId, { status }],
  queryFn: ({ signal }) =&gt; api.getTasks(projectId, status, { signal }),
  staleTime: 5 * 60 * 1000,
})</pre>
<p>Библиотека исходит из того, что сервер — источник правды, а клиент держит устаревающую копию. Отсюда два ключевых параметра:</p>
<ul>
<li><b><code class="i">staleTime</code></b> (по умолчанию <b>0</b>) — сколько данные считаются свежими. Пока свежие, повторных запросов <b>не будет вообще</b>.</li>
<li><b><code class="i">gcTime</code></b> (раньше <code class="i">cacheTime</code>, по умолчанию 5 минут) — сколько неиспользуемые данные лежат в памяти перед удалением.</li>
</ul>
<p>Формулировка, которую стоит запомнить: <b><code class="i">staleTime</code> отвечает за сеть, <code class="i">gcTime</code> — за память.</b></p>
<p>Рефетч устаревших данных происходит при монтировании нового наблюдателя, фокусе окна, восстановлении сети, по интервалу и при явной инвалидации. Всё настраивается.</p>
<p><code class="i">isPending</code> означает «данных нет вообще» — показываем скелетон. <code class="i">isFetching</code> — «запрос идёт, но старые данные уже есть» — показываем деликатный индикатор, не ломая вёрстку.</p>

<div data-demo="query-cache"></div>
<h5>Дизайн ключей</h5>
<p>Ключ — сериализуемый массив от общего к частному: <code class="i">['tasks', projectId, { status, page }]</code>. Тогда <code class="i">invalidateQueries({ queryKey: ['tasks'] })</code> сбросит всё дерево задач по префиксу. Порядок полей внутри объекта не важен — библиотека хеширует детерминированно.</p>
<p>В реальных проектах ключи собирают фабрикой, чтобы строки не расходились между файлами:</p>
<pre class="code">export const taskKeys = {
  all: ['tasks'] as const,
  lists: () =&gt; [...taskKeys.all, 'list'] as const,
  list: (filters) =&gt; [...taskKeys.lists(), filters] as const,
  detail: (id) =&gt; [...taskKeys.all, 'detail', id] as const,
}</pre>

<h5>Мутации и оптимистичное обновление</h5>
<pre class="code">const qc = useQueryClient()

const toggle = useMutation({
  mutationFn: (id) =&gt; api.toggleTask(id),

  onMutate: async (id) =&gt; {
    // отменить запросы в полёте, иначе их ответ перетрёт наше изменение
    await qc.cancelQueries({ queryKey: key })
    const previous = qc.getQueryData(key)              // снимок для отката
    qc.setQueryData(key, old =&gt; old.map(t =&gt;
      t.id === id ? { ...t, done: !t.done } : t))
    return { previous }
  },

  onError: (err, id, ctx) =&gt; {
    qc.setQueryData(key, ctx.previous)                 // откат
    toast.error('Не удалось обновить')
  },

  onSettled: () =&gt; qc.invalidateQueries({ queryKey: key }),   // сверка с сервером
})</pre>
<p><code class="i">cancelQueries</code> здесь обязателен: если в этот момент летит фоновый рефетч, его «старый» ответ придёт после нашего оптимистичного изменения и затрёт его. Классическая гонка.</p>
<p><b>Когда применять оптимизм:</b> операция почти наверняка успешна и дёшево откатывается — лайк, отметка «выполнено», удаление из списка. <b>Когда не применять:</b> платежи и необратимые действия.</p>

<h5>RTK Query, TanStack Query и Redux-Saga</h5>
<p>Если проект уже использует Redux Toolkit, для API обычно сначала рассмотрите <b>RTK Query</b>: endpoint-описания дают hooks, кеш по аргументам, статусы, дедупликацию и invalidation tags. <b>TanStack Query</b> работает без Redux и часто удобнее как отдельный серверный кеш. Сравнивайте интеграцию, SSR, требования команды и текущую архитектуру; не дублируйте один API-кеш одновременно в Redux, RTK Query и TanStack Query.</p>
<p><code class="i">createAsyncThunk</code> подходит отдельным async-операциям. Listener middleware — реакциям на actions/state, debounce и отменяемым задачам. <b>Redux-Saga</b> использует генераторы и эффекты для долгих, конкурентных и отменяемых workflow. Она полезна в существующей saga-кодовой базе или сложной оркестрации, но обычно избыточна для простого CRUD, где достаточно RTK Query или thunk.</p>
<pre class="code">const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Task'],
  endpoints: build =&gt; ({
    getTasks: build.query&lt;Task[], void&gt;({
      query: () =&gt; 'tasks', providesTags: ['Task'],
    }),
    addTask: build.mutation&lt;Task, NewTask&gt;({
      query: body =&gt; ({ url: 'tasks', method: 'POST', body }),
      invalidatesTags: ['Task'],
    }),
  }),
})</pre>

<h5>MobX: реактивные модели</h5>
<p>MobX отслеживает чтение observable-значений внутри <code class="i">observer</code>-компонента и обновляет подписчиков при изменении. Производные данные описывают через <code class="i">computed</code>, изменения — через actions, внешние эффекты — через reactions. Это даёт точечную реактивность и выразительные модели с небольшим количеством шаблонного кода. Цена — менее явный общий поток изменений, чем в Redux; следите, чтобы реакции не скрывали бизнес-логику и не создавали циклы.</p>
<pre class="code">class Cart {
  items = []
  constructor() { makeAutoObservable(this) }
  get total() { return this.items.reduce((sum, item) =&gt; sum + item.price, 0) }
  add(item) { this.items.push(item) }
}</pre>
<p>MobX разумен для существующей MobX-архитектуры или богатой модели состояния. Redux Toolkit часто выбирают, когда важны явные события, аудит переходов, middleware и единые соглашения команды.</p>

<h5>Zustand и другие store</h5>
<p><b>Zustand</b> — компактный клиентский store с хуком-подпиской и селекторами; обычному клиентскому приложению не нужен Provider. Есть middleware для DevTools и persist. Выбирайте только нужный срез в компоненте; следите за стабильностью составных результатов, SSR-гидратацией и тем, что сохраняете в storage. Zustand сам по себе не заменяет серверный кеш: API-данным всё равно нужен TanStack Query или RTK Query.</p>
<pre class="code">const useUiStore = create&lt;UiState&gt;()((set) =&gt; ({
  sidebarOpen: false,
  toggleSidebar: () =&gt; set(state =&gt; ({ sidebarOpen: !state.sidebarOpen })),
}))
const open = useUiStore(state =&gt; state.sidebarOpen)</pre>
<p>Ещё встречаются <b>Jotai</b> (атомарное состояние) и <b>Valtio</b> (proxy-based реактивность). На интервью достаточно объяснить их модель и trade-offs; важнее выбрать правильное место и владельца состояния, чем перечислить все библиотеки.</p>

<h5>Короткое сравнение для собеседования</h5>
<table>
<tr><th>Инструмент</th><th>Модель</th><th>Сильная сторона</th><th>Риск/цена</th></tr>
<tr><td>Redux Toolkit</td><td>actions и reducers</td><td>предсказуемость, DevTools, единые соглашения</td><td>не превращать store в свалку любого состояния</td></tr>
<tr><td>MobX</td><td>observable, computed, reactions</td><td>точечная реактивность, естественные модели</td><td>неявные зависимости и неконтролируемые эффекты</td></tr>
<tr><td>Zustand</td><td>store и селекторы</td><td>простота, мало шаблонного кода</td><td>границы store, селекторы, SSR и persist</td></tr>
<tr><td>RTK Query / TanStack Query</td><td>серверный кеш</td><td>запросы, статусы, дедупликация и инвалидация</td><td>ключи, freshness и конкурентные обновления</td></tr>
<tr><td>Redux-Saga</td><td>генераторы и эффекты</td><td>сложная отменяемая оркестрация</td><td>дополнительная сложность</td></tr>
</table>
<div class="key">Выбор по слоям: URL — состояние навигации; React state — локальный UI; Context — редкие глобальные значения; RTK/Zustand/MobX — общее клиентское состояние; RTK Query/TanStack Query — серверные данные. Saga добавляйте по сложности workflow, а не автоматически вместе с Redux.</div>

<h5>invalidateQueries или setQueryData</h5>
<table>
<tr><th><code class="i">invalidateQueries</code></th><th><code class="i">setQueryData</code></th></tr>
<tr><td>пометить устаревшим и перезапросить</td><td>записать данные напрямую</td></tr>
<tr><td>надёжно, но нужен round-trip</td><td>мгновенно, но вы отвечаете за консистентность</td></tr>
<tr><td>дефолт</td><td>когда ответ мутации уже содержит обновлённую сущность</td></tr>
</table>

<h5>Частые ошибки</h5>
<ul>
<li>Складывать ответы API в Redux вручную — получается кеш без инвалидации и дедупликации.</li>
<li>Селектор без <code class="i">createSelector</code>, возвращающий новый массив — ререндер на каждое действие.</li>
<li><code class="i">staleTime: 0</code> вместе с <code class="i">refetchOnWindowFocus</code> — шквал запросов при переключении вкладок. Для справочников ставьте минуты.</li>
<li>Копировать серверные данные в локальный <code class="i">useState</code> «чтобы редактировать» — рассинхронизация. Лучше форма с <code class="i">defaultValues</code> и мутация на отправке.</li>
<li>Класть в Redux то, что прекрасно живёт в URL или в локальном состоянии компонента.</li>
</ul>` }
