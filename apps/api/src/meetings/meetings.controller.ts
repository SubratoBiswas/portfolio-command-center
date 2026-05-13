import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly svc: MeetingsService) {}

  @Get()
  findAll(@Query() query: Record<string, string>) {
    // Pass through simple eq filters as Prisma where
    const where = Object.keys(query).length ? (query as any) : undefined;
    return this.svc.findAll(where);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.svc.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.svc.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
