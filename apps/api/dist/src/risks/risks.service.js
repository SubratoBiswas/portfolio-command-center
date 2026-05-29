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
exports.RisksService = void 0;
const common_1 = require("@nestjs/common");
const base_crud_service_1 = require("../common/base-crud.service");
const prisma_service_1 = require("../prisma/prisma.service");
let RisksService = class RisksService extends base_crud_service_1.BaseCrudService {
    constructor(prisma) {
        super(prisma, 'risk', {
            owner: true,
            product: true,
            project: true,
        });
    }
    async heatmap() {
        const rows = await this.prisma.risk.findMany({
            select: { id: true, title: true, severity: true, likelihood: true, impact: true, status: true },
        });
        return rows;
    }
};
exports.RisksService = RisksService;
exports.RisksService = RisksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RisksService);
//# sourceMappingURL=risks.service.js.map