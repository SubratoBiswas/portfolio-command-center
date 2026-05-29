import { PrismaService } from '../prisma/prisma.service';
export interface CreateAuditLogDto {
    actorId?: string;
    userName?: string;
    userEmail?: string;
    ipAddress?: string;
    userAgent?: string;
    objectType: string;
    objectId: string;
    action: string;
    beforeJson?: any;
    afterJson?: any;
}
export declare class AuditLogService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateAuditLogDto): Promise<{
        id: string;
        actorId: string | null;
        objectType: string;
        objectId: string;
        action: string;
        beforeJson: import("@prisma/client/runtime/library").JsonValue | null;
        afterJson: import("@prisma/client/runtime/library").JsonValue | null;
        occurredAt: Date;
        userName: string | null;
        userEmail: string | null;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
    findAll(params: {
        objectType?: string;
        objectId?: string;
        actorId?: string;
        action?: string;
        skip?: number;
        take?: number;
    }): Promise<{
        data: {
            id: string;
            actorId: string | null;
            objectType: string;
            objectId: string;
            action: string;
            beforeJson: import("@prisma/client/runtime/library").JsonValue | null;
            afterJson: import("@prisma/client/runtime/library").JsonValue | null;
            occurredAt: Date;
            userName: string | null;
            userEmail: string | null;
            ipAddress: string | null;
            userAgent: string | null;
        }[];
        total: number;
        skip: number;
        take: number;
    }>;
}
