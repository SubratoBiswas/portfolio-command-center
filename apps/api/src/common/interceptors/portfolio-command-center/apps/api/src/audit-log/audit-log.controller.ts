import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe, Optional } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';

@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  findAll(
    @Query('objectType') objectType?: string,
    @Query('objectId') objectId?: string,
    @Query('actorId') actorId?: string,
    @Query('action') action?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(100), ParseIntPipe) take?: number,
  ) {
    return this.auditLogService.findAll({ objectType, objectId, actorId, action, skip, take });
  }
}
