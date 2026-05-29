import { Prisma } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class TasksService extends BaseCrudService<Prisma.TaskWhereInput, Prisma.TaskCreateInput, Prisma.TaskUpdateInput, any> {
    constructor(prisma: PrismaService);
}
