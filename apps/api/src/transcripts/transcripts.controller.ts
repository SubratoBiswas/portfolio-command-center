import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TranscriptsService } from './transcripts.service';
import type { ExtractionResult } from './extraction.providers';

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

  /**
   * Enqueue an async extraction job. Returns immediately with jobId.
   * Poll /:id/job-status to check progress and retrieve results.
   */
  @Post(':id/extract')
  extract(@Param('id') id: string, @Body() body: { provider?: string; sync?: boolean }) {
    if (body?.sync) {
      // Synchronous path — useful for tests or small transcripts
      return this.svc.extractSync(id, body.provider);
    }
    return this.svc.enqueueExtraction(id, body?.provider);
  }

  /**
   * Poll extraction job status and retrieve the result when complete.
   */
  @Get(':id/job-status')
  jobStatus(@Param('id') id: string) {
    return this.svc.getExtractionStatus(id);
  }

  /**
   * Commit reviewed extraction into canonical tables.
   */
  @Post(':id/commit')
  commit(
    @Param('id') id: string,
    @Body()
    body: Partial<ExtractionResult> & {
      defaultOwnerId: string;
      defaultProjectId?: string;
      defaultClientId?: string;
    },
  ) {
    return this.svc.commit(id, body);
  }
}
