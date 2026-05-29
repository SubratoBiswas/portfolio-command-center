import { ActionItemsService } from './action-items.service';
export declare class ActionItemsController {
    private readonly svc;
    constructor(svc: ActionItemsService);
    findAll(query: Record<string, string>): Promise<any>;
    findOne(id: string): Promise<any>;
    create(body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
