import type { Question } from '@/engine/types'

/** Безопасность — 4 вопрос(ов) */
export const bezopasnostyQuestions: Question[] = [
  { id:'sec-jwt', topic:'Безопасность', type:'theory', level:'middle',
    q:'Как устроен JWT? Где хранить токены, зачем refresh и как его отозвать?',
    answer:`<h5>Структура</h5>
  <p><code class="i">header.payload.signature</code>, каждая часть — base64url. <b>Payload не зашифрован</b>, его может прочитать кто угодно — туда нельзя класть секреты. Подпись (HMAC-SHA256 или RSA) гарантирует только то, что токен <b>не изменяли</b>.</p>
  <p>Стандартные claims: <code class="i">sub</code> (id пользователя), <code class="i">exp</code>, <code class="i">iat</code>, <code class="i">iss</code>, <code class="i">aud</code>, <code class="i">jti</code> (id токена — пригодится для отзыва).</p>
  <h5>Главный недостаток</h5>
  <p>JWT <b>невозможно отозвать</b> — сервер не хранит состояние и проверяет только подпись. Забаненный пользователь останется с валидным токеном до <code class="i">exp</code>. Отсюда вся конструкция ниже.</p>
  <h5>Access + Refresh</h5>
  <ul>
  <li><b>Access</b> — короткий (5–15 мин), летит в каждом запросе, не хранится на сервере. Даже украденный протухнет быстро.</li>
  <li><b>Refresh</b> — длинный (7–30 дней), <b>хранится в БД/Redis</b> (значит, его можно отозвать), используется только на <code class="i">/auth/refresh</code>.</li>
  <li><b>Ротация</b>: при каждом обновлении выдаём новый refresh и инвалидируем старый. Если пришёл уже использованный refresh — это признак кражи: отзываем всю цепочку сессий пользователя (reuse detection).</li>
  </ul>
  <h5>Где хранить — главный вопрос</h5>
  <table>
  <tr><th></th><th>localStorage</th><th>httpOnly cookie</th></tr>
  <tr><td>XSS</td><td><b>уязвим</b>: любой скрипт читает токен</td><td>защищён: JS не видит куку</td></tr>
  <tr><td>CSRF</td><td>не подвержен</td><td>подвержен → нужен <code class="i">SameSite</code> и/или CSRF-токен</td></tr>
  <tr><td>Вердикт</td><td>удобно, но рискованно</td><td><b>предпочтительно</b></td></tr>
  </table>
  <p>Практика: refresh — в <code class="i">httpOnly; Secure; SameSite=Strict</code> куке с <code class="i">path=/auth/refresh</code>; access — в памяти JS (переменная/стор), не в localStorage. При перезагрузке страницы тихо обновляемся по refresh.</p>
  <div class="trap">Классический вопрос с подвохом: <b>алгоритм <code class="i">none</code></b>. Если сервер доверяет полю <code class="i">alg</code> из заголовка токена, атакующий подставит <code class="i">"alg":"none"</code> и подделает payload. Алгоритм должен быть жёстко задан на сервере. Аналогично — атака подмены RS256 на HS256 с публичным ключом в роли секрета.</div>
  <h5>Сессии vs JWT</h5>
  <p>Серверные сессии проще и отзываются мгновенно, но требуют общего хранилища при нескольких инстансах (тот же Redis). JWT хорош для stateless-API и межсервисного взаимодействия. Честный ответ на собесе: «для обычного веб-приложения сессии часто лучше, JWT берут ради масштабирования и мобильных клиентов».</p>` },
  { id:'sec-web', topic:'Безопасность', type:'theory', level:'middle',
    q:'XSS, CSRF, CORS — что это, чем отличаются и как защищаться? Разберите флаги cookie.',
    answer:`<h5>XSS — выполнение чужого JS на вашей странице</h5>
  <ul>
  <li><b>Виды</b>: stored (сохранён в БД), reflected (из параметра URL), DOM-based (небезопасная работа с DOM на клиенте).</li>
  <li><b>Защита</b>: экранирование вывода (React делает это по умолчанию — поэтому опасен только <code class="i">dangerouslySetInnerHTML</code>), санитайзер (DOMPurify) для доверенного HTML, <b>CSP</b>-заголовок, <code class="i">httpOnly</code> на куках, валидация ссылок (<code class="i">javascript:</code> в <code class="i">href</code> — рабочий вектор).</li>
  </ul>
  <h5>CSRF — чужой сайт делает запрос от имени пользователя</h5>
  <p>Браузер автоматически прикладывает куки к запросу на ваш домен, откуда бы он ни был инициирован. Форма на зловредном сайте шлёт POST на <code class="i">bank.ru/transfer</code> — и кука уходит.</p>
  <ul>
  <li><b>Защита</b>: <code class="i">SameSite=Lax</code> (дефолт в современных браузерах, блокирует кросс-сайтовые POST) или <code class="i">Strict</code>; CSRF-токен (double submit); проверка <code class="i">Origin</code>/<code class="i">Referer</code>.</li>
  <li>Если авторизация через заголовок <code class="i">Authorization</code>, а не куку — CSRF не применим (заголовок сам не приложится).</li>
  </ul>
  <h5>Флаги cookie</h5>
  <ul>
  <li><code class="i">HttpOnly</code> — недоступна из JS (защита от XSS-кражи).</li>
  <li><code class="i">Secure</code> — только по HTTPS.</li>
  <li><code class="i">SameSite</code>: <code class="i">Strict</code> (не отправляется ни при каких переходах со стороны) / <code class="i">Lax</code> (отправляется при обычной навигации GET) / <code class="i">None</code> (нужен для кросс-доменных, обязателен <code class="i">Secure</code>).</li>
  <li><code class="i">Domain</code>, <code class="i">Path</code>, <code class="i">Max-Age</code> — область и срок жизни.</li>
  </ul>
  <h5>CORS — это не защита вашего сервера</h5>
  <p><b>Частая ошибка на собесе.</b> CORS — механизм браузера, который защищает <b>пользователя</b>, ограничивая чтение ответа кросс-доменным скриптом. Запрос при этом может дойти до сервера и выполниться. CORS не заменяет авторизацию, и curl/Postman его вообще не соблюдают.</p>
  <ul>
  <li><b>Simple request</b> (GET/HEAD/POST с простыми заголовками) уходит сразу; браузер лишь скроет ответ, если нет <code class="i">Access-Control-Allow-Origin</code>.</li>
  <li><b>Preflight</b>: при <code class="i">PUT</code>/<code class="i">DELETE</code>, кастомных заголовках (<code class="i">Authorization</code>, <code class="i">Content-Type: application/json</code>) браузер сначала шлёт <code class="i">OPTIONS</code>. Ответ кешируется по <code class="i">Access-Control-Max-Age</code>.</li>
  <li>С <code class="i">credentials: 'include'</code> нельзя отвечать <code class="i">Allow-Origin: *</code> — нужен конкретный origin + <code class="i">Access-Control-Allow-Credentials: true</code>.</li>
  </ul>
  <h5>Что ещё назвать из OWASP</h5>
  <p>SQL-инъекция (лечится <b>параметризованными запросами</b> — ORM делает это сам, но <code class="i">query('... ' + input)</code> в QueryBuilder всё ломает), IDOR (проверять владение объектом, а не только аутентификацию), SSRF (валидировать URL, куда ходит сервер), загрузка файлов (проверять реальный тип, а не расширение; хранить вне webroot), утечка стектрейсов в ответах.</p>` },
  { id:'sec-tg', topic:'Безопасность', type:'manual', level:'senior',
    q:'Как валидировать <code class="i">initData</code> Telegram Mini App на сервере? Почему нельзя доверять <code class="i">window.Telegram.WebApp.initDataUnsafe</code>?',
    starter:`// Клиент присылает строку initData. Проверьте её подлинность.`,
    solution:`import crypto from 'node:crypto'
  
  function validateInitData(initData: string, botToken: string, maxAgeSec = 86400) {
    const params = new URLSearchParams(initData)
  
    const hash = params.get('hash')
    if (!hash) throw new UnauthorizedException('Нет hash')
    params.delete('hash')
  
    // 1. data_check_string: пары key=value, отсортированные по ключу, через \\n
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => \`\${k}=\${v}\`)
      .join('\\n')
  
    // 2. секретный ключ = HMAC_SHA256(key: "WebAppData", message: botToken)
    //    ВНИМАНИЕ: именно в таком порядке — это частая ошибка
    const secretKey = crypto.createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest()
  
    // 3. считаем HMAC от data_check_string этим ключом
    const computed = crypto.createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')
  
    // 4. сравнение в постоянном времени — защита от timing attack
    const a = Buffer.from(computed, 'hex')
    const b = Buffer.from(hash, 'hex')
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Подпись неверна')
    }
  
    // 5. защита от replay: данные не должны быть слишком старыми
    const authDate = Number(params.get('auth_date'))
    if (!authDate || Date.now() / 1000 - authDate > maxAgeSec) {
      throw new UnauthorizedException('initData просрочена')
    }
  
    return JSON.parse(params.get('user') ?? '{}')
  }
  
  // В проде — готовый пакет (он у вас в зависимостях):
  // import { validate, parse } from '@telegram-apps/init-data-node'
  // validate(initData, botToken, { expiresIn: 86400 })`,
    answer:`<h5>Почему это вообще нужно</h5>
  <p><code class="i">initDataUnsafe</code> — обычный JS-объект в браузере. Открыть DevTools и подставить чужой <code class="i">user.id</code> может кто угодно. Именно поэтому в имени стоит слово <b>Unsafe</b>. Единственное доказательство подлинности — <b>HMAC-подпись</b>, которую может проверить только владелец токена бота.</p>
  <h5>Ключевые детали, за которые цепляются</h5>
  <ul>
  <li><b>Порядок аргументов HMAC</b>: ключ — строка <code class="i">'WebAppData'</code>, сообщение — токен бота. Перепутать местами — самая частая ошибка (в Login Widget, кстати, схема другая: <code class="i">SHA256(botToken)</code>).</li>
  <li><b>Сортировка по ключу</b> и <b>исключение самого <code class="i">hash</code></b> из строки.</li>
  <li><b>timingSafeEqual</b> вместо <code class="i">===</code> — иначе по времени сравнения теоретически подбирается подпись.</li>
  <li><b>Проверка <code class="i">auth_date</code></b> — иначе перехваченная один раз строка будет работать вечно (replay).</li>
  <li>Токен бота — секрет, только на сервере, из переменных окружения.</li>
  </ul>
  <h5>Как это ложится в архитектуру</h5>
  <p>Обычно initData проверяется один раз на <code class="i">/auth/telegram</code>, после чего выдаётся собственная пара access/refresh — и дальше приложение работает с обычным JWT, не гоняя initData в каждом запросе. Это хороший ответ на «а как у вас устроена авторизация в TMA».</p>` },
  { id:'sec-pass', topic:'Безопасность', type:'theory', level:'junior',
    q:'Как правильно хранить пароли? Почему не SHA-256? Что такое соль и «медленный» хеш?',
    answer:`<h5>Почему не SHA-256</h5>
  <p>Он <b>быстрый</b> — и это его недостаток для паролей. На GPU считаются миллиарды хешей в секунду, поэтому перебор коротких паролей и радужные таблицы работают отлично.</p>
  <h5>Что нужно</h5>
  <ul>
  <li><b>Соль</b> — случайная строка на <i>каждый</i> пароль, хранится рядом с хешем. Убивает радужные таблицы и делает одинаковые пароли разных пользователей разными хешами.</li>
  <li><b>Медленный алгоритм</b> с настраиваемой стоимостью: <b>argon2id</b> (рекомендация OWASP сегодня), <b>bcrypt</b> (проверенный временем, у вас <code class="i">bcryptjs</code>), scrypt, PBKDF2.</li>
  <li><b>Перец</b> (pepper) — опционально: общий секрет из env, добавляемый к паролю; лежит вне БД, поэтому дамп базы сам по себе бесполезен.</li>
  </ul>
  <pre class="code">const hash = await bcrypt.hash(password, 12)   // 12 — cost factor
  const ok   = await bcrypt.compare(password, user.passwordHash)</pre>
  <p>Соль bcrypt генерирует сам и <b>хранит внутри хеша</b> — отдельная колонка не нужна. Cost подбирают так, чтобы проверка занимала ~100–250 мс: каждое +1 удваивает время.</p>
  <div class="trap">Известное ограничение bcrypt: он учитывает только <b>первые 72 байта</b>. Для длинных паролей или парольных фраз это проблема — ещё один аргумент за argon2id.</div>
  <h5>Что ещё скажут «плюсом»</h5>
  <ul>
  <li><code class="i">bcrypt.compare</code> сравнивает в постоянном времени — не пишите <code class="i">hash === computed</code> вручную.</li>
  <li>При логине отвечайте одинаково на «нет такого email» и «неверный пароль» — иначе получается перечисление пользователей (user enumeration).</li>
  <li>Rate limiting на <code class="i">/login</code> и <code class="i">/forgot-password</code> обязателен.</li>
  <li>Токен сброса пароля: случайный, одноразовый, с коротким TTL, хранить <b>хеш</b> токена.</li>
  <li>Хеширование — CPU-задача, выполняется в пуле libuv: при большом RPS это заметно, тем более что пул всего 4 потока.</li>
  </ul>` },
]
