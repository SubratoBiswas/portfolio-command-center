import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResourcesService extends BaseCrudService<
  Prisma.ResourceWhereInput,
  Prisma.ResourceCreateInput,
  Prisma.ResourceUpdateInput,
  any
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'resource', { location: true });
  }

  /**
   * Override remove to cascade-delete dependent records before deleting the resource.
   * Order matters: allocations → tasks (null assignee) → manager refs → then resource.
   */
  override async remove(id: string) {
    // Check for hard blockers (required owner FKs that can't be nulled)
    const [ownedProducts, ownedProjects, ownedOpportunities] = await Promise.all([
      this.prisma.product.count({ where: { ownerId: id } }),
      this.prisma.project.count({ where: { ownerId: id } }),
      this.prisma.opportunity.count({ where: { ownerId: id } }),
    ]);

    if (ownedProducts > 0 || ownedProjects > 0 || ownedOpportunities > 0) {
      const items = [
        ownedProducts > 0 ? `${ownedProducts} product(s)` : '',
        ownedProjects > 0 ? `${ownedProjects} project(s)` : '',
        ownedOpportunities > 0 ? `${ownedOpportunities} opportunity(ies)` : '',
      ].filter(Boolean).join(', ');
      throw new BadRequestException(
        `Cannot delete resource: they are the owner of ${items}. Reassign ownership first.`
      );
    }

    // Cascade-delete / null-out safe dependents
    await Promise.all([
      // Delete allocations (required relation)
      this.prisma.resourceAllocation.deleteMany({ where: { resourceId: id } }),
      // Null out optional task assignee
      this.prisma.task.updateMany({ where: { assigneeId: id }, data: { assigneeId: null } }),
      // Null out manager reference on direct reports
      this.prisma.resource.updateMany({ where: { managerId: id }, data: { managerId: null } }),
      // Delete risks owned by this resource
      this.prisma.risk.deleteMany({ where: { ownerId: id } }),
    ]);

    await this.prisma.resource.delete({ where: { id } });
    return { id, deleted: true };
  }
}
