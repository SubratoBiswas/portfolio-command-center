import { AllocationsService } from './allocations.service';
export declare class AllocationsController {
    private readonly svc;
    constructor(svc: AllocationsService);
    findAll(query: Record<string, string>): Promise<any>;
    findOne(id: string): Promise<any>;
    create(body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
