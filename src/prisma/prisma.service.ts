import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query'>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger('Prisma');

  constructor() {
    // Запросы отдаются событиями: их можно логировать (PRISMA_LOG_QUERIES=true) и считать в e2e-тестах
    super({ log: [{ emit: 'event', level: 'query' }, 'warn', 'error'] });
  }

  async onModuleInit() {
    if (process.env.PRISMA_LOG_QUERIES === 'true') {
      this.$on('query', (e) => this.logger.debug(`${e.query} — ${e.duration} ms`));
    }
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
