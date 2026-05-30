import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { ProviderRegistry } from './extraction.providers';
import { EXTRACTION_QUEUE } from './extraction.queue';

@Processor(EXTRACTION_QUEUE)
export class ExtractionProcessor {
  private readonly logger = new Logger(ExtractionProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providers: ProviderRegistry,
  ) {}

  @Process('extract')
  async handleExtract(job: Job<{ transcriptId: string; provider: string }>) {
    const { transcriptId, provider: providerName } = job.data;
    this.logger.log(`Processing extraction job ${job.id} for transcript ${transcriptId}`);

    const transcript = await this.prisma.transcript.findUnique({ where: { id: transcriptId } });
    if (!transcript) {
      this.logger.error(`Transcript ${transcriptId} not found — skipping`);
      return;
    }

    const provider = this.providers.pick(providerName);

    await this.prisma.extractionJob.upsert({
      where: { transcriptId },
      create: { transcriptId, provider: provider.name, status: 'running', startedAt: new Date() },
      update: {
        provider: provider.name,
        status: 'running',
        startedAt: new Date(),
        completedAt: null,
        errorMessage: null,
        resultJson: null,
      },
    });

    await this.prisma.transcript.update({ where: { id: transcriptId }, data: { status: 'processing' } });

    try {
      await job.progress(10);
      const result = await provider.extract(transcript.rawText);
      await job.progress(90);

      await this.prisma.extractionJob.update({
        where: { transcriptId },
        data: { status: 'succeeded', completedAt: new Date(), resultJson: result as any },
      });
      await this.prisma.transcript.update({ where: { id: transcriptId }, data: { status: 'extracted' } });
      await job.progress(100);
      this.logger.log(`Extraction job ${job.id} succeeded for transcript ${transcriptId}`);
      return result;
    } catch (err) {
      this.logger.error(`Extraction job ${job.id} failed: ${err?.message}`);
      await this.prisma.extractionJob.update({
        where: { transcriptId },
        data: { status: 'failed', completedAt: new Date(), errorMessage: err?.message ?? String(err) },
      });
      await this.prisma.transcript.update({ where: { id: transcriptId }, data: { status: 'uploaded' } });
      throw err;
    }
  }
}
