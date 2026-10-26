import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Ссылка на профессиональный ресурс' })
export class Link {
  @Field(() => ID) id: number;
  @Field({ description: 'Тип ссылки: github, linkedin, site…' }) kind: string;
  @Field() label: string;
  @Field() url: string;
}

@ObjectType()
export class Skill {
  @Field(() => ID) id: number;
  @Field() name: string;
  @Field() category: string;
}

@ObjectType()
export class Achievement {
  @Field(() => ID) id: number;
  @Field() text: string;
}

@ObjectType({ description: 'Место работы. achievements загружаются батчем через DataLoader' })
export class Experience {
  @Field(() => ID) id: number;
  @Field() company: string;
  @Field() position: string;
  @Field({ nullable: true }) summary?: string;
  @Field() startDate: Date;
  @Field({ nullable: true, description: 'null — работа продолжается' }) endDate?: Date;
  // вычисляемые поля (period, isCurrent, durationMonths) и achievements — в ExperienceResolver
}

@ObjectType()
export class Project {
  @Field(() => ID) id: number;
  @Field() name: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true, description: 'Ссылка на работающий проект' }) url?: string;
  @Field({ nullable: true, description: 'Ссылка на репозиторий' }) repoUrl?: string;
  @Field(() => [String]) stack: string[];
}

@ObjectType({ description: 'Профиль кандидата' })
export class Profile {
  @Field(() => ID) id: number;
  @Field() slug: string;
  @Field() name: string;
  @Field() title: string;
  @Field() description: string;
  @Field({ nullable: true }) location?: string;
  // links, skills, experience, projects — field resolvers в ProfileResolver
}

@ObjectType({ description: 'Навыки, сгруппированные по категориям' })
export class SkillGroup {
  @Field() category: string;
  @Field(() => [Skill]) skills: Skill[];
}

