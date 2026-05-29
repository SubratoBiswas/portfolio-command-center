import { LocationsService } from './locations.service';
export declare class LocationsController {
    private readonly svc;
    constructor(svc: LocationsService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        region: string;
        type: string;
        timezone: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__LocationClient<{
        id: string;
        name: string;
        region: string;
        type: string;
        timezone: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    create(body: any): import(".prisma/client").Prisma.Prisma__LocationClient<{
        id: string;
        name: string;
        region: string;
        type: string;
        timezone: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, body: any): import(".prisma/client").Prisma.Prisma__LocationClient<{
        id: string;
        name: string;
        region: string;
        type: string;
        timezone: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
