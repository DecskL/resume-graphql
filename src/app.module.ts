import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileLoadersFactory } from './profile/loaders/profile.loaders';
import { ProfileModule } from './profile/profile.module';
import type { GraphQLContext } from './profile/graphql-context';

@Module({
  imports: [
    PrismaModule,
    ProfileModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ProfileModule],
      inject: [ProfileLoadersFactory],
      useFactory: (loaders: ProfileLoadersFactory) => ({
        // в разработке схема пишется в schema.gql (удобно смотреть в git), в продакшене строится в памяти
        autoSchemaFile: process.env.NODE_ENV === 'production' ? true : join(process.cwd(), 'schema.gql'),
        sortSchema: true,
        // Apollo Sandbox открыт и в продакшене — по условию задания через него смотрят резюме
        playground: false,
        introspection: true,
        includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
        plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
        context: (): GraphQLContext => ({ loaders: loaders.create() }),
      }),
    }),
  ],
  controllers: [HealthController],
})
export class AppModule {}
