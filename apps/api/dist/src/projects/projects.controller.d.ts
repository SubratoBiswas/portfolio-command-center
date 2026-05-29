import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private readonly svc;
    constructor(svc: ProjectsService);
    findAll(query: Record<string, string>): Promise<any>;
    findOne(id: string): Promise<any>;
    create(body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
