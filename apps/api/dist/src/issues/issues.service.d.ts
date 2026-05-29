import { Prisma } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class IssuesService extends BaseCrudService<Prisma.IssueWhereInput, Prisma.IssueCreateInput, Prisma.IssueUpdateInput, any> {
    constructor(prisma: PrismaService);
}
