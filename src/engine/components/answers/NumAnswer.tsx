import { useState } from 'react'
import type { NumQuestion } from '@/engine/types'

/** Расчётная задача: сверка числа с допуском, ввод терпим к пробелам и запятой. */
export function NumAnswer({ item, onChecked }: { item: NumQuestion; onChecked: () => void }) {
  const [value, setValue] = useState('')
  const [verdict, setVerdict] = useState<null | boolean>(null)
  const [hintShown, setHintShown] = useState(false)

  const check = () => {
    const raw = value.replace(/[\s ]/g, '').replace(',', '.')
    const v = Number(raw)
    const tol = item.tol ?? 0.01
    setVerdict(Number.isFinite(v) && Math.abs(v - item.expect) <= tol)
    onChecked()
  }

  return (
    <>
      <div className="sec-t">Ваш ответ</div>
      <div className="numrow">
        <input
          className={verdict === null ? '' : verdict ? 'ok' : 'no'}
          inputMode="decimal"
          placeholder="введите число"
          value={value}
          onChange={(e) => { setValue(e.target.value); setVerdict(null) }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); check() } }}
        />
        {item.unit && <span className="unit">{item.unit}</span>}
      </div>
      <div className="ed-bar">
        <button type="button" className="btn pri" onClick={check}>Проверить</button>
        {item.hint && !hintShown && (
          <button type="button" className="btn sm" onClick={() => setHintShown(true)}>Подсказка</button>
        )}
      </div>
      {hintShown && item.hint && <div className="hint">{item.hint}</div>}
      {verdict !== null && (
        <div className="res show">
          <div className={'res-h ' + (verdict ? 'ok' : 'no')}>
            {verdict
              ? '✓ Верно'
              : `✕ Не сходится — правильный ответ ${item.expect}${item.unit ? ' ' + item.unit : ''}`}
          </div>
        </div>
      )}
    </>
  )
}
