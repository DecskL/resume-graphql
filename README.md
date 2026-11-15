# Resume GraphQL API

Моё резюме в виде GraphQL API: **TypeScript · NestJS · Prisma · PostgreSQL · GraphQL (Apollo) · Docker**.
Через Apollo Sandbox можно получить профиль, навыки, опыт работы с достижениями и проекты.

## Запуск

С нуля одной командой (нужен только Docker):

```bash
docker compose up --build
```

Затем откройте http://localhost:3000/graphql — там Apollo Sandbox. Корень `/` перенаправляет туда же.
При старте контейнер выполняет `npm run start:prod`: миграции (`prisma migrate deploy`), сид (`node dist/prisma/seed.js`) и запуск сервера (`node dist/src/main.js`).

Без Docker нужны **Node.js 22** и **PostgreSQL 16**:

```bash
cp .env.example .env   # при необходимости поправьте DATABASE_URL
npm ci
npx prisma migrate deploy && npx prisma db seed
npm run build && npm start
```

Переменные окружения:

| Переменная | Назначение |
|---|---|
| `DATABASE_URL` | строка подключения к PostgreSQL, обязательна (читает Prisma) |
| `PORT` | порт HTTP-сервера, по умолчанию `3000` |
| `NODE_ENV` | `production`: схема строится в памяти, стек в ошибках не отдаётся; иначе схема пишется в `schema.gql` |
| `PRISMA_LOG_QUERIES` | `true`: логировать SQL-запросы Prisma |
| `POSTGRES_USER`, `POSTGRES_PASSWORD` | только для `docker-compose.yml`: учётка БД, из них собирается `DATABASE_URL` контейнера |

Значения `app`/`app` по умолчанию в `docker-compose.yml` и `.env.example` только для разработки. Для сервера задайте свои.

| Команда | Что делает |
|---|---|
| `npm run start:dev` | режим разработки с hot reload |
| `npm test` | unit-тесты бизнес-логики (без БД) |
| `npm run test:e2e` | e2e на реальной БД: API целиком и число SQL-запросов |
| `npm run typecheck` | проверка типов |

Для `npm run test:e2e` нужны `DATABASE_URL` с применёнными миграциями и засеянной базой: `npx prisma migrate deploy && npx prisma db seed`, как в CI.

Healthcheck: `GET /health`.

**Демо:** https://resume-graphql.onrender.com/graphql — Sandbox открывается с готовым запросом, достаточно нажать **Run**. Это бесплатный тариф Render, поэтому после простоя первый запрос может идти около минуты.


## Пример запроса

```graphql
query {
  profile {
    name
    title
    description
    links { label url }
    skills(category: "Backend") { name }
    skillGroups { category skills { name } }
    experience {
      company
      position
      period          # «Июль 2026 — по настоящее время»
      durationMonths
      isCurrent
      achievements { text }
    }
    projects { name url repoUrl stack }
  }
}
```

## Архитектура и решения

```
src/
├─ prisma/                 PrismaService — подключение к БД, глобальный модуль
├─ profile/
│  ├─ models/              GraphQL-типы (code-first)
│  ├─ profile.repository   доступ к данным: только запросы Prisma
│  ├─ profile.service      бизнес-логика: выбор профиля, группировка навыков, периоды работы
│  ├─ loaders/             DataLoader'ы — батчинг вложенных полей
│  ├─ profile.resolver     Query.profile / Query.profiles и поля профиля
│  └─ experience.resolver  достижения и вычисляемые поля опыта работы
└─ health.controller       /health и редирект на Sandbox
prisma/
├─ schema.prisma, migrations/
├─ data/profile.data.ts    содержимое резюме
└─ seed.ts                 идемпотентное заполнение базы
test/                      unit- и e2e-тесты
```

**Разделение ответственности.** Резолверы только связывают GraphQL с сервисом и загрузчиками. Логика (какой профиль отдавать по умолчанию, как считать стаж и группировать навыки) живёт в `ProfileService` и покрыта unit-тестами без базы. Все запросы к БД собраны в `ProfileRepository`, поэтому замена ORM или источника данных затронет один файл.

**Code-first GraphQL.** Схема генерируется из TypeScript-классов (`schema.gql`). Типы API и кода не расходятся, а описания полей попадают в документацию Sandbox.

**Вложенные данные без N+1.** Связи (`links`, `skills`, `experience`, `projects`, `experience.achievements`) отдаются field-резолверами через DataLoader:
- запрашиваются только те поля, которые пришли в query;
- одинаковые обращения внутри запроса склеиваются в один `WHERE … IN (…)`;
- полный запрос выше — это 6 SQL-запросов при любом числе мест работы и профилей. Это закреплено e2e-тестом, а сами запросы видно в логе с `PRISMA_LOG_QUERIES=true`. При `include` во всех резолверах база получала бы одно и то же вне зависимости от запрошенных полей, а для `profiles` число запросов росло бы линейно.
- `skills` и `skillGroups` используют один загрузчик, поэтому вместе обходятся одним запросом.

Загрузчики создаются заново на каждый запрос (`context` в `AppModule`), чтобы кэш не жил дольше запроса.

**Модель данных.**
- Достижения вынесены в отдельную таблицу, а не в массив строк. Так у них есть порядок и они грузятся батчем, как и остальные связи.
- Поле `position` — это должность. Порядок вывода задаёт `sortOrder` (по возрастанию, при равенстве — по дате начала, от новых к старым).
- `endDate = null` означает текущее место работы, а `isCurrent`, `period` и `durationMonths` вычисляются, а не хранятся.
- На внешних ключах есть индексы, все связи с `onDelete: Cascade`.

**Инициализация БД.** Сид идемпотентный: в одной транзакции профиль удаляется по `slug` и создаётся заново вместе со связями. Поэтому перезапуск контейнера не плодит дубликаты и подхватывает правки из `profile.data.ts`. Данные резюме отделены от кода сида.

**Sandbox в продакшене.** По условию задания API смотрят через Apollo Sandbox, поэтому introspection и встроенный Sandbox включены всегда. В настоящем продакшене я бы закрыл их флагом окружения.

**Docker.** Образ собирается в два этапа. На первом ставятся все зависимости и TypeScript компилируется в JS, включая сид. На втором остаются только production-зависимости и скомпилированный код, без ts-node и TypeScript. Приложение работает от непривилегированного пользователя `node`, а `HEALTHCHECK` опрашивает `/health`. Поэтому `prisma` (CLI для `migrate deploy`) лежит в `dependencies`. В продакшене схема GraphQL строится в памяти, а в разработке пишется в `schema.gql`, чтобы изменения API было видно в диффах.

**Деплой и CI.**
- `render.yaml` — Blueprint для Render: веб-сервис из Dockerfile и PostgreSQL, `DATABASE_URL` подставляется автоматически.
- GitHub Actions: проверка типов, сборка, unit- и e2e-тесты на чистом Postgres, а отдельной задачей `docker compose up` с нуля и запрос к API.
