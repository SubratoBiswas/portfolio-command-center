import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async portfolioHealth() {
    const [
      productCount,
      activeProjectCount,
      openOppCount,
      pipelineValue,
      ragBreakdown,
      riskCount,
      criticalRiskCount,
      staleOpps,
    ] = await Promise.all([
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
      pipelineValue: pipelineValue._sum.value ?? 0,
      ragBreakdown: ragBreakdown.reduce((acc, r) => {
        acc[r.rag] = r._count._all;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async utilization() {
    const now = new Date();
    const resources = await this.prisma.resource.findMany({
      where: { active: true },
      include: {
        allocations: { where: { startDate: { lte: now }, endDate: { gte: now } } },
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
}
