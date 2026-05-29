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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptsController = void 0;
const common_1 = require("@nestjs/common");
const transcripts_service_1 = require("./transcripts.service");
let TranscriptsController = class TranscriptsController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    findAll(query) {
        const where = Object.keys(query).length ? query : undefined;
        return this.svc.findAll(where);
    }
    findOne(id) {
        return this.svc.findOne(id);
    }
    create(body) {
        return this.svc.create(body);
    }
    update(id, body) {
        return this.svc.update(id, body);
    }
    remove(id) {
        return this.svc.remove(id);
    }
    /**
     * Enqueue an async extraction job. Returns immediately with jobId.
     * Poll /:id/job-status to check progress and retrieve results.
     */
    extract(id, body) {
        if (body?.sync) {
            // Synchronous path — useful for tests or small transcripts
            return this.svc.extractSync(id, body.provider);
        }
        return this.svc.enqueueExtraction(id, body?.provider);
    }
    /**
     * Poll extraction job status and retrieve the result when complete.
     */
    jobStatus(id) {
        return this.svc.getExtractionStatus(id);
    }
    /**
     * Commit reviewed extraction into canonical tables.
     */
    commit(id, body) {
        return this.svc.commit(id, body);
    }
};
exports.TranscriptsController = TranscriptsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TranscriptsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TranscriptsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TranscriptsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TranscriptsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TranscriptsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/extract'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TranscriptsController.prototype, "extract", null);
__decorate([
    (0, common_1.Get)(':id/job-status'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TranscriptsController.prototype, "jobStatus", null);
__decorate([
    (0, common_1.Post)(':id/commit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TranscriptsController.prototype, "commit", null);
exports.TranscriptsController = TranscriptsController = __decorate([
    (0, common_1.Controller)('transcripts'),
    __metadata("design:paramtypes", [transcripts_service_1.TranscriptsService])
], TranscriptsController);
//# sourceMappingURL=transcripts.controller.js.map