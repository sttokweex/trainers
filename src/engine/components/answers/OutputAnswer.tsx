import { useMemo, useRef, useState } from 'react'
import type { OutputQuestion } from '@/engine/types'

const norm = (v: string) => v.trim().replace(/['"`]/g, '').replace(/\s+/g, ' ').toLowerCase()

/** Небольшой сеяный ГПСЧ: одинаковый seed — одинаковая последовательность. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Ответ вводится в пронумерованные ячейки — по одной на строку вывода,
 * с построчной проверкой. Плюс палитра значений вперемешку: кликом
 * подставляется в первую пустую ячейку, так быстрее и удобно с телефона.
 */
export function OutputAnswer({
  item, onChecked, showHint,
}: {
  item: OutputQuestion
  onChecked: () => void
  /** Палитра значений — подсказка, поэтому в режиме «Проверка» её нет. */
  showHint: boolean
}) {
  const expected = useMemo(() => item.expected.split('\n'), [item.expected])
  const [values, setValues] = useState<string[]>(() => expected.map(() => ''))
  const [checked, setChecked] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  /**
   * Порядок значений в палитре перемешан детерминированно: случайность прямо
   * в рендере нарушала бы чистоту и меняла бы порядок при каждом обновлении.
   *
   * Важно, что это настоящая перестановка. Первая версия сортировала по
   * ключу (seed + i·K) mod M — для коротких списков он рос монотонно, порядок
   * сохранялся, и подсказка выдавала готовый ответ. Теперь Фишер–Йетс на
   * сеяном ГПСЧ плюс проверка, что результат не совпал с исходным порядком.
   */
  const shuffled = useMemo(() => {
    const uniq = [...new Set(expected.map((v) => v.trim()))]
    if (uniq.length < 2 || !uniq.every((v) => v.length <= 16)) return null

    const baseSeed = [...item.id].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7)

    for (let attempt = 0; attempt < 8; attempt++) {
      const rand = mulberry32(baseSeed + attempt * 0x9e3779b9)
      const out = [...uniq]
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1))
        ;[out[i], out[j]] = [out[j] as string, out[i] as string]
      }
      // совпал с исходным порядком — подсказка выдала бы ответ, пробуем снова
      if (out.some((v, i) => v !== uniq[i])) return out
    }
    return [...uniq].reverse()
  }, [expected, item.id])

  const setAt = (i: number, v: string) => {
    setValues((prev) => prev.map((x, k) => (k === i ? v : x)))
    setChecked(false)
  }

  const fillNext = (v: string) => {
    const i = values.findIndex((x) => !x)
    if (i === -1) return
    setAt(i, v)
    const after = values.findIndex((x, k) => !x && k > i)
    if (after !== -1) refs.current[after]?.focus()
  }

  const check = () => { setChecked(true); onChecked() }

  const right = values.filter((v, i) => norm(v) === norm(expected[i] ?? '')).length
  const allRight = checked && right === expected.length

  return (
    <>
      <div className="sec-t">Ваш ответ — что напечатает консоль, по строке на каждый вывод</div>
      <div className="cells">
        {expected.map((exp, i) => {
          const good = norm(values[i] ?? '') === norm(exp)
          return (
            <div key={i} className={'cell' + (checked ? (good ? ' ok' : ' no') : '')}>
              <div className="cell-n">{i + 1}.</div>
              <input
                ref={(el) => { refs.current[i] = el }}
                spellCheck={false}
                placeholder="…"
                value={values[i] ?? ''}
                onChange={(e) => setAt(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const next = refs.current[i + 1]
                    if (next) next.focus(); else check()
                  }
                  if (e.key === 'Backspace' && !values[i] && i > 0) refs.current[i - 1]?.focus()
                }}
              />
              <div className="cell-r">
                {checked ? (good ? '✓' : (values[i]?.trim() ? `✕ ждали: ${exp}` : '✕ пусто')) : ''}
              </div>
            </div>
          )
        })}
      </div>

      {shuffled && showHint && (
        <div className="pal">
          <div className="pal-t">подсказка: значения вперемешку — нажмите, чтобы подставить</div>
          {shuffled.map((v, i) => (
            <button key={i} type="button" className="pal-c" onClick={() => fillNext(v)}>{v}</button>
          ))}
        </div>
      )}

      <div className="ed-bar">
        <button type="button" className="btn pri" onClick={check}>Проверить</button>
        <button
          type="button" className="btn gho sm"
          onClick={() => { setValues(expected.map(() => '')); setChecked(false) }}
        >
          Очистить
        </button>
        <div className="ed-hint">Enter — следующая ячейка</div>
      </div>

      {checked && (
        <div className="res show">
          <div className={'res-h ' + (allRight ? 'ok' : 'no')}>
            {allRight
              ? `✓ Верно, все ${right} строки на своих местах`
              : `Совпало ${right} из ${expected.length} — неверные подсвечены`}
          </div>
        </div>
      )}
    </>
  )
}
