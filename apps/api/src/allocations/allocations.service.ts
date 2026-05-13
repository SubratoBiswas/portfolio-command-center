import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AllocationsService extends BaseCrudService<
  Prisma.ResourceAllocationWhereInput,
  Prisma.ResourceAllocationCreateInput,
  Prisma.ResourceAllocationUpdateInput,
  any
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'resourceAllocation');
  }
}
