import type { Question } from '@/engine/types'

/** Node / Nest — 10 вопрос(ов) */
export const nodeNestQuestions: Question[] = [
  { id:'node-loop', topic:'Node / Nest', type:'theory', level:'senior',
    q:'Опишите event loop в Node.js: фазы, <code class="i">process.nextTick</code> vs промисы vs <code class="i">setImmediate</code>. Что выведет код?',
    code:`setTimeout(() => console.log('timeout'), 0)
  setImmediate(() => console.log('immediate'))
  process.nextTick(() => console.log('nextTick'))
  Promise.resolve().then(() => console.log('promise'))
  console.log('sync')`,
    answer:`<h5>Ответ на код</h5>
  <p><code class="i">sync</code> → <code class="i">nextTick</code> → <code class="i">promise</code> → дальше <b>timeout и immediate в непредсказуемом порядке</b>. Это не подвох, а честный факт: на старте главного модуля порядок зависит от того, успел ли пройти 1 мс таймера к моменту входа в цикл. <b>Но</b> внутри I/O-колбэка порядок детерминирован: <code class="i">setImmediate</code> всегда раньше <code class="i">setTimeout</code>, потому что фаза check идёт сразу после poll.</p>
  <h5>Фазы цикла (по кругу)</h5>
  <ol>
  <li><b>timers</b> — колбэки <code class="i">setTimeout</code>/<code class="i">setInterval</code>.</li>
  <li><b>pending callbacks</b> — отложенные системные колбэки (например, ошибки TCP).</li>
  <li><b>idle / prepare</b> — внутреннее.</li>
  <li><b>poll</b> — получение новых I/O-событий, выполнение их колбэков. Здесь Node может <b>заблокироваться в ожидании</b>, если нет других задач.</li>
  <li><b>check</b> — <code class="i">setImmediate</code>.</li>
  <li><b>close callbacks</b> — <code class="i">socket.on('close')</code>.</li>
  </ol>
  <h5>Микрозадачи</h5>
  <p>Между <b>каждым</b> колбэком (а не только между фазами) Node разгребает две очереди по порядку: сначала <b><code class="i">process.nextTick</code></b>, потом <b>промисы</b>. <code class="i">nextTick</code> имеет более высокий приоритет — и поэтому рекурсивный <code class="i">nextTick</code> способен полностью заморозить цикл (I/O никогда не получит управление). В прикладном коде его почти не используют.</p>
  <h5>libuv</h5>
  <p>C-библиотека под капотом: цикл событий + <b>пул потоков</b> (по умолчанию 4, <code class="i">UV_THREADPOOL_SIZE</code>). Важная деталь: сетевой I/O делается через эпоll/kqueue <b>без</b> пула, а вот файловые операции, DNS (<code class="i">dns.lookup</code>), <code class="i">crypto.pbkdf2</code>, zlib — <b>в пуле</b>. Отсюда: тяжёлое хеширование паролей может выесть пул и затормозить файловые операции.</p>
  <h5>Главный практический вывод</h5>
  <p>Node однопоточен для <b>вашего JS</b>. Любая долгая синхронная операция (JSON.parse на 50 МБ, сортировка миллиона записей, синхронный <code class="i">fs.readFileSync</code>, regex с катастрофическим бэктрекингом) <b>блокирует все запросы</b>. Лечение: <code class="i">worker_threads</code> для CPU-задач, очередь (Bull) для фоновой работы, стримы вместо чтения целиком, <code class="i">cluster</code>/PM2 или несколько реплик для масштабирования по ядрам.</p>` },
  { id:'node-streams', topic:'Node / Nest', type:'theory', level:'senior',
    q:'Что такое стримы и backpressure? Почему загрузку файла в S3/MinIO нельзя делать через <code class="i">readFile</code>?',
    code:`// ❌ весь файл в память: 2 ГБ файл = 2 ГБ RSS = OOM
  const data = await fs.promises.readFile(path)
  await s3.putObject(bucket, key, data)
  
  // ✅ поток: память ~ размер буфера
  await pipeline(
    fs.createReadStream(path),
    zlib.createGzip(),
    s3UploadStream(bucket, key),
  )`,
    answer:`<h5>Четыре типа стримов</h5>
  <p><b>Readable</b> (источник: файл, HTTP-запрос), <b>Writable</b> (приёмник: файл, HTTP-ответ), <b>Duplex</b> (сокет), <b>Transform</b> (gzip, шифрование, парсер CSV).</p>
  <h5>Backpressure — суть вопроса</h5>
  <p>Ситуация, когда источник отдаёт данные быстрее, чем приёмник их принимает. Без обратного давления буфер растёт бесконечно → память кончается.</p>
  <p>Механизм: <code class="i">writable.write()</code> возвращает <code class="i">false</code>, когда внутренний буфер перевалил за <code class="i">highWaterMark</code> (по умолчанию 64 КБ). Правильная реакция — <code class="i">readable.pause()</code> и возобновление по событию <code class="i">'drain'</code>. <code class="i">pipe()</code> и <code class="i">pipeline()</code> делают это автоматически — поэтому руками цепочки почти никогда не собирают.</p>
  <h5>Почему pipeline, а не pipe</h5>
  <p><code class="i">pipe()</code> <b>не пробрасывает ошибки</b> и не закрывает остальные стримы при сбое — получаются висящие дескрипторы и утечки. <code class="i">stream.pipeline()</code> (или <code class="i">pipeline</code> из <code class="i">stream/promises</code>) корректно разрушает всю цепочку и отдаёт ошибку.</p>
  <h5>Где встречается в ваших проектах</h5>
  <ul>
  <li>Загрузка аватаров/видео в MinIO/S3 (оба есть в зависимостях) — стримом, не в память.</li>
  <li>Экспорт большого CSV: <code class="i">csv-writer</code> пишет в поток ответа, браузер получает файл постепенно, сервер держит константную память.</li>
  <li>Обработка изображений через <code class="i">sharp</code> — тоже поддерживает потоковый режим.</li>
  <li>Async iterator поверх стрима: <code class="i">for await (const chunk of stream)</code> — самый читаемый способ.</li>
  </ul>` },
  { id:'nest-di', topic:'Node / Nest', type:'theory', level:'middle',
    q:'Как работает Dependency Injection в NestJS? Что такое провайдер, токен, scope? Как решать циклические зависимости?',
    answer:`<h5>Схема</h5>
  <p>При старте Nest строит <b>граф зависимостей</b>: читает <code class="i">design:paramtypes</code> из метаданных конструктора (спасибо <code class="i">emitDecoratorMetadata</code>), находит провайдер по <b>токену</b> и подставляет инстанс. Провайдеры по умолчанию <b>синглтоны</b> на всё приложение.</p>
  <h5>Виды провайдеров</h5>
  <pre class="code">providers: [
    UserService,                                          // класс (токен = сам класс)
    { provide: 'CONFIG', useValue: { ttl: 60 } },          // готовое значение
    { provide: MAILER, useClass: isProd ? SmtpMailer : FakeMailer },
    {                                                     // фабрика + зависимости
      provide: 'REDIS',
      useFactory: (cfg: ConfigService) =&gt; createClient({ url: cfg.get('REDIS_URL') }),
      inject: [ConfigService],
    },
    { provide: 'ALIAS', useExisting: UserService },        // второй токен на тот же инстанс
  ]</pre>
  <h5>Модули и видимость</h5>
  <p>Провайдер доступен только внутри своего модуля, пока его не положили в <code class="i">exports</code>, а модуль не добавили в <code class="i">imports</code>. Это главный источник ошибки <code class="i">Nest can't resolve dependencies of X (?)</code> — вопросительный знак показывает <b>позицию</b> нерезолвнутого аргумента.</p>
  <h5>Scope</h5>
  <table>
  <tr><th>Scope</th><th>Инстанс</th><th>Когда</th></tr>
  <tr><td>DEFAULT</td><td>один на приложение</td><td>всегда, если нет причин иного</td></tr>
  <tr><td>REQUEST</td><td>новый на каждый запрос</td><td>нужен контекст запроса (текущий юзер, tenant, trace id)</td></tr>
  <tr><td>TRANSIENT</td><td>новый на каждого потребителя</td><td>редко</td></tr>
  </table>
  <p><b>Важно:</b> REQUEST-scope «заражает» всю цепочку — все зависящие провайдеры тоже станут request-scoped, а это заметный удар по производительности. Чаще правильнее <code class="i">AsyncLocalStorage</code> (CLS) или <code class="i">nestjs-cls</code>.</p>
  <h5>Циклические зависимости</h5>
  <p>Между сервисами — <code class="i">@Inject(forwardRef(() =&gt; OtherService))</code>, между модулями — <code class="i">forwardRef(() =&gt; OtherModule)</code> в imports. Но это <b>симптом</b>: обычно правильнее вынести общую логику в третий модуль или развязать через события (<code class="i">@nestjs/event-emitter</code>).</p>
  <h5>Зачем DI вообще</h5>
  <p>Слабая связанность и <b>тестируемость</b>: в тесте подменяем провайдер моком через <code class="i">Test.createTestingModule({...}).overrideProvider(UserService).useValue(mock)</code> — без правок в коде сервиса.</p>` },
  { id:'nest-lifecycle', topic:'Node / Nest', type:'theory', level:'middle',
    q:'В каком порядке выполняются Middleware, Guard, Interceptor, Pipe, Filter в NestJS? За что отвечает каждый?',
    answer:`<h5>Порядок запроса</h5>
  <pre class="code">Входящий запрос
    → Middleware             (express/fastify-уровень, есть req/res/next)
    → Guards                 (можно ли выполнять? → true/false или 403)
    → Interceptors (до)      (обёртка вокруг обработчика)
    → Pipes                  (валидация и трансформация аргументов)
    → ОБРАБОТЧИК контроллера
    → Interceptors (после)   (преобразование ответа через RxJS)
    → Exception filters      (если где-то бросили исключение)
    → Ответ</pre>
  <p>На каждом уровне порядок применения: <b>глобальные → уровня контроллера → уровня метода</b>.</p>
  <h5>Кто за что отвечает</h5>
  <table>
  <tr><th>Элемент</th><th>Задача</th><th>Типичный пример</th></tr>
  <tr><td>Middleware</td><td>сырая работа с req/res до роутинга</td><td>логирование, cors, cookie-parser, raw body для вебхука</td></tr>
  <tr><td>Guard</td><td>решение «пускать или нет»</td><td>JwtAuthGuard, RolesGuard, ThrottlerGuard</td></tr>
  <tr><td>Interceptor</td><td>обёртка до и после, RxJS-поток</td><td>замер времени, кеш, маппинг в DTO ответа, ClassSerializerInterceptor, таймаут</td></tr>
  <tr><td>Pipe</td><td>валидация/преобразование входа</td><td>ValidationPipe, ParseIntPipe, ZodValidationPipe</td></tr>
  <tr><td>Filter</td><td>превращение исключения в ответ</td><td>единый формат ошибки, маппинг ошибок БД в HTTP</td></tr>
  </table>
  <h5>Частые вопросы-уточнения</h5>
  <ul>
  <li><b>Почему guard, а не middleware для авторизации?</b> Guard знает контекст выполнения (<code class="i">ExecutionContext</code>): какой контроллер и метод вызываются, какие на них метаданные (<code class="i">@Roles('admin')</code> через <code class="i">Reflector</code>). Middleware этого не знает — он до роутинга. Плюс guard работает и для WebSocket/gRPC.</li>
  <li><b>Почему pipes после guards?</b> Незачем валидировать тело запроса от того, кому вообще нельзя сюда стучаться.</li>
  <li><b>Глобальные фильтры/пайпы через <code class="i">app.useGlobalPipes()</code> не умеют DI.</b> Если нужны зависимости — регистрируйте провайдером с токеном <code class="i">APP_PIPE</code>/<code class="i">APP_GUARD</code>/<code class="i">APP_FILTER</code>/<code class="i">APP_INTERCEPTOR</code>.</li>
  </ul>` },
  { id:'nest-guard', topic:'Node / Nest', type:'manual', level:'middle',
    q:'Напишите <code class="i">RolesGuard</code> с декоратором <code class="i">@Roles(...)</code> и параметр-декоратор <code class="i">@CurrentUser()</code>.',
    starter:`// @Roles('admin')
  // @Get('users')
  // findAll(@CurrentUser() user: User) {}`,
    solution:`// ---- decorators/roles.decorator.ts ----
  import { SetMetadata } from '@nestjs/common'
  export const ROLES_KEY = 'roles'
  export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles)
  
  // ---- decorators/current-user.decorator.ts ----
  import { createParamDecorator, ExecutionContext } from '@nestjs/common'
  export const CurrentUser = createParamDecorator(
    (field: keyof User | undefined, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest()
      const user = request.user                  // положил туда JwtAuthGuard
      return field ? user?.[field] : user        // @CurrentUser('id') тоже работает
    },
  )
  
  // ---- guards/roles.guard.ts ----
  import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
  import { Reflector } from '@nestjs/core'
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      // getAllAndOverride: метод перекрывает контроллер
      const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ])
      if (!required?.length) return true          // роли не заданы — пускаем
  
      const { user } = context.switchToHttp().getRequest()
      if (!user) throw new ForbiddenException('Не аутентифицирован')
  
      const allowed = required.some(role => user.roles?.includes(role))
      if (!allowed) throw new ForbiddenException('Недостаточно прав')
      return true
    }
  }
  
  // ---- регистрация глобально, с поддержкой DI ----
  @Module({
    providers: [
      { provide: APP_GUARD, useClass: JwtAuthGuard },   // порядок важен:
      { provide: APP_GUARD, useClass: RolesGuard },     // сначала кто ты, потом что можно
    ],
  })
  export class AppModule {}`,
    answer:`<h5>Что здесь проверяют</h5>
  <ul>
  <li><b>Reflector</b> — механизм чтения метаданных, которые положил <code class="i">SetMetadata</code>. <code class="i">getAllAndOverride</code> берёт ближайшее значение (метод важнее контроллера), <code class="i">getAllAndMerge</code> — объединяет.</li>
  <li><b>Порядок глобальных guard'ов</b> — по порядку регистрации провайдеров. Аутентификация обязана идти до авторизации, иначе <code class="i">request.user</code> ещё пуст.</li>
  <li><b>createParamDecorator</b> — способ вытащить что угодно из контекста в аргумент метода. Убирает <code class="i">@Req() req</code> из контроллеров и делает их тестируемыми.</li>
  <li><code class="i">canActivate</code> может вернуть <code class="i">boolean</code>, <code class="i">Promise</code> или <code class="i">Observable</code>. <code class="i">false</code> даёт 403; бросить своё исключение — способ уточнить причину.</li>
  </ul>
  <h5>Доп-вопрос: как сделать публичный эндпоинт при глобальном guard</h5>
  <pre class="code">export const Public = () =&gt; SetMetadata('isPublic', true)
  // в guard:
  if (this.reflector.getAllAndOverride('isPublic', [ctx.getHandler(), ctx.getClass()]))
    return true</pre>
  <div class="hint">Аутентификация = «кто ты» (JWT-стратегия Passport). Авторизация = «что тебе можно» (роли/права). Путать их на собесе — классический минус.</div>` },
  { id:'nest-interceptor', topic:'Node / Nest', type:'manual', level:'middle',
    q:'Напишите Interceptor, который логирует время выполнения запроса и оборачивает любой ответ в <code class="i">{ data, meta }</code>. Плюс перехват ошибок БД в Exception Filter.',
    starter:`// Ожидаемый ответ: { data: <результат>, meta: { took: 12 } }`,
    solution:`// ---- interceptors/transform.interceptor.ts ----
  import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common'
  import { Observable } from 'rxjs'
  import { map, tap, timeout, catchError } from 'rxjs/operators'
  
  @Injectable()
  export class TransformInterceptor<T> implements NestInterceptor<T, { data: T }> {
    private readonly logger = new Logger(TransformInterceptor.name)
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<{ data: T }> {
      const started = Date.now()
      const req = context.switchToHttp().getRequest()
  
      // всё ДО next.handle() выполняется до обработчика
      return next.handle().pipe(
        // всё внутри pipe — после того, как обработчик вернул значение
        timeout(10_000),
        map(data => ({ data, meta: { took: Date.now() - started } })),
        tap(() => this.logger.log(\`\${req.method} \${req.url} — \${Date.now() - started}ms\`)),
      )
    }
  }
  
  // ---- filters/db-exception.filter.ts ----
  import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common'
  import { QueryFailedError } from 'typeorm'
  
  @Catch()                                  // без аргумента — ловит ВСЁ
  export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name)
  
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp()
      const res = ctx.getResponse()
      const req = ctx.getRequest()
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR
      let message = 'Внутренняя ошибка'
  
      if (exception instanceof HttpException) {
        status = exception.getStatus()
        message = exception.message
      } else if (exception instanceof QueryFailedError) {
        // 23505 — unique_violation в Postgres
        if ((exception as any).code === '23505') {
          status = HttpStatus.CONFLICT
          message = 'Запись с такими данными уже существует'
        }
      }
  
      // 5xx логируем со стеком, 4xx — это ожидаемые ошибки клиента
      if (status >= 500) this.logger.error(exception)
  
      res.status(status).json({
        statusCode: status,
        message,
        path: req.url,
        timestamp: new Date().toISOString(),
      })
    }
  }`,
    answer:`<h5>Про интерцептор</h5>
  <ul>
  <li>Работает на <b>RxJS</b>: <code class="i">next.handle()</code> возвращает <code class="i">Observable</code> результата обработчика. Код до вызова — «до», операторы в <code class="i">pipe</code> — «после».</li>
  <li>Типовые применения: единый формат ответа, замер времени, кеш (вернуть <code class="i">of(cached)</code> вообще не вызывая <code class="i">next.handle()</code>), <code class="i">timeout</code>, <code class="i">ClassSerializerInterceptor</code> (убирает поля с <code class="i">@Exclude()</code> — так прячут <code class="i">passwordHash</code>).</li>
  </ul>
  <h5>Про фильтр</h5>
  <ul>
  <li><code class="i">@Catch(QueryFailedError)</code> — ловить конкретный тип; <code class="i">@Catch()</code> — всё подряд.</li>
  <li>Главная ценность: <b>единый формат ошибки</b> для фронтенда и отсутствие утечки внутренностей БД наружу (текст SQL-ошибки в ответе — это и подсказка атакующему, и стыд).</li>
  <li>Иерархия: <code class="i">HttpException</code> → <code class="i">BadRequestException</code> (400), <code class="i">UnauthorizedException</code> (401), <code class="i">ForbiddenException</code> (403), <code class="i">NotFoundException</code> (404), <code class="i">ConflictException</code> (409), <code class="i">UnprocessableEntityException</code> (422), <code class="i">TooManyRequestsException</code> (429).</li>
  <li>Логировать 5xx со стеком, 4xx — нет (иначе логи заспамит обычная валидация).</li>
  </ul>
  <div class="hint">Если в фильтре используется Fastify, помните: у него <code class="i">res.status(...).send(...)</code>, а не <code class="i">.json(...)</code>. У вас в проектах есть оба адаптера — это хороший повод показать, что вы знаете разницу.</div>` },
  { id:'nest-validation', topic:'Node / Nest', type:'theory', level:'middle',
    q:'Как валидировать входящие данные в NestJS? DTO + class-validator или zod — что выбрать и почему?',
    code:`export class CreateUserDto {
    @IsEmail()
    email: string
  
    @IsString() @MinLength(8)
    password: string
  
    @IsOptional() @IsInt() @Min(18) @Max(120)
    @Type(() => Number)
    age?: number
  }
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // вырезать поля, которых нет в DTO
    forbidNonWhitelisted: true, // или сразу 400 на лишние поля
    transform: true,            // превращать plain object в инстанс DTO
    transformOptions: { enableImplicitConversion: true },
  }))`,
    answer:`<h5>Как это работает</h5>
  <p><code class="i">ValidationPipe</code> берёт метаданные типа параметра (<code class="i">design:paramtypes</code>), через <code class="i">class-transformer</code> превращает JSON в инстанс DTO-класса, затем <code class="i">class-validator</code> проверяет декораторы. Ошибки собираются в 400 с массивом сообщений.</p>
  <h5>Критичные опции</h5>
  <ul>
  <li><code class="i">whitelist: true</code> — <b>обязательно в проде</b>. Без неё клиент может прислать лишние поля (<code class="i">isAdmin: true</code>), и если где-то делается <code class="i">repo.save(dto)</code>, это mass assignment уязвимость.</li>
  <li><code class="i">transform: true</code> — иначе <code class="i">age</code> из query останется строкой <code class="i">'25'</code>, и <code class="i">@IsInt()</code> упадёт (или, хуже, не упадёт, а сломается сравнение).</li>
  </ul>
  <h5>class-validator vs zod</h5>
  <table>
  <tr><th>class-validator + DTO</th><th>zod</th></tr>
  <tr><td>нативно для Nest, работает с DI и Swagger</td><td>одна схема = валидация + тип (<code class="i">z.infer</code>)</td></tr>
  <tr><td>нужны классы и декораторы, тип и правила дублируются</td><td>работает где угодно, включая фронт</td></tr>
  <tr><td><code class="i">@nestjs/swagger</code> генерирует доку из DTO</td><td>нужен <code class="i">ZodValidationPipe</code> и доп. пакет для Swagger</td></tr>
  <tr><td>сложные условные правила громоздки</td><td><code class="i">refine</code>/<code class="i">superRefine</code>/discriminatedUnion удобнее</td></tr>
  </table>
  <p>Практический ответ: в Nest-контроллерах с REST+Swagger — DTO и class-validator; в tRPC-процедурах и на фронте — zod. В ваших проектах ровно так и есть, и <b>лучший аргумент — переиспользование схемы между клиентом и сервером в монорепе</b>.</p>
  <div class="trap">Главный тезис для собеса: <b>никогда не доверяйте клиенту</b>. TypeScript-типы исчезают при компиляции и ничего не проверяют в рантайме — валидация на границе обязательна, даже если фронт «свой».</div>` },
  { id:'nest-test', topic:'Node / Nest', type:'manual', level:'middle',
    q:'Напишите unit-тест для сервиса NestJS с замоканным репозиторием. В чём разница unit / integration / e2e?',
    starter:`// UserService зависит от Repository<User> и MailService`,
    solution:`import { Test, TestingModule } from '@nestjs/testing'
  import { getRepositoryToken } from '@nestjs/typeorm'
  
  describe('UserService', () => {
    let service: UserService
    let repo: jest.Mocked<Repository<User>>
    const mailer = { send: jest.fn() }
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UserService,
          {
            // токен репозитория TypeORM — getRepositoryToken(Entity)
            provide: getRepositoryToken(User),
            useValue: { findOne: jest.fn(), save: jest.fn(), create: jest.fn(x => x) },
          },
          { provide: MailService, useValue: mailer },
        ],
      }).compile()
  
      service = module.get(UserService)
      repo = module.get(getRepositoryToken(User))
    })
  
    afterEach(() => jest.clearAllMocks())
  
    it('создаёт пользователя и отправляет письмо', async () => {
      repo.findOne.mockResolvedValue(null)                     // такого email ещё нет
      repo.save.mockResolvedValue({ id: 1, email: 'a@b.ru' } as User)
  
      const result = await service.create({ email: 'a@b.ru', password: 'secret12' })
  
      expect(result.id).toBe(1)
      expect(mailer.send).toHaveBeenCalledWith('a@b.ru', expect.any(String))
      // пароль не должен утечь в ответ
      expect(result).not.toHaveProperty('password')
    })
  
    it('бросает ConflictException, если email занят', async () => {
      repo.findOne.mockResolvedValue({ id: 2 } as User)
  
      await expect(service.create({ email: 'a@b.ru', password: 'secret12' }))
        .rejects.toThrow(ConflictException)
  
      expect(repo.save).not.toHaveBeenCalled()                 // побочки не произошло
    })
  })`,
    answer:`<h5>Три уровня тестов</h5>
  <table>
  <tr><th>Уровень</th><th>Что проверяет</th><th>Зависимости</th><th>Скорость</th></tr>
  <tr><td>Unit</td><td>логика одного класса</td><td>всё замокано</td><td>мс</td></tr>
  <tr><td>Integration</td><td>связка модулей + реальная БД</td><td>testcontainers / docker-compose</td><td>секунды</td></tr>
  <tr><td>E2E</td><td>HTTP-запрос → ответ, весь путь</td><td>поднятое приложение (supertest / Playwright)</td><td>десятки секунд</td></tr>
  </table>
  <p><b>Пирамида тестов</b>: много unit, меньше integration, совсем немного e2e на критичные сценарии (регистрация, оплата). В themost-core у вас как раз такая структура: <code class="i">vitest.unit.config</code>, <code class="i">vitest.integration.config</code> и playwright.</p>
  <h5>Что ценят в ответе</h5>
  <ul>
  <li><b>DI делает моки тривиальными</b> — это и есть главный практический аргумент за DI.</li>
  <li>Мокать надо <b>границы</b> (БД, HTTP, очереди, время), а не собственную логику. Тест, где замокано всё, проверяет только моки.</li>
  <li>Проверять не только happy path, но и ошибки + <b>отсутствие побочных эффектов</b> (<code class="i">not.toHaveBeenCalled</code>).</li>
  <li>Для БД лучше настоящий Postgres в контейнере, чем in-memory sqlite: SQL-диалекты различаются, и тесты начинают врать.</li>
  </ul>` },
  { id:'nest-config', topic:'Node / Nest', type:'theory', level:'junior',
    q:'Как правильно работать с конфигурацией и секретами? Что такое graceful shutdown и health checks?',
    answer:`<h5>Конфигурация</h5>
  <ul>
  <li><code class="i">ConfigModule.forRoot({ isGlobal: true, validationSchema: joiSchema })</code> — переменные окружения <b>валидируются на старте</b>. Приложение должно падать сразу при отсутствии обязательной переменной, а не через час в рантайме на первом запросе. У вас для этого joi и <code class="i">@t3-oss/env-core</code>.</li>
  <li>12-factor: конфиг живёт в окружении, а не в коде. <code class="i">.env</code> — <b>только для локальной разработки</b> и обязан быть в <code class="i">.gitignore</code>; в проде — секреты оркестратора (Docker/K8s secrets, Vault).</li>
  <li>На фронте <b>секретов не существует</b>: всё, что попало в <code class="i">VITE_*</code>, лежит в бандле открытым текстом. Туда можно только публичные ключи (PostHog, Sentry DSN, адрес API).</li>
  </ul>
  <h5>Graceful shutdown</h5>
  <pre class="code">app.enableShutdownHooks()      // слушать SIGTERM/SIGINT
  
  // в провайдере:
  async onModuleDestroy() {
    await this.queue.close()      // дособрать текущие джобы
    await this.redis.quit()
    await this.dataSource.destroy()
  }</pre>
  <p>Логика: получили <b>SIGTERM</b> → перестали принимать новые запросы → дали текущим завершиться (drain) → закрыли соединения с БД/Redis/очередями → вышли с кодом 0. Без этого при каждом деплое рвутся живые запросы и транзакции. Docker шлёт SIGTERM и через <code class="i">--time</code> (по умолчанию 10 с) добивает SIGKILL.</p>
  <div class="trap">Частая проблема в Docker: Node запущен как PID 1 и не получает сигналы корректно. Лечится <code class="i">--init</code> / <code class="i">tini</code> и формой <code class="i">CMD ["node","dist/main"]</code> (exec form), а не <code class="i">CMD node dist/main</code> (shell form).</div>
  <h5>Health checks (@nestjs/terminus — он у вас есть)</h5>
  <ul>
  <li><b>liveness</b> (<code class="i">/health/live</code>) — «процесс жив». Если падает, оркестратор перезапускает контейнер. Не должен проверять внешние зависимости, иначе лежащая БД вызовет бесконечный рестарт-луп.</li>
  <li><b>readiness</b> (<code class="i">/health/ready</code>) — «готов принимать трафик»: проверяет БД, Redis, миграции. Если не готов — из балансировщика убирают, но не перезапускают.</li>
  </ul>` },
  { id:'node-alsc', topic:'Node / Nest', type:'theory', level:'senior',
    q:'Что такое <code class="i">AsyncLocalStorage</code> и зачем он нужен? Как пробросить trace id через всё приложение?',
    code:`import { AsyncLocalStorage } from 'node:async_hooks'
  
  export const als = new AsyncLocalStorage<{ traceId: string; userId?: number }>()
  
  // middleware
  app.use((req, res, next) => {
    const traceId = req.headers['x-request-id'] ?? randomUUID()
    als.run({ traceId }, () => next())      // весь дальнейший async-код видит контекст
  })
  
  // где угодно глубоко внутри, без проброса параметров
  logger.info({ traceId: als.getStore()?.traceId }, 'создаём заказ')`,
    answer:`<h5>Проблема, которую он решает</h5>
  <p>В Node нет потоков, к которым можно привязать контекст запроса (в Java это ThreadLocal). Асинхронные колбэки теряют связь с «тем самым запросом». Без решения приходится <b>протаскивать</b> <code class="i">traceId</code> и <code class="i">userId</code> параметром через все слои — контроллер → сервис → репозиторий → хелпер. Это загрязняет сигнатуры всех функций.</p>
  <h5>Как работает</h5>
  <p><code class="i">AsyncLocalStorage</code> опирается на <code class="i">async_hooks</code>: Node отслеживает цепочку асинхронных операций и сохраняет привязку контекста. Всё, что запущено внутри <code class="i">als.run(store, fn)</code> — включая промисы, таймеры, колбэки БД — видит тот же <code class="i">store</code>, а параллельные запросы не мешают друг другу.</p>
  <h5>Где применяется</h5>
  <ul>
  <li><b>Correlation id в логах</b> — без него логи десяти подов невозможно собрать в историю одного запроса. Это основной кейс.</li>
  <li>Текущий пользователь и tenant в мультиарендных приложениях.</li>
  <li>Транзакция БД: передать <code class="i">EntityManager</code> текущей транзакции вглубь без параметра.</li>
  <li>OpenTelemetry использует ровно этот механизм для связывания спанов — поэтому автоинструментация «просто работает».</li>
  </ul>
  <h5>Почему это лучше REQUEST-scope в Nest</h5>
  <p>Request-scoped провайдер пересоздаётся на каждый запрос и <b>«заражает» всю цепочку зависимостей</b> — все, кто его использует, тоже становятся request-scoped. Это заметно бьёт по производительности. <code class="i">AsyncLocalStorage</code> (или готовый <code class="i">nestjs-cls</code>) даёт тот же результат, оставляя провайдеры синглтонами.</p>
  <div class="trap">Оговорка про цену: у <code class="i">async_hooks</code> есть накладные расходы (исторически заметные, сейчас гораздо меньше). И контекст теряется, если код уходит в пул потоков или в сторонний код с собственной очередью. Упомянуть ограничения — признак того, что вы это реально использовали, а не прочитали.</div>` },
]
