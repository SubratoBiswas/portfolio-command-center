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
import { OpportunitiesService } from './opportunities.service';

@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly svc: OpportunitiesService) {}

  @Get()
  findAll(@Query() query: Record<string, string>) {
    const where = Object.keys(query).length ? (query as any) : undefined;
    return this.svc.findAll(where);
  }

  @Get('stale')
  findStale(@Query('days') days?: string) {
    return this.svc.findStale(days ? parseInt(days, 10) : 10);
  }

  @Get('pipeline-summary')
  pipelineSummary() {
    return this.svc.pipelineSummary();
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
