/**
 * Предлагает связи «пункт плана → контент». Запускается один раз при
 * авторской разметке: результат проверяется глазами и вписывается в plan.ts
 * явным полем link. В рантайме никакого угадывания нет.
 *
 *   node scripts/check-plan-links.mjs
 */
import { readFileSync } from 'node:fs'

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8')
const grab = (src, re) => [...src.matchAll(re)].map((m) => m[1])

const planSrc = read('../src/content/audit/plan.ts')
const toolsSrc = read('../src/content/audit/tools.ts')

const theoryFiles = grab(read('../src/content/audit/theory/index.ts'), /from '\.\/([^']+)'/g)
const articles = theoryFiles.map((f) => {
  const src = read(`../src/content/audit/theory/${f}.ts`)
  return {
    id: src.match(/id:\s*'([^']+)'/)?.[1],
    title: src.match(/title:\s*'([^']+)'/)?.[1] ?? '',
    topic: src.match(/topic:\s*'([^']+)'/)?.[1] ?? '',
    demos: [...src.matchAll(/data-demo="([^"]+)"/g)].map((m) => m[1]),
  }
})

const tools = [...toolsSrc.matchAll(/\{\s*id:\s*'([^']+)'[\s\S]*?t:\s*'([^']+)'[\s\S]*?demo:\s*'([^']+)'/g)]
  .map((m) => ({ id: m[1], title: m[2], demo: m[3] }))

/** Слова длиннее трёх букв — по ним считаем пересечение. */
const words = (s) => new Set(
  s.toLowerCase().replace(/ё/g, 'е').replace(/[^а-яa-z0-9/ ]/g, ' ')
    .split(/\s+/).filter((w) => w.length > 3),
)

const overlap = (a, b) => {
  const wa = words(a)
  const wb = words(b)
  if (!wa.size || !wb.size) return 0
  let hit = 0
  for (const w of wa) if (wb.has(w)) hit++
  return hit / Math.min(wa.size, wb.size)
}

const best = (needle, list, key) => {
  let top = null
  for (const item of list) {
    const score = overlap(needle, item[key])
    if (!top || score > top.score) top = { item, score }
  }
  return top
}

const items = []
for (const week of planSrc.matchAll(/\{\s*n:\s*(\d+)[\s\S]*?items:\s*\[([\s\S]*?)\]\s*\}/g)) {
  const n = Number(week[1])
  for (const it of week[2].matchAll(/\{\s*t:\s*'((?:[^'\\]|\\.)*)'/g)) {
    items.push({ week: n, text: it[1] })
  }
}

const PRACTICE = /^Практика|^Прогнать|^Выбрать|^Составить|^Написать/

console.log(`пунктов ${items.length}, статей ${articles.length}, инструментов ${tools.length}\n`)

for (const { week, text } of items) {
  const quoted = text.match(/«([^»]+)»/)?.[1]
  const probe = quoted ?? text.replace(/^(Стать[яи]|Демо|Упражнени[ея]|Тренажёр|Вопросы темы|Вопросы)\s*/i, '')

  if (PRACTICE.test(text)) {
    console.log(`н${week} —          ${text.slice(0, 66)}`)
    continue
  }

  let line = null
  if (/^Вопросы/i.test(text)) {
    line = `вопросы, тема «${quoted ?? probe}»`
  } else if (/^Стать/i.test(text)) {
    const hit = best(probe, articles, 'title')
    if (hit?.score >= 0.45) line = `theory:${hit.item.id}  [${hit.score.toFixed(2)}] ${hit.item.title.slice(0, 40)}`
  } else {
    // демо и упражнения: сначала практикум, потом статья, в которой это демо живёт
    const tool = best(probe, tools, 'title')
    if (tool?.score >= 0.45) {
      line = `tool:${tool.item.id}  [${tool.score.toFixed(2)}] ${tool.item.title.slice(0, 40)}`
    } else {
      const art = best(probe, articles, 'title')
      if (art?.score >= 0.45) line = `theory:${art.item.id}  [${art.score.toFixed(2)}] ${art.item.title.slice(0, 40)}`
    }
  }

  console.log(`н${week} ${line ? '→ ' + line : '??? '}  ${!line ? text.slice(0, 60) : ''}`)
}
