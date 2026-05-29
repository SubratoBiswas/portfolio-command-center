import { TranscriptsService } from './transcripts.service';
import type { ExtractionResult } from './extraction.providers';
export declare class TranscriptsController {
    private readonly svc;
    constructor(svc: TranscriptsService);
    findAll(query: Record<string, string>): Promise<any>;
    findOne(id: string): Promise<any>;
    create(body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    /**
     * Enqueue an async extraction job. Returns immediately with jobId.
     * Poll /:id/job-status to check progress and retrieve results.
     */
    extract(id: string, body: {
        provider?: string;
        sync?: boolean;
    }): Promise<{
        jobId: string | number;
        status: string;
    }> | Promise<{
        job: any;
        result: ExtractionResult;
    }>;
    /**
     * Poll extraction job status and retrieve the result when complete.
     */
    jobStatus(id: string): Promise<{
        status: string;
        progress?: number;
        result?: ExtractionResult;
        error?: string;
    }>;
    /**
     * Commit reviewed extraction into canonical tables.
     */
    commit(id: string, body: Partial<ExtractionResult> & {
        defaultOwnerId: string;
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
