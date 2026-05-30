import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Logger } from '@nestjs/common';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProviderRegistry } from './extraction.providers';
import { EXTRACTION_QUEUE } from './extraction.queue';

@Injectable()
export class TranscriptsService extends BaseCrudService {
  private readonly logger = new Logger(TranscriptsService.name);

  constructor(
    prisma: PrismaService,
    private readonly providers: ProviderRegistry,
    @InjectQueue(EXTRACTION_QUEUE) private readonly extractionQueue: Queue,
  ) {
    super(prisma, 'transcript', { extractionJob: true, meeting: true });
  }

  async enqueueExtraction(transcriptId: string, provider: string) {
    const transcript = await this.prisma.transcript.findUnique({ where: { id: transcriptId } });
    if (!transcript) throw new NotFoundException(`Transcript ${transcriptId} not found`);

    const job = await this.extractionQueue.add('extract', { transcriptId, provider }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: false,
      removeOnFail: false,
    });
    this.logger.log(`Enqueued extraction job ${job.id} for transcript ${transcriptId}`);
    await this.prisma.transcript.update({ where: { id: transcriptId }, data: { status: 'processing' } });
    return { jobId: job.id, status: 'queued' };
  }

  async getExtractionStatus(transcriptId: string) {
    const dbJob = await this.prisma.extractionJob.findUnique({ where: { transcriptId } });
    if (!dbJob) return { status: 'not_started' };
    return {
      status: dbJob.status,
      result: dbJob.status === 'succeeded' ? dbJob.resultJson : undefined,
      error: dbJob.errorMessage ?? undefined,
    };
  }

  async extractSync(transcriptId: string, providerName: string) {
    const transcript = await this.prisma.transcript.findUnique({ where: { id: transcriptId } });
    if (!transcript) throw new NotFoundException(`Transcript ${transcriptId} not found`);

    const provider = this.providers.pick(providerName);
    this.logger.log(`Sync extraction ${transcriptId} with provider=${provider.name}`);

    const job = await this.prisma.extractionJob.upsert({
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

    try {
      const result = await provider.extract(transcript.rawText);
      const updated = await this.prisma.extractionJob.update({
        where: { id: job.id },
        data: { status: 'succeeded', completedAt: new Date(), resultJson: result as any },
      });
      await this.prisma.transcript.update({ where: { id: transcriptId }, data: { status: 'extracted' } });
      return { job: updated, result };
    } catch (err) {
      await this.prisma.extractionJob.update({
        where: { id: job.id },
        data: { status: 'failed', completedAt: new Date(), errorMessage: (err as any)?.message ?? String(err) },
      });
      throw err;
    }
  }

  async commit(transcriptId: string, payload: any) {
    const transcript = await this.prisma.transcript.findUnique({ where: { id: transcriptId } });
    if (!transcript) throw new NotFoundException(`Transcript ${transcriptId} not found`);

    const ownerId = payload.defaultOwnerId;
    if (!ownerId) throw new Error('defaultOwnerId is required to commit extractions');

    const created = { tasks: 0, actionItems: 0, risks: 0, decisions: 0 };

    for (const ai of payload.actionItems ?? []) {
      await this.prisma.actionItem.create({
        data: {
          title: ai.title,
          dueDate: ai.dueDate ? new Date(ai.dueDate) : null,
          status: 'open',
          source: 'ai_extracted',
          reviewed: true,
          confidence: ai.confidence >= 0.8 ? 'high' : ai.confidence >= 0.6 ? 'medium' : 'low',
          sourceTranscriptId: transcriptId,
          projectId: payload.defaultProjectId ?? null,
        },
      });
      created.actionItems++;
    }

    for (const r of payload.risks ?? []) {
      await this.prisma.risk.create({
        data: {
          title: r.title,
          description: r.description,
          severity: r.severity,
          likelihood: 0.5,
          impact: r.severity === 'critical' ? 5 : r.severity === 'high' ? 4 : 3,
          status: 'open',
          ownerId,
          projectId: payload.defaultProjectId ?? null,
          identifiedAt: new Date(),
        },
      });
      created.risks++;
    }

    for (const d of payload.decisions ?? []) {
      await this.prisma.decision.create({
        data: {
          title: d.title,
          context: '(committed from transcript)',
          decision: d.decision,
          rationale: d.rationale ?? null,
          status: 'decided',
          alternatives: [],
          decidedBy: ownerId,
          projectId: payload.defaultProjectId ?? null,
        },
      });
      created.decisions++;
    }

    await this.prisma.transcript.update({ where: { id: transcriptId }, data: { status: 'committed' } });
    return { transcriptId, created };
  }
}
