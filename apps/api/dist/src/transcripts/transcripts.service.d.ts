import { Queue } from 'bull';
import { Prisma } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProviderRegistry, ExtractionResult } from './extraction.providers';
import { ExtractionJobPayload } from './extraction.queue';
export declare class TranscriptsService extends BaseCrudService<Prisma.TranscriptWhereInput, Prisma.TranscriptCreateInput, Prisma.TranscriptUpdateInput, any> {
    private readonly providers;
    private readonly extractionQueue;
    private readonly logger;
    constructor(prisma: PrismaService, providers: ProviderRegistry, extractionQueue: Queue<ExtractionJobPayload>);
    /**
     * Enqueue an async extraction job. Returns immediately with the job id.
     * Poll GET /transcripts/:id/job-status to check progress.
     */
    enqueueExtraction(transcriptId: string, provider?: string): Promise<{
        jobId: string | number;
        status: string;
    }>;
    /**
     * Poll the status of an extraction job for a given transcript.
     * Returns the result if the job has completed.
     */
    getExtractionStatus(transcriptId: string): Promise<{
        status: string;
        progress?: number;
        result?: ExtractionResult;
        error?: string;
    }>;
    /**
     * Synchronous extraction (kept for backward-compat / direct provider override).
     * Prefer enqueueExtraction for production use.
     */
    extractSync(transcriptId: string, providerName?: string): Promise<{
        job: any;
        result: ExtractionResult;
    }>;
    /**
     * Commit reviewed extractions back into canonical tables.
     */
    commit(transcriptId: string, payload: Partial<ExtractionResult> & {
        defaultOwnerId?: string;
        defaultProjectId?: string;
        defaultClientId?: string;
    }): Promise<{
        transcriptId: string;
        created: {
            tasks: number;
            actionItems: number;
            risks: number;
            decisions: number;
        };
    }>;
}
