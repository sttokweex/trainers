/**
 * Форма контента. Это источник правды: если у кодовой задачи забыть `solution`
 * или у расчётной `expect`, проект не соберётся.
 */

export type Level = 'junior' | 'middle' | 'senior'

interface QuestionBase {
  id: string
  topic: string
  /** Optional exact theory article for article-specific practice sets. */
  theoryId?: string
  level?: Level
  /** Текст вопроса. Может содержать HTML. */
  q: string
  /** Разбор. HTML; может содержать <div data-demo="…"> */
  answer: string
  /** Короткая подсказка, которую можно показать до полного разбора. */
  hint?: string
  /** Необязательный листинг, показываемый над полем ответа. */
  code?: string
}

/** Чистая теория: проверять нечего, в режиме «Изучение» ответ раскрыт сразу. */
export interface TheoryQuestion extends QuestionBase {
  type: 'theory'
}

/** Предсказать вывод консоли. Ответ вводится в ячейки, по одной на строку. */
export interface OutputQuestion extends QuestionBase {
  type: 'output'
  expected: string
}

export interface TestCase {
  name: string
  /** Получает объект с экспортами пользовательского кода. */
  fn: (m: any) => void | Promise<void>
}

/** Задача с авто-проверкой: код исполняется и прогоняется через тесты. */
export interface CodeQuestion extends QuestionBase {
  type: 'code'
  starter: string
  /** Имена, которые обязан объявить пользователь. */
  exports: string[]
  tests: TestCase[]
  solution: string
  /** Ход решения: как до него додуматься. */
  approach?: string
}

/** Написать код и сравнить с эталоном — авто-проверки нет. */
export interface ManualQuestion extends QuestionBase {
  type: 'manual'
  starter?: string
  solution: string
  approach?: string
}

/** Выбор варианта (один или несколько). */
export interface ChoiceQuestion extends QuestionBase {
  type: 'choice'
  options: { t: string; ok: boolean }[]
  multi?: boolean
}

/** Расчётная задача: сверка числа с допуском. */
export interface NumQuestion extends QuestionBase {
  type: 'num'
  expect: number
  unit?: string
  /** Допустимое отклонение, по умолчанию 0.01. */
  tol?: number
}

export type Question =
  | TheoryQuestion
  | OutputQuestion
  | CodeQuestion
  | ManualQuestion
  | ChoiceQuestion
  | NumQuestion

export type QuestionType = Question['type']

export interface TheoryArticle {
  id: string
  topic: string
  title: string
  /** Подзаголовок в свёрнутой карточке. */
  lead: string
  /** HTML статьи; <h5> становятся пунктами оглавления. */
  body: string
}

/** Карточка режима «Практикум» — обёртка над демо. */
export interface Tool {
  id: string
  topic: string
  /** Заголовок. */
  t: string
  /** Описание. */
  d: string
  /** Имя демо из реестра. */
  demo: string
}

/** Флеш-карточка: термин, английский эквивалент, определение. */
export interface Card {
  term: string
  en: string
  def: string
  topic: string
}

/**
 * Куда ведёт пункт плана. Проставляется в данных явно — сопоставление по
 * названию делается один раз скриптом и проверяется глазами, чтобы в рантайме
 * ничего не угадывалось и пользователь не попадал не в ту статью.
 */
export interface PlanLink {
  mode: PackMode
  /** id статьи или инструмента: карточка раскроется и прокрутится к себе. */
  id?: string
  /** Тема — когда пункт ссылается на группу материалов, а не на один. */
  topic?: string
  /** Optional question status filter when linking back to the bank. */
  status?: 'all' | 'new' | 'repeat' | 'know'
}

export interface PlanItem {
  t: string
  s: string
  link?: PlanLink
}

/** Неделя плана обучения. */
export interface PlanWeek {
  n: number
  t: string
  goal: string
  items: PlanItem[]
}

/**
 * Демо, доставшееся от императивной версии: получает контейнер и наполняет его
 * вручную. Вызывается из React через <Demo />, который воспроизводит защиту
 * от повторного монтирования.
 */
export type LegacyDemo = (root: HTMLElement) => void

export type PackMode = 'questions' | 'theory' | 'tools' | 'cards' | 'plan' | 'dashboard' | 'session'

/** Группировка тем в сайдбаре. Если не задана — темы выводятся плоским списком. */
export interface TopicCategory {
  name: string
  topics: string[]
}

export interface ContentPack {
  id: string
  title: string
  accent: string
  /** Префикс ключей localStorage — прогресс паков не пересекается. */
  storagePrefix: string
  modes: PackMode[]
  defaultMode: PackMode
  /** Показывать ли фильтр по уровню (есть смысл только там, где уровни размечены). */
  hasLevelFilter: boolean
  categories?: TopicCategory[]
  questions: Question[]
  theory: TheoryArticle[]
  tools?: Tool[]
  cards?: Card[]
  plan?: PlanWeek[]
  demos: Record<string, LegacyDemo>
}

/** Отметка пользователя по вопросу. */
export type Mark = 'know' | 'repeat'

/** Spaced repetition metadata for a question. */
export interface ReviewState {
  attempts: number
  correct: number
  next: number
  last: number
}
