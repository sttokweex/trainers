import { useState } from 'react'
import { RichContent } from './RichContent'
import { CodeBlock } from './CodeBlock'
import { Markers } from './Markers'
import { ChoiceAnswer } from './answers/ChoiceAnswer'
import { CodeAnswer, ManualAnswer } from './answers/CodeAnswer'
import { NumAnswer } from './answers/NumAnswer'
import { OutputAnswer } from './answers/OutputAnswer'
import type { LegacyDemo, Mark, Question } from '@/engine/types'
import { questionHint } from '@/engine/questionHints'

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
  highlighted = false, autoOpen = false, context = 'audit', hint, theoryLinks, onOpenTheory,
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
  /** A random pick gets a persistent visual marker until another pick/filter. */
  highlighted?: boolean
  /** Opens the card when the user jumps to a random question. */
  autoOpen?: boolean
  /** Adds interview-only explanations to progress markers. */
  context?: 'interview' | 'audit'
  /** Short nudge shown without exposing the complete answer. */
  hint?: string
  /** Related interview theory articles. Audit intentionally never receives these. */
  theoryLinks?: { id: string; title: string; topic?: string }[]
  /** Opens a related article in the theory mode. */
  onOpenTheory?: (id: string) => void
}) {
  const [open, setOpen] = useState(autoOpen)
  const [answerShown, setAnswerShown] = useState(false)
  const [hintShown, setHintShown] = useState(false)

  /**
   * «Изучение» показывает разбор сразу у ЛЮБОГО типа вопроса — иначе
   * переключатель выглядел бы сломанным на всём, кроме чистой теории.
   * Интерактив при этом остаётся: ячейки, редактор и варианты никуда не деваются.
   */
  const showAnswer = reveal || answerShown
  const isInterview = context === 'interview'
  const visibleHint = isInterview ? questionHint({ ...item, hint }) : hint?.trim()
  const cls = 'card' + (open ? ' open' : '')
    + (mark === 'know' ? ' done' : mark === 'repeat' ? ' repeat' : '')
    + (highlighted ? ' random-highlight' : '')

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
            {highlighted && <span className="chip random">🎲 выбран</span>}
            {mark === 'know' && <span className="chip code">✓ знаю</span>}
            {mark === 'repeat' && <span className="chip man">↻ повторить</span>}
          </div>
        </div>
        <div className="c-caret">▶</div>
      </div>

      {open && (
        <div className="c-body">
          {isInterview && (visibleHint || theoryLinks?.length) && (
            <div className="question-tools" onClick={(e) => e.stopPropagation()}>
              {visibleHint && (
                <div className="question-hint">
                  <button
                    type="button"
                    className={'btn question-hint-toggle' + (hintShown ? ' active' : '')}
                    aria-expanded={hintShown}
                    onClick={() => setHintShown((v) => !v)}
                  >
                    💡 {hintShown ? 'Скрыть подсказку' : 'Подсказка'}
                  </button>
                  {hintShown && <div className="question-hint-text">{visibleHint}</div>}
                </div>
              )}
              {theoryLinks && theoryLinks.length > 0 && onOpenTheory && (
                <div className="question-theory-links">
                  <span>Полезно освежить:</span>
                  {theoryLinks.map((link) => (
                    <button
                      key={link.id}
                      type="button"
                      className="question-theory-link"
                      title={link.topic ? `Теория · ${link.topic}` : 'Открыть теорию'}
                      onClick={() => onOpenTheory(link.id)}
                    >
                      ↗ {link.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {item.code && (
            <>
              <div className="sec-t">Код</div>
              <CodeBlock code={item.code} />
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
            <Markers context={context} mark={mark} onToggle={(m) => onToggleMark(item.id, m)} />
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
