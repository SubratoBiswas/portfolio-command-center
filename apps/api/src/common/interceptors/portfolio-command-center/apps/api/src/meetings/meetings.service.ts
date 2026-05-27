import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeetingsService extends BaseCrudService<
  Prisma.MeetingWhereInput,
  Prisma.MeetingCreateInput,
  Prisma.MeetingUpdateInput,
  any
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'meeting');
  }
}
