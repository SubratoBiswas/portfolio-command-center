import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService extends BaseCrudService<
  Prisma.TaskWhereInput,
  Prisma.TaskCreateInput,
  Prisma.TaskUpdateInput,
  any
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'task');
  }
}
