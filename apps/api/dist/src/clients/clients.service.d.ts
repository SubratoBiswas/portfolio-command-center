import { Prisma } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ClientsService extends BaseCrudService<Prisma.ClientWhereInput, Prisma.ClientCreateInput, Prisma.ClientUpdateInput, any> {
    constructor(prisma: PrismaService);
}
