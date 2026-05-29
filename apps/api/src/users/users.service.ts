import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

const SAFE_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  active: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  resourceId: true,
} as const;

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 12;

  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async create(dto: { email: string; password: string; name: string; role?: string }) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException(`${dto.email} is already registered`);
    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
    return this.prisma.user.create({
      data: { email: dto.email, passwordHash, name: dto.name, role: dto.role ?? 'viewer' },
      select: SAFE_SELECT,
    });
  }

  async update(id: string, dto: { name?: string; role?: string; active?: boolean }) {
    await this.findOne(id);
    return this.prisma.user.update({ where: { id }, data: dto, select: SAFE_SELECT });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.update({ where: { id }, data: { active: false }, select: SAFE_SELECT });
  }
}
