/* eslint-disable */
// @ts-nocheck — тела тестов портированы из JS; ассерты приходят из окружения воркера
import type { Question } from '@/engine/types'

/** Алгоритмы — 12 вопрос(ов) */
export const algoritmQuestions: Question[] = [
  { id:'alg-bigo', topic:'Алгоритмы', type:'theory', level:'junior',
    q:'Что такое O-нотация? Оцените сложность типовых операций и объясните, почему <code class="i">arr.includes()</code> внутри цикла — это катастрофа.',
    code:`// Сколько это работает при n = 10 000?
  const result = a.filter(x => b.includes(x))   // ?
  
  // А так?
  const setB = new Set(b)
  const result = a.filter(x => setB.has(x))     // ?`,
    answer:`<h5>Что измеряет O-нотация</h5>
  <p><b>Асимптотический рост</b> времени или памяти при увеличении входа. Константы и младшие слагаемые отбрасываются: <code class="i">O(3n + 100)</code> = <code class="i">O(n)</code>. Это не «сколько миллисекунд», а «во сколько раз хуже станет, если данных станет в 10 раз больше».</p>
  <h5>Ответ на код</h5>
  <p>Первый вариант — <b>O(n·m)</b>: для каждого из n элементов <code class="i">includes</code> линейно сканирует b. При 10 000 × 10 000 это 100 млн операций — секунды. Второй — <b>O(n + m)</b>: построение Set линейно, <code class="i">has</code> — O(1). 20 000 операций, миллисекунды. <b>Разница в 5000 раз.</b></p>
  <h5>Шкала роста</h5>
  <table>
  <tr><th>Сложность</th><th>Название</th><th>Пример</th><th>n = 1 000 000</th></tr>
  <tr><td>O(1)</td><td>константная</td><td>доступ по индексу, Map.get</td><td>1</td></tr>
  <tr><td>O(log n)</td><td>логарифмическая</td><td>бинарный поиск, B-tree</td><td>~20</td></tr>
  <tr><td>O(n)</td><td>линейная</td><td>один проход по массиву</td><td>10⁶</td></tr>
  <tr><td>O(n log n)</td><td>линейно-логарифм.</td><td>эффективная сортировка</td><td>2·10⁷</td></tr>
  <tr><td>O(n²)</td><td>квадратичная</td><td>вложенные циклы</td><td>10¹² — не дождётесь</td></tr>
  <tr><td>O(2ⁿ)</td><td>экспоненциальная</td><td>наивные перебор/рекурсия</td><td>невозможно</td></tr>
  </table>
  <h5>Сложность операций в JS</h5>
  <table>
  <tr><th>Операция</th><th>Время</th></tr>
  <tr><td><code class="i">arr[i]</code>, <code class="i">push</code>, <code class="i">pop</code></td><td>O(1)</td></tr>
  <tr><td><code class="i">shift</code>, <code class="i">unshift</code>, <code class="i">splice</code></td><td>O(n) — сдвигаются все элементы</td></tr>
  <tr><td><code class="i">includes</code>, <code class="i">indexOf</code>, <code class="i">find</code>, <code class="i">filter</code>, <code class="i">map</code></td><td>O(n)</td></tr>
  <tr><td><code class="i">sort</code></td><td>O(n log n)</td></tr>
  <tr><td><code class="i">Map</code>/<code class="i">Set</code>: get, set, has, delete</td><td>O(1) в среднем</td></tr>
  <tr><td><code class="i">Object.keys</code>, спред <code class="i">{...obj}</code></td><td>O(n)</td></tr>
  </table>
  <div class="trap">Скрытая O(n) внутри цикла — главный источник случайных O(n²). Классика: <code class="i">arr.unshift()</code> в цикле, <code class="i">{...acc, [k]: v}</code> внутри <code class="i">reduce</code> (копирование всего аккумулятора на каждом шаге!), <code class="i">indexOf</code> в <code class="i">filter</code>, конкатенация строк в цикле в некоторых движках.</div>
  <h5>Как отвечать на собесе</h5>
  <p>Всегда называйте <b>и время, и память</b>: «O(n) по времени, O(n) по памяти — храню Map». И проговаривайте размен: «можно за O(1) памяти двумя указателями, но тогда нужен отсортированный вход».</p>` },
  { id:'alg-twosum', topic:'Алгоритмы', type:'code', level:'junior',
    q:'<b>Two Sum.</b> Найдите индексы двух чисел, дающих в сумме <code class="i">target</code>. Решите за O(n), а не за O(n²).',
    starter:`function twoSum(nums, target) {
    // вернуть [i, j] или null
  }`,
    exports:['twoSum'],
    tests:[
      {name:'простой случай', fn:m=>{ deepEq(m.twoSum([2,7,11,15],9),[0,1]) }},
      {name:'элементы не подряд', fn:m=>{ deepEq(m.twoSum([3,2,4],6),[1,2]) }},
      {name:'отрицательные числа', fn:m=>{ deepEq(m.twoSum([-3,4,3,90],0),[0,2]) }},
      {name:'одинаковые значения', fn:m=>{ deepEq(m.twoSum([3,3],6),[0,1]) }},
      {name:'нет решения → null', fn:m=>{ eq(m.twoSum([1,2,3],100),null) }},
      {name:'нельзя использовать один элемент дважды', fn:m=>{ eq(m.twoSum([5,1],10),null,'5+5 нельзя — элемент один') }},
      {name:'работает за O(n), а не O(n²)', fn:m=>{ const big=Array.from({length:60000},(_,i)=>i); const t=Date.now(); const r=m.twoSum(big,119997); const d=Date.now()-t; deepEq(r,[59998,59999]); ok(d<250,'заняло '+d+'мс — похоже на вложенные циклы') }},
    ],
    approach:`<ol>
  <li><b>Начните с наивного решения и назовите его сложность.</b> Два вложенных цикла: для каждого элемента ищем пару среди остальных. Работает, но O(n²). Это уже засчитывается — не молчите.</li>
  <li><b>Найдите, что именно дорого.</b> Дорог внутренний поиск «есть ли где-то число X». Поиск по массиву — линейный.</li>
  <li><b>Замените поиск на индекс.</b> Любой линейный поиск внутри цикла — кандидат на замену хеш-таблицей. <code class="i">Map.has</code> работает за O(1).</li>
  <li><b>Переформулируйте задачу под один проход.</b> Вместо «найти два числа» спросите для каждого элемента: «а видел ли я раньше число <code class="i">target − nums[i]</code>?» Тогда хватит одного прохода.</li>
  <li><b>Решите проблему «один элемент дважды».</b> Ищите дополнение <b>среди уже просмотренных</b>, то есть проверяйте Map <i>до</i> добавления текущего элемента. Иначе <code class="i">[5]</code> с целью 10 вернёт <code class="i">[0, 0]</code>.</li>
  <li><b>Проверьте границы:</b> пустой массив, отсутствие решения (вернуть null), отрицательные числа, дубликаты.</li>
  </ol>
  <p><b>Мысль на вынос:</b> «размен памяти на время» через Map — самый универсальный алгоритмический приём. Этот же приём вы применяете, когда чините N+1 батч-загрузкой.</p>`,
    solution:`function twoSum(nums, target) {
    const seen = new Map()          // значение -> индекс
  
    for (let i = 0; i < nums.length; i++) {
      const need = target - nums[i]
  
      // ищем дополнение СРЕДИ УЖЕ ПРОСМОТРЕННЫХ —
      // поэтому один элемент не может использоваться дважды
      if (seen.has(need)) return [seen.get(need), i]
  
      seen.set(nums[i], i)
    }
    return null
  }
  // Время O(n), память O(n).`,
    answer:`<h5>Идея — «размен памяти на время»</h5>
  <p>Наивное решение — два вложенных цикла, O(n²). Вместо этого идём один раз и запоминаем увиденное в <code class="i">Map</code>. Для каждого элемента спрашиваем: «а видел ли я раньше число, которого не хватает?» Поиск в Map — O(1).</p>
  <p>Это <b>самый частый алгоритмический паттерн в вебе вообще</b>: заменить повторный поиск по массиву на предварительно построенный индекс (Map/Set). Ровно то же самое вы делаете, когда чините N+1 батч-загрузкой.</p>
  <h5>Важная деталь</h5>
  <p>Проверка <code class="i">seen.has(need)</code> идёт <b>до</b> добавления текущего элемента. Если сделать наоборот, <code class="i">[5]</code> с <code class="i">target = 10</code> вернёт <code class="i">[0, 0]</code> — один элемент дважды.</p>
  <h5>Вариации, которые спросят следом</h5>
  <ul>
  <li><b>Массив отсортирован</b> → можно за O(1) памяти двумя указателями с краёв: сумма больше цели — двигаем правый влево, меньше — левый вправо.</li>
  <li><b>Three Sum</b> → отсортировать, зафиксировать первый элемент и решать Two Sum двумя указателями на остатке: O(n²).</li>
  <li><b>Вернуть все пары</b>, а не первую — тогда в Map кладём массивы индексов.</li>
  </ul>` },
  { id:'alg-window', topic:'Алгоритмы', type:'code', level:'middle',
    q:'<b>Скользящее окно.</b> Найдите длину самой длинной подстроки без повторяющихся символов: <code class="i">lengthOfLongestSubstring("abcabcbb") === 3</code>.',
    starter:`function lengthOfLongestSubstring(s) {
    // ваш код
  }`,
    exports:['lengthOfLongestSubstring'],
    tests:[
      {name:'abcabcbb → 3', fn:m=>{ eq(m.lengthOfLongestSubstring('abcabcbb'),3) }},
      {name:'bbbbb → 1', fn:m=>{ eq(m.lengthOfLongestSubstring('bbbbb'),1) }},
      {name:'pwwkew → 3', fn:m=>{ eq(m.lengthOfLongestSubstring('pwwkew'),3) }},
      {name:'пустая строка → 0', fn:m=>{ eq(m.lengthOfLongestSubstring(''),0) }},
      {name:'все символы разные', fn:m=>{ eq(m.lengthOfLongestSubstring('abcdef'),6) }},
      {name:'повтор в самом конце', fn:m=>{ eq(m.lengthOfLongestSubstring('abba'),2) }},
      {name:'линейная сложность', fn:m=>{ const s='abcdefghij'.repeat(20000); const t=Date.now(); eq(m.lengthOfLongestSubstring(s),10); ok(Date.now()-t<300,'слишком медленно — похоже на O(n²)') }},
    ],
    approach:`<ol>
  <li><b>Распознайте паттерн по условию.</b> Слова «подстрока» и «непрерывный отрезок» почти всегда означают <b>скользящее окно</b>.</li>
  <li><b>Определите, что такое «окно».</b> Здесь — отрезок <code class="i">[left, right]</code>, внутри которого нет повторов. Правая граница всегда идёт вперёд, левая подтягивается.</li>
  <li><b>Решите, как быстро узнавать о повторе.</b> Проверять весь отрезок — O(n) на каждый шаг, итого O(n²). Храните <code class="i">Map: символ → последний индекс</code>, тогда проверка O(1).</li>
  <li><b>Напишите каркас.</b> Внешний цикл по <code class="i">right</code>: впустили символ → если условие нарушено, двигаем <code class="i">left</code> → обновили лучший результат.</li>
  <li><b>Найдите ловушку с границей.</b> Прогоните <code class="i">'abba'</code>. Дойдя до последней <code class="i">'a'</code>, в Map лежит её старый индекс 0 — он уже <b>левее окна</b>. Без проверки <code class="i">lastSeen &gt;= left</code> граница прыгнет назад и ответ будет 3 вместо 2. Здесь падает большинство решений.</li>
  <li><b>Обоснуйте сложность.</b> Кажется, что циклы вложенные, но каждый указатель проходит строку максимум один раз — суммарно O(n).</li>
  </ol>`,
    solution:`function lengthOfLongestSubstring(s) {
    const lastSeen = new Map()   // символ -> последний индекс
    let left = 0                 // левая граница окна
    let best = 0
  
    for (let right = 0; right < s.length; right++) {
      const ch = s[right]
  
      // символ уже есть В ТЕКУЩЕМ окне — сдвигаем левую границу за его копию.
      // Math.max нужен, чтобы граница НИКОГДА не двигалась назад:
      // на 'abba' без него left откатится и ответ будет неверным.
      if (lastSeen.has(ch) && lastSeen.get(ch) >= left) {
        left = lastSeen.get(ch) + 1
      }
  
      lastSeen.set(ch, right)
      best = Math.max(best, right - left + 1)
    }
    return best
  }
  // Время O(n) — каждый указатель проходит строку один раз. Память O(k), k — алфавит.`,
    answer:`<h5>Паттерн «скользящее окно»</h5>
  <p>Два указателя задают отрезок. Правый всегда идёт вперёд и «впускает» элемент, левый подтягивается, когда окно нарушило условие. Каждый указатель проходит массив максимум один раз → <b>O(n)</b>, хотя внешне похоже на вложенные циклы.</p>
  <h5>Ловушка этой задачи</h5>
  <p><code class="i">'abba'</code>: дойдя до последней <code class="i">'a'</code>, в Map лежит её старый индекс 0, который уже <b>левее</b> окна. Без проверки <code class="i">lastSeen.get(ch) &gt;= left</code> (или без <code class="i">Math.max</code>) левая граница прыгнет назад и ответ станет 3 вместо 2. На этом падает большинство решений.</p>
  <h5>Когда применять скользящее окно</h5>
  <p>Признак в условии: «подмассив / подстрока», «непрерывный отрезок», «максимальная или минимальная длина при условии». Типовые задачи: максимальная сумма подмассива длины k, минимальное окно, содержащее все символы, самая длинная последовательность с не более чем k заменами.</p>
  <pre class="code">// каркас окна переменной длины
  let left = 0
  for (let right = 0; right &lt; n; right++) {
    add(arr[right])                      // впустили элемент
    while (!isValid()) { remove(arr[left]); left++ }   // сузили
    best = Math.max(best, right - left + 1)
  }</pre>` },
  { id:'alg-bsearch', topic:'Алгоритмы', type:'code', level:'middle',
    q:'<b>Бинарный поиск.</b> Реализуйте <code class="i">binarySearch(arr, target)</code> (индекс или -1) и <code class="i">lowerBound(arr, target)</code> — индекс первого элемента ≥ target.',
    starter:`function binarySearch(arr, target) {
    // ваш код
  }
  
  function lowerBound(arr, target) {
    // первый индекс, где arr[i] >= target; если таких нет — arr.length
  }`,
    exports:['binarySearch','lowerBound'],
    tests:[
      {name:'находит элемент', fn:m=>{ eq(m.binarySearch([1,3,5,7,9],5),2); eq(m.binarySearch([1,3,5,7,9],1),0); eq(m.binarySearch([1,3,5,7,9],9),4) }},
      {name:'не находит → -1', fn:m=>{ eq(m.binarySearch([1,3,5],4),-1); eq(m.binarySearch([1,3,5],0),-1); eq(m.binarySearch([1,3,5],99),-1) }},
      {name:'пустой массив и один элемент', fn:m=>{ eq(m.binarySearch([],1),-1); eq(m.binarySearch([7],7),0); eq(m.binarySearch([7],3),-1) }},
      {name:'lowerBound в середине', fn:m=>{ eq(m.lowerBound([1,3,5,7],4),2); eq(m.lowerBound([1,3,5,7],5),2) }},
      {name:'lowerBound на границах', fn:m=>{ eq(m.lowerBound([1,3,5],0),0); eq(m.lowerBound([1,3,5],99),3); eq(m.lowerBound([],5),0) }},
      {name:'lowerBound с дубликатами → самый левый', fn:m=>{ eq(m.lowerBound([1,2,2,2,3],2),1) }},
      {name:'логарифмическая сложность', fn:m=>{ const big=Array.from({length:2000000},(_,i)=>i*2); const t=Date.now(); for(let i=0;i<20000;i++) m.binarySearch(big, i*2); ok(Date.now()-t<400,'слишком медленно — похоже на линейный поиск') }},
    ],
    approach:`<ol>
  <li><b>Зафиксируйте инвариант до написания кода.</b> Решите один раз: границы включительные <code class="i">[lo, hi]</code> или полуинтервал <code class="i">[lo, hi)</code>. Смешивать стили нельзя — именно на этом ломается бинарный поиск.</li>
  <li><b>Включительные границы</b> → условие <code class="i">while (lo &lt;= hi)</code>, старт <code class="i">hi = length − 1</code>, сдвиги <code class="i">mid ± 1</code>. Это для обычного поиска.</li>
  <li><b>Полуинтервал</b> → условие <code class="i">while (lo &lt; hi)</code>, старт <code class="i">hi = length</code>, и <b><code class="i">hi = mid</code> без минус единицы</b>, потому что mid ещё может оказаться ответом. Это для поиска границы (lowerBound).</li>
  <li><b>Проверьте на бесконечный цикл.</b> Сочетание <code class="i">while (lo &lt;= hi)</code> с <code class="i">hi = mid</code> зациклится: диапазон перестанет сужаться.</li>
  <li><b>Напишите mid защищённо:</b> <code class="i">lo + Math.floor((hi − lo) / 2)</code>. В JS переполнение не грозит, но назвать причину — плюс: показывает понимание, а не копирование.</li>
  <li><b>Прогоните три случая руками:</b> элемент в начале, в конце, отсутствует. И проверьте пустой массив.</li>
  </ol>
  <p><b>Куда это расширяется:</b> «бинарный поиск по ответу» — когда ответ монотонен («подходит / не подходит»), ищут границу тем же кодом.</p>`,
    solution:`function binarySearch(arr, target) {
    let lo = 0, hi = arr.length - 1        // включительные границы
  
    while (lo <= hi) {
      // не (lo + hi) / 2 — на больших числах возможно переполнение
      const mid = lo + Math.floor((hi - lo) / 2)
  
      if (arr[mid] === target) return mid
      if (arr[mid] < target) lo = mid + 1  // ответ строго правее
      else hi = mid - 1                    // ответ строго левее
    }
    return -1
  }
  
  function lowerBound(arr, target) {
    let lo = 0, hi = arr.length            // hi — ИСКЛЮЧИТЕЛЬНАЯ граница
  
    while (lo < hi) {
      const mid = lo + Math.floor((hi - lo) / 2)
      if (arr[mid] < target) lo = mid + 1  // mid точно не ответ
      else hi = mid                        // mid МОЖЕТ быть ответом — не отбрасываем
    }
    return lo
  }`,
    answer:`<h5>Главное — инвариант</h5>
  <p>Бинарный поиск ломают на границах, а не на идее. Держите в голове одно правило: <b>решите, включительные у вас границы или нет, и не смешивайте</b>.</p>
  <ul>
  <li><code class="i">[lo, hi]</code> включительно → <code class="i">while (lo &lt;= hi)</code>, сдвиги <code class="i">mid ± 1</code>.</li>
  <li><code class="i">[lo, hi)</code> полуинтервал → <code class="i">while (lo &lt; hi)</code>, <code class="i">hi = mid</code> (без −1), старт <code class="i">hi = length</code>.</li>
  </ul>
  <p>Ошибка «<code class="i">hi = mid</code> при <code class="i">while (lo &lt;= hi)</code>» даёт бесконечный цикл — самая частая на собесе.</p>
  <h5>Почему <code class="i">lo + (hi - lo) / 2</code></h5>
  <p>Защита от переполнения: в языках с 32-битным int <code class="i">lo + hi</code> может переполниться. В JS числа 64-битные и это скорее ритуал, но назвать причину — плюс: показывает, что вы понимаете, а не копируете.</p>
  <h5>Где реально нужен</h5>
  <ul>
  <li><code class="i">lowerBound</code> — вставка в отсортированный список, поиск слота во временном ряду, курсорная пагинация.</li>
  <li><b>Бинарный поиск по ответу</b>: когда ответ монотонен («подходит / не подходит»), ищем границу. Пример: минимальное число серверов, при котором очередь разгребается за час.</li>
  <li>Индексы БД — это то же самое дерево поиска, только на диске.</li>
  </ul>
  <div class="hint">Обязательное условие — <b>отсортированный массив</b>. Если вход не отсортирован, сортировка стоит O(n log n), и ради одного поиска это дороже, чем линейный проход. Выгодно при многих поисках по одним данным.</div>` },
  { id:'alg-sort', topic:'Алгоритмы', type:'code', level:'middle',
    q:'Реализуйте <code class="i">mergeSort</code> и <code class="i">quickSortPartition</code>. Объясните разницу и что такое стабильность сортировки.',
    starter:`function mergeSort(arr) {
    // не мутировать вход
  }
  
  function merge(a, b) {
    // слить два отсортированных массива в один
  }`,
    exports:['mergeSort','merge'],
    tests:[
      {name:'merge двух отсортированных', fn:m=>{ deepEq(m.merge([1,3,5],[2,4,6]),[1,2,3,4,5,6]) }},
      {name:'merge с пустым', fn:m=>{ deepEq(m.merge([],[1,2]),[1,2]); deepEq(m.merge([1,2],[]),[1,2]); deepEq(m.merge([],[]),[]) }},
      {name:'merge с разной длиной', fn:m=>{ deepEq(m.merge([1],[2,3,4,5]),[1,2,3,4,5]) }},
      {name:'сортирует', fn:m=>{ deepEq(m.mergeSort([5,2,9,1,7]),[1,2,5,7,9]) }},
      {name:'пустой и один элемент', fn:m=>{ deepEq(m.mergeSort([]),[]); deepEq(m.mergeSort([1]),[1]) }},
      {name:'дубликаты', fn:m=>{ deepEq(m.mergeSort([3,1,3,1,2]),[1,1,2,3,3]) }},
      {name:'не мутирует вход', fn:m=>{ const a=[3,1,2]; m.mergeSort(a); deepEq(a,[3,1,2]) }},
      {name:'большой массив за разумное время', fn:m=>{ const a=Array.from({length:50000},()=>Math.random()); const t=Date.now(); const r=m.mergeSort(a); ok(Date.now()-t<1500,'слишком медленно'); for(let i=1;i<r.length;i++) ok(r[i-1]<=r[i],'массив не отсортирован') }},
    ],
    solution:`function merge(a, b) {
    const out = []
    let i = 0, j = 0
  
    while (i < a.length && j < b.length) {
      // <= а не < — именно это делает сортировку СТАБИЛЬНОЙ:
      // при равенстве первым берём элемент из левой половины
      if (a[i] <= b[j]) out.push(a[i++])
      else out.push(b[j++])
    }
    // один из массивов кончился — дописываем остаток
    while (i < a.length) out.push(a[i++])
    while (j < b.length) out.push(b[j++])
    return out
  }
  
  function mergeSort(arr) {
    if (arr.length <= 1) return [...arr]        // база рекурсии
  
    const mid = Math.floor(arr.length / 2)
    const left = mergeSort(arr.slice(0, mid))   // slice не мутирует вход
    const right = mergeSort(arr.slice(mid))
  
    return merge(left, right)
  }
  // Время O(n log n) всегда. Память O(n).`,
    answer:`<h5>Merge sort vs Quick sort</h5>
  <table>
  <tr><th></th><th>Merge sort</th><th>Quick sort</th></tr>
  <tr><td>Время (средн.)</td><td>O(n log n)</td><td>O(n log n)</td></tr>
  <tr><td>Время (худш.)</td><td><b>O(n log n)</b> — гарантия</td><td>O(n²) при плохом опорном</td></tr>
  <tr><td>Память</td><td>O(n)</td><td>O(log n) — на месте</td></tr>
  <tr><td>Стабильность</td><td><b>да</b></td><td>нет</td></tr>
  <tr><td>На практике</td><td>внешняя сортировка, связные списки</td><td>обычно быстрее по константе</td></tr>
  </table>
  <h5>Разделяй и властвуй</h5>
  <p>Оба алгоритма — один паттерн: разбить задачу пополам, решить части, объединить. Глубина рекурсии log n, на каждом уровне O(n) работы → O(n log n). Merge делает работу <b>при слиянии</b>, quick — <b>при разбиении</b> (partition вокруг опорного элемента).</p>
  <h5>Стабильность — почему это важно во фронтенде</h5>
  <p>Стабильная сортировка сохраняет относительный порядок равных элементов. Практический смысл: пользователь отсортировал таблицу по дате, потом по статусу — внутри одинаковых статусов порядок по дате <b>должен сохраниться</b>. Со времён ES2019 <code class="i">Array.prototype.sort</code> обязан быть стабильным, и V8 использует TimSort (гибрид merge и insertion).</p>
  <div class="hint">На собесе почти никогда не просят писать сортировку «в бою» — просят объяснить выбор. Сильный ответ: «взял бы встроенный <code class="i">sort</code> с компаратором: он TimSort, стабилен и оптимизирован под частично отсортированные данные, которые в реальных данных встречаются постоянно».</div>` },
  { id:'alg-graph', topic:'Алгоритмы', type:'code', level:'senior',
    q:'<b>Обход графа.</b> Реализуйте <code class="i">bfsShortestPath(graph, start, end)</code> — кратчайший путь в невзвешенном графе (список смежности).',
    starter:`function bfsShortestPath(graph, start, end) {
    // graph: { a: ['b','c'], b: ['d'], ... }
    // вернуть массив узлов пути или null
  }`,
    exports:['bfsShortestPath'],
    tests:[
      {name:'прямой путь', fn:m=>{ deepEq(m.bfsShortestPath({a:['b'],b:['c'],c:[]},'a','c'),['a','b','c']) }},
      {name:'выбирает КРАТЧАЙШИЙ из нескольких', fn:m=>{ const g={a:['b','d'],b:['c'],c:['e'],d:['e'],e:[]}; deepEq(m.bfsShortestPath(g,'a','e'),['a','d','e']) }},
      {name:'start === end', fn:m=>{ deepEq(m.bfsShortestPath({a:[]},'a','a'),['a']) }},
      {name:'пути нет → null', fn:m=>{ eq(m.bfsShortestPath({a:['b'],b:[],c:[]},'a','c'),null) }},
      {name:'цикл не приводит к зависанию', fn:m=>{ const g={a:['b'],b:['a','c'],c:['b']}; deepEq(m.bfsShortestPath(g,'a','c'),['a','b','c']) }},
      {name:'несуществующий узел', fn:m=>{ eq(m.bfsShortestPath({a:['b'],b:[]},'a','zzz'),null) }},
      {name:'широкий граф', fn:m=>{ const g={}; for(let i=0;i<5000;i++) g['n'+i]=['n'+(i+1)]; g.n5000=[]; const r=m.bfsShortestPath(g,'n0','n5000'); eq(r.length,5001) }},
    ],
    approach:`<ol>
  <li><b>Выберите обход по условию.</b> Нужен <b>кратчайший</b> путь в невзвешенном графе → только BFS. DFS найдёт какой-то путь, но не обязательно короткий.</li>
  <li><b>Поймите, почему BFS даёт кратчайший.</b> Он обходит по слоям: сначала все на расстоянии 1, потом 2. Значит, первое достижение цели и есть минимум шагов.</li>
  <li><b>Решите, что хранить в очереди.</b> Если складывать узлы, путь потом придётся восстанавливать через карту предков. Проще складывать <b>сами пути</b> — код короче, хотя памяти чуть больше.</li>
  <li><b>Заведите visited обязательно</b> — на графе с циклом обход без него зациклится навсегда.</li>
  <li><b>Помечайте узел посещённым ПРИ ДОБАВЛЕНИИ в очередь</b>, а не при извлечении. Иначе один узел попадёт в очередь многократно и сложность деградирует.</li>
  <li><b>Обработайте края:</b> start равен end, узла не существует, пути нет (вернуть null).</li>
  <li><b>Скажите про <code class="i">shift()</code>.</b> Он O(n), поэтому строго говоря это не идеальная реализация: в проде держат индекс головы или дек. Произнести это вслух — сильный ход.</li>
  </ol>`,
    solution:`function bfsShortestPath(graph, start, end) {
    if (start === end) return graph[start] !== undefined ? [start] : null
  
    const queue = [[start]]              // очередь ПУТЕЙ, а не узлов
    const visited = new Set([start])     // без этого циклы зациклят обход
  
    while (queue.length) {
      const path = queue.shift()         // FIFO — в этом вся суть BFS
      const node = path[path.length - 1]
  
      for (const next of graph[node] ?? []) {
        if (visited.has(next)) continue
  
        const newPath = [...path, next]
        if (next === end) return newPath  // первый найденный = кратчайший
  
        visited.add(next)                 // помечаем ПРИ ДОБАВЛЕНИИ в очередь,
        queue.push(newPath)               // иначе узел попадёт в очередь много раз
      }
    }
    return null
  }`,
    answer:`<h5>Почему именно BFS</h5>
  <p>BFS обходит граф <b>по слоям</b>: сначала все соседи на расстоянии 1, потом 2 и так далее. Значит, <b>первый раз, когда мы дошли до цели, — это и есть кратчайший путь</b> (в невзвешенном графе). DFS такой гарантии не даёт: он уходит вглубь и может найти длинный путь первым.</p>
  <h5>BFS vs DFS</h5>
  <table>
  <tr><th></th><th>BFS</th><th>DFS</th></tr>
  <tr><td>Структура</td><td>очередь (FIFO)</td><td>стек / рекурсия (LIFO)</td></tr>
  <tr><td>Порядок</td><td>по слоям</td><td>вглубь</td></tr>
  <tr><td>Кратчайший путь</td><td>да (невзвешенный)</td><td>нет</td></tr>
  <tr><td>Память</td><td>O(ширины)</td><td>O(глубины)</td></tr>
  <tr><td>Задачи</td><td>кратчайший путь, уровни, «друзья друзей»</td><td>циклы, топосорт, компоненты связности, backtracking</td></tr>
  </table>
  <h5>Две классические ошибки</h5>
  <ol>
  <li><b>Помечать visited при извлечении, а не при добавлении.</b> Тогда один узел попадёт в очередь несколько раз, и сложность деградирует.</li>
  <li><b>Забыть visited вообще.</b> На графе с циклом — бесконечный цикл.</li>
  </ol>
  <h5>Где графы встречаются во фронтенде и бэкенде</h5>
  <ul>
  <li>Дерево компонентов React и обход DOM — это графы.</li>
  <li><b>Топологическая сортировка</b>: порядок сборки модулей, разрешение зависимостей пакетов, порядок применения миграций. Там же обнаружение циклических зависимостей — то, что Nest ловит как circular dependency.</li>
  <li>Роутинг, навигация по категориям, «рекомендации друзей», построение пути в дереве меню.</li>
  </ul>
  <div class="hint">Уточнение по производительности: <code class="i">queue.shift()</code> — это O(n), поэтому строго говоря реализация выше не идеальна. В «настоящем» коде держат индекс головы (<code class="i">let head = 0; queue[head++]</code>) или дек. Назвать это вслух — сильный ход.</div>` },
  { id:'alg-dp', topic:'Алгоритмы', type:'code', level:'senior',
    q:'<b>Динамическое программирование.</b> Реализуйте <code class="i">climbStairs(n)</code> (сколько способов подняться по n ступеням шагами 1 или 2) и <code class="i">maxSubArray(nums)</code> (максимальная сумма подмассива, алгоритм Кадане).',
    starter:`function climbStairs(n) {
    // за O(n) времени и O(1) памяти
  }
  
  function maxSubArray(nums) {
    // максимальная сумма непрерывного подмассива
  }`,
    exports:['climbStairs','maxSubArray'],
    tests:[
      {name:'climbStairs базовые', fn:m=>{ eq(m.climbStairs(1),1); eq(m.climbStairs(2),2); eq(m.climbStairs(3),3); eq(m.climbStairs(5),8) }},
      {name:'climbStairs(0) → 1', fn:m=>{ eq(m.climbStairs(0),1,'один способ — не двигаться') }},
      {name:'climbStairs без экспоненциальной рекурсии', fn:m=>{ const t=Date.now(); const r=m.climbStairs(45); eq(r,1836311903); ok(Date.now()-t<200,'наивная рекурсия — O(2^n), нужна мемоизация или итерация') }},
      {name:'maxSubArray классика', fn:m=>{ eq(m.maxSubArray([-2,1,-3,4,-1,2,1,-5,4]),6,'подмассив [4,-1,2,1]') }},
      {name:'maxSubArray все положительные', fn:m=>{ eq(m.maxSubArray([1,2,3]),6) }},
      {name:'maxSubArray все отрицательные', fn:m=>{ eq(m.maxSubArray([-3,-1,-7]),-1,'должен вернуть наименее плохой элемент, а не 0') }},
      {name:'maxSubArray один элемент', fn:m=>{ eq(m.maxSubArray([5]),5); eq(m.maxSubArray([-5]),-5) }},
    ],
    approach:`<ol>
  <li><b>Проверьте, что это вообще ДП.</b> Два признака: задача разбивается на <b>перекрывающиеся</b> подзадачи и оптимум целого собирается из оптимумов частей.</li>
  <li><b>Сформулируйте состояние словами.</b> Для лестницы: «<code class="i">dp[n]</code> — сколько способов дойти до ступени n». Для Кадане: «<code class="i">dp[i]</code> — максимальная сумма подмассива, <b>заканчивающегося</b> на i». Без чёткой формулировки переход придумать невозможно.</li>
  <li><b>Выпишите переход.</b> На ступень n можно попасть с n−1 или n−2, значит <code class="i">f(n) = f(n−1) + f(n−2)</code> — это числа Фибоначчи.</li>
  <li><b>Определите базу</b> и проверьте её на краевых значениях: <code class="i">climbStairs(0)</code> должно вернуть 1 — «один способ не двигаться».</li>
  <li><b>Оптимизируйте память.</b> Нужны только два последних значения — массив не нужен, хватит двух переменных. Наивная рекурсия без мемоизации даст O(2ⁿ) и не дождётся n = 45.</li>
  <li><b>В Кадане задайте себе вопрос на каждом шаге:</b> «выгоднее продолжить текущий подмассив или начать новый с этого элемента?» Отсюда <code class="i">Math.max(nums[i], current + nums[i])</code>.</li>
  <li><b>Проверьте массив из одних отрицательных чисел.</b> Инициализация <code class="i">best = 0</code> вернёт 0 вместо −1 — самая частая ошибка в этой задаче. Начинайте с <code class="i">nums[0]</code>.</li>
  </ol>`,
    solution:`function climbStairs(n) {
    // Рекуррента: f(n) = f(n-1) + f(n-2). Это числа Фибоначчи.
    // Наивная рекурсия пересчитывает одни и те же значения → O(2^n).
    // Нам нужны только два последних → O(1) памяти.
    let prev = 1, cur = 1
  
    for (let i = 2; i <= n; i++) {
      const next = prev + cur
      prev = cur
      cur = next
    }
    return cur
  }
  
  function maxSubArray(nums) {
    // Алгоритм Кадане. Ключевой вопрос на каждом шаге:
    // выгоднее продолжить текущий подмассив или начать новый с этого элемента?
    let best = nums[0]
    let current = nums[0]
  
    for (let i = 1; i < nums.length; i++) {
      current = Math.max(nums[i], current + nums[i])
      best = Math.max(best, current)
    }
    return best
  }
  // Оба: O(n) по времени, O(1) по памяти.`,
    answer:`<h5>Что такое ДП</h5>
  <p>Метод для задач, которые (1) разбиваются на <b>перекрывающиеся подзадачи</b> и (2) обладают <b>оптимальной подструктурой</b> — оптимум целого собирается из оптимумов частей. Суть: не считать одно и то же дважды.</p>
  <h5>Два стиля</h5>
  <pre class="code">// Сверху вниз — рекурсия + мемоизация (проще придумать)
  function climb(n, memo = new Map()) {
    if (n &lt;= 1) return 1
    if (memo.has(n)) return memo.get(n)
    const r = climb(n - 1, memo) + climb(n - 2, memo)
    memo.set(n, r)
    return r
  }
  
  // Снизу вверх — итерация (быстрее, нет риска переполнить стек)
  // именно она в решении выше</pre>
  <h5>Как решать ДП на собесе — рабочий порядок</h5>
  <ol>
  <li>Сформулируйте <b>состояние</b>: что означает <code class="i">dp[i]</code>? («максимальная сумма подмассива, заканчивающегося на i»).</li>
  <li>Выпишите <b>переход</b>: как <code class="i">dp[i]</code> выражается через предыдущие.</li>
  <li>Определите <b>базу</b>.</li>
  <li>Проверьте <b>порядок вычисления</b>.</li>
  <li>Оптимизируйте память: если нужны только 1–2 предыдущих значения, массив не нужен.</li>
  </ol>
  <h5>Ловушка в maxSubArray</h5>
  <p>Инициализация <code class="i">best = 0</code> даёт неверный ответ на массиве из одних отрицательных чисел (вернёт 0 вместо −1). Начинать надо с <code class="i">nums[0]</code>. Тест №6 проверяет именно это — очень частая ошибка.</p>
  <h5>Классический набор ДП-задач</h5>
  <p>Лестница/Фибоначчи, рюкзак, размен монет, наибольшая возрастающая подпоследовательность, расстояние Левенштейна, наибольшая общая подпоследовательность. Если знаете эти шесть — покрыли большинство собесов.</p>` },
  { id:'alg-stack', topic:'Алгоритмы', type:'code', level:'junior',
    q:'<b>Стек.</b> Проверьте корректность скобок: <code class="i">isValid("{[()]}")  === true</code>, <code class="i">isValid("([)]") === false</code>.',
    starter:`function isValid(s) {
    // ваш код
  }`,
    exports:['isValid'],
    tests:[
      {name:'простые пары', fn:m=>{ ok(m.isValid('()')); ok(m.isValid('[]')); ok(m.isValid('{}')) }},
      {name:'вложенные', fn:m=>{ ok(m.isValid('{[()]}')); ok(m.isValid('((()))')) }},
      {name:'последовательные', fn:m=>{ ok(m.isValid('()[]{}')) }},
      {name:'неверный порядок закрытия', fn:m=>{ ok(!m.isValid('([)]')) }},
      {name:'незакрытая скобка', fn:m=>{ ok(!m.isValid('(')); ok(!m.isValid('([]')) }},
      {name:'лишняя закрывающая', fn:m=>{ ok(!m.isValid(')')); ok(!m.isValid('()))')) }},
      {name:'пустая строка → true', fn:m=>{ ok(m.isValid('')) }},
    ],
    solution:`function isValid(s) {
    const pairs = { ')': '(', ']': '[', '}': '{' }
    const stack = []
  
    for (const ch of s) {
      if (ch === '(' || ch === '[' || ch === '{') {
        stack.push(ch)
      } else if (ch in pairs) {
        // закрывающая обязана соответствовать последней открытой
        if (stack.pop() !== pairs[ch]) return false
      }
    }
    // стек должен опустеть — иначе остались незакрытые
    return stack.length === 0
  }`,
    answer:`<h5>Почему стек</h5>
  <p>Скобки закрываются в порядке, обратном открытию — это буквально определение LIFO. Последняя открытая должна закрыться первой.</p>
  <p>Две проверки обязательны, и забыть вторую — типичная ошибка: несоответствие при <code class="i">pop</code> <b>и</b> пустота стека в конце. Без второй проверки <code class="i">"("</code> вернёт true.</p>
  <h5>Где стек встречается в реальной работе</h5>
  <ul>
  <li><b>Стек вызовов</b> — та самая структура, из-за переполнения которой падает глубокая рекурсия.</li>
  <li>Undo/redo в редакторе, история навигации.</li>
  <li>Парсеры: JSON, HTML, выражения. Именно так проверяется вложенность тегов.</li>
  <li>Обход дерева без рекурсии (DFS через явный стек).</li>
  </ul>
  <h5>Очередь рядом</h5>
  <p>FIFO: BFS, очереди задач (Bull), обработка событий, rate limiting. В JS очередь на массиве через <code class="i">shift()</code> — O(n); для больших объёмов держат индекс головы или связный список.</p>
  <div class="hint">Продолжение задачи, которое любят: «а если добавить кавычки и экранирование?» или «верните индекс первой ошибки». Проверяют, не заучено ли решение.</div>` },
  { id:'alg-linkedlist', topic:'Алгоритмы', type:'code', level:'middle',
    q:'<b>Связный список.</b> Разверните односвязный список: <code class="i">reverseList(head)</code>. И определите наличие цикла: <code class="i">hasCycle(head)</code>.',
    starter:`// Узел: { value, next }
  
  function reverseList(head) {
    // вернуть новую голову
  }
  
  function hasCycle(head) {
    // true, если есть цикл
  }`,
    exports:['reverseList','hasCycle'],
    tests:[
      {name:'разворачивает список', fn:m=>{ const l={value:1,next:{value:2,next:{value:3,next:null}}}; const r=m.reverseList(l); eq(r.value,3); eq(r.next.value,2); eq(r.next.next.value,1); eq(r.next.next.next,null) }},
      {name:'один элемент', fn:m=>{ const r=m.reverseList({value:1,next:null}); eq(r.value,1); eq(r.next,null) }},
      {name:'пустой список', fn:m=>{ eq(m.reverseList(null),null) }},
      {name:'длинный список без переполнения стека', fn:m=>{ let head=null; for(let i=0;i<100000;i++) head={value:i,next:head}; const r=m.reverseList(head); eq(r.value,0,'список был 99999→0, после разворота голова = 0'); let n=0,cur=r; while(cur){n++;cur=cur.next} eq(n,100000,'ни один узел не потерян') }},
      {name:'цикла нет', fn:m=>{ ok(!m.hasCycle({value:1,next:{value:2,next:null}})); ok(!m.hasCycle(null)) }},
      {name:'цикл есть', fn:m=>{ const a={value:1}, b={value:2}, c={value:3}; a.next=b; b.next=c; c.next=a; ok(m.hasCycle(a)) }},
      {name:'цикл не с головы', fn:m=>{ const a={value:1},b={value:2},c={value:3}; a.next=b; b.next=c; c.next=b; ok(m.hasCycle(a)) }},
    ],
    approach:`<ol>
  <li><b>Разворот — задача про «не потерять ссылку».</b> Как только вы перезапишете <code class="i">cur.next</code>, путь вперёд будет утрачен. Значит, сначала сохраните его во временную переменную.</li>
  <li><b>Отсюда ровно четыре строки в строгом порядке:</b> запомнить next → развернуть указатель назад → сдвинуть prev → сдвинуть cur. Менять порядок нельзя.</li>
  <li><b>Новая голова — это prev</b> на момент выхода из цикла, когда cur стал null.</li>
  <li><b>Откажитесь от рекурсии осознанно.</b> Она красивее, но даёт O(n) стека и упадёт на 100 000 узлов — тест это проверяет. Итеративно — O(1) памяти.</li>
  <li><b>Для поиска цикла сначала назовите простое решение:</b> Set посещённых узлов, O(n) памяти. Интервьюер почти наверняка спросит «а без дополнительной памяти?».</li>
  <li><b>Тогда — черепаха и заяц.</b> Медленный на шаг, быстрый на два. Если цикл есть, быстрый заходит в него и сокращает разрыв на 1 за итерацию — встреча неизбежна.</li>
  <li><b>Не забудьте условие <code class="i">fast && fast.next</code></b> — иначе <code class="i">fast.next.next</code> упадёт на предпоследнем узле.</li>
  </ol>`,
    solution:`function reverseList(head) {
    let prev = null
    let cur = head
  
    while (cur) {
      const next = cur.next   // 1. запомнили, куда идти дальше
      cur.next = prev         // 2. развернули указатель назад
      prev = cur              // 3. сдвинули prev
      cur = next              // 4. сдвинули cur
    }
    return prev               // cur === null, prev — последний узел = новая голова
  }
  // O(n) по времени, O(1) по памяти. Рекурсия здесь дала бы O(n) стека
  // и упала бы на 100 000 узлов.
  
  function hasCycle(head) {
    // Алгоритм Флойда «черепаха и заяц»
    let slow = head, fast = head
  
    while (fast && fast.next) {
      slow = slow.next          // на 1 шаг
      fast = fast.next.next     // на 2 шага
  
      // если есть цикл, быстрый неизбежно догонит медленного
      if (slow === fast) return true
    }
    return false                // fast дошёл до конца — цикла нет
  }`,
    answer:`<h5>Разворот списка — три указателя</h5>
  <p>Вся задача в том, чтобы <b>не потерять ссылку на следующий узел</b> до того, как перезапишете <code class="i">cur.next</code>. Отсюда временная переменная <code class="i">next</code>. Порядок четырёх строк менять нельзя.</p>
  <h5>Черепаха и заяц</h5>
  <p>Если цикл есть, быстрый указатель заходит в него и начинает «догонять» медленного, сокращая разрыв на 1 за итерацию — встреча неизбежна. Если цикла нет, быстрый упрётся в <code class="i">null</code>.</p>
  <p>Условие <code class="i">fast && fast.next</code> обязательно: <code class="i">fast.next.next</code> на предпоследнем узле иначе упадёт.</p>
  <p>Альтернатива — <code class="i">Set</code> посещённых узлов: проще, но O(n) памяти. Флойд даёт <b>O(1) памяти</b> — именно это и проверяют.</p>
  <h5>Связный список vs массив</h5>
  <table>
  <tr><th></th><th>Массив</th><th>Связный список</th></tr>
  <tr><td>Доступ по индексу</td><td>O(1)</td><td>O(n)</td></tr>
  <tr><td>Вставка/удаление в начало</td><td>O(n)</td><td><b>O(1)</b></td></tr>
  <tr><td>Вставка в середину (узел известен)</td><td>O(n)</td><td>O(1)</td></tr>
  <tr><td>Память</td><td>компактно, кеш процессора работает</td><td>+ указатель на узел, разбросано по памяти</td></tr>
  </table>
  <p>В JS связные списки почти не пишут руками, но идея нужна: на ней построены LRU-кеш, очередь без <code class="i">shift()</code>, а <b>список хуков в React fiber — это именно связный список</b>.</p>` },
  { id:'alg-anagram', topic:'Алгоритмы', type:'code', level:'junior',
    q:'Строки: <code class="i">isAnagram(a, b)</code> и <code class="i">isPalindrome(s)</code> (игнорируя регистр и не-буквы).',
    starter:`function isAnagram(a, b) {
    // 'листок' и 'столик' — анаграммы
  }
  
  function isPalindrome(s) {
    // 'А роза упала на лапу Азора' — палиндром
  }`,
    exports:['isAnagram','isPalindrome'],
    tests:[
      {name:'анаграммы', fn:m=>{ ok(m.isAnagram('листок','столик')); ok(m.isAnagram('anagram','nagaram')) }},
      {name:'не анаграммы', fn:m=>{ ok(!m.isAnagram('rat','car')); ok(!m.isAnagram('abc','abd')) }},
      {name:'разная длина', fn:m=>{ ok(!m.isAnagram('a','ab')) }},
      {name:'повторяющиеся буквы учитываются', fn:m=>{ ok(!m.isAnagram('aab','abb'),'счётчик букв, а не множество') }},
      {name:'пустые строки', fn:m=>{ ok(m.isAnagram('','')) }},
      {name:'палиндром простой', fn:m=>{ ok(m.isPalindrome('шалаш')); ok(m.isPalindrome('abba')) }},
      {name:'палиндром с пробелами и регистром', fn:m=>{ ok(m.isPalindrome('А роза упала на лапу Азора')); ok(m.isPalindrome('A man, a plan, a canal: Panama')) }},
      {name:'не палиндром', fn:m=>{ ok(!m.isPalindrome('привет')) }},
      {name:'пустая строка и один символ', fn:m=>{ ok(m.isPalindrome('')); ok(m.isPalindrome('a')) }},
    ],
    solution:`function isAnagram(a, b) {
    if (a.length !== b.length) return false      // быстрый выход
  
    const counts = new Map()
    for (const ch of a) counts.set(ch, (counts.get(ch) ?? 0) + 1)
  
    for (const ch of b) {
      const n = counts.get(ch)
      if (!n) return false                        // буквы нет или уже исчерпана
      counts.set(ch, n - 1)
    }
    return true
  }
  // O(n). Вариант через сортировку проще, но O(n log n).
  
  function isPalindrome(s) {
    const clean = s.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '')
  
    // два указателя с краёв: O(1) памяти, в отличие от сравнения с reverse
    let left = 0, right = clean.length - 1
    while (left < right) {
      if (clean[left] !== clean[right]) return false
      left++
      right--
    }
    return true
  }`,
    answer:`<h5>Два базовых приёма</h5>
  <ul>
  <li><b>Частотная карта</b> (<code class="i">Map</code> или объект) — универсальный инструмент для строк: анаграммы, первый неповторяющийся символ, группировка анаграмм, самый частый элемент.</li>
  <li><b>Два указателя с краёв</b> — палиндромы, разворот на месте, two sum в отсортированном массиве.</li>
  </ul>
  <h5>Что сказать про размен</h5>
  <p>Анаграмму можно решить в одну строку через сортировку: <code class="i">[...a].sort().join('') === [...b].sort().join('')</code>. Это O(n log n) и создаёт копии, зато читаемо. Счётчик — O(n). На собесе покажите оба и объясните выбор: для коротких строк разница неважна, для миллионов — критична.</p>
  <h5>Подводные камни со строками в JS</h5>
  <ul>
  <li>Строки <b>иммутабельны</b>: <code class="i">s[0] = 'x'</code> молча не сработает.</li>
  <li><code class="i">'a' &lt; 'b'</code> сравнивает по кодам символов, поэтому <code class="i">'Я' &lt; 'а'</code> — для человекочитаемой сортировки нужен <code class="i">localeCompare</code>.</li>
  <li>Эмодзи и составные символы занимают несколько code unit: <code class="i">'👍'.length === 2</code>. Итерация <code class="i">for...of</code> и <code class="i">[...str]</code> работают по code point и корректнее, чем <code class="i">str[i]</code>.</li>
  <li>Регистр в Турции: <code class="i">toLowerCase</code> для <code class="i">'I'</code> даёт другое, если полагаться на локаль — отсюда <code class="i">toLowerCase()</code> без локали в такой логике.</li>
  </ul>` },
  { id:'alg-recursion', topic:'Алгоритмы', type:'code', level:'middle',
    q:'Рекурсия по дереву: <code class="i">flattenDeep(arr)</code> без <code class="i">flat()</code>, <code class="i">sumTree(node)</code> и <code class="i">maxDepth(node)</code>.',
    starter:`function flattenDeep(arr) {
    // [1,[2,[3,[4]]]] => [1,2,3,4]
  }
  
  function sumTree(node) {
    // { value, children: [] } — сумма всех value
  }
  
  function maxDepth(node) {
    // глубина дерева; null => 0
  }`,
    exports:['flattenDeep','sumTree','maxDepth'],
    tests:[
      {name:'flatten плоского', fn:m=>{ deepEq(m.flattenDeep([1,2,3]),[1,2,3]) }},
      {name:'flatten глубокого', fn:m=>{ deepEq(m.flattenDeep([1,[2,[3,[4,[5]]]]]),[1,2,3,4,5]) }},
      {name:'flatten пустых вложений', fn:m=>{ deepEq(m.flattenDeep([1,[],[[]],[2]]),[1,2]) }},
      {name:'flatten пустого', fn:m=>{ deepEq(m.flattenDeep([]),[]) }},
      {name:'sumTree одного узла', fn:m=>{ eq(m.sumTree({value:5,children:[]}),5) }},
      {name:'sumTree дерева', fn:m=>{ const t={value:1,children:[{value:2,children:[{value:4,children:[]}]},{value:3,children:[]}]}; eq(m.sumTree(t),10) }},
      {name:'sumTree null → 0', fn:m=>{ eq(m.sumTree(null),0) }},
      {name:'maxDepth', fn:m=>{ eq(m.maxDepth(null),0); eq(m.maxDepth({value:1,children:[]}),1); const t={value:1,children:[{value:2,children:[{value:3,children:[]}]}]}; eq(m.maxDepth(t),3) }},
      {name:'maxDepth берёт самую глубокую ветку', fn:m=>{ const t={value:1,children:[{value:2,children:[]},{value:3,children:[{value:4,children:[{value:5,children:[]}]}]}]}; eq(m.maxDepth(t),4) }},
    ],
    solution:`function flattenDeep(arr) {
    const out = []
    for (const item of arr) {
      // рекурсивный случай vs базовый — вся суть рекурсии
      if (Array.isArray(item)) out.push(...flattenDeep(item))
      else out.push(item)
    }
    return out
  }
  
  function sumTree(node) {
    if (!node) return 0                                   // база
    return node.value +
      (node.children ?? []).reduce((acc, c) => acc + sumTree(c), 0)
  }
  
  function maxDepth(node) {
    if (!node) return 0                                   // база
    const children = node.children ?? []
    if (!children.length) return 1                        // лист
    return 1 + Math.max(...children.map(maxDepth))
  }`,
    answer:`<h5>Схема любой рекурсии</h5>
  <ol>
  <li><b>Базовый случай</b> — когда рекурсия останавливается. Пишите его <b>первым</b>: забытая база = переполнение стека.</li>
  <li><b>Рекурсивный случай</b> — свести задачу к <b>меньшей</b> такой же. Если аргумент не уменьшается, рекурсия бесконечна.</li>
  <li><b>Сборка результата</b> из результатов подзадач.</li>
  </ol>
  <h5>Ограничение стека</h5>
  <p>В V8 глубина примерно 10 000–15 000 кадров. Для деревьев из UI этого хватает с запасом, для списка на 100 000 узлов — нет. Тогда переписывают итеративно через явный стек:</p>
  <pre class="code">function flattenIterative(arr) {
    const stack = [...arr]
    const out = []
    while (stack.length) {
      const item = stack.pop()
      if (Array.isArray(item)) stack.push(...item)
      else out.unshift(item)      // (в проде лучше push + reverse в конце)
    }
    return out
  }</pre>
  <p>Про хвостовую рекурсию: она есть в спецификации ES2015, но <b>реально реализована только в Safari</b>. Полагаться на неё нельзя — тоже хороший факт для собеса.</p>
  <h5>Где это нужно каждый день</h5>
  <p>Обход дерева категорий и меню, рекурсивные React-компоненты (комментарии с ответами), глубокое сравнение и клонирование, обход файловой системы, парсинг вложенного JSON, построение хлебных крошек.</p>` },
  { id:'alg-structures', topic:'Алгоритмы', type:'theory', level:'middle',
    q:'Какие структуры данных надо знать веб-разработчику и когда что выбирать?',
    answer:`<h5>Таблица выбора</h5>
  <table>
  <tr><th>Структура</th><th>Сильна в</th><th>Слаба в</th><th>Когда брать</th></tr>
  <tr><td><b>Массив</b></td><td>доступ по индексу O(1), компактность</td><td>вставка/удаление в начало O(n), поиск O(n)</td><td>упорядоченные данные, итерация, рендер списка</td></tr>
  <tr><td><b>Объект / Map</b></td><td>поиск по ключу O(1)</td><td>нет порядка (у объекта), больше памяти</td><td>индекс по id, кеш, счётчики</td></tr>
  <tr><td><b>Set</b></td><td>проверка вхождения O(1), уникальность</td><td>нет порядка сортировки</td><td>«уже видели», дедупликация, visited в обходе</td></tr>
  <tr><td><b>Стек</b></td><td>LIFO O(1)</td><td>доступ к середине</td><td>undo, парсинг, DFS, история</td></tr>
  <tr><td><b>Очередь</b></td><td>FIFO O(1)</td><td>то же</td><td>BFS, задачи, события</td></tr>
  <tr><td><b>Связный список</b></td><td>вставка/удаление O(1)</td><td>доступ по индексу O(n)</td><td>LRU, fiber React, дек</td></tr>
  <tr><td><b>Дерево</b></td><td>иерархия, поиск O(log n) в сбалансированном</td><td>сложность реализации</td><td>категории, DOM, индексы БД</td></tr>
  <tr><td><b>Куча</b></td><td>min/max за O(log n)</td><td>поиск произвольного O(n)</td><td>приоритетная очередь, top-K</td></tr>
  <tr><td><b>Граф</b></td><td>произвольные связи</td><td>дорогие обходы</td><td>зависимости, маршруты, соцсвязи</td></tr>
  </table>
  <h5>Map vs Object — практическая разница</h5>
  <ul>
  <li>Ключи: у <code class="i">Map</code> любые (включая объекты), у объекта только строки и символы.</li>
  <li>Порядок: <code class="i">Map</code> гарантирует порядок вставки; у объекта целочисленные ключи всплывают вверх.</li>
  <li>Размер: <code class="i">map.size</code> против <code class="i">Object.keys(o).length</code> (O(n)).</li>
  <li>Прототип: у объекта есть унаследованные ключи (<code class="i">'toString' in {}</code> → true) — источник тонких багов. <code class="i">Object.create(null)</code> лечит.</li>
  <li>Производительность: <code class="i">Map</code> быстрее при частых добавлениях/удалениях; объект лучше для фиксированной структуры и сериализации в JSON.</li>
  </ul>
  <h5>Как выбирать структуру на собесе</h5>
  <p>Задайте себе вопрос: <b>какая операция будет самой частой?</b> Поиск по ключу → Map. Проверка вхождения → Set. Обход по порядку → массив. Нужен минимум на каждом шаге → куча. Это почти всегда даёт правильный ответ и звучит как инженерное рассуждение, а не угадывание.</p>
  <div class="hint">Куча/приоритетная очередь — то, что чаще всего не знают. Достаточно понимать идею: бинарное дерево, где родитель не больше потомков; вставка и извлечение минимума за O(log n). Применение: «топ-10 товаров», планировщик задач, алгоритм Дейкстры, слияние K отсортированных списков.</div>` },
]
