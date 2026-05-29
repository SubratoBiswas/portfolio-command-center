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
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const audit_log_service_1 = require("../../audit-log/audit-log.service");
// HTTP methods that mutate state — these are the ones we audit
const AUDIT_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);
// Segments to skip when extracting entity type — handles /api/v1/products → 'products'
// Derive a human-readable action from HTTP method
function methodToAction(method) {
    switch (method.toUpperCase()) {
        case 'POST': return 'created';
        case 'PATCH':
        case 'PUT': return 'updated';
        case 'DELETE': return 'deleted';
        default: return method.toLowerCase();
    }
}
const PATH_PREFIXES = /^(api|v\d+)$/i;
// Extract the object type from a URL path, skipping common prefixes like /api/v1/
function pathToObjectType(path) {
    const clean = path.replace(/^\//, '').split('?')[0];
    const parts = clean.split('/').filter(p => p && !PATH_PREFIXES.test(p));
    return parts[0] ?? 'unknown';
}
// Extract the object ID from the URL, skipping prefix segments
function pathToObjectId(path) {
    const clean = path.replace(/^\//, '').split('?')[0];
    const parts = clean.split('/').filter(p => p && !PATH_PREFIXES.test(p));
    return parts[1] ?? 'n/a';
}
// Try to get the real client IP, respecting common proxy headers
function extractIp(req) {
    const forwarded = req.headers?.['x-forwarded-for'];
    if (forwarded) {
        return (typeof forwarded === 'string' ? forwarded : forwarded[0])
            .split(',')[0]
            .trim();
    }
    return req.ip ?? req.connection?.remoteAddress ?? 'unknown';
}
let AuditInterceptor = class AuditInterceptor {
    auditLogService;
    constructor(auditLogService) {
        this.auditLogService = auditLogService;
    }
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const method = req.method ?? '';
        // Only audit mutating requests
        if (!AUDIT_METHODS.has(method.toUpperCase())) {
            return next.handle();
        }
        // Skip audit-log routes themselves to avoid infinite loops
        const path = req.route?.path ?? req.url ?? '';
        if (path.includes('audit-log')) {
            return next.handle();
        }
        return next.handle().pipe((0, rxjs_1.tap)((responseBody) => {
            try {
                const user = req.user; // set by JwtAuthGuard
                const objectType = pathToObjectType(req.url ?? '');
                // For POST, the new record id comes from the response body
                const objectId = responseBody?.id ??
                    pathToObjectId(req.url ?? '');
                this.auditLogService.create({
                    actorId: user?.sub ?? user?.id ?? undefined,
                    userName: user?.name ?? user?.username ?? undefined,
                    userEmail: user?.email ?? undefined,
                    ipAddress: extractIp(req),
                    userAgent: req.headers?.['user-agent'] ?? undefined,
                    objectType,
                    objectId: String(objectId),
                    action: methodToAction(method),
                    afterJson: method.toUpperCase() !== 'DELETE' ? responseBody : undefined,
                }).catch(() => {
                    // Silently swallow audit errors — never break the main request
                });
            }
            catch {
                // Silently swallow
            }
        }));
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_log_service_1.AuditLogService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map