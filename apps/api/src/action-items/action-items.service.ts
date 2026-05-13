import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActionItemsService extends BaseCrudService<
  Prisma.ActionItemWhereInput,
  Prisma.ActionItemCreateInput,
  Prisma.ActionItemUpdateInput,
  any
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'actionItem');
  }
}
