import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TranscriptsService } from './transcripts.service';
import { ProviderRegistry } from './extraction.providers';

@Controller('transcripts')
export class TranscriptsController {
  constructor(
    private readonly svc: TranscriptsService,
    private readonly providers: ProviderRegistry,
  ) {}

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
   * Direct text extraction — no transcript record needed.
   * POST /transcripts/extract-text  { text: string, provider?: string }
   */
  @Post('extract-text')
  async extractText(@Body() body: { text: string; provider?: string }) {
    const provider = this.providers.pick(body.provider ?? 'mock');
    const result = await provider.extract(body.text);
    return result;
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
