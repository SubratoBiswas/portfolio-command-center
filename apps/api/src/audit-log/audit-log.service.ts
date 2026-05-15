import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateAuditLogDto {
  actorId?: string;
  userName?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  objectType: string;
  objectId: string;
  action: string;
  beforeJson?: any;
  afterJson?: any;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({ data: dto });
  }

  async findAll(params: {
    objectType?: string;
    objectId?: string;
    actorId?: string;
    action?: string;
    skip?: number;
    take?: number;
  }) {
    const { objectType, objectId, actorId, action, skip = 0, take = 100 } = params;

    const where: any = {};
    if (objectType) where.objectType = objectType;
    if (objectId) where.objectId = objectId;
    if (actorId) where.actorId = actorId;
    if (action) where.action = action;

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { occurredAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total, skip, take };
  }
}
