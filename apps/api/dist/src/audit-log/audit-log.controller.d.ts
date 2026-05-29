import { AuditLogService } from './audit-log.service';
export declare class AuditLogController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    findAll(objectType?: string, objectId?: string, actorId?: string, action?: string, skip?: number, take?: number): Promise<{
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
