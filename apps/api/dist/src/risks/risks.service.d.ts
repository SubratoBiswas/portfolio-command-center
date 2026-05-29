import { Prisma } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class RisksService extends BaseCrudService<Prisma.RiskWhereInput, Prisma.RiskCreateInput, Prisma.RiskUpdateInput, any> {
    constructor(prisma: PrismaService);
    heatmap(): Promise<{
        id: string;
        status: string;
        title: string;
        severity: string;
        likelihood: number;
        impact: number;
    }[]>;
}
