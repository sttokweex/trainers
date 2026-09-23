import { useMemo, useState } from 'react'
import type { ChoiceQuestion, Question } from '@/engine/types'

/** Короткая интерактивная проверка в конце каждого раздела экзаменационной программы. */
export function ExamSectionQuiz({ id, questions }: { id: string; questions: Question[] }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const question = useMemo(() => {
    const sectionIndex = Number(id.split(':').at(-1) ?? 0)
    const matching = questions.filter((item): item is ChoiceQuestion => item.type === 'choice')
    // Keep a module's question aligned with every section even if its only existing test
    // question is shared; the section title and sources remain immediately above it.
    return matching.length ? matching[((sectionIndex % matching.length) + matching.length) % matching.length] : null
  }, [id, questions])

  if (!question) return <section className="exam-section-quiz"><h6>Проверка по разделу</h6><p>Тестовые вопросы для этого модуля готовятся.</p></section>
  const correct = selected !== null && question.options[selected]?.ok

  return <section className="exam-section-quiz" aria-labelledby={`quiz-${id}`}>
    <div className="tg-eyebrow">Закрепление · тест по разделу</div>
    <h6 id={`quiz-${id}`}>Проверь себя</h6>
    <div className="exam-section-quiz-question" dangerouslySetInnerHTML={{ __html: question.q }} />
    <fieldset disabled={checked}>
      <legend className="sr-only">Выберите один вариант ответа</legend>
      {question.options.map((option, index) => <label className={'exam-section-quiz-option' + (checked && option.ok ? ' correct' : '') + (checked && selected === index && !option.ok ? ' incorrect' : '')} key={index}>
        <input type="radio" name={`quiz-${id}`} checked={selected === index} onChange={() => setSelected(index)} />
        <span dangerouslySetInnerHTML={{ __html: option.t }} />
      </label>)}
    </fieldset>
    {!checked ? <button type="button" className="btn pri" disabled={selected === null} onClick={() => setChecked(true)}>Проверить ответ</button> : <div className={'exam-section-quiz-result ' + (correct ? 'correct' : 'incorrect')}>
      <b>{correct ? 'Верно' : 'Пока неверно'}</b>
      <div dangerouslySetInnerHTML={{ __html: question.answer }} />
      <button type="button" className="btn" onClick={() => { setSelected(null); setChecked(false) }}>Попробовать ещё раз</button>
    </div>}
  </section>
}
