/**
 * e2e: поднимает приложение на реальной БД (нужны DATABASE_URL, миграции и сид)
 * и проверяет API целиком, включая количество SQL-запросов на вложенный запрос.
 */
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

let app: INestApplication;
let url: string;
let sqlCount = 0;

before(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = moduleRef.createNestApplication();
  await app.listen(0);
  url = `${await app.getUrl()}/graphql`.replace('[::1]', 'localhost');
  app.get(PrismaService).$on('query', () => sqlCount++);
});

after(() => app.close());

async function gql(query: string) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return res.json() as Promise<{ data?: any; errors?: { message: string; extensions?: { code?: string } }[] }>;
}

const FULL_QUERY = `{
  profile {
    name description
    links { url }
    skills { name }
    skillGroups { category }
    experience { company position period achievements { text } }
    projects { name url repoUrl }
  }
}`;

test('пример запроса из задания возвращает профиль, навыки, опыт и проекты', async () => {
  const { data, errors } = await gql(
    '{ profile { name description skills { name } experience { company position } projects { name } } }',
  );
  assert.equal(errors, undefined);
  assert.equal(data.profile.name, 'Михаил Никишин');
  assert.ok(data.profile.skills.length > 0);
  assert.ok(data.profile.experience.length > 0);
  assert.ok(data.profile.projects.length > 0);
});

test('вложенные поля грузятся батчами: число SQL-запросов не зависит от количества мест работы', async () => {
  sqlCount = 0;
  const { data, errors } = await gql(FULL_QUERY);
  assert.equal(errors, undefined);
  assert.ok(data.profile.experience.length >= 2, 'для проверки нужно несколько мест работы');
  assert.ok(data.profile.experience.every((e: any) => e.achievements.length > 0));
  // profile + links + skills (общий для skills и skillGroups) + experience + projects + achievements
  assert.equal(sqlCount, 6);
});

test('запрашиваются только те связи, что есть в query', async () => {
  sqlCount = 0;
  await gql('{ profile { name skills { name } } }');
  assert.equal(sqlCount, 2);
});

test('несуществующий профиль — ошибка NOT_FOUND', async () => {
  const { errors } = await gql('{ profile(slug: "nope") { name } }');
  assert.equal(errors?.[0]?.extensions?.code, 'NOT_FOUND');
});
