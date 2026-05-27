import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IssuesService extends BaseCrudService<
  Prisma.IssueWhereInput,
  Prisma.IssueCreateInput,
  Prisma.IssueUpdateInput,
  any
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'issue');
  }
}
