import { Prisma } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ResourcesService extends BaseCrudService<Prisma.ResourceWhereInput, Prisma.ResourceCreateInput, Prisma.ResourceUpdateInput, any> {
    constructor(prisma: PrismaService);
}
