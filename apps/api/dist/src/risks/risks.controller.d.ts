import { RisksService } from './risks.service';
export declare class RisksController {
    private readonly svc;
    constructor(svc: RisksService);
    findAll(query: Record<string, string>): Promise<any>;
    heatmap(): Promise<{
        id: string;
        status: string;
        title: string;
        severity: string;
        likelihood: number;
        impact: number;
    }[]>;
    findOne(id: string): Promise<any>;
    create(body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
