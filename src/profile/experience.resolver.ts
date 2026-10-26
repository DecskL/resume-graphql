import { Context, Int, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import type { Experience as ExperienceRow } from '@prisma/client';
import type { GraphQLContext } from './graphql-context';
import { Achievement, Experience } from './models/profile.models';
import { ProfileService } from './profile.service';

@Resolver(() => Experience)
export class ExperienceResolver {
  constructor(private readonly service: ProfileService) {}

  @ResolveField(() => [Achievement])
  achievements(@Parent() e: ExperienceRow, @Context() ctx: GraphQLContext) {
    return ctx.loaders.achievements.load(e.id);
  }

  @ResolveField(() => Boolean)
  isCurrent(@Parent() e: ExperienceRow) {
    return this.service.isCurrent(e);
  }

  @ResolveField(() => Int, { description: 'Длительность в месяцах' })
  durationMonths(@Parent() e: ExperienceRow) {
    return this.service.durationMonths(e);
  }

  @ResolveField(() => String, { description: 'Период работы, например «Июль 2026 — по настоящее время»' })
  period(@Parent() e: ExperienceRow) {
    return this.service.formatPeriod(e);
  }
}
