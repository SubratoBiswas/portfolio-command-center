"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptsModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const transcripts_controller_1 = require("./transcripts.controller");
const transcripts_service_1 = require("./transcripts.service");
const extraction_processor_1 = require("./extraction.processor");
const extraction_providers_1 = require("./extraction.providers");
const extraction_queue_1 = require("./extraction.queue");
const prisma_module_1 = require("../prisma/prisma.module");
let TranscriptsModule = class TranscriptsModule {
};
exports.TranscriptsModule = TranscriptsModule;
exports.TranscriptsModule = TranscriptsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            bull_1.BullModule.registerQueue({ name: extraction_queue_1.EXTRACTION_QUEUE }),
        ],
        controllers: [transcripts_controller_1.TranscriptsController],
        providers: [
            transcripts_service_1.TranscriptsService,
            extraction_processor_1.ExtractionProcessor,
            extraction_providers_1.MockProvider,
            extraction_providers_1.AnthropicProvider,
            extraction_providers_1.ProviderRegistry,
        ],
        exports: [transcripts_service_1.TranscriptsService],
    })
], TranscriptsModule);
//# sourceMappingURL=transcripts.module.js.map