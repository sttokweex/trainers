/**
 * Разовый перенос контента из старых самодостаточных HTML-тренажёров
 * в типизированные TS-модули.
 *
 *   node scripts/extract.mjs --check   только анализ, ничего не пишет
 *   node scripts/extract.mjs           анализ + запись в src/content и src/demos
 *
 * Блоки Q({...}) / T({...}) / D('name', fn) вырезаются парсером с балансировкой
 * скобок, который корректно пропускает строки и шаблонные литералы.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const LEGACY = path.resolve(ROOT, '..')

const PACKS = [
  { id: 'interview', file: 'interview-trainer.html' },
  { id: 'audit', file: 'audit-trainer.html' },
]

/** Хелперы, доступные внутри тестов — всё остальное считаем подозрительным. */
const TEST_GLOBALS = new Set([
  'ok', 'eq', 'deepEq', 'throwsAsync', 'sleep', 'J', 'dEq',
  'Math', 'Object', 'Array', 'JSON', 'Date', 'Map', 'Set', 'WeakMap', 'Promise',
  'Number', 'String', 'Boolean', 'Symbol', 'BigInt', 'RegExp', 'Error', 'TypeError',
  'NaN', 'Infinity', 'undefined', 'null', 'true', 'false', 'console',
  'setTimeout', 'clearTimeout', 'Reflect', 'isNaN', 'parseInt', 'parseFloat',
])

/** Хелперы, доступные внутри демо. */
const DEMO_GLOBALS = new Set([
  'dEl', 'dBtn', 'dShell', 'document', 'window', 'requestAnimationFrame',
  'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'btoa', 'atob',
  'Math', 'Object', 'Array', 'JSON', 'Date', 'Map', 'Set', 'Promise', 'Number',
  'String', 'Boolean', 'RegExp', 'Error', 'NaN', 'Infinity', 'undefined',
  'console', 'navigator', 'isNaN', 'parseInt', 'parseFloat',
])

