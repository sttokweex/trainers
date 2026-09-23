import { beforeAll, describe, expect, it } from 'vitest'
import { PACKS } from '@/content/all'
import * as assert from '@/engine/runner/assert'
import type { CodeQuestion, ContentPack, OutputQuestion, Question } from '@/engine/types'

/**
 * Страховка от потери контента: счётчики, форма контента и 198 тестов
 * эталонных решений. Пак «Собеседование» держит паритет со старым HTML-файлом;
 * пак «Аудит» с тех пор вырос — добавлены статьи баланса, проводки и смежные темы.
 */

/** Обновляется осознанно вместе с добавлением контента. */
const EXPECTED = {
  interview: { questions: 193, theory: 43, demos: 44, cards: 67 },
  audit: { questions: 111, theory: 52, demos: 60, tools: 46, cards: 139, plan: 0, examQuestions: 32, examTheory: 11, examCards: 40 },
} as const

const packById = (id: string) => PACKS.find((p) => p.id === id) as ContentPack

const strip = (html: string) =>
  html.replace(/<pre[\s\S]*?<\/pre>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

describe('счётчики совпадают с исходными файлами', () => {
  it('interview', () => {
    const p = packById('interview')
    expect(p.questions).toHaveLength(EXPECTED.interview.questions)
    expect(p.theory).toHaveLength(EXPECTED.interview.theory)
    expect(Object.keys(p.demos)).toHaveLength(EXPECTED.interview.demos)
    expect(p.cards).toHaveLength(EXPECTED.interview.cards)
  })

  it('audit', () => {
    const p = packById('audit')
    expect(p.questions).toHaveLength(EXPECTED.audit.questions)
    expect(p.theory).toHaveLength(EXPECTED.audit.theory)
    expect(Object.keys(p.demos)).toHaveLength(EXPECTED.audit.demos)
    expect(p.tools).toHaveLength(EXPECTED.audit.tools)
    expect(p.cards).toHaveLength(EXPECTED.audit.cards)
    expect(p.plan ?? []).toHaveLength(EXPECTED.audit.plan)
    expect(p.examPrep?.questions).toHaveLength(EXPECTED.audit.examQuestions)
    expect(p.examPrep?.theory).toHaveLength(EXPECTED.audit.examTheory)
    expect(p.examPrep?.cards).toHaveLength(EXPECTED.audit.examCards)
  })
})

describe.each(PACKS)('пак $id', (pack) => {
  it('идентификаторы уникальны', () => {
    const ids = [...pack.questions.map((q) => q.id), ...pack.theory.map((t) => t.id)]
    const dupes = ids.filter((x, i) => ids.indexOf(x) !== i)
    expect(dupes).toEqual([])
  })

  it('у каждого вопроса есть непустой разбор', () => {
    const thin = pack.questions.filter((q) => strip(q.answer).length < 200)
    expect(thin.map((q) => q.id)).toEqual([])
  })

  it('обязательные поля заполнены по типу вопроса', () => {
    const broken: string[] = []
    for (const q of pack.questions) {
      const miss = (cond: boolean, what: string) => { if (!cond) broken.push(`${q.id}: ${what}`) }
      miss(Boolean(q.q), 'нет текста вопроса')
      switch (q.type) {
        case 'code':
          miss(Boolean(q.solution), 'нет решения')
          miss(q.exports.length > 0, 'нет exports')
          miss(q.tests.length > 0, 'нет тестов')
          break
        case 'manual': miss(Boolean(q.solution), 'нет эталона'); break
        case 'output': miss(Boolean(q.expected), 'нет ожидаемого вывода'); break
        case 'choice':
          miss(q.options.length > 1, 'меньше двух вариантов')
          miss(q.options.some((o) => o.ok), 'нет верного варианта')
          break
        case 'num': miss(Number.isFinite(q.expect), 'нет числового ответа'); break
        case 'theory': break
      }
    }
    expect(broken).toEqual([])
  })

  it('каждое упомянутое демо зарегистрировано', () => {
    const referenced = new Set<string>()
    const scan = (html: string) => {
      for (const m of html.matchAll(/data-demo="([^"]+)"/g)) referenced.add(m[1] as string)
    }
    pack.theory.forEach((t) => scan(t.body))
    pack.questions.forEach((q) => scan(q.answer))
    pack.tools?.forEach((t) => referenced.add(t.demo))

    const missing = [...referenced].filter((name) => !(name in pack.demos))
    expect(missing).toEqual([])
  })

  it('у каждой статьи есть заголовок, лид и тело', () => {
    const broken = pack.theory.filter((t) => !t.title || !t.lead || strip(t.body).length < 300)
    expect(broken.map((t) => t.id)).toEqual([])
  })
})

/* ---------- эталонные решения действительно проходят свои тесты ---------- */

const codeQuestions = PACKS.flatMap((p) => p.questions).filter(
  (q): q is CodeQuestion => q.type === 'code',
)

/**
 * Тела тестов ссылаются на ассерты как на свободные имена — так они переживают
 * минификацию и доезжают до воркера в рабочем виде. Здесь подкладываем их в
 * глобальную область, чтобы те же тесты можно было прогнать в Node.
 */
beforeAll(() => {
  Object.assign(globalThis, assert)
})

describe('эталонные решения проходят тесты', () => {
  it.each(codeQuestions.map((q) => [q.id, q] as const))('%s', async (_id, q) => {
    const factory = new Function('"use strict";\n' + q.solution + '\n;return {' + q.exports.join(',') + '};')
    const mod = factory() as Record<string, unknown>
    for (const name of q.exports) expect(mod[name], `экспорт ${name}`).toBeDefined()
    for (const t of q.tests) await t.fn(mod)
  })

  it('всего тестов столько же, сколько было', () => {
    const total = codeQuestions.reduce((sum, q) => sum + q.tests.length, 0)
    expect(total).toBe(198)
  })
})

/* ---------- вопросы на предсказание вывода реально печатают заявленное ---------- */

const outputQuestions = PACKS.flatMap((p) => p.questions).filter(
  (q): q is OutputQuestion & { code: string } => q.type === 'output' && Boolean(q.code),
)

const norm = (s: string) =>
  s.replace(/['"`]/g, '').replace(/[[\]{},]/g, ' ')
    .split('\n').map((l) => l.trim().replace(/\s+/g, ' ')).filter(Boolean).join('\n').toLowerCase()

describe('вопросы на вывод: код печатает то, что заявлено', () => {
  it.each(outputQuestions.map((q) => [q.id, q] as const))('%s', async (_id, q) => {
    const lines: string[] = []
    const fakeLog = (...args: unknown[]) =>
      lines.push(args.map((v) =>
        typeof v === 'string' ? v
          : Array.isArray(v) ? '[ ' + v.map((x) => `'${String(x)}'`).join(', ') + ' ]'
          : String(v)).join(' '))

    const run = new Function('console', `return (async () => {${q.code}\n})()`)
    await run({ log: fakeLog })
    await new Promise((r) => setTimeout(r, 120))

    expect(norm(lines.join('\n'))).toBe(norm(q.expected))
  })
})

/* ---------- контент не содержит поломанной разметки ---------- */

describe('разметка', () => {
  it('нет незакрытых code-блоков в статьях', () => {
    const broken = PACKS.flatMap((p) => p.theory).filter((t) => {
      const open = (t.body.match(/<pre/g) ?? []).length
      const close = (t.body.match(/<\/pre>/g) ?? []).length
      return open !== close
    })
    expect(broken.map((t) => t.id)).toEqual([])
  })
})

export type { Question }
