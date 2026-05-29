"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCrudService = void 0;
const common_1 = require("@nestjs/common");
/**
 * Generic Prisma CRUD wrapper. Each entity module instantiates this
 * by passing its delegate name (e.g. `prisma.resource`). Keeps per-entity
 * services to ~10 lines.
 */
class BaseCrudService {
    prisma;
    delegateName;
    defaultInclude;
    constructor(prisma, delegateName, defaultInclude) {
        this.prisma = prisma;
        this.delegateName = delegateName;
        this.defaultInclude = defaultInclude;
    }
    get delegate() {
        return this.prisma[this.delegateName];
    }
    async findAll(where, include) {
        return this.delegate.findMany({
            where,
            include: include ?? this.defaultInclude,
            orderBy: { createdAt: 'desc' },
        }).catch(() => 
        // Fallback when entity lacks createdAt
        this.delegate.findMany({ where, include: include ?? this.defaultInclude }));
    }
    async findOne(id, include) {
        const row = await this.delegate.findUnique({
            where: { id },
            include: include ?? this.defaultInclude,
        });
        if (!row)
            throw new common_1.NotFoundException(`${String(this.delegateName)} ${id} not found`);
        return row;
    }
    async create(data) {
        return this.delegate.create({ data, include: this.defaultInclude });
    }
    async update(id, data) {
        return this.delegate.update({
            where: { id },
            data,
            include: this.defaultInclude,
        });
    }
    async remove(id) {
        await this.delegate.delete({ where: { id } });
        return { id, deleted: true };
    }
    async count(where) {
        return this.delegate.count({ where });
    }
}
exports.BaseCrudService = BaseCrudService;
//# sourceMappingURL=base-crud.service.js.map