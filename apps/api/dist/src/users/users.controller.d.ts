import { UsersService } from './users.service';
export declare class UsersController {
    private readonly svc;
    constructor(svc: UsersService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        email: string;
        name: string;
        role: string;
        resourceId: string | null;
        active: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        resourceId: string | null;
        active: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(body: {
        email: string;
        password: string;
        name: string;
        role?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        resourceId: string | null;
        active: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, body: {
        name?: string;
        role?: string;
        active?: boolean;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        resourceId: string | null;
        active: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        resourceId: string | null;
        active: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
