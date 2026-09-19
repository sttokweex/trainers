import type { Question } from '@/engine/types'

/** Тестирование — 2 вопрос(ов) */
export const testirovanieQuestions: Question[] = [
  { id:'test-pyramid', topic:'Тестирование', type:'theory', level:'middle',
    q:'Пирамида тестов: что и как тестировать? Что такое моки, стабы и спаи? Что значит «тестировать поведение, а не реализацию»?',
    answer:`<h5>Пирамида</h5>
  <table>
  <tr><th>Уровень</th><th>Доля</th><th>Что проверяет</th><th>Скорость / хрупкость</th></tr>
  <tr><td><b>Unit</b></td><td>~70%</td><td>одна функция, хук, сервис в изоляции</td><td>мс / низкая</td></tr>
  <tr><td><b>Integration</b></td><td>~20%</td><td>связка модулей, компонент с реальным стором, сервис с реальной БД</td><td>секунды / средняя</td></tr>
  <tr><td><b>E2E</b></td><td>~10%</td><td>сценарий целиком глазами пользователя</td><td>минуты / высокая</td></tr>
  </table>
  <p>Форма пирамиды — про <b>соотношение цены и уверенности</b>. E2E дают больше всего уверенности, но медленны и «моргают» (flaky). Unit быстры, но не ловят ошибок интеграции. Есть популярная альтернатива — «трофей» Кента Доддса: больше всего <b>интеграционных</b> тестов, потому что именно там лучшее соотношение уверенности к затратам на фронте.</p>
  <h5>Термины</h5>
  <ul>
  <li><b>Stub</b> — заглушка с готовым ответом: «когда спросят user 1, верни вот этот объект».</li>
  <li><b>Mock</b> — заглушка с <b>ожиданиями</b>: проверяем, что метод был вызван, столько-то раз, с такими аргументами.</li>
  <li><b>Spy</b> — обёртка вокруг настоящей функции: работает как обычно, но записывает вызовы.</li>
  <li><b>Fake</b> — упрощённая рабочая реализация (in-memory репозиторий вместо БД).</li>
  </ul>
  <h5>Поведение вместо реализации — ключевая мысль</h5>
  <pre class="code">// ❌ тест знает внутренности: сломается при любом рефакторинге
  expect(wrapper.state('isOpen')).toBe(true)
  expect(component.find('.btn-primary')).toHaveLength(1)
  
  // ✅ тест описывает то, что видит пользователь
  await user.click(screen.getByRole('button', { name: /открыть/i }))
  expect(screen.getByRole('dialog')).toBeVisible()</pre>
  <p>Правило Testing Library: «чем больше тест похож на то, как пользуются вашим кодом, тем больше уверенности он даёт». Отсюда приоритет селекторов: <code class="i">getByRole</code> → <code class="i">getByLabelText</code> → <code class="i">getByText</code> → и только в крайнем случае <code class="i">getByTestId</code>. Побочный бонус: если <code class="i">getByRole</code> не находит элемент, скорее всего у вас проблема с доступностью.</p>
  <h5>Признаки плохого теста</h5>
  <ul>
  <li>Ломается при рефакторинге, который не менял поведение.</li>
  <li>Проходит, когда код на самом деле сломан (тестирует моки, а не логику).</li>
  <li>Flaky: зависит от таймингов, порядка выполнения, реального времени или сети.</li>
  <li>Непонятно, что именно сломалось, когда он красный.</li>
  </ul>
  <div class="hint">Про покрытие: 100% — плохая цель. Покрытие показывает, какой код <b>исполнялся</b>, а не какой <b>проверен</b>. Тест без единого <code class="i">expect</code> даёт покрытие. Разумнее: высокое покрытие критичной бизнес-логики и платежей, низкое — для тривиальных геттеров и вёрстки.</div>` },
  { id:'test-react', topic:'Тестирование', type:'manual', level:'middle',
    q:'Напишите тест React-компонента с асинхронной загрузкой и тест кастомного хука. Как мокать сеть?',
    starter:`// Компонент TaskList: грузит задачи, показывает скелетон, потом список,
  // при ошибке — сообщение и кнопку «Повторить»`,
    solution:`import { render, screen, waitFor } from '@testing-library/react'
  import userEvent from '@testing-library/user-event'
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
  import { http, HttpResponse } from 'msw'
  import { setupServer } from 'msw/node'
  
  // MSW перехватывает запросы на уровне сети — компонент и хуки
  // остаются нетронутыми, мокать fetch/axios не нужно
  const server = setupServer(
    http.get('/api/tasks', () => HttpResponse.json([{ id: 1, title: 'Купить хлеб' }])),
  )
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())
  
  // обёртка: в тестах retry отключаем, иначе падение ждёт несколько секунд
  function renderWithQuery(ui: React.ReactElement) {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
  }
  
  describe('TaskList', () => {
    it('показывает загрузку, затем список задач', async () => {
      renderWithQuery(<TaskList />)
  
      expect(screen.getByRole('status')).toBeInTheDocument()       // скелетон
  
      // findBy* = getBy* + waitFor: ждёт появления элемента
      expect(await screen.findByText('Купить хлеб')).toBeInTheDocument()
      expect(screen.queryByRole('status')).not.toBeInTheDocument() // загрузка ушла
    })
  
    it('показывает ошибку и повторяет запрос по кнопке', async () => {
      server.use(http.get('/api/tasks', () => new HttpResponse(null, { status: 500 })))
      const user = userEvent.setup()
  
      renderWithQuery(<TaskList />)
      expect(await screen.findByRole('alert')).toHaveTextContent(/не удалось/i)
  
      server.use(http.get('/api/tasks', () => HttpResponse.json([{ id: 2, title: 'Ок' }])))
      await user.click(screen.getByRole('button', { name: /повторить/i }))
  
      expect(await screen.findByText('Ок')).toBeInTheDocument()
    })
  })
  
  // ─── тест кастомного хука ───
  import { renderHook, act } from '@testing-library/react'
  
  it('useCounter увеличивает значение', () => {
    const { result } = renderHook(() => useCounter(0))
  
    expect(result.current.count).toBe(0)
    act(() => { result.current.increment() })   // act оборачивает обновление состояния
    expect(result.current.count).toBe(1)
  })
  
  // ─── управление временем (дебаунс, таймеры) ───
  it('дебаунсит вызов', async () => {
    vi.useFakeTimers()
    const spy = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(spy, 300))
  
    act(() => { result.current('a'); result.current('b') })
    act(() => { vi.advanceTimersByTime(300) })
  
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('b')
    vi.useRealTimers()
  })`,
    answer:`<h5>Почему MSW, а не мок fetch</h5>
  <p><code class="i">vi.mock('axios')</code> привязывает тест к <b>реализации</b>: смените клиент — все тесты красные. MSW перехватывает на уровне сети, поэтому тест проверяет «компонент правильно реагирует на ответ сервера», а не «мы правильно замокали библиотеку». Бонус: те же хендлеры переиспользуются в Storybook и при локальной разработке без бэкенда.</p>
  <h5>Что важно помнить</h5>
  <ul>
  <li><code class="i">findBy*</code> — асинхронный поиск с ожиданием; <code class="i">getBy*</code> — синхронный и бросает, если нет; <code class="i">queryBy*</code> — возвращает <code class="i">null</code>, единственный подходящий для проверки <b>отсутствия</b>.</li>
  <li><code class="i">userEvent</code> реалистичнее <code class="i">fireEvent</code>: он воспроизводит всю цепочку (наведение, фокус, нажатие, ввод) и ловит баги, которые <code class="i">fireEvent</code> пропускает.</li>
  <li><code class="i">act()</code> нужен, чтобы React применил обновления до проверок. В <code class="i">userEvent</code> и <code class="i">findBy*</code> он уже внутри.</li>
  <li><b>Отключайте retry</b> у React Query в тестах и очищайте кеш между кейсами — иначе тесты влияют друг на друга.</li>
  <li>Фейковые таймеры — единственный вменяемый способ тестировать debounce/throttle без реальных пауз.</li>
  </ul>
  <h5>Что тестировать на фронте</h5>
  <p><b>Стоит</b>: бизнес-логику и утилиты (чистые функции — дёшево и надёжно), кастомные хуки, критичные сценарии (логин, оплата, оформление), поведение при ошибках, доступность форм. <b>Не стоит</b>: точные CSS-классы, вёрстку (для этого скриншотные тесты), сторонние библиотеки, тривиальные компоненты без логики.</p>` },
]
