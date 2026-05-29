import { Prisma } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class OpportunitiesService extends BaseCrudService<Prisma.OpportunityWhereInput, Prisma.OpportunityCreateInput, Prisma.OpportunityUpdateInput, any> {
    constructor(prisma: PrismaService);
    /**
     * Opportunities that haven't been touched in `staleDays` days,
     * excluding deals already closed.
     */
    findStale(staleDays?: number): Promise<({
        client: {
            id: string;
            name: string;
            industry: string;
            region: string;
            logoColor: string | null;
            status: string;
            contractType: string | null;
            msrp: Prisma.Decimal | null;
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
            costRate: Prisma.Decimal | null;
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
        value: Prisma.Decimal;
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
}
