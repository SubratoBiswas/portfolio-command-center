import { Prisma } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class DecisionsService extends BaseCrudService<Prisma.DecisionWhereInput, Prisma.DecisionCreateInput, Prisma.DecisionUpdateInput, any> {
    constructor(prisma: PrismaService);
}
