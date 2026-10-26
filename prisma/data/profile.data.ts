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
  title: 'Fullstack-разработчик',
  description:
    'Довожу продукты от идеи до работы в продакшене: бэкенд, фронтенд, десктоп-клиенты и инфраструктура. ' +
    'С июля 2026 разрабатываю платформу ClubMind для компьютерных клубов — более 10 сервисов на Ruby on Rails, ' +
    'React/TypeScript, C#/.NET, Go и Node.js в Docker. Активно использую Claude Code, при этом сам отвечаю ' +
    'за архитектуру, ревью и качество кода.',
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
      company: 'PadelTech',
      position: 'Fullstack-разработчик',
      summary: 'Стерео-компьютерное зрение для падел-клубов: две IP-камеры на корте → автоматический разбор матча в приложении.',
      startDate: '2026-09',
      endDate: null,
      achievements: [
        'Ревью и слияние pull request’ов AI-агентов (Claude Code) — более 100 PR за сентябрь 2026.',
        'Панель оператора кортов (ops.padeltech.info): React 19, TypeScript, Vite, Tailwind, TanStack Query, zod.',
        'PWA-приложение аналитики матчей (app.padeltech.info): React 19, TypeScript, Zustand.',
        'Backend на FastAPI + MongoDB: приём результатов CV-движка, REST API для приложения и панели.',
        'CI на GitHub Actions: линтеры, проверка типов, тесты, e2e.',
      ],
    },
    {
      company: 'Фриланс (Starprint)',
      position: 'Веб-разработчик',
      summary: 'Сайт типографии полного цикла starprint.pro.',
      startDate: '2026-07',
      endDate: null,
      achievements: [
        'Редизайн сайта: HTML, CSS, JavaScript, система дизайн-токенов, обработка заявок на PHP.',
        'Безопасность: защита форм от CSRF, аудит PHP-кода и .htaccess.',
        'SEO и производительность: sitemap.xml, robots.txt, оптимизация загрузки.',
        'Автотесты на Playwright, перенос контента, деплой.',
      ],
    },
    {
      company: 'ClubMind (собственный проект)',
      position: 'Fullstack-разработчик',
      summary: 'Платформа управления компьютерным клубом на 25 игровых ПК: сессии и тарифы, касса, админ-панель, клиент для ПК, Telegram-бот.',
      startDate: '2026-07',
      endDate: null,
      achievements: [
        'Backend: Ruby on Rails 7 API (Grape, ActionCable), PostgreSQL, Redis, Sidekiq, JWT, Swagger, RSpec.',
        'Админ-панель и веб-касса на React 18 + TypeScript + Vite, настольная версия на Electron.',
        'Фискальный модуль на Node.js + SQLite: чеки, смены, X/Z-отчёты, передача данных в ОФД.',
        'Клиент для игровых ПК на C#/WPF (.NET 8) и агент на Go.',
        'Инфраструктура: Docker Compose, мониторинг Prometheus + Grafana + Loki, резервное копирование.',
        'Мультиклубность, офлайн-режим, импорт данных из SmartShell и Langame.',
        'Более 550 коммитов за 4 месяца в связке с Claude Code.',
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
