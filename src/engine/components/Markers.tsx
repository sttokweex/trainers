import type { Mark } from '@/engine/types'

/** Кнопки «знаю / повторить» — повторный клик снимает отметку. */
export function Markers({
  mark, onToggle,
}: { mark: Mark | undefined; onToggle: (m: Mark) => void }) {
  return (
    <div className="marks">
      <button
        type="button"
        className={'mk' + (mark === 'know' ? ' on-k' : '')}
        onClick={() => onToggle('know')}
      >
        ✓ Знаю
      </button>
      <button
        type="button"
        className={'mk' + (mark === 'repeat' ? ' on-r' : '')}
        onClick={() => onToggle('repeat')}
      >
        ↻ Повторить
      </button>
    </div>
  )
}
