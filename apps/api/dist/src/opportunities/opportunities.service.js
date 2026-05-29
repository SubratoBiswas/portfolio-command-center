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
exports.OpportunitiesService = void 0;
const common_1 = require("@nestjs/common");
const base_crud_service_1 = require("../common/base-crud.service");
const prisma_service_1 = require("../prisma/prisma.service");
let OpportunitiesService = class OpportunitiesService extends base_crud_service_1.BaseCrudService {
    constructor(prisma) {
        super(prisma, 'opportunity', {
            client: true,
            product: true,
            owner: true,
        });
    }
    /**
     * Opportunities that haven't been touched in `staleDays` days,
     * excluding deals already closed.
     */
    async findStale(staleDays = 10) {
        const cutoff = new Date(Date.now() - staleDays * 24 * 60 * 60 * 1000);
        return this.prisma.opportunity.findMany({
            where: {
                lastInteractionAt: { lt: cutoff },
                stage: { notIn: ['closed_won', 'closed_lost'] },
            },
            include: { client: true, product: true, owner: true },
            orderBy: { lastInteractionAt: 'asc' },
        });
    }
    async pipelineSummary() {
        const rows = await this.prisma.opportunity.groupBy({
            by: ['stage'],
            _sum: { value: true },
            _count: { _all: true },
        });
        return rows.map((r) => ({
            stage: r.stage,
            count: r._count._all,
            value: r._sum.value?.toNumber() ?? 0,
        }));
    }
};
exports.OpportunitiesService = OpportunitiesService;
exports.OpportunitiesService = OpportunitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OpportunitiesService);
//# sourceMappingURL=opportunities.service.js.map