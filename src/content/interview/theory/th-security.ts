import type { TheoryArticle } from '@/engine/types'

export const security: TheoryArticle = { id:'th-security', topic:'Безопасность', title:'Безопасность веб-приложения',
  lead:'XSS, CSRF, CORS, SQL-инъекции, аутентификация, хранение паролей и заголовки — систематически, с практикой.',
  body:`
<h5>Базовый принцип</h5>
<div class="key">Никогда не доверяйте данным от клиента. Ни телу запроса, ни заголовкам, ни куке, ни тому, что «фронт же наш». Клиент полностью под контролем пользователя: DevTools, curl, перехватывающий прокси. Всё, что проверяется только на клиенте, не проверяется вообще.</div>
<p>Второй принцип — <b>защита в глубину</b>: не полагаться на один рубеж. Экранирование плюс CSP, валидация плюс параметризация запросов, аутентификация плюс проверка владения объектом.</p>

<h5>XSS — выполнение чужого кода на вашей странице</h5>
<p>Атакующий добивается того, чтобы браузер жертвы выполнил его JavaScript в контексте вашего домена. Дальше он может всё: прочитать localStorage, отправить запросы от имени пользователя, подменить интерфейс.</p>
<table>
<tr><th>Вид</th><th>Как попадает</th></tr>
<tr><td><b>Stored</b></td><td>сохранён в базе (комментарий, имя профиля) и показывается всем</td></tr>
<tr><td><b>Reflected</b></td><td>приходит в параметре URL и отражается в ответе</td></tr>
<tr><td><b>DOM-based</b></td><td>небезопасная работа с DOM прямо на клиенте, сервер вообще не участвует</td></tr>
</table>
<p><b>Защита:</b></p>
<ul>
<li><b>Экранирование вывода.</b> React экранирует по умолчанию — поэтому опасен только <code class="i">dangerouslySetInnerHTML</code>. Если нужен HTML от пользователя, пропускайте через <b>DOMPurify</b>.</li>
<li><b>Валидация ссылок.</b> <code class="i">&lt;a href={userUrl}&gt;</code> с <code class="i">javascript:alert(1)</code> — рабочий вектор. Проверяйте протокол.</li>
<li><b>CSP</b> как второй рубеж: даже внедрённый скрипт не выполнится, если источник не разрешён.</li>
<li><b>HttpOnly</b> на куках: украсть токен скриптом не получится.</li>
</ul>
<pre class="code">// опасно
&lt;div dangerouslySetInnerHTML={{ __html: comment.text }} /&gt;

// безопасно
&lt;div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.text) }} /&gt;</pre>

<h5>CSRF — запрос от вашего имени с чужого сайта</h5>
<p>Браузер автоматически прикладывает куки к запросу на ваш домен, откуда бы запрос ни был инициирован. Форма на зловредном сайте шлёт POST на <code class="i">bank.ru/transfer</code> — кука уходит, сервер считает запрос легитимным.</p>
<p><b>Защита:</b> <code class="i">SameSite=Lax</code> (дефолт в современных браузерах, блокирует кросс-сайтовые POST) или <code class="i">Strict</code>; CSRF-токен по схеме double submit; проверка заголовка <code class="i">Origin</code>.</p>
<p>Важный нюанс: если авторизация идёт через заголовок <code class="i">Authorization</code>, а не куку, CSRF <b>не применим</b> — заголовок сам собой не приложится.</p>

<h5>CORS — и главное заблуждение</h5>
<div class="warn">CORS <b>не защищает ваш сервер</b>. Это механизм браузера, ограничивающий <b>чтение ответа</b> кросс-доменным скриптом. Запрос при этом доходит до сервера и выполняется. Разрешительный CORS — не уязвимость сам по себе; уязвимость — отсутствие авторизации. И наоборот: строгий CORS не заменяет проверку прав.</div>
<ul>
<li><b>Простой запрос</b> уходит сразу; браузер лишь скроет ответ при отсутствии <code class="i">Access-Control-Allow-Origin</code>.</li>
<li><b>Preflight</b>: при PUT/DELETE, кастомных заголовках или <code class="i">Content-Type: application/json</code> сначала летит <code class="i">OPTIONS</code>.</li>
<li>С <code class="i">credentials: 'include'</code> нельзя отвечать <code class="i">*</code> — нужен конкретный origin и <code class="i">Allow-Credentials: true</code>.</li>
<li>Опасный антипаттерн: отражать <code class="i">Origin</code> из запроса в <code class="i">Allow-Origin</code> вместе с credentials — это разрешает всё кому угодно.</li>
</ul>

<h5>SQL-инъекции</h5>
<pre class="code">// ❌ конкатенация — классическая дыра
repo.query(\`SELECT * FROM users WHERE email = '\${email}'\`)
// email = "' OR '1'='1" → выдаст всех пользователей

// ✅ параметризация: значение уходит отдельно от текста запроса
repo.query('SELECT * FROM users WHERE email = $1', [email])
qb.where('user.email = :email', { email })</pre>
<p>ORM параметризует автоматически, но <b>сырые фрагменты всё ломают</b>. И есть место, где параметр не спасает: <b>имя колонки и направление сортировки</b> подставляются в текст SQL как есть. Единственная защита — белый список:</p>
<pre class="code">const allowed = { createdAt: 'task.created_at', title: 'task.title' } as const
const column = allowed[field] ?? 'task.created_at'
const dir = direction?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'</pre>
<p>Рядом живут инъекции в NoSQL (объект вместо строки в фильтре Mongo), инъекции команд (<code class="i">exec</code> с пользовательским вводом) и path traversal (<code class="i">../../etc/passwd</code> в имени файла).</p>

<div data-demo="jwt"></div>
<h5>Аутентификация и JWT</h5>
<p>JWT состоит из <code class="i">header.payload.signature</code> в base64url. <b>Payload не зашифрован</b> — его читает кто угодно, секреты туда класть нельзя. Подпись гарантирует только то, что токен не изменяли.</p>
<p><b>Главный недостаток:</b> JWT невозможно отозвать — сервер не хранит состояние. Забаненный пользователь останется с валидным токеном до истечения срока. Отсюда конструкция:</p>
<ul>
<li><b>Access</b> — короткий (5–15 минут), летит в каждом запросе, не хранится на сервере.</li>
<li><b>Refresh</b> — длинный, <b>хранится в базе или Redis</b> (значит, отзываемый), используется только на <code class="i">/auth/refresh</code>.</li>
<li><b>Ротация</b>: при каждом обновлении выдаётся новый refresh, старый инвалидируется. Пришёл уже использованный refresh — признак кражи, отзываем всю цепочку сессий.</li>
</ul>
<table>
<tr><th></th><th>localStorage</th><th>httpOnly cookie</th></tr>
<tr><td>XSS</td><td><b>уязвим</b>: любой скрипт читает токен</td><td>защищён</td></tr>
<tr><td>CSRF</td><td>не подвержен</td><td>подвержен → SameSite или CSRF-токен</td></tr>
<tr><td>Вердикт</td><td>удобно, но рискованно</td><td><b>предпочтительно</b></td></tr>
</table>
<p>Рабочая схема: refresh — в <code class="i">httpOnly; Secure; SameSite=Strict</code> куке с узким <code class="i">Path</code>; access — в памяти JS. При перезагрузке страницы тихо обновляемся по refresh.</p>
<div class="warn">Классическая ловушка на собеседовании — <b>алгоритм <code class="i">none</code></b>. Если сервер доверяет полю <code class="i">alg</code> из заголовка самого токена, атакующий подставит <code class="i">"alg":"none"</code> и подделает payload. Алгоритм должен быть жёстко задан на сервере. Родственная атака — подмена RS256 на HS256, где публичный ключ используется как секрет HMAC.</div>
<p><b>Сессии против JWT:</b> серверные сессии проще, отзываются мгновенно, но требуют общего хранилища при нескольких инстансах. Честный ответ: для обычного веб-приложения сессии часто лучше, JWT берут ради stateless-масштабирования и мобильных клиентов.</p>

<h5>Пароли</h5>
<p>SHA-256 для паролей не годится именно потому, что он <b>быстрый</b>: на GPU считаются миллиарды хешей в секунду. Нужны три вещи:</p>
<ul>
<li><b>Соль</b> — случайная строка на каждый пароль. Убивает радужные таблицы и делает одинаковые пароли разными хешами.</li>
<li><b>Медленный алгоритм</b> с настраиваемой стоимостью: argon2id (рекомендация OWASP), bcrypt, scrypt, PBKDF2.</li>
<li><b>Перец</b> (опционально) — общий секрет из окружения, лежащий вне базы: дамп базы сам по себе становится бесполезен.</li>
</ul>
<pre class="code">const hash = await bcrypt.hash(password, 12)          // cost 12
const ok   = await bcrypt.compare(password, user.hash) // сравнение за постоянное время</pre>
<p>Соль bcrypt генерирует сам и хранит внутри хеша. Cost подбирают так, чтобы проверка занимала 100–250 мс: каждое +1 удваивает время. Известное ограничение bcrypt — он учитывает только <b>первые 72 байта</b>, что мешает длинным парольным фразам; ещё один довод за argon2id.</p>
<p>Смежное: при логине отвечайте одинаково на «нет такого email» и «неверный пароль» (иначе получается перечисление пользователей), ставьте rate limit на <code class="i">/login</code> и <code class="i">/forgot-password</code>, а токен сброса делайте одноразовым, с коротким TTL, и храните его <b>хеш</b>.</p>

<h5>Авторизация и IDOR</h5>
<p>Самая недооценённая уязвимость. Аутентификация отвечает «кто ты», авторизация — «что тебе можно». <b>IDOR</b> (Insecure Direct Object Reference) — когда второе забывают:</p>
<pre class="code">// ❌ проверили токен, но не проверили владение объектом
@Get(':id')
findOne(@Param('id') id: number) {
  return this.orders.findOne(id)      // чужой заказ отдастся любому залогиненному
}

// ✅
findOne(@Param('id') id: number, @CurrentUser() user: User) {
  const order = await this.orders.findOne(id)
  if (order.userId !== user.id) throw new NotFoundException()
  return order
}</pre>
<p>Обратите внимание на <code class="i">NotFoundException</code> вместо <code class="i">Forbidden</code>: 403 подтвердил бы, что такой заказ существует.</p>

<h5>Заголовки безопасности</h5>
<table>
<tr><th>Заголовок</th><th>От чего защищает</th></tr>
<tr><td><code class="i">Content-Security-Policy</code></td><td>XSS: белый список источников скриптов и стилей</td></tr>
<tr><td><code class="i">Strict-Transport-Security</code></td><td>понижение до HTTP, перехват на первом переходе</td></tr>
<tr><td><code class="i">X-Content-Type-Options: nosniff</code></td><td>угадывание типа: загруженный «текст» не выполнится как скрипт</td></tr>
<tr><td><code class="i">Referrer-Policy</code></td><td>утечка пути и query в Referer на чужие сайты</td></tr>
<tr><td><code class="i">Permissions-Policy</code></td><td>доступ к камере, микрофону, геолокации</td></tr>
<tr><td><code class="i">frame-ancestors</code> / <code class="i">X-Frame-Options</code></td><td>clickjacking через встраивание в iframe</td></tr>
</table>
<p>В Nest всё это ставится через <code class="i">helmet</code>, но дефолтная CSP почти наверняка сломает фронт — настраивать придётся руками. Стратегия внедрения: сначала <code class="i">Content-Security-Policy-Report-Only</code> с <code class="i">report-uri</code>, неделю собираете отчёты, чините, потом включаете боевой режим.</p>

<h5>Остальное из OWASP</h5>
<ul>
<li><b>SSRF</b> — сервер ходит по URL от пользователя и попадает во внутреннюю сеть или в метаданные облака. Валидируйте схему и хост, запрещайте приватные диапазоны.</li>
<li><b>Загрузка файлов</b> — проверять реальный тип содержимого, а не расширение; хранить вне webroot; ограничивать размер; не отдавать с того же домена.</li>
<li><b>Mass assignment</b> — <code class="i">whitelist: true</code> в ValidationPipe, иначе клиент пришлёт <code class="i">isAdmin: true</code>.</li>
<li><b>Утечка через ошибки</b> — стектрейсы и тексты SQL-ошибок наружу не отдаются.</li>
<li><b>Логи</b> — никаких паролей, токенов, номеров карт.</li>
<li><b>Зависимости</b> — <code class="i">pnpm audit</code>, Dependabot: большая часть реальных инцидентов приходит через уязвимость в чужом пакете.</li>
<li><b>Секреты</b> — только в окружении, никогда в git. Утёкший в историю ключ считается скомпрометированным навсегда: его нужно отозвать, а не «удалить коммит».</li>
</ul>

<h5>Валидация Telegram initData</h5>
<p>Для ваших проектов это прикладной случай всего вышесказанного. <code class="i">window.Telegram.WebApp.initDataUnsafe</code> — обычный объект в браузере: подменить <code class="i">user.id</code> может кто угодно. Слово Unsafe в имени не случайно.</p>
<pre class="code">// 1. data_check_string: пары key=value, отсортированные, через \\n, без hash
// 2. секретный ключ = HMAC_SHA256(key: "WebAppData", message: botToken)
//    ← именно в таком порядке, это частая ошибка
// 3. hash = HMAC_SHA256(key: secretKey, message: dataCheckString)
// 4. сравнение через crypto.timingSafeEqual — защита от timing attack
// 5. проверка auth_date на свежесть — защита от replay</pre>
<p>В проде используют <code class="i">@telegram-apps/init-data-node</code>. Обычно initData проверяется один раз на <code class="i">/auth/telegram</code>, после чего выдаётся своя пара access/refresh.</p>` }
