import { useEffect, useMemo, useState } from 'react'
import { TheoryCard } from '../TheoryCard'
import { RichContent } from '../RichContent'
import { CodeBlock } from '../CodeBlock'
import type { ChoiceQuestion, ContentPack, Question, TheoryArticle } from '@/engine/types'

type GameSave = {
  chapterXp: Record<string, number>
  bossBest: number
  bossRewarded: boolean
}

const STORAGE_KEY = 'interview-trainer-theory-game-v1'
const EMPTY_SAVE: GameSave = { chapterXp: {}, bossBest: 0, bossRewarded: false }

function readSave(): GameSave {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<GameSave>
    const chapterXp = parsed.chapterXp && typeof parsed.chapterXp === 'object'
      ? Object.fromEntries(Object.entries(parsed.chapterXp).filter(([, xp]) => xp === 10 || xp === 25))
      : {}
    return {
      chapterXp,
      bossBest: Number.isFinite(parsed.bossBest) ? Math.max(0, Math.min(5, Number(parsed.bossBest))) : 0,
      bossRewarded: parsed.bossRewarded === true,
    }
  } catch {
    return EMPTY_SAVE
  }
}

function challengeFor(article: TheoryArticle, questions: Question[]): ChoiceQuestion | undefined {
  const pool = questions.filter((q): q is ChoiceQuestion =>
    q.topic === article.topic && q.type === 'choice' && !q.multi,
  )
  if (!pool.length) return undefined
  const seed = [...article.id].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return pool[seed % pool.length]
}

function reflectionFor(article: TheoryArticle, questions: Question[]): Question | undefined {
  return questions.find((q) => q.topic === article.topic && q.type !== 'choice')
    ?? questions.find((q) => q.topic === article.topic)
}

function shuffle<T,>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

