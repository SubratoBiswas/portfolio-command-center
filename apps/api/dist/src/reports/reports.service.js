"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Portfolio health: counts + ARR roll-ups + RAG breakdown.
     * Powers the Command Center hero cards.
     */
    async portfolioHealth() {
        const [productCount, activeProjectCount, openOppCount, pipelineValue, ragBreakdown, riskCount, criticalRiskCount, staleOpps,] = await Promise.all([
            this.prisma.product.count(),
            this.prisma.project.count({ where: { status: { notIn: ['done', 'cancelled'] } } }),
            this.prisma.opportunity.count({ where: { stage: { notIn: ['closed_won', 'closed_lost'] } } }),
            this.prisma.opportunity.aggregate({
                where: { stage: { notIn: ['closed_won', 'closed_lost'] } },
                _sum: { value: true },
            }),
            this.prisma.project.groupBy({ by: ['rag'], _count: { _all: true } }),
            this.prisma.risk.count({ where: { status: { notIn: ['closed'] } } }),
            this.prisma.risk.count({ where: { severity: 'critical', status: { notIn: ['closed'] } } }),
            this.prisma.opportunity.count({
                where: {
                    lastInteractionAt: { lt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
                    stage: { notIn: ['closed_won', 'closed_lost'] },
                },
            }),
        ]);
        return {
            counts: {
                products: productCount,
                activeProjects: activeProjectCount,
                openOpportunities: openOppCount,
                risks: riskCount,
                criticalRisks: criticalRiskCount,
                staleDeals: staleOpps,
            },
            pipelineValue: pipelineValue._sum.value?.toNumber() ?? 0,
            ragBreakdown: ragBreakdown.reduce((acc, r) => {
                acc[r.rag] = r._count._all;
                return acc;
            }, {}),
        };
    }
    /**
     * Resource utilization: for each resource, sum hoursPerWeek across all
     * active allocations and compare to weeklyCapacityHours. Returns a list
     * with RAG colour for the heatmap.
     */
    async utilization() {
        const now = new Date();
        const resources = await this.prisma.resource.findMany({
            where: { active: true },
            include: {
                allocations: {
                    where: { startDate: { lte: now }, endDate: { gte: now } },
                },
                location: true,
            },
        });
        return resources.map((r) => {
            const allocated = r.allocations.reduce((sum, a) => sum + a.hoursPerWeek, 0);
            const capacity = r.weeklyCapacityHours - (r.timeOffHours ?? 0);
            const pct = capacity > 0 ? (allocated / capacity) * 100 : 0;
            const rag = pct > 100 ? 'red' : pct > 90 ? 'orange' : pct > 75 ? 'yellow' : 'green';
            return {
                resourceId: r.id,
                name: r.name,
                initials: r.initials,
                role: r.role,
                location: r.location?.name,
                capacityHours: capacity,
                allocatedHours: allocated,
                utilizationPct: Math.round(pct),
                allocationCount: r.allocations.length,
                rag,
            };
        });
    }
    /**
     * Top attention items for the Command Center: items needing exec eyeballs.
     */
    async attention() {
        const [redProjects, criticalRisks, staleOpps, blockedTasks] = await Promise.all([
            this.prisma.project.findMany({
                where: { rag: 'red', status: { notIn: ['done', 'cancelled'] } },
                include: { client: true, owner: true },
                take: 10,
            }),
            this.prisma.risk.findMany({
                where: { severity: 'critical', status: { notIn: ['closed'] } },
                include: { owner: true, product: true, project: true },
                take: 10,
            }),
            this.prisma.opportunity.findMany({
                where: {
                    lastInteractionAt: { lt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
                    stage: { notIn: ['closed_won', 'closed_lost'] },
                },
                include: { client: true, owner: true },
                orderBy: { lastInteractionAt: 'asc' },
                take: 10,
            }),
            this.prisma.task.findMany({
                where: { status: 'blocked' },
                include: { assignee: true, project: true },
                take: 10,
            }),
        ]);
        return { redProjects, criticalRisks, staleOpps, blockedTasks };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map