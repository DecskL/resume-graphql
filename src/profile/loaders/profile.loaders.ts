import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import type { Achievement, Experience, Link, Project, Skill } from '@prisma/client';
import { ProfileRepository } from '../profile.repository';

/** Раскладывает плоский результат batch-запроса по ключам в том же порядке, что и keys. */
function groupBy<T>(keys: readonly number[], rows: T[], key: (row: T) => number): T[][] {
  const map = new Map<number, T[]>(keys.map((k) => [k, []]));
  for (const row of rows) map.get(key(row))?.push(row);
  return keys.map((k) => map.get(k) ?? []);
}

export interface ProfileLoaders {
  links: DataLoader<number, Link[]>;
  skills: DataLoader<number, Skill[]>;
  experience: DataLoader<number, Experience[]>;
  projects: DataLoader<number, Project[]>;
  achievements: DataLoader<number, Achievement[]>;
}

/**
 * Фабрика DataLoader'ов. Новый набор создаётся на каждый GraphQL-запрос (см. AppModule → context),
 * чтобы кэш не протекал между запросами и пользователями.
 */
@Injectable()
export class ProfileLoadersFactory {
  constructor(private readonly repo: ProfileRepository) {}

  create(): ProfileLoaders {
    return {
      links: new DataLoader(async (ids) => groupBy(ids, await this.repo.findLinksByProfileIds(ids), (r) => r.profileId)),
      skills: new DataLoader(async (ids) => groupBy(ids, await this.repo.findSkillsByProfileIds(ids), (r) => r.profileId)),
      experience: new DataLoader(async (ids) =>
        groupBy(ids, await this.repo.findExperienceByProfileIds(ids), (r) => r.profileId),
      ),
      projects: new DataLoader(async (ids) =>
        groupBy(ids, await this.repo.findProjectsByProfileIds(ids), (r) => r.profileId),
      ),
      achievements: new DataLoader(async (ids) =>
        groupBy(ids, await this.repo.findAchievementsByExperienceIds(ids), (r) => r.experienceId),
      ),
    };
  }
}
