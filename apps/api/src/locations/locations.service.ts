import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}
  findAll()               { return this.prisma.location.findMany({ orderBy: { name: 'asc' } }); }
  findOne(id: string)     { return this.prisma.location.findUniqueOrThrow({ where: { id } }); }
  create(data: any)       { return this.prisma.location.create({ data }); }
  update(id: string, data: any) { return this.prisma.location.update({ where: { id }, data }); }
  remove(id: string)      { return this.prisma.location.delete({ where: { id } }).then(() => ({ id, deleted: true })); }
}
