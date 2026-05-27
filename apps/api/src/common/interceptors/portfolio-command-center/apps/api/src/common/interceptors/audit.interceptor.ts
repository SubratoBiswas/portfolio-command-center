import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditLogService } from '../../audit-log/audit-log.service';

// HTTP methods that mutate state — these are the ones we audit
const AUDIT_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

// Derive a human-readable action from HTTP method
function methodToAction(method: string): string {
  switch (method.toUpperCase()) {
    case 'POST':   return 'created';
    case 'PATCH':
    case 'PUT':    return 'updated';
    case 'DELETE': return 'deleted';
    default:       return method.toLowerCase();
  }
}

// Segments to skip when extracting entity type — handles /api/v1/products → 'products'
const PATH_PREFIXES = /^(api|v\d+)$/i;

// Extract the object type from a URL path, skipping common prefixes like /api/v1/
// e.g. /api/v1/products/abc → 'products'
function pathToObjectType(path: string): string {
  const clean = path.replace(/^\//, '').split('?')[0];
  const parts = clean.split('/').filter(p => p && !PATH_PREFIXES.test(p));
  return parts[0] ?? 'unknown';
}

// Extract the object ID from the URL, skipping prefix segments
// e.g. /api/v1/products/abc123 → 'abc123'
function pathToObjectId(path: string): string {
  const clean = path.replace(/^\//, '').split('?')[0];
  const parts = clean.split('/').filter(p => p && !PATH_PREFIXES.test(p));
  return parts[1] ?? 'n/a';
}

// Try to get the real client IP, respecting common proxy headers
function extractIp(req: any): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (forwarded) {
    return (typeof forwarded === 'string' ? forwarded : forwarded[0])
      .split(',')[0]
      .trim();
  }
  return req.ip ?? req.connection?.remoteAddress ?? 'unknown';
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method: string = req.method ?? '';

    // Only audit mutating requests
    if (!AUDIT_METHODS.has(method.toUpperCase())) {
      return next.handle();
    }

    // Skip audit-log routes themselves to avoid infinite loops
    const path: string = req.route?.path ?? req.url ?? '';
    if (path.includes('audit-log')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((responseBody: any) => {
        try {
          const user = req.user; // set by JwtAuthGuard
          const objectType = pathToObjectType(req.url ?? '');
          // For POST, the new record id comes from the response body
          const objectId =
            responseBody?.id ??
            pathToObjectId(req.url ?? '');

          this.auditLogService.create({
            actorId:    user?.sub ?? user?.id ?? undefined,
            userName:   user?.name ?? user?.username ?? undefined,
            userEmail:  user?.email ?? undefined,
            ipAddress:  extractIp(req),
            userAgent:  req.headers?.['user-agent'] ?? undefined,
            objectType,
            objectId:   String(objectId),
            action:     methodToAction(method),
            afterJson:  method.toUpperCase() !== 'DELETE' ? responseBody : u