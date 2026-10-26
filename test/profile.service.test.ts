import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ProfileService } from '../src/profile/profile.service';

const service = new ProfileService({} as never);
const d = (s: string) => new Date(`${s}-01T00:00:00.000Z`);

test('durationMonths считает месяцы включительно, как hh.ru', () => {
  assert.equal(service.durationMonths({ startDate: d('2026-07'), endDate: null }, d('2026-10')), 4);
  assert.equal(service.durationMonths({ startDate: d('2025-11'), endDate: d('2026-02') }), 4);
});

test('formatPeriod и isCurrent для текущей работы', () => {
  const e = { startDate: d('2026-09'), endDate: null };
  assert.equal(service.formatPeriod(e), 'Сентябрь 2026 — по настоящее время');
  assert.equal(service.isCurrent(e), true);
});

test('groupSkills сохраняет порядок категорий, filterSkills не зависит от регистра', () => {
  const skills = [
    { id: 1, profileId: 1, name: 'TS', category: 'Языки', position: 0 },
    { id: 2, profileId: 1, name: 'NestJS', category: 'Backend', position: 1 },
    { id: 3, profileId: 1, name: 'Go', category: 'Языки', position: 2 },
  ];
  assert.deepEqual(service.groupSkills(skills).map((g) => [g.category, g.skills.length]), [['Языки', 2], ['Backend', 1]]);
  assert.deepEqual(service.filterSkills(skills, 'backend').map((s) => s.name), ['NestJS']);
});
