/**
 * Проставляет в plan.ts поле link у пунктов, которые ссылаются на контент.
 * Сопоставление делается здесь, один раз, и записывается в данные явно —
 * в рантайме приложение ничего не угадывает.
 *
 *   node scripts/link-plan.mjs --dry   только показать, что получится
 *   node scripts/link-plan.mjs         записать в src/content/audit/plan.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'

const url = (p) => new URL(p, import.meta.url)
const read = (p) => readFileSync(url(p), 'utf8')
const DRY = process.argv.includes('--dry')

const planPath = url('../src/content/audit/plan.ts')
const planSrc = read('../src/content/audit/plan.ts')

const theoryFiles = [...read('../src/content/audit/theory/index.ts').matchAll(/from '\.\/([^']+)'/g)].map((m) => m[1])
const articles = theoryFiles.map((f) => {
  const src = read(`../src/content/audit/theory/${f}.ts`)
  return {
    id: src.match(/id:\s*'([^']+)'/)?.[1],
    title: src.match(/title:\s*'([^']+)'/)?.[1] ?? '',
    topic: src.match(/topic:\s*'([^']+)'/)?.[1] ?? '',
    demos: [...src.matchAll(/data-demo="([^"]+)"/g)].map((m) => m[1]),
  }
})

const tools = [...read('../src/content/audit/tools.ts')
  .matchAll(/\{\s*id:\s*'([^']+)'[\s\S]*?t:\s*'([^']+)'[\s\S]*?demo:\s*'([^']+)'/g)]
  .map((m) => ({ id: m[1], title: m[2], demo: m[3] }))

const words = (s) => new Set(
  s.toLowerCase().replace(/ё/g, 'е').replace(/[^а-яa-z0-9/ ]/g, ' ')
    .split(/\s+/).filter((w) => w.length > 3),
)
const overlap = (a, b) => {
  const wa = words(a); const wb = words(b)
  if (!wa.size || !wb.size) return 0
  let hit = 0
  for (const w of wa) if (wb.has(w)) hit++
  return hit / Math.min(wa.size, wb.size)
}
const best = (needle, list, key) => list
  .map((item) => ({ item, score: overlap(needle, item[key]) }))
  .sort((a, b) => b.score - a.score)[0]

/**
 * Ручные решения там, где нечёткое сопоставление ошибается или пункт
 * ссылается сразу на несколько материалов. Проверено глазами: неверная
 * ссылка хуже её отсутствия — человек уйдёт не в тот материал.
 */
const MANUAL = {
  'Упражнение «Капитализировать или списать»': { demo: 'capex-vs-opex' },
  'Статьи по балансу, ОФР и ОДДС': { mode: 'theory', topic: 'Отчётность' },
  'Статьи по участкам: денежные средства, выручка и дебиторка, запасы, ОС, кредиторка и ФОТ':
    { mode: 'theory', topic: 'Участки' },
  // ниже — там, где слово «Калькулятор» или «Тест» тянуло не на тот инструмент
  'Демо «Калькулятор НДС»': { tool: 'tl-vat' },
  'Демо «Тест cut-off», «Матрица старения», «Сверка с контрагентом»': { tool: 'tl-cut' },
  'Демо «ФИФО против средней» и «Тест на обесценение запасов»': { tool: 'tl-inv' },
  'Демо «Объём выборки» и «Отбор элементов по денежной единице»': { tool: 'tl-smp' },
  'Демо «Коэффициенты и DuPont», «Flux-анализ»': { tool: 'tl-rat' },
  'Статья «МСФО против РСБУ» и демо «IFRS 15»': { mode: 'theory', id: 'ifrs-diff' },
  'Упражнения «Надёжность доказательства» и «Направление тестирования»': { demo: 'evidence-rank' },
  'Упражнения «События после отчётной даты» и «КАМ»': { demo: 'subsequent' },
  'Упражнение «Процедура → предпосылка»': { demo: 'assertions' },
  'Упражнение «Инвентаризация: правильное действие аудитора»': { demo: 'stock-count' },
  'Демо «Год аудитора по фазам»': { demo: 'audit-cycle' },
  'Демо «Walkthrough закупки»': { demo: 'p2p-walk' },
  'Прогнать все вопросы в режиме «Проверка»': { mode: 'questions' },
  'Прогнать практикум по существенности, выборке и ПБУ 18/02 на данных своего клиента':
    { mode: 'tools' },
}

const PRACTICE = /^Практика|^Выбрать|^Составить/

/** Статья, внутри которой живёт это демо. */
const articleWithDemo = (demo) => articles.find((a) => a.demos.includes(demo))
const toolWithDemo = (demo) => tools.find((t) => t.demo === demo)

function resolve(text) {
  const manual = MANUAL[text]
  if (manual) {
    if (manual.tool) return { mode: 'tools', id: manual.tool }
    if (manual.mode) return { mode: manual.mode, id: manual.id, topic: manual.topic }
    const tool = toolWithDemo(manual.demo)
    if (tool) return { mode: 'tools', id: tool.id }
    const art = articleWithDemo(manual.demo)
    if (art) return { mode: 'theory', id: art.id }
    return null
  }

  if (PRACTICE.test(text)) return null

  const quoted = text.match(/«([^»]+)»/)?.[1]
  const probe = quoted ?? text.replace(/^(Стать[яи]|Демо|Упражнени[ея]|Тренажёр|Вопросы темы|Вопросы)\s*/i, '')

  if (/^Вопросы/i.test(text)) {
    return quoted ? { mode: 'questions', topic: quoted } : { mode: 'questions' }
  }
  if (/^Стать/i.test(text)) {
    const hit = best(probe, articles, 'title')
    return hit && hit.score >= 0.6 ? { mode: 'theory', id: hit.item.id } : null
  }
  const tool = best(probe, tools, 'title')
  if (tool && tool.score >= 0.5) return { mode: 'tools', id: tool.item.id }
  const art = best(probe, articles, 'title')
  return art && art.score >= 0.6 ? { mode: 'theory', id: art.item.id } : null
}

const fmtLink = (l) => {
  const parts = [`mode:'${l.mode}'`]
  if (l.id) parts.push(`id:'${l.id}'`)
  if (l.topic) parts.push(`topic:'${l.topic}'`)
  return `, link:{ ${parts.join(', ')} }`
}

let linked = 0
let skipped = 0
const report = []

// переписываем каждый объект пункта, добавляя link перед закрывающей скобкой
const out = planSrc.replace(
  /\{ t:'((?:[^'\\]|\\.)*)', s:'((?:[^'\\]|\\.)*)'(, link:\{[^}]*\})? \}/g,
  (whole, t, s) => {
    const link = resolve(t)
    if (!link) { skipped++; report.push(['—', t]); return `{ t:'${t}', s:'${s}' }` }
    linked++
    report.push([`${link.mode}${link.id ? ':' + link.id : ''}${link.topic ? ' «' + link.topic + '»' : ''}`, t])
    return `{ t:'${t}', s:'${s}'${fmtLink(link)} }`
  },
)

for (const [target, text] of report) {
  console.log(`  ${String(target).padEnd(26)} ${text.slice(0, 62)}`)
}
console.log(`\nсо ссылкой: ${linked}, без ссылки (практика): ${skipped}`)

if (!DRY) {
  writeFileSync(planPath, out, 'utf8')
  console.log('plan.ts обновлён')
} else {
  console.log('сухой прогон — файл не тронут')
}
