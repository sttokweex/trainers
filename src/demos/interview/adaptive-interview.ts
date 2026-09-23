/* eslint-disable */
// @ts-nocheck — ветвящийся сценарий собеседования с уточнениями интервьюера
import type { LegacyDemo } from '@/engine/types'
import { dBtn, dEl, dShell } from '@/demos/helpers'

type Choice = { t: string; score: number; why: string }
type Round = { title: string; prompt: string; choices: Choice[] }

const followUps: Round[] = [
  {
    title: 'Интервьюер уточняет',
    prompt: 'Relay опубликовал событие, но упал до отметки «готово» в outbox. После рестарта отправил то же событие ещё раз. Что отвечаете?',
    choices: [
      { t: '«Повтор ожидаем: consumer фиксирует eventId в inbox атомарно с бизнес-эффектом и безопасно игнорирует дубль».', score: 2, why: 'Вы не обещаете магическое exactly-once между системами: повторы допустимы, эффект защищён.' },
      { t: '«Поставлю commit offset до обработки, чтобы одно событие точно не пришло два раза».', score: 0, why: 'При падении после commit, но до обработки заказ или уведомление потеряются.' },
      { t: '«Увеличу число retry в брокере, тогда дубль сам исчезнет».', score: 0, why: 'Retry помогает при временной ошибке, но не делает side effect идемпотентным.' },
    ],
  },
  {
    title: 'Интервьюер уточняет',
    prompt: 'Web-процесс вернул успех, затем перезапустился до вызова локального фонового callback. Клиент считает заказ принятым, события нет. Как исправить границу надёжности?',
    choices: [
      { t: '«Запись о доставке должна быть долговечной и созданной до ответа: outbox в той же транзакции, затем worker с retry».', score: 2, why: 'Принятый заказ и намерение доставить событие фиксируются атомарно до ответа клиенту.' },
      { t: '«Пусть браузер через минуту повторит запрос, вдруг сервер проснётся».', score: 0, why: 'Клиентский retry может создать дубликат и не гарантирует восстановление фоновой работы.' },
      { t: '«Добавлю graceful shutdown с ожиданием callback».', score: 1, why: 'Graceful shutdown сокращает потери при штатном рестарте, но не спасает от kill, сбоя машины и потери процесса.' },
    ],
  },
  {
    title: 'Интервьюер уточняет',
    prompt: 'Consumer получил order.created, но транзакция заказа откатилась. Событие уже увидел downstream-сервис. Как разрулить несогласованное состояние?',
    choices: [
      { t: '«Не публиковать из разорванных операций: transactional outbox; для уже распределённого процесса — явное состояние и компенсирующее действие».', score: 2, why: 'Вы закрываете окно до публикации и признаёте, что распределённый процесс может потребовать компенсацию.' },
      { t: '«Поставлю consumer-у паузу на 5 секунд: к этому времени заказ появится».', score: 0, why: 'Пауза маскирует гонку, но не связывает публикацию с commit и создаёт случайные задержки.' },
      { t: '«Увеличу число партиций — порядок операций станет правильным».', score: 0, why: 'Партиции дают параллелизм, но не делают запись в БД и публикацию общей транзакцией.' },
    ],
  },
]

const opening: Round = {
  title: 'Раунд 1 · Объясните решение',
  prompt: 'Вы проектируете оформление заказа. API должен ответить меньше чем за 200 мс; после ответа приложение может упасть, но принятый заказ и событие о нём нельзя терять. Что предлагаете?',
  choices: [
    { t: '«Сохраню заказ и outbox-событие одной транзакцией; relay опубликует его после commit».', score: 2, why: 'Хорошо: состояние заказа и намерение отправить событие фиксируются вместе.' },
    { t: '«Верну 200, а событие отправлю через локальный setTimeout в web-процессе».', score: 0, why: 'Быстро, но процесс может завершиться между ответом и callback: заказ принят, событие потеряно.' },
    { t: '«Сначала отправлю order.created в брокер, потом запишу заказ в БД».', score: 0, why: 'Если запись заказа откатится, downstream увидит событие о несуществующем заказе.' },
  ],
}

