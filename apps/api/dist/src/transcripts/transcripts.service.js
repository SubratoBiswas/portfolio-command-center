"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TranscriptsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptsService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const client_1 = require("@prisma/client");
const base_crud_service_1 = require("../common/base-crud.service");
const prisma_service_1 = require("../prisma/prisma.service");
const extraction_providers_1 = require("./extraction.providers");
const extraction_queue_1 = require("./extraction.queue");
let TranscriptsService = TranscriptsService_1 = class TranscriptsService extends base_crud_service_1.BaseCrudService {
    providers;
    extractionQueue;
    logger = new common_1.Logger(TranscriptsService_1.name);
    constructor(prisma, providers, extractionQueue) {
        super(prisma, 'transcript', { extractionJob: true, meeting: true });
        this.providers = providers;
        this.extractionQueue = extractionQueue;
    }
    /**
     * Enqueue an async extraction job. Returns immediately with the job id.
     * Poll GET /transcripts/:id/job-status to check progress.
     */
    async enqueueExtraction(transcriptId, provider) {
        const transcript = await this.prisma.transcript.findUnique({ where: { id: transcriptId } });
        if (!transcript)
            throw new common_1.NotFoundException(`Transcript ${transcriptId} not found`);
        const job = await this.extractionQueue.add('extract', { transcriptId, provider }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: false,
            removeOnFail: false,
        });
        this.logger.log(`Enqueued extraction job ${job.id} for transcript ${transcriptId}`);
        await this.prisma.transcript.update({
            where: { id: transcriptId },
            data: { status: 'processing' },
        });
        return { jobId: job.id, status: 'queued' };
    }
    /**
     * Poll the status of an extraction job for a given transcript.
     * Returns the result if the job has completed.
     */
    async getExtractionStatus(transcriptId) {
        const dbJob = await this.prisma.extractionJob.findUnique({ where: { transcriptId } });
        if (!dbJob)
            return { status: 'not_started' };
        return {
            status: dbJob.status,
            result: dbJob.status === 'succeeded' ? dbJob.resultJson : undefined,
            error: dbJob.errorMessage ?? undefined,
        };
    }
    /**
     * Synchronous extraction (kept for backward-compat / direct provider override).
     * Prefer enqueueExtraction for production use.
     */
    async extractSync(transcriptId, providerName) {
        const transcript = await this.prisma.transcript.findUnique({ where: { id: transcriptId } });
        if (!transcript)
            throw new common_1.NotFoundException(`Transcript ${transcriptId} not found`);
        const provider = this.providers.pick(providerName);
        this.logger.log(`Sync extraction ${transcriptId} with provider=${provider.name}`);
        const job = await this.prisma.extractionJob.upsert({
            where: { transcriptId },
            create: { transcriptId, provider: provider.name, status: 'running', startedAt: new Date() },
            update: { provider: provider.name, status: 'running', startedAt: new Date(), completedAt: null, errorMessage: null, resultJson: client_1.Prisma.JsonNull },
        });
        try {
            const result = await provider.extract(transcript.rawText);
            const updated = await this.prisma.extractionJob.update({
                where: { id: job.id },
                data: { status: 'succeeded', completedAt: new Date(), resultJson: result },
            });
            await this.prisma.transcript.update({ where: { id: transcriptId }, data: { status: 'extracted' } });
            return { job: updated, result };
        }
        catch (err) {
            await this.prisma.extractionJob.update({
                where: { id: job.id },
                data: { status: 'failed', completedAt: new Date(), errorMessage: err?.message ?? String(err) },
            });
            throw err;
        }
    }
    /**
     * Commit reviewed extractions back into canonical tables.
     */
    async commit(transcriptId, payload) {
        const transcript = await this.prisma.transcript.findUnique({ where: { id: transcriptId } });
        if (!transcript)
            throw new common_1.NotFoundException(`Transcript ${transcriptId} not found`);
        const ownerId = payload.defaultOwnerId;
        if (!ownerId)
            throw new Error('defaultOwnerId is required to commit extractions');
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
};
exports.TranscriptsService = TranscriptsService;
exports.TranscriptsService = TranscriptsService = TranscriptsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bull_1.InjectQueue)(extraction_queue_1.EXTRACTION_QUEUE)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        extraction_providers_1.ProviderRegistry, Object])
], TranscriptsService);
//# sourceMappingURL=transcripts.service.js.map