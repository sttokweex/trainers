import { ACC_KEYS, accLabel, dBtn, dEl, dShell, fmt } from '@/demos/helpers'
import type { LegacyDemo } from '@/engine/types'

interface Task {
  tag: string
  t: string
  d: string
  k: string
  why: string
}

/** Двадцать операций подряд: от выручки до реформации баланса. */
export const entryMarathon: LegacyDemo = (root) => {
  const TASKS: Task[] = [
    { tag:'Деньги', t:'Поступила оплата от покупателя на расчётный счёт — 900 000 ₽', d:'51', k:'62',
      why:'деньги ↑ (дебет), долг покупателя ↓ (кредит). Валюта баланса не меняется: актив перетёк в актив.' },
    { tag:'Деньги', t:'Сняли наличные с расчётного счёта в кассу — 50 000 ₽', d:'50', k:'51',
      why:'касса ↑, расчётный счёт ↓. Оба счёта активные, тип операции А+А−.' },
    { tag:'Закупки', t:'Поступил товар от поставщика, стоимость без НДС — 500 000 ₽', d:'41', k:'60',
      why:'товары ↑ (дебет), обязательство перед поставщиком ↑ (кредит).' },
    { tag:'Закупки', t:'Выделен входной НДС по поступившему товару — 100 000 ₽', d:'19', k:'60',
      why:'НДС учитывается отдельно от стоимости товара: он не расход и не часть актива, пока не принят к вычету.' },
    { tag:'Закупки', t:'Принят к вычету НДС по корректному счёту-фактуре — 100 000 ₽', d:'68', k:'19',
      why:'уменьшаем долг перед бюджетом по НДС (дебет 68) и списываем входной налог с 19.' },
    { tag:'Закупки', t:'Перечислен аванс поставщику — 300 000 ₽', d:'60', k:'51',
      why:'аванс выданный — это дебиторка на счёте 60, а не расход. Деньги ушли (кредит 51).' },
    { tag:'Продажи', t:'Отгружен товар покупателю на 1 200 000 ₽, в том числе НДС', d:'62', k:'90.1',
      why:'выручка признаётся в полной сумме с НДС, одновременно возникает долг покупателя.' },
    { tag:'Продажи', t:'Начислен НДС с реализации — 200 000 ₽', d:'90.3', k:'68',
      why:'НДС уменьшает выручку внутри счёта 90 и увеличивает обязательство перед бюджетом.' },
    { tag:'Продажи', t:'Списана себестоимость проданного товара — 750 000 ₽', d:'90.2', k:'41',
      why:'принцип соответствия: расход признаётся в том же периоде, что и доход от этой продажи.' },
    { tag:'Продажи', t:'Получен аванс от покупателя — 600 000 ₽', d:'51', k:'62',
      why:'деньги ↑, обязательство поставить товар ↑. Учитывается на отдельном субсчёте 62.АВ — сворачивать с дебиторкой нельзя.' },
    { tag:'Зарплата', t:'Начислена зарплата административному персоналу — 400 000 ₽', d:'26', k:'70',
      why:'расход ↑ (дебет счёта затрат), обязательство перед работниками ↑.' },
    { tag:'Зарплата', t:'Удержан НДФЛ из зарплаты — 52 000 ₽', d:'70', k:'68',
      why:'удержание уменьшает долг перед работником и создаёт долг перед бюджетом. Расходом работодателя это не является.' },
    { tag:'Зарплата', t:'Начислены страховые взносы — 120 000 ₽', d:'26', k:'69',
      why:'а вот взносы — расход работодателя сверх зарплаты, поэтому снова дебет счёта затрат.' },
    { tag:'Внеоборотные', t:'Приобретено оборудование, стоимость без НДС — 640 000 ₽', d:'08', k:'60',
      why:'сначала капитальные вложения по ФСБУ 26/2020, на счёт 01 объект попадёт только при вводе в эксплуатацию.' },
    { tag:'Внеоборотные', t:'Оборудование введено в эксплуатацию — 640 000 ₽', d:'01', k:'08',
      why:'капвложения превращаются в основное средство; со следующего месяца начисляется амортизация.' },
    { tag:'Внеоборотные', t:'Начислена амортизация оборудования — 9 000 ₽', d:'26', k:'02',
      why:'счёт 02 — регулирующий к 01: сам объект не уменьшается, в балансе показывается разница.' },
    { tag:'Резервы', t:'Создан резерв по сомнительным долгам — 300 000 ₽', d:'91.2', k:'63',
      why:'признание ожидаемых потерь: прочий расход ↑, регулирующая величина к дебиторке ↑.' },
    { tag:'Резервы', t:'Создан резерв на оплату отпусков — 180 000 ₽', d:'26', k:'96',
      why:'оценочное обязательство по ПБУ 8/2010: работники уже заработали дни отпуска, значит, обязанность возникла.' },
    { tag:'Финансы', t:'Получен краткосрочный кредит банка — 2 000 000 ₽', d:'51', k:'66',
      why:'деньги ↑, обязательство ↑. Проценты начисляются отдельной проводкой Дт 91.2 Кт 66.' },
    { tag:'Закрытие', t:'Реформация баланса: прибыль года перенесена — 1 500 000 ₽', d:'99', k:'84',
      why:'31 декабря результат года уходит в накопленную прибыль, счёт 99 обнуляется.' },
  ]

  const body = dShell(root, 'Марафон проводок: 20 операций')
  const done: Record<number, boolean> = {}
  let i = 0

  const top = dEl('div', 'mar-top')
  const tag = dEl('span', 'mar-tag', '')
  const barBox = dEl('div', 'mar-bar')
  const fill = dEl('div', 'mar-fill')
  barBox.appendChild(fill)
  const cnt = dEl('span', 'mar-cnt', '')
  top.appendChild(tag)
  top.appendChild(barBox)
  top.appendChild(cnt)
  body.appendChild(top)

  const task = dEl('div', 'sort-q')
  body.appendChild(task)

  const row = dEl('div', 'je-row')
  const dSel = document.createElement('select')
  const kSel = document.createElement('select')
  for (const [sel, placeholder] of [[dSel, 'Дебет…'], [kSel, 'Кредит…']] as const) {
    const empty = document.createElement('option')
    empty.value = ''
    empty.textContent = placeholder
    sel.appendChild(empty)
    for (const code of ACC_KEYS) {
      const opt = document.createElement('option')
      opt.value = code
      opt.textContent = accLabel(code)
      sel.appendChild(opt)
    }
  }
  const verdict = dEl('div', 'je-v', '')
  row.appendChild(dEl('div', 'je-n', ''))
  row.appendChild(dSel)
  row.appendChild(kSel)
  row.appendChild(dEl('div'))
  row.appendChild(verdict)
  body.appendChild(row)

  const why = dEl('div', 'demo-note', '')
  const ctl = dEl('div', 'demo-ctl')
  ctl.appendChild(dBtn('Проверить', 'pri', check))
  ctl.appendChild(dBtn('Показать ответ', null, reveal))
  ctl.appendChild(dBtn('← Назад', 'sm', () => { go(-1) }))
  ctl.appendChild(dBtn('Дальше →', 'sm', () => { go(1) }))
  body.appendChild(ctl)
  body.appendChild(why)

  function go(step: number): void {
    i = (i + step + TASKS.length) % TASKS.length
    draw()
  }

  function draw(): void {
    const t = TASKS[i]
    if (!t) return
    tag.textContent = t.tag
    task.innerHTML = '<b>' + (i + 1) + '.</b> ' + t.t
    dSel.value = ''
    kSel.value = ''
    row.className = 'je-row'
    verdict.textContent = ''
    why.innerHTML = ''
    const solved = Object.values(done).filter(Boolean).length
    fill.style.width = (solved / TASKS.length * 100) + '%'
    cnt.textContent = 'решено ' + fmt(solved) + ' из ' + TASKS.length
  }

  function check(): void {
    const t = TASKS[i]
    if (!t) return
    const ok = dSel.value === t.d && kSel.value === t.k
    row.className = 'je-row ' + (ok ? 'ok' : 'no')
    verdict.textContent = ok ? '✔ верно' : '✕ неверно'
    if (ok) {
      done[i] = true
      why.innerHTML = '<b>Почему так.</b> ' + t.why
    } else {
      why.innerHTML = 'Вернитесь к алгоритму: что произошло → какие два объекта → каждый больше или меньше → правило сторон.'
    }
    draw2()
  }

  function reveal(): void {
    const t = TASKS[i]
    if (!t) return
    dSel.value = t.d
    kSel.value = t.k
    row.className = 'je-row'
    verdict.textContent = ''
    why.innerHTML = '<b>Дт ' + t.d + ' Кт ' + t.k + '.</b> ' + t.why
  }

  /** Обновляет только прогресс — не сбрасывая текущий ответ. */
  function draw2(): void {
    const solved = Object.values(done).filter(Boolean).length
    fill.style.width = (solved / TASKS.length * 100) + '%'
    cnt.textContent = 'решено ' + fmt(solved) + ' из ' + TASKS.length
  }

  draw()
}
