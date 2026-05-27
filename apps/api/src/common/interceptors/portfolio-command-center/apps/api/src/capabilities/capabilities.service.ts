import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CapabilitiesService extends BaseCrudService<
  Prisma.CapabilityWhereInput,
  Prisma.CapabilityCreateInput,
  Prisma.CapabilityUpdateInput,
  any
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'capability');
  }
}
