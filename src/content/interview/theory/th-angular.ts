import type { TheoryArticle } from '@/engine/types'

export const angular: TheoryArticle = { id:'th-angular', topic:'Angular', title:'Angular с нуля: компоненты, шаблоны, DI и реактивность',
  lead:'Пошаговый разбор Angular для разработчика, который ещё не работал с ним: как устроен проект, как компоненты показывают данные, как общаются с сервисами и как обновляется интерфейс.',
  body:`
<h5>Что такое Angular и чем он отличается от React</h5>
<p><b>Angular</b> — полноценный frontend framework: кроме отображения компонентов он предлагает маршрутизатор, dependency injection, формы, HTTP-клиент, инструменты CLI, тестирования и conventions приложения. React — библиотека UI, а многие решения вокруг него выбирают отдельно. Vue занимает промежуточную позицию: ядро компактнее, но официальная экосистема покрывает router, store и tooling.</p>
<p>Angular написан на TypeScript и предпочитает явно описывать структуру и зависимости. Это удобно для больших команд и крупных приложений: меньше решений нужно изобретать самостоятельно, сильны инструменты и типизация. Цена — больше концепций, шаблонной структуры и знаний самого framework. Называть Angular «старым JavaScript с HTML внутри» неверно: современный Angular включает standalone components, signals, функциональные providers, control-flow синтаксис и развитый SSR.</p>

<h5>Создание проекта и устройство файлов</h5>
<p><b>Angular CLI</b> — командная строка и build tooling для создания проекта, генерации компонентов, запуска dev-сервера, тестов и production build. Версия CLI и генератора важна: defaults и шаблоны менялись. Текущий новый проект обычно использует standalone API, поэтому старые уроки, где каждый компонент обязательно объявляется в NgModule, могут описывать legacy-подход.</p>
<pre class="code">ng new task-board
cd task-board
ng serve
ng generate component tasks/task-list
ng build</pre>
<p>В проекте встречаются source файлы компонентов, маршруты, providers, assets, конфигурация и spec-файлы. CLI скрывает часть bundler configuration. Для собеседования важнее понимать архитектуру компонентов, DI и change detection, чем перечислить все поля angular.json.</p>

<h5>Компонент: класс + template + styles</h5>
<p><b>Component</b> — самостоятельный UI-блок: TypeScript class хранит данные и поведение, template описывает разметку и bindings, styles задают оформление. Декоратор <code class="i">@Component</code> добавляет метаданные, например selector, templateUrl, styles и список imports, необходимых шаблону standalone-компонента.</p>
<pre class="code">import { Component, signal } from '@angular/core'

@Component({
  selector: 'app-counter',
  standalone: true,
  template: \`
    &lt;button type="button" (click)="increment()"&gt;
      Счёт: {{ count() }}
    &lt;/button&gt;
  \`,
})
export class CounterComponent {
  count = signal(0)
  increment() { this.count.update(value =&gt; value + 1) }
}</pre>
<p>Selector <code class="i">app-counter</code> позволяет использовать компонент как HTML-подобный тег. При standalone модели компонент импортирует другие standalone components/directives/pipes в собственное поле imports, а приложение задаёт общие providers в bootstrap/application config.</p>

<h5>Bindings: передать данные из класса в шаблон и обратно</h5>
<table><tr><th>Синтаксис</th><th>Направление</th><th>Пример</th></tr>
<tr><td>Interpolation <code class="i">{{ }}</code></td><td>значение в текст</td><td><code class="i">{{ title }}</code></td></tr>
<tr><td>Property binding <code class="i">[prop]</code></td><td>класс → DOM property/input</td><td><code class="i">[disabled]="saving"</code></td></tr>
<tr><td>Event binding <code class="i">(event)</code></td><td>DOM event → метод</td><td><code class="i">(click)="save()"</code></td></tr>
<tr><td>Two-way <code class="i">[(...)]</code></td><td>согласованная передача в обе стороны</td><td><code class="i">[(ngModel)]="name"</code></td></tr></table>
<p>Название banana-in-a-box (<code class="i">[(value)]</code>) — мнемоника двух квадратных и круглых скобок, не отдельная магия. В современном Angular model inputs позволяют компоненту определённо задавать двусторонний binding; для input формы обычно нужны соответствующие формы и импорт директивы.</p>

<h5>Директивы и control flow</h5>
<p><b>Directive</b> меняет поведение элемента/структуру шаблона. Attribute directive меняет существующий узел; structural/control-flow construct добавляет или убирает фрагмент дерева. Современный template control flow использует <code class="i">@if</code>, <code class="i">@for</code> и <code class="i">@switch</code>; старый <code class="i">*ngIf</code>/<code class="i">*ngFor</code> остаётся широко встречаемым и важен для существующих проектов.</p>
<pre class="code">@if (tasks().length === 0) {
  &lt;p&gt;Задач пока нет&lt;/p&gt;
} @else {
  @for (task of tasks(); track task.id) {
    &lt;app-task-row [task]="task" /&gt;
  }
}</pre>
<p><code class="i">track task.id</code> сообщает Angular стабильную идентичность элемента. Без стабильного ключа framework хуже сопоставляет старые DOM-узлы с новым списком, может пересоздавать больше элементов или показывать состояние не у той строки. Не используйте индекс, если список можно переставлять/удалять.</p>

<h5>Inputs, outputs, events и композиция</h5>
<p>Родитель передаёт данные ребёнку через inputs; ребёнок сообщает о пользовательском событии через outputs. Это однонаправленный поток данных и явный контракт компонента. Не связывайте соседние компоненты прямым поиском DOM или мутацией полей друг друга. Для вложенных элементов используйте inputs/outputs; для общего долгоживущего состояния — сервис/store, но не превращайте каждый флаг в глобальный store.</p>
<p>Шаблон поддерживает content projection через <code class="i">ng-content</code>: родитель передаёт разметку в слот компонента. Это позволяет строить универсальную кнопку/карточку с контролем содержимого, сохраняя владение разметкой у вызывающей стороны.</p>

<h5>Dependency Injection: что такое сервис</h5>
<p><b>Dependency Injection (DI)</b> — механизм, который создаёт/находит зависимость и передаёт её потребителю. Компоненту не нужно вручную создавать API client в конструкторе; он объявляет потребность, а injector разрешает provider. Это разделяет UI, сетевой слой и бизнес-логику, упрощает замену зависимости в тесте.</p>
<pre class="code">import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable({ providedIn: 'root' })
export class TasksApi {
  private http = inject(HttpClient)
  list() { return this.http.get&lt;Task[]&gt;('/api/tasks') }
}</pre>
<p><code class="i">providedIn: 'root'</code> обычно регистрирует сервис на уровне приложения и поддерживает tree-shaking. Injector-ы могут быть иерархическими: provider на уровне lazy route/component может иметь отдельную область жизни/экземпляр. Это полезно для локального состояния, но неожиданно, если предполагался один singleton.</p>
<p>Токен DI — ключ, по которому ищется значение; provider сопоставляет token с class, factory, value или другим token. Не инжектируйте случайные конкретные классы везде: границы можно описать abstract token/interface token и предоставить тестовую/реальную реализацию.</p>

<h5>Signals: состояние и вычисляемые значения</h5>
<p><b>Signal</b> — контейнер реактивного значения. Чтение через вызов <code class="i">count()</code> регистрируется как зависимость; <code class="i">set/update</code> сообщает Angular, что связанный UI должен пересчитаться. <b>Computed</b> — производное readonly значение, пересчитываемое при изменении прочитанных сигналов; <b>effect</b> выполняет побочное действие на реактивную зависимость.</p>
<pre class="code">count = signal(1)
double = computed(() =&gt; this.count() * 2)

increment() {
  this.count.update(value =&gt; value + 1)
}</pre>
<p>Signals — не просто ещё одно слово для Observable. Signal представляет текущее синхронно доступное значение; Observable моделирует последовательность событий во времени, может быть холодным/горячим, завершаться, ошибаться и поддерживает операторы потока. Их можно интегрировать, но выбирать стоит по задаче.</p>

<h5>RxJS и HTTP: асинхронные потоки</h5>
<p><b>Observable</b> — описание потока значений, на который подписываются. HTTP Observable обычно исполняет запрос при subscribe и завершает поток после ответа; stream от input может выдавать множество значений во времени. RxJS операторы преобразуют/комбинируют поток: <code class="i">map</code>, <code class="i">filter</code>, <code class="i">switchMap</code>, <code class="i">catchError</code>, <code class="i">debounceTime</code>.</p>
<p><code class="i">switchMap</code> полезен в поиске: новый ввод переключает поток на свежий запрос, а предыдущая подписка отписывается. <code class="i">mergeMap</code> допускает конкурентные запросы; <code class="i">concatMap</code> ставит их в очередь; <code class="i">exhaustMap</code> игнорирует новые, пока выполняется текущий. Выбор — часть семантики продукта: переключить поиск и отправку платежа нельзя одинаково.</p>
<p>Отписка предотвращает утечки и ненужную работу. Используйте async pipe в шаблоне или lifecycle-aware механизмы/сигнализацию; не подписывайтесь везде вручную, забывая cleanup. Ошибку потока нужно обработать так, чтобы UI мог показать retry, а не молча завершиться.</p>
<div data-demo="framework-reactivity-lab"></div>

<h5>Change detection: когда Angular проверяет UI</h5>
<p><b>Change detection</b> — поиск изменений в состоянии и обновление связанного DOM. Классическая Zone.js-интеграция перехватывает async события, чтобы инициировать проверку; <code class="i">OnPush</code> сужает случаи проверки компонента и поощряет явные immutable inputs/events. Signals дают framework точные зависимости и используются современной моделью обновлений. В новых Angular есть zoneless направление/режимы; конкретный default зависит от версии приложения, поэтому не отвечайте историческим правилом как вечным.</p>
<p>Не мутируйте вложенный объект, ожидая, что стратегия обнаружит новую ссылку. Предпочитайте неизменяемые обновления либо signal set/update. Не запускайте тяжёлую функцию в template expression: выражение может вычисляться многократно. Производные данные лучше вычислить явно/computed.</p>

<h5>Формы: template-driven или reactive</h5>
<p><b>Template-driven forms</b> задают большую часть поведения декларативно в шаблоне и подходят простым формам. <b>Reactive forms</b> описывают модель controls/groups в TypeScript: легче строить динамические формы, сложную валидацию, тесты и реактивные потоки. Современные Angular typed forms улучшают типизацию значения формы. В обоих вариантах сервер обязан перепроверить поля; клиентская validation — подсказка и UX.</p>

<h5>Маршрутизация, lazy loading и SSR</h5>
<p>Angular Router связывает URL с компонентом, guards и данными. Lazy route import откладывает часть приложения и уменьшает initial bundle. Guard полезен для UX-навигации, но не защищает API: backend повторно проверяет авторизацию. Route resolver может заранее загрузить данные, однако создаёт задержку до смены страницы; иногда лучше отрисовать skeleton и грузить внутри экрана.</p>
<p>Angular поддерживает server rendering/hydration через свою платформенную экосистему. При серверном render нельзя без проверки читать <code class="i">window</code>/<code class="i">document</code>; данные и первый клиентский render должны быть согласованы. Transfer cache и hydration помогают избежать повторного запроса/перерисовки, если корректно настроены.</p>

<h5>Тестирование, архитектура и типичные ошибки новичка</h5>
<ul><li>Unit-test тестирует чистую логику и компонент с заменёнными providers; integration проверяет template/DI; e2e — критический путь в браузере.</li><li>Не помещайте HTTP, бизнес-правила и DOM-логику целиком в component. Держите компонент небольшим, а сервис — с ясной ответственностью.</li><li>Не подписывайтесь вручную без отписки; используйте template async/современные lifecycle средства.</li><li>Не создавайте глобальный singleton store для локального состояния одной формы.</li><li>Не полагайтесь на route guard вместо server authorization.</li><li>Следите за stable track key, error/loading/empty states, typed forms и lazy route boundaries.</li><li>Уточняйте версию Angular и старый/standalone стиль проекта прежде, чем советовать миграцию.</li></ul>

<h5>Как отвечать на собеседовании</h5>
<p>Объясняйте на одном примере: компонент отображает список, получает API-сервис через DI, Observable загружается и преобразуется, signal/computed или template обновляет состояние, Router открывает деталь, тест подменяет provider. Затем назовите версионные нюансы и компромиссы. Не пытайтесь выучить декораторы изолированно — проследите путь данных от URL/API до DOM и обратно в пользовательское действие.</p>

<h5>Практика по шагам</h5>
<ol><li>Создайте standalone CounterComponent с signal, computed и кнопкой, поясните, где состояние изменяется.</li><li>Сделайте TaskRow с input task и output completed; запретите ребёнку напрямую мутировать родительский объект.</li><li>Реализуйте фильтр поиска через debounceTime + switchMap; искусственно замедлите первый запрос и быстро поменяйте ввод.</li><li>Создайте typed reactive form с required/email/async validation и отображением loading/error/success.</li><li>Зарегистрируйте API service через token/provider и подмените provider в тесте.</li><li>Добавьте lazy маршрут и объясните, как проверить, что его chunk не загружается на стартовой странице.</li><li>Найдите в legacy NgModule компоненте путь миграции на standalone и проверьте сначала тесты/поведение.</li></ol>` }
