import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationsService extends BaseCrudService<
  Prisma.LocationWhereInput,
  Prisma.LocationCreateInput,
  Prisma.LocationUpdateInput,
  any
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'location');
  }

  override async remove(id: string) {
    const resourceCount = await this.prisma.resource.count({ where: { locationId: id } });

    if (resourceCount > 0) {
      throw new BadRequestException(
        `Cannot delete location: ${resourceCount} resource(s) are assigned here. Reassign them first.`
      );
    }

    await this.prisma.location.delete({ where: { id } });
    return { id, deleted: true };
  }
}
