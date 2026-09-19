import type { Question } from '@/engine/types'

/** DevOps и процессы — 4 вопрос(ов) */
export const devopsIProcessQuestions: Question[] = [
  { id:'arch-mono', topic:'DevOps и процессы', type:'theory', level:'middle',
    q:'Зачем монорепозиторий и pnpm workspaces? Чем pnpm отличается от npm/yarn?',
    answer:`<h5>Зачем монорепа</h5>
  <ul>
  <li><b>Общие типы между клиентом и сервером</b> — главный аргумент в ваших проектах. Именно так работает tRPC: <code class="i">import type { AppRouter } from 'server/trpc'</code>. В разных репозиториях пришлось бы публиковать пакет и следить за версиями.</li>
  <li>Атомарные изменения: правка API и клиента в одном PR — контракт не может разъехаться.</li>
  <li>Общий тулинг: один tsconfig, eslint, prettier, CI.</li>
  <li>Общие пакеты (<code class="i">packages/share</code> в pmpal) без публикации в реестр.</li>
  </ul>
  <p>Минусы: дольше CI (лечится фильтрами <code class="i">--filter</code> и кешем сборки), тяжелее репозиторий, нужна дисциплина по границам модулей.</p>
  <h5>Чем хорош pnpm</h5>
  <ul>
  <li><b>Глобальный store + жёсткие ссылки</b>: каждая версия пакета лежит на диске один раз. Экономия десятков гигабайт и быстрая установка.</li>
  <li><b>Строгий <code class="i">node_modules</code></b>: плоской структуры нет, доступны только явно объявленные зависимости. Это ловит «фантомные зависимости» — когда код импортирует пакет, которого нет в его <code class="i">package.json</code>, и всё ломается при смене менеджера.</li>
  <li><b>Workspaces</b> из коробки: <code class="i">workspace:*</code> как версия зависимости, <code class="i">--filter</code> для запуска скриптов в конкретном пакете, <code class="i">--recursive --parallel</code> для всех.</li>
  </ul>
  <h5>Про lock-файл</h5>
  <p><code class="i">pnpm-lock.yaml</code> обязан быть в git: он фиксирует точное дерево версий, чтобы у всех и в CI была идентичная сборка. В CI ставят <code class="i">pnpm install --frozen-lockfile</code> — падает, если lock разошёлся с <code class="i">package.json</code>.</p>
  <p>Заодно объясните <b>semver</b>: <code class="i">^1.2.3</code> — можно minor и patch (до 2.0.0), <code class="i">~1.2.3</code> — только patch, <code class="i">1.2.3</code> — точная версия.</p>` },
  { id:'arch-docker', topic:'DevOps и процессы', type:'theory', level:'middle',
    q:'Как правильно собрать Docker-образ Node-приложения? Что такое multi-stage build и почему важен порядок слоёв?',
    code:`# --- builder ---
  FROM node:22-alpine AS builder
  WORKDIR /app
  
  # 1. Сначала только манифесты — этот слой кешируется,
  #    пока не изменились зависимости
  COPY package.json pnpm-lock.yaml ./
  COPY server/package.json ./server/
  RUN corepack enable && pnpm install --frozen-lockfile
  
  # 2. Потом исходники — они меняются часто
  COPY . .
  RUN pnpm run build
  
  # --- runtime ---
  FROM node:22-alpine AS runner
  WORKDIR /app
  ENV NODE_ENV=production
  
  COPY --from=builder /app/node_modules ./node_modules
  COPY --from=builder /app/dist ./dist
  
  USER node
  EXPOSE 3000
  CMD ["node", "dist/main.js"]`,
    answer:`<h5>Слои и кеш — суть вопроса</h5>
  <p>Каждая инструкция Dockerfile создаёт слой. Docker переиспользует кеш, пока входные данные слоя не изменились, — и <b>инвалидирует все слои после изменённого</b>.</p>
  <p>Отсюда правило: <b>от редко меняющегося к часто меняющемуся</b>. Если сделать <code class="i">COPY . .</code> до <code class="i">install</code>, то любая правка одной строки кода заставит переустанавливать все зависимости — сборка вместо 20 секунд займёт 5 минут.</p>
  <h5>Multi-stage</h5>
  <p>В финальный образ переносится только результат сборки. Не едут: devDependencies, исходники, TypeScript, кеши. Образ уменьшается в разы, а <b>поверхность атаки</b> — вместе с ним.</p>
  <h5>Что ещё обязательно назвать</h5>
  <ul>
  <li><code class="i">.dockerignore</code> с <code class="i">node_modules</code>, <code class="i">.git</code>, <code class="i">dist</code> — иначе контекст сборки раздувается и локальные модули (собранные под другую ОС) попадают в образ.</li>
  <li><code class="i">USER node</code> — не запускать от root.</li>
  <li><b>Exec-форма</b> <code class="i">CMD ["node", "..."]</code>, а не shell-форма: иначе процесс запускается под <code class="i">/bin/sh</code> и не получает SIGTERM → нет graceful shutdown.</li>
  <li>Секреты <b>не</b> в образ: только переменные окружения/секреты оркестратора. Всё, что попало в слой, остаётся в истории образа, даже если удалено следующей командой.</li>
  <li><code class="i">HEALTHCHECK</code> и фиксация версий базового образа (<code class="i">node:22.4-alpine</code>, а не <code class="i">latest</code>).</li>
  <li>Alpine компактен, но использует musl вместо glibc — иногда ломаются нативные модули (<code class="i">sharp</code>, <code class="i">bcrypt</code>); тогда берут <code class="i">node:22-slim</code>.</li>
  </ul>
  <h5>docker-compose</h5>
  <p>Для локальной разработки: сервис приложения + Postgres + Redis, <code class="i">depends_on</code> с <code class="i">condition: service_healthy</code> (просто <code class="i">depends_on</code> ждёт запуск контейнера, а не готовность БД), volume для данных, отдельная сеть.</p>` },
  { id:'arch-cicd', topic:'DevOps и процессы', type:'theory', level:'middle',
    q:'Как выглядит нормальный CI/CD для вашего проекта? Что такое zero-downtime деплой?',
    answer:`<h5>Пайплайн CI</h5>
  <ol>
  <li><code class="i">pnpm install --frozen-lockfile</code> (с кешем store).</li>
  <li><b>Проверки параллельно</b>: <code class="i">lint</code>, <code class="i">type-check</code> (<code class="i">tsc --noEmit</code>), unit-тесты.</li>
  <li>Integration-тесты с поднятой БД (у вас есть <code class="i">compose.test.yml</code>) и e2e на Playwright — обычно только для PR в main.</li>
  <li>Сборка образа, тег по git sha (не <code class="i">latest</code> — иначе непонятно, что развёрнуто), пуш в реестр.</li>
  <li>Деплой: staging автоматически, prod — по тегу/аппруву.</li>
  </ol>
  <h5>Правила, которые ценят</h5>
  <ul>
  <li><b>Всё, что проверяет CI, должно проверяться локально</b> (pre-commit hook), иначе очередь «fix lint» коммитов.</li>
  <li>Ветка main всегда деплоябельна; мердж только зелёный.</li>
  <li>Артефакт собирается <b>один раз</b> и продвигается по окружениям. Пересборка на прод = другой артефакт = другой баг.</li>
  <li>Конфиг различается только переменными окружения.</li>
  </ul>
  <h5>Zero-downtime</h5>
  <ul>
  <li><b>Rolling update</b>: поды заменяются по одному, новый принимает трафик только после readiness-пробы.</li>
  <li><b>Blue-green</b>: две среды, переключение трафика целиком, мгновенный откат.</li>
  <li><b>Canary</b>: 5% трафика на новую версию, смотрим метрики и ошибки, потом раскатываем.</li>
  </ul>
  <p>Обязательные условия: graceful shutdown (иначе рвутся живые запросы), <b>обратно совместимые миграции</b> (expand/contract — старая и новая версия какое-то время работают одновременно) и health-эндпоинты.</p>
  <h5>Git-процесс</h5>
  <p>Trunk-based с короткоживущими ветками + feature flags — современный дефолт; GitFlow тяжеловат для веба. Conventional commits (<code class="i">feat:</code>, <code class="i">fix:</code>) дают автогенерацию changelog и semver. <code class="i">rebase</code> для приведения ветки в порядок, <code class="i">merge</code> в main; переписывать историю в общей ветке нельзя.</p>
  <div class="hint">Полезно знать ответы на «как откатиться»: <code class="i">git revert</code> (безопасно, создаёт новый коммит) vs <code class="i">git reset</code> (переписывает историю). И откат релиза — это <b>передеплой предыдущего образа</b>, а не спешная правка на проде.</div>` },
  { id:'arch-obs', topic:'DevOps и процессы', type:'theory', level:'senior',
    q:'Что такое observability? Логи, метрики, трейсы — зачем все три? Что у вас даёт OpenTelemetry?',
    answer:`<h5>Три столпа</h5>
  <table>
  <tr><th></th><th>Отвечает на вопрос</th><th>Инструменты</th></tr>
  <tr><td><b>Логи</b></td><td>что конкретно произошло в этом запросе</td><td>pino, Winston, Loki/ELK</td></tr>
  <tr><td><b>Метрики</b></td><td>как система чувствует себя в целом, во времени</td><td>prom-client, Prometheus + Grafana</td></tr>
  <tr><td><b>Трейсы</b></td><td>где именно ушло время в цепочке сервисов</td><td>OpenTelemetry + Jaeger/Tempo</td></tr>
  </table>
  <h5>Логи по-взрослому</h5>
  <ul>
  <li><b>Структурированные</b> (JSON), а не строки: по ним можно фильтровать и агрегировать. У вас <code class="i">pino-http</code> — правильный выбор, он быстрый и сразу JSON.</li>
  <li><b>Correlation id</b> (trace id) в каждой строке — иначе в логах десяти подов невозможно собрать историю одного запроса. Прокидывается через <code class="i">AsyncLocalStorage</code>.</li>
  <li><b>Уровни</b> осмысленно: error — то, на что реагирует человек; warn — аномалия; info — бизнес-события; debug — только в дев.</li>
  <li><b>Никаких персональных данных и секретов</b> в логах: пароли, токены, номера карт. Это и утечка, и нарушение закона.</li>
  </ul>
  <h5>Метрики: что мониторить</h5>
  <p><b>RED</b> для сервисов: Rate (RPS), Errors (доля 5xx), Duration (латентность). <b>USE</b> для ресурсов: Utilization, Saturation, Errors.</p>
  <p>Важно: смотреть на <b>перцентили (p95/p99), а не среднее</b>. Среднее в 100 мс прекрасно уживается с тем, что каждый двадцатый пользователь ждёт 5 секунд.</p>
  <h5>Трейсы и OpenTelemetry</h5>
  <p>Запрос получает <code class="i">traceId</code>, каждая операция — <code class="i">span</code> с длительностью. Автоинструментация (<code class="i">@opentelemetry/auto-instrumentations-node</code> — он у вас есть) сама оборачивает HTTP, Postgres, Redis, и вы сразу видите водопад: «200 мс из 250 ушло в один SQL-запрос». Это <b>самый быстрый способ найти N+1</b> и узкие места без гадания.</p>
  <h5>Алерты</h5>
  <p>Алертить на <b>симптомы для пользователя</b> (рост 5xx, p99 латентности, падение конверсии), а не на каждый скачок CPU. Алерт, который звенит постоянно, перестают замечать — и тогда пропускают настоящий инцидент.</p>` },
]
