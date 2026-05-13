import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RisksService extends BaseCrudService<
  Prisma.RiskWhereInput,
  Prisma.RiskCreateInput,
  Prisma.RiskUpdateInput,
  any
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'risk', {
      owner: true,
      product: true,
      project: true,
    });
  }

  async heatmap() {
    const rows = await this.prisma.risk.findMany({
      select: { id: true, title: true, severity: true, likelihood: true, impact: true, status: true },
    });
    return rows;
  }
}