const REGEX_START = /[=(,:[!&|?{};+\-*%~^<>]|^$/

/** Вырезает аргументы вызова `ident(...)` с учётом строк и вложенных скобок. */
function extractCalls(src, ident) {
  const out = []
  const re = new RegExp('(^|[\\s;{])' + ident + '\\(', 'g')
  let m
  while ((m = re.exec(src))) {
    const open = m.index + m[0].length - 1
    let i = open
    let depth = 0
    let inStr = null
    let inRe = false
    let inClass = false
    let esc = false
    let prev = ''
    for (; i < src.length; i++) {
      const c = src[i]
      if (esc) { esc = false; continue }
      if (c === '\\') { esc = true; continue }
      if (inStr) { if (c === inStr) inStr = null; continue }
      if (inRe) {
        // внутри регулярки скобки не считаем; [...] может содержать /
        if (c === '[') inClass = true
        else if (c === ']') inClass = false
        else if (c === '/' && !inClass) inRe = false
        continue
      }
      if (c === '"' || c === "'" || c === '`') { inStr = c; continue }
      if (c === '/' && src[i + 1] === '/') {          // строчный комментарий
        i = src.indexOf('\n', i)
        if (i === -1) i = src.length
        continue
      }
      if (c === '/' && src[i + 1] === '*') {          // блочный комментарий
        const close = src.indexOf('*/', i + 2)
        i = close === -1 ? src.length : close + 1     // +1, дальше цикл добавит ещё
        continue
      }
      if (c === '/') {
        // регулярка начинается там, где не может стоять операнд деления
        if (REGEX_START.test(prev)) { inRe = true; continue }
      }
      if (c === '(' || c === '{' || c === '[') depth++
      else if (c === ')' || c === '}' || c === ']') {
        depth--
        if (depth === 0) break
      }
      if (!/\s/.test(c)) prev = c
    }
    out.push(src.slice(open + 1, i))
    re.lastIndex = i
  }
  return out
}

/** Грубый разбор свободных идентификаторов: убираем строки, комментарии, ключи и свойства. */
function freeIdentifiers(code) {
  const stripped = code
    .replace(/`(?:\\[\s\S]|[^\\`])*`/g, '""')
    .replace(/'(?:\\[\s\S]|[^\\'])*'/g, '""')
    .replace(/"(?:\\[\s\S]|[^\\"])*"/g, '""')
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\.\s*[A-Za-z_$][\w$]*/g, '')      // обращения к свойствам
    .replace(/[A-Za-z_$][\w$]*\s*:/g, '')        // ключи объектов и метки

  const declared = new Set()
  for (const d of stripped.matchAll(/\b(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g)) declared.add(d[1])
  for (const d of stripped.matchAll(/\bfunction\s*[A-Za-z_$\w]*\s*\(([^)]*)\)/g)) {
    for (const p of d[1].split(',')) {
      const n = p.trim().replace(/[.\s=].*$/, '').replace(/[[\]{}]/g, '')
      if (n) declared.add(n)
    }
  }
  for (const d of stripped.matchAll(/\(?\s*([A-Za-z_$][\w$]*)\s*\)?\s*=>/g)) declared.add(d[1])
  for (const d of stripped.matchAll(/\(([^)]*)\)\s*=>/g)) {
    for (const p of d[1].split(',')) {
      const n = p.trim().replace(/[.\s=].*$/, '').replace(/[[\]{}]/g, '')
      if (n) declared.add(n)
    }
  }
  for (const d of stripped.matchAll(/(?:const|let|var)\s*[[{]([^\]}]*)[\]}]/g)) {
    for (const p of d[1].split(',')) {
      const n = p.trim().replace(/[:\s=].*$/, '')
      if (n) declared.add(n)
    }
  }
  for (const d of stripped.matchAll(/\bfor\s*\(\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)) declared.add(d[1])
  for (const d of stripped.matchAll(/\bcatch\s*\(\s*([A-Za-z_$][\w$]*)/g)) declared.add(d[1])

  const KEYWORDS = new Set([
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'of', 'in', 'while',
    'do', 'switch', 'case', 'default', 'break', 'continue', 'new', 'typeof', 'instanceof',
    'this', 'null', 'true', 'false', 'undefined', 'async', 'await', 'try', 'catch', 'finally',
    'throw', 'class', 'extends', 'super', 'delete', 'void', 'yield', 'static', 'get', 'set',
  ])
  const used = new Set()
  for (const t of stripped.matchAll(/\b([A-Za-z_$][\w$]*)\b/g)) {
    const n = t[1]
    if (!KEYWORDS.has(n) && !declared.has(n)) used.add(n)
  }
  return used
}

const field = (block, name) => {
  const m = block.match(new RegExp("\\b" + name + ":\\s*'([^']*)'"))
  return m ? m[1] : null
}

const slug = (s) =>
  s.toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .replace(/[а-яё]/g, (c) => 'a-b-v-g-d-e-e-zh-z-i-y-k-l-m-n-o-p-r-s-t-u-f-h-c-ch-sh-sch---y--e-yu-ya'
      .split('-')['абвгдеёжзийклмнопрстуфхцчшщъыьэюя'.indexOf(c)] ?? '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'misc'

const camel = (s) => s.replace(/[-_](\w)/g, (_, c) => c.toUpperCase()).replace(/^(\w)/, (_, c) => c.toLowerCase())

const write = (rel, content) => {
  const abs = path.join(ROOT, rel)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, content, 'utf8')
}

/** Вырезает кусок исходника между двумя маркерами-комментариями. */
function region(src, from, to) {
  const a = src.indexOf(from)
  if (a === -1) throw new Error('не найден маркер: ' + from)
  const b = to ? src.indexOf(to, a + from.length) : src.length
  if (b === -1) throw new Error('не найден маркер: ' + to)
  return src.slice(a + from.length, b)
    .replace(/<\/script>\s*<script>/g, '')
    .trim()
}

/**
 * Общий слой, на который опираются демо audit-пака: форматирование чисел,
 * DOM-хелперы, SVG-графики и конструкторы упражнений. В старом файле это
 * ~450 строк между баннерами-комментариями; переносим механически.
 */
const SHARED_REGIONS = [
  {
    out: 'format.ts',
    doc: 'Форматирование чисел под финансовые данные: неразрывный пробел в разрядах, запятая как десятичный разделитель.',
    from: '/* ============ ФОРМАТ ЧИСЕЛ ============ */',
    to: '/* ============ DOM-ПОМОЩНИКИ ============ */',
  },
  {
    out: 'dom.ts',
    doc: 'Императивные DOM-хелперы, которыми пользуются все перенесённые демо.',
    from: '/* ============ DOM-ПОМОЩНИКИ ============ */',
    to: '/* ============ ДВИЖОК ДЕМО ============ */',
    imports: [`import { fmt, money, num, pct } from './format'`],
  },
  {
    out: 'charts.ts',
    doc: 'Самописный SVG-движок графиков на провалидированной для тёмной темы палитре --s1..--s4.',
    from: '/* ============ ГРАФИКИ (SVG)',
    to: '/* ==================== БУХУЧЁТ: БАЗА ==================== */',
    /** у этого баннера многострочная шапка — отрезаем её остаток */
    trimLeadingComment: true,
    imports: [`import { dEl } from './dom'`, `import { fmt } from './format'`],
  },
  {
    out: 'builders.ts',
    doc: 'Конструкторы упражнений: сортировка по корзинам, сопоставление пар, пошаговый разбор, дерево решений.',
    from: '/* ==================== УНИВЕРСАЛЬНЫЕ КОНСТРУКТОРЫ УПРАЖНЕНИЙ ==================== */',
    to: '/* ==================== КЛАССИФИКАЦИИ И СОПОСТАВЛЕНИЯ ==================== */',
    imports: [`import { dEl, dBtn, dShell } from './dom'`],
  },
  {
    out: 'accounts.ts',
    doc: 'План счетов, на который опираются тренажёры проводок.',
    from: '/* ==================== ПЛАН СЧЕТОВ ДЛЯ ТРЕНАЖЁРОВ ==================== */',
    to: '/* ---------- Т-счета и уравнение баланса ---------- */',
  },
  {
    out: 'calc.ts',
    doc: 'Каркас калькулятора и живой пересчёт по любому изменению поля.',
    from: '/* ==================== КАЛЬКУЛЯТОРЫ ==================== */',
    to: '/* ---------- Существенность ---------- */',
    imports: [`import { dEl, dShell } from './dom'`],
  },
]

/**
 * ВНИМАНИЕ: скрипт пишет только сгенерированные файлы (questions/, theory/,
 * demos/, helpers/, tools/cards/plan). Файлы `src/content/<pack>/index.ts` и
 * `src/content/index.ts` написаны руками — не удаляйте их при повторном прогоне.
 */
const CHECK_ONLY = process.argv.includes('--check')
let problems = 0
const summary = []

for (const pack of PACKS) {
  const file = path.join(LEGACY, pack.file)
  if (!fs.existsSync(file)) { console.log('пропуск, нет файла:', pack.file); continue }
  const html = fs.readFileSync(file, 'utf8')

  const questions = extractCalls(html, 'Q')
  const theory = extractCalls(html, 'T')
  const demosRaw = extractCalls(html, 'D')

  // ---- проверка: валидность и свободные идентификаторы ----
  for (const q of questions) {
    try { new Function('return (' + q + ')') }
    catch (e) { problems++; console.log('✗ невалидный вопрос', field(q, 'id'), e.message.slice(0, 60)) }

    for (const t of extractCalls('fn:' + q, 'fn')) { /* placeholder, см. ниже */ }
  }

  // тесты разбираем отдельно: ищем `fn:` внутри блока tests
  let testCount = 0
  const suspicious = new Map()
  for (const q of questions) {
    const tm = q.match(/tests:\s*\[([\s\S]*?)\n\s*\],/)
    if (!tm) continue
    for (const fnBody of tm[1].matchAll(/fn:\s*(async\s*)?(\w+|\([^)]*\))\s*=>\s*\{([\s\S]*?)\}\s*\}/g)) {
      testCount++
      const param = fnBody[2].replace(/[()]/g, '').trim()
      for (const id of freeIdentifiers(fnBody[3])) {
        if (id === param || TEST_GLOBALS.has(id)) continue
        suspicious.set(id, (suspicious.get(id) ?? 0) + 1)
      }
    }
  }

  const demoFree = new Map()
  for (const d of demosRaw) {
    const name = d.match(/^\s*'([^']+)'/)?.[1]
    const body = d.slice(d.indexOf(',') + 1)
    for (const id of freeIdentifiers(body)) {
      if (DEMO_GLOBALS.has(id) || id === 'root') continue
      demoFree.set(id, (demoFree.get(id) ?? 0) + 1)
    }
    if (!name) { problems++; console.log('✗ демо без имени') }
  }

  summary.push({
    pack: pack.id,
    questions: questions.length,
    theory: theory.length,
    demos: demosRaw.length,
    tests: testCount,
    suspiciousInTests: [...suspicious.entries()],
    freeInDemos: [...demoFree.entries()],
  })

  if (CHECK_ONLY) continue

  // ---- запись вопросов, сгруппированных по теме ----
  const byTopic = new Map()
  for (const q of questions) {
    const topic = field(q, 'topic') ?? 'misc'
    if (!byTopic.has(topic)) byTopic.set(topic, [])
    byTopic.get(topic).push(q)
  }
  const qFiles = []
  for (const [topic, list] of byTopic) {
    const name = slug(topic)
    const varName = camel(name) + 'Questions'
    qFiles.push({ name, varName, count: list.length })
    write(
      `src/content/${pack.id}/questions/${name}.ts`,
      // Тела тестов — портированный JS: строят объекты динамически, расширяют
      // прототипы, создают пустые Map. Для tsc это шум, поэтому такие файлы
      // выводятся из-под проверки, а форму контента валидирует content.test.ts.
      // Ассерты НЕ импортируем намеренно: тесты уезжают в воркер через
      // fn.toString(), а бандлер переименовал бы импортированные имена —
      // воркер получил бы код со ссылками на несуществующие идентификаторы.
      // Свободные имена минификатор не трогает, и воркер подставляет их сам.
      (list.some((q) => /\btests:/.test(q))
        ? `/* eslint-disable */\n// @ts-nocheck — тела тестов портированы из JS; ассерты приходят из окружения воркера\n`
        : '') +
      `import type { Question } from '@/engine/types'\n\n` +
      `/** ${topic} — ${list.length} вопрос(ов) */\n` +
      `export const ${varName}: Question[] = [\n` +
      list.map((q) => q.trim().replace(/^/gm, '  ')).join(',\n') +
      `,\n]\n`,
    )
  }
  write(
    `src/content/${pack.id}/questions/index.ts`,
    qFiles.map((f) => `import { ${f.varName} } from './${f.name}'`).join('\n') +
    `\nimport type { Question } from '@/engine/types'\n\n` +
    `export const questions: Question[] = [\n` +
    qFiles.map((f) => `  ...${f.varName},`).join('\n') +
    `\n]\n`,
  )

  // ---- запись теории: по файлу на статью ----
  const tFiles = []
  for (const t of theory) {
    const id = field(t, 'id') ?? 'article'
    const varName = camel(id.replace(/^th-/, '')) || 'article'
    tFiles.push({ id, varName })
    write(
      `src/content/${pack.id}/theory/${id}.ts`,
      `import type { TheoryArticle } from '@/engine/types'\n\n` +
      `export const ${varName}: TheoryArticle = ${t.trim()}\n`,
    )
  }
  write(
    `src/content/${pack.id}/theory/index.ts`,
    tFiles.map((f) => `import { ${f.varName} } from './${f.id}'`).join('\n') +
    `\nimport type { TheoryArticle } from '@/engine/types'\n\n` +
    `export const theory: TheoryArticle[] = [\n` +
    tFiles.map((f) => `  ${f.varName},`).join('\n') +
    `\n]\n`,
  )

  // ---- запись демо как legacy-функций монтирования ----
  const dFiles = []
  for (const d of demosRaw) {
    const name = d.match(/^\s*'([^']+)'/)?.[1]
    if (!name) continue
    const fn = d.slice(d.indexOf(',') + 1).trim()
    const varName = camel(name)
    dFiles.push({ name, varName })
    write(
      `src/demos/${pack.id}/${name}.ts`,
      `/* eslint-disable */\n` +
      `// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React\n` +
      `import type { LegacyDemo } from '@/engine/types'\n` +
      `import * as H from '@/demos/helpers'\n` +
      `const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,\n` +
      `        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,\n` +
      `        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any\n\n` +
      `export const ${varName}: LegacyDemo = ${fn}\n`,
    )
  }
  write(
    `src/demos/${pack.id}/index.ts`,
    dFiles.map((f) => `import { ${f.varName} } from './${f.name}'`).join('\n') +
    `\nimport type { LegacyDemo } from '@/engine/types'\n\n` +
    `export const demos: Record<string, LegacyDemo> = {\n` +
    dFiles.map((f) => `  '${f.name}': ${f.varName},`).join('\n') +
    `\n}\n`,
  )
}

