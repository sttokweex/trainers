# Тренажёр для технических собеседований

Отдельное приложение для подготовки к собеседованиям на frontend и fullstack.
В репозитории находится собственная копия движка, поэтому изменения здесь не
меняют приложение по аудиту.

## Запуск и сборка

```bash
pnpm install
pnpm dev
pnpm build:single:interview
pnpm type-check && pnpm lint && pnpm test
```

GitHub Pages публикует однофайловую сборку из `dist-interview`. Деплой запускается
при push в `main` и вручную через GitHub Actions.

## Структура

- `src/engine/` — интерфейс и движок заданий;
- `src/content/interview/` — вопросы, теория, карточки и план подготовки;
- `src/demos/interview/` — интерактивные демонстрации.

Сборка `build:single:interview` встраивает только пак собеседований в один HTML.
