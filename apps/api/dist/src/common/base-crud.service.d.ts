import { PrismaService } from '../prisma/prisma.service';
/**
 * Generic Prisma CRUD wrapper. Each entity module instantiates this
 * by passing its delegate name (e.g. `prisma.resource`). Keeps per-entity
 * services to ~10 lines.
 */
export declare class BaseCrudService<TWhere = any, TCreate = any, TUpdate = any, TInclude = any> {
    protected readonly prisma: PrismaService;
    protected readonly delegateName: keyof PrismaService;
    protected readonly defaultInclude?: TInclude | undefined;
    constructor(prisma: PrismaService, delegateName: keyof PrismaService, defaultInclude?: TInclude | undefined);
    protected get delegate(): any;
    findAll(where?: TWhere, include?: TInclude): Promise<any>;
    findOne(id: string, include?: TInclude): Promise<any>;
    create(data: TCreate): Promise<any>;
    update(id: string, data: TUpdate): Promise<any>;
    remove(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    count(where?: TWhere): Promise<any>;
}
