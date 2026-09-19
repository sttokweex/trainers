/* eslint-disable */
// @ts-nocheck — тела тестов портированы из JS; ассерты приходят из окружения воркера
import type { Question } from '@/engine/types'

/** Состояние — 4 вопрос(ов) */
export const sostoyunieQuestions: Question[] = [
  { id:'rtk-slice', topic:'Состояние', type:'manual', level:'middle',
    q:'Напишите slice на Redux Toolkit: список задач, загрузка через async thunk, обработка pending/fulfilled/rejected. Объясните, почему <code class="i">state.items.push()</code> здесь легален.',
    starter:`// createSlice, createAsyncThunk
  // + типизация состояния и селекторы`,
    solution:`import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
  
  export const fetchTasks = createAsyncThunk(
    'tasks/fetch',                                  // префикс типов экшенов
    async (projectId: number, { rejectWithValue, signal }) => {
      try {
        const res = await api.getTasks(projectId, { signal })
        return res.data                             // → payload в fulfilled
      } catch (e) {
        return rejectWithValue(e.response?.data)    // → payload в rejected
      }
    },
  )
  
  interface TasksState {
    items: Task[]
    status: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: string | null
  }
  
  const initialState: TasksState = { items: [], status: 'idle', error: null }
  
  const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
      // синхронные экшены; RTK сам сгенерирует creator'ы
      taskToggled(state, action: PayloadAction<number>) {
        const task = state.items.find(t => t.id === action.payload)
        if (task) task.completed = !task.completed     // «мутация» — можно, см. ниже
      },
      taskRemoved(state, action: PayloadAction<number>) {
        state.items = state.items.filter(t => t.id !== action.payload)
      },
    },
    extraReducers: builder => {
      builder
        .addCase(fetchTasks.pending, state => {
          state.status = 'loading'
          state.error = null
        })
        .addCase(fetchTasks.fulfilled, (state, action) => {
          state.status = 'succeeded'
          state.items = action.payload
        })
        .addCase(fetchTasks.rejected, (state, action) => {
          state.status = 'failed'
          state.error = action.error.message ?? 'Ошибка загрузки'
        })
    },
  })
  
  export const { taskToggled, taskRemoved } = tasksSlice.actions
  export default tasksSlice.reducer
  
  // Селекторы держим рядом со слайсом — компонент не должен знать форму стора
  const selectTasksState = (s: RootState) => s.tasks
  export const selectAllTasks = (s: RootState) => s.tasks.items
  export const selectDoneTasks = createSelector(
    [selectAllTasks],
    items => items.filter(t => t.completed),     // мемоизировано
  )`,
    answer:`<h5>Почему мутация разрешена</h5>
  <p>Внутри <code class="i">createSlice</code> RTK оборачивает редьюсер в <b>Immer</b>. В редьюсер приходит не сам state, а <b>Proxy-черновик</b>. Все «мутации» записываются как список изменений, а на выходе Immer собирает <b>новый неизменяемый объект</b>, переиспользуя нетронутые ветки (structural sharing). Иммутабельность не нарушена — нарушена только её многословность.</p>
  <div class="trap">Два правила Immer: <b>либо</b> мутируем черновик, <b>либо</b> возвращаем новое значение — но не оба сразу в одном редьюсере. И «мутировать» можно только <code class="i">state</code>, а не внешние объекты: <code class="i">const t = action.payload; t.x = 1</code> изменит реальный объект.</div>
  <h5>Зачем вообще нужна иммутабельность</h5>
  <ul>
  <li>Сравнение по ссылке за O(1) → react-redux мгновенно решает, надо ли перерисовывать.</li>
  <li>Time-travel debugging и предсказуемость в DevTools.</li>
  <li>Отсутствие скрытых мутаций из разных мест кода.</li>
  </ul>
  <h5>Что ещё спросят</h5>
  <ul>
  <li><code class="i">configureStore</code> из коробки даёт redux-thunk, DevTools и dev-проверки на мутации/сериализуемость.</li>
  <li>Экшены называют в прошедшем времени как <b>события</b> (<code class="i">taskToggled</code>), а не как команды (<code class="i">setTask</code>) — тогда один экшен может обработать несколько слайсов.</li>
  <li>Для серверных данных вместо thunk'ов лучше <b>RTK Query</b> — кеш, инвалидация, дедупликация и хуки генерируются автоматически.</li>
  </ul>` },
  { id:'rtk-selector', topic:'Состояние', type:'code', level:'senior',
    q:'Реализуйте упрощённый <code class="i">createSelector(inputs, resultFn)</code> из reselect: мемоизация результата, пересчёт только при изменении входных значений (сравнение по ссылке).',
    starter:`function createSelector(inputs, resultFn) {
    // inputs: массив функций (state) => any
    // возвращает селектор (state, ...args) => результат
  }`,
    exports:['createSelector'],
    tests:[
      {name:'вычисляет результат', fn:m=>{ const s=m.createSelector([st=>st.a, st=>st.b],(a,b)=>a+b); eq(s({a:1,b:2}),3) }},
      {name:'не пересчитывает при тех же входах', fn:m=>{ let n=0; const s=m.createSelector([st=>st.a],a=>{n++; return a*2}); const st={a:5,other:1}; s(st); s(st); s({a:5,other:999}); eq(n,1,'вызовов resultFn') }},
      {name:'пересчитывает при изменении входа', fn:m=>{ let n=0; const s=m.createSelector([st=>st.a],a=>{n++; return a}); s({a:1}); s({a:2}); s({a:1}); eq(n,3) }},
      {name:'возвращает ту же ссылку при тех же входах', fn:m=>{ const s=m.createSelector([st=>st.items],items=>items.filter(x=>x>1)); const st={items:[1,2,3]}; const r1=s(st), r2=s(st); ok(r1===r2,'ссылка должна быть стабильной — иначе React будет перерисовываться') }},
      {name:'несколько входов', fn:m=>{ let n=0; const s=m.createSelector([st=>st.a,st=>st.b,st=>st.c],(a,b,c)=>{n++; return a+b+c}); eq(s({a:1,b:2,c:3}),6); s({a:1,b:2,c:3,d:9}); eq(n,1) }},
    ],
    solution:`function createSelector(inputs, resultFn) {
    let lastInputs = null
    let lastResult
  
    return function (state, ...args) {
      const values = inputs.map(fn => fn(state, ...args))
  
      const same =
        lastInputs !== null &&
        lastInputs.length === values.length &&
        values.every((v, i) => Object.is(v, lastInputs[i]))   // сравнение по ссылке
  
      if (same) return lastResult                             // кеш-хит
  
      lastInputs = values
      lastResult = resultFn(...values)
      return lastResult
    }
  }`,
    answer:`<h5>Зачем это нужно в Redux</h5>
  <p><code class="i">useSelector</code> сравнивает результат селектора со старым через <code class="i">===</code>. Если селектор возвращает <b>новый</b> объект или массив:</p>
  <pre class="code">const done = useSelector(s =&gt; s.tasks.items.filter(t =&gt; t.done))  // ❌</pre>
  <p>…то ссылка новая на <b>каждое</b> обновление стора — компонент перерисовывается, даже когда задачи не менялись. <code class="i">createSelector</code> возвращает <b>ту же ссылку</b>, пока входные срезы не изменились. Тест №4 проверяет именно это.</p>
  <h5>Два уровня мемоизации в reselect</h5>
  <ul>
  <li>Входные селекторы дешёвые (<code class="i">s =&gt; s.tasks.items</code>) — вызываются всегда.</li>
  <li>Тяжёлый <code class="i">resultFn</code> (фильтрация, сортировка, агрегация) — только при реальном изменении входов.</li>
  </ul>
  <h5>Классическая ловушка (и её судьба)</h5>
  <p>Мемоизация «на один последний вызов» ломается, если <b>один селектор с аргументами используют несколько компонентов</b>: <code class="i">selectById(state, 1)</code> и <code class="i">selectById(state, 2)</code> по очереди сбрасывают кеш друг друга. Исторически лечилось фабрикой селектора на компонент (<code class="i">useMemo(makeSelectById, [])</code>).</p>
  <p>В <b>reselect v5</b> (он в RTK 2.x) дефолтная мемоизация — <code class="i">weakMapMemoize</code>, кеш не ограничен одним значением, и эта проблема по большей части ушла. Знать историю полезно: спрашивают именно её.</p>` },
  { id:'rq-basics', topic:'Состояние', type:'theory', level:'middle',
    q:'TanStack Query: что такое <code class="i">staleTime</code> и <code class="i">gcTime</code>? Когда происходит рефетч? Чем это принципиально отличается от Redux?',
    code:`const { data, isPending, isFetching, error } = useQuery({
    queryKey: ['tasks', projectId, { status }],
    queryFn: ({ signal }) => api.getTasks(projectId, status, { signal }),
    staleTime: 5 * 60 * 1000,
  })`,
    answer:`<h5>Главная идея</h5>
  <p>React Query — это не менеджер состояния, а <b>кеш серверных данных</b>. Он исходит из того, что сервер — источник правды, а клиент держит устаревающую копию. Отсюда все понятия.</p>
  <h5>Жизненный цикл записи кеша</h5>
  <ul>
  <li><b>fresh → stale.</b> <code class="i">staleTime</code> (по умолчанию <b>0</b>) — сколько данные считаются свежими. Пока fresh, повторные запросы <b>не идут вообще</b>, данные берутся из кеша.</li>
  <li><b>active → inactive.</b> Когда последний компонент, использующий queryKey, размонтировался.</li>
  <li><b>inactive → удаление.</b> <code class="i">gcTime</code> (раньше <code class="i">cacheTime</code>, по умолчанию <b>5 минут</b>) — сколько неиспользуемые данные лежат в памяти перед сборкой мусора.</li>
  </ul>
  <p>Формулировка для собеса: <b>staleTime отвечает за сеть, gcTime — за память.</b></p>
  <h5>Когда идёт рефетч (для stale-данных)</h5>
  <p>Монтирование нового наблюдателя, фокус окна (<code class="i">refetchOnWindowFocus</code>), восстановление сети (<code class="i">refetchOnReconnect</code>), <code class="i">refetchInterval</code>, ручной <code class="i">refetch()</code> или <code class="i">invalidateQueries</code>. Всё настраивается.</p>
  <h5>Что даёт бесплатно</h5>
  <p>Дедупликация одинаковых запросов, кеш, фоновое обновление, ретраи с backoff, отмена через <code class="i">signal</code>, пагинация и <code class="i">useInfiniteQuery</code>, оптимистичные апдейты, <code class="i">isPending</code>/<code class="i">isFetching</code>/<code class="i">isError</code>.</p>
  <h5>Отличие isPending и isFetching</h5>
  <p><code class="i">isPending</code> — данных в кеше ещё нет вообще (первая загрузка, показываем скелетон). <code class="i">isFetching</code> — запрос идёт прямо сейчас, но старые данные уже есть (показываем мелкий спиннер, не ломая вёрстку).</p>
  <h5>Server state vs client state</h5>
  <table>
  <tr><th>Серверное состояние → React Query</th><th>Клиентское → Redux/useState</th></tr>
  <tr><td>вам не принадлежит, устаревает</td><td>принадлежит целиком</td></tr>
  <tr><td>асинхронное, разделяемое с другими</td><td>синхронное</td></tr>
  <tr><td>список задач, профиль, справочники</td><td>открытые модалки, шаги визарда, фильтры UI, тема</td></tr>
  </table>
  <div class="hint">Сильный тезис: «после внедрения React Query из Redux уходит 80% кода — потому что большая часть слайсов была ручным кешированием ответов API».</div>` },
  { id:'rq-optimistic', topic:'Состояние', type:'manual', level:'senior',
    q:'Напишите мутацию с оптимистичным обновлением и корректным откатом при ошибке. Объясните роль <code class="i">onMutate</code>, <code class="i">onError</code>, <code class="i">onSettled</code>.',
    starter:`const toggleTask = useMutation({
    mutationFn: (id) => api.toggleTask(id),
    // onMutate / onError / onSettled
  })`,
    solution:`const queryClient = useQueryClient()
  const key = ['tasks', projectId]
  
  const toggleTask = useMutation({
    mutationFn: (id: number) => api.toggleTask(id),
  
    // 1. До запроса: правим кеш вручную, UI откликается мгновенно
    onMutate: async (id) => {
      // важно: отменить запросы в полёте, иначе их ответ
      // перезапишет наше оптимистичное значение
      await queryClient.cancelQueries({ queryKey: key })
  
      const previous = queryClient.getQueryData<Task[]>(key)   // снимок для отката
  
      queryClient.setQueryData<Task[]>(key, old =>
        old?.map(t => (t.id === id ? { ...t, done: !t.done } : t)),
      )
  
      return { previous }        // уйдёт в context остальных колбэков
    },
  
    // 2. Ошибка: откатываем на снимок
    onError: (err, id, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
      toast.error('Не удалось обновить задачу')
    },
  
    // 3. В любом случае: синхронизируемся с сервером
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key })
    },
  })
  
  // Вызов: toggleTask.mutate(task.id)`,
    answer:`<h5>Три колбэка и зачем каждый</h5>
  <ol>
  <li><code class="i">onMutate</code> — выполняется <b>до</b> запроса. Здесь отменяем конкурентные запросы, сохраняем снимок и правим кеш. Возвращённое значение становится <code class="i">context</code>.</li>
  <li><code class="i">onError</code> — откат по снимку. Без него при сбое UI навсегда покажет неправду.</li>
  <li><code class="i">onSettled</code> — всегда (успех или ошибка). Инвалидация — страховка: сервер мог применить изменение иначе (проставил <code class="i">updatedAt</code>, пересчитал счётчики).</li>
  </ol>
  <h5>Почему <code class="i">cancelQueries</code> обязателен</h5>
  <p>Если в этот момент летит фоновый рефетч, его «старый» ответ придёт после нашего оптимистичного изменения и затрёт его. Классическая гонка.</p>
  <h5>invalidateQueries vs setQueryData</h5>
  <ul>
  <li><code class="i">invalidateQueries</code> — пометить устаревшим, перезапросить. Надёжно, но нужен round-trip. Дефолт.</li>
  <li><code class="i">setQueryData</code> — записать данные напрямую. Мгновенно, но вы берёте на себя ответственность за консистентность. Хорошо, если ответ мутации уже содержит обновлённую сущность.</li>
  </ul>
  <h5>Дизайн ключей — про это спрашивают отдельно</h5>
  <p>Ключ — сериализуемый массив от общего к частному: <code class="i">['tasks', projectId, { status, page }]</code>. Тогда <code class="i">invalidateQueries({ queryKey: ['tasks'] })</code> сбросит всё дерево задач по префиксу. Порядок ключей объекта не важен — React Query хеширует детерминированно. В проектах ключи собирают фабрикой (<code class="i">taskKeys.list(id)</code>), чтобы не было расхождений строк.</p>` },
]
