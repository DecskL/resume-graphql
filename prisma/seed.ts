import { PrismaClient } from '@prisma/client';
import { profileSeed } from './data/profile.data';

const prisma = new PrismaClient();

const toDate = (ym: string) => new Date(`${ym}-01T00:00:00.000Z`);

/**
 * Идемпотентный сид: профиль пересоздаётся целиком в одной транзакции.
 * Повторный запуск контейнера не плодит дубликаты и подтягивает правки из profile.data.ts.
 */
async function main() {
  const p = profileSeed;

  await prisma.$transaction(async (tx) => {
    await tx.profile.deleteMany({ where: { slug: p.slug } }); // каскадом удаляет связанные записи

    await tx.profile.create({
      data: {
        slug: p.slug,
        name: p.name,
        title: p.title,
        description: p.description,
        location: p.location,
        links: { create: p.links.map((l, position) => ({ ...l, position })) },
        skills: {
          create: p.skills.flatMap((group) =>
            group.names.map((name) => ({ name, category: group.category })),
          ).map((s, position) => ({ ...s, position })),
        },
        experience: {
          create: p.experience.map((e, sortOrder) => ({
            company: e.company,
            position: e.position,
            summary: e.summary,
            startDate: toDate(e.startDate),
            endDate: e.endDate ? toDate(e.endDate) : null,
            sortOrder,
            achievements: { create: e.achievements.map((text, position) => ({ text, position })) },
          })),
        },
        projects: { create: p.projects.map((pr, position) => ({ ...pr, position })) },
      },
    });
  });

  console.log(`Seed: профиль "${p.slug}" загружен`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