export function TheoryGameMode({
  pack, onOpenClassic,
}: {
  pack: ContentPack
  onOpenClassic: () => void
}) {
  const [save, setSave] = useState<GameSave>(readSave)
  const [stage, setStage] = useState<'map' | 'read' | 'challenge' | 'boss' | 'boss-result'>('map')
  const [activeId, setActiveId] = useState('')
  const [picked, setPicked] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [reflectionShown, setReflectionShown] = useState(false)
  const [bossQuestions, setBossQuestions] = useState<ChoiceQuestion[]>([])
  const [bossIndex, setBossIndex] = useState(0)
  const [bossPicked, setBossPicked] = useState<number | null>(null)
  const [bossChecked, setBossChecked] = useState(false)
  const [bossScore, setBossScore] = useState(0)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(save)) } catch { /* storage может быть отключён */ }
  }, [save])

  useEffect(() => {
    const resetGame = () => {
      setSave(EMPTY_SAVE)
      setStage('map')
      setActiveId('')
      setBossQuestions([])
      setBossScore(0)
    }
    window.addEventListener('interview-trainer-progress-reset', resetGame)
    return () => window.removeEventListener('interview-trainer-progress-reset', resetGame)
  }, [])

  const categoryByTopic = useMemo(() => {
    const result = new Map<string, string>()
    for (const category of pack.categories ?? []) {
      for (const topic of category.topics) result.set(topic, category.name)
    }
    return result
  }, [pack.categories])

  const worlds = useMemo(() => {
    const grouped = new Map<string, TheoryArticle[]>()
    for (const article of pack.theory) {
      const world = categoryByTopic.get(article.topic) ?? 'Дополнительные главы'
      const articles = grouped.get(world) ?? []
      articles.push(article)
      grouped.set(world, articles)
    }
    return [...grouped].map(([name, articles]) => ({ name, articles }))
  }, [pack.theory, categoryByTopic])

  const article = pack.theory.find((item) => item.id === activeId)
  const challenge = article ? challengeFor(article, pack.questions) : undefined
  const reflection = article ? reflectionFor(article, pack.questions) : undefined
  const completedCount = pack.theory.filter((item) => save.chapterXp[item.id] !== undefined).length
  const totalXp = Object.values(save.chapterXp).reduce((sum, value) => sum + value, 0) + (save.bossRewarded ? 100 : 0)
  const level = Math.floor(totalXp / 100) + 1
  const xpInLevel = totalXp % 100
  const bossQuestion = bossQuestions[bossIndex]
  const bossCorrect = bossQuestion && bossPicked !== null && bossQuestion.options[bossPicked]?.ok === true
  const selectedCorrect = challenge && picked !== null && challenge.options[picked]?.ok === true
  const earnedXp = selectedCorrect ? 25 : 10

  function goToStage(next: typeof stage) {
    setStage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openChapter(item: TheoryArticle) {
    setActiveId(item.id)
    setPicked(null)
    setChecked(false)
    setReflectionShown(false)
    goToStage('read')
  }

  function awardChapter(xp: number) {
    if (!article) return
    setSave((previous) => previous.chapterXp[article.id] !== undefined
      ? previous
      : { ...previous, chapterXp: { ...previous.chapterXp, [article.id]: xp } })
    goToStage('map')
    setActiveId('')
  }

  function startBoss() {
    const pool = pack.questions.filter((q): q is ChoiceQuestion =>
      q.type === 'choice' && !q.multi && q.options.some((option) => option.ok),
    )
    setBossQuestions(shuffle(pool).slice(0, 5))
    setBossIndex(0)
    setBossPicked(null)
    setBossChecked(false)
    setBossScore(0)
    setStage('boss')
  }

  function advanceBoss() {
    if (bossIndex === bossQuestions.length - 1) {
      setSave((previous) => ({
        ...previous,
        bossBest: Math.max(previous.bossBest, bossScore),
        bossRewarded: previous.bossRewarded || bossScore >= 4,
      }))
      goToStage('boss-result')
      return
    }
    setBossIndex((index) => index + 1)
    setBossPicked(null)
    setBossChecked(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (stage === 'read' && article) {
    const alreadyDone = save.chapterXp[article.id] !== undefined
    return (
      <div className="theory-game">
        <div className="tg-topline">
          <button type="button" className="btn" onClick={() => goToStage('map')}>← Карта глав</button>
          <span>{alreadyDone ? 'Глава пройдена' : 'Новая глава'} · {article.topic}</span>
        </div>
        <div className="tg-reading-head">
          <div className="tg-eyebrow">Глава · {completedCount + (alreadyDone ? 0 : 1)} / {pack.theory.length}</div>
          <h2>{article.title}</h2>
          <p>{article.lead}</p>
        </div>
        <TheoryCard key={article.id} item={article} demos={pack.demos} autoOpen />
        <div className="tg-reading-action">
          <span>{alreadyDone ? 'Можно повторить испытание или вернуться к карте.' : 'Прочитай главу, затем проверь понимание коротким испытанием.'}</span>
          <button
            type="button" className="btn pri"
            onClick={() => { setPicked(null); setChecked(false); setReflectionShown(false); goToStage('challenge') }}
          >
            {challenge ? 'Пройти испытание →' : 'Закрепить главу →'}
          </button>
        </div>
      </div>
    )
  }

  if (stage === 'challenge' && article) {
    const alreadyDone = save.chapterXp[article.id] !== undefined
    return (
      <div className="theory-game">
        <div className="tg-topline">
          <button type="button" className="btn" onClick={() => goToStage('read')}>← Вернуться к главе</button>
          <span>Испытание · {article.topic}</span>
        </div>
        <section className="tg-quest">
          <div className="tg-eyebrow">Мини-босс · одна задача</div>
          <h2>{article.title}</h2>
          {challenge ? (
            <>
              <div className="tg-question" dangerouslySetInnerHTML={{ __html: challenge.q }} />
              {challenge.code && <CodeBlock code={challenge.code} />}
              <div className="tg-choices">
                {challenge.options.map((option, index) => {
                  const cls = ['tg-choice', picked === index ? 'selected' : '', checked && option.ok ? 'correct' : '', checked && picked === index && !option.ok ? 'incorrect' : ''].filter(Boolean).join(' ')
                  return (
                    <button key={index} type="button" className={cls} disabled={checked} onClick={() => setPicked(index)}>
                      <b>{String.fromCharCode(65 + index)}</b>
                      <span dangerouslySetInnerHTML={{ __html: option.t }} />
                    </button>
                  )
                })}
              </div>
              {!checked ? (
                <button type="button" className="btn pri" disabled={picked === null} onClick={() => setChecked(true)}>Проверить ответ</button>
              ) : (
                <>
                  <div className={'tg-verdict ' + (selectedCorrect ? 'correct' : 'incorrect')}>
                    {selectedCorrect ? '✓ Отлично: +25 XP за верный ответ.' : '↻ Разбор открыт: глава всё равно даст +10 XP.'}
                  </div>
                  <div className="tg-answer"><RichContent html={challenge.answer} demos={pack.demos} /></div>
                  <button type="button" className="btn pri" onClick={() => awardChapter(earnedXp)}>
                    {alreadyDone ? 'Вернуться к карте' : 'Забрать ' + earnedXp + ' XP'}
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <div className="tg-question">
                {reflection ? <div dangerouslySetInnerHTML={{ __html: reflection.q }} /> : 'Сформулируй главную мысль главы своими словами.'}
                {reflection?.code && <CodeBlock code={reflection.code} />}
              </div>
              {!reflectionShown ? (
                <button type="button" className="btn pri" onClick={() => setReflectionShown(true)}>Показать разбор</button>
              ) : (
                <>
                  {reflection && <div className="tg-answer"><RichContent html={reflection.answer} demos={pack.demos} /></div>}
                  <p className="tg-self-check">Как прошёл ответ вслух?</p>
                  <div className="tg-choices">
                    <button type="button" className="tg-choice" onClick={() => awardChapter(25)}>Могу объяснить своими словами · +25 XP</button>
                    <button type="button" className="tg-choice" onClick={() => awardChapter(10)}>Надо повторить · +10 XP</button>
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </div>
    )
  }

  if (stage === 'boss' && bossQuestion) {
    return (
      <div className="theory-game">
        <div className="tg-topline">
          <button type="button" className="btn" onClick={() => goToStage('map')}>← Карта глав</button>
          <span>Финальное испытание · {bossIndex + 1} / {bossQuestions.length}</span>
        </div>
        <section className="tg-quest tg-boss-quest">
          <div className="tg-eyebrow">Босс · смешанные темы · счёт {bossScore}</div>
          <h2 dangerouslySetInnerHTML={{ __html: bossQuestion.q }} />
          {bossQuestion.code && <CodeBlock code={bossQuestion.code} />}
          <div className="tg-choices">
            {bossQuestion.options.map((option, index) => {
              const cls = ['tg-choice', bossPicked === index ? 'selected' : '', bossChecked && option.ok ? 'correct' : '', bossChecked && bossPicked === index && !option.ok ? 'incorrect' : ''].filter(Boolean).join(' ')
              return (
                <button key={index} type="button" className={cls} disabled={bossChecked} onClick={() => setBossPicked(index)}>
                  <b>{String.fromCharCode(65 + index)}</b>
                  <span dangerouslySetInnerHTML={{ __html: option.t }} />
                </button>
              )
            })}
          </div>
          {!bossChecked ? (
            <button
              type="button" className="btn pri" disabled={bossPicked === null}
              onClick={() => { setBossChecked(true); if (bossCorrect) setBossScore((score) => score + 1) }}
            >
              Проверить
            </button>
          ) : (
            <>
              <div className={'tg-verdict ' + (bossCorrect ? 'correct' : 'incorrect')}>{bossCorrect ? '✓ Верно' : 'Разбери объяснение перед следующим вопросом.'}</div>
              <div className="tg-answer"><RichContent html={bossQuestion.answer} demos={pack.demos} /></div>
              <button type="button" className="btn pri" onClick={advanceBoss}>
                {bossIndex === bossQuestions.length - 1 ? 'Завершить испытание' : 'Следующий вопрос →'}
              </button>
            </>
          )}
        </section>
      </div>
    )
  }

  if (stage === 'boss-result') {
    const passed = bossScore >= 4
    return (
      <div className="theory-game tg-result">
        <div className="tg-boss-emblem">{passed ? '✦' : '↻'}</div>
        <div className="tg-eyebrow">Финальное испытание завершено</div>
        <h2>{bossScore} / {bossQuestions.length}</h2>
        <p>{passed ? 'Отличная работа: пройдено не менее четырёх испытаний из пяти.' : 'Повтори главы, где не хватило уверенности, и приходи на бой ещё раз.'}</p>
        {passed && <div className="tg-reward">Награда +100 XP засчитана; повторный бой не добавит опыт.</div>}
        <button type="button" className="btn pri" onClick={() => goToStage('map')}>Вернуться на карту</button>
      </div>
    )
  }

  const bossPoolSize = pack.questions.filter((q) => q.type === 'choice' && !q.multi).length
  return (
    <div className="theory-game">
      <section className="tg-hero">
        <div className="tg-hero-copy">
          <div className="tg-eyebrow">Экспериментальный режим · прогресс отдельный</div>
          <h1>Теория как приключение</h1>
          <p>Читай те же статьи и запускай те же интерактивы. За каждую главу проходи мини-испытание, собирай опыт и проверь себя в финальной битве.</p>
          <div className="tg-hero-actions">
            <button type="button" className="btn pri" onClick={onOpenClassic}>Открыть обычную теорию</button>
            <span>Классические отметки чтения не меняются.</span>
          </div>
        </div>
        <div className="tg-avatar" aria-hidden="true">✧</div>
      </section>

      <section className="tg-progress">
        <div className="tg-level-row">
          <div><span className="tg-eyebrow">Уровень {level}</span><b>Исследователь теории</b></div>
          <strong>{totalXp} XP</strong>
        </div>
        <div className="tg-xp-track" role="progressbar" aria-label="Опыт до следующего уровня" aria-valuemin={0} aria-valuemax={100} aria-valuenow={xpInLevel}>
          <span style={{ width: xpInLevel + '%' }} />
        </div>
        <div className="tg-stats">
          <div><b>{completedCount}/{pack.theory.length}</b><span>главы пройдены</span></div>
          <div><b>{save.bossBest}/5</b><span>лучший бой</span></div>
          <div><b>+25</b><span>XP за верный мини-босс</span></div>
        </div>
      </section>

      <button type="button" className="tg-boss-card" disabled={bossPoolSize < 5} onClick={startBoss}>
        <span className="tg-boss-icon">✦</span>
        <span><b>Финальная битва</b><small>5 вопросов из разных тем · нужно 4 правильных, чтобы получить 100 XP{save.bossRewarded ? ' · награда уже получена' : ''}</small></span>
        <strong>{bossPoolSize >= 5 ? 'Начать →' : 'Нужно 5 задач с выбором'}</strong>
      </button>

      <div className="tg-map-heading">
        <div><div className="tg-eyebrow">Карта обучения</div><h2>Выбери главу</h2></div>
        <span>{completedCount === pack.theory.length ? 'Все главы пройдены ✨' : 'Любая глава доступна сразу'}</span>
      </div>

      <div className="tg-worlds">
        {worlds.map((world) => {
          const worldDone = world.articles.filter((item) => save.chapterXp[item.id] !== undefined).length
          return (
            <section className="tg-world" key={world.name}>
              <div className="tg-world-heading"><h3>{world.name}</h3><span>{worldDone}/{world.articles.length} глав</span></div>
              <div className="tg-chapters">
                {world.articles.map((item, index) => {
                  const xp = save.chapterXp[item.id]
                  return (
                    <button
                      type="button"
                      key={item.id}
                      className={['tg-chapter', xp !== undefined ? 'complete' : ''].filter(Boolean).join(' ')}
                      onClick={() => openChapter(item)}
                    >
                      <span className="tg-chapter-mark">{xp !== undefined ? '✓' : String(index + 1).padStart(2, '0')}</span>
                      <span className="tg-chapter-copy"><b>{item.title}</b><small>{item.lead}</small></span>
                      <span className="tg-chapter-xp">{xp !== undefined ? '+' + xp + ' XP' : '+25 XP'}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
      <p className="tg-footnote">Игровые награды хранятся отдельно в этом браузере. Обычное чтение, карточки и практика работают как раньше.</p>
    </div>
  )
}
