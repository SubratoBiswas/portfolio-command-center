import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService extends BaseCrudService<
  Prisma.ProductWhereInput,
  Prisma.ProductCreateInput,
  Prisma.ProductUpdateInput,
  any
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'product');
  }
}
