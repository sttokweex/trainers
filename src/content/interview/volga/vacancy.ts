export type VacancySection = {
  title: string
  requirements: string[]
}

/** Vacancy brief supplied by the user for reference during interview practice. */
export const vacancySections: VacancySection[] = [
  {
    title: 'Ядро',
    requirements: [
      'React 19: хуки, паттерны композиции, Suspense.',
      'Vite: сборка и dev-сервер.',
      'TypeScript: интерфейсы, дженерики, типизация API-контрактов.',
      'Плюсом будет опыт работы с zod для валидации на границах API.',
    ],
  },
  {
    title: 'Стилизация',
    requirements: [
      'Tailwind CSS 4.',
      'CVA (class-variance-authority) для вариативных компонентов.',
      'Понимание, когда уместны CSS Modules.',
    ],
  },
  {
    title: 'Работа с данными',
    requirements: [
      'TanStack React Query: кеширование, инвалидация, оптимистичные обновления.',
      'ky в качестве HTTP-клиента.',
      'Zustand для организации клиентского состояния и разделения server state / client state.',
    ],
  },
  {
    title: 'Архитектура и интеграции',
    requirements: [
      'Опыт разработки SPA «в бою»: роутинг, guards, state persistence.',
      'Интеграция хотя бы с одной платформой: Telegram Mini Apps SDK, VK Mini Apps SDK или React Native WebView bridge.',
      'Понимание разных контрактов хост-платформы: авторизация, viewport, нативные жесты.',
    ],
  },
  {
    title: 'Оптимизация и сеть',
    requirements: [
      'Lazy loading и code splitting: route-based / component-based.',
      'Профилирование рендеринга через React DevTools Profiler.',
      'Осознанное применение memo / useMemo / useCallback, а не «на автомате».',
      'REST и GraphQL на клиенте; работа с CORS.',
      'JWT: хранение, refresh-flow и обработка 401.',
    ],
  },
  {
    title: 'Вёрстка и доступность',
    requirements: [
      'Работа по макетам в Figma и адаптивная вёрстка.',
      'Базовые принципы a11y: семантика, контраст, focus management и ARIA по необходимости.',
    ],
  },
  {
    title: 'Качество кода и доставка',
    requirements: [
      'Unit- и component-тесты: Vitest, React Testing Library.',
      'Code review и работа с ESLint / Prettier в командном стандарте.',
      'Понимание frontend CI/CD: сборка и deploy preview.',
    ],
  },
  {
    title: 'Специфика Mini Apps — преимущество',
    requirements: [
      'Опыт именно в экосистеме Telegram или VK.',
      'Знание ограничений: отсутствие полноценных cookies и особенности back button.',
    ],
  },
  {
    title: 'Коммуникация и команда',
    requirements: [
      'Работа в команде и конструктивное взаимодействие с дизайнерами, backend-разработчиками и PM.',
      'Умение объяснять техническое решение нетехническому человеку.',
      'Уточнение вводных до начала работы, если ТЗ неполное или неоднозначное.',
      'Умение аргументировать техническую позицию и слышать чужие аргументы.',
    ],
  },
  {
    title: 'Самостоятельность и организация',
    requirements: [
      'Гибкость при изменении бизнес-требований.',
      'Самостоятельное изучение незнакомой кодовой базы или библиотеки.',
      'Любознательность и интерес к новым подходам.',
      'Дисциплина в таск-трекерах и трекинге времени.',
      'Оценка задач и заблаговременное сообщение о рисках и задержках.',
    ],
  },
  {
    title: 'Ответственность и культура',
    requirements: [
      'Проверка своей работы перед сдачей, не перекладывая это полностью на QA.',
      'Спокойное отношение к обратной связи, ревью и правкам.',
      'Чувство юмора и комфортное неформальное общение с командой.',
    ],
  },
]
