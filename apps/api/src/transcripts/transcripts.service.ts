import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProviderRegistry, ExtractionResult } from './extraction.providers';
import { EXTRACTION_QUEUE, ExtractionJobPayload } from './extraction.queue';

@Injectable()
export class TranscriptsService extends BaseCrudService<any, any, any, any> {
  private readonly logger = new Logger(TranscriptsService.name);

  constructor(
    prisma: PrismaService,
    private readonly providers: ProviderRegistry,
    @InjectQueue(EXTRACTION_QUEUE) private readonly extractionQueue: Queue<ExtractionJobPayload>,
  ) {
    super(prisma, 'transcript', { extractionJob: true, meeting: true });
  }

  async enqueueExtraction(transcriptId: string, provider?: string) {
    const transcript = await this.prisma.transcript.findUnique({ where: { id: transcriptId } });
    if (!transcript) throw new NotFoundException(`Transcript ${transcriptId} not found`);
    const job = await this.extractionQueue.add('extract', { transcriptId, provider }, {
      attempts: 3, backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: false, removeOnFail: false,
    });
    await this.prisma.transcript.update({ where: { id: transcriptId }, data: { status: 'processing' } });
    return { jobId: job.id, status: 'queued' };
  }

  async getExtractionStatus(transcriptId: string) {
    const dbJob = await this.prisma.extractionJob.findUnique({ where: { transcriptId } });
    if (!dbJob) return { status: 'not_started' };
    return {
      status: dbJob.status,
      result: dbJob.status === 'succeeded' ? (dbJob.resultJson as unknown as ExtractionResult) : undefined,
      error: dbJob.errorMessage ?? undefined,
    };
  }

  async extractSync(transcriptId: string, providerName?: string) {
    const transcript = await this.prisma.transcript.findUnique({ where: { id: transcriptId } });
    if (!transcript) throw new NotFoundException(`Transcript ${transcriptId} not found`);
    const provider = this.providers.pick(providerName);
    const job = await this.prisma.extractionJob.upsert({
      where: { transcriptId },
      create: { transcriptId, provider: provider.name, status: 'running', startedAt: new Date() },
      update: { provider: provider.name, status: 'running', startedAt: new Date(), completedAt: null, errorMessage: null, resultJson: null },
    });
    try {
      const result = await provider.extract(transcript.rawText);
      const updated = await this.prisma.extractionJob.update({
        where: { id: job.id },
        data: { status: 'succeeded', completedAt: new Date(), resultJson: result as any },
      });
      await this.prisma.transcript.update({ where: { id: transcriptId }, data: { status: 'extracted' } });
      return { job: updated, result };
    } catch (err: any) {
      await this.prisma.extractionJob.update({
        where: { id: job.id },
        data: { status: 'failed', completedAt: new Date(), errorMessage: err?.message ?? String(err) },
      });
      throw err;
    }
  }

  /**
   * Commit reviewed extractions into canonical tables:
   * action items, risks, decisions, opportunities, products, projects.
   */
  async commit(
    transcriptId: string,
    payload: Partial<ExtractionResult> & {
      defaultOwnerId?: string;
      defaultProjectId?: string;
      defaultClientId?: string;
    },
  ) {
    const transcript = await this.prisma.transcript.findUnique({ where: { id: transcriptId } });
    if (!transcript) throw new NotFoundException(`Transcript ${transcriptId} not found`);

    const ownerId = payload.defaultOwnerId;
    if (!ownerId) throw new Error('defaultOwnerId is required to commit extractions');

    // Resolve clientId: use provided, else first client in DB
    let clientId = payload.defaultClientId ?? null;
    if (!clientId) {
      const firstClient = await this.prisma.client.findFirst();
      clientId = firstClient?.id ?? null;
    }

    const created: Record<string, number> = {
      actionItems: 0, risks: 0, decisions: 0,
      opportunitiesCreated: 0, opportunitiesUpdated: 0,
      productsCreated: 0, projectsCreated: 0,
    };

    // ── Action Items ──────────────────────────────────────────────────────────
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
        } as any,
      });
      created.actionItems++;
    }

    // ── Risks ─────────────────────────────────────────────────────────────────
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
        } as any,
      });
      created.risks++;
    }

    // ── Decisions ─────────────────────────────────────────────────────────────
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
        } as any,
      });
      created.decisions++;
    }

    // ── Opportunities ─────────────────────────────────────────────────────────
    for (const opp of payload.opportunities ?? []) {
      if (!clientId) continue;
      const existing = await this.prisma.opportunity.findFirst({
        where: { name: { equals: opp.name, mode: 'insensitive' } },
      });
      if (existing) {
        await this.prisma.opportunity.update({
          where: { id: existing.id },
          data: {
            ...(opp.value ? { value: opp.value } : {}),
            lastInteractionAt: new Date(),
            nextSteps: `Updated from transcript on ${new Date().toLocaleDateString()}`,
          } as any,
        });
        created.opportunitiesUpdated++;
      } else {
        await this.prisma.opportunity.create({
          data: {
            name: opp.name,
            description: opp.client
              ? `Client: ${opp.client}. Extracted from meeting transcript.`
              : 'Extracted from meeting transcript.',
            clientId,
            ownerId,
            value: opp.value ?? 0,
            probability: 30,
            stage: 'qualify',
            strategicImportance: 'medium',
            expectedCloseDate: new Date(Date.now() + 90 * 86_400_000),
            lastInteractionAt: new Date(),
            nextSteps: 'Qualify and schedule discovery call.',
            requiredCapabilityIds: [],
          } as any,
        });
        created.opportunitiesCreated++;
      }
    }

    // ── Product Ideas ─────────────────────────────────────────────────────────
    for (const idea of payload.productIdeas ?? []) {
      const existing = await this.prisma.product.findFirst({
        where: { name: { equals: idea.name, mode: 'insensitive' } },
      });
      if (existing) continue;
      const shortName = idea.name.split(/\s+/).map((w: string) => w[0]?.toUpperCase() ?? '').join('').slice(0, 6) || 'NEW';
      await this.prisma.product.create({
        data: {
          name: idea.name,
          shortName,
          strategicBucket: 'GenAI',
          vision: idea.description || idea.name,
          problem: idea.description || 'To be defined.',
          targetUsers: 'TBD',
          architectureStatus: 'draft',
          maturity: 'concept',
          aiReadiness: 10,
          deliveryReadiness: 10,
          ownerId,
        } as any,
      });
      created.productsCreated++;
    }

    // ── Projects (high-confidence action items that indicate a new project) ───
    const projectTrigger = /\b(kick.?off|launch|initiat|start|new project|begin project|spin up)\b/i;
    for (const ai of payload.actionItems ?? []) {
      if (!clientId || ai.confidence < 0.8 || !projectTrigger.test(ai.title)) continue;
      const code = `TX-${Date.now().toString(36).toUpperCase().slice(-5)}`;
      await this.prisma.project.create({
        data: {
          name: ai.title.slice(0, 80),
          code,
          type: 'delivery',
          charter: 'Initiated from meeting transcript.',
          scope: ai.title,
          status: 'not_started',
          rag: 'green',
          startDate: new Date(),
          endDate: new Date(Date.now() + 90 * 86_400_000),
          clientId,
          ownerId,
          resourceIds: [],
        } as any,
      });
      created.projectsCreated++;
    }

    await this.prisma.transcript.update({ where: { id: transcriptId }, data: { status: 'committed' } });
    return { transcriptId, created };
  }
}
