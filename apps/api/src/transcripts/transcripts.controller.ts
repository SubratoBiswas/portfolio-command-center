import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TranscriptsService } from './transcripts.service';

@Controller('transcripts')
export class TranscriptsController {
  constructor(private readonly svc: TranscriptsService) {}

  @Get()
  findAll(@Query() query: Record<string, string>) {
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

  @Post(':id/extract')
  extract(@Param('id') id: string, @Body() body: any) {
    const provider: string = body?.provider ?? 'mock';
    if (body?.sync) {
      return this.svc.extractSync(id, provider);
    }
    return this.svc.enqueueExtraction(id, provider);
  }

  @Get(':id/job-status')
  jobStatus(@Param('id') id: string) {
    return this.svc.getExtractionStatus(id);
  }

  @Post(':id/commit')
  commit(@Param('id') id: string, @Body() body: any) {
    return this.svc.commit(id, body);
  }
}
