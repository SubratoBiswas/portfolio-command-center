import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OpportunitiesService extends BaseCrudService<
  Prisma.OpportunityWhereInput,
  Prisma.OpportunityCreateInput,
  Prisma.OpportunityUpdateInput,
  any
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'opportunity', {
      client: true,
      product: true,
      owner: true,
    });
  }

  async findStale(staleDays = 10) {
    const cutoff = new Date(Date.now() - staleDays * 24 * 60 * 60 * 1000);
    return this.prisma.opportunity.findMany({
      where: {
        lastInteractionAt: { lt: cutoff },
        stage: { notIn: ['closed_won', 'closed_lost'] },
      },
      include: { client: true, product: true, owner: true },
      orderBy: { lastInteractionAt: 'asc' },
    });
  }

  async pipelineSummary() {
    const rows = await this.prisma.opportunity.groupBy({
      by: ['stage'],
      _sum: { value: true },
      _count: { _all: true },
    });
    return rows.map((r) => ({
      stage: r.stage,
      count: r._count._all,
      value: r._sum.value ?? 0,
    }));
  }
}
