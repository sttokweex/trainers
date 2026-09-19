/* eslint-disable */
// @ts-nocheck — императивное демо, перенесено как есть; типизируется при переписывании в React
import type { LegacyDemo } from '@/engine/types'
import * as H from '@/demos/helpers'
const { dEl, dBtn, dShell, dField, dSelect, dRange, kpi, fmt, money, num, pct, th,
        barsH, barsV, lineC, stackRow, chartBox, legend, sv, mkSort, mkMatch, mkSteps,
        mkTree, calcShell, bindAll, ACC, ACC_KEYS, accLabel } = H as any

export const uiStates: LegacyDemo = root => {
  const body = dShell(root, 'Пять состояний любого экрана')
  const stage = dEl('div')
  stage.style.cssText = 'background:#05080c;border:1px solid var(--bd);border-radius:8px;padding:16px;min-height:150px'
  body.appendChild(stage)
  const info = dEl('div', 'el-step')
  body.appendChild(info)
  const sk = n => Array.from({ length: n }, () =>
    '<div style="height:14px;background:linear-gradient(90deg,#0f1721,#16202c,#0f1721);border-radius:4px;margin-bottom:9px"></div>').join('')
  const VIEWS = {
    loading: [sk(4), 'Скелетон сохраняет структуру, не даёт скачка вёрстки и субъективно быстрее спиннера. Для действий короче 300мс индикатор лучше не показывать вовсе.'],
    empty: ['<div style="text-align:center;padding:20px 0;color:var(--mut)"><div style="font-size:26px;margin-bottom:8px">📋</div><b style="color:var(--tx)">У вас пока нет задач</b><div style="font-size:13px;margin:6px 0 12px">Создайте первую — это займёт полминуты</div><button class="demo-b pri">Создать задачу</button></div>',
      'Не «Нет данных», а объяснение <b>почему</b> пусто и <b>следующий шаг</b>. Различайте «пусто вообще» и «пусто по фильтру» — во втором случае предложите сбросить фильтр.'],
    error: ['<div style="text-align:center;padding:20px 0"><div style="font-size:26px;margin-bottom:8px">⚠️</div><b style="color:#ffb4ae">Не удалось загрузить задачи</b><div style="font-size:13px;color:var(--mut);margin:6px 0 12px">Проверьте соединение и попробуйте снова</div><button class="demo-b">Повторить</button></div>',
      'Человеческим языком, без кодов и стектрейсов. <b>Всегда давайте действие</b>: «Повторить», «Вернуться». И никогда не теряйте введённые данные при ошибке отправки.'],
    partial: ['<div style="color:var(--tx);font-size:13px"><div style="display:flex;justify-content:space-between;padding:8px;border:1px solid var(--bd);border-radius:6px;margin-bottom:6px">Купить хлеб <span style="color:var(--grn)">✓</span></div><div style="display:flex;justify-content:space-between;padding:8px;border:1px solid var(--bd);border-radius:6px;margin-bottom:6px">Позвонить в банк <span style="color:var(--mut2)">…</span></div><div style="padding:8px;border:1px dashed #6b4a15;border-radius:6px;color:var(--yel);font-size:12px">Виджет статистики не загрузился</div></div>',
      'Часть данных есть, часть сломалась. Упавший виджет не должен ронять страницу — это graceful degradation на уровне интерфейса.'],
    success: ['<div style="color:var(--tx);font-size:13px">' + [1, 2, 3].map(i =>
      '<div style="display:flex;justify-content:space-between;padding:8px;border:1px solid var(--bd);border-radius:6px;margin-bottom:6px">Задача ' + i + ' <span style="color:var(--grn)">✓</span></div>').join('') + '</div>',
      'То единственное состояние, которое обычно нарисовано в макете. Остальные четыре приходится придумывать разработчику.'],
  }
  const ctl = dEl('div', 'demo-ctl')
  const NAMES = { loading: 'Загрузка', empty: 'Пусто', error: 'Ошибка', partial: 'Частично', success: 'Успех' }
  const btns = Object.keys(VIEWS).map(k => dBtn(NAMES[k], k === 'loading' ? 'pri' : null, () => {
    btns.forEach(b => b.className = 'demo-b' + (b.textContent === NAMES[k] ? ' pri' : ''))
    stage.innerHTML = VIEWS[k][0]
    info.innerHTML = '<span class="el-phase sync">' + NAMES[k] + '</span>' + VIEWS[k][1]
  }))
  btns.forEach(b => ctl.appendChild(b))
  body.appendChild(ctl)
  stage.innerHTML = VIEWS.loading[0]
  info.innerHTML = '<span class="el-phase sync">Загрузка</span>' + VIEWS.loading[1]
}
