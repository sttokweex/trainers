import type { TheoryArticle } from '@/engine/types'

export const git: TheoryArticle = { id:'th-git', topic:'DevOps и процессы', title:'Git, Docker и путь кода до прода',
  lead:'Команды и рабочие ситуации, сборка образов, CI/CD и деплой без простоя.',
  body:`
<h5>Git: ежедневный набор</h5>
<pre class="code">git switch -c feat/tasks          создать ветку и перейти
git add -p                        добавлять по кускам — очень полезно
git commit -m "feat: add filter"
git pull --rebase origin main     подтянуть без мусорного merge-коммита
git push -u origin feat/tasks
git log --oneline --graph --all   история одним экраном
git diff --staged                 что именно уйдёт в коммит</pre>

<h5>Исправить сделанное</h5>
<pre class="code">git commit --amend          дополнить последний коммит
git restore file.ts         откатить файл к HEAD
git restore --staged f.ts   убрать из индекса
git reset --soft HEAD~1     отменить коммит, изменения оставить
git reset --hard HEAD~1     отменить коммит и изменения (осторожно!)
git revert &lt;sha&gt;            безопасная отмена в общей ветке
git stash / git stash pop   отложить и вернуть изменения</pre>
<p>Разница <code class="i">reset</code> и <code class="i">revert</code> — частый вопрос. <code class="i">reset</code> переписывает историю и годится только для своих неопубликованных коммитов. <code class="i">revert</code> создаёт <b>новый коммит</b>, отменяющий изменения, — единственный безопасный способ откатить что-то в общей ветке.</p>

<h5>Merge или rebase</h5>
<table>
<tr><th>merge</th><th>rebase</th></tr>
<tr><td>сохраняет историю как было, добавляет merge-коммит</td><td>переписывает коммиты поверх новой базы — линейная история</td></tr>
<tr><td>безопасен для общих веток</td><td><b>только для своих</b> неопубликованных веток</td></tr>
</table>
<div class="warn">Золотое правило: <b>не переписывайте историю, которую уже кто-то мог забрать.</b> Если всё-таки надо — <code class="i">push --force-with-lease</code>, а не <code class="i">--force</code>: он откажется затирать чужие коммиты, появившиеся после вашего последнего fetch.</div>

<div data-demo="git-graph"></div>
<h5>Команды, которые выручают</h5>
<ul>
<li><b><code class="i">git bisect</code></b> — бинарный поиск коммита, который сломал поведение. Назвать это на собеседовании — почти всегда плюс.</li>
<li><b><code class="i">git reflog</code></b> — спасение после «я всё уронил»: там видны все перемещения HEAD, включая потерянные коммиты после <code class="i">reset --hard</code>.</li>
<li><code class="i">git cherry-pick &lt;sha&gt;</code> — перенести один коммит, например хотфикс в релизную ветку.</li>
<li><code class="i">git blame -L 10,20 file.ts</code> — кто и когда написал эти строки (и, главное, в каком коммите — там будет описание причины).</li>
</ul>

<h5>Процесс и коммиты</h5>
<p><b>Trunk-based</b> с короткоживущими ветками и feature flags — современный дефолт для веба; GitFlow тяжеловат и заточен под релизы версий.</p>
<pre class="code">feat: добавить фильтр задач          → minor
fix: исправить гонку при обновлении  → patch
feat!: сменить формат ответа API     → major (ломающее изменение)
chore / docs / refactor / test / perf / ci</pre>
<p>Conventional commits дают автогенерацию changelog и автоматический semver. И вообще: сообщение коммита должно объяснять <b>почему</b>, а не что — «что» видно из диффа.</p>

<h5>Docker: слои и кеш</h5>
<pre class="code"># --- builder ---
FROM node:22-alpine AS builder
WORKDIR /app

# 1. сначала только манифесты — слой кешируется,
#    пока не изменились зависимости
COPY package.json pnpm-lock.yaml ./
COPY server/package.json ./server/
RUN corepack enable &amp;&amp; pnpm install --frozen-lockfile

# 2. потом исходники — они меняются часто
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
CMD ["node", "dist/main.js"]</pre>
<p>Каждая инструкция создаёт слой. Docker переиспользует кеш, пока входные данные слоя не изменились, и <b>инвалидирует все последующие слои</b>. Отсюда правило: <b>от редко меняющегося к часто меняющемуся</b>. Если сделать <code class="i">COPY . .</code> до установки зависимостей, любая правка строки кода заставит переустанавливать весь node_modules — сборка вместо 20 секунд займёт 5 минут.</p>
<p><b>Multi-stage</b> переносит в финальный образ только результат сборки. Не едут devDependencies, исходники, TypeScript и кеши: образ уменьшается в разы, а поверхность атаки — вместе с ним.</p>

<h5>Docker: что обязательно назвать</h5>
<ul>
<li><code class="i">.dockerignore</code> с <code class="i">node_modules</code>, <code class="i">.git</code>, <code class="i">dist</code> — иначе контекст сборки раздувается, а локальные модули (собранные под другую ОС) попадают в образ.</li>
<li><code class="i">USER node</code> — не запускать от root.</li>
<li><b>Exec-форма</b> <code class="i">CMD ["node", "..."]</code>, а не shell-форма: иначе процесс стартует под <code class="i">/bin/sh</code> и <b>не получает SIGTERM</b> — graceful shutdown не сработает.</li>
<li>Секреты не кладут в образ: всё, что попало в слой, остаётся в истории, даже если удалено следующей командой.</li>
<li>Фиксировать версию базового образа (<code class="i">node:22.4-alpine</code>, а не <code class="i">latest</code>).</li>
<li>Alpine компактен, но использует musl вместо glibc — иногда ломаются нативные модули (<code class="i">sharp</code>, <code class="i">bcrypt</code>); тогда берут <code class="i">node:22-slim</code>.</li>
</ul>
<p>В <code class="i">docker-compose</code> для локальной разработки: приложение плюс Postgres и Redis, <code class="i">depends_on</code> с <code class="i">condition: service_healthy</code> (простой <code class="i">depends_on</code> ждёт запуск контейнера, а не готовность базы), volume для данных.</p>

<h5>CI/CD</h5>
<ol>
<li><code class="i">pnpm install --frozen-lockfile</code> — падает, если lock разошёлся с <code class="i">package.json</code>.</li>
<li><b>Проверки параллельно</b>: lint, <code class="i">tsc --noEmit</code>, unit-тесты.</li>
<li>Интеграционные тесты с поднятой базой и e2e — обычно только на PR в main.</li>
<li>Сборка образа, тег по git sha (не <code class="i">latest</code> — иначе непонятно, что развёрнуто), пуш в реестр.</li>
<li>Деплой: staging автоматически, прод — по тегу или аппруву.</li>
</ol>
<p>Правила, которые ценят: всё, что проверяет CI, должно проверяться локально (иначе появляется очередь коммитов «fix lint»); main всегда деплоябелен; артефакт собирается <b>один раз</b> и продвигается по окружениям — пересборка на проде даёт другой артефакт и другие баги.</p>

<h5>Деплой без простоя</h5>
<ul>
<li><b>Rolling update</b> — поды заменяются по одному, новый принимает трафик только после readiness-пробы.</li>
<li><b>Blue-green</b> — две среды, переключение трафика целиком, мгновенный откат.</li>
<li><b>Canary</b> — 5% трафика на новую версию, смотрим метрики, потом раскатываем.</li>
</ul>
<p>Обязательные условия: <b>graceful shutdown</b> (иначе рвутся живые запросы), <b>обратно совместимые миграции</b> и health-эндпоинты. Про совместимость мигрраций стоит сказать отдельно: во время деплоя какое-то время работают одновременно старая и новая версия кода, поэтому схема должна подходить обеим. Переименование колонки — это три релиза, а не один.</p>
<p>И откат релиза — это <b>передеплой предыдущего образа</b>, а не спешная правка на проде.</p>

<h5>Монорепа и pnpm</h5>
<p>Зачем монорепа: <b>общие типы между клиентом и сервером</b> (на этом стоит tRPC), атомарные изменения контракта и клиента в одном PR, общий тулинг, общие пакеты без публикации в реестр. Минусы — дольше CI (лечится фильтрами и кешем) и нужна дисциплина по границам.</p>
<p>Чем хорош pnpm: <b>глобальный store с жёсткими ссылками</b> (каждая версия пакета на диске один раз) и <b>строгий node_modules</b> — доступны только явно объявленные зависимости, что ловит «фантомные зависимости», из-за которых проект ломается при смене менеджера пакетов.</p>` }
