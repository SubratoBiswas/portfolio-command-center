import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Generic Prisma CRUD wrapper. Each entity module instantiates this
 * by passing its delegate name (e.g. `prisma.resource`). Keeps per-entity
 * services to ~10 lines.
 */
export class BaseCrudService<TWhere = any, TCreate = any, TUpdate = any, TInclude = any> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly delegateName: keyof PrismaService,
    protected readonly defaultInclude?: TInclude,
  ) {}

  protected get delegate(): any {
    return (this.prisma as any)[this.delegateName];
  }

  async findAll(where?: TWhere, include?: TInclude) {
    return this.delegate.findMany({
      where,
      include: include ?? this.defaultInclude,
      orderBy: { createdAt: 'desc' } as any,
    }).catch(() =>
      // Fallback when entity lacks createdAt
      this.delegate.findMany({ where, include: include ?? this.defaultInclude }),
    );
  }

  async findOne(id: string, include?: TInclude) {
    const row = await this.delegate.findUnique({
      where: { id },
      include: include ?? this.defaultInclude,
    });
    if (!row) throw new NotFoundException(`${String(this.delegateName)} ${id} not found`);
    return row;
  }

  async create(data: TCreate) {
    return this.delegate.create({ data, include: this.defaultInclude });
  }

  async update(id: string, data: TUpdate) {
    return this.delegate.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });
  }

  async remove(id: string) {
    await this.delegate.delete({ where: { id } });
    return { id, deleted: true };
  }

  async count(where?: TWhere) {
    return this.delegate.count({ where });
  }
}
