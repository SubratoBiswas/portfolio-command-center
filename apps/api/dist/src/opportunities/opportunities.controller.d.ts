import { OpportunitiesService } from './opportunities.service';
export declare class OpportunitiesController {
    private readonly svc;
    constructor(svc: OpportunitiesService);
    findAll(query: Record<string, string>): Promise<any>;
    findStale(days?: string): Promise<({
        client: {
            id: string;
            name: string;
            industry: string;
            region: string;
            logoColor: string | null;
            status: string;
            contractType: string | null;
            msrp: import("@prisma/client/runtime/library").Decimal | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        product: {
            id: string;
            name: string;
            shortName: string;
            strategicBucket: string;
            vision: string;
            problem: string;
            targetUsers: string;
            pricingModel: string | null;
            architectureStatus: string;
            maturity: string;
            aiReadiness: number;
            deliveryReadiness: number;
            ownerId: string;
            tags: string[];
            createdAt: Date;
            updatedAt: Date;
        } | null;
        owner: {
            id: string;
            name: string;
            initials: string;
            email: string;
            role: string;
            level: string;
            active: boolean;
            weeklyCapacityHours: number;
            timeOffHours: number;
            skills: string[];
            costRate: import("@prisma/client/runtime/library").Decimal | null;
            startDate: Date | null;
            endDate: Date | null;
            managerId: string | null;
            locationId: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        name: string;
        description: string;
        clientId: string;
        productId: string | null;
        ownerId: string;
        value: import("@prisma/client/runtime/library").Decimal;
        probability: number;
        stage: string;
        source: string | null;
        strategicImportance: string;
        expectedCloseDate: Date;
        lastInteractionAt: Date;
        nextSteps: string | null;
        requiredCapabilityIds: string[];
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    pipelineSummary(): Promise<{
        stage: string;
        count: number;
        value: number;
    }[]>;
    findOne(id: string): Promise<any>;
    create(body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
