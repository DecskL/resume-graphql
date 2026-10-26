import { Injectable } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import type { Experience, Profile, Skill } from '@prisma/client';
import { ProfileRepository } from './profile.repository';

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

/** Бизнес-логика профиля: выбор профиля по умолчанию, группировка навыков, расчёт периодов работы. */
@Injectable()
export class ProfileService {
  constructor(private readonly repo: ProfileRepository) {}

  async getProfile(slug?: string): Promise<Profile> {
    const profile = slug ? await this.repo.findBySlug(slug) : await this.repo.findFirst();
    if (!profile) {
      throw new GraphQLError(slug ? `Профиль "${slug}" не найден` : 'Профиль ещё не создан', {
        extensions: { code: 'NOT_FOUND' },
      });
    }
    return profile;
  }

  listProfiles(): Promise<Profile[]> {
    return this.repo.findAll();
  }

  filterSkills(skills: Skill[], category?: string): Skill[] {
    if (!category) return skills;
    const c = category.toLowerCase();
    return skills.filter((s) => s.category.toLowerCase() === c);
  }

  groupSkills(skills: Skill[]): { category: string; skills: Skill[] }[] {
    const groups = new Map<string, Skill[]>();
    for (const s of skills) groups.set(s.category, [...(groups.get(s.category) ?? []), s]);
    return [...groups].map(([category, items]) => ({ category, skills: items }));
  }

  isCurrent(e: Pick<Experience, 'endDate'>): boolean {
    return e.endDate === null;
  }

  /** Число полных месяцев с учётом начального (июль–октябрь = 4 месяца, как на hh.ru). */
  durationMonths(e: Pick<Experience, 'startDate' | 'endDate'>, now = new Date()): number {
    const end = e.endDate ?? now;
    return (end.getUTCFullYear() - e.startDate.getUTCFullYear()) * 12 + end.getUTCMonth() - e.startDate.getUTCMonth() + 1;
  }

  formatPeriod(e: Pick<Experience, 'startDate' | 'endDate'>): string {
    const fmt = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    return `${fmt(e.startDate)} — ${e.endDate ? fmt(e.endDate) : 'по настоящее время'}`;
  }
}
