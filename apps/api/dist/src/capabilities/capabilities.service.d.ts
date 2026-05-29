import { Prisma } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class CapabilitiesService extends BaseCrudService<Prisma.CapabilityWhereInput, Prisma.CapabilityCreateInput, Prisma.CapabilityUpdateInput, any> {
    constructor(prisma: PrismaService);
}
