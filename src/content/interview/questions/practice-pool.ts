import type { Question } from '@/engine/types'

/** Дополнительный пул практических вопросов. Примеры намеренно не повторяют листинги из теории. */
export const practicePoolQuestions: Question[] = [
  {
    id: 'js-output-defaults',
    topic: 'JavaScript',
    type: 'output',
    level: 'junior',
    q: 'Что напечатает код? Проверьте, как значения по умолчанию различают <code class="i">undefined</code>, <code class="i">null</code> и <code class="i">0</code>.',
    code: `const config = { retries: 0, timeout: null }
const { retries = 3, timeout = 1000, debug = false } = config

console.log([retries, timeout, debug].map(String).join('|'))
console.log([config.retries ?? 1000, config.retries || 1000].join('|'))`,
    expected: '0|null|false\n0|1000',
    hint: 'Значение после = подставляется только для undefined. Отдельно сравните ?? и ||: ноль — это false, но не nullish.',
    answer: `<h5>Разбор</h5>
  <p>Деструктуризация оставляет <code class="i">retries: 0</code> и <code class="i">timeout: null</code>: значения по умолчанию срабатывают только для <code class="i">undefined</code>. Поэтому первая строка — <code class="i">0|null|false</code>.</p>
  <p>Для нулевого <code class="i">retries</code> оператор <code class="i">??</code> сохраняет 0, а <code class="i">||</code> подставляет 1000: во второй строке получится <code class="i">0|1000</code>. Это разница между «пустым значением» и любым falsy-значением.</p>`,
  },
  {
    id: 'browser-output-events',
    topic: 'Браузер',
    type: 'output',
    level: 'middle',
    q: 'В какой последовательности сработают слушатели при клике по вложенной кнопке? Восстановите путь события: capture → target → bubble.',
    code: `const log = []
const path = [
  { capture: () => log.push('parent-capture'), bubble: () => log.push('parent-bubble') },
  { target: () => log.push('child') },
]

for (let i = 0; i < path.length - 1; i += 1) path[i].capture?.()
path[path.length - 1].target?.()
for (let i = path.length - 2; i >= 0; i -= 1) path[i].bubble?.()
console.log(log.join(' > '))`,
    expected: 'parent-capture > child > parent-bubble',
    hint: 'Событие сначала спускается к target в capture-фазе, затем вызывается target, после чего поднимается в bubble-фазе.',
    answer: `<h5>Порядок распространения</h5>
  <ol>
  <li>Capture идёт от <code class="i">document</code> к target. Поэтому срабатывает обработчик родителя с третьим аргументом <code class="i">true</code>.</li>
  <li>На самом target срабатывает обработчик кнопки <code class="i">child</code>.</li>
  <li>Bubble идёт обратно вверх, поэтому последним вызывается обработчик родителя без <code class="i">true</code>.</li>
  </ol>
  <p>Массив <code class="i">path</code> здесь изображает цепочку DOM от родителя к кнопке. Сначала цикл проходит сверху вниз по capture, затем срабатывает target, после него второй цикл проходит вверх по bubble. В настоящем браузере этот путь строит сам DOM.</p>
  <p>Если у события выключить bubbling, обработчик родителя на обратном пути не запустится. <code class="i">stopPropagation()</code> останавливает дальнейшее распространение, а <code class="i">preventDefault()</code> отменяет действие браузера, но не саму цепочку обработчиков.</p>`,
  },
  {
    id: 'react-output-batched-state',
    topic: 'React',
    type: 'output',
    level: 'middle',
    q: 'Что напечатает модель очереди обновлений React после одного клика? Два значения вычислены из снимка рендера, третье — функция-updater.',
    code: `let n = 0
const render = () => console.log('render', n)
render() // первый рендер

const snapshot = n // значение из текущего рендера
const updates = [snapshot + 1, snapshot + 1, previous => previous + 1]
for (const update of updates) {
  n = typeof update === 'function' ? update(n) : update
}
render() // React применяет очередь и рендерит снова`,
    expected: 'render 0\nrender 2',
    hint: 'Два вызова setN(n + 1) используют один снимок n. Функциональный updater получает уже накопленное состояние.',
    answer: `<h5>Почему получится 0, затем 2</h5>
  <p>При монтировании компонент печатает <code class="i">render 0</code>. Во время одного обработчика React группирует обновления состояния и применяет их перед следующим рендером.</p>
  <p>Оба вызова <code class="i">setN(n + 1)</code> вычислены из одного старого снимка <code class="i">n = 0</code>, поэтому оба предлагают значение 1. Третий вызов — функциональный updater: он получает результат предыдущих обновлений и увеличивает его до 2. Следующий рендер печатает <code class="i">render 2</code>.</p>
  <p>Чтобы увеличить счётчик на три, все вызовы пишут как <code class="i">setN(prev =&gt; prev + 1)</code>. В обработчиках промисов и таймеров современный React также автоматически группирует обновления.</p>`,
  },
  {
    id: 'node-output-emitter-microtasks',
    topic: 'Node / Nest',
    type: 'output',
    level: 'middle',
    q: 'Что выведет эта упрощённая модель <code class="i">EventEmitter</code> в Node.js? Сопоставьте синхронных слушателей с очередью микрозадач.',
    code: `class EventEmitter {
  listeners = []
  on(listener) { this.listeners.push(listener) }
  emit() { for (const listener of this.listeners) listener() }
}

const bus = new EventEmitter()
bus.on(() => {
  console.log('A')
  queueMicrotask(() => console.log('microtask from A'))
})
bus.on(() => console.log('B'))

bus.emit()
Promise.resolve().then(() => console.log('promise'))
console.log('sync')`,
    expected: 'A\nB\nsync\nmicrotask from A\npromise',
    hint: 'emit вызывает слушателей сразу. Сначала закончится весь синхронный код, а затем выполнится общая FIFO-очередь микрозадач.',
    answer: `<h5>Разбор</h5>
  <p><code class="i">EventEmitter.emit</code> не откладывает слушателей: они выполняются сразу и в порядке регистрации. Поэтому сначала <code class="i">A</code>, затем <code class="i">B</code>, а после завершения <code class="i">emit</code> печатается <code class="i">sync</code>.</p>
  <p>Во время слушателя A в очередь микрозадач добавилась <code class="i">queueMicrotask</code>. Затем туда добавился callback от <code class="i">Promise.then</code>. Обе задачи идут в одной очереди по порядку добавления: <code class="i">microtask from A</code>, затем <code class="i">promise</code>.</p>
  <div class="trap"><code class="i">queueMicrotask</code> и callback промиса относятся к очереди микрозадач; таймеры идут отдельными макрозадачами.</div>`,
  },
  {
    id: 'api-output-url-search-params',
    topic: 'API и сеть',
    type: 'output',
    level: 'junior',
    q: 'Что выведет код? Обратите внимание на повторяющийся query-параметр и метод <code class="i">set</code>.',
    code: `const params = new URLSearchParams()
params.append('tag', 'js')
params.append('tag', 'react')
params.set('page', '1')
params.set('page', '2')

console.log(params.toString())
console.log(params.get('tag'))
console.log(params.getAll('tag').join(','))`,
    expected: 'tag=js&tag=react&page=2\njs\njs,react',
    hint: 'append добавляет ещё одно значение, а set заменяет все существующие значения этого имени. get берёт первое, getAll — все.',
    answer: `<h5>Три правила URLSearchParams</h5>
  <ul>
  <li><code class="i">append('tag', ...)</code> сохраняет оба значения, поэтому строка начинается с <code class="i">tag=js&amp;tag=react</code>.</li>
  <li><code class="i">set('page', '1')</code>, а затем <code class="i">set('page', '2')</code> оставляет одну пару <code class="i">page=2</code>. Порядок ключей остаётся порядком добавления.</li>
  <li><code class="i">get</code> возвращает первое значение повторяющегося ключа, а <code class="i">getAll</code> — массив всех значений.</li>
  </ul>
  <p>Для API с фильтрами-массивами заранее договоритесь о формате: повторяющиеся ключи <code class="i">tag=a&amp;tag=b</code> и <code class="i">tag[]=a&amp;tag[]=b</code> разбираются серверными фреймворками по-разному.</p>`,
  },
]
