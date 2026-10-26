import { Args, Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import type { GraphQLContext } from './graphql-context';
import { Experience, Link, Profile, Project, Skill, SkillGroup } from './models/profile.models';
import { ProfileService } from './profile.service';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(private readonly service: ProfileService) {}

  @Query(() => Profile, { description: 'Профиль кандидата. Без slug возвращается основной профиль' })
  profile(@Args('slug', { nullable: true }) slug?: string) {
    return this.service.getProfile(slug);
  }

  @Query(() => [Profile], { description: 'Все профили (пример списка, где DataLoader убирает N+1)' })
  profiles() {
    return this.service.listProfiles();
  }

  @ResolveField(() => [Link])
  links(@Parent() p: Profile, @Context() ctx: GraphQLContext) {
    return ctx.loaders.links.load(p.id);
  }

  @ResolveField(() => [Skill])
  async skills(
    @Parent() p: Profile,
    @Context() ctx: GraphQLContext,
    @Args('category', { nullable: true, description: 'Фильтр по категории, например "Backend"' }) category?: string,
  ) {
    return this.service.filterSkills(await ctx.loaders.skills.load(p.id), category);
  }

  @ResolveField(() => [SkillGroup])
  async skillGroups(@Parent() p: Profile, @Context() ctx: GraphQLContext) {
    // тот же loader, что и у skills: при запросе обоих полей к БД уходит один запрос
    return this.service.groupSkills(await ctx.loaders.skills.load(p.id));
  }

  @ResolveField(() => [Experience])
  experience(@Parent() p: Profile, @Context() ctx: GraphQLContext) {
    return ctx.loaders.experience.load(p.id);
  }

  @ResolveField(() => [Project])
  projects(@Parent() p: Profile, @Context() ctx: GraphQLContext) {
    return ctx.loaders.projects.load(p.id);
  }
}
