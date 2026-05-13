import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { ResourcesModule } from './resources/resources.module';
import { ClientsModule } from './clients/clients.module';
import { ProductsModule } from './products/products.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { RisksModule } from './risks/risks.module';
import { IssuesModule } from './issues/issues.module';
import { DecisionsModule } from './decisions/decisions.module';
import { CapabilitiesModule } from './capabilities/capabilities.module';
import { AllocationsModule } from './allocations/allocations.module';
import { MeetingsModule } from './meetings/meetings.module';
import { TranscriptsModule } from './transcripts/transcripts.module';
import { ActionItemsModule } from './action-items/action-items.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST ?? 'localhost',
          port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
          password: process.env.REDIS_PASSWORD,
        },
      }),
    }),
    PrismaModule,
    AuthModule,
    ResourcesModule,
    ClientsModule,
    ProductsModule,
    OpportunitiesModule,
    ProjectsModule,
    TasksModule,
    RisksModule,
    IssuesModule,
    DecisionsModule,
    CapabilitiesModule,
    AllocationsModule,
    MeetingsModule,
    TranscriptsModule,
    ActionItemsModule,
    ReportsModule,
  ],
  providers: [
    // Apply JwtAuthGuard globally — routes opt-out with @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Apply RolesGuard globally — routes opt-in with @Roles(...)
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
