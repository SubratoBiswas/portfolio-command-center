import { Prisma } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ProjectsService extends BaseCrudService<Prisma.ProjectWhereInput, Prisma.ProjectCreateInput, Prisma.ProjectUpdateInput, any> {
    constructor(prisma: PrismaService);
}