const incident: Round = {
  title: 'Раунд 3 · Теперь вы on-call',
  prompt: 'После релиза растёт lag очереди, p95 оформления уже 2 секунды. Потери данных пока не замечены. Что сделаете первым?',
  choices: [
    { t: '«Смотрю lag по партициям, возраст старейшего события и насыщение БД; ограничиваю вход и масштабирую consumer-ы в пределах полезного параллелизма».', score: 2, why: 'Сначала локализуете узкое место и защищаете зависимости. Масштабирование ограничено числом партиций и ёмкостью БД.' },
    { t: '«Сразу подниму число consumer-ов в 100 раз: чем больше, тем быстрее».', score: 0, why: 'Consumer-ов больше числа партиций не ускорит чтение, а БД можно перегрузить ещё сильнее.' },
    { t: '«Сброшу offsets к последнему сообщению, чтобы график lag стал нулевым».', score: 0, why: 'График улучшится за счёт незаметной потери необработанной работы.' },
  ],
}

export const adaptiveInterview: LegacyDemo = root => {
  const body = dShell(root, 'Собеседование с меняющимися вводными')
  body.appendChild(dEl('div', 'demo-note', 'Это не тест на терминологию. Сначала проговорите план вслух, затем выберите ответ. Интервьюер задаст следующий вопрос с учётом вашего решения.'))
  const progress = dEl('div', 'demo-note')
  const prompt = dEl('div', 'pb-res wait')
  const choicesHost = dEl('div')
  const feedback = dEl('div')
  body.append(progress, prompt, choicesHost, feedback)

  let step = 0
  let points = 0
  let selectedOpening: Choice | null = null
  const decisions: { title: string; choice: string; why: string; score: number }[] = []

  function currentRound(): Round {
    if (step === 0) return opening
    if (step === 1) {
      const choiceIndex = opening.choices.indexOf(selectedOpening as Choice)
      return followUps[choiceIndex]
    }
    return incident
  }

  function draw() {
    if (step >= 3) { drawSummary(); return }
    const round = currentRound()
    progress.textContent = 'Разговор ' + (step + 1) + ' из 3 · сигналы сильного ответа: инвариант, окно сбоя, измерение'
    prompt.innerHTML = '<b>' + round.title + '</b><br>' + round.prompt
    choicesHost.innerHTML = ''
    feedback.innerHTML = ''
    const choices = dEl('div', 'demo-ctl')
    round.choices.forEach((choice, index) => {
      choices.appendChild(dBtn(choice.t, null, () => {
        choices.querySelectorAll('button').forEach(button => { button.disabled = true })
        points += choice.score
        decisions.push({ title: round.title, choice: choice.t, why: choice.why, score: choice.score })
        if (step === 0) selectedOpening = opening.choices[index]
        const signal = dEl('div', 'pb-res ' + (choice.score === 2 ? 'ok' : choice.score === 1 ? 'wait' : 'err'))
        signal.textContent = (choice.score === 2 ? 'Сильный ход. ' : choice.score === 1 ? 'Полезная часть ответа. ' : 'Здесь интервьюер задаст неудобный уточняющий вопрос. ') + choice.why
        feedback.appendChild(signal)
        feedback.appendChild(dBtn(step === 2 ? 'Показать разбор' : 'Уточнение интервьюера →', 'pri', () => { step++; draw() }))
      }))
    })
    choicesHost.appendChild(choices)
  }

  function drawSummary() {
    progress.textContent = 'Разговор завершён · ' + points + ' из 6 сигналов'
    prompt.className = 'pb-res ' + (points >= 5 ? 'ok' : points >= 3 ? 'wait' : 'err')
    prompt.innerHTML = '<b>' + (points >= 5 ? 'Уверенный ответ' : points >= 3 ? 'Хорошая основа, но есть пробелы' : 'План стоит укрепить') + '</b><br>' +
      'Оценка не за названия технологий. Баллы дают конкретные инварианты, корректные окна отказа и действия по наблюдаемым данным.'
    choicesHost.innerHTML = ''
    feedback.innerHTML = ''
    const review = dEl('div', 'demo-note')
    review.innerHTML = '<b>Ваш ход и реакция интервьюера</b><ol>' + decisions.map(item =>
      '<li><b>' + item.title + '</b> · ' + item.score + '/2<br>' + item.why + '</li>',
    ).join('') + '</ol><p><b>Как собрать ответ вслух:</b> требование → инвариант → схема → окно отказа → защита от повтора → метрика → компромисс.</p>'
    feedback.appendChild(review)
    feedback.appendChild(dBtn('↻ Пройти новый раунд', 'pri', () => {
      step = 0; points = 0; selectedOpening = null; decisions.length = 0
      prompt.className = 'pb-res wait'
      draw()
    }))
  }

  draw()
}
