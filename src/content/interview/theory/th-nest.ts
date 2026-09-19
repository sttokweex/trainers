import type { TheoryArticle } from '@/engine/types'

export const nest: TheoryArticle = { id:'th-nest', topic:'Node / Nest', title:'NestJS: анатомия приложения',
  lead:'Как устроено приложение на Nest — от точки входа до репозитория, с разбором DI и жизненного цикла запроса.',
  body:`
<h5>Что такое Nest и зачем он</h5>
<p>Express даёт роутер и middleware — и всё. На проекте из двадцати эндпоинтов этого достаточно, на проекте из трёхсот начинается хаос: у каждого свой способ организовать папки, провалидировать вход, обработать ошибку. Nest — это <b>навязанная архитектура</b> поверх Express или Fastify: модули, внедрение зависимостей, декларативная валидация, единая обработка ошибок.</p>
<p>Цена — больше церемоний и порог входа. Выгода — любой разработчик, знающий Nest, за час ориентируется в вашем проекте, а тестируемость встроена в саму конструкцию.</p>

<h5>Слои</h5>
<pre class="code">main.ts            точка входа: создание приложения, глобальные пайпы, CORS, Swagger
AppModule          корневой модуль: конфигурация, подключение БД, импорт фич
  └─ TaskModule
       ├─ TaskController   HTTP-слой: роуты, DTO, коды ответов. Логики НЕТ
       ├─ TaskService      бизнес-логика. Про HTTP ничего не знает
       ├─ TaskRepository   доступ к данным
       ├─ Task (Entity)    описание таблицы
       └─ dto/             контракты входа и выхода + правила валидации</pre>
<p>Главное правило: <b>контроллер тонкий, сервис не знает про HTTP</b>. Если в сервисе появился <code class="i">@Res()</code> или разбор заголовков — слои поехали. Обратный случай — толстый контроллер с бизнес-логикой — делает её непереиспользуемой: ту же операцию нельзя будет вызвать из обработчика очереди или из CLI-скрипта.</p>
<div class="note">Практическая оговорка: бросать <code class="i">NotFoundException</code> прямо из сервиса — распространённая практика, хотя формально это привязка к HTTP. Для большинства приложений это нормальный компромисс; в строгой чистой архитектуре сервис бросает доменную ошибку, а фильтр превращает её в код ответа.</div>

<h5>Dependency Injection: как это работает</h5>
<p>При старте Nest строит <b>граф зависимостей</b>. Он читает метаданные конструктора — массив <code class="i">design:paramtypes</code>, который TypeScript эмитит благодаря флагу <code class="i">emitDecoratorMetadata</code>, — находит провайдер по <b>токену</b> и подставляет экземпляр.</p>
<pre class="code">@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly repo: Repository&lt;Task&gt;,
    private readonly config: ConfigService,    // токен — сам класс
    @Inject('MAILER') private readonly mailer: Mailer,   // строковый токен
  ) {}
}</pre>
<p>Именно поэтому <b>интерфейс инжектить нельзя</b>: после компиляции его не существует, и в метаданные попадёт <code class="i">Object</code>. Для абстракций используют строковые или Symbol-токены.</p>

<h5>Виды провайдеров</h5>
<pre class="code">providers: [
  TaskService,                                        // класс: токен = сам класс
  { provide: 'CONFIG', useValue: { ttl: 60 } },        // готовое значение
  { provide: MAILER, useClass: isProd ? Smtp : Fake }, // подмена реализации
  {
    provide: 'REDIS',                                  // фабрика с зависимостями
    useFactory: (cfg: ConfigService) =&gt; createClient({ url: cfg.get('REDIS_URL') }),
    inject: [ConfigService],
  },
  { provide: 'ALIAS', useExisting: TaskService },      // второй токен, тот же объект
]</pre>

<h5>Модули и главная ошибка новичка</h5>
<pre class="code">@Module({
  imports: [TypeOrmModule.forFeature([Task]), UserModule],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],      // ← без этого другие модули его НЕ увидят
})
export class TaskModule {}</pre>
<p>Провайдер виден только внутри своего модуля, пока не добавлен в <code class="i">exports</code>, а модуль — в <code class="i">imports</code> потребителя. Отсюда самая частая ошибка старта:</p>
<pre class="code">Nest can't resolve dependencies of the TaskService (?, ConfigService)</pre>
<p>Вопросительный знак показывает <b>позицию</b> нерезолвнутого аргумента — считайте по порядку в конструкторе. Причин обычно три: забыли <code class="i">exports</code>, забыли <code class="i">imports</code>, или пропустили <code class="i">@Injectable()</code> на классе.</p>

<h5>Scope провайдеров</h5>
<table>
<tr><th>Scope</th><th>Экземпляр</th><th>Когда</th></tr>
<tr><td><code class="i">DEFAULT</code></td><td>один на приложение (синглтон)</td><td>всегда, если нет веских причин иного</td></tr>
<tr><td><code class="i">REQUEST</code></td><td>новый на каждый запрос</td><td>нужен контекст запроса: текущий юзер, tenant</td></tr>
<tr><td><code class="i">TRANSIENT</code></td><td>новый на каждого потребителя</td><td>редко</td></tr>
</table>
<div class="warn">REQUEST-scope «заражает» цепочку: все провайдеры, которые от него зависят, тоже становятся request-scoped, и это заметно бьёт по производительности. Чаще правильнее <code class="i">AsyncLocalStorage</code> (или пакет <code class="i">nestjs-cls</code>): контекст запроса доступен где угодно, а провайдеры остаются синглтонами.</div>

<h5>Жизненный цикл запроса</h5>
<pre class="code">Входящий запрос
  → Middleware          уровень Express/Fastify: есть req, res, next
  → Guards              можно ли выполнять? true/false или исключение
  → Interceptors (до)   обёртка вокруг обработчика
  → Pipes               валидация и преобразование аргументов
  → ОБРАБОТЧИК контроллера → сервис → репозиторий
  → Interceptors (после) преобразование ответа через RxJS
  → Exception filters   если где-то бросили исключение
  → Ответ</pre>
<p>На каждом уровне порядок применения: <b>глобальные → уровня контроллера → уровня метода</b>.</p>
<table>
<tr><th>Элемент</th><th>Задача</th><th>Пример</th></tr>
<tr><td>Middleware</td><td>сырая работа с запросом до роутинга</td><td>логирование, raw body для вебхука платёжки</td></tr>
<tr><td>Guard</td><td>решение «пускать или нет»</td><td>JwtAuthGuard, RolesGuard, ThrottlerGuard</td></tr>
<tr><td>Interceptor</td><td>до и после, поток RxJS</td><td>замер времени, кеш, формат ответа, таймаут</td></tr>
<tr><td>Pipe</td><td>валидация и трансформация входа</td><td>ValidationPipe, ParseIntPipe</td></tr>
<tr><td>Filter</td><td>исключение → HTTP-ответ</td><td>единый формат ошибки</td></tr>
</table>
<p><b>Почему авторизация в guard, а не в middleware?</b> Guard получает <code class="i">ExecutionContext</code>: знает, какой контроллер и метод вызываются и какие на них метаданные. Это позволяет читать <code class="i">@Roles('admin')</code> через <code class="i">Reflector</code>. Middleware работает до роутинга и этого не знает. Плюс guard работает и для WebSocket, и для gRPC.</p>
<p><b>Почему pipes после guards?</b> Незачем валидировать тело запроса от того, кому вообще нельзя сюда обращаться.</p>

<div data-demo="nest-lifecycle"></div>
<h5>Контроллер на практике</h5>
<pre class="code">@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly tasks: TaskService) {}

  @Get()
  findAll(@Query() query: TaskQueryDto, @CurrentUser('id') userId: number) {
    return this.tasks.findAll(query, userId)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasks.findOne(id)
  }

  @Post()
  @HttpCode(201)
  @Roles('admin')
  create(@Body() dto: CreateTaskDto) {
    return this.tasks.create(dto)
  }
}</pre>
<p>Декораторы параметров: <code class="i">@Param</code>, <code class="i">@Query</code>, <code class="i">@Body</code>, <code class="i">@Headers</code>, <code class="i">@Req</code>, <code class="i">@Ip</code>, <code class="i">@UploadedFile</code>. Свои делаются через <code class="i">createParamDecorator</code> — так и появляется <code class="i">@CurrentUser()</code>.</p>
<div class="warn">Использование <code class="i">@Res()</code> отключает автоматическую сериализацию: отвечать придётся вручную, иначе запрос «повиснет». Это частая причина зависших ручек.</div>

<h5>Валидация</h5>
<pre class="code">export class CreateTaskDto {
  @IsString() @MinLength(3) @MaxLength(200)
  title: string

  @IsOptional() @IsInt() @Min(1)
  @Type(() =&gt; Number)
  projectId?: number
}

app.useGlobalPipes(new ValidationPipe({
  whitelist: true,             // вырезать поля, которых нет в DTO
  forbidNonWhitelisted: true,  // или сразу 400 на лишние
  transform: true,             // plain object → экземпляр DTO
}))</pre>
<p><code class="i">whitelist: true</code> — <b>обязательная настройка для продакшена</b>. Без неё клиент может прислать лишние поля вроде <code class="i">isAdmin: true</code>, и если где-то в коде делается <code class="i">repo.save(dto)</code>, это превращается в уязвимость mass assignment.</p>
<p><code class="i">transform: true</code> тоже важен: без него <code class="i">projectId</code> из query останется строкой <code class="i">'25'</code>, и проверка <code class="i">@IsInt()</code> провалится.</p>

<h5>Работа с БД через TypeORM</h5>
<pre class="code">@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn() id: number
  @Column({ length: 200 })   title: string
  @Column({ default: false }) done: boolean

  @ManyToOne(() =&gt; User, u =&gt; u.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ name: 'user_id' }) userId: number   // держать FK отдельно удобно
  @CreateDateColumn() createdAt: Date
  @VersionColumn()    version: number           // оптимистичная блокировка
}

// запросы
await repo.find({ where: { userId }, relations: { user: true }, take: 20 })
await repo.update({ id }, { done: true })       // без загрузки сущности
await dataSource.transaction(async (manager) =&gt; { /* ... */ })</pre>

<h5>Тестируемость — главная практическая выгода DI</h5>
<pre class="code">const module = await Test.createTestingModule({
  providers: [
    TaskService,
    { provide: getRepositoryToken(Task), useValue: { find: jest.fn() } },
    { provide: MailService, useValue: { send: jest.fn() } },
  ],
}).compile()

const service = module.get(TaskService)</pre>
<p>Никаких правок в самом сервисе не нужно: зависимости приходят снаружи, и в тесте вы подставляете что угодно. Это и есть ответ на вопрос «зачем нужен DI» — не «для красоты», а ради возможности заменить границы системы.</p>

<h5>Эксплуатационные привычки</h5>
<ul>
<li><b>Валидировать env на старте</b> (joi или zod в <code class="i">ConfigModule</code>) — приложение должно падать сразу при отсутствии переменной, а не через час на первом запросе.</li>
<li><b>Не возвращать сущность БД напрямую</b>: маппить в DTO ответа или использовать <code class="i">@Exclude()</code> + <code class="i">ClassSerializerInterceptor</code>. Иначе однажды наружу уедет <code class="i">passwordHash</code>.</li>
<li><b><code class="i">app.enableShutdownHooks()</code></b> и закрытие соединений в <code class="i">onModuleDestroy</code> — иначе каждый деплой рвёт живые запросы и транзакции.</li>
<li><b>Health-эндпоинты</b> через <code class="i">@nestjs/terminus</code>: liveness (процесс жив) и readiness (готов принимать трафик) — это разные вещи, и путать их опасно: если liveness проверяет БД, то лежащая база вызовет бесконечный рестарт-луп.</li>
<li><b>Циклические зависимости</b> лечатся <code class="i">forwardRef</code>, но это симптом: обычно правильнее вынести общее в третий модуль или развязать через события.</li>
</ul>` }
