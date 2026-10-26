import { Injectable } from '@nestjs/common';
import type { Achievement, Experience, Link, Profile, Project, Skill } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Слой доступа к данным. Только запросы к БД, без бизнес-логики.
 * Методы *ByXIds принимают массив ключей — их вызывают DataLoader'ы,
 * поэтому любое число вложенных полей превращается в один запрос на тип сущности.
 */
@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findBySlug(slug: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({ where: { slug } });
  }

  findFirst(): Promise<Profile | null> {
    return this.prisma.profile.findFirst({ orderBy: { id: 'asc' } });
  }

  findAll(): Promise<Profile[]> {
    return this.prisma.profile.findMany({ orderBy: { id: 'asc' } });
  }

  findLinksByProfileIds(ids: readonly number[]): Promise<Link[]> {
    return this.prisma.link.findMany({ where: { profileId: { in: [...ids] } }, orderBy: { position: 'asc' } });
  }

  findSkillsByProfileIds(ids: readonly number[]): Promise<Skill[]> {
    return this.prisma.skill.findMany({ where: { profileId: { in: [...ids] } }, orderBy: { position: 'asc' } });
  }

  findExperienceByProfileIds(ids: readonly number[]): Promise<Experience[]> {
    return this.prisma.experience.findMany({
      where: { profileId: { in: [...ids] } },
      orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
    });
  }

  findProjectsByProfileIds(ids: readonly number[]): Promise<Project[]> {
    return this.prisma.project.findMany({ where: { profileId: { in: [...ids] } }, orderBy: { position: 'asc' } });
  }

  findAchievementsByExperienceIds(ids: readonly number[]): Promise<Achievement[]> {
    return this.prisma.achievement.findMany({
      where: { experienceId: { in: [...ids] } },
      orderBy: { position: 'asc' },
    });
  }
}
