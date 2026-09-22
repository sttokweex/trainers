import { useState } from 'react'
import { RichContent } from './RichContent'
import { Markers } from './Markers'
import { ChoiceAnswer } from './answers/ChoiceAnswer'
import { CodeAnswer, ManualAnswer } from './answers/CodeAnswer'
import { NumAnswer } from './answers/NumAnswer'
import { OutputAnswer } from './answers/OutputAnswer'
import type { LegacyDemo, Mark, Question } from '@/engine/types'

const TYPE_LABEL: Record<Question['type'], string> = {
  theory: 'теория', code: 'код', output: 'вывод', manual: 'написать',
  choice: 'выбор', num: 'расчёт',
}
const TYPE_CLASS: Record<Question['type'], string> = {
  theory: 't', code: 'code', output: 'out', manual: 'man',
  choice: 'choice', num: 'num',
}

export function QuestionCard({
  item, index, mark, onToggleMark, reveal, demos, note, onNoteChange, notesEnabled = false,
}: {
  item: Question
  index: number
  mark: Mark | undefined
  onToggleMark: (id: string, m: Mark) => void
  /** В режиме «Изучение» у чистой теории ответ раскрыт сразу — проверять там нечего. */
  reveal: boolean
  demos: Record<string, LegacyDemo>
  /** Personal note is intentionally opt-in: audit keeps its original UI. */
  note?: string
  onNoteChange?: (value: string) => void
  notesEnabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [answerShown, setAnswerShown] = useState(false)

  /**
   * «Изучение» показывает разбор сразу у ЛЮБОГО типа вопроса — иначе
   * переключатель выглядел бы сломанным на всём, кроме чистой теории.
   * Интерактив при этом остаётся: ячейки, редактор и варианты никуда не деваются.
   */
  const showAnswer = reveal || answerShown
  const cls = 'card' + (open ? ' open' : '') + (mark === 'know' ? ' done' : mark === 'repeat' ? ' repeat' : '')

  return (
    <div className={cls} id={'q-' + item.id}>
      <div className="c-head" onClick={() => setOpen((v) => !v)}>
        <div className="c-num">{String(index + 1).padStart(2, '0')}</div>
        <div className="c-main">
          <div className="c-q" dangerouslySetInnerHTML={{ __html: item.q }} />
          <div className="chips">
            <span className="chip t">{item.topic}</span>
            <span className={'chip ' + TYPE_CLASS[item.type]}>{TYPE_LABEL[item.type]}</span>
            {item.level && <span className="chip lv">{item.level}</span>}
            {mark === 'know' && <span className="chip code">✓ знаю</span>}
            {mark === 'repeat' && <span className="chip man">↻ повторить</span>}
          </div>
        </div>
        <div className="c-caret">▶</div>
      </div>

      {open && (
        <div className="c-body">
          {item.code && (
            <>
              <div className="sec-t">Код</div>
              <pre className="code">{item.code}</pre>
            </>
          )}

          {item.type === 'output' && (
            <OutputAnswer item={item} onChecked={() => setAnswerShown(true)} showHint={reveal} />
          )}
          {item.type === 'choice' && <ChoiceAnswer item={item} onChecked={() => setAnswerShown(true)} />}
          {item.type === 'num' && <NumAnswer item={item} onChecked={() => setAnswerShown(true)} />}
          {item.type === 'code' && <CodeAnswer item={item} onSolved={() => setAnswerShown(true)} />}
          {item.type === 'manual' && <ManualAnswer item={item} onSolved={() => setAnswerShown(true)} />}

          {item.type === 'theory' && !showAnswer && (
            <div className="ed-bar">
              <button type="button" className="btn pri" onClick={() => setAnswerShown(true)}>
                Показать ответ
              </button>
            </div>
          )}

          {showAnswer && (
            <>
              <div className="sec-t">{item.type === 'theory' ? 'Ответ' : 'Разбор'}</div>
              <div className="ans">
                <RichContent html={item.answer} demos={demos} />
              </div>
            </>
          )}

          {(showAnswer || item.type === 'code' || item.type === 'manual') && (
            <Markers mark={mark} onToggle={(m) => onToggleMark(item.id, m)} />
          )}

          {notesEnabled && onNoteChange && (
            <label className="question-note">
              <span>Личная заметка</span>
              <textarea
                rows={2}
                value={note ?? ''}
                placeholder="Что важно не забыть…"
                onChange={(e) => onNoteChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </label>
          )}
        </div>
      )}
    </div>
  )
}
