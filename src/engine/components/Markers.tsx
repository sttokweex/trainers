import type { Mark } from '@/engine/types'

/** Кнопки «знаю / повторить» — повторный клик снимает отметку. */
export function Markers({
  mark, onToggle,
}: {
  mark: Mark | undefined
  onToggle: (m: Mark) => void
}) {
  return (
    <div className="marks interview-markers">
      {
        <div className="marks-caption">
          <span>После разбора отметьте результат:</span>
          <small>карточка останется открытой, отметка сохранится в прогрессе</small>
        </div>
      }
      <button
        type="button"
        className={'mk' + (mark === 'know' ? ' on-k' : '')}
        aria-pressed={mark === 'know'}
        title="Отметить вопрос как освоенный"
        onClick={() => onToggle('know')}
      >
        ✓ Знаю{mark === 'know' ? ' · выбрано' : ''}
      </button>
      <button
        type="button"
        className={'mk' + (mark === 'repeat' ? ' on-r' : '')}
        aria-pressed={mark === 'repeat'}
        title="Добавить вопрос в повторение"
        onClick={() => onToggle('repeat')}
      >
        ↻ Повторить{mark === 'repeat' ? ' · выбрано' : ''}
      </button>
    </div>
  )
}
