import type { TheoryArticle } from '@/engine/types'

export const testing: TheoryArticle = { id:'th-testing', topic:'Тестирование', title:'Тестирование: стратегия и инструменты',
  lead:'Что тестировать, чем и как писать тесты, которые не приходится переписывать после каждого рефакторинга.',
  body:`
<h5>Зачем тесты (кроме «чтобы были»)</h5>
<p>Главная ценность тестов — не в поиске багов, а в <b>возможности менять код без страха</b>. Проект без тестов через год превращается в код, который боятся трогать: любое изменение может сломать что-то неизвестное. Тесты — это разрешение на рефакторинг.</p>
<p>Вторая ценность — тесты фиксируют <b>намерение</b>. Хорошее название теста объясняет, что система должна делать, лучше, чем комментарий.</p>

<h5>Пирамида</h5>
<table>
<tr><th>Уровень</th><th>Доля</th><th>Что проверяет</th><th>Скорость / хрупкость</th></tr>
<tr><td><b>Unit</b></td><td>~70%</td><td>одна функция, хук, сервис в изоляции</td><td>миллисекунды / низкая</td></tr>
<tr><td><b>Integration</b></td><td>~20%</td><td>связка модулей, сервис с реальной БД</td><td>секунды / средняя</td></tr>
<tr><td><b>E2E</b></td><td>~10%</td><td>сценарий целиком глазами пользователя</td><td>минуты / высокая</td></tr>
</table>
<p>Форма пирамиды — про соотношение цены и уверенности. E2E дают больше всего уверенности, но медленны и склонны «моргать». Unit быстры, но не ловят ошибок интеграции.</p>
<p>Есть популярная альтернатива — «трофей» Кента Доддса: больше всего <b>интеграционных</b> тестов, потому что на фронтенде именно там лучшее соотношение уверенности к затратам. Изолированный тест компонента без стора и роутера часто проверяет слишком мало.</p>

<h5>Термины, которые путают</h5>
<ul>
<li><b>Stub</b> — заглушка с готовым ответом: «спросят user 1 — верни вот это».</li>
<li><b>Mock</b> — заглушка с <b>ожиданиями</b>: проверяем, что метод вызвали, столько-то раз, с такими аргументами.</li>
<li><b>Spy</b> — обёртка вокруг настоящей функции: работает как обычно, но записывает вызовы.</li>
<li><b>Fake</b> — упрощённая рабочая реализация: in-memory репозиторий вместо базы.</li>
</ul>

<h5>Главный принцип: поведение, а не реализация</h5>
<pre class="code">// ❌ тест знает внутренности — сломается при любом рефакторинге
expect(wrapper.state('isOpen')).toBe(true)
expect(component.find('.btn-primary')).toHaveLength(1)

// ✅ тест описывает то, что видит пользователь
await user.click(screen.getByRole('button', { name: /открыть/i }))
expect(screen.getByRole('dialog')).toBeVisible()</pre>
<p>Правило Testing Library: «чем больше тест похож на то, как пользуются вашим кодом, тем больше уверенности он даёт». Отсюда приоритет селекторов: <code class="i">getByRole</code> → <code class="i">getByLabelText</code> → <code class="i">getByText</code> → и только в крайнем случае <code class="i">getByTestId</code>.</p>
<div class="key">Побочный бонус, о котором редко думают: если <code class="i">getByRole('button', { name: 'Сохранить' })</code> не находит элемент — скорее всего, у вас проблема с доступностью. Один и тот же приём улучшает и тестируемость, и a11y.</div>

<div data-demo="test-selectors"></div>
<div data-demo="testing-strategy"></div>
<h5>Структура теста: AAA</h5>
<pre class="code">it('возвращает 409 при дубликате email', async () =&gt; {
  // Arrange — подготовка
  await createUser({ email: 'a@b.ru' })

  // Act — действие
  const res = await request(app.getHttpServer())
    .post('/users').send({ email: 'a@b.ru', password: 'secret12' })

  // Assert — проверка
  expect(res.status).toBe(409)
})</pre>
<p>Название описывает <b>поведение</b>: «возвращает 409 при дубликате», а не «тестирует createUser». По списку названий должно быть понятно, что умеет модуль.</p>

<h5>Тест React-компонента</h5>
<pre class="code">import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// MSW перехватывает на уровне сети — компонент и хуки не трогаем
const server = setupServer(
  http.get('/api/tasks', () =&gt; HttpResponse.json([{ id: 1, title: 'Хлеб' }])),
)
beforeAll(() =&gt; server.listen())
afterEach(() =&gt; server.resetHandlers())
afterAll(() =&gt; server.close())

function renderWithQuery(ui) {
  // retry отключаем: иначе падение теста ждёт несколько секунд
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(&lt;QueryClientProvider client={client}&gt;{ui}&lt;/QueryClientProvider&gt;)
}

it('показывает загрузку, затем список', async () =&gt; {
  renderWithQuery(&lt;TaskList /&gt;)
  expect(screen.getByRole('status')).toBeInTheDocument()
  expect(await screen.findByText('Хлеб')).toBeInTheDocument()
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})</pre>
<p><b>Почему MSW, а не мок axios.</b> <code class="i">vi.mock('axios')</code> привязывает тест к реализации: смените HTTP-клиент — все тесты красные. MSW перехватывает на уровне протокола, поэтому тест проверяет «компонент правильно реагирует на ответ сервера», а не «мы правильно замокали библиотеку». Бонус: те же хендлеры переиспользуются в Storybook и при локальной разработке без бэкенда.</p>
<p>Разница методов поиска: <code class="i">findBy*</code> — асинхронный с ожиданием; <code class="i">getBy*</code> — синхронный, бросает если нет; <code class="i">queryBy*</code> — возвращает <code class="i">null</code> и потому единственный годится для проверки <b>отсутствия</b>.</p>
<p><code class="i">userEvent</code> реалистичнее <code class="i">fireEvent</code>: он воспроизводит всю цепочку событий (наведение, фокус, нажатие, ввод) и ловит баги, которые <code class="i">fireEvent</code> пропускает.</p>

<h5>Тест хука и работа со временем</h5>
<pre class="code">const { result } = renderHook(() =&gt; useCounter(0))
act(() =&gt; { result.current.increment() })
expect(result.current.count).toBe(1)

// дебаунс без реальных пауз
vi.useFakeTimers()
act(() =&gt; { result.current('a'); result.current('b') })
act(() =&gt; { vi.advanceTimersByTime(300) })
expect(spy).toHaveBeenCalledOnce()
expect(spy).toHaveBeenCalledWith('b')
vi.useRealTimers()</pre>

<h5>Тест сервиса NestJS</h5>
<pre class="code">const module = await Test.createTestingModule({
  providers: [
    UserService,
    { provide: getRepositoryToken(User), useValue: { findOne: jest.fn(), save: jest.fn() } },
    { provide: MailService, useValue: { send: jest.fn() } },
  ],
}).compile()

it('не сохраняет и бросает конфликт, если email занят', async () =&gt; {
  repo.findOne.mockResolvedValue({ id: 2 })
  await expect(service.create(dto)).rejects.toThrow(ConflictException)
  expect(repo.save).not.toHaveBeenCalled()      // побочки не произошло
})</pre>
<p>Проверять стоит не только счастливый путь, но и ошибки, и <b>отсутствие побочных эффектов</b>. Для БД лучше настоящий Postgres в контейнере (testcontainers), чем sqlite: диалекты SQL различаются, и тесты начинают врать.</p>

<h5>Что мокать, а что нет</h5>
<ul>
<li><b>Мокать</b>: сеть, время, случайность, внешние сервисы (платежи, почта), файловую систему.</li>
<li><b>Не мокать</b>: собственную бизнес-логику и чистые функции — их и надо проверять.</li>
</ul>
<p>Тест, в котором замокано всё, проверяет только корректность моков.</p>

<h5>Борьба с нестабильными тестами</h5>
<p><b>Flaky-тест хуже отсутствующего</b>: ему перестают верить и начинают вслепую перезапускать CI, а вместе с ним игнорируют и настоящие падения.</p>
<ul>
<li>Никаких <code class="i">sleep(1000)</code> — только ожидание конкретного условия. В Playwright есть автоожидание, в Testing Library — <code class="i">findBy</code> и <code class="i">waitFor</code>.</li>
<li>Изоляция: чистая БД и кеш между тестами, никакой зависимости от порядка выполнения.</li>
<li>Фиксируйте время и часовой пояс, если логика от них зависит.</li>
<li>Тест, зависящий от внешнего API, будет падать по независящим от вас причинам.</li>
</ul>

<h5>Про покрытие</h5>
<p>100% — плохая цель. Покрытие показывает, какой код <b>исполнялся</b>, а не какой <b>проверен</b>: тест без единого <code class="i">expect</code> даёт покрытие. Разумнее высокое покрытие критичной бизнес-логики и платежей и низкое — для тривиальных геттеров и вёрстки.</p>
<p><b>Стратегия для продукта:</b> начните с трёх-пяти e2e на денежные сценарии (регистрация, оплата, основное действие) — они дают максимум уверенности за минимум тестов. Затем unit на бизнес-логику. Компонентные тесты — для сложных интерактивных узлов, а не для каждой кнопки.</p>` }