// ---- общий слой хелперов (живёт в audit-trainer, нужен обоим пакам) ----
if (!CHECK_ONLY) {
  const src = fs.readFileSync(path.join(LEGACY, 'audit-trainer.html'), 'utf8')
  const exported = []
  for (const r of SHARED_REGIONS) {
    let code = region(src, r.from, r.to)
    if (r.trimLeadingComment) code = code.replace(/^[\s\S]*?\*\//, '').trim()

    const names = [
      ...code.matchAll(/^(?:function\s+([A-Za-z_$][\w$]*)|const\s+([A-Za-z_$][\w$]*)\s*=)/gm),
    ].map((m) => m[1] ?? m[2]).filter(Boolean)

    write(
      `src/demos/helpers/${r.out}`,
      `/* eslint-disable */\n` +
      `// @ts-nocheck — перенесено из старого тренажёра как есть, типизируется по мере переписывания\n` +
      `/** ${r.doc} */\n` +
      (r.imports ? r.imports.join('\n') + '\n\n' : '\n') +
      code + '\n\n' +
      `export { ${names.join(', ')} }\n`,
    )
    exported.push({ file: r.out.replace(/\.ts$/, ''), names })
  }
  write(
    'src/demos/helpers/index.ts',
    exported.map((e) => `export * from './${e.file}'`).join('\n') + '\n',
  )
  console.log('общий слой:', exported.map((e) => `${e.file}(${e.names.length})`).join(', '))

  // ---- дополнительные реестры audit-пака ----
  const tools = extractCalls(src, 'TOOL')
  const cards = extractCalls(src, 'C')
  const plan = extractCalls(src, 'W')

  write(
    'src/content/audit/tools.ts',
    `import type { Tool } from '@/engine/types'\n\n` +
    `export const tools: Tool[] = [\n${tools.map((t) => '  ' + t.trim()).join(',\n')},\n]\n`,
  )
  write(
    'src/content/audit/cards.ts',
    `import type { Card } from '@/engine/types'\n\n` +
    `const C = (term: string, en: string, def: string, topic: string): Card => ({ term, en, def, topic })\n\n` +
    `export const cards: Card[] = [\n${cards.map((c) => `  C(${c.trim()})`).join(',\n')},\n]\n`,
  )
  write(
    'src/content/audit/plan.ts',
    `import type { PlanWeek } from '@/engine/types'\n\n` +
    `export const plan: PlanWeek[] = [\n${plan.map((w) => '  ' + w.trim()).join(',\n')},\n]\n`,
  )
  console.log('реестры audit: tools', tools.length, '| cards', cards.length, '| plan', plan.length)
}

console.log('\n=== ОТЧЁТ ===')
for (const s of summary) {
  console.log(`\n${s.pack}: вопросов ${s.questions}, статей ${s.theory}, демо ${s.demos}, тестов ${s.tests}`)
  console.log('  свободные идентификаторы в тестах:',
    s.suspiciousInTests.length ? s.suspiciousInTests.map(([k, v]) => `${k}×${v}`).join(', ') : 'нет — можно сериализовать через toString()')
  console.log('  свободные идентификаторы в демо:',
    s.freeInDemos.length ? s.freeInDemos.map(([k, v]) => `${k}×${v}`).join(', ') : 'нет')
}
console.log('\nпроблем:', problems)
console.log(CHECK_ONLY ? 'режим проверки — файлы не записаны' : 'файлы записаны')
