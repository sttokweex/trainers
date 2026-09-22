import type { PlanLink, Question, TheoryArticle } from '@/engine/types'

/**
 * Articles that explain a question's topic.
 *
 * We deliberately use the content's explicit `topic` field instead of trying
 * to guess a match from the question text. A topic can have several articles
 * (for example JavaScript has separate articles about the event loop and
 * values), so callers can decide whether to open the first article or the
 * topic's complete theory list.
 */
const TOPIC_ALIASES: Record<string, string[]> = {
  // Эти вопросы проверяют навыки ответа и разбора, поэтому ведут в общий
  // материал о структуре собеседования, даже если отдельной статьи темы нет.
  'Лайвкодинг': ['Подготовка'],
  'Софт-скиллы': ['Подготовка'],
}

export function theoryForQuestion(
  question: Pick<Question, 'topic'>,
  articles: TheoryArticle[],
): TheoryArticle[] {
  const topics = new Set([question.topic, ...(TOPIC_ALIASES[question.topic] ?? [])])
  return articles.filter((article) => topics.has(article.topic))
}

/**
 * Navigation target for the «read theory» action on a question card.
 * Returning a topic-only link keeps the transition useful when a topic has
 * multiple articles: the user sees all relevant theory instead of being sent
 * to an arbitrary first article.
 */
export function theoryLinkForQuestion(
  question: Pick<Question, 'topic'>,
  articles: TheoryArticle[],
): PlanLink | undefined {
  return theoryForQuestion(question, articles).length > 0
    ? { mode: 'theory', topic: question.topic }
    : undefined
}
