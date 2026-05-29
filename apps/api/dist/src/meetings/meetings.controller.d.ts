import { MeetingsService } from './meetings.service';
export declare class MeetingsController {
    private readonly svc;
    constructor(svc: MeetingsService);
    findAll(query: Record<string, string>): Promise<any>;
    findOne(id: string): Promise<any>;
    create(body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
