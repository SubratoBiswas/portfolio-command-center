import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { ProviderRegistry } from './extraction.providers';
import { ExtractionJobPayload } from './extraction.queue';
export declare class ExtractionProcessor {
    private readonly prisma;
    private readonly providers;
    private readonly logger;
    constructor(prisma: PrismaService, providers: ProviderRegistry);
    handleExtract(job: Job<ExtractionJobPayload>): Promise<import("./extraction.providers").ExtractionResult | undefined>;
}
