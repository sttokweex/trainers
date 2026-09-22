import type { Mark } from '@/engine/types'

/** Кнопки «знаю / повторить» — повторный клик снимает отметку. */
export function Markers({
  mark, onToggle, context = 'audit',
}: {
  mark: Mark | undefined
  onToggle: (m: Mark) => void
  /** Interview cards explain what the mark does and never navigate on click. */
  context?: 'interview' | 'audit'
}) {
  const isInterview = context === 'interview'
  return (
    <div className={'marks' + (isInterview ? ' interview-markers' : '')}>
      {isInterview && (
        <div className="marks-caption">
          <span>После разбора отметьте результат:</span>
          <small>карточка останется открытой, отметка сохранится в прогрессе</small>
        </div>
      )}
      <button
        type="button"
        className={'mk' + (mark === 'know' ? ' on-k' : '')}
        aria-pressed={mark === 'know'}
        title={isInterview ? 'Отметить вопрос как освоенный' : undefined}
        onClick={() => onToggle('know')}
      >
        ✓ Знаю{mark === 'know' ? ' · выбрано' : ''}
      </button>
      <button
        type="button"
        className={'mk' + (mark === 'repeat' ? ' on-r' : '')}
        aria-pressed={mark === 'repeat'}
        title={isInterview ? 'Добавить вопрос в повторение' : undefined}
        onClick={() => onToggle('repeat')}
      >
        ↻ Повторить{mark === 'repeat' ? ' · выбрано' : ''}
      </button>
    </div>
  )
}
