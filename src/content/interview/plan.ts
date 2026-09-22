import type { PlanWeek } from '@/engine/types'

export const plan: PlanWeek[] = [
  { n: 1, t: 'Диагностика и базовый рассказ', goal: 'Понять пробелы и научиться отвечать каркасом за 60–90 секунд.', items: [
    { t: 'Пройти 10 случайных вопросов и отметить пробелы', s: 'Режим «Проверка»', link: { mode: 'questions' } },
    { t: 'Структура ответа и STAR', s: 'Статья + таймер', link: { mode: 'theory', id: 'th-interview' } },
    { t: 'Повторить язык профессии', s: '15 карточек', link: { mode: 'cards', topic: 'Софт-скиллы' } },
  ] },
  { n: 2, t: 'JavaScript, TypeScript и асинхронность', goal: 'Уверенно объяснять runtime, типы и ошибки конкурентности.', items: [
    { t: 'Решить вопросы JavaScript и TypeScript уровня middle', s: 'Особенно output и code', link: { mode: 'questions', topic: 'JavaScript' } },
    { t: 'Освежить event loop и async', s: 'Теория', link: { mode: 'theory', topic: 'JavaScript' } },
    { t: 'Сделать флеш-сет по TS и JS', s: 'Термины на английском', link: { mode: 'cards', topic: 'TypeScript' } },
  ] },
  { n: 3, t: 'Браузер, React и производительность', goal: 'Связать рендер, сеть и пользовательские метрики.', items: [
    { t: 'Разобрать render pipeline и hydration', s: 'Статьи React и Browser', link: { mode: 'theory', topic: 'React' } },
    { t: 'Пройти Web Vitals и бюджет страницы', s: 'Измерение → гипотеза → guardrail', link: { mode: 'theory', id: 'th-performance' } },
    { t: 'Поиграть с bundle и render demos', s: 'Практикум', link: { mode: 'tools', topic: 'Производительность и Web Vitals' } },
  ] },
  { n: 4, t: 'API, GraphQL и данные', goal: 'Отвечать про контракты, N+1, кеширование и realtime.', items: [
    { t: 'Решить блок API и GraphQL', s: 'Выбор транспорта и схемы', link: { mode: 'questions', topic: 'GraphQL и realtime' } },
    { t: 'Прочитать GraphQL/realtime', s: 'Схема, DataLoader, offsets', link: { mode: 'theory', id: 'th-graphql' } },
    { t: 'Потренировать query cache', s: 'Интерактив', link: { mode: 'tools', id: 'tool-graphql' } },
  ] },
  { n: 5, t: 'Надёжность и системный дизайн', goal: 'Проектировать с SLO, отказами, запасом и наблюдаемостью.', items: [
    { t: 'Решить capacity и retry вопросы', s: 'Считать допущения вслух', link: { mode: 'questions', topic: 'Надёжность и эксплуатация' } },
    { t: 'Собрать систему из блоков', s: 'Планирование нагрузки', link: { mode: 'tools', id: 'tool-capacity' } },
    { t: 'Разобрать SLO и инциденты', s: 'Error budget и rollback', link: { mode: 'theory', id: 'th-reliability' } },
  ] },
  { n: 6, t: 'Git, CI/CD и контейнеры', goal: 'Показать, что вы умеете доставлять и безопасно откатывать изменения.', items: [
    { t: 'Ответить про pipeline и rollout', s: 'Canary, blue-green, миграции', link: { mode: 'questions', topic: 'Git и CI/CD' } },
    { t: 'Потренировать граф релиза', s: 'Практикум', link: { mode: 'tools', id: 'tool-git-release' } },
    { t: 'Карточки контейнеров и probes', s: 'Runtime vocabulary', link: { mode: 'cards', topic: 'Контейнеры и облако' } },
  ] },
  { n: 7, t: 'Коммуникация и проектный deep dive', goal: 'Перевести технические решения в язык результата и trade-off.', items: [
    { t: 'Подготовить пять историй STAR', s: 'Ошибка, конфликт, инициатива, обучение, сложная задача', link: { mode: 'theory', id: 'th-interview' } },
    { t: 'Рассказать проект за две минуты', s: 'Контекст → решение → цифры → рефлексия', link: { mode: 'theory', id: 'th-delivery' } },
    { t: 'Пройти delivery вопросы', s: 'Оценка и приоритеты', link: { mode: 'questions', topic: 'Продукт и delivery' } },
  ] },
  { n: 8, t: 'Финальная симуляция', goal: 'Собрать смешанный прогон и закрыть последние темы.', items: [
    { t: 'Случайный прогон без подсказок', s: '25 вопросов, отметьте повторить', link: { mode: 'questions' } },
    { t: 'Три ответа с таймером', s: 'Теория → пример → границы', link: { mode: 'tools', id: 'tool-incident' } },
    { t: 'Сформулировать вопросы работодателю', s: 'Команда, процесс, ожидания', link: { mode: 'theory', id: 'th-interview' } },
  ] },
]
