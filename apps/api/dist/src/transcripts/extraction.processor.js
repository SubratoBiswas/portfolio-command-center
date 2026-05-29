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
var ExtractionProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractionProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const extraction_providers_1 = require("./extraction.providers");
const extraction_queue_1 = require("./extraction.queue");
let ExtractionProcessor = ExtractionProcessor_1 = class ExtractionProcessor {
    prisma;
    providers;
    logger = new common_1.Logger(ExtractionProcessor_1.name);
    constructor(prisma, providers) {
        this.prisma = prisma;
        this.providers = providers;
    }
    async handleExtract(job) {
        const { transcriptId, provider: providerName } = job.data;
        this.logger.log(`Processing extraction job ${job.id} for transcript ${transcriptId}`);
        const transcript = await this.prisma.transcript.findUnique({ where: { id: transcriptId } });
        if (!transcript) {
            this.logger.error(`Transcript ${transcriptId} not found — skipping`);
            return;
        }
        const provider = this.providers.pick(providerName);
        // Mark the job row as running
        await this.prisma.extractionJob.upsert({
            where: { transcriptId },
            create: {
                transcriptId,
                provider: provider.name,
                status: 'running',
                startedAt: new Date(),
            },
            update: {
                provider: provider.name,
                status: 'running',
                startedAt: new Date(),
                completedAt: null,
                errorMessage: null,
                resultJson: client_1.Prisma.JsonNull,
            },
        });
        await this.prisma.transcript.update({
            where: { id: transcriptId },
            data: { status: 'processing' },
        });
        try {
            await job.progress(10);
            const result = await provider.extract(transcript.rawText);
            await job.progress(90);
            await this.prisma.extractionJob.update({
                where: { transcriptId },
                data: {
                    status: 'succeeded',
                    completedAt: new Date(),
                    resultJson: result,
                },
            });
            await this.prisma.transcript.update({
                where: { id: transcriptId },
                data: { status: 'extracted' },
            });
            await job.progress(100);
            this.logger.log(`Extraction job ${job.id} succeeded for transcript ${transcriptId}`);
            return result;
        }
        catch (err) {
            this.logger.error(`Extraction job ${job.id} failed: ${err?.message}`);
            await this.prisma.extractionJob.update({
                where: { transcriptId },
                data: {
                    status: 'failed',
                    completedAt: new Date(),
                    errorMessage: err?.message ?? String(err),
                },
            });
            await this.prisma.transcript.update({
                where: { id: transcriptId },
                data: { status: 'uploaded' }, // reset so user can retry
            });
            throw err;
        }
    }
};
exports.ExtractionProcessor = ExtractionProcessor;
__decorate([
    (0, bull_1.Process)('extract'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExtractionProcessor.prototype, "handleExtract", null);
exports.ExtractionProcessor = ExtractionProcessor = ExtractionProcessor_1 = __decorate([
    (0, bull_1.Processor)(extraction_queue_1.EXTRACTION_QUEUE),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        extraction_providers_1.ProviderRegistry])
], ExtractionProcessor);
//# sourceMappingURL=extraction.processor.js.map