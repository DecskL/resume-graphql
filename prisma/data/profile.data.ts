/**
 * Данные резюме, которыми заполняется база при старте.
 * Отделены от логики сида, чтобы правка резюме не требовала трогать код.
 */
export interface ProfileSeed {
  slug: string;
  name: string;
  title: string;
  description: string;
  location: string;
  links: { kind: string; label: string; url: string }[];
  skills: { category: string; names: string[] }[];
  experience: {
    company: string;
    position: string;
    summary: string;
    startDate: string; // YYYY-MM
    endDate: string | null; // null — по настоящее время
    achievements: string[];
  }[];
  projects: {
    name: string;
    description: string;
    url?: string;
    repoUrl?: string;
    stack: string[];
  }[];
}

export const profileSeed: ProfileSeed = {
  slug: 'mikhail-nikishin',
  name: 'Михаил Никишин',
  title: 'AI-first разработчик / вайбкодер (Claude Code)',
  description:
    'Создаю продукты с помощью AI-агентов (Claude Code) — от идеи до работы в продакшене. Код пишут агенты ' +
    'под моим руководством; моя часть — постановка и декомпозиция задач, проверка результата, развёртывание ' +
    'и сопровождение сервисов. С марта 2026 так создаю платформу ClubMind для компьютерных клубов — более 10 ' +
    'сервисов на Ruby on Rails, React/TypeScript, C#/.NET, Go и Node.js в Docker.',
  location: 'Москва (UTC+3)',
  links: [
    { kind: 'github', label: 'GitHub', url: 'https://github.com/DecskL' },
    { kind: 'site', label: 'PadelTech', url: 'https://padeltech.info' },
    { kind: 'site', label: 'Starprint', url: 'https://starprint.pro' },
  ],
  skills: [
    { category: 'Языки', names: ['TypeScript', 'JavaScript', 'Ruby', 'Python', 'C#', 'Go', 'SQL'] },
    { category: 'Backend', names: ['Node.js', 'NestJS', 'GraphQL', 'Prisma', 'Ruby on Rails', 'FastAPI', 'WebSocket'] },
    { category: 'Frontend', names: ['React', 'Vite', 'Tailwind CSS', 'TanStack Query', 'Electron'] },
    { category: 'Данные', names: ['PostgreSQL', 'Redis', 'MongoDB', 'SQLite'] },
    { category: 'Инфраструктура', names: ['Docker', 'Docker Compose', 'Linux', 'GitHub Actions', 'Prometheus', 'Grafana', 'Loki'] },
    { category: 'Инструменты', names: ['Git', 'Claude Code', 'n8n', 'Playwright', 'RSpec'] },
  ],
  experience: [
    {
      company: 'DrawAI (собственный проект)',
      position: 'AI/ML-инженер (AI-first, Claude Code)',
      summary: 'Проверка строительной рабочей документации по СП и ГОСТ: мультимодальная модель читает штампы и спецификации, правила проверяются кодом, нормы ищутся через RAG.',
      startDate: '2026-10',
      endDate: null,
      achievements: [
        'С помощью AI-агентов дообучил Qwen3.5-4B методом QLoRA: точность чтения спецификаций 0,14 → 0,78, штампы — 1,00.',
        'Детектор условных обозначений на YOLO11 и RAG по нормативам (multilingual-e5-large + FAISS).',
        'Обучение и инференс на собственном GPU-сервере (RTX 4060, CUDA): ставлю эксперименты и слежу за метриками.',
      ],
    },
    {
      company: 'PadelTech',
      position: 'AI-first разработчик (приёмка PR AI-агентов)',
      summary: 'Стерео-компьютерное зрение для падел-клубов: две IP-камеры на корте → автоматический разбор матча в приложении.',
      startDate: '2026-09',
      endDate: null,
      achievements: [
        'Приёмка и слияние pull request’ов от AI-агентов (Claude Code) — более 100 PR за сентябрь 2026.',
        'Части продукта, с которыми работаю: панель оператора кортов (React 19, TypeScript), PWA-аналитика матчей, backend на FastAPI + MongoDB.',
        'CI на GitHub Actions (линтеры, типы, тесты, e2e) — до слияния PR проверяю, что всё зелёное.',
      ],
    },
    {
      company: 'Фриланс',
      position: 'Веб-разработчик (AI-first)',
      summary: 'Сайты на заказ, сделанные с помощью AI-агентов: типография Starprint (starprint.pro) и КФХ «Золино».',
      startDate: '2026-07',
      endDate: null,
      achievements: [
        'Редизайн сайта: HTML, CSS, JavaScript, система дизайн-токенов, обработка заявок на PHP.',
        'Безопасность: защита форм от CSRF, аудит PHP-кода и .htaccess.',
        'SEO и производительность: sitemap.xml, robots.txt, оптимизация загрузки.',
        'Автотесты на Playwright, перенос контента, деплой.',
        'Сайт КФХ «Золино» на Astro + TypeScript, деплой на Cloudflare Pages, e2e-тесты в GitHub Actions.',
      ],
    },
    {
      company: 'ClubMind (собственный проект)',
      position: 'AI-first fullstack-разработчик (Claude Code)',
      summary: 'Платформа управления компьютерным клубом на 25 игровых ПК: сессии и тарифы, касса, админ-панель, клиент для ПК, Telegram-бот.',
      startDate: '2026-03',
      endDate: null,
      achievements: [
        'Создаю с помощью AI-агентов (Claude Code): ставлю задачи, проверяю результат, довожу до продакшена. Март 2026 — прототип на React + Ant Design и агенты управления ПК, с июля — полноценная платформа.',
        'Backend: Ruby on Rails 7 API (Grape, ActionCable), PostgreSQL, Redis, Sidekiq, JWT, Swagger, RSpec.',
        'Админ-панель и веб-касса на React 18 + TypeScript + Vite, настольная версия на Electron.',
        'Фискальный модуль на Node.js + SQLite: чеки, смены, X/Z-отчёты, передача данных в ОФД.',
        'Клиент для игровых ПК на C#/WPF (.NET 8) и агент на Go.',
        'Инфраструктура: Docker Compose, мониторинг Prometheus + Grafana + Loki, резервное копирование.',
        'Мультиклубность, офлайн-режим, импорт данных из SmartShell и Langame.',
        'Более 550 коммитов с июля 2026: код пишут AI-агенты по моим задачам, я отвечаю за постановку, проверку и развёртывание.',
      ],
    },
  ],
  projects: [
    {
      name: 'Resume GraphQL API',
      description: 'Это тестовое задание: резюме, доступное через GraphQL (NestJS, Prisma, PostgreSQL, Docker).',
      repoUrl: 'https://github.com/DecskL/resume-graphql',
      stack: ['TypeScript', 'NestJS', 'GraphQL', 'Prisma', 'PostgreSQL', 'Docker'],
    },
    {
      name: 'ClubMind',
      description: 'Платформа управления компьютерным клубом (код в приватном репозитории).',
      stack: ['Ruby on Rails', 'React', 'TypeScript', 'Node.js', 'C#', 'Go', 'PostgreSQL', 'Docker'],
    },
    {
      name: 'PadelTech',
      description: 'Компьютерное зрение для падел-клубов: разбор матча по двум камерам.',
      url: 'https://padeltech.info',
      stack: ['React', 'TypeScript', 'FastAPI', 'MongoDB'],
    },
    {
      name: 'Starprint',
      description: 'Редизайн сайта типографии.',
      url: 'https://starprint.pro',
      stack: ['HTML', 'CSS', 'JavaScript', 'PHP', 'Playwright'],
    },
  ],
};
