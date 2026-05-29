"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const bull_1 = require("@nestjs/bull");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const roles_guard_1 = require("./auth/roles.guard");
const users_module_1 = require("./users/users.module");
const resources_module_1 = require("./resources/resources.module");
const clients_module_1 = require("./clients/clients.module");
const products_module_1 = require("./products/products.module");
const opportunities_module_1 = require("./opportunities/opportunities.module");
const projects_module_1 = require("./projects/projects.module");
const tasks_module_1 = require("./tasks/tasks.module");
const risks_module_1 = require("./risks/risks.module");
const issues_module_1 = require("./issues/issues.module");
const decisions_module_1 = require("./decisions/decisions.module");
const capabilities_module_1 = require("./capabilities/capabilities.module");
const allocations_module_1 = require("./allocations/allocations.module");
const meetings_module_1 = require("./meetings/meetings.module");
const transcripts_module_1 = require("./transcripts/transcripts.module");
const action_items_module_1 = require("./action-items/action-items.module");
const reports_module_1 = require("./reports/reports.module");
const audit_log_module_1 = require("./audit-log/audit-log.module");
const locations_module_1 = require("./locations/locations.module");
const audit_interceptor_1 = require("./common/interceptors/audit.interceptor");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            bull_1.BullModule.forRootAsync({
                useFactory: () => ({
                    redis: {
                        host: process.env.REDIS_HOST ?? 'localhost',
                        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
                        password: process.env.REDIS_PASSWORD,
                    },
                }),
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            resources_module_1.ResourcesModule,
            clients_module_1.ClientsModule,
            products_module_1.ProductsModule,
            opportunities_module_1.OpportunitiesModule,
            projects_module_1.ProjectsModule,
            tasks_module_1.TasksModule,
            risks_module_1.RisksModule,
            issues_module_1.IssuesModule,
            decisions_module_1.DecisionsModule,
            capabilities_module_1.CapabilitiesModule,
            allocations_module_1.AllocationsModule,
            meetings_module_1.MeetingsModule,
            transcripts_module_1.TranscriptsModule,
            action_items_module_1.ActionItemsModule,
            reports_module_1.ReportsModule,
            audit_log_module_1.AuditLogModule,
            locations_module_1.LocationsModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
            { provide: core_1.APP_INTERCEPTOR, useClass: audit_interceptor_1.AuditInterceptor },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map